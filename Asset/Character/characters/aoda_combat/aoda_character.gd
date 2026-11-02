class_name AodaCharacter
extends CharacterBody2D
## Aoda - Ground Melee Fighter Auto-battler Character (GodWar 3v3 Mobile)
## Chiều cao chuẩn hóa: 90px. Chiêu 1: Lốc xoáy đất Tornado 85px (CD 5s).
## Tuân thủ quy chuẩn godwar-combat-character: Hỗ trợ tác chiến 2 hướng qua set_facing()

const Library = preload("res://scripts/animation/gif_atlas_library.gd")

# Constants
const PATROL_SPEED := 120.0
const CHASE_SPEED := 240.0
const MELEE_RANGE := 110.0
const TORNADO_RANGE := 420.0

# Node references
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var spawn_marker: Marker2D = $SpawnMarker

# State variables
var target_pos: Vector2
var facing_dir: float = 1.0 # 1.0 = Phải, -1.0 = Trái
var target_facing: float = 1.0
var visual_facing: float = 1.0
var is_ai_enabled: bool = true
var combat_state: String = "IDLE" # IDLE, MOVE, SKILL_1_WINDUP, SKILL_1_RECOVERY, KO

# Combat Stats
var hp: float = 100.0
var max_hp: float = 100.0
var tornado_cooldown: float = 0.0
var is_dead: bool = false
var combat_package: Dictionary = {}

func _ready() -> void:
	combat_package = Library.create_aoda_combat()
	if not combat_package.is_empty():
		sprite.sprite_frames = combat_package.frames
		sprite.centered = false
		sprite.offset = -combat_package.anchor_px
		sprite.scale = Vector2.ONE * combat_package.display_scale
		spawn_marker.position = Vector2(30.0, -25.0) * combat_package.display_scale

	target_pos = global_position
	set_facing(facing_dir, true)
	visual_facing = target_facing
	play_anim("idle")

## Lật hướng nhân vật đối xứng qua trục Pivot neo chân:
## 1.0: Nhìn sang phải; -1.0: Nhìn sang trái
func set_facing(dir: float, force_instant: bool = true) -> void:
	target_facing = -1.0 if dir < 0.0 else 1.0
	facing_dir = target_facing
	if force_instant:
		visual_facing = target_facing
		if not combat_package.is_empty() and sprite != null:
			var scale_factor: float = float(combat_package.get("display_scale", 0.333333))
			sprite.scale.x = target_facing * scale_factor
			sprite.scale.y = scale_factor
			if spawn_marker != null:
				spawn_marker.position.x = target_facing * 30.0 * scale_factor

func _physics_process(delta: float) -> void:
	if tornado_cooldown > 0.0:
		tornado_cooldown -= delta

	# Smooth horizontal turn-around interpolation
	if not combat_package.is_empty() and sprite != null:
		var scale_factor: float = float(combat_package.get("display_scale", 0.333333))
		if absf(visual_facing - target_facing) > 0.02:
			visual_facing = move_toward(visual_facing, target_facing, delta * 12.0)
			sprite.scale.x = visual_facing * scale_factor
			sprite.scale.y = scale_factor
			if spawn_marker != null:
				spawn_marker.position.x = visual_facing * 30.0 * scale_factor
		else:
			visual_facing = target_facing
			sprite.scale.x = target_facing * scale_factor
			sprite.scale.y = scale_factor
			if spawn_marker != null:
				spawn_marker.position.x = target_facing * 30.0 * scale_factor

## Tung Chiêu 1 Tornado: CD 5s, chỉ đánh địch mặt đất
func cast_tornado() -> bool:
	if is_dead or tornado_cooldown > 0.0 or combat_state.begins_with("SKILL"):
		return false
	tornado_cooldown = 5.0
	combat_state = "SKILL_1_WINDUP"
	play_anim("skill_1_tornado")
	return true

func take_damage(amount: float) -> void:
	if is_dead:
		return
	hp = maxf(0.0, hp - amount)
	if hp <= 0.0:
		die()
	else:
		_flash_hit()

func _flash_hit() -> void:
	if sprite != null:
		var tw := create_tween()
		sprite.modulate = Color(2.5, 2.5, 2.5, 1.0)
		tw.tween_property(sprite, "modulate", Color(1.0, 1.0, 1.0, 1.0), 0.16)

func die() -> void:
	is_dead = true
	combat_state = "KO"
	play_anim("ko")

func play_anim(anim_name: String) -> void:
	if sprite != null and sprite.sprite_frames != null and sprite.sprite_frames.has_animation(anim_name):
		sprite.play(anim_name)
