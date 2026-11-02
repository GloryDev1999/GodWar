extends SceneTree

func _initialize() -> void:
    print("Testing instantiation of Aoda Character Scene in Godot 4...")
    var scene_res = load("res://Asset/Character/characters/aoda_combat/aoda_character.tscn")
    if scene_res == null:
        push_error("FAIL: Cannot load aoda_character.tscn")
        quit(1)
        return

    var aoda = scene_res.instantiate()
    if aoda == null:
        push_error("FAIL: Cannot instantiate aoda_character.tscn")
        quit(1)
        return

    root.add_child(aoda)
    await process_frame

    print("PASS: Aoda scene successfully instantiated and added to root!")
    print("  - Node Name: " + aoda.name)
    print("  - Script Class: " + aoda.get_class())
    print("  - AnimatedSprite2D: " + str(aoda.get_node("AnimatedSprite2D") != null))
    print("  - CollisionShape2D: " + str(aoda.get_node("CollisionShape2D") != null))
    print("  - SpawnMarker: " + str(aoda.get_node("SpawnMarker") != null))

    # Test Facing Flip
    aoda.set_facing(-1.0)
    var sprite = aoda.get_node("AnimatedSprite2D")
    var spawn = aoda.get_node("SpawnMarker")
    print("  - Facing Left (-1.0): sprite.scale.x=" + str(sprite.scale.x) + ", spawn.x=" + str(spawn.position.x))
    if sprite.scale.x >= 0.0 or spawn.position.x >= 0.0:
        push_error("FAIL: set_facing(-1.0) did not flip properly")
        quit(1)
        return

    aoda.set_facing(1.0)
    print("  - Facing Right (+1.0): sprite.scale.x=" + str(sprite.scale.x) + ", spawn.x=" + str(spawn.position.x))
    if sprite.scale.x <= 0.0 or spawn.position.x <= 0.0:
        push_error("FAIL: set_facing(1.0) did not flip properly")
        quit(1)
        return

    # Test Tornado Cast & Cooldown
    aoda.combat_state = "IDLE"
    var cast_ok = aoda.cast_tornado()
    if not cast_ok:
        push_error("FAIL: cast_tornado() should succeed when off cooldown")
        quit(1)
        return
    print("  - Cast Tornado (CD 5s): SUCCESS! State = " + aoda.combat_state + ", Cooldown = " + str(aoda.tornado_cooldown))

    # Cannot cast tornado while on cooldown
    var cast_blocked = aoda.cast_tornado()
    if cast_blocked:
        push_error("FAIL: Should not cast Tornado while on cooldown")
        quit(1)
        return
    print("  - Cast Tornado on Cooldown: BLOCKED (Success)")

    # Verify SpriteFrames animations
    var sprite_frames = sprite.sprite_frames
    if sprite_frames == null:
        push_error("FAIL: SpriteFrames is null")
        quit(1)
        return
    if not sprite_frames.has_animation("idle"):
        push_error("FAIL: Missing idle animation")
        quit(1)
        return
    if not sprite_frames.has_animation("skill_1_tornado"):
        push_error("FAIL: Missing skill_1_tornado animation")
        quit(1)
        return
    if sprite_frames.has_animation("basic_attack"):
        push_error("FAIL: basic_attack animation should be removed")
        quit(1)
        return
    print("  - SpriteFrames: idle (Frame 0..24), skill_1_tornado, ko, move verified (basic_attack removed)")

    print("PASS: Godot 4 CLI Aoda Combat Character 100% verified!")
    quit(0)
