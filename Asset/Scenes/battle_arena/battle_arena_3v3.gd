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
const CAPTURE_TARGET := 15.0 # Chuẩn Hiến pháp GodWar: 15 giây liên tục để chiến thắng

# -------------------------------------------------------------
# CẤU HÌNH BỀ MẶT CÁC BỆ (Surfaces tương ứng ENV_ZONES trong test tool)
# -------------------------------------------------------------
var PLATFORMS: Dictionary = {
	"plat_1_top": {"name": "Platform 1 Top", "minX": MAP_X + 0.0 * MAP_SCALE, "maxX": MAP_X + 36.0 * MAP_SCALE, "y": MAP_Y + 226.0 * MAP_SCALE},
	"plat_1a": {"name": "Platform 1A (Sau Cây Cao)", "minX": MAP_X + 38.0 * MAP_SCALE, "maxX": MAP_X + 128.0 * MAP_SCALE, "y": MAP_Y + 260.0 * MAP_SCALE},
	"plat_1b": {"name": "Platform 1B (Bậc Thấp Trái)", "minX": MAP_X + 130.0 * MAP_SCALE, "maxX": MAP_X + 228.0 * MAP_SCALE, "y": MAP_Y + 292.0 * MAP_SCALE},
	"plat_2": {"name": "Platform 2 (Bệ Giữa - Thánh Kiếm)", "minX": MAP_X + 192.0 * MAP_SCALE, "maxX": MAP_X + 260.0 * MAP_SCALE, "y": SWORD_Y},
	"plat_3a": {"name": "Platform 3A (Vách Đá Cao)", "minX": MAP_X + 286.0 * MAP_SCALE, "maxX": MAP_X + 422.0 * MAP_SCALE, "y": MAP_Y + 100.0 * MAP_SCALE}
}

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

# Vargost State & Visuals
var vargost_x: float = MAP_X + 110.0 * MAP_SCALE # 412.5
var vargost_y: float = MAP_Y + 115.0 * MAP_SCALE # 311.25
var vargost_hover_timer: float = 0.0
var vargost_tilt: float = 0.0
var vargost_facing: float = 1.0
var vargost_visual_facing: float = 1.0
var vargost_hp: float = 1000.0
const VARGOST_MAX_HP: float = 1000.0
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
	setup_holy_sword()
	setup_top_hud()

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

func _raycast_env(p1: Vector2, p2: Vector2) -> Variant:
	var closest_hit: Variant = null
	var min_d := INF
	for poly in env_polygons:
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

func _is_point_in_env(pt: Vector2) -> bool:
	for poly in env_polygons:
		if Geometry2D.is_point_in_polygon(pt, poly):
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

func _init_positions() -> void:
	# Vargost: Xuất phát trên không bên trái
	vargost_x = MAP_X + 110.0 * MAP_SCALE
	vargost_y = MAP_Y + 115.0 * MAP_SCALE
	vargost_facing = 1.0
	vargost_visual_facing = 1.0

	# Aoda: Xuất phát bên trái sau cái cây cao (Platform 1A) y hệt Test Tool!
	aoda_cur_platform_id = "plat_1a"
	var p1a: Dictionary = PLATFORMS["plat_1a"]
	aoda_x = p1a["minX"] + 45.0
	aoda_y = p1a["y"]
	aoda_facing = 1.0
	aoda_visual_facing = 1.0
	aoda_state = "MOVE"
	aoda_frame_index = 65

func setup_holy_sword() -> void:
	sword_sprite = AnimatedSprite2D.new()
	var sword_frames := SpriteFrames.new()
	sword_frames.rename_animation("default", "idle")
	sword_frames.set_animation_speed("idle", 10.0)
	sword_frames.set_animation_loop("idle", true)

	for i in range(1, 56):
		var frame_path := "res://Asset/Character/characters/sword_objective/frames/frame_%03d.png" % i
		var tex: Texture2D = Library._load_texture_safe(frame_path)
		if tex != null:
			sword_frames.add_frame("idle", tex)

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
		halo_locked_target = Vector2(aoda_x, aoda_y - 45.0) if not aoda_is_dead else Vector2(SWORD_X, SWORD_Y - 20.0)
		show_toast("🔥 Vargost: Kích hoạt Blazing Halo (Khóa đường bay)!")

func _on_btn_tornado_pressed() -> void:
	if not aoda_is_dead:
		aoda_tornado_cooldown = 5.0
		aoda_state = "SKILL_1_WINDUP"
		aoda_frame_index = 24
		show_toast("🌪️ Aoda: Kích hoạt Red Tornado càn quét 2.0s!")

func _on_btn_turn_pressed() -> void:
	aoda_facing = -aoda_facing
	aoda_visual_facing = aoda_facing
	vargost_facing = -vargost_facing
	vargost_visual_facing = vargost_facing
	show_toast("🔄 Đổi hướng chiến đấu đối xứng Trái ⇋ Phải!")

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

	# Cập nhật Vargost, Bóng Mờ, Teleport, Aoda, Tornadoes chuẩn 100% logic Single Source of Truth
	_update_vargost(delta)
	_update_motion_ghosts(delta)
	_update_ember_particles(delta)
	_update_aoda(delta)
	_update_tornadoes(delta)
	_update_projectiles(delta)
	_update_explosions(delta)
	_update_hit_impacts(delta)
	_update_damage_ghosts(delta)
	_update_capture(delta)

	queue_redraw()

# -------------------------------------------------------------
# LOGIC VARGOST (MAGE BAY LƯỢN, BÓNG MỜ 2D, TELEPORT & BLAZING HALO 1100 px/s)
# -------------------------------------------------------------
func _update_vargost(dt: float) -> void:
	vargost_hover_timer += dt
	if vargost_hit_flash > 0.0:
		vargost_hit_flash -= dt

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

	# 1. Bay lượn chiến thuật: Vargost là XẠ THỦ TẦM XA
	# QUY TẮC HIẾN PHÁP: Nếu Aoda còn sống, Vargost giữ cự ly tầm xa an toàn [260, 480], tấn công từ xa!
	# TUYỆT ĐỐI KHÔNG bay vào bệ Thánh Kiếm khi địch đang phòng thủ! CHỈ KHI Aoda tử trận mới bay tới chiếm!
	vargost_ai_timer -= dt
	if vargost_ai_timer <= 0.0:
		vargost_ai_timer = randf_range(2.5, 4.0)
		if aoda_is_dead:
			# Kẻ địch đã gục -> Vargost bay tới bệ Thánh Kiếm chiếm cứ điểm!
			vargost_target_air_x = randf_range(SWORD_X - 50.0, SWORD_X + 50.0)
			vargost_target_air_y = randf_range(SWORD_Y - 120.0, SWORD_Y - 70.0)
		else:
			# Kẻ địch còn sống -> Vargost tuần tra không phận tầm xa [260, 480], Y [260, 360]
			vargost_target_air_x = randf_range(260.0, 480.0)
			vargost_target_air_y = randf_range(260.0, 360.0)

	# Tự động né đòn / Giữ khoảng cách an toàn: Nếu Aoda áp sát (< 300px) -> Teleport lùi giữ cự ly!
	var dist_to_aoda := Vector2(vargost_x, vargost_y).distance_to(Vector2(aoda_x, aoda_y))
	if dist_to_aoda < 300.0 and not aoda_is_dead and vargost_state == "IDLE" and not is_vargost_teleporting:
		var retreat_x := clampf(vargost_x - vargost_facing * 160.0, 180.0, 420.0)
		var retreat_y := randf_range(250.0, 340.0)
		_trigger_vargost_teleport(retreat_x, retreat_y)

	var move_vec := Vector2(vargost_target_air_x - vargost_x, vargost_target_air_y - vargost_y)
	if move_vec.length() > 8.0 and vargost_state == "IDLE" and not is_vargost_teleporting:
		var dir := move_vec.normalized()
		# QUY CHUẨN DI CHUYỂN: Nếu hướng di chuyển là LÙI (dir.x * vargost_facing < -0.2):
		# Vargost KHÔNG bay lùi ngửa người, mà kích hoạt TELEPORT LÙI (Thân đứng 0°)!
		if dir.x * vargost_facing < -0.2:
			_trigger_vargost_teleport(vargost_target_air_x, vargost_target_air_y)
		else:
			# Hướng TIẾN: Bay tiến nghiêng +25 độ ở tốc độ vừa phải chuẩn xác (~300 px/s)
			var fly_speed := 300.0
			vargost_x += dir.x * fly_speed * dt
			vargost_y += dir.y * (fly_speed * 0.6) * dt
			var target_tilt := vargost_facing * deg_to_rad(25.0)
			vargost_tilt = lerp_angle(vargost_tilt, target_tilt, dt * 10.0)

			# Sinh Bóng Mờ Chuyển Động 2D (Motion Ghosts) khi bay tiến
			ghost_spawn_timer += dt
			if ghost_spawn_timer >= 0.07:
				ghost_spawn_timer = 0.0
				var h_off := sin(vargost_hover_timer * 3.2) * 8.0
				motion_ghosts.append({
					"x": vargost_x,
					"y": vargost_y + h_off,
					"alpha": 0.45,
					"tilt": vargost_tilt,
					"facing": vargost_visual_facing,
					"frame": vargost_frame_index
				})
	else:
		vargost_tilt = lerp_angle(vargost_tilt, 0.0, dt * 8.0)

	# Nhìn về phía Aoda hoặc Thánh Kiếm (Deadzone 35px chống rung lắc lật mặt)
	var target_facing_x := aoda_x if not aoda_is_dead else SWORD_X
	if absf(target_facing_x - vargost_x) > 35.0:
		vargost_facing = 1.0 if target_facing_x > vargost_x else -1.0

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

	# 3. Kích hoạt tung chiêu Blazing Halo
	if vargost_auto_cooldown > 0.0:
		vargost_auto_cooldown -= dt
	elif not aoda_is_dead and vargost_state == "IDLE":
		vargost_state = "HALO_WINDUP"
		vargost_frame_index = 44 # Bắt đầu windup
		halo_locked_target = Vector2(aoda_x, aoda_y - 45.0)

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
	if aoda_tornado_cooldown > 0.0:
		aoda_tornado_cooldown -= dt

	# Xoay mặt Aoda siêu tốc (x3+ speed) đánh lừa thị giác
	if absf(aoda_visual_facing - aoda_facing) > 0.02:
		aoda_visual_facing = move_toward(aoda_visual_facing, aoda_facing, dt * 50.0)
	else:
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
			# Hồi sinh đầy máu tại căn cứ Platform 1A!
			aoda_is_dead = false
			aoda_death_timer = 0.0
			aoda_hp = AODA_MAX_HP
			aoda_cur_platform_id = "plat_1a"
			var p1a: Dictionary = PLATFORMS["plat_1a"]
			aoda_x = p1a["minX"] + 45.0
			aoda_y = p1a["y"]
			aoda_facing = 1.0
			aoda_visual_facing = 1.0
			aoda_state = "MOVE"
			aoda_frame_index = 65
			show_toast("✨ AODA ĐÃ HỒI SINH! Tiến về chiếm Thánh Kiếm!")
		return

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

	# 3. Utility AI: Tung chiêu Tornado CÓ CHỦ ĐÍCH NHẮM MỤC TIÊU MẶT ĐẤT
	# QUY TẮC HIẾN PHÁP & SINGLE SOURCE OF TRUTH (vargost-skill-test.js):
	# Tornado CHỈ dùng cho mục tiêu mặt đất hoặc khi đối thủ sà thấp tiếp cận bệ (< 130px chênh lệch Y).
	# TUYỆT ĐỐI KHÔNG tung Tornado khi Vargost đang bay tít trên cao -> Tránh tự đứng ngáng đường chính mình!
	var h_dist_vargost := absf(vargost_x - aoda_x)
	var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
	var vargost_cur_y := vargost_y + v_hover
	var is_vargost_ground_reachable := absf(vargost_cur_y - aoda_y) < 130.0 # Trong tầm với độ cao mặt đất
	var is_in_sword_zone := Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y)) <= SWORD_CAPTURE_RADIUS

	if aoda_tornado_cooldown <= 0.0 and aoda_state != "JUMP" and aoda_state != "LANDING":
		# CHỈ tung chiêu khi Vargost trong tầm tấn công mặt đất (< 420px) VÀ sà thấp tiếp cận bệ đá:
		if is_vargost_ground_reachable and h_dist_vargost < 420.0 and not is_vargost_teleporting:
			# Khóa hướng về phía mục tiêu trước khi tung chiêu
			aoda_facing = 1.0 if vargost_x > aoda_x else -1.0
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

		is_in_sword_zone = Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y)) <= SWORD_CAPTURE_RADIUS
		if not is_in_sword_zone:
			aoda_facing = 1.0 if SWORD_X > aoda_x else -1.0

		var plat: Dictionary = PLATFORMS.get(aoda_cur_platform_id, PLATFORMS["plat_2"])
		var step_x := aoda_facing * aoda_patrol_speed * dt
		var target_edge_x := aoda_x + step_x
		var min_ledge: float = plat["minX"] + 20.0
		var max_ledge: float = plat["maxX"] - 20.0

		if target_edge_x < min_ledge or target_edge_x > max_ledge:
			# Chạm mép bệ -> Nhảy bệ tiếp theo
			var adj: Variant = _get_adjacent_platform(aoda_cur_platform_id, aoda_facing)
			if adj != null and (!is_in_sword_zone or (aoda_facing > 0 and SWORD_X > aoda_x)):
				aoda_state = "JUMP"
				aoda_jump_timer = 0.0
				aoda_jump_duration = 0.48
				aoda_jump_start_x = aoda_x
				aoda_jump_start_y = aoda_y
				aoda_jump_target_platform_id = adj["platform_id"]
				aoda_jump_target_x = adj["target_x"]
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
		var arc := sin(t * PI) * 55.0 * (MAP_SCALE / 2.625)
		aoda_y = lerpf(aoda_jump_start_y, aoda_jump_target_y, t) - arc

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
	return null

# -------------------------------------------------------------
# RED TORNADO 85px (CÓ PHẠM VI QUÉT SÀN, VÒNG ĐỜI 3 PHA CHUẨN XÁC: EMERGE -> SPIN 2.0s -> DISSIPATE)
# Single Source of Truth: Đồng bộ 100% vargost-skill-test.js (line 1114-1135, 2948-3048)
# MIỄN NHIỄM ĐỒNG ĐỘI 100% (Friendly Fire Immunity) - Tuyệt đối không bao giờ làm hại Aoda!
# -------------------------------------------------------------
func _spawn_red_tornado(x: float, y: float, facing: float, platform_id: String) -> void:
	var plat: Dictionary = PLATFORMS.get(platform_id, PLATFORMS["plat_2"])
	var spawn_y := float(plat["y"]) # Đặt CHÍNH XÁC trên bề mặt bệ đá!

	# 1. Xác định tọa độ xuất hiện theo Single Source of Truth:
	# Nếu đối thủ Vargost đang trong tầm tấn công mặt đất -> nhắm thẳng mục tiêu Vargost!
	var v_hover := sin(vargost_hover_timer * 3.2) * 8.0
	var v_pos_y := vargost_y + v_hover
	var is_v_ground := absf(v_pos_y - y) < 130.0 and absf(vargost_x - x) < 550.0
	var spawn_x: float = x + facing * 120.0
	if is_v_ground and not is_vargost_teleporting:
		spawn_x = vargost_x

	# 2. BẢO VỆ TUYỆT ĐỐI KHÔNG BAO GIỜ SPAWN TRÙNG LÊN NGƯỜI AODA:
	if absf(spawn_x - x) < 95.0:
		spawn_x = x + facing * 120.0

	active_tornadoes.append({
		"x": spawn_x,
		"y": spawn_y,
		"facing": facing,
		"vx": facing * 140.0 * (MAP_SCALE / 2.625), # Phạm vi di chuyển càn quét về phía trước cách xa Aoda!
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

			# Di chuyển càn quét mặt sàn về phía trước liên tục (không bị khựng đứng)
			t["x"] = float(t["x"]) + float(t["vx"]) * dt

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
					# Vargost dính đòn -> Kích hoạt Teleport thoát kẹt ngay lập tức!
					var retreat_x := clampf(vargost_x - vargost_facing * 180.0, 200.0, 750.0)
					var retreat_y := randf_range(240.0, 360.0)
					_trigger_vargost_teleport(retreat_x, retreat_y)

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
				_damage_aoda(35.0)
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
	_spawn_damage_text("💥 -35 HP", Vector2(aoda_x, aoda_y - 65.0), Color("#ff4444"))
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
		match_restart_timer -= dt
		if match_restart_timer <= 0.0:
			_reset_match()
		return

	var hover_offset := sin(vargost_hover_timer * 3.2) * 8.0
	var v_in_zone := Vector2(vargost_x, vargost_y + hover_offset).distance_to(Vector2(SWORD_X, SWORD_Y - 20.0)) <= SWORD_CAPTURE_RADIUS
	var a_in_zone := (!aoda_is_dead) and (Vector2(aoda_x, aoda_y).distance_to(Vector2(SWORD_X, SWORD_Y - 20.0)) <= SWORD_CAPTURE_RADIUS)

	if v_in_zone and a_in_zone:
		is_contested = true
		ui_status.text = "⚠️ TRANH CHẤP CỨ ĐIỂM! [%.1fs / 15.0s]" % capture_timer
		ui_status.add_theme_color_override("font_color", Color("#ff9800"))
	elif a_in_zone and not v_in_zone:
		is_contested = false
		if capture_team != 2:
			capture_team = 2
			capture_timer = 0.0
		capture_timer = minf(CAPTURE_TARGET, capture_timer + dt)
		ui_status.text = "🔴 TEAM 2 (Aoda) ĐANG CHIẾM: %.1fs / 15.0s" % capture_timer
		ui_status.add_theme_color_override("font_color", Color("#ff7b72"))
		if capture_timer >= CAPTURE_TARGET:
			match_winner = 2
			match_restart_timer = 4.0
			show_toast("🏆 TEAM 2 (AODA) CHIẾN THẮNG TRẬN ĐẤU!")
	elif v_in_zone and not a_in_zone:
		is_contested = false
		if capture_team != 1:
			capture_team = 1
			capture_timer = 0.0
		capture_timer = minf(CAPTURE_TARGET, capture_timer + dt)
		ui_status.text = "🔵 TEAM 1 (Vargost) ĐANG CHIẾM: %.1fs / 15.0s" % capture_timer
		ui_status.add_theme_color_override("font_color", Color("#58a6ff"))
		if capture_timer >= CAPTURE_TARGET:
			match_winner = 1
			match_restart_timer = 4.0
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

	active_projectiles.clear()
	active_tornadoes.clear()
	active_explosions.clear()
	active_hit_impacts.clear()

	_init_positions()
	vargost_hp = VARGOST_MAX_HP
	aoda_hp = AODA_MAX_HP
	aoda_is_dead = false
	show_toast("🔄 Khởi động hiệp đấu mới!")

# -------------------------------------------------------------
# RENDER TẤT CẢ PHẦN TỬ LÊN MÀN HÌNH (GOTHIC RPG HEALTH BARS, NO CIRCLE)
# -------------------------------------------------------------
func _draw() -> void:
	# 1. Nền trời xanh map bao phủ
	draw_rect(Rect2(0, 0, 1920, 1080), Color("78a6cf"))

	# 2. Bản đồ địa hình 1920x1080 tràn viền
	if map_texture != null:
		draw_texture_rect(map_texture, Rect2(0.0, MAP_Y, 1920.0, 352.0 * MAP_SCALE), false)

	# BỎ VÒNG TRÒN KHOANH VẬT PHẨM THEO YÊU CẦU NGƯỜI DÙNG (Giữ khoảng cách, chỉ bỏ UI vòng tròn)

	# 3. Thanh Tiến Trình Chiếm Giữ Thánh Kiếm Bay Nổi Trên Platform 2 (Khớp 100% Web Tool)
	_draw_sword_capture_bar()

	# BỎ TIA NGẮM & VÒNG ĐỊNH HƯỚNG TRÊN BẢN MOBILE (Chỉ hiển thị trên test tool Web)

	# 5. Vẽ Red Tornado (85px kèm quét sàn 2.0s)
	_draw_tornadoes()

	# 7. Vẽ Vargost (Nhân vật bay lượn, bóng mờ 2D, nghiêng 25 độ)
	_draw_vargost()

	# 8. Vẽ Aoda (Nhân vật 90px chạy nhảy tuần tra bệ)
	_draw_aoda()

	# 9. Vẽ Projectile Blazing Halo (1100 px/s)
	_draw_projectiles()

	# 10. Vẽ Explosion VFX
	_draw_explosions()

	# 11. Vẽ Hit Impact VFX (Kim cương 4 cánh Cross Spark & Vòng Shockwave)
	_draw_hit_impacts()

	# 12. Vẽ Hạt Tàn Tro Pixel Lửa (Ember Particles)
	_draw_ember_particles()

	# 13. Vẽ Thanh Máu Gothic RPG Chuẩn Xác Trên Đầu Nhân Vật (Chuẩn Chiều Cao 10px Sát Đầu, 2 Dòng Nhãn, Damage Ghost)
	_draw_gothic_health_bars()

	# 14. Vẽ Số Sát Thương Bay Lên
	_draw_damage_texts()

func _draw_sword_capture_bar() -> void:
	if capture_timer > 0.0 or is_contested:
		var bar_w := 130.0
		var bar_h := 12.0
		var bar_x := SWORD_X - bar_w / 2.0
		var bar_y := SWORD_Y - 148.0 # Nâng cao hẳn 148px tránh đè lên thanh máu của bất kỳ nhân vật nào đứng ở bệ
		var prog := clampf(capture_timer / CAPTURE_TARGET, 0.0, 1.0)

		# Nền đen bán trong suốt
		draw_rect(Rect2(bar_x - 2, bar_y - 2, bar_w + 4, bar_h + 4), Color(0.04, 0.05, 0.08, 0.88))

		# Ruột tiến trình chiếm giữ
		var fill_col := Color("#f0883e") if is_contested else (Color("#58a6ff") if capture_team == 1 else Color("#ff7b72"))
		if prog > 0.001:
			draw_rect(Rect2(bar_x, bar_y, bar_w * prog, bar_h), fill_col)

		# Viền kim loại hoàng gia vàng #d29922
		draw_rect(Rect2(bar_x - 2, bar_y - 2, bar_w + 4, bar_h + 4), Color("#d29922"), false, 1.5)

		# Chữ số hiển thị tiến trình
		var default_font := ThemeDB.fallback_font
		var time_str := "⚔️ %.1fs / 15.0s" % capture_timer
		draw_string(default_font, Vector2(SWORD_X - 100.0, bar_y - 5.0), time_str, HORIZONTAL_ALIGNMENT_CENTER, 200, 11, Color.WHITE)

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

func _draw_hit_impacts() -> void:
	var scale_factor := MAP_SCALE / 2.625
	for imp in active_hit_impacts:
		var life: float = float(imp["life"])
		var max_life: float = float(imp["max_life"])
		var t := 1.0 - (life / max_life)
		var alpha := maxf(0.0, 1.0 - t)
		var pos := Vector2(float(imp["x"]), float(imp["y"]))
		var rot: float = float(imp["rotation"])

		draw_set_transform(pos, rot, Vector2.ONE)

		# 0. Impact Flash Burst Disc
		if t < 0.45:
			var burst_alpha := (1.0 - t / 0.45) * alpha
			draw_circle(Vector2.ZERO, (20.0 * (t / 0.45)) * scale_factor, Color(1, 1, 1, burst_alpha * 0.95))

		# 1. Shockwave bùng nở
		var wave_radius := (10.0 + t * 68.0) * scale_factor
		var wave_col := Color(1.0, 0.92, 0.75, alpha * 0.9)
		var line_w := maxf(1.5, (4.5 - t * 3.5) * scale_factor)
		draw_arc(Vector2.ZERO, wave_radius, 0.0, TAU, 32, wave_col, line_w)

		# 2. Cross Spark (Kim cương 4 cánh)
		var spark_scale := (t / 0.3) if (t < 0.3) else (1.0 - (t - 0.3) / 0.7)
		var arm_len_x := (75.0 * spark_scale) * scale_factor
		var arm_len_y := (52.0 * spark_scale) * scale_factor

		_draw_cross_spark(arm_len_x * 1.15, arm_len_y * 1.15, Color(1.0, 0.35, 0.0, alpha * 0.8))
		_draw_cross_spark(arm_len_x, arm_len_y, Color(1.0, 0.88, 0.31, alpha * 0.95))
		_draw_cross_spark(arm_len_x * 0.65, arm_len_y * 0.65, Color(1.0, 1.0, 1.0, alpha))
		draw_circle(Vector2.ZERO, 8.0 * spark_scale * scale_factor, Color(1, 1, 1, alpha))

		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_cross_spark(rx: float, ry: float, col: Color) -> void:
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
	draw_colored_polygon(pts, col)

func _draw_ember_particles() -> void:
	for ep in ember_particles:
		var col: Color = ep["color"]
		col.a = float(ep["alpha"])
		var sz: float = float(ep["size"])
		draw_rect(Rect2(float(ep["x"]), float(ep["y"]), sz, sz), col)

func _draw_vargost() -> void:
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
		draw_set_transform(g_pos, float(g["tilt"]), Vector2(g_render_facing * vargost_scale, vargost_scale))
		var g_col_mod := Color(1.0, 0.45, 0.15, float(g["alpha"]))
		draw_texture_rect_region(vargost_atlas_tex, Rect2(anchor_offset.x, anchor_offset.y, 200, 200), g_src, g_col_mod)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

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
	draw_set_transform(draw_pos, vargost_tilt, Vector2(render_facing * vargost_scale, turn_squash_y * vargost_scale))

	var mod_color := Color(1.0, 1.0, 1.0, vargost_alpha)
	if vargost_hit_flash > 0.0:
		mod_color = Color(3.0, 3.0, 3.0, vargost_alpha)

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
			draw_texture_rect_region(vargost_atlas_tex, d_rect, s_rect, mod_color)

		if vargost_is_glitch_flash:
			draw_texture_rect_region(vargost_atlas_tex, Rect2(anchor_offset.x, anchor_offset.y, 200, 200), src_rect, Color(2.5, 2.5, 2.0, 0.45))
	else:
		draw_texture_rect_region(vargost_atlas_tex, Rect2(anchor_offset.x, anchor_offset.y, 200, 200), src_rect, mod_color)

	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_aoda() -> void:
	if aoda_atlases.is_empty():
		return

	var atlas_idx := aoda_frame_index / 8
	var local_idx := aoda_frame_index % 8
	if atlas_idx >= aoda_atlases.size() or aoda_atlases[atlas_idx] == null:
		return

	var reg_x := (local_idx % 4) * 600
	var reg_y := (local_idx / 4) * 600
	var src_rect := Rect2(reg_x, reg_y, 600, 600)

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

	var a_render_facing: float = aoda_visual_facing
	if absf(a_render_facing) < 0.35:
		a_render_facing = 0.35 * signf(a_render_facing if a_render_facing != 0.0 else aoda_facing)
	var a_squash_y := 1.0 + (1.0 - absf(aoda_visual_facing)) * 0.10
	draw_set_transform(Vector2(aoda_x, draw_y), 0.0, Vector2(a_render_facing * aoda_scale, a_squash_y * aoda_scale))
	var anchor_offset := Vector2(-333.0, -504.0)
	var mod_color := Color(1.0, 1.0, 1.0, aoda_alpha)
	if aoda_hit_flash > 0.0:
		mod_color = Color(3.0, 3.0, 3.0, aoda_alpha)

	draw_texture_rect_region(aoda_atlases[atlas_idx], Rect2(anchor_offset.x, anchor_offset.y, 600, 600), src_rect, mod_color)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

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

		# Sprite lốc xoáy
		draw_set_transform(Vector2(t["x"], t["y"]), 0.0, Vector2(t_facing * sc, sc))
		draw_texture_rect_region(tornado_tex, Rect2(-350.0, -690.0, 700.0, 690.0), src_rect, Color(1.0, 1.0, 1.0, anim_alpha))
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_projectiles() -> void:
	if proj_tex == null:
		return
	for p in active_projectiles:
		var col: int = p["spin_frame"]
		var src_rect := Rect2(col * 80, 0, 80, 80)
		var sz: float = p["size"]
		var draw_pos := Vector2(p["x"] - sz / 2.0, p["y"] - sz / 2.0)
		draw_texture_rect_region(proj_tex, Rect2(draw_pos.x, draw_pos.y, sz, sz), src_rect)

func _draw_explosions() -> void:
	if explosion_tex == null:
		return
	for exp in active_explosions:
		var f: int = exp["frame"]
		var col := f % 13
		var row := f / 13
		var src_rect := Rect2(col * 128, row * 66, 128, 66)
		var sz_w := 128.0 * 1.5
		var sz_h := 66.0 * 1.5
		var pos := Vector2(exp["x"] - sz_w / 2.0, exp["y"] - sz_h + 15.0)
		draw_texture_rect_region(explosion_tex, Rect2(pos.x, pos.y, sz_w, sz_h), src_rect)

# -------------------------------------------------------------
# THANH MÁU GOTHIC RPG (LÕI THỦY TINH + KHUNG KIM LOẠI XANH / ĐỎ - CHUẨN ĐỘ CAO TEST TOOL)
# -------------------------------------------------------------
func _draw_gothic_health_bars() -> void:
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
		_draw_single_gothic_bar(vargost_x, v_top_y, vargost_hp, VARGOST_MAX_HP, vargost_damage_ghosts, v_label, v_sub, "green", v_bar_w, vargost_alpha)

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
		_draw_single_gothic_bar(aoda_x, a_top_y, aoda_hp, AODA_MAX_HP, aoda_damage_ghosts, a_label, a_sub, "red", a_bar_w, a_alpha)

func _draw_single_gothic_bar(center_x: float, top_y: float, current_hp: float, max_hp: float, ghosts: Array[Dictionary], label_text: String, sub_text: String, theme: String, custom_width: float, alpha_mod: float = 1.0) -> void:
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
		draw_texture_rect(tex_bar_empty, Rect2(bar_x, bar_y, bar_w, bar_h), false, Color(1, 1, 1, alpha_mod))
	else:
		draw_rect(Rect2(bar_x, bar_y, bar_w, bar_h), Color(0.05, 0.07, 0.09, alpha_mod))

	# Lớp 2: Dải máu lỏng hiện tại (Xanh ngọc / Đỏ máu)
	var ratio := clampf(current_hp / max_hp, 0.0, 1.0)
	var liquid_tex := tex_bar_green if theme == "green" else tex_bar_blood
	if ratio > 0.001:
		if liquid_tex != null:
			var src_w := 202.0 * ratio
			draw_texture_rect_region(liquid_tex, Rect2(blood_x, blood_y, blood_w * ratio, blood_h), Rect2(17, 14, src_w, 17), Color(1, 1, 1, alpha_mod))
		else:
			var fill_color := Color("#10f06a") if theme == "green" else Color("#ff1a1a")
			fill_color.a = alpha_mod
			draw_rect(Rect2(blood_x, blood_y, blood_w * ratio, blood_h), fill_color)

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
				draw_texture_rect_region(liquid_tex, Rect2(ghost_dx, blood_y, ghost_dw, blood_h), Rect2(ghost_sx, 14, ghost_sw, 17), Color(1, 1, 1, alpha_mod))
			var flash_col := Color(0.9, 1.0, 0.95, 0.95 * alpha_mod) if theme == "green" else Color(1.0, 1.0, 0.9, 0.95 * alpha_mod)
			draw_rect(Rect2(ghost_dx, blood_y, ghost_dw, blood_h), flash_col)
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
						draw_texture_rect_region(liquid_tex, Rect2(px, py, pw, ph), Rect2(s_px, s_py, s_pw, s_ph), Color(1, 1, 1, alpha_mod))
					else:
						var p_color := Color("#22c55e") if theme == "green" else Color("#ff4444")
						p_color.a = alpha_mod
						draw_rect(Rect2(px, py, pw, ph), p_color)

	# Lớp 4: Lớp kính thủy tinh phản chiếu
	if tex_bar_glass != null:
		draw_texture_rect(tex_bar_glass, Rect2(bar_x, bar_y, bar_w, bar_h), false, Color(1, 1, 1, alpha_mod))

	# Lớp 5: Nhãn tên và thông số máu phía trên thanh máu
	var default_font := ThemeDB.fallback_font
	var font_col := Color("#aff5b4") if theme == "green" else Color("#ffa657")
	font_col.a = alpha_mod
	draw_string(default_font, Vector2(center_x - 120.0, bar_y - 6.0), label_text, HORIZONTAL_ALIGNMENT_CENTER, 240, 11, font_col)

	# Nhãn trạng thái động bên dưới
	if sub_text != "":
		var sub_col := Color("#8b949e", alpha_mod)
		draw_string(default_font, Vector2(center_x - 120.0, bar_y + bar_h + 13.0), sub_text, HORIZONTAL_ALIGNMENT_CENTER, 240, 10, sub_col)

func _draw_damage_texts() -> void:
	var default_font := ThemeDB.fallback_font
	for t in active_damage_texts:
		var col: Color = t["color"]
		col.a = float(t["alpha"])
		# Bóng đổ chữ
		var shadow_col := Color(0, 0, 0, col.a * 0.75)
		draw_string(default_font, Vector2(float(t["x"]) - 29.0, float(t["y"]) + 1.0), str(t["text"]), HORIZONTAL_ALIGNMENT_CENTER, 60, 20, shadow_col)
		draw_string(default_font, Vector2(float(t["x"]) - 30.0, float(t["y"])), str(t["text"]), HORIZONTAL_ALIGNMENT_CENTER, 60, 20, col)

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
			vargost_state = "HALO_WINDUP"
			vargost_frame_index = 44
		else:
			if aoda_tornado_cooldown <= 0.0 and not aoda_is_dead:
				aoda_facing = 1.0 if click_pos.x > aoda_x else -1.0
				aoda_visual_facing = aoda_facing
				aoda_tornado_cooldown = 5.0
				aoda_state = "SKILL_1_WINDUP"
				aoda_frame_index = 24

