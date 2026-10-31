extends SceneTree

const Library = preload("res://scripts/animation/gif_atlas_library.gd")

func _initialize() -> void:
    print("Testing Godot 4 Vargost Systematized Combat Package...")

    var vargost = Library.create_vargost_combat()
    if vargost.is_empty():
        push_error("FAIL: Failed to create vargost combat package")
        quit(1)
        return

    var frames: SpriteFrames = vargost.get("frames")
    if frames == null:
        push_error("FAIL: Missing SpriteFrames")
        quit(1)
        return

    if frames.get_frame_count("idle") != 22:
        push_error("FAIL: Expected 22 idle frames, got " + str(frames.get_frame_count("idle")))
        quit(1)
        return

    if frames.get_frame_count("blazing_halo") != 39:
        push_error("FAIL: Expected 39 blazing_halo frames, got " + str(frames.get_frame_count("blazing_halo")))
        quit(1)
        return

    var proj: SpriteFrames = vargost.get("projectile_frames")
    if proj == null or proj.get_frame_count("spin") != 8:
        push_error("FAIL: Expected 8 spinning projectile frames")
        quit(1)
        return

    var exp: SpriteFrames = vargost.get("explosion_frames")
    if exp == null or exp.get_frame_count("explode") != 91:
        push_error("FAIL: Expected 91 explosion frames")
        quit(1)
        return

    var rules: Dictionary = vargost.get("ai_combat_rules", {})
    if rules.get("projectile_speed_px_per_sec", 0) != 1100 or rules.get("fly_speed_px_per_sec", 0) != 400:
        push_error("FAIL: Invalid AI combat rules")
        quit(1)
        return

    print("PASS: Vargost Godot 4 Combat Package successfully loaded and validated!")
    print("  - Idle: 22 frames")
    print("  - Blazing Halo: 39 frames (windup 24, recovery 14)")
    print("  - Spinning Projectile: 8 frames @ 1100px/s")
    print("  - Explosion VFX: 91 frames")
    print("  - Anchor: " + str(vargost.anchor_px) + ", Scale: " + str(vargost.display_scale))
    quit(0)
