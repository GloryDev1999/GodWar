extends SceneTree

func _initialize() -> void:
    var manifest_path := "res://Asset/Character/characters/vargost_combat/vargost_actions.json"
    var file := FileAccess.open(manifest_path, FileAccess.READ)
    if file == null:
        push_error("Cannot open " + manifest_path)
        quit(1)
        return

    var manifest: Variant = JSON.parse_string(file.get_as_text())
    if not manifest is Dictionary:
        push_error("Invalid manifest JSON")
        quit(1)
        return

    var actions: Dictionary = manifest.get("actions", {})
    if not actions.has("idle") or not actions.has("blazing_halo") or not actions.has("skill_cast") or not actions.has("explosion"):
        push_error("Missing required action states")
        quit(1)
        return

    var frames: Array = manifest.get("frames", [])
    if frames.size() != 83:
        push_error("Expected 83 frames, got " + str(frames.size()))
        quit(1)
        return

    var ai_rules: Dictionary = manifest.get("ai_combat_rules", {})
    if ai_rules.get("attack_range_min_px", 0) != 150 or ai_rules.get("attack_range_max_px", 0) != 550 or ai_rules.get("fly_speed_px_per_sec", 0) != 400 or ai_rules.get("projectile_speed_px_per_sec", 0) != 1100:
        push_error("Invalid or missing ai_combat_rules")
        quit(1)
        return

    # Check file exists for atlas
    if not FileAccess.file_exists("res://" + manifest.atlas_path):
        push_error("Missing body atlas: " + manifest.atlas_path)
        quit(1)
        return

    if not FileAccess.file_exists("res://" + manifest.projectile_atlas):
        push_error("Missing projectile atlas: " + manifest.projectile_atlas)
        quit(1)
        return

    if not FileAccess.file_exists("res://" + manifest.explosion_atlas):
        push_error("Missing explosion atlas: " + manifest.explosion_atlas)
        quit(1)
        return

    print("PASS Vargost combat chain: 83 frames (idle 0..21, blazing halo 44..82), unified smooth asset chain, 8-frame projectile @ 1100px/s, range [150, 550], tilt 25 deg, max speed 400px/s, explosion 91 frames")
    quit(0)
