class_name VargostCharacter
extends CharacterBody2D
## Vargost - Ranged Fire Mage Auto-battler Character (GodWar 3v3 Mobile)
## Chiêu Tối Thượng: Blazing Halo (1100 px/s) & Utility AI Bay Vector 2D

const Library = preload("res://scripts/animation/gif_atlas_library.gd")

# Constants
const SPEED_SLOW := 100.0
const SPEED_FAST := 400.0
const SPEED_VERTICAL_MAX := 200.0 # Giới hạn tốc độ bay lên / bay xuống [100, 300] px/s
const TILT_ANGLE := deg_to_rad(25.0)
const MIN_ATTACK_RANGE := 150.0
const MAX_ATTACK_RANGE := 550.0
const PROJECTILE_SPEED := 1100.0

# Node references
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var spawn_marker: Marker2D = $SpawnMarker

# State variables
var target_pos: Vector2
var facing_dir: float = 1.0 # 1.0 = Phải (Left -> Right), -1.0 = Trái (Right -> Left)
var target_facing: float = 1.0
var visual_facing: float = 1.0
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
    set_facing(facing_dir)
    visual_facing = target_facing
    play_anim("idle")

## Lật hướng nhân vật (Facing Direction) đối xứng qua trục Pivot neo:
## 1.0: Nhìn sang phải (Đội Trái); -1.0: Nhìn sang trái (Đội Phải)
## force_instant: true khi khởi tạo/test, false khi in-game (kích hoạt xoay người 2.5D mượt mà)
func set_facing(dir: float, force_instant: bool = true) -> void:
    target_facing = -1.0 if dir < 0.0 else 1.0
    facing_dir = target_facing
    if force_instant:
        visual_facing = target_facing
        if not combat_package.is_empty() and sprite != null:
            var scale_factor: float = float(combat_package.get("display_scale", 1.0))
            sprite.scale.x = target_facing * scale_factor
            sprite.scale.y = scale_factor
            if spawn_marker != null:
                spawn_marker.position.x = target_facing * 20.0 * scale_factor

func _physics_process(delta: float) -> void:
    if auto_cooldown > 0.0:
        auto_cooldown -= delta
    if altitude_cooldown > 0.0:
        altitude_cooldown -= delta

    # Smooth 2.5D horizontal turn-around interpolation
    if not combat_package.is_empty() and sprite != null:
        var scale_factor: float = float(combat_package.get("display_scale", 1.0))
        if absf(visual_facing - target_facing) > 0.02:
            visual_facing = move_toward(visual_facing, target_facing, delta * 12.0)
            var turn_squash_y := 1.0 + (1.0 - absf(visual_facing)) * 0.10
            sprite.scale.x = visual_facing * scale_factor
            sprite.scale.y = turn_squash_y * scale_factor
            if spawn_marker != null:
                spawn_marker.position.x = visual_facing * 20.0 * scale_factor
        else:
            visual_facing = target_facing
            sprite.scale.x = target_facing * scale_factor
            sprite.scale.y = scale_factor
            if spawn_marker != null:
                spawn_marker.position.x = target_facing * 20.0 * scale_factor

    # 1. 2D Vector Kinematics with Vertical Speed Cap [100, 300] px/s
    var to_target := target_pos - global_position
    var dist := to_target.length()

    if dist > 3.0 and combat_state == "IDLE":
        var dir := to_target.normalized()
        var target_vel := dir * SPEED_FAST
        # Khóa trần tốc độ trục Y (bay lên / bay xuống) không quá SPEED_VERTICAL_MAX
        target_vel.y = clampf(target_vel.y, -SPEED_VERTICAL_MAX, SPEED_VERTICAL_MAX)
        velocity = target_vel
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
    # 0. Tự động xoay mặt theo dõi mục tiêu nếu địch ở sau lưng (Target Tracking 2.5D)
    var diff_x := target_pos.x - global_position.x
    if absf(diff_x) > 20.0 and (diff_x * facing_dir < 0.0):
        set_facing(signf(diff_x), false)

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
