extends Node2D
## GodWar 3v3 Auto-battler - Battle Arena Scene (Android Mobile & Desktop)
## Single Source of Truth: Đồng bộ 100% Logic & Hình Ảnh từ Web Test Tool (vargost-skill-test.js)
## Tuân thủ Hiến pháp AGENTS.md: Gothic Health Bars, Aoda Left Spawn & Platform Traversal,
## Tornado 3-Phase Lifecycle (Emerge -> Spin 2.0s -> Dissipate), Vargost Flight & Blazing Halo

const Library = preload("res://scripts/animation/gif_atlas_library.gd")

# Viewport 1920x1080 - Phóng tỉ lệ bản đồ 512x352 vừa khít 100% chiều ngang màn hình
const MAP_SCALE := 1920.0 / 512.0 # 3.75
const MAP_X := 0.0
const MAP_Y := (1080.0 - 352.0 * MAP_SCALE) / 2.0 # -120.0

# Tâm Bệ Đá Giữa (Platform 2) & Cứ Điểm Thánh Kiếm
const SWORD_X := 224.0 * MAP_SCALE # 840.0
const SWORD_Y := MAP_Y + 194.0 * MAP_SCALE # 607.5
const SWORD_CAPTURE_RADIUS := 140.0
const CAPTURE_TARGET := 20.0 # Chuẩn Hiến pháp GodWar: 20 giây liên tục để chiến thắng

# -------------------------------------------------------------
# CẤU HÌNH BỀ MẶT CÁC BỆ & 2 CĂN CỨ XUẤT PHÁT / HỒI SINH (Sát Mép Map)
# - Căn cứ Đội 1 (Sát mép map Trái - Zone 1):
#   + Nhân vật bay (Vargost): Xuất hiện trên không trung (X=34, Y=140 map px)
#   + Nhân vật bộ binh: Xuất hiện trên địa hình Platform 1 Top (X=24, Y=226 map px)
# - Căn cứ Đội 2 (Sát mép map Phải - Zone 3):
#   + Nhân vật bay: Xuất hiện trên không trung (X=485, Y=75 map px)
#   + Nhân vật bộ binh (Aoda): Xuất hiện trên địa hình Platform 3B (X=478, Y=130 map px)
# -------------------------------------------------------------
var PLATFORMS: Dictionary = {
	"plat_1_top": {"name": "Platform 1 Top (Căn Cứ Trái - Sát Mép)", "minX": MAP_X + 0.0 * MAP_SCALE, "maxX": MAP_X + 36.0 * MAP_SCALE, "y": MAP_Y + 226.0 * MAP_SCALE},
	"plat_1a": {"name": "Platform 1A (Sau Cây Cao)", "minX": MAP_X + 38.0 * MAP_SCALE, "maxX": MAP_X + 128.0 * MAP_SCALE, "y": MAP_Y + 260.0 * MAP_SCALE},
	"plat_1b": {"name": "Platform 1B (Bậc Thấp Trái)", "minX": MAP_X + 130.0 * MAP_SCALE, "maxX": MAP_X + 228.0 * MAP_SCALE, "y": MAP_Y + 292.0 * MAP_SCALE},
	"plat_2": {"name": "Platform 2 (Bệ Giữa - Thánh Kiếm)", "minX": MAP_X + 192.0 * MAP_SCALE, "maxX": MAP_X + 260.0 * MAP_SCALE, "y": SWORD_Y},
	"plat_3a": {"name": "Platform 3A (Vách Đá Cao)", "minX": MAP_X + 286.0 * MAP_SCALE, "maxX": MAP_X + 422.0 * MAP_SCALE, "y": MAP_Y + 100.0 * MAP_SCALE},
	"plat_3b": {"name": "Platform 3B (Căn Cứ Phải - Sát Mép)", "minX": MAP_X + 427.0 * MAP_SCALE, "maxX": MAP_X + 488.0 * MAP_SCALE, "y": MAP_Y + 130.0 * MAP_SCALE}
}

const LEFT_BASE_AIR_X: float = MAP_X + 34.0 * MAP_SCALE
const LEFT_BASE_AIR_Y: float = MAP_Y + 140.0 * MAP_SCALE
const LEFT_BASE_GROUND_PLAT: String = "plat_1_top"
const LEFT_BASE_GROUND_X: float = MAP_X + 24.0 * MAP_SCALE

const RIGHT_BASE_AIR_X: float = MAP_X + 485.0 * MAP_SCALE
const RIGHT_BASE_AIR_Y: float = MAP_Y + 75.0 * MAP_SCALE
const RIGHT_BASE_GROUND_PLAT: String = "plat_3b"
const RIGHT_BASE_GROUND_X: float = MAP_X + 478.0 * MAP_SCALE

var team_origin_direction: float = 1.0 # 1.0: Đội 1 ở Căn Cứ Trái, Đội 2 ở Căn Cứ Phải; -1.0: Đảo ngược 2 căn cứ

# Textures
var map_texture: Texture2D
var sword_sprite: AnimatedSprite2D

# UI Gothic RPG Health Bar Textures
var tex_bar_empty: Texture2D
var tex_bar_blood: Texture2D
var tex_bar_green: Texture2D
var tex_bar_glass: Texture2D

	# VFX Textures & SpriteFrames
var proj_tex: Texture2D
var explosion_tex: Texture2D
var tornado_tex: Texture2D
var vargost_atlas_tex: Texture2D
var aoda_atlases: Array[Texture2D] = []
var crapit_boss_tex: Texture2D
var crapit_orb_tex: Texture2D
var crapit_exp_tex: Texture2D
var crapit_loot_orb_tex: Texture2D
var sword_atlas_tex: Texture2D

# =============================================================
# BOSS TRUNG LẬP CRAPIT (crapit_main) TẠI TỌA ĐỘ (1164, 752) TRÊN TOOL
# - Thuộc tính: HP = 2150, chỉ xuất hiện 1 lần duy nhất trong trận (chết không hồi sinh lại)
# - Chỉ tấn công nhân vật đang đứng trong vùng chiếm Thánh Kiếm (SWORD_CAPTURE_RADIUS)
# - Hoạt ảnh: Frame 0..4 Idle, Frame 5..7 Windup, Frame 8 nhả quả cầu nước bọt từ miệng:
#   + Pin #1 (103, 229) [offset -45, -103 từ anchor 148, 332] -> trượt mượt sang tâm Box #2 [56, 232, 33, 28] (offset -75.5, -86)
#   + Bay tốc độ 500px/s, xoay tròn + giữ hoạt ảnh gốc (30x30), khóa mục tiêu (homing không trượt),
#     XUYÊN QUA địa hình số 2 (Platform 2 / Zone 2) nhưng BỊ CẢN bởi địa hình số 1 & số 3!
# - Khi chạm mục tiêu hoặc địa hình 1/3: Nổ 40x40, gây 15 sát thương + hiệu ứng Cấm Hồi Máu (Anti-Heal icon dưới thanh máu)
# - Utility AI phản xạ: Tướng bị Boss đánh sẽ quay sang đánh trả Boss đến khi Boss chết hoặc tướng đó chết & hồi sinh.
# - Khi Boss chết: Tan biến Pixel Dissolve từ dưới lên trên + bay lên cao 20px.
# =============================================================
const CRAPIT_MAX_HP: float = 2150.0
const CRAPIT_ATTACK_DAMAGE: float = 15.0
const CRAPIT_DISPLAY_SCALE: float = 0.5682 * (MAP_SCALE / 2.625)
const CRAPIT_FRAME_W: float = 282.0
const CRAPIT_FRAME_H: float = 512.0
const CRAPIT_ANCHOR_X: float = 148.0
const CRAPIT_ANCHOR_Y: float = 332.0
const CRAPIT_PIN1_OFFSET := Vector2(-45.0, -121.0)
const CRAPIT_BOX2_OFFSET := Vector2(-75.5, -104.0)
const CRAPIT_PROJ_SPEED: float = 500.0 * (MAP_SCALE / 2.625)
const CRAPIT_ORB_SIZE: float = 30.0 * (MAP_SCALE / 2.625)
const CRAPIT_EXP_SIZE: float = 40.0 * (MAP_SCALE / 2.625)

# TỌA ĐỘ BOSS CRAPIT: Nằm sát góc vuông Platform 3D (X=336, Y=286 trên Map)
var crapit_x: float = MAP_X + 336.0 * MAP_SCALE
var crapit_y: float = MAP_Y + 286.0 * MAP_SCALE
var crapit_hp: float = CRAPIT_MAX_HP
var crapit_is_dead: bool = false
var crapit_death_timer: float = 0.0
var crapit_hit_flash: float = 0.0
var crapit_facing: float = 1.0 # 1.0: Quay mặt sang Trái (về phía Thánh Kiếm)
var crapit_state: String = "IDLE" # IDLE, WINDUP, RELEASE, DEAD
var crapit_frame_index: int = 0
var crapit_frame_timer: float = 0.0
var crapit_attack_cooldown: float = 5.5
var crapit_locked_target_id: String = ""
var crapit_locked_target_ids: Array[String] = []
var crapit_damage_ghosts: Array[Dictionary] = []
var crapit_last_hit_by: String = ""

var active_crapit_projectiles: Array[Dictionary] = []
var active_crapit_explosions: Array[Dictionary] = []

# Trạng thái Cấm Hồi Máu (Anti-Heal) & Phản xạ đánh trả Boss
var vargost_anti_heal: bool = false
var aoda_anti_heal: bool = false
var vargost_retaliate_boss: bool = false
var aoda_retaliate_boss: bool = false

# Thời gian đứng bất động 1s khi xuất phát / hồi sinh
var vargost_spawn_freeze_timer: float = 1.0
var aoda_spawn_freeze_timer: float = 1.0

# Tọa độ đích hộ tống Cổ Vật về Căn Cứ (Sát mép map)
const LEFT_EXTRACTION_POS := Vector2(MAP_X + 28.0 * MAP_SCALE, MAP_Y + 226.0 * MAP_SCALE)
const RIGHT_EXTRACTION_POS := Vector2(MAP_X + 480.0 * MAP_SCALE, MAP_Y + 130.0 * MAP_SCALE)
const EXTRACTION_RADIUS: float = 80.0 * (MAP_SCALE / 2.625)

var boss_loot_drop: Dictionary = {
	"active": false,
	"x": 0.0,
	"y": 0.0,
	"shine_timer": 0.0,
	"locked_picker_id": "",
	"carrier_id": "",
	"is_free_for_all": false,
	"is_delivered": false
}

# Vargost State & Visuals
var vargost_x: float = MAP_X + 110.0 * MAP_SCALE # 412.5
var vargost_y: float = MAP_Y + 115.0 * MAP_SCALE # 311.25
var vargost_hover_timer: float = 0.0
var vargost_tilt: float = 0.0
var vargost_facing: float = 1.0
var vargost_visual_facing: float = 1.0
var vargost_hp: float = 1000.0
const VARGOST_MAX_HP: float = 1000.0
var vargost_is_dead: bool = false
var vargost_death_timer: float = 0.0
var vargost_hit_flash: float = 0.0
var vargost_state: String = "IDLE" # IDLE, HALO_WINDUP, HALO_RECOVERY
var vargost_frame_index: int = 0
var vargost_frame_timer: float = 0.0
var vargost_auto_cooldown: float = 1.5
var vargost_target_air_x: float = 400.0
var vargost_target_air_y: float = 330.0
var vargost_ai_timer: float = 0.0
var vargost_scale: float = 0.872
var halo_locked_target: Vector2 = Vector2.ZERO
var env_polygons: Array[PackedVector2Array] = []

# Aoda State & Visuals (Chuẩn 90px Melee Fighter)
var aoda_cur_platform_id: String = "plat_1a"
var aoda_x: float = 0.0
var aoda_y: float = 0.0
var aoda_facing: float = 1.0
var aoda_visual_facing: float = 1.0
var aoda_hp: float = 100.0
const AODA_MAX_HP: float = 100.0
var aoda_hit_flash: float = 0.0
var aoda_state: String = "MOVE" # MOVE, JUMP, LANDING, IDLE, SKILL_1_WINDUP, SKILL_1_RECOVERY, KO
var aoda_frame_index: int = 65
var aoda_frame_timer: float = 0.0
var aoda_is_dead: bool = false
var aoda_death_timer: float = 0.0
var aoda_scale: float = 0.333333
var aoda_patrol_speed: float = 170.0 # px/s
var aoda_tornado_cooldown: float = 0.0

# Aoda Jump State (Parabolic Arc qua các bệ)
var aoda_jump_timer: float = 0.0
var aoda_jump_duration: float = 0.48
var aoda_jump_start_x: float = 0.0
var aoda_jump_start_y: float = 0.0
var aoda_jump_target_x: float = 0.0
var aoda_jump_target_y: float = 0.0
var aoda_jump_target_platform_id: String = ""
var aoda_landing_timer: float = 0.0

# Damage Ghost Tracking
var vargost_damage_ghosts: Array[Dictionary] = []
var aoda_damage_ghosts: Array[Dictionary] = []

# Projectiles & VFX
var active_projectiles: Array[Dictionary] = []
var active_explosions: Array[Dictionary] = []
var active_tornadoes: Array[Dictionary] = []
var active_damage_texts: Array[Dictionary] = []
var active_hit_impacts: Array[Dictionary] = []

# Motion Ghosts & Teleport & Embers (Chuẩn 100% Single Source of Truth Web Tool)
var motion_ghosts: Array[Dictionary] = []
var ghost_spawn_timer: float = 0.0
var is_vargost_teleporting: bool = false
var teleport_step: int = 0
var teleport_timer: float = 0.0
var teleport_target_x: float = 0.0
var teleport_target_y: float = 0.0
var teleport_target_facing: float = 1.0
var vargost_dissolve_factor: float = 0.0
var vargost_is_glitch_flash: bool = false
var vargost_alpha: float = 1.0
var ember_particles: Array[Dictionary] = []

# Character Views & Shader Materials for 100% Crisp Hit Flash (Single Source of Truth)
class CharacterView extends Node2D:
	var draw_cb: Callable
	func _draw() -> void:
		if draw_cb.is_valid():
			draw_cb.call(self)

var vargost_view: CharacterView
var aoda_view: CharacterView
var crapit_view: CharacterView
var ui_view: CharacterView
var vargost_mat: ShaderMaterial
var aoda_mat: ShaderMaterial
var crapit_mat: ShaderMaterial
var aoda_manifest_frames: Array = []
var vargost_teleport_escape_timer: float = 0.0
const SPEED_SLOW: float = 100.0

# Trạng thái cứ điểm Thánh Kiếm
var capture_team: int = 0
var capture_timer: float = 0.0
var is_contested: bool = false
var match_winner: int = 0
var match_restart_timer: float = 0.0

# HUD Top Center
var hud_layer: CanvasLayer
var ui_title: Label
var ui_status: Label
var ui_bar: ProgressBar
var ui_toast: Label
var toast_timer: float = 0.0

func _ready() -> void:
	# KHÓA CHUẨN XÁC 60 FPS THEO HIẾN PHÁP GODWAR
	Engine.max_fps = 60
	Engine.physics_ticks_per_second = 60
	DisplayServer.screen_set_orientation(DisplayServer.SCREEN_SENSOR_LANDSCAPE)
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST

	_load_all_textures()
	_init_env_polygons()
	_init_positions()
	_init_render_layers()
	setup_holy_sword()
	setup_top_hud()

func _init_render_layers() -> void:
	var flash_shader := Shader.new()
	flash_shader.code = """shader_type canvas_item;
uniform float hit_flash : hint_range(0.0, 1.0) = 0.0;
uniform vec4 flash_color : source_color = vec4(1.0, 1.0, 1.0, 1.0);
void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	if (hit_flash > 0.0) {
		COLOR = vec4(mix(tex.rgb, flash_color.rgb, hit_flash), tex.a * COLOR.a);
	} else {
		COLOR = tex * COLOR;
	}
}
"""
	vargost_mat = ShaderMaterial.new()
	vargost_mat.shader = flash_shader
	vargost_view = CharacterView.new()
	vargost_view.name = "VargostView"
	vargost_view.material = vargost_mat
	vargost_view.draw_cb = _draw_vargost
	add_child(vargost_view)

	aoda_mat = ShaderMaterial.new()
	aoda_mat.shader = flash_shader
	aoda_view = CharacterView.new()
	aoda_view.name = "AodaView"
	aoda_view.material = aoda_mat
	aoda_view.draw_cb = _draw_aoda
	add_child(aoda_view)

	crapit_mat = ShaderMaterial.new()
	crapit_mat.shader = flash_shader
	crapit_view = CharacterView.new()
	crapit_view.name = "CrapitView"
	crapit_view.material = crapit_mat
	crapit_view.draw_cb = _draw_crapit
	add_child(crapit_view)

	ui_view = CharacterView.new()
	ui_view.name = "UIView"
	ui_view.draw_cb = _draw_ui_layer
	add_child(ui_view)

func _init_env_polygons() -> void:
	env_polygons.clear()
	# Zone 1: Platform 1 & Vách Đá Trái
	env_polygons.append(PackedVector2Array([
		Vector2(MAP_X + 0.0 * MAP_SCALE, MAP_Y + 226.0 * MAP_SCALE),
		Vector2(MAP_X + 36.0 * MAP_SCALE, MAP_Y + 226.0 * MAP_SCALE),
		Vector2(MAP_X + 36.0 * MAP_SCALE, MAP_Y + 260.0 * MAP_SCALE),
		Vector2(MAP_X + 128.0 * MAP_SCALE, MAP_Y + 260.0 * MAP_SCALE),
		Vector2(MAP_X + 128.0 * MAP_SCALE, MAP_Y + 292.0 * MAP_SCALE),
		Vector2(MAP_X + 228.0 * MAP_SCALE, MAP_Y + 292.0 * MAP_SCALE),
		Vector2(MAP_X + 228.0 * MAP_SCALE, MAP_Y + 351.0 * MAP_SCALE),
		Vector2(MAP_X + 0.0 * MAP_SCALE, MAP_Y + 351.0 * MAP_SCALE)
	]))
	# Zone 2: Bệ Đá Giữa (Platform 2)
	env_polygons.append(PackedVector2Array([
		Vector2(MAP_X + 188.0 * MAP_SCALE, MAP_Y + 194.0 * MAP_SCALE),
		Vector2(MAP_X + 260.0 * MAP_SCALE, MAP_Y + 194.0 * MAP_SCALE),
		Vector2(MAP_X + 260.0 * MAP_SCALE, MAP_Y + 245.0 * MAP_SCALE),
		Vector2(MAP_X + 235.0 * MAP_SCALE, MAP_Y + 275.0 * MAP_SCALE),
		Vector2(MAP_X + 205.0 * MAP_SCALE, MAP_Y + 275.0 * MAP_SCALE),
		Vector2(MAP_X + 188.0 * MAP_SCALE, MAP_Y + 245.0 * MAP_SCALE)
	]))
	# Zone 3: Vách Đá Phải (Platform 3)
	env_polygons.append(PackedVector2Array([
		Vector2(MAP_X + 286.0 * MAP_SCALE, MAP_Y + 100.0 * MAP_SCALE),
		Vector2(MAP_X + 422.0 * MAP_SCALE, MAP_Y + 100.0 * MAP_SCALE),
		Vector2(MAP_X + 422.0 * MAP_SCALE, MAP_Y + 130.0 * MAP_SCALE),
		Vector2(MAP_X + 488.0 * MAP_SCALE, MAP_Y + 130.0 * MAP_SCALE),
		Vector2(MAP_X + 488.0 * MAP_SCALE, MAP_Y + 164.0 * MAP_SCALE),
		Vector2(MAP_X + 511.0 * MAP_SCALE, MAP_Y + 164.0 * MAP_SCALE),
		Vector2(MAP_X + 511.0 * MAP_SCALE, MAP_Y + 351.0 * MAP_SCALE),
		Vector2(MAP_X + 284.0 * MAP_SCALE, MAP_Y + 351.0 * MAP_SCALE),
		Vector2(MAP_X + 284.0 * MAP_SCALE, MAP_Y + 286.0 * MAP_SCALE),
		Vector2(MAP_X + 348.0 * MAP_SCALE, MAP_Y + 286.0 * MAP_SCALE),
		Vector2(MAP_X + 348.0 * MAP_SCALE, MAP_Y + 250.0 * MAP_SCALE),
		Vector2(MAP_X + 375.0 * MAP_SCALE, MAP_Y + 250.0 * MAP_SCALE),
		Vector2(MAP_X + 375.0 * MAP_SCALE, MAP_Y + 205.0 * MAP_SCALE),
		Vector2(MAP_X + 350.0 * MAP_SCALE, MAP_Y + 175.0 * MAP_SCALE),
		Vector2(MAP_X + 305.0 * MAP_SCALE, MAP_Y + 175.0 * MAP_SCALE),
		Vector2(MAP_X + 286.0 * MAP_SCALE, MAP_Y + 120.0 * MAP_SCALE)
	]))

func _line_intersect(p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2) -> Variant:
	var denom := (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
	if absf(denom) < 1e-6:
		return null
	var ua := ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom
	var ub := ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom
	if ua >= 0.0 and ua <= 1.0 and ub >= 0.0 and ub <= 1.0:
		return Vector2(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y))
	return null

func _raycast_env(p1: Vector2, p2: Vector2, allowed_indices: Array = []) -> Variant:
	var closest_hit: Variant = null
	var min_d := INF
	for z_idx in range(env_polygons.size()):
		if not allowed_indices.is_empty() and not allowed_indices.has(z_idx):
			continue
		var poly: PackedVector2Array = env_polygons[z_idx]
		var n := poly.size()
		for i in range(n):
			var j := (i + n - 1) % n
			var hit: Variant = _line_intersect(p1, p2, poly[j], poly[i])
			if hit != null:
				var d: float = p1.distance_to(hit)
				if d < min_d:
					min_d = d
					closest_hit = hit
	return closest_hit

func _is_point_in_env(pt: Vector2, allowed_indices: Array = []) -> bool:
	for z_idx in range(env_polygons.size()):
		if not allowed_indices.is_empty() and not allowed_indices.has(z_idx):
			continue
		if Geometry2D.is_point_in_polygon(pt, env_polygons[z_idx]):
			return true
	return false

func _load_all_textures() -> void:
	map_texture = Library._load_texture_safe("res://Asset/Scenes/amore_scale_test/map.png")
	
	# UI Ống Máu Gothic RPG
	tex_bar_empty = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/ui/health_bar_empty.png")
	tex_bar_blood = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/ui/health_bar_blood.png")
	tex_bar_green = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/ui/health_bar_green.png")
	tex_bar_glass = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/ui/health_bar_glass.png")

	# Vargost & Projectile
	vargost_atlas_tex = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/vargost_body_atlas.png")
	proj_tex = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/projectile_sheet.png")
	explosion_tex = Library._load_texture_safe("res://Asset/Character/characters/vargost_combat/vfx_fire_explosion_sheet.png")

	# Aoda & Tornado
	for i in range(11):
		var pad := "%03d" % i
		var at := Library._load_texture_safe("res://Asset/Character/fine_candidates/aoda/atlas_" + pad + ".png")
		aoda_atlases.append(at)
	tornado_tex = Library._load_texture_safe("res://Asset/Character/characters/aoda_combat/vfx_red_tornado/atlas.png")

	# Boss Crapit & Saliva Orb VFX & Explosion VFX (Atlas-Only Hygiene)
	crapit_boss_tex = Library._load_texture_safe("res://Asset/Character/characters/crapit_boss/body_atlas.png")
	crapit_orb_tex = Library._load_texture_safe("res://Asset/Character/characters/crapit_boss/vfx_spit_orb/atlas.png")
	crapit_exp_tex = Library._load_texture_safe("res://Asset/Character/characters/crapit_boss/vfx_spit_explosion/atlas.png")
	crapit_loot_orb_tex = Library._load_texture_safe("res://Asset/Character/characters/crapit_boss/loot_orb/atlas.png")
	sword_atlas_tex = Library._load_texture_safe("res://Asset/Character/characters/sword_objective/atlas.png")

	# Parse Aoda candidate manifest for exact 100% frame-to-atlas mapping (Eliminates all flickering)
	var json_file := FileAccess.open("res://Asset/Character/fine_candidates/aoda/candidate.json", FileAccess.READ)
	if json_file:
		var json_text := json_file.get_as_text()
		var json_res = JSON.parse_string(json_text)
		if json_res is Dictionary and json_res.has("frames"):
			aoda_manifest_frames = json_res["frames"]

func _init_positions() -> void:
	var t1_is_left := (team_origin_direction > 0.0)
	# Vargost (Team 1 · Nhân vật bay): Xuất phát trên không trung tại khu vực Căn Cứ Đội 1 (Vòng tròn đỏ)
	vargost_x = LEFT_BASE_AIR_X if t1_is_left else RIGHT_BASE_AIR_X
	vargost_y = LEFT_BASE_AIR_Y if t1_is_left else RIGHT_BASE_AIR_Y
	vargost_target_air_x = vargost_x
	vargost_target_air_y = vargost_y
	vargost_facing = 1.0 if t1_is_left else -1.0
	vargost_visual_facing = vargost_facing
	vargost_tilt = 0.0

	# Aoda (Team 2 · Bộ binh): Xuất phát trên địa hình tại khu vực Căn Cứ Đội 2 (Vòng tròn đỏ đối diện) tiến về tranh Thánh Kiếm!
	var t2_is_left := not t1_is_left
	aoda_cur_platform_id = LEFT_BASE_GROUND_PLAT if t2_is_left else RIGHT_BASE_GROUND_PLAT
	var p_base: Dictionary = PLATFORMS[aoda_cur_platform_id]
	aoda_x = LEFT_BASE_GROUND_X if t2_is_left else RIGHT_BASE_GROUND_X
	aoda_y = float(p_base["y"])
	aoda_facing = 1.0 if t2_is_left else -1.0
	aoda_visual_facing = aoda_facing
	aoda_state = "MOVE"
	aoda_frame_index = 65

func setup_holy_sword() -> void:
	sword_sprite = AnimatedSprite2D.new()
	var sword_frames := SpriteFrames.new()
	sword_frames.rename_animation("default", "idle")
	sword_frames.set_animation_speed("idle", 10.0)
	sword_frames.set_animation_loop("idle", true)

	if sword_atlas_tex != null:
		for i in range(55):
			var col := i % 8
			var row := i / 8
			var at_tex := AtlasTexture.new()
			at_tex.atlas = sword_atlas_tex
			at_tex.region = Rect2(col * 434, row * 620, 434, 620)
			sword_frames.add_frame("idle", at_tex)

	sword_sprite.sprite_frames = sword_frames
	sword_sprite.centered = false
	sword_sprite.offset = Vector2(-217.0, -619.0)
	var sw_scale: float = 90.0 / 620.0
	sword_sprite.scale = Vector2.ONE * sw_scale
	sword_sprite.position = Vector2(SWORD_X, SWORD_Y)
	add_child(sword_sprite)
	sword_sprite.play("idle")

func setup_top_hud() -> void:
	hud_layer = CanvasLayer.new()
	add_child(hud_layer)

	# 1. BẢNG THÔNG TIN CHIẾN TRẬN GÓC TRÊN BÊN TRÁI (Khớp 100% mẫu ảnh image copy 6.png)
	var top_panel := PanelContainer.new()
	top_panel.position = Vector2(24, 18)
	top_panel.custom_minimum_size = Vector2(490, 84)
	var sb_top := StyleBoxFlat.new()
	sb_top.bg_color = Color(0.06, 0.08, 0.12, 0.90)
	sb_top.border_color = Color(0.35, 0.45, 0.6, 0.8)
	sb_top.set_border_width_all(2)
	sb_top.set_corner_radius_all(8)
	sb_top.content_margin_left = 14
	sb_top.content_margin_right = 14
	sb_top.content_margin_top = 8
	sb_top.content_margin_bottom = 8
	top_panel.add_theme_stylebox_override("panel", sb_top)
	hud_layer.add_child(top_panel)

	var top_vbox := VBoxContainer.new()
	top_vbox.add_theme_constant_override("separation", 3)
	top_panel.add_child(top_vbox)

	ui_title = Label.new()
	ui_title.text = "⚔️ GODWAR · BỘ CÔNG CỤ TINH CHỈNH & KIỂM THỬ 3v3"
	ui_title.add_theme_font_size_override("font_size", 13)
	ui_title.add_theme_color_override("font_color", Color("#ffd166"))
	top_vbox.add_child(ui_title)

	var lbl_sub := Label.new()
	lbl_sub.text = "TIẾN ĐỘ TRANH CHẤP CỨ ĐIỂM (BÁN KÍNH 140PX)"
	lbl_sub.add_theme_font_size_override("font_size", 11)
	lbl_sub.add_theme_color_override("font_color", Color("#e6edf3"))
	top_vbox.add_child(lbl_sub)

	ui_status = Label.new()
	ui_status.text = "⚔️ Cứ Điểm Trống · Chưa Ai Chiếm"
	ui_status.add_theme_font_size_override("font_size", 12)
	ui_status.add_theme_color_override("font_color", Color("#ffffff"))
	top_vbox.add_child(ui_status)

	ui_bar = ProgressBar.new()
	ui_bar.custom_minimum_size = Vector2(462, 8)
	ui_bar.max_value = CAPTURE_TARGET
	ui_bar.value = 0.0
	ui_bar.show_percentage = false
	var sb_bar := StyleBoxFlat.new()
	sb_bar.bg_color = Color("#ffd166")
	sb_bar.set_corner_radius_all(3)
	ui_bar.add_theme_stylebox_override("fill", sb_bar)
	top_vbox.add_child(ui_bar)

	# 2. HÀNG NÚT ĐIỀU KHIỂN CẢM ỨNG KIỂM THỬ Ở ĐÁY MÀN HÌNH (Khớp 100% mẫu ảnh image copy 6.png, co giãn toàn màn hình)
	var bot_panel := PanelContainer.new()
	bot_panel.anchor_left = 0.0
	bot_panel.anchor_right = 1.0
	bot_panel.anchor_top = 1.0
	bot_panel.anchor_bottom = 1.0
	bot_panel.offset_left = 24.0
	bot_panel.offset_right = -24.0
	bot_panel.offset_top = -80.0
	bot_panel.offset_bottom = -15.0
	var sb_bot := StyleBoxFlat.new()
	sb_bot.bg_color = Color(0.06, 0.08, 0.12, 0.92)
	sb_bot.border_color = Color(0.25, 0.32, 0.42, 0.8)
	sb_bot.set_border_width_all(1)
	sb_bot.set_corner_radius_all(10)
	sb_bot.content_margin_left = 12
	sb_bot.content_margin_right = 12
	sb_bot.content_margin_top = 8
	sb_bot.content_margin_bottom = 8
	bot_panel.add_theme_stylebox_override("panel", sb_bot)
	hud_layer.add_child(bot_panel)

	var bot_hbox := HBoxContainer.new()
	bot_hbox.add_theme_constant_override("separation", 10)
	bot_panel.add_child(bot_hbox)

	var btn_halo := _create_hud_btn("🔥 Blazing Halo (Vargost)", "#d9730d", "#b85d00")
	btn_halo.pressed.connect(_on_btn_halo_pressed)
	bot_hbox.add_child(btn_halo)

	var btn_tornado := _create_hud_btn("🌪️ Aoda Tornado (2.0s)", "#cf222e", "#a40e26")
	btn_tornado.pressed.connect(_on_btn_tornado_pressed)
	bot_hbox.add_child(btn_tornado)

	var btn_turn := _create_hud_btn("🔄 Đổi hướng (Trái ⇋ Phải)", "#1f6feb", "#1158c7")
	btn_turn.pressed.connect(_on_btn_turn_pressed)
	bot_hbox.add_child(btn_turn)

	var btn_step := _create_hud_btn("📍 Đổi bệ Aoda (1..3 Step)", "#238636", "#1a6327")
	btn_step.pressed.connect(_on_btn_step_pressed)
	bot_hbox.add_child(btn_step)

	var btn_ko := _create_hud_btn("💀 Test Aoda KO", "#82071e", "#5c0213")
	btn_ko.pressed.connect(_on_btn_ko_pressed)
	bot_hbox.add_child(btn_ko)

	var btn_reset := _create_hud_btn("🔄 Khởi Động Lại", "#8957e5", "#6e40c9")
	btn_reset.pressed.connect(_reset_match)
	bot_hbox.add_child(btn_reset)

	var btn_fps := _create_hud_btn("⚡ Khóa 60 FPS (Đạt Chuẩn)", "#2da44e", "#238636")
	btn_fps.pressed.connect(func(): show_toast("⚡ Hiến pháp GodWar: Khóa cứng 60 FPS tuyệt đối!"))
	bot_hbox.add_child(btn_fps)

	# 3. TOAST THÔNG BÁO NỔI
	ui_toast = Label.new()
	ui_toast.position = Vector2(660, 24)
	ui_toast.size = Vector2(600, 36)
	ui_toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ui_toast.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	ui_toast.add_theme_font_size_override("font_size", 14)
	ui_toast.add_theme_color_override("font_color", Color("#ffffff"))
	var sb_toast := StyleBoxFlat.new()
	sb_toast.bg_color = Color(0.1, 0.12, 0.18, 0.92)
	sb_toast.border_color = Color(0.3, 0.6, 1.0, 0.8)
	sb_toast.set_border_width_all(1)
	sb_toast.set_corner_radius_all(8)
	ui_toast.add_theme_stylebox_override("panel", sb_toast)
	ui_toast.visible = false
	hud_layer.add_child(ui_toast)

func _create_hud_btn(text: String, bg_hex: String, pressed_hex: String) -> Button:
	var btn := Button.new()
	btn.text = text
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.custom_minimum_size = Vector2(0, 48)
	btn.add_theme_font_size_override("font_size", 13)
	btn.add_theme_color_override("font_color", Color("#ffffff"))
	btn.focus_mode = Control.FOCUS_NONE

	var sb_normal := StyleBoxFlat.new()
	sb_normal.bg_color = Color(bg_hex)
	sb_normal.border_color = Color(1, 1, 1, 0.25)
	sb_normal.set_border_width_all(1)
	sb_normal.set_corner_radius_all(6)
	btn.add_theme_stylebox_override("normal", sb_normal)

	var sb_hover := StyleBoxFlat.new()
	sb_hover.bg_color = Color(bg_hex).lightened(0.15)
	sb_hover.set_corner_radius_all(6)
	btn.add_theme_stylebox_override("hover", sb_hover)

	var sb_pressed := StyleBoxFlat.new()
	sb_pressed.bg_color = Color(pressed_hex)
	sb_pressed.set_corner_radius_all(6)
	btn.add_theme_stylebox_override("pressed", sb_pressed)

	return btn

func _on_btn_halo_pressed() -> void:
	if vargost_state == "IDLE":
		vargost_state = "HALO_WINDUP"
		vargost_frame_index = 44
		if vargost_retaliate_boss and not crapit_is_dead:
			halo_locked_target = Vector2(crapit_x, crapit_y - 35.0)
		elif not aoda_is_dead:
			halo_locked_target = Vector2(aoda_x, aoda_y - 45.0)
		else:
			halo_locked_target = Vector2(SWORD_X, SWORD_Y - 20.0)
		vargost_facing = 1.0 if halo_locked_target.x >= vargost_x else -1.0
		vargost_visual_facing = vargost_facing
		vargost_tilt = 0.0
		show_toast("🔥 Vargost: Kích hoạt Blazing Halo (Khóa đường bay)!")

func _on_btn_tornado_pressed() -> void:
	if not aoda_is_dead:
		aoda_tornado_cooldown = 5.0
		aoda_state = "SKILL_1_WINDUP"
		aoda_frame_index = 24
		show_toast("🌪️ Aoda: Kích hoạt Red Tornado càn quét 2.0s!")

func _on_btn_turn_pressed() -> void:
	team_origin_direction = -team_origin_direction
	_init_positions()
	show_toast("🔄 Đã đổi Căn Cứ Xuất Phát 2 Đội (Trái ⇋ Phải)!")

func _on_btn_step_pressed() -> void:
	var next_plat := "plat_1a"
	if aoda_cur_platform_id == "plat_1a":
		next_plat = "plat_1b"
	elif aoda_cur_platform_id == "plat_1b":
		next_plat = "plat_2"
	elif aoda_cur_platform_id == "plat_2":
		next_plat = "plat_3a"
	else:
		next_plat = "plat_1a"
	aoda_cur_platform_id = next_plat
	var p: Dictionary = PLATFORMS[next_plat]
	aoda_x = (float(p["minX"]) + float(p["maxX"])) / 2.0
	aoda_y = float(p["y"])
	aoda_state = "MOVE"
	aoda_frame_index = 65
	show_toast("📍 Aoda chuyển sang bệ: " + str(p.get("name", next_plat)))

func _on_btn_ko_pressed() -> void:
	aoda_hp = 0.0
	aoda_is_dead = true
	aoda_death_timer = 0.0
	aoda_state = "KO"
	aoda_frame_index = 46
	show_toast("💀 Aoda trúng đòn chí mạng gục ngã (KO)!")

func show_toast(msg: String) -> void:
	if ui_toast != null:
		ui_toast.text = msg
		ui_toast.visible = true
		toast_timer = 2.5

# -------------------------------------------------------------
# MAIN GAME LOOP (KHÓA CHUẨN XÁC 60 FPS THEO HIẾN PHÁP)
# -------------------------------------------------------------
func _physics_process(delta: float) -> void:
	if toast_timer > 0.0:
		toast_timer -= delta
		if toast_timer <= 0.0:
			ui_toast.visible = false

	# Cập nhật Vargost, Bóng Mờ, Teleport, Aoda, Tornadoes, Boss Crapit chuẩn 100% logic Single Source of Truth
	_update_vargost(delta)
	_update_motion_ghosts(delta)
	_update_ember_particles(delta)
	_update_aoda(delta)
	_update_crapit(delta)
	_update_boss_loot_and_escort(delta)
	_update_tornadoes(delta)
	_update_projectiles(delta)
	_update_explosions(delta)
	_update_hit_impacts(delta)
	_update_damage_ghosts(delta)
	_update_capture(delta)

	queue_redraw()
	if vargost_view:
		vargost_view.queue_redraw()
	if aoda_view:
		aoda_view.queue_redraw()
	if crapit_view:
		crapit_view.queue_redraw()
	if ui_view:
		ui_view.queue_redraw()

# -------------------------------------------------------------
# LOGIC VARGOST (MAGE BAY LƯỢN, BÓNG MỜ 2D, TELEPORT & BLAZING HALO 1100 px/s)
# -------------------------------------------------------------
func _update_vargost(dt: float) -> void:
	vargost_hover_timer += dt
	if vargost_hit_flash > 0.0:
		vargost_hit_flash -= dt
		if vargost_mat:
			var flash_intensity := clampf(vargost_hit_flash / 0.18, 0.0, 1.0)
			var flash_col := Color.WHITE if int(vargost_hover_timer * 45.0) % 2 == 0 else Color("#ff4d4d")
			vargost_mat.set_shader_parameter("hit_flash", flash_intensity)
			vargost_mat.set_shader_parameter("flash_color", flash_col)
	else:
		if vargost_mat:
			vargost_mat.set_shader_parameter("hit_flash", 0.0)

	# Thoát hiểm sau khi dính đòn (hiển thị trọn vẹn lóe sáng và giật lùi trước khi biến ảnh)
	if vargost_teleport_escape_timer > 0.0:
		vargost_teleport_escape_timer -= dt
		if vargost_teleport_escape_timer <= 0.0 and not is_vargost_teleporting and vargost_state == "IDLE":
			var retreat_x := clampf(vargost_x - vargost_facing * 180.0, 200.0, 750.0)
			var retreat_y := randf_range(240.0, 360.0)
			_trigger_vargost_teleport(retreat_x, retreat_y)

	# Xoay mặt 2.5D siêu tốc đánh lừa thị giác (x3+ speed) kèm hiệu ứng Pixel Dissolve
	if absf(vargost_visual_facing - vargost_facing) > 0.02:
		var prev_vf := vargost_visual_facing
		vargost_visual_facing = move_toward(vargost_visual_facing, vargost_facing, dt * 50.0)
		if signf(prev_vf) != signf(vargost_visual_facing) and prev_vf != 0.0:
			var h_off := sin(vargost_hover_timer * 3.2) * 8.0
			_spawn_ember_burst(Vector2(vargost_x, vargost_y + h_off), 8)
	else:
		vargost_visual_facing = vargost_facing

	# 0. Xử lý Thân pháp biến ảnh Teleport (3 pha chuẩn 0.38s Single Source of Truth Web Tool)
	if is_vargost_teleporting:
		teleport_timer += dt
		var t := teleport_timer
		if t < 0.14:
			# Pha 1: Tan rã lát cắt (Dissolve Out) + Glitch Blink chớp tắt
			teleport_step = 1
			vargost_dissolve_factor = clampf(t / 0.14, 0.0, 1.0)
			vargost_is_glitch_flash = sin(t * 55.0) > 0.2
			if randf() < 0.35:
				var h_off := sin(vargost_hover_timer * 3.2) * 8.0
				_spawn_ember_burst(Vector2(vargost_x + randf_range(-15.0, 15.0), vargost_y + h_off + randf_range(-20.0, 20.0)), 1)
		elif t < 0.22:
			# Pha 2: Tàng hình trong hư không (Void Shift) + Dịch chuyển tức thời + Lật hướng
			if teleport_step != 2:
				teleport_step = 2
				vargost_x = teleport_target_x
				vargost_y = teleport_target_y
				vargost_facing = teleport_target_facing
				vargost_visual_facing = teleport_target_facing
				vargost_tilt = 0.0 # Thân đứng 0 độ uy nghiêm!
				var h_off := sin(vargost_hover_timer * 3.2) * 8.0
				_spawn_ember_burst(Vector2(vargost_x, vargost_y + h_off), 10)
			vargost_dissolve_factor = 1.0 # Hoàn toàn tàng hình
			vargost_is_glitch_flash = false
		elif t < 0.38:
			# Pha 3: Tụ lại lát cắt pixel (Re-materialize) từ hư không
			teleport_step = 3
			var p3 := (t - 0.22) / 0.16
			vargost_dissolve_factor = maxf(0.0, 1.0 - p3)
			vargost_is_glitch_flash = (p3 < 0.4) and (sin(t * 60.0) > 0.4)
		else:
			is_vargost_teleporting = false
			teleport_step = 0
			vargost_dissolve_factor = 0.0
			vargost_is_glitch_flash = false
			vargost_alpha = 1.0
	else:
		vargost_dissolve_factor = 0.0
		vargost_is_glitch_flash = false

	# Đứng yên bất động 1s khi mới xuất phát / hồi sinh
	if vargost_spawn_freeze_timer > 0.0:
		vargost_spawn_freeze_timer -= dt
		vargost_state = "IDLE"
		vargost_frame_timer += dt
		if vargost_frame_timer >= 0.06:
			vargost_frame_timer -= 0.06
			vargost_frame_index = (vargost_frame_index + 1) % 22
		return

	# 1. Bay lượn chiến thuật: Vargost là XẠ THỦ TẦM XA
	# QUY TẮC HIẾN PHÁP: Nếu Aoda còn sống, Vargost giữ cự ly tầm xa an toàn [260, 480], tấn công từ xa!
	# TUYỆT ĐỐI KHÔNG bay vào bệ Thánh Kiếm khi địch đang phòng thủ! CHỈ KHI Aoda tử trận mới bay tới chiếm!
	# Nếu bị Boss Crapit bắn trúng (vargost_retaliate_boss == true), Vargost quay sang tấn công trả Boss đến khi Boss chết!
	if crapit_is_dead:
		vargost_retaliate_boss = false

	vargost_ai_timer -= dt
	if vargost_ai_timer <= 0.0:
		vargost_ai_timer = randf_range(2.5, 4.0)
		var v_is_carrier := str(boss_loot_drop["carrier_id"]) == "vargost"
		var v_pick_loot: bool = bool(boss_loot_drop["active"]) and str(boss_loot_drop["carrier_id"]) == "" and (bool(boss_loot_drop["is_free_for_all"]) or str(boss_loot_drop["locked_picker_id"]) == "vargost")
		var aoda_is_carrier := str(boss_loot_drop["carrier_id"]) == "aoda"

		if v_is_carrier:
			# Đang mang Cổ Vật -> Ưu tiên số 1 bay thẳng về Căn Cứ Trái (379, 638)!
			vargost_target_air_x = LEFT_EXTRACTION_POS.x
			vargost_target_air_y = LEFT_EXTRACTION_POS.y
		elif v_pick_loot:
			# Nhặt Cổ Vật rơi trên sàn
			vargost_target_air_x = float(boss_loot_drop["x"])
			vargost_target_air_y = float(boss_loot_drop["y"]) - 40.0
		elif aoda_is_carrier:
			# Địch Aoda đang cầm Cổ Vật -> Đổi toàn bộ mục tiêu sang truy sát Aoda!
			vargost_target_air_x = clampf(aoda_x - 220.0 * aoda_facing, 180.0, 1650.0)
			vargost_target_air_y = clampf(aoda_y - 80.0, 210.0, 360.0)
		elif vargost_retaliate_boss and not crapit_is_dead:
			# Bị Boss Crapit bắn -> Giữ vị trí không phận thoáng góc bắn trả Boss Crapit!
			vargost_target_air_x = randf_range(SWORD_X - 60.0, SWORD_X + 60.0)
			vargost_target_air_y = randf_range(SWORD_Y - 125.0, SWORD_Y - 75.0)
		elif aoda_is_dead:
			# Kẻ địch đã gục -> Vargost bay tới bệ Thánh Kiếm chiếm cứ điểm!
			vargost_target_air_x = randf_range(SWORD_X - 50.0, SWORD_X + 50.0)
			vargost_target_air_y = randf_range(SWORD_Y - 120.0, SWORD_Y - 70.0)
		else:
			# Kẻ địch còn sống -> Vargost giữ cự ly tầm xa [260, 440] về phía Căn Cứ Đội 1 (tránh bay đâm vào vách đá Zone 3)
			var opt_side := -1.0 if team_origin_direction > 0.0 else 1.0
			if opt_side < 0.0:
				vargost_target_air_x = clampf(aoda_x - randf_range(260.0, 420.0), 180.0, 1020.0)
			else:
				vargost_target_air_x = clampf(aoda_x + randf_range(260.0, 420.0), 860.0, 1650.0)
			vargost_target_air_y = randf_range(210.0, 320.0)

	# Tự động né đòn / Giữ khoảng cách an toàn: Nếu Aoda áp sát (< 220px) -> Teleport lùi giữ cự ly!
	var dist_to_aoda := Vector2(vargost_x, vargost_y).distance_to(Vector2(aoda_x, aoda_y))
	if dist_to_aoda < 220.0 and not aoda_is_dead and vargost_state == "IDLE" and not is_vargost_teleporting:
		var retreat_dir := -1.0 if aoda_x > vargost_x else 1.0
		var retreat_x := clampf(vargost_x + retreat_dir * 200.0, 180.0, 1020.0)
		if absf(retreat_x - aoda_x) < 220.0:
			retreat_x = clampf(aoda_x - retreat_dir * 320.0, 180.0, 1020.0)
		var retreat_y := randf_range(210.0, 310.0)
		_trigger_vargost_teleport(retreat_x, retreat_y)

	# Đang trong thời gian chờ hồi chiêu (khoảng nghỉ): Nếu đã bay tới điểm đích, tự động chọn điểm tuần tra chậm xung quanh
	var move_vec := Vector2(vargost_target_air_x - vargost_x, vargost_target_air_y - vargost_y)
	if move_vec.length() <= 12.0 and vargost_state == "IDLE" and not aoda_is_dead and not is_vargost_teleporting:
		var opt_side := -1.0 if team_origin_direction > 0.0 else 1.0
		if opt_side < 0.0:
			vargost_target_air_x = clampf(aoda_x - randf_range(260.0, 420.0), 180.0, 1020.0)
		else:
			vargost_target_air_x = clampf(aoda_x + randf_range(260.0, 420.0), 860.0, 1650.0)
		vargost_target_air_y = randf_range(210.0, 320.0)
		move_vec = Vector2(vargost_target_air_x - vargost_x, vargost_target_air_y - vargost_y)

	# QUY CHUẨN HIẾN PHÁP: Tập trung vào xu hướng di chuyển tiến về trước (không phân biệt Trái và Phải):
	# - Khi Vargost đang di chuyển (move_vec.length() > 6.0): Mặt Vargost LUÔN hướng theo chiều di chuyển ngang (signf(dir.x))
	#   và thân Vargost LUÔN đổ về phía trước 25 độ (+25° khi bay Trái -> Phải, -25° khi bay Phải -> Trái), tuyệt đối không bao giờ ngửa người về sau!
	# - Khi Vargost đứng yên / dừng lại: Mặt quay về phía mục tiêu (Boss Crapit nếu đang đánh trả, hoặc Aoda, hoặc Thánh Kiếm) và thân đứng thẳng 0°.
	if move_vec.length() > 6.0 and vargost_state == "IDLE" and not is_vargost_teleporting:
		var dir := move_vec.normalized()
		var is_cooling_down: bool = (vargost_auto_cooldown > 0.0 and not aoda_is_dead)
		var fly_speed: float = SPEED_SLOW if is_cooling_down else 300.0
		if str(boss_loot_drop["carrier_id"]) == "vargost":
			fly_speed *= 0.90 # Giảm 10% tốc độ khi đang mang Cổ Vật
		vargost_x += dir.x * fly_speed * dt
		vargost_y += dir.y * (fly_speed * 0.6) * dt

		if absf(dir.x) > 0.05:
			var move_sign_x: float = signf(dir.x)
			if vargost_facing != move_sign_x:
				vargost_facing = move_sign_x
				vargost_visual_facing = move_sign_x
				var h_off := sin(vargost_hover_timer * 3.2) * 8.0
				_spawn_ember_burst(Vector2(vargost_x, vargost_y + h_off), 6)
			# Đổ người về phía trước 25 độ theo đúng hướng tiến (không phân biệt Trái hay Phải)
			var target_tilt: float = move_sign_x * deg_to_rad(25.0)
			vargost_tilt = lerp_angle(vargost_tilt, target_tilt, dt * 12.0)
		else:
			vargost_tilt = lerp_angle(vargost_tilt, 0.0, dt * 10.0)

		# Sinh Bóng Mờ Chuyển Động 2D (Motion Ghosts) khi bay tiến
		ghost_spawn_timer += dt
		var ghost_interval := 0.12 if is_cooling_down else 0.07
		if ghost_spawn_timer >= ghost_interval:
			ghost_spawn_timer = 0.0
			var h_off := sin(vargost_hover_timer * 3.2) * 8.0
			motion_ghosts.append({
				"x": vargost_x,
				"y": vargost_y + h_off,
				"alpha": 0.30 if is_cooling_down else 0.45,
				"tilt": vargost_tilt,
				"facing": vargost_visual_facing,
				"frame": vargost_frame_index
			})
	else:
		var target_facing_x := crapit_x if (vargost_retaliate_boss and not crapit_is_dead) else (aoda_x if not aoda_is_dead else SWORD_X)
		if absf(target_facing_x - vargost_x) > 20.0:
			vargost_facing = 1.0 if target_facing_x > vargost_x else -1.0
		vargost_tilt = lerp_angle(vargost_tilt, 0.0, dt * 10.0)

	# 2. Hoạt ảnh Vargost (Unified 83 frames: 0..21 Idle, 44..82 Halo)
	vargost_frame_timer += dt
	if vargost_frame_timer >= 0.06:
		vargost_frame_timer -= 0.06

		if vargost_state == "IDLE":
			vargost_frame_index = (vargost_frame_index + 1) % 22
		elif vargost_state == "HALO_WINDUP":
			vargost_frame_index += 1
			if vargost_frame_index >= 68:
				# PHÓNG ĐẠI CẦU LỬA @ 1100px/s (Frame 68) THEO ĐÚNG ĐƯỜNG BAY ĐÃ KHÓA
				_spawn_blazing_halo_projectile(halo_locked_target.x, halo_locked_target.y)
				vargost_state = "HALO_RECOVERY"
		elif vargost_state == "HALO_RECOVERY":
			vargost_frame_index += 1
			if vargost_frame_index > 82:
				vargost_frame_index = 0
				vargost_state = "IDLE"
				vargost_auto_cooldown = 3.2 # Nghỉ chiến thuật 3.2s y hệt test tool

	# 3. Kích hoạt tung chiêu Blazing Halo (Ưu tiên phản công Boss Crapit nếu vargost_retaliate_boss == true, ngược lại bắn Aoda)
	if vargost_auto_cooldown > 0.0:
		vargost_auto_cooldown -= dt
	elif vargost_state == "IDLE" and ((vargost_retaliate_boss and not crapit_is_dead) or not aoda_is_dead):
		var hand_start := Vector2(vargost_x + 20.0 * vargost_facing, vargost_y - 20.0)
		var aim_pt := Vector2(crapit_x, crapit_y - 35.0) if (vargost_retaliate_boss and not crapit_is_dead) else Vector2(aoda_x, aoda_y - 45.0)
		var los_blocked: Variant = _raycast_env(hand_start, aim_pt)
		if los_blocked != null:
			# Bị vách đá chắn đường đạn -> Cơ động bay vút lên cao mở góc bắn!
			vargost_target_air_y = 210.0
			vargost_target_air_x = clampf(aim_pt.x - vargost_facing * 280.0, 200.0, 1720.0)
			vargost_auto_cooldown = 0.35
		else:
			vargost_state = "HALO_WINDUP"
			vargost_frame_index = 44 # Bắt đầu windup
			halo_locked_target = aim_pt
			vargost_facing = 1.0 if aim_pt.x >= vargost_x else -1.0
			vargost_visual_facing = vargost_facing
			vargost_tilt = 0.0

func _trigger_vargost_teleport(target_x: float, target_y: float) -> void:
	if is_vargost_teleporting:
		return
	is_vargost_teleporting = true
	teleport_timer = 0.0
	teleport_target_x = target_x
	teleport_target_y = target_y
	teleport_target_facing = 1.0 if SWORD_X > target_x else -1.0
	teleport_step = 1
	var h_off := sin(vargost_hover_timer * 3.2) * 8.0
	_spawn_ember_burst(Vector2(vargost_x, vargost_y + h_off), 12)
	show_toast("⚡ Vargost: Teleport dịch chuyển tức thời (Đứng thẳng 0°)!")

func _update_motion_ghosts(dt: float) -> void:
	var to_remove: Array[Dictionary] = []
	for g in motion_ghosts:
		g["alpha"] = float(g["alpha"]) - dt * 2.5
		if float(g["alpha"]) <= 0.0:
			to_remove.append(g)
	for g in to_remove:
		motion_ghosts.erase(g)

func _spawn_ember_burst(pos: Vector2, count: int) -> void:
	for i in range(count):
		ember_particles.append({
			"x": pos.x + randf_range(-15.0, 15.0),
			"y": pos.y + randf_range(-20.0, 20.0),
			"vx": randf_range(-70.0, 70.0),
			"vy": randf_range(-90.0, -20.0),
			"size": randf_range(2.0, 3.5),
			"alpha": 1.0,
			"color": Color("#ff4500") if randf() < 0.5 else Color("#ffd700"),
			"life": randf_range(0.3, 0.6)
		})

func _update_ember_particles(dt: float) -> void:
	var to_remove: Array[Dictionary] = []
	for ep in ember_particles:
		ep["life"] = float(ep["life"]) - dt
		ep["x"] = float(ep["x"]) + float(ep["vx"]) * dt
		ep["y"] = float(ep["y"]) + float(ep["vy"]) * dt
		ep["alpha"] = maxf(0.0, float(ep["life"]) / 0.5)
		if float(ep["life"]) <= 0.0:
			to_remove.append(ep)
	for ep in to_remove:
		ember_particles.erase(ep)

func _spawn_blazing_halo_projectile(target_x: float, target_y: float) -> void:
	var hover_offset := sin(vargost_hover_timer * 3.2) * 8.0
	var hand_pos := Vector2(20.0 * vargost_facing, -20.0).rotated(vargost_tilt) * vargost_scale
	var start_x := vargost_x + hand_pos.x
	var start_y := (vargost_y + hover_offset) + hand_pos.y

	var dir := Vector2(target_x - start_x, target_y - start_y).normalized()
	var speed := 1100.0 * (MAP_SCALE / 2.625)

	active_projectiles.append({
		"x": start_x,
		"y": start_y,
		"vx": dir.x * speed,
		"vy": dir.y * speed,
		"spin_frame": 0,
		"spin_timer": 0.0,
		"life": 2.2,
		"size": 80.0 * vargost_scale
	})

# -------------------------------------------------------------
# LOGIC AODA (XUẤT PHÁT BÊN TRÁI PLATFORM 1A & NHẢY BỆ TIẾN VÀO THÁNH KIẾM)
# -------------------------------------------------------------
func _update_aoda(dt: float) -> void:
	if aoda_hit_flash > 0.0:
		aoda_hit_flash -= dt
		if aoda_mat:
			var flash_intensity := clampf(aoda_hit_flash / 0.18, 0.0, 1.0)
			var flash_col := Color.WHITE if int(Time.get_ticks_msec() / 25) % 2 == 0 else Color("#ff4d4d")
			aoda_mat.set_shader_parameter("hit_flash", flash_intensity)
			aoda_mat.set_shader_parameter("flash_color", flash_col)
	else:
		if aoda_mat:
			aoda_mat.set_shader_parameter("hit_flash", 0.0)
	if aoda_tornado_cooldown > 0.0:
		aoda_tornado_cooldown -= dt

	# Xoay mặt Aoda siêu tốc / tức thời (Instant Turn Flip đồng bộ 100% Web Tool, triệt tiêu hoàn toàn hiện tượng lộ điểm lật của bức ảnh)
	aoda_visual_facing = aoda_facing

	# 1. Trạng thái Tử Trận (KO) & Hồi Sinh tại Platform 1A (Sau Cây Cao)
	if aoda_is_dead:
		aoda_death_timer += dt
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.06:
			aoda_frame_timer -= 0.06
			# Chạy hoạt ảnh ngã gục từ frame 46 -> 58 (tư thế gục ngã trên đất)
			# Dừng ở frame 58, tuyệt đối không tràn qua frame 64 blank hoặc 65 move!
			if aoda_frame_index < 58:
				aoda_frame_index += 1

		# Hạt tàn tro pixel bốc hơi vào hư không khi tan biến (0.3s -> 2.0s)
		if aoda_death_timer >= 0.3 and aoda_death_timer < 2.0:
			if randf() < 0.35:
				var dissolve_prog := clampf((aoda_death_timer - 0.3) / 1.7, 0.0, 1.0)
				_spawn_ember_burst(Vector2(aoda_x + randf_range(-15.0, 15.0), aoda_y - 25.0 * dissolve_prog - randf_range(10.0, 50.0)), 1)

		if aoda_death_timer >= 2.0:
			# Hồi sinh đầy máu trên địa hình tại Căn Cứ Đội 2 (Vòng tròn đỏ)!
			var t2_is_left := (team_origin_direction < 0.0)
			aoda_is_dead = false
			aoda_death_timer = 0.0
			aoda_hp = AODA_MAX_HP
			aoda_anti_heal = false # Mất hiệu ứng Cấm Hồi Máu khi chết và hồi sinh
			aoda_retaliate_boss = false # Ngừng đánh trả Boss khi chết và hồi sinh
			aoda_cur_platform_id = LEFT_BASE_GROUND_PLAT if t2_is_left else RIGHT_BASE_GROUND_PLAT
			var p_base: Dictionary = PLATFORMS[aoda_cur_platform_id]
			aoda_x = LEFT_BASE_GROUND_X if t2_is_left else RIGHT_BASE_GROUND_X
			aoda_y = float(p_base["y"])
			aoda_facing = 1.0 if t2_is_left else -1.0
			aoda_visual_facing = aoda_facing
			aoda_spawn_freeze_timer = 1.0 # Đứng bất động 1s khi xuất phát / hồi sinh
			aoda_state = "IDLE"
			aoda_frame_index = 0
			show_toast("✨ AODA ĐÃ HỒI SINH TẠI CĂN CỨ ĐỘI 2! Tiến về chiếm Thánh Kiếm!")
		return

	# Đứng yên bất động 1s khi mới xuất phát / hồi sinh
	if aoda_spawn_freeze_timer > 0.0:
		aoda_spawn_freeze_timer -= dt
		aoda_state = "IDLE"
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.08:
			aoda_frame_timer -= 0.08
			aoda_frame_index = (aoda_frame_index + 1) % 25
		return

	if crapit_is_dead:
		aoda_retaliate_boss = false

	# 2. Chiêu 1: Tornado Windup (Frame 25..29) & Recovery (Frame 30..46)
	if aoda_state == "SKILL_1_WINDUP":
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.06:
			aoda_frame_timer -= 0.06
			aoda_frame_index += 1
			if aoda_frame_index >= 29:
				_spawn_red_tornado(aoda_x, aoda_y, aoda_facing, aoda_cur_platform_id)
				aoda_state = "SKILL_1_RECOVERY"
		return
	elif aoda_state == "SKILL_1_RECOVERY":
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.06:
			aoda_frame_timer -= 0.06
			aoda_frame_index += 1
			if aoda_frame_index > 46:
				aoda_frame_index = 65
				aoda_state = "MOVE"
		return

	# 3. Utility AI: Tung chiêu Tornado CÓ CHỦ ĐÍCH NHẮM MỤC TIÊU MẶT ĐẤT (HOẶC PHẢN CÔNG BOSS CRAPIT)
	# QUY TẮC HIẾN PHÁP & SINGLE SOURCE OF TRUTH (vargost-skill-test.js):
	# Tornado CHỈ dùng cho mục tiêu mặt đất hoặc khi đối thủ sà thấp tiếp cận bệ (< 130px chênh lệch Y) hoặc khi bị Boss Crapit tấn công.
	var h_dist_vargost := absf(vargost_x - aoda_x)
	var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
	var vargost_cur_y := vargost_y + v_hover
	var is_vargost_ground_reachable := absf(vargost_cur_y - aoda_y) < 130.0 # Trong tầm với độ cao mặt đất
	var is_in_sword_zone := Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y)) <= SWORD_CAPTURE_RADIUS
	var can_retaliate_crapit := aoda_retaliate_boss and not crapit_is_dead and absf(crapit_x - aoda_x) < 550.0

	var aoda_carrying_loot := str(boss_loot_drop["carrier_id"]) == "aoda"
	var aoda_pursuing_carrier := str(boss_loot_drop["carrier_id"]) == "vargost"
	var aoda_picking_loot: bool = bool(boss_loot_drop["active"]) and str(boss_loot_drop["carrier_id"]) == "" and (bool(boss_loot_drop["is_free_for_all"]) or str(boss_loot_drop["locked_picker_id"]) == "aoda")

	if aoda_tornado_cooldown <= 0.0 and aoda_state != "JUMP" and aoda_state != "LANDING":
		# Tornado trúng cả mục tiêu trên không lẫn dưới mặt đất và dội tường
		if can_retaliate_crapit or (h_dist_vargost < 420.0 and not is_vargost_teleporting):
			var target_x := crapit_x if can_retaliate_crapit else vargost_x
			aoda_facing = 1.0 if target_x > aoda_x else -1.0
			aoda_visual_facing = aoda_facing
			aoda_tornado_cooldown = 5.0
			aoda_state = "SKILL_1_WINDUP"
			aoda_frame_index = 24
			return

	# 4. Trạng thái Di Chuyển (MOVE) & Tuần Tra Nhảy Bệ (Ledge Jump)
	if aoda_state == "MOVE":
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.06:
			aoda_frame_timer -= 0.06
			aoda_frame_index += 1
			if aoda_frame_index > 86:
				aoda_frame_index = 65

		var target_nav_x := SWORD_X
		if aoda_carrying_loot:
			target_nav_x = RIGHT_EXTRACTION_POS.x
		elif aoda_picking_loot:
			target_nav_x = float(boss_loot_drop["x"])
		elif aoda_pursuing_carrier:
			target_nav_x = vargost_x

		var is_at_nav_goal := absf(aoda_x - target_nav_x) < 40.0 if (aoda_carrying_loot or aoda_picking_loot) else is_in_sword_zone
		if not is_at_nav_goal:
			aoda_facing = 1.0 if target_nav_x > aoda_x else -1.0

		var plat: Dictionary = PLATFORMS.get(aoda_cur_platform_id, PLATFORMS["plat_2"])
		var eff_aoda_speed := aoda_patrol_speed * 0.90 if aoda_carrying_loot else aoda_patrol_speed
		var step_x := aoda_facing * eff_aoda_speed * dt
		var target_edge_x := aoda_x + step_x
		var min_ledge: float = plat["minX"] + 20.0
		var max_ledge: float = plat["maxX"] - 20.0
		# Khi ở Platform 1B tiến sang phải (lên Platform 2): Nhảy sớm ngay trước chân bậc Platform 2 để LUÔN nhảy tiến về phía trước!
		if aoda_cur_platform_id == "plat_1b" and aoda_facing > 0.0:
			var p2_min_x: float = PLATFORMS["plat_2"]["minX"]
			max_ledge = minf(max_ledge, p2_min_x - 35.0)

		if target_edge_x < min_ledge or target_edge_x > max_ledge:
			# Chạm mép bệ -> Nhảy bệ tiếp theo tiến về Thánh Kiếm (từ cả Căn Cứ Trái lẫn Căn Cứ Phải)
			var adj: Variant = _get_adjacent_platform(aoda_cur_platform_id, aoda_facing)
			var is_sword_ahead := (aoda_facing > 0.0 and SWORD_X > aoda_x) or (aoda_facing < 0.0 and SWORD_X < aoda_x)
			if adj != null and (!is_in_sword_zone or is_sword_ahead):
				aoda_state = "JUMP"
				aoda_jump_timer = 0.0
				aoda_jump_duration = 0.48
				aoda_jump_start_x = aoda_x
				aoda_jump_start_y = aoda_y
				aoda_jump_target_platform_id = adj["platform_id"]
				var tgt_plat: Dictionary = PLATFORMS.get(adj["platform_id"], PLATFORMS["plat_2"])
				var forward_target_x: float = float(adj["target_x"])
				var min_forward_step := 65.0
				# Đảm bảo quỹ đạo nhảy LUÔN tiến về phía trước theo hướng mặt aoda_facing (tuyệt đối không nhảy lùi)
				if aoda_facing > 0.0 and forward_target_x < aoda_x + min_forward_step:
					forward_target_x = minf(float(tgt_plat["maxX"]) - 25.0, aoda_x + min_forward_step)
				elif aoda_facing < 0.0 and forward_target_x > aoda_x - min_forward_step:
					forward_target_x = maxf(float(tgt_plat["minX"]) + 25.0, aoda_x - min_forward_step)
				aoda_jump_target_x = forward_target_x
				aoda_jump_target_y = adj["target_y"]
				if aoda_frame_index < 65 or aoda_frame_index > 86:
					aoda_frame_index = 65
				show_toast("🦘 Aoda: Nhảy bệ tiến đánh Thánh Kiếm!")
			else:
				aoda_x = max_ledge if aoda_facing > 0 else min_ledge
				aoda_state = "IDLE"
				aoda_frame_index = 0
		else:
			if is_in_sword_zone and absf(aoda_x - SWORD_X) < 40.0:
				aoda_state = "IDLE"
				aoda_frame_index = 0
			else:
				aoda_x = target_edge_x

	# 5. Trạng thái Nhảy Parabolic Arc (JUMP)
	elif aoda_state == "JUMP":
		aoda_jump_timer += dt
		var t := clampf(aoda_jump_timer / aoda_jump_duration, 0.0, 1.0)
		aoda_x = lerpf(aoda_jump_start_x, aoda_jump_target_x, t)
		var sc := MAP_SCALE / 2.625
		var delta_y := aoda_jump_target_y - aoda_jump_start_y
		if delta_y > 0.0:
			# Nhảy từ bệ cao xuống bệ thấp: Bật nhảy nhẹ lên trên ở đầu cú nhảy rồi đáp vòng cung mềm mại (không lao thẳng xuống)
			var hop_up := sin(t * PI) * 52.0 * sc
			var gravity_curve := pow(t, 1.85)
			aoda_y = aoda_jump_start_y + delta_y * gravity_curve - hop_up
		else:
			# Nhảy từ bệ thấp lên bệ cao: Vút cao dứt khoát rồi đáp xuống bệ trên
			var ease_out_y := 1.0 - pow(1.0 - t, 1.4)
			var arc := sin(t * PI) * 58.0 * sc
			aoda_y = aoda_jump_start_y + delta_y * ease_out_y - arc

		# Hoạt ảnh KHÔNG BỊ ĐƠ HÌNH: Tiếp tục chạy chuỗi 65..86 liên tục suốt cú nhảy!
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.05:
			aoda_frame_timer -= 0.05
			aoda_frame_index += 1
			if aoda_frame_index > 86 or aoda_frame_index < 65:
				aoda_frame_index = 65

		if t >= 1.0:
			aoda_cur_platform_id = aoda_jump_target_platform_id
			aoda_x = aoda_jump_target_x
			aoda_y = aoda_jump_target_y
			aoda_state = "LANDING"
			aoda_landing_timer = 0.12

	# 6. Trạng thái Tiếp Đất (LANDING)
	elif aoda_state == "LANDING":
		aoda_landing_timer -= dt
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.05:
			aoda_frame_timer -= 0.05
			aoda_frame_index += 1
			if aoda_frame_index > 86:
				aoda_frame_index = 65
		if aoda_landing_timer <= 0.0:
			is_in_sword_zone = Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y)) <= SWORD_CAPTURE_RADIUS
			if is_in_sword_zone:
				aoda_state = "IDLE"
				aoda_frame_index = 0
			else:
				aoda_facing = 1.0 if SWORD_X > aoda_x else -1.0
				aoda_state = "MOVE"
				aoda_frame_index = 65

	# 7. Trạng thái Phòng Thủ Tại Chỗ (IDLE)
	elif aoda_state == "IDLE":
		aoda_frame_timer += dt
		if aoda_frame_timer >= 0.08:
			aoda_frame_timer -= 0.08
			aoda_frame_index += 1
			if aoda_frame_index > 24:
				aoda_frame_index = 0

		is_in_sword_zone = Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y)) <= SWORD_CAPTURE_RADIUS
		if not is_in_sword_zone:
			aoda_facing = 1.0 if SWORD_X > aoda_x else -1.0
			aoda_state = "MOVE"
			aoda_frame_index = 65
		else:
			# Quay mặt đối diện Vargost để phòng thủ (Deadzone 35px chống rung)
			if absf(vargost_x - aoda_x) > 35.0:
				aoda_facing = 1.0 if vargost_x > aoda_x else -1.0

func _get_adjacent_platform(plat_id: String, facing: float) -> Variant:
	if plat_id == "plat_1a":
		if facing > 0:
			var p1b: Dictionary = PLATFORMS["plat_1b"]
			return {"platform_id": "plat_1b", "target_x": p1b["minX"] + 35.0, "target_y": p1b["y"]}
	elif plat_id == "plat_1b":
		if facing > 0:
			var p2: Dictionary = PLATFORMS["plat_2"]
			return {"platform_id": "plat_2", "target_x": p2["minX"] + 30.0, "target_y": p2["y"]}
		elif facing < 0:
			var p1a: Dictionary = PLATFORMS["plat_1a"]
			return {"platform_id": "plat_1a", "target_x": p1a["maxX"] - 35.0, "target_y": p1a["y"]}
	elif plat_id == "plat_2":
		if facing < 0:
			var p1b: Dictionary = PLATFORMS["plat_1b"]
			return {"platform_id": "plat_1b", "target_x": p1b["maxX"] - 35.0, "target_y": p1b["y"]}
		elif facing > 0:
			var p3a: Dictionary = PLATFORMS["plat_3a"]
			return {"platform_id": "plat_3a", "target_x": p3a["minX"] + 35.0, "target_y": p3a["y"]}
	elif plat_id == "plat_3a":
		if facing < 0:
			var p2: Dictionary = PLATFORMS["plat_2"]
			return {"platform_id": "plat_2", "target_x": p2["maxX"] - 30.0, "target_y": p2["y"]}
		elif facing > 0:
			var p3b: Dictionary = PLATFORMS["plat_3b"]
			return {"platform_id": "plat_3b", "target_x": p3b["minX"] + 30.0, "target_y": p3b["y"]}
	elif plat_id == "plat_3b":
		if facing < 0:
			var p3a: Dictionary = PLATFORMS["plat_3a"]
			return {"platform_id": "plat_3a", "target_x": p3a["maxX"] - 30.0, "target_y": p3a["y"]}
	return null

# -------------------------------------------------------------
# RED TORNADO 85px (CÓ PHẠM VI QUÉT SÀN, VÒNG ĐỜI 3 PHA CHUẨN XÁC: EMERGE -> SPIN 2.0s -> DISSIPATE)
# Single Source of Truth: Đồng bộ 100% vargost-skill-test.js (line 1114-1135, 2948-3048)
# MIỄN NHIỄM ĐỒNG ĐỘI 100% (Friendly Fire Immunity) - Tuyệt đối không bao giờ làm hại Aoda!
# -------------------------------------------------------------
func _spawn_red_tornado(x: float, y: float, facing: float, platform_id: String) -> void:
	var plat: Dictionary = PLATFORMS.get(platform_id, PLATFORMS["plat_2"])
	var spawn_y := float(plat["y"]) # Đặt CHÍNH XÁC trên bề mặt bệ đá!
	var spawn_x: float = x + facing * 85.0

	# 1. Xác định tọa độ xuất hiện theo Single Source of Truth:
	# Nếu đang đánh trả Boss Crapit -> nhắm thẳng mục tiêu Boss Crapit trên Platform 3D!
	if aoda_retaliate_boss and not crapit_is_dead and absf(crapit_x - x) < 700.0:
		spawn_x = crapit_x
		spawn_y = crapit_y
	# Nếu đối thủ Vargost đang trong tầm tấn công mặt đất -> nhắm thẳng mục tiêu Vargost!
	elif not vargost_is_dead:
		var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
		var v_pos_y := vargost_y + v_hover
		var is_v_ground := absf(v_pos_y - y) < 130.0 and absf(vargost_x - x) < 550.0
		if is_v_ground and not is_vargost_teleporting:
			spawn_x = vargost_x
		else:
			# Kẹp chặt trên bệ hiện tại, TUYỆT ĐỐI KHÔNG spawn rơi vào vực chôn chân giữa các bệ!
			spawn_x = clampf(x + facing * 85.0, float(plat["minX"]) + 20.0, float(plat["maxX"]) - 20.0)

	# 2. BẢO VỆ TUYỆT ĐỐI KHÔNG BAO GIỜ SPAWN TRÙNG LÊN NGƯỜI AODA NẾU KHÔNG CÓ MỤC TIÊU BOSS:
	if not (aoda_retaliate_boss and not crapit_is_dead) and absf(spawn_x - x) < 70.0:
		spawn_x = x + facing * 85.0

	active_tornadoes.append({
		"x": spawn_x,
		"y": spawn_y,
		"facing": facing,
		"vx": facing * 85.0 * (MAP_SCALE / 2.625), # Tốc độ càn quét đầm & uy lực 85px/s đồng bộ 1:1 Web Tool!
		"phase": "EMERGE", # EMERGE -> SPIN (2.0s) -> DISSIPATE
		"frame_index": 0,
		"frame_timer": 0.0,
		"spin_elapsed": 0.0,
		"spin_duration": 2.0, # Tồn tại xoay đúng 2.0 giây
		"scale": 85.0 / 690.0,
		"hit_cooldown": 0.0
	})
	show_toast("🌪️ Aoda: Phóng Red Tornado càn quét về phía trước (2.0s · CD 5s)!")

func _update_tornadoes(dt: float) -> void:
	var to_remove: Array[Dictionary] = []
	for t in active_tornadoes:
		t["frame_timer"] = float(t["frame_timer"]) + dt

		if t["phase"] == "EMERGE":
			if t["frame_timer"] >= 0.06:
				t["frame_timer"] -= 0.06
				t["frame_index"] = int(t["frame_index"]) + 1
				if t["frame_index"] >= 4:
					# Kết thúc mọc lên (frame 0..3) -> Chuyển sang xoay đỉnh cao quét sàn 2.0s
					t["phase"] = "SPIN"
					t["frame_index"] = 4
					t["spin_elapsed"] = 0.0
		elif t["phase"] == "SPIN":
			t["spin_elapsed"] = float(t["spin_elapsed"]) + dt

			# Di chuyển càn quét mặt sàn về phía trước, va chạm tường thì dội ngược lại cho đến khi hết thời gian tồn tại
			var cur_vx := float(t["vx"])
			var next_x := float(t["x"]) + cur_vx * dt
			var bound_min := MAP_X + 75.0 * MAP_SCALE
			var bound_max := MAP_X + 480.0 * MAP_SCALE
			var look_x := next_x + signf(cur_vx) * 20.0 * (MAP_SCALE / 2.625)
			if _is_point_in_env(Vector2(look_x, float(t["y"]) - 25.0)) or next_x <= bound_min or next_x >= bound_max:
				t["vx"] = -cur_vx
				t["facing"] = -float(t["facing"])
				t["x"] = float(t["x"]) + float(t["vx"]) * dt
			else:
				t["x"] = next_x

			if t["frame_timer"] >= 0.06:
				t["frame_timer"] -= 0.06
				t["frame_index"] = int(t["frame_index"]) + 1
				if t["frame_index"] > 9:
					t["frame_index"] = 4 # Loop xoay đỉnh cao 4..9

			# Sinh hạt tàn tro dưới chân lốc xoáy
			if randf() < 0.25:
				_spawn_ember_burst(Vector2(float(t["x"]), float(t["y"]) - 10.0), 1)

			# Kiểm tra sát thương diện rộng và khống chế lên KẺ ĐỊCH Vargost (Team 1)
			# TUYỆT ĐỐI MIỄN NHIỄM SÁT THƯƠNG ĐỒNG ĐỘI CHO AODA (Friendly Fire Immunity)
			t["hit_cooldown"] = float(t["hit_cooldown"]) - dt
			if float(t["hit_cooldown"]) <= 0.0:
				var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
				var v_pos := Vector2(vargost_x, vargost_y + v_hover)
				if absf(float(t["x"]) - v_pos.x) < 75.0 and absf(float(t["y"]) - v_pos.y) < 125.0:
					t["hit_cooldown"] = 0.6
					_spawn_hit_impact(v_pos.x, v_pos.y - 25.0, -vargost_facing)
					_damage_vargost(25.0)
					# Cho Vargost trúng đòn hiển thị lóa sáng và giật lùi nhẹ 0.22s trước khi kích hoạt Teleport thoát hiểm!
					vargost_teleport_escape_timer = 0.22

				# Kiểm tra lốc xoáy đánh trúng Boss Crapit khi Aoda đang phản công Boss (aoda_retaliate_boss == true)
				if aoda_retaliate_boss and not crapit_is_dead:
					if absf(float(t["x"]) - crapit_x) < 120.0 and absf(float(t["y"]) - crapit_y) < 280.0:
						t["hit_cooldown"] = 0.6
						_spawn_hit_impact(crapit_x, crapit_y - 35.0, float(t["facing"]))
						_damage_crapit_boss(95.0, "aoda")

			if t["spin_elapsed"] >= float(t["spin_duration"]):
				t["phase"] = "DISSIPATE"
				t["frame_index"] = 10
				t["frame_timer"] = 0.0
		elif t["phase"] == "DISSIPATE":
			if t["frame_timer"] >= 0.06:
				t["frame_timer"] -= 0.06
				t["frame_index"] = int(t["frame_index"]) + 1
				if t["frame_index"] > 14:
					to_remove.append(t)

	for t in to_remove:
		active_tornadoes.erase(t)

# -------------------------------------------------------------
# LOGIC BOSS TRUNG LẬP CRAPIT (crapit_main · 2150 HP tại (1164, 752))
# - Tấn công nhân vật đứng trong vùng chiếm Thánh Kiếm sau mỗi 5.0 - 7.0s
# - Quả cầu nước bọt 30x30 trượt từ Pin #1 sang Box #2 trên frame 8 rồi bay 500px/s,
#   xoay tròn + giữ hoạt ảnh gốc, khóa mục tiêu không trượt, xuyên qua Zone 2, bị cản bởi Zone 1 & Zone 3
# - Khi chạm mục tiêu hoặc địa hình 1/3: Nổ 40x40, trừ 15 HP + gán Cấm Hồi Máu (Anti-Heal) + kích hoạt phản xạ đánh trả Boss
# -------------------------------------------------------------
func _damage_crapit_boss(amount: float, attacker_id: String) -> void:
	if crapit_is_dead:
		return
	var prev_hp := crapit_hp
	crapit_hp = maxf(0.0, crapit_hp - amount)
	crapit_hit_flash = 0.35
	crapit_last_hit_by = attacker_id
	crapit_damage_ghosts.append({
		"from_hp": prev_hp, "to_hp": crapit_hp, "max_hp": CRAPIT_MAX_HP,
		"timer": 0.0, "flash_dur": 0.12, "dissolve_dur": 0.42, "seed": randf()
	})
	_spawn_damage_text("💥 -%d HP!" % int(amount), Vector2(crapit_x + randf_range(-15.0, 15.0), crapit_y - 75.0), Color("#ffd166"))

	if crapit_hp <= 0.0:
		crapit_is_dead = true
		crapit_death_timer = 0.0
		crapit_state = "DEAD"
		# Boss chết -> Toàn bộ tướng ngừng đánh Boss, rơi Cổ Vật 30x30px với hiệu ứng chói lóa
		vargost_retaliate_boss = false
		aoda_retaliate_boss = false
		boss_loot_drop["x"] = crapit_x
		boss_loot_drop["y"] = crapit_y
		boss_loot_drop["locked_picker_id"] = attacker_id
		boss_loot_drop["carrier_id"] = ""
		boss_loot_drop["is_free_for_all"] = false
		boss_loot_drop["is_delivered"] = false
		boss_loot_drop["shine_timer"] = 0.0
		boss_loot_drop["active"] = true
		var killer_name := "Vargost (Team 1)" if attacker_id == "vargost" else "Aoda (Team 2)"
		show_toast("💀 BOSS CRAPIT BỊ TIÊU DIỆT BỞI %s! Cổ Vật rơi xuống với ánh sáng chói lóa!" % killer_name)

func _spawn_crapit_saliva_orb(target_id: String) -> void:
	var pin1_world_x := crapit_x + CRAPIT_PIN1_OFFSET.x * CRAPIT_DISPLAY_SCALE * crapit_facing
	var pin1_world_y := crapit_y + CRAPIT_PIN1_OFFSET.y * CRAPIT_DISPLAY_SCALE
	var box2_world_x := crapit_x + CRAPIT_BOX2_OFFSET.x * CRAPIT_DISPLAY_SCALE * crapit_facing
	var box2_world_y := crapit_y + CRAPIT_BOX2_OFFSET.y * CRAPIT_DISPLAY_SCALE

	active_crapit_projectiles.append({
		"x": pin1_world_x,
		"y": pin1_world_y,
		"pin1_x": pin1_world_x,
		"pin1_y": pin1_world_y,
		"box2_x": box2_world_x,
		"box2_y": box2_world_y,
		"stage": "SLIDE_MOUTH", # SLIDE_MOUTH (Pin #1 -> Box #2) -> HOMING_FLIGHT (500px/s)
		"slide_timer": 0.0,
		"slide_duration": 0.06,
		"target_id": target_id,
		"speed": CRAPIT_PROJ_SPEED,
		"size": CRAPIT_ORB_SIZE,
		"frame_index": 0,
		"frame_timer": 0.0,
		"total_frames": 122,
		"spin_angle": 0.0,
		"time": 0.0
	})

func _spawn_crapit_explosion(x: float, y: float) -> void:
	active_crapit_explosions.append({
		"x": x,
		"y": y,
		"size": CRAPIT_EXP_SIZE,
		"frame_index": 0,
		"frame_timer": 0.0,
		"total_frames": 6
	})

func _update_crapit(dt: float) -> void:
	if crapit_hit_flash > 0.0:
		crapit_hit_flash -= dt
		if crapit_mat:
			var flash_intensity := clampf(crapit_hit_flash / 0.18, 0.0, 1.0)
			var flash_col := Color.WHITE if int(Time.get_ticks_msec() / 25) % 2 == 0 else Color("#ff4d4d")
			crapit_mat.set_shader_parameter("hit_flash", flash_intensity)
			crapit_mat.set_shader_parameter("flash_color", flash_col)
	else:
		if crapit_mat:
			crapit_mat.set_shader_parameter("hit_flash", 0.0)

	if not crapit_is_dead:
		if crapit_attack_cooldown > 0.0:
			crapit_attack_cooldown = maxf(0.0, crapit_attack_cooldown - dt)

		var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
		var v_in_sword := Vector2(vargost_x, vargost_y + v_hover).distance_to(Vector2(SWORD_X, SWORD_Y - 20.0)) <= SWORD_CAPTURE_RADIUS
		var a_in_sword := (not aoda_is_dead) and (Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y - 20.0)) <= SWORD_CAPTURE_RADIUS)

		if crapit_state == "IDLE":
			crapit_frame_timer += dt
			if crapit_frame_timer >= 0.08:
				crapit_frame_timer -= 0.08
				crapit_frame_index = (crapit_frame_index + 1) % 5 # Loop frame 0..4 khi đứng chờ

			if crapit_attack_cooldown <= 0.0 and (a_in_sword or v_in_sword):
				crapit_locked_target_ids.clear()
				if a_in_sword:
					crapit_locked_target_ids.append("aoda")
				if v_in_sword:
					crapit_locked_target_ids.append("vargost")

				crapit_state = "WINDUP"
				crapit_frame_index = 5 # Frame 5-7: Chuẩn bị tung skill
				crapit_frame_timer = 0.0
		elif crapit_state == "WINDUP":
			crapit_frame_timer += dt
			if crapit_frame_timer >= 0.075:
				crapit_frame_timer -= 0.075
				crapit_frame_index += 1
				if crapit_frame_index == 8:
					for tid in crapit_locked_target_ids:
						_spawn_crapit_saliva_orb(tid)
					crapit_frame_index = 8
					crapit_state = "RELEASE"
		elif crapit_state == "RELEASE":
			crapit_frame_timer += dt
			if crapit_frame_timer >= 0.07:
				crapit_frame_timer -= 0.07
				crapit_frame_index += 1
				if crapit_frame_index > 21:
					crapit_frame_index = 0
					crapit_state = "IDLE"
					# Ngắt quãng 5.0s - 7.0s trước đợt tấn công tiếp theo
					crapit_attack_cooldown = randf_range(5.0, 7.0)
	else:
		crapit_death_timer += dt
		if crapit_death_timer >= 0.2 and crapit_death_timer < 1.8 and randf() < 0.55:
			var dis_prog := clampf((crapit_death_timer - 0.2) / 1.6, 0.0, 1.0)
			var rise_y := -20.0 * dis_prog * (MAP_SCALE / 2.625)
			ember_particles.append({
				"x": crapit_x + randf_range(-25.0, 25.0),
				"y": crapit_y - randf_range(0.0, 85.0) + rise_y,
				"vx": randf_range(-40.0, 40.0),
				"vy": randf_range(-65.0, -25.0),
				"size": 3.5 if randf() < 0.4 else 2.0,
				"alpha": maxf(0.0, 1.0 - dis_prog),
				"color": Color("#ffffff") if randf() < 0.4 else (Color("#7ee787") if randf() < 0.7 else Color("#58a6ff")),
				"life": 0.45
			})

	# Cập nhật Quả Cầu Nước Bọt 30x30 (active_crapit_projectiles)
	var orb_to_remove: Array[Dictionary] = []
	for cp in active_crapit_projectiles:
		cp["time"] = float(cp["time"]) + dt
		cp["spin_angle"] = float(cp["spin_angle"]) + 12.0 * dt
		cp["frame_timer"] = float(cp["frame_timer"]) + dt
		if float(cp["frame_timer"]) >= 0.04:
			cp["frame_timer"] = float(cp["frame_timer"]) - 0.04
			cp["frame_index"] = (int(cp["frame_index"]) + 1) % int(cp["total_frames"])

		if cp["stage"] == "SLIDE_MOUTH":
			cp["slide_timer"] = float(cp["slide_timer"]) + dt
			var p := clampf(float(cp["slide_timer"]) / float(cp["slide_duration"]), 0.0, 1.0)
			cp["x"] = lerpf(float(cp["pin1_x"]), float(cp["box2_x"]), p)
			cp["y"] = lerpf(float(cp["pin1_y"]), float(cp["box2_y"]), p)
			if p >= 1.0:
				cp["stage"] = "HOMING_FLIGHT"
			continue

		var tgt_id: String = str(cp["target_id"])
		var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
		var tgt_pos := Vector2(aoda_x, aoda_y - 36.0) if tgt_id == "aoda" else Vector2(vargost_x, (vargost_y + v_hover) - 32.0)
		var is_tgt_dead := aoda_is_dead if tgt_id == "aoda" else false
		if is_tgt_dead:
			_spawn_crapit_explosion(float(cp["x"]), float(cp["y"]))
			orb_to_remove.append(cp)
			continue

		var prev_pos := Vector2(float(cp["x"]), float(cp["y"]))
		var to_tgt := tgt_pos - prev_pos
		var dist := to_tgt.length()
		var step := float(cp["speed"]) * dt
		if dist > 0.001:
			var next_pos := prev_pos + (to_tgt / dist) * minf(step, dist)
			cp["x"] = next_pos.x
			cp["y"] = next_pos.y
		var curr_pos := Vector2(float(cp["x"]), float(cp["y"]))

		# QUY TẮC ĐỊA HÌNH: Xuyên qua Zone 2 (index 1), NHƯNG bị cản bởi Zone 1 (index 0) và Zone 3 (index 2)
		var env_hit: Variant = _raycast_env(prev_pos, curr_pos, [0, 2])
		if env_hit != null:
			var hit_pt: Vector2 = env_hit
			_spawn_crapit_explosion(hit_pt.x, hit_pt.y)
			orb_to_remove.append(cp)
			continue

		# Chạm mục tiêu -> Phát nổ 40x40, trừ 15 HP, gán Cấm Hồi Máu (Anti-Heal) và kích hoạt phản xạ đánh trả Boss!
		if dist <= step + 18.0:
			_spawn_crapit_explosion(tgt_pos.x, tgt_pos.y)
			_spawn_hit_impact(tgt_pos.x, tgt_pos.y, -1.0)
			if tgt_id == "aoda":
				var prev_a_hp := aoda_hp
				aoda_hp = maxf(0.0, aoda_hp - CRAPIT_ATTACK_DAMAGE)
				aoda_hit_flash = 0.35
				aoda_anti_heal = true
				aoda_retaliate_boss = true
				aoda_damage_ghosts.append({
					"from_hp": prev_a_hp, "to_hp": aoda_hp, "max_hp": AODA_MAX_HP,
					"timer": 0.0, "flash_dur": 0.12, "dissolve_dur": 0.42, "seed": randf()
				})
				_spawn_damage_text("💧 -15 HP · 🚫 CẤM HỒI MÁU!", Vector2(aoda_x, aoda_y - 78.0), Color("#ff7b72"))
				if aoda_hp <= 0.0:
					aoda_is_dead = true
					aoda_death_timer = 0.0
					aoda_state = "KO"
					aoda_frame_index = 46
				else:
					show_toast("💧 Boss Crapit bắn trúng Aoda (-15 HP, Cấm Hồi Máu)! Aoda phản xạ đánh trả Boss!")
			else:
				var prev_v_hp := vargost_hp
				vargost_hp = maxf(10.0, vargost_hp - CRAPIT_ATTACK_DAMAGE)
				vargost_hit_flash = 0.35
				vargost_anti_heal = true
				vargost_retaliate_boss = true
				vargost_damage_ghosts.append({
					"from_hp": prev_v_hp, "to_hp": vargost_hp, "max_hp": VARGOST_MAX_HP,
					"timer": 0.0, "flash_dur": 0.12, "dissolve_dur": 0.42, "seed": randf()
				})
				_spawn_damage_text("💧 -15 HP · 🚫 CẤM HỒI MÁU!", Vector2(vargost_x, (vargost_y + v_hover) - 65.0), Color("#ff7b72"))
				show_toast("💧 Boss Crapit bắn trúng Vargost (-15 HP, Cấm Hồi Máu)! Vargost phản xạ đánh trả Boss!")

			orb_to_remove.append(cp)
			continue

		if float(cp["time"]) > 5.0:
			orb_to_remove.append(cp)

	for cp in orb_to_remove:
		active_crapit_projectiles.erase(cp)

	# Cập nhật Hiệu ứng Nổ 40x40 của Boss Crapit (active_crapit_explosions)
	var exp_to_remove: Array[Dictionary] = []
	for ce in active_crapit_explosions:
		ce["frame_timer"] = float(ce["frame_timer"]) + dt
		if float(ce["frame_timer"]) >= 0.065:
			ce["frame_timer"] = float(ce["frame_timer"]) - 0.065
			ce["frame_index"] = int(ce["frame_index"]) + 1
			if int(ce["frame_index"]) >= int(ce["total_frames"]):
				exp_to_remove.append(ce)
	for ce in exp_to_remove:
		active_crapit_explosions.erase(ce)

# -------------------------------------------------------------
# PROJECTILES & EXPLOSIONS
# -------------------------------------------------------------
func _update_projectiles(dt: float) -> void:
	var to_remove: Array[Dictionary] = []
	for p in active_projectiles:
		p["life"] = float(p["life"]) - dt
		var prev_pos := Vector2(float(p["x"]), float(p["y"]))
		p["x"] = float(p["x"]) + float(p["vx"]) * dt
		p["y"] = float(p["y"]) + float(p["vy"]) * dt
		var curr_pos := Vector2(float(p["x"]), float(p["y"]))

		p["spin_timer"] = float(p["spin_timer"]) + dt
		if p["spin_timer"] >= 0.035:
			p["spin_timer"] -= 0.035
			p["spin_frame"] = (int(p["spin_frame"]) + 1) % 8

		# Va chạm với Boss Crapit khi Vargost đang phản công Boss (trước khi kiểm tra địa hình Zone 3 vì Boss đứng sát Zone 3)
		if vargost_retaliate_boss and not crapit_is_dead:
			var crapit_pos := Vector2(crapit_x, crapit_y - 35.0)
			if curr_pos.distance_to(crapit_pos) < 60.0:
				_spawn_hit_impact(crapit_pos.x, crapit_pos.y, signf(float(p["vx"])))
				_damage_crapit_boss(135.0, "vargost")
				_spawn_explosion(crapit_pos.x, crapit_pos.y)
				to_remove.append(p)
				continue

		# Va chạm với Địa hình (Vách đá Scene 1, 2, 3)
		var env_hit: Variant = _raycast_env(prev_pos, curr_pos)
		if env_hit != null or _is_point_in_env(curr_pos):
			var hit_pt: Vector2 = env_hit if env_hit != null else curr_pos
			_spawn_explosion(hit_pt.x, hit_pt.y)
			_spawn_hit_impact(hit_pt.x, hit_pt.y, signf(float(p["vx"])))
			to_remove.append(p)
			continue

		# Va chạm với Aoda
		if not aoda_is_dead:
			var target_pos := Vector2(aoda_x, aoda_y - 45.0)
			if curr_pos.distance_to(target_pos) < 55.0:
				_spawn_hit_impact(aoda_x, aoda_y - 45.0)
				_damage_aoda(45.0)
				_spawn_explosion(aoda_x, aoda_y)
				to_remove.append(p)
				continue

		if p["life"] <= 0.0 or p["x"] < -100.0 or p["x"] > 2020.0:
			to_remove.append(p)

	for p in to_remove:
		active_projectiles.erase(p)

func _damage_vargost(amount: float) -> void:
	var prev_hp := vargost_hp
	vargost_hp = maxf(10.0, vargost_hp - amount)
	vargost_hit_flash = 0.35
	var h_off := sin(vargost_hover_timer * 3.2) * 8.0
	_spawn_damage_text("-25 HP", Vector2(vargost_x, vargost_y + h_off - 55.0), Color("#79c0ff"))
	vargost_damage_ghosts.append({
		"from_hp": prev_hp, "to_hp": vargost_hp, "max_hp": VARGOST_MAX_HP,
		"timer": 0.0, "flash_dur": 0.12, "dissolve_dur": 0.42, "seed": randf()
	})

func _damage_aoda(amount: float) -> void:
	var prev_hp := aoda_hp
	aoda_hp = maxf(0.0, aoda_hp - amount)
	aoda_hit_flash = 0.35
	_spawn_damage_text("💥 -45 HP!", Vector2(aoda_x, aoda_y - 65.0), Color("#ff4444"))
	aoda_damage_ghosts.append({
		"from_hp": prev_hp, "to_hp": aoda_hp, "max_hp": AODA_MAX_HP,
		"timer": 0.0, "flash_dur": 0.12, "dissolve_dur": 0.42, "seed": randf()
	})
	if aoda_hp <= 0.0:
		aoda_is_dead = true
		aoda_death_timer = 0.0
		aoda_state = "KO"
		aoda_frame_index = 46
		show_toast("💀 Aoda trúng đòn gục ngã (KO)!")

func _spawn_explosion(x: float, y: float) -> void:
	active_explosions.append({
		"x": x,
		"y": y,
		"frame": 0,
		"timer": 0.0
	})

func _update_explosions(dt: float) -> void:
	var to_remove: Array[Dictionary] = []
	for exp in active_explosions:
		exp["timer"] = float(exp["timer"]) + dt
		if exp["timer"] >= 0.03:
			exp["timer"] -= 0.03
			exp["frame"] = int(exp["frame"]) + 1
			if exp["frame"] >= 91:
				to_remove.append(exp)
	for exp in to_remove:
		active_explosions.erase(exp)

func _spawn_damage_text(txt: String, pos: Vector2, col: Color) -> void:
	active_damage_texts.append({
		"text": txt,
		"x": pos.x,
		"y": pos.y,
		"color": col,
		"alpha": 1.0
	})

func _update_damage_ghosts(dt: float) -> void:
	var to_remove_texts: Array[Dictionary] = []
	for t in active_damage_texts:
		t["y"] = float(t["y"]) - 50.0 * dt
		t["alpha"] = float(t["alpha"]) - dt * 1.4
		if float(t["alpha"]) <= 0.0:
			to_remove_texts.append(t)
	for t in to_remove_texts:
		active_damage_texts.erase(t)

	var to_remove_v: Array[Dictionary] = []
	for g in vargost_damage_ghosts:
		g["timer"] = float(g["timer"]) + dt
		if float(g["timer"]) >= 0.54:
			to_remove_v.append(g)
	for g in to_remove_v:
		vargost_damage_ghosts.erase(g)

	var to_remove_a: Array[Dictionary] = []
	for g in aoda_damage_ghosts:
		g["timer"] = float(g["timer"]) + dt
		if float(g["timer"]) >= 0.54:
			to_remove_a.append(g)
	for g in to_remove_a:
		aoda_damage_ghosts.erase(g)

	var to_remove_c: Array[Dictionary] = []
	for g in crapit_damage_ghosts:
		g["timer"] = float(g["timer"]) + dt
		if float(g["timer"]) >= 0.54:
			to_remove_c.append(g)
	for g in to_remove_c:
		crapit_damage_ghosts.erase(g)

func _spawn_hit_impact(x: float, y: float, knock_dir: float = 1.0) -> void:
	active_hit_impacts.append({
		"x": x,
		"y": y,
		"life": 0.18,
		"max_life": 0.18,
		"knock_dir": knock_dir,
		"rotation": randf_range(-0.2, 0.2)
	})
	var scale_factor := MAP_SCALE / 2.625
	for i in range(24):
		var angle := (PI * 2.0 * float(i)) / 24.0 + randf_range(-0.25, 0.25)
		var spd := randf_range(180.0, 500.0) * scale_factor
		var p_col := Color("#ffffff") if randf() < 0.35 else (Color("#ffd166") if randf() < 0.7 else Color("#ff4500"))
		ember_particles.append({
			"x": x,
			"y": y,
			"vx": cos(angle) * spd + knock_dir * 85.0,
			"vy": sin(angle) * spd - 60.0,
			"size": 4.5 if randf() < 0.35 else (3.0 if randf() < 0.7 else 2.0),
			"alpha": 1.0,
			"color": p_col,
			"life": randf_range(0.28, 0.46)
		})

func _update_hit_impacts(dt: float) -> void:
	var to_remove: Array[Dictionary] = []
	for imp in active_hit_impacts:
		imp["life"] = float(imp["life"]) - dt
		if float(imp["life"]) <= 0.0:
			to_remove.append(imp)
	for imp in to_remove:
		active_hit_impacts.erase(imp)

# -------------------------------------------------------------
# CƠ CHẾ CHIẾM GIỮ THÁNH KIẾM (KHÔNG VẼ VÒNG TRÒN UI)
# -------------------------------------------------------------
func _update_capture(dt: float) -> void:
	if match_winner != 0:
		# Giữ nguyên trạng thái chiến thắng, TUYỆT ĐỐI KHÔNG TỰ ĐỘNG RESET TRẬN ĐẤU khi đang giao tranh!
		return

	var hover_offset := sin(vargost_hover_timer * 3.2) * 8.0
	var v_in_zone := Vector2(vargost_x, vargost_y + hover_offset).distance_to(Vector2(SWORD_X, SWORD_Y - 20.0)) <= SWORD_CAPTURE_RADIUS
	var a_in_zone := (!aoda_is_dead) and (Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y - 20.0)) <= SWORD_CAPTURE_RADIUS)

	if v_in_zone and a_in_zone:
		is_contested = true
		ui_status.text = "⚠️ TRANH CHẤP CỨ ĐIỂM! [%.1fs / 20.0s]" % capture_timer
		ui_status.add_theme_color_override("font_color", Color("#ff9800"))
	elif a_in_zone and not v_in_zone:
		is_contested = false
		if capture_team != 2:
			capture_team = 2
			capture_timer = 0.0
		capture_timer = minf(CAPTURE_TARGET, capture_timer + dt)
		ui_status.text = "🔴 TEAM 2 (Aoda) ĐANG CHIẾM: %.1fs / 20.0s" % capture_timer
		ui_status.add_theme_color_override("font_color", Color("#ff7b72"))
		if capture_timer >= CAPTURE_TARGET:
			match_winner = 2
			ui_status.text = "🏆 TEAM 2 (AODA) CHIẾN THẮNG TRẬN ĐẤU! (20.0s / 20.0s)"
			show_toast("🏆 TEAM 2 (AODA) CHIẾN THẮNG TRẬN ĐẤU!")
	elif v_in_zone and not a_in_zone:
		is_contested = false
		if capture_team != 1:
			capture_team = 1
			capture_timer = 0.0
		capture_timer = minf(CAPTURE_TARGET, capture_timer + dt)
		ui_status.text = "🔵 TEAM 1 (Vargost) ĐANG CHIẾM: %.1fs / 20.0s" % capture_timer
		ui_status.add_theme_color_override("font_color", Color("#58a6ff"))
		if capture_timer >= CAPTURE_TARGET:
			match_winner = 1
			ui_status.text = "🏆 TEAM 1 (VARGOST) CHIẾN THẮNG TRẬN ĐẤU! (20.0s / 20.0s)"
			show_toast("🏆 TEAM 1 (VARGOST) CHIẾN THẮNG TRẬN ĐẤU!")
	else:
		is_contested = false
		capture_timer = maxf(0.0, capture_timer - dt * 0.5)
		if capture_timer <= 0.0:
			capture_team = 0
			ui_status.text = "⚔️ Cứ Điểm Trống · Chưa Ai Chiếm"
			ui_status.add_theme_color_override("font_color", Color("#ffffff"))

	ui_bar.value = capture_timer

func _reset_match() -> void:
	capture_timer = 0.0
	capture_team = 0
	is_contested = false
	match_winner = 0
	vargost_spawn_freeze_timer = 1.0
	aoda_spawn_freeze_timer = 1.0

	active_projectiles.clear()
	active_tornadoes.clear()
	active_explosions.clear()
	active_hit_impacts.clear()
	active_crapit_projectiles.clear()
	active_crapit_explosions.clear()

	_init_positions()
	vargost_hp = VARGOST_MAX_HP
	aoda_hp = AODA_MAX_HP
	aoda_is_dead = false
	vargost_anti_heal = false
	aoda_anti_heal = false
	vargost_retaliate_boss = false
	aoda_retaliate_boss = false

	crapit_hp = CRAPIT_MAX_HP
	crapit_is_dead = false
	crapit_death_timer = 0.0
	crapit_hit_flash = 0.0
	crapit_state = "IDLE"
	crapit_frame_index = 0
	crapit_frame_timer = 0.0
	crapit_attack_cooldown = 5.5
	crapit_locked_target_id = ""
	crapit_damage_ghosts.clear()
	crapit_last_hit_by = ""
	boss_loot_drop["active"] = false
	boss_loot_drop["locked_picker_id"] = ""
	boss_loot_drop["carrier_id"] = ""
	boss_loot_drop["is_free_for_all"] = false
	boss_loot_drop["is_delivered"] = false
	show_toast("🔄 Khởi động hiệp đấu mới (Boss Crapit 2150 HP tại (1164, 752))!")

# -------------------------------------------------------------
# RENDER TẤT CẢ PHẦN TỬ LÊN MÀN HÌNH (GOTHIC RPG HEALTH BARS, NO CIRCLE)
# -------------------------------------------------------------
func _draw() -> void:
	# 1. Nền trời xanh map bao phủ
	draw_rect(Rect2(0, 0, 1920, 1080), Color("78a6cf"))

	# 2. Bản đồ địa hình 1920x1080 tràn viền
	if map_texture != null:
		draw_texture_rect(map_texture, Rect2(0.0, MAP_Y, 1920.0, 352.0 * MAP_SCALE), false)

	# 2.1 Vẽ Cổ Vật Boss rơi trên mặt đất (30x30px) + Hiệu ứng chói lóa
	_draw_boss_loot_drop(self)

	# 3. Vẽ Red Tornado (85px kèm quét sàn 2.0s theo 1 đường thẳng)
	_draw_tornadoes()

	# 4. Vẽ Projectile Blazing Halo (1100 px/s)
	_draw_projectiles()

	# 5. Vẽ Explosion VFX (Nổ mặt đất/vách đá nằm dưới nhân vật như Single Source of Truth Web Tool)
	_draw_explosions()

func _draw_ui_layer(canvas: CanvasItem) -> void:
	# 1. Vẽ Hit Impact VFX (Kim cương 4 cánh Cross Spark & Vòng Shockwave bùng nổ trên người)
	_draw_hit_impacts(canvas)

	# 2. Vẽ Hạt Tàn Tro Pixel Lửa (Ember Particles)
	_draw_ember_particles(canvas)

	# 3. Thanh Tiến Trình Chiếm Giữ Thánh Kiếm Bay Nổi Trên Platform 2 (Khớp 100% Web Tool)
	_draw_sword_capture_bar(canvas)

	# 4. Vẽ Thanh Máu Gothic RPG Chuẩn Xác Trên Đầu Nhân Vật (Chuẩn Chiều Cao 10px Sát Đầu, 2 Dòng Nhãn, Damage Ghost)
	_draw_gothic_health_bars(canvas)

	# 5. Vẽ Số Sát Thương Bay Lên
	_draw_damage_texts(canvas)

func _draw_sword_capture_bar(canvas: CanvasItem) -> void:
	if capture_timer > 0.0 or is_contested:
		var bar_w := 130.0
		var bar_h := 12.0
		var bar_x := SWORD_X - bar_w / 2.0
		var bar_y := SWORD_Y - 148.0 # Nâng cao hẳn 148px tránh đè lên thanh máu của bất kỳ nhân vật nào đứng ở bệ
		var prog := clampf(capture_timer / CAPTURE_TARGET, 0.0, 1.0)

		# Nền đen bán trong suốt
		canvas.draw_rect(Rect2(bar_x - 2, bar_y - 2, bar_w + 4, bar_h + 4), Color(0.04, 0.05, 0.08, 0.88))

		# Ruột tiến trình chiếm giữ
		var fill_col := Color("#f0883e") if is_contested else (Color("#58a6ff") if capture_team == 1 else Color("#ff7b72"))
		if prog > 0.001:
			canvas.draw_rect(Rect2(bar_x, bar_y, bar_w * prog, bar_h), fill_col)

		# Viền kim loại hoàng gia vàng #d29922
		canvas.draw_rect(Rect2(bar_x - 2, bar_y - 2, bar_w + 4, bar_h + 4), Color("#d29922"), false, 1.5)

		# Chữ số hiển thị tiến trình
		var default_font := ThemeDB.fallback_font
		var time_str := "⚔️ %.1fs / 20.0s" % capture_timer
		canvas.draw_string(default_font, Vector2(SWORD_X - 100.0, bar_y - 5.0), time_str, HORIZONTAL_ALIGNMENT_CENTER, 200, 11, Color.WHITE)

func _draw_tornado_windup_preview() -> void:
	if aoda_state == "SKILL_1_WINDUP":
		var windup_prog := clampf(float(aoda_frame_index - 24) / 5.0, 0.0, 1.0)
		var preview_x: float = aoda_x + aoda_facing * 120.0
		if not aoda_is_dead and absf(vargost_x - aoda_x) < 550.0:
			preview_x = vargost_x
		var preview_y: float = aoda_y
		var sc := MAP_SCALE / 2.625

		var rx := 28.0 * windup_prog * sc
		var ry := 9.0 * windup_prog * sc
		if rx > 1.0 and ry > 1.0:
			var pts := PackedVector2Array()
			for i in range(24):
				var ang := float(i) * TAU / 24.0
				pts.append(Vector2(preview_x + cos(ang) * rx, preview_y + sin(ang) * ry))
			draw_colored_polygon(pts, Color(1.0, 0.24, 0.0, 0.22 * windup_prog))
			draw_polyline(pts, Color(1.0, 0.24, 0.0, 0.4 + 0.55 * windup_prog), 2.0)

func _draw_trajectory_line() -> void:
	if vargost_state == "HALO_WINDUP":
		var start_pt := Vector2(vargost_x + 20.0 * vargost_facing, vargost_y - 20.0)
		var end_pt := Vector2(vargost_target_air_x, vargost_target_air_y)
		var line_col := Color(0.93, 0.54, 0.21, 0.65)
		draw_dashed_line(start_pt, end_pt, line_col, 2.0, 8.0)

		# Tâm ngắm (Aim Reticle) tại mục tiêu
		var reticle_radius := 26.0
		draw_arc(end_pt, reticle_radius, 0.0, TAU, 32, line_col, 2.0)
		draw_line(Vector2(end_pt.x - 10.0, end_pt.y), Vector2(end_pt.x + 10.0, end_pt.y), line_col, 2.0)
		draw_line(Vector2(end_pt.x, end_pt.y - 10.0), Vector2(end_pt.x, end_pt.y + 10.0), line_col, 2.0)

func _draw_hit_impacts(canvas: CanvasItem) -> void:
	var scale_factor := MAP_SCALE / 2.625
	for imp in active_hit_impacts:
		var life: float = float(imp["life"])
		var max_life: float = float(imp["max_life"])
		var t := 1.0 - (life / max_life)
		var alpha := maxf(0.0, 1.0 - t)
		var pos := Vector2(float(imp["x"]), float(imp["y"]))
		var rot: float = float(imp["rotation"])

		canvas.draw_set_transform(pos, rot, Vector2.ONE)

		# 0. Impact Flash Burst Disc
		if t < 0.45:
			var burst_alpha := (1.0 - t / 0.45) * alpha
			canvas.draw_circle(Vector2.ZERO, (20.0 * (t / 0.45)) * scale_factor, Color(1, 1, 1, burst_alpha * 0.95))

		# 1. Shockwave bùng nở
		var wave_radius := (10.0 + t * 68.0) * scale_factor
		var wave_col := Color(1.0, 0.92, 0.75, alpha * 0.9)
		var line_w := maxf(1.5, (4.5 - t * 3.5) * scale_factor)
		canvas.draw_arc(Vector2.ZERO, wave_radius, 0.0, TAU, 32, wave_col, line_w)

		# 2. Cross Spark (Kim cương 4 cánh)
		var spark_scale := (t / 0.3) if (t < 0.3) else (1.0 - (t - 0.3) / 0.7)
		var arm_len_x := (75.0 * spark_scale) * scale_factor
		var arm_len_y := (52.0 * spark_scale) * scale_factor

		_draw_cross_spark(canvas, arm_len_x * 1.15, arm_len_y * 1.15, Color(1.0, 0.35, 0.0, alpha * 0.8))
		_draw_cross_spark(canvas, arm_len_x, arm_len_y, Color(1.0, 0.88, 0.31, alpha * 0.95))
		_draw_cross_spark(canvas, arm_len_x * 0.65, arm_len_y * 0.65, Color(1.0, 1.0, 1.0, alpha))
		canvas.draw_circle(Vector2.ZERO, 8.0 * spark_scale * scale_factor, Color(1, 1, 1, alpha))

		canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_cross_spark(canvas: CanvasItem, rx: float, ry: float, col: Color) -> void:
	var waist_x := rx * 0.12
	var waist_y := ry * 0.12
	var pts := PackedVector2Array([
		Vector2(0, -ry),
		Vector2(waist_x, -waist_y),
		Vector2(rx, 0),
		Vector2(waist_x, waist_y),
		Vector2(0, ry),
		Vector2(-waist_x, waist_y),
		Vector2(-rx, 0),
		Vector2(-waist_x, -waist_y)
	])
	canvas.draw_colored_polygon(pts, col)

func _draw_ember_particles(canvas: CanvasItem) -> void:
	for ep in ember_particles:
		var col: Color = ep["color"]
		col.a = float(ep["alpha"])
		var sz: float = float(ep["size"])
		canvas.draw_rect(Rect2(float(ep["x"]), float(ep["y"]), sz, sz), col)

func _draw_vargost(canvas: CanvasItem) -> void:
	if vargost_atlas_tex == null:
		return
	var anchor_offset := Vector2(-105.0, -162.0)

	# 1. Vẽ Bóng Mờ Chuyển Động (Motion Ghosts) phía sau thân Vargost
	for g in motion_ghosts:
		var g_col: int = int(g["frame"]) % 10
		var g_row: int = int(g["frame"]) / 10
		var g_src := Rect2(g_col * 200, g_row * 200, 200, 200)
		var g_pos := Vector2(float(g["x"]), float(g["y"]))
		var g_render_facing: float = float(g["facing"])
		if absf(g_render_facing) < 0.35:
			g_render_facing = 0.35 * signf(g_render_facing if g_render_facing != 0.0 else 1.0)
		canvas.draw_set_transform(g_pos, float(g["tilt"]), Vector2(g_render_facing * vargost_scale, vargost_scale))
		var g_col_mod := Color(1.0, 0.45, 0.15, float(g["alpha"]))
		canvas.draw_texture_rect_region(vargost_atlas_tex, Rect2(anchor_offset.x, anchor_offset.y, 200, 200), g_src, g_col_mod)
		canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	if vargost_dissolve_factor >= 0.99 or vargost_alpha <= 0.001:
		return

	var hover_offset := sin(vargost_hover_timer * 3.2) * 8.0
	var col := vargost_frame_index % 10
	var row := vargost_frame_index / 10
	var src_rect := Rect2(col * 200, row * 200, 200, 200)

	var draw_pos := Vector2(vargost_x, vargost_y + hover_offset)
	var render_facing: float = vargost_visual_facing
	if absf(render_facing) < 0.35:
		render_facing = 0.35 * signf(render_facing if render_facing != 0.0 else vargost_facing)
	var turn_squash_y := 1.0 + (1.0 - absf(vargost_visual_facing)) * 0.10
	canvas.draw_set_transform(draw_pos, vargost_tilt, Vector2(render_facing * vargost_scale, turn_squash_y * vargost_scale))

	var mod_color := Color(1.0, 1.0, 1.0, vargost_alpha)

	if vargost_dissolve_factor > 0.04:
		# HIỆU ỨNG DỊCH CHUYỂN TỨC THỜI (PIXEL DISSOLVE SCANLINE SLICES khớp 100% vargost-skill-test.js)
		var num_slices := 50
		var slice_h := 4.0
		for i in range(num_slices):
			var slice_y := float(i) * slice_h
			var slice_seed := (i * 37 + int(vargost_hover_timer * 35.0)) % 100
			var slice_prob := float(slice_seed) / 100.0
			if slice_prob < vargost_dissolve_factor * 0.82:
				continue
			var jitter_x := sin(float(i) * 0.9 + vargost_hover_timer * 35.0) * vargost_dissolve_factor * 16.0
			var s_rect := Rect2(src_rect.position.x, src_rect.position.y + slice_y, 200.0, slice_h)
			var d_rect := Rect2(anchor_offset.x + jitter_x, anchor_offset.y + slice_y, 200.0, slice_h)
			canvas.draw_texture_rect_region(vargost_atlas_tex, d_rect, s_rect, mod_color)

		if vargost_is_glitch_flash:
			canvas.draw_texture_rect_region(vargost_atlas_tex, Rect2(anchor_offset.x, anchor_offset.y, 200, 200), src_rect, Color(2.5, 2.5, 2.0, 0.45))
	else:
		canvas.draw_texture_rect_region(vargost_atlas_tex, Rect2(anchor_offset.x, anchor_offset.y, 200, 200), src_rect, mod_color)

	canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_aoda(canvas: CanvasItem) -> void:
	if aoda_atlases.is_empty():
		return

	# Lấy atlas index và vùng region chuẩn xác 100% từ candidate manifest (hoàn toàn triệt tiêu giật/nhấp nháy)
	var safe_idx := clampi(aoda_frame_index, 0, 92)
	var atlas_idx := safe_idx / 9
	var src_rect: Rect2
	if not aoda_manifest_frames.is_empty() and safe_idx < aoda_manifest_frames.size():
		var f_data: Dictionary = aoda_manifest_frames[safe_idx]
		atlas_idx = int(f_data.get("atlas", atlas_idx))
		var reg: Array = f_data.get("region", [0, 0, 600, 600])
		src_rect = Rect2(reg[0], reg[1], reg[2], reg[3])
	else:
		var local_idx := safe_idx % 9
		var reg_x := (local_idx % 3) * 600
		var reg_y := (local_idx / 3) * 600
		src_rect = Rect2(reg_x, reg_y, 600, 600)

	if atlas_idx >= aoda_atlases.size() or aoda_atlases[atlas_idx] == null:
		return

	var draw_y := aoda_y
	var aoda_alpha := 1.0
	if aoda_is_dead:
		if aoda_death_timer < 0.3:
			draw_y += randf_range(-2.0, 2.0)
		else:
			var dissolve_prog := clampf((aoda_death_timer - 0.3) / 1.7, 0.0, 1.0)
			draw_y += -25.0 * dissolve_prog * (MAP_SCALE / 2.625)
			aoda_alpha = maxf(0.0, 1.0 - dissolve_prog)

	if aoda_alpha <= 0.001:
		return

	var a_render_facing: float = aoda_facing
	var a_squash_y := 1.0

	# Dynamic squash & stretch cho Nhảy Parabol & Tiếp đất (đồng bộ 100% vargost-skill-test.js lines 4050-4065)
	var jump_scale_x := 1.0
	var jump_scale_y := 1.0
	if aoda_state == "JUMP":
		var jt := clampf(aoda_jump_timer / maxf(0.01, aoda_jump_duration), 0.0, 1.0)
		if jt < 0.4:
			jump_scale_y = 1.15
			jump_scale_x = 0.90
		else:
			jump_scale_y = 1.05
			jump_scale_x = 0.95
	elif aoda_state == "LANDING":
		jump_scale_y = 0.85
		jump_scale_x = 1.15

	canvas.draw_set_transform(Vector2(aoda_x, draw_y), 0.0, Vector2(a_render_facing * jump_scale_x * aoda_scale, a_squash_y * jump_scale_y * aoda_scale))
	var anchor_offset := Vector2(-333.0, -504.0)
	var mod_color := Color(1.0, 1.0, 1.0, aoda_alpha)

	canvas.draw_texture_rect_region(aoda_atlases[atlas_idx], Rect2(anchor_offset.x, anchor_offset.y, 600, 600), src_rect, mod_color)
	canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_crapit(canvas: CanvasItem) -> void:
	if crapit_boss_tex == null:
		return

	var c_safe_frame := clampi(crapit_frame_index, 0, 21)
	var c_col := c_safe_frame % 7
	var c_row := c_safe_frame / 7
	var src_rect := Rect2(c_col * CRAPIT_FRAME_W, c_row * CRAPIT_FRAME_H, CRAPIT_FRAME_W, CRAPIT_FRAME_H)
	var anchor_offset := Vector2(-CRAPIT_ANCHOR_X, -CRAPIT_ANCHOR_Y)

	if not crapit_is_dead:
		canvas.draw_set_transform(Vector2(crapit_x, crapit_y), 0.0, Vector2(crapit_facing * CRAPIT_DISPLAY_SCALE, CRAPIT_DISPLAY_SCALE))
		canvas.draw_texture_rect_region(crapit_boss_tex, Rect2(anchor_offset.x, anchor_offset.y, CRAPIT_FRAME_W, CRAPIT_FRAME_H), src_rect, Color.WHITE)
		canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	elif crapit_death_timer < 1.8:
		# KỸ THUẬT PIXEL DISSOLVE MẤT DẦN TỪ DƯỚI LÊN TRÊN RỒI BAY LÊN CAO 20PX
		if crapit_death_timer < 0.2:
			var tr_x := randf_range(-2.0, 2.0)
			var tr_y := randf_range(-2.0, 2.0)
			canvas.draw_set_transform(Vector2(crapit_x + tr_x, crapit_y + tr_y), 0.0, Vector2(crapit_facing * CRAPIT_DISPLAY_SCALE, CRAPIT_DISPLAY_SCALE))
			canvas.draw_texture_rect_region(crapit_boss_tex, Rect2(anchor_offset.x, anchor_offset.y, CRAPIT_FRAME_W, CRAPIT_FRAME_H), src_rect, Color(2.2, 2.2, 2.2, 1.0))
			canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
		else:
			var dissolve_prog := clampf((crapit_death_timer - 0.2) / 1.6, 0.0, 1.0)
			var rise_offset := -20.0 * dissolve_prog * (MAP_SCALE / 2.625)
			var global_alpha := maxf(0.0, 1.0 - dissolve_prog * 0.85)
			var num_slices := 64
			var slice_h := CRAPIT_FRAME_H / float(num_slices)

			canvas.draw_set_transform(Vector2(crapit_x, crapit_y + rise_offset), 0.0, Vector2(crapit_facing * CRAPIT_DISPLAY_SCALE, CRAPIT_DISPLAY_SCALE))
			for i in range(num_slices):
				var slice_y := float(i) * slice_h
				var bottom_ratio := float(i + 1) / float(num_slices)
				var slice_seed := float((i * 41 + int(vargost_hover_timer * 35.0)) % 100) / 100.0
				var threshold := 1.0 - dissolve_prog * 1.25
				if bottom_ratio > threshold + (slice_seed - 0.5) * 0.18:
					continue
				var jitter_x := sin(float(i) * 0.85 + vargost_hover_timer * 30.0) * dissolve_prog * 8.0
				var s_rect := Rect2(src_rect.position.x, src_rect.position.y + slice_y, CRAPIT_FRAME_W, slice_h)
				var d_rect := Rect2(anchor_offset.x + jitter_x, anchor_offset.y + slice_y, CRAPIT_FRAME_W, slice_h)
				canvas.draw_texture_rect_region(crapit_boss_tex, d_rect, s_rect, Color(1.0, 1.0, 1.0, global_alpha))
			canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_tornadoes() -> void:
	if tornado_tex == null:
		return
	for t in active_tornadoes:
		var f_idx: int = t["frame_index"]
		var col := f_idx % 4
		var row := f_idx / 4
		var src_rect := Rect2(col * 700, row * 690, 700, 690)
		var sc: float = t["scale"]
		var t_facing: float = float(t.get("facing", 1.0))
		var anim_alpha := 1.0
		if t["phase"] == "DISSIPATE":
			if f_idx == 13:
				anim_alpha = 0.8
			elif f_idx >= 14:
				anim_alpha = 0.45

		# Bỏ quầng đổ bóng/vòng lửa dưới chân theo yêu cầu người dùng

		# Sprite lốc xoáy (Anchor -360, -640 đồng bộ 100% vargost-skill-test.js)
		draw_set_transform(Vector2(t["x"], t["y"]), 0.0, Vector2(t_facing * sc, sc))
		draw_texture_rect_region(tornado_tex, Rect2(-360.0, -640.0, 700.0, 690.0), src_rect, Color(1.0, 1.0, 1.0, anim_alpha))
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_projectiles() -> void:
	if proj_tex != null:
		for p in active_projectiles:
			var col: int = p["spin_frame"]
			var src_rect := Rect2(col * 80, 0, 80, 80)
			var sz: float = p["size"]
			var draw_pos := Vector2(p["x"] - sz / 2.0, p["y"] - sz / 2.0)
			draw_texture_rect_region(proj_tex, Rect2(draw_pos.x, draw_pos.y, sz, sz), src_rect)

	# Vẽ Quả Cầu Nước Bọt 30x30 (Scrapit_vfx_skill) xoay tròn + giữ nguyên hoạt ảnh gốc
	if crapit_orb_tex != null:
		for cp in active_crapit_projectiles:
			var f_idx: int = int(cp["frame_index"]) % int(cp["total_frames"])
			var col := f_idx % 12
			var row := f_idx / 12
			var src_rect := Rect2(col * 38, row * 36, 38, 36)
			var sz: float = float(cp["size"])
			var pos := Vector2(float(cp["x"]), float(cp["y"]))

			if cp["stage"] == "SLIDE_MOUTH":
				draw_line(Vector2(float(cp["pin1_x"]), float(cp["pin1_y"])), pos, Color(0.96, 0.98, 1.0, 0.85), 5.0)

			draw_set_transform(pos, float(cp["spin_angle"]), Vector2.ONE)
			draw_texture_rect_region(crapit_orb_tex, Rect2(-sz / 2.0, -sz / 2.0, sz, sz), src_rect)
			draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_explosions() -> void:
	if explosion_tex != null:
		for exp in active_explosions:
			var f: int = exp["frame"]
			var col := f % 13
			var row := f / 13
			var src_rect := Rect2(col * 128, row * 66, 128, 66)
			var sz_w := 128.0 * 1.5
			var sz_h := 66.0 * 1.5
			var pos := Vector2(exp["x"] - sz_w / 2.0, exp["y"] - sz_h + 15.0)
			draw_texture_rect_region(explosion_tex, Rect2(pos.x, pos.y, sz_w, sz_h), src_rect)

	# Vẽ Hiệu Ứng Nổ Nước Bọt 40x40 (Scrapit_animation)
	if crapit_exp_tex != null:
		for ce in active_crapit_explosions:
			var f_idx := mini(int(ce["total_frames"]) - 1, int(ce["frame_index"]))
			var col := f_idx % 7
			var row := f_idx / 7
			var src_rect := Rect2(col * 40, row * 41, 40, 41)
			var sz: float = float(ce["size"])
			var pos := Vector2(float(ce["x"]) - sz / 2.0, float(ce["y"]) - sz / 2.0)
			draw_texture_rect_region(crapit_exp_tex, Rect2(pos.x, pos.y, sz, sz), src_rect)

# -------------------------------------------------------------
# THANH MÁU GOTHIC RPG (LÕI THỦY TINH + KHUNG KIM LOẠI XANH / ĐỎ - CHUẨN ĐỘ CAO TEST TOOL)
# -------------------------------------------------------------
func _draw_gothic_health_bars(canvas: CanvasItem) -> void:
	var v_scale := MAP_SCALE / 2.625
	var hover_offset := sin(vargost_hover_timer * 3.2) * 8.0

	# 1. Vargost Gothic Bar:
	# Đáy ống máu cách đỉnh đầu & chóp sừng (98px) đúng 10px y hệt Web Tool (line 3698-3699)!
	var v_bar_w := 80.0 * v_scale
	var v_bar_h := v_bar_w * (50.0 / 240.0) * 0.85
	var v_head_top_y := (vargost_y + hover_offset) - 98.0 * vargost_scale
	var v_top_y := v_head_top_y - v_bar_h - 10.0 * v_scale
	if vargost_alpha > 0.1:
		var v_label := "Vargost (T1) · %d/%d HP" % [int(vargost_hp), int(VARGOST_MAX_HP)]
		var v_sub := "(Bay @ 380px/s (Nghiêng 25°))"
		if vargost_state == "HALO_WINDUP":
			v_sub = "(🔥 Vận Blazing Halo)"
		elif vargost_hit_flash > 0.0:
			v_sub = "(⚡ Bị trúng đòn)"
		var v_has_loot := str(boss_loot_drop["carrier_id"]) == "vargost"
		_draw_single_gothic_bar(canvas, vargost_x, v_top_y, vargost_hp, VARGOST_MAX_HP, vargost_damage_ghosts, v_label, v_sub, "green", v_bar_w, vargost_alpha, vargost_anti_heal and not vargost_is_dead, v_has_loot)

	# 2. Aoda Gothic Bar:
	# Chiều cao 90px, đỉnh đầu cách ~72px, đáy ống máu nằm sát đầu đúng 10px!
	var a_bar_w := 75.0 * v_scale
	var a_bar_h := a_bar_w * (50.0 / 240.0) * 0.85
	var a_draw_y := aoda_y
	var a_alpha := 1.0
	if aoda_is_dead:
		if aoda_death_timer < 0.3:
			a_draw_y += randf_range(-2.0, 2.0)
		else:
			var dissolve_prog := clampf((aoda_death_timer - 0.3) / 1.7, 0.0, 1.0)
			a_draw_y += -25.0 * dissolve_prog * v_scale
			a_alpha = maxf(0.0, 1.0 - dissolve_prog)

	var a_head_top_y := a_draw_y - 72.0 * v_scale
	var a_top_y := a_head_top_y - a_bar_h - 10.0 * v_scale
	if a_alpha > 0.01:
		var a_label := "Aoda (T2) · %d/%d HP" % [int(aoda_hp), int(AODA_MAX_HP)]
		var a_sub := "(🏃 Chạy bộ (Phải ▶))" if aoda_facing > 0 else "(🏃 Chạy bộ (◀ Trái))"
		if aoda_is_dead:
			a_sub = "(💀 Đã gục)"
		elif aoda_state == "IDLE":
			a_sub = "(🛑 Thủ tĩnh tại bệ kiếm)"
		elif aoda_state == "SKILL_1_WINDUP":
			a_sub = "(🌪️ Vận lốc xoáy)"
		elif aoda_state == "JUMP":
			a_sub = "(🦘 Đang nhảy bệ)"
		elif aoda_hit_flash > 0.0:
			a_sub = "(⚡ Bị trúng đòn)"
		var a_has_loot := str(boss_loot_drop["carrier_id"]) == "aoda"
		_draw_single_gothic_bar(canvas, aoda_x, a_top_y, aoda_hp, AODA_MAX_HP, aoda_damage_ghosts, a_label, a_sub, "red", a_bar_w, a_alpha, aoda_anti_heal and not aoda_is_dead, a_has_loot)

	# 3. Boss Crapit Gothic Bar (2150 HP, đặt cách đỉnh đầu đúng 10px)
	if not crapit_is_dead or crapit_death_timer < 1.8:
		var c_bar_w := 90.0 * v_scale
		var c_bar_h := c_bar_w * (50.0 / 240.0) * 0.85
		var c_head_top_y := crapit_y - 95.0 * v_scale
		var c_top_y := c_head_top_y - c_bar_h - 10.0 * v_scale
		var c_alpha := 1.0
		if crapit_is_dead and crapit_death_timer >= 0.2:
			var dp := clampf((crapit_death_timer - 0.2) / 1.6, 0.0, 1.0)
			c_top_y += -20.0 * dp * v_scale
			c_alpha = maxf(0.0, 1.0 - dp)
		var c_label := "👑 BOSS CRAPIT · %d/%d HP" % [int(crapit_hp), int(CRAPIT_MAX_HP)]
		var c_sub := "(⏳ Hồi chiêu %.1fs · Canh Thánh Kiếm)" % crapit_attack_cooldown
		if crapit_is_dead:
			c_sub = "(💀 Tan biến từ dưới lên +20px)"
		elif crapit_state == "WINDUP":
			c_sub = "(⚠️ Chuẩn bị phun nước bọt F5-F7)"
		elif crapit_state == "RELEASE":
			c_sub = "(💧 Phun cầu nước bọt khóa mục tiêu!)"
		_draw_single_gothic_bar(canvas, crapit_x, c_top_y, crapit_hp, CRAPIT_MAX_HP, crapit_damage_ghosts, c_label, c_sub, "red", c_bar_w, c_alpha, false)

func _draw_single_gothic_bar(canvas: CanvasItem, center_x: float, top_y: float, current_hp: float, max_hp: float, ghosts: Array[Dictionary], label_text: String, sub_text: String, theme: String, custom_width: float, alpha_mod: float = 1.0, has_anti_heal: bool = false, has_loot_item: bool = false) -> void:
	var bar_w := custom_width
	var bar_h := bar_w * (50.0 / 240.0) * 0.85 # Tỷ lệ chuẩn Gothic 240x50 thanh mảnh
	var bar_x := center_x - bar_w / 2.0
	var bar_y := top_y

	# Ruột buồng máu thủy tinh bên trong (17..218, 14..30)
	var blood_x := bar_x + bar_w * (17.0 / 240.0)
	var blood_y := bar_y + bar_h * (14.0 / 50.0)
	var blood_w := bar_w * (202.0 / 240.0)
	var blood_h := bar_h * (17.0 / 50.0)

	# Lớp 1: Khung kim loại rỗng
	if tex_bar_empty != null:
		canvas.draw_texture_rect(tex_bar_empty, Rect2(bar_x, bar_y, bar_w, bar_h), false, Color(1, 1, 1, alpha_mod))
	else:
		canvas.draw_rect(Rect2(bar_x, bar_y, bar_w, bar_h), Color(0.05, 0.07, 0.09, alpha_mod))

	# Lớp 2: Dải máu lỏng hiện tại (Xanh ngọc / Đỏ máu)
	var ratio := clampf(current_hp / max_hp, 0.0, 1.0)
	var liquid_tex := tex_bar_green if theme == "green" else tex_bar_blood
	if ratio > 0.001:
		if liquid_tex != null:
			var src_w := 202.0 * ratio
			canvas.draw_texture_rect_region(liquid_tex, Rect2(blood_x, blood_y, blood_w * ratio, blood_h), Rect2(17, 14, src_w, 17), Color(1, 1, 1, alpha_mod))
		else:
			var fill_color := Color("#10f06a") if theme == "green" else Color("#ff1a1a")
			fill_color.a = alpha_mod
			canvas.draw_rect(Rect2(blood_x, blood_y, blood_w * ratio, blood_h), fill_color)

	# Lớp 3: Đoạn Máu Bị Trừ (Damage Ghosts: Sáng Lên Đột Ngột 0.12s -> Pixel Dissolve 0.42s)
	for ghost in ghosts:
		var start_ratio: float = clampf(float(ghost["to_hp"]) / float(ghost["max_hp"]), 0.0, 1.0)
		var end_ratio: float = clampf(float(ghost["from_hp"]) / float(ghost["max_hp"]), 0.0, 1.0)
		var diff_ratio := end_ratio - start_ratio
		if diff_ratio <= 0.001:
			continue

		var ghost_sx := 17.0 + 202.0 * start_ratio
		var ghost_sw := 202.0 * diff_ratio
		var ghost_dx := blood_x + blood_w * start_ratio
		var ghost_dw := blood_w * diff_ratio
		var g_timer: float = float(ghost["timer"])
		var flash_dur: float = float(ghost.get("flash_dur", 0.12))
		var dissolve_dur: float = float(ghost.get("dissolve_dur", 0.42))
		var g_seed: float = float(ghost.get("seed", 0.5))

		if g_timer < flash_dur:
			if liquid_tex != null:
				canvas.draw_texture_rect_region(liquid_tex, Rect2(ghost_dx, blood_y, ghost_dw, blood_h), Rect2(ghost_sx, 14, ghost_sw, 17), Color(1, 1, 1, alpha_mod))
			var flash_col := Color(0.9, 1.0, 0.95, 0.95 * alpha_mod) if theme == "green" else Color(1.0, 1.0, 0.9, 0.95 * alpha_mod)
			canvas.draw_rect(Rect2(ghost_dx, blood_y, ghost_dw, blood_h), flash_col)
		else:
			var g_dissolve := clampf((g_timer - flash_dur) / dissolve_dur, 0.0, 1.0)
			var p_size := 2.5
			var num_cols := int(ceil(ghost_dw / p_size))
			var num_rows := int(ceil(blood_h / p_size))

			for r in range(num_rows):
				for c in range(num_cols):
					var p_seed := float((c * 43 + r * 67 + int(g_seed * 100.0)) % 100) / 100.0
					if p_seed < g_dissolve:
						continue

					var px := ghost_dx + float(c) * p_size
					var py := blood_y + float(r) * p_size
					var pw := minf(p_size, ghost_dx + ghost_dw - px)
					var ph := minf(p_size, blood_y + blood_h - py)

					if pw <= 0.0 or ph <= 0.0:
						continue

					var s_px := ghost_sx + (float(c) * p_size / ghost_dw) * ghost_sw
					var s_py := 14.0 + (float(r) * p_size / blood_h) * 17.0
					var s_pw := (pw / ghost_dw) * ghost_sw
					var s_ph := (ph / blood_h) * 17.0

					if liquid_tex != null:
						canvas.draw_texture_rect_region(liquid_tex, Rect2(px, py, pw, ph), Rect2(s_px, s_py, s_pw, s_ph), Color(1, 1, 1, alpha_mod))
					else:
						var p_color := Color("#22c55e") if theme == "green" else Color("#ff4444")
						p_color.a = alpha_mod
						canvas.draw_rect(Rect2(px, py, pw, ph), p_color)

	# Lớp 4: Lớp kính thủy tinh phản chiếu
	if tex_bar_glass != null:
		canvas.draw_texture_rect(tex_bar_glass, Rect2(bar_x, bar_y, bar_w, bar_h), false, Color(1, 1, 1, alpha_mod))

	# Lớp 5: Nhãn tên và thông số máu phía trên thanh máu
	var default_font := ThemeDB.fallback_font
	var font_col := Color("#aff5b4") if theme == "green" else Color("#ffa657")
	font_col.a = alpha_mod
	canvas.draw_string(default_font, Vector2(center_x - 120.0, bar_y - 6.0), label_text, HORIZONTAL_ALIGNMENT_CENTER, 240, 11, font_col)

	# Nhãn trạng thái động bên dưới
	if sub_text != "":
		var sub_col := Color("#8b949e", alpha_mod)
		canvas.draw_string(default_font, Vector2(center_x - 120.0, bar_y + bar_h + 13.0), sub_text, HORIZONTAL_ALIGNMENT_CENTER, 240, 10, sub_col)

	# Lớp 6: Icon Cổ Vật Boss (Hiển thị icon nhỏ cỡ 10x10px trên thanh máu)
	if has_loot_item and crapit_loot_orb_tex != null:
		var sc := MAP_SCALE / 2.625
		var orb_sz := 10.0 * sc
		var orb_x := center_x - orb_sz / 2.0
		var orb_y := bar_y - 18.0 * sc
		canvas.draw_texture_rect(crapit_loot_orb_tex, Rect2(orb_x, orb_y, orb_sz, orb_sz), false)
		canvas.draw_rect(Rect2(orb_x - 1.0, orb_y - 1.0, orb_sz + 2.0, orb_sz + 2.0), Color(0.0, 1.0, 1.0, 0.85 * alpha_mod), false, 1.0)

	# Lớp 7: Icon Cấm Hồi Máu 10x10px (Dấu + kèm gạch chéo) nằm ở góc phải sát mép bên dưới thanh máu
	if has_anti_heal:
		var sc := MAP_SCALE / 2.625
		var icon_sz := 10.0 * sc
		var icon_x := (bar_x + bar_w) - icon_sz
		var icon_y := bar_y + bar_h + 2.0 * sc

		# Nền tối viền đỏ
		canvas.draw_rect(Rect2(icon_x, icon_y, icon_sz, icon_sz), Color(0.08, 0.02, 0.02, 0.9 * alpha_mod))
		canvas.draw_rect(Rect2(icon_x, icon_y, icon_sz, icon_sz), Color(1.0, 0.22, 0.22, alpha_mod), false, 1.0)

		# Dấu '+' đỏ tươi
		var mid_x := icon_x + icon_sz / 2.0
		var mid_y := icon_y + icon_sz / 2.0
		var bar_len := icon_sz * 0.7
		var bar_thick := maxf(1.5, 2.0 * sc)
		canvas.draw_rect(Rect2(mid_x - bar_len / 2.0, mid_y - bar_thick / 2.0, bar_len, bar_thick), Color("#ff7b72"))
		canvas.draw_rect(Rect2(mid_x - bar_thick / 2.0, mid_y - bar_len / 2.0, bar_thick, bar_len), Color("#ff7b72"))

		# Dấu gạch chéo \ trắng sắc nét
		canvas.draw_line(Vector2(icon_x + 1.5, icon_y + 1.5), Vector2(icon_x + icon_sz - 1.5, icon_y + icon_sz - 1.5), Color(1.0, 1.0, 1.0, alpha_mod), 1.2)

# ANIMATION STATUS EFFECT: DÒNG CHẢY MÁU DẤU "+" ĐỎ TỪ NHỎ ĐẾN TO
func _draw_bleeding_status_effect(canvas: CanvasItem, char_x: float, char_y: float, char_h: float, facing: float, time_sec: float) -> void:
	var sc := MAP_SCALE / 2.625
	var start_y := (char_y - char_h * sc) + char_h * sc * 0.30 # 30% thân người từ đỉnh đầu xuống
	var end_y := char_y
	var bleed_h := end_y - start_y
	const PARTICLE_COUNT := 6

	for i in range(PARTICLE_COUNT):
		var phase := fmod(time_sec * 1.6 + float(i) / float(PARTICLE_COUNT), 1.0)
		var cur_y := start_y + phase * bleed_h
		var lateral_offset := (facing * 11.0 + phase * (facing * 4.0) + sin(phase * 8.0 + time_sec * 5.0) * 2.0) * sc
		var cur_x := char_x + lateral_offset
		var p_size := (2.0 + phase * 4.5) * sc
		var alpha := (phase / 0.15) if (phase < 0.15) else ((1.0 - phase) / 0.15 if phase > 0.85 else 1.0)
		var col := Color(0.70, 0.0, 0.0, alpha * 0.95) if phase > 0.5 else Color(1.0, 0.12, 0.12, alpha * 0.95)

		var bar_thick := maxf(1.0, p_size * 0.32)
		canvas.draw_rect(Rect2(cur_x - p_size / 2.0, cur_y - bar_thick / 2.0, p_size, bar_thick), col)
		canvas.draw_rect(Rect2(cur_x - bar_thick / 2.0, cur_y - p_size / 2.0, bar_thick, p_size), col)
		if phase > 0.4 and phase < 0.8:
			canvas.draw_rect(Rect2(cur_x - bar_thick * 0.4, cur_y - bar_thick * 0.4, bar_thick * 0.8, bar_thick * 0.8), Color(1.0, 0.8, 0.8, alpha * 0.7))

# VẼ CỔ VẬT BOSS RƠI TRÊN MẶT ĐẤT (30x30px) + HIỆU ỨNG CHÓI LÓA, LÓE SÁNG
func _draw_boss_loot_drop(canvas: CanvasItem) -> void:
	if not boss_loot_drop["active"] or str(boss_loot_drop["carrier_id"]) != "":
		return
	var sc := MAP_SCALE / 2.625
	var lx := float(boss_loot_drop["x"])
	var ly := float(boss_loot_drop["y"]) - 15.0 * sc
	var sz := 30.0 * sc
	var t := float(boss_loot_drop["shine_timer"])

	# 1. Hào quang tỏa tròn
	var pulse := 0.5 + 0.5 * sin(t * 4.0)
	canvas.draw_circle(Vector2(lx, ly), (22.0 + pulse * 10.0) * sc, Color(0.0, 1.0, 1.0, 0.35 + pulse * 0.25))

	# 2. Tia sáng lóe xoay tròn
	var flare_len := (20.0 + pulse * 8.0) * sc
	var flare_thick := 2.0 * sc
	canvas.draw_set_transform(Vector2(lx, ly), t * 1.5, Vector2.ONE)
	canvas.draw_rect(Rect2(-flare_len / 2.0, -flare_thick / 2.0, flare_len, flare_thick), Color(1.0, 1.0, 1.0, 0.85))
	canvas.draw_rect(Rect2(-flare_thick / 2.0, -flare_len / 2.0, flare_thick, flare_len), Color(1.0, 1.0, 1.0, 0.85))
	canvas.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	# 3. Texture Cổ Vật 30x30
	if crapit_loot_orb_tex != null:
		canvas.draw_texture_rect(crapit_loot_orb_tex, Rect2(lx - sz / 2.0, ly - sz / 2.0, sz, sz), false)
	else:
		canvas.draw_circle(Vector2(lx, ly), sz / 2.0, Color.CYAN)

	# 4. Nhãn chữ
	var default_font := ThemeDB.fallback_font
	var label_txt := "💎 CỔ VẬT RƠI (BƯỚC VÀO ĐỂ NHẶT)"
	canvas.draw_string(default_font, Vector2(lx - 120.0, ly - 20.0 * sc), label_txt, HORIZONTAL_ALIGNMENT_CENTER, 240, 10, Color("#7ee787"))

# CẬP NHẬT CỔ VẬT BOSS, NHẶT ĐỒ & HỘ TỐNG VỀ CĂN CỨ
func _update_boss_loot_and_escort(dt: float) -> void:
	if not boss_loot_drop["active"] and str(boss_loot_drop["carrier_id"]) == "":
		return

	boss_loot_drop["shine_timer"] = float(boss_loot_drop["shine_timer"]) + dt

	var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
	var v_pos := Vector2(vargost_x, vargost_y + v_hover)
	var a_pos := Vector2(aoda_x, aoda_y)
	var pickup_rad := 45.0 * (MAP_SCALE / 2.625)

	# 1. Nhặt Cổ Vật khi rơi trên sàn
	if boss_loot_drop["active"] and str(boss_loot_drop["carrier_id"]) == "":
		var drop_pos := Vector2(float(boss_loot_drop["x"]), float(boss_loot_drop["y"]))
		var is_ffa := bool(boss_loot_drop["is_free_for_all"])
		var locked_id := str(boss_loot_drop["locked_picker_id"])

		var can_vargost: bool = not vargost_is_dead and (is_ffa or locked_id == "vargost")
		var can_aoda: bool = not aoda_is_dead and (is_ffa or locked_id == "aoda")

		if can_vargost and v_pos.distance_to(drop_pos) <= pickup_rad:
			boss_loot_drop["carrier_id"] = "vargost"
			show_toast("💎 Vargost đã nhặt được Cổ Vật! Đội 1 giảm 10% tốc độ, hộ tống về Căn Cứ Trái!")
		elif can_aoda and a_pos.distance_to(drop_pos) <= pickup_rad:
			boss_loot_drop["carrier_id"] = "aoda"
			show_toast("💎 Aoda đã nhặt được Cổ Vật! Đội 2 giảm 10% tốc độ, hộ tống về Căn Cứ Phải!")

	# 2. Kiểm tra giao Cổ Vật thành công
	if str(boss_loot_drop["carrier_id"]) == "vargost":
		if v_pos.distance_to(LEFT_EXTRACTION_POS) <= EXTRACTION_RADIUS:
			boss_loot_drop["is_delivered"] = true
			boss_loot_drop["active"] = false
			boss_loot_drop["carrier_id"] = ""
			show_toast("🏆 ĐỘI 1 ĐÃ HỘ TỐNG THÀNH CÔNG CỔ VẬT VỀ CĂN CỨ TRÁI!")
	elif str(boss_loot_drop["carrier_id"]) == "aoda":
		if a_pos.distance_to(RIGHT_EXTRACTION_POS) <= EXTRACTION_RADIUS:
			boss_loot_drop["is_delivered"] = true
			boss_loot_drop["active"] = false
			boss_loot_drop["carrier_id"] = ""
			show_toast("🏆 ĐỘI 2 ĐÃ HỘ TỐNG THÀNH CÔNG CỔ VẬT VỀ CĂN CỨ PHẢI!")

	# 3. Rơi tự do khi người mang bị chết
	if str(boss_loot_drop["carrier_id"]) == "vargost" and vargost_is_dead:
		boss_loot_drop["active"] = true
		boss_loot_drop["carrier_id"] = ""
		boss_loot_drop["is_free_for_all"] = true
		boss_loot_drop["locked_picker_id"] = ""
		boss_loot_drop["x"] = vargost_x
		boss_loot_drop["y"] = vargost_y + v_hover
		show_toast("⚠️ Vargost bị tiêu diệt! Cổ Vật rơi tự do tại chiến trường!")
	elif str(boss_loot_drop["carrier_id"]) == "aoda" and aoda_is_dead:
		boss_loot_drop["active"] = true
		boss_loot_drop["carrier_id"] = ""
		boss_loot_drop["is_free_for_all"] = true
		boss_loot_drop["locked_picker_id"] = ""
		boss_loot_drop["x"] = aoda_x
		boss_loot_drop["y"] = aoda_y
		show_toast("⚠️ Aoda bị tiêu diệt! Cổ Vật rơi tự do tại chiến trường!")

func _draw_damage_texts(canvas: CanvasItem) -> void:
	var default_font := ThemeDB.fallback_font
	for t in active_damage_texts:
		var col: Color = t["color"]
		col.a = float(t["alpha"])
		# Bóng đổ chữ
		var shadow_col := Color(0, 0, 0, col.a * 0.75)
		canvas.draw_string(default_font, Vector2(float(t["x"]) - 29.0, float(t["y"]) + 1.0), str(t["text"]), HORIZONTAL_ALIGNMENT_CENTER, 60, 20, shadow_col)
		canvas.draw_string(default_font, Vector2(float(t["x"]) - 30.0, float(t["y"])), str(t["text"]), HORIZONTAL_ALIGNMENT_CENTER, 60, 20, col)

# -------------------------------------------------------------
# CẢM ỨNG MÀN HÌNH CAN THIỆP
# -------------------------------------------------------------
func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		var click_pos: Vector2 = event.position
		# Bỏ qua click nếu chạm vào hàng nút điều khiển ở đáy màn hình
		if click_pos.y >= get_viewport_rect().size.y - 90.0:
			return

		if click_pos.y < 500.0:
			vargost_target_air_x = click_pos.x
			vargost_target_air_y = click_pos.y
			halo_locked_target = Vector2(aoda_x, aoda_y - 45.0) if not aoda_is_dead else click_pos
			vargost_state = "HALO_WINDUP"
			vargost_frame_index = 44
		else:
			if aoda_tornado_cooldown <= 0.0 and not aoda_is_dead:
				aoda_facing = 1.0 if click_pos.x > aoda_x else -1.0
				aoda_visual_facing = aoda_facing
				aoda_tornado_cooldown = 5.0
				aoda_state = "SKILL_1_WINDUP"
				aoda_frame_index = 24

