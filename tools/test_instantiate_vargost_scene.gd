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
    print("PASS: Vargost scene successfully instantiated and added to root!")
    print("  - Node Name: " + vargost.name)
    print("  - Script Class: " + vargost.get_class())
    print("  - AnimatedSprite2D: " + str(vargost.get_node("AnimatedSprite2D") != null))
    print("  - CollisionShape2D: " + str(vargost.get_node("CollisionShape2D") != null))
    print("  - SpawnMarker: " + str(vargost.get_node("SpawnMarker") != null))
    quit(0)
