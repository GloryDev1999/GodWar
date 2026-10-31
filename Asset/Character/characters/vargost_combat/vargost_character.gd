class_name VargostCharacter
extends CharacterBody2D
## Vargost - Ranged Fire Mage Auto-battler Character (GodWar 3v3 Mobile)
## Chiêu Tối Thượng: Blazing Halo (1100 px/s) & Utility AI Bay Vector 2D

const Library = preload("res://scripts/animation/gif_atlas_library.gd")

# Constants
const SPEED_SLOW := 100.0
const SPEED_FAST := 400.0
const TILT_ANGLE := deg_to_rad(25.0)
const MIN_ATTACK_RANGE := 150.0
const MAX_ATTACK_RANGE := 550.0
const PROJECTILE_SPEED := 1100.0

# Node references
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var spawn_marker: Marker2D = $SpawnMarker

# State variables
var target_pos: Vector2
var is_flying: bool = true
var is_ai_enabled: bool = true
var combat_state: String = "IDLE" # IDLE, REPOSITIONING, WINDUP, RECOVERY
var rage: float = 0.0
var max_rage: float = 100.0
var auto_cooldown: float = 1.5
var altitude_cooldown: float = 15.0
var ai_decision_timer: float = 0.35
var combat_package: Dictionary = {}

func _ready() -> void:
    combat_package = Library.create_vargost_combat()
    if not combat_package.is_empty():
        sprite.sprite_frames = combat_package.frames
        sprite.centered = false
        sprite.offset = -combat_package.anchor_px
        sprite.scale = Vector2.ONE * combat_package.display_scale
        spawn_marker.position = Vector2(20.0, -20.0) * combat_package.display_scale

    target_pos = global_position
    play_anim("idle")

func _physics_process(delta: float) -> void:
    if auto_cooldown > 0.0:
        auto_cooldown -= delta
    if altitude_cooldown > 0.0:
        altitude_cooldown -= delta

    # 1. 2D Vector Kinematics
    var to_target := target_pos - global_position
    var dist := to_target.length()

    if dist > 3.0 and combat_state == "IDLE":
        var dir := to_target.normalized()
        velocity = dir * SPEED_FAST
        # Body Tilt
        if absf(dir.x) > 0.05:
            var target_rot := signf(dir.x) * TILT_ANGLE
            rotation = lerp_angle(rotation, target_rot, delta * 8.0)
        move_and_slide()
    else:
        velocity = Vector2.ZERO
        rotation = lerp_angle(rotation, 0.0, delta * 8.0)

    # 2. Autonomous Utility AI
    if is_ai_enabled and combat_state == "IDLE":
        ai_decision_timer -= delta
        if ai_decision_timer <= 0.0:
            ai_decision_timer = 0.35
            _evaluate_utility_ai()

func _evaluate_utility_ai() -> void:
    if auto_cooldown <= 0.0 and rage >= max_rage:
        cast_blazing_halo()

func cast_blazing_halo() -> void:
    if combat_state != "IDLE":
        return
    combat_state = "WINDUP"
    play_anim("blazing_halo")
    rage = 0.0

func _on_animation_finished() -> void:
    if combat_state == "WINDUP" or combat_state == "RECOVERY":
        combat_state = "IDLE"
        auto_cooldown = 3.2
        play_anim("idle")

func play_anim(anim_name: String) -> void:
    if sprite != null and sprite.sprite_frames != null and sprite.sprite_frames.has_animation(anim_name):
        sprite.play(anim_name)
