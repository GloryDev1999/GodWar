extends SceneTree

func _initialize() -> void:
    print("Testing instantiation of Vargost Character Scene in Godot 4...")
    var scene_res = load("res://Asset/Character/characters/vargost_combat/vargost_character.tscn")
    if scene_res == null:
        push_error("FAIL: Cannot load vargost_character.tscn")
        quit(1)
        return

    var vargost = scene_res.instantiate()
    if vargost == null:
        push_error("FAIL: Cannot instantiate vargost_character.tscn")
        quit(1)
        return

    root.add_child(vargost)
    # Wait for node to enter tree and call _ready()
    await process_frame

    print("PASS: Vargost scene successfully instantiated and added to root!")
    print("  - Node Name: " + vargost.name)
    print("  - Script Class: " + vargost.get_class())
    print("  - AnimatedSprite2D: " + str(vargost.get_node("AnimatedSprite2D") != null))
    print("  - CollisionShape2D: " + str(vargost.get_node("CollisionShape2D") != null))
    print("  - SpawnMarker: " + str(vargost.get_node("SpawnMarker") != null))

    # Test Facing Flip
    vargost.set_facing(-1.0)
    var sprite = vargost.get_node("AnimatedSprite2D")
    var spawn = vargost.get_node("SpawnMarker")
    print("  - Facing Left (-1.0): sprite.scale.x=" + str(sprite.scale.x) + ", spawn.x=" + str(spawn.position.x))
    if sprite.scale.x >= 0.0 or spawn.position.x >= 0.0:
        push_error("FAIL: set_facing(-1.0) did not flip properly")
        quit(1)
        return

    vargost.set_facing(1.0)
    print("  - Facing Right (+1.0): sprite.scale.x=" + str(sprite.scale.x) + ", spawn.x=" + str(spawn.position.x))
    if sprite.scale.x <= 0.0 or spawn.position.x <= 0.0:
        push_error("FAIL: set_facing(1.0) did not flip properly")
        quit(1)
        return

    print("PASS: Symmetrical Horizontal Flip (Trái ⇋ Phải) verified in Godot 4!")
    quit(0)
