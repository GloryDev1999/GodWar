---
name: godwar-combat-character
description: Quy chuẩn kiến trúc xây dựng nhân vật chiến đấu (Combat Character) cho GodWar 3v3 Mobile Auto-battler; bắt buộc hỗ trợ xuất phát và tác chiến cả 2 hướng (Trái ➔ Phải và Phải ➔ Trái), lật đối xứng ngang quanh trục neo chân pivot, tự động đồng bộ SpawnMarker2D, đạn vector 2D, động học bay nghiêng thân và bộ não Utility AI.
---

# Quy chuẩn Xây dựng Nhân vật Chiến đấu (Combat Character) GodWar 3v3

Áp dụng trong toàn bộ dự án GodWar khi tạo mới, phân rã hoạt ảnh, lập trình node nhân vật hoặc nâng cấp bất kỳ nhân vật chiến đấu nào (Mage, Tanker, Healer, Melee Assassin) cho sàn đấu 3v3 tự động trên map ngang 1920×1080.

---

## 1. Nguyên tắc Cốt lõi: Tác chiến Hai Hướng Đối Xứng (Trái ⇋ Phải)

Trong trận đấu 3v3:
- **Đội Trái (Team 1):** Xuất phát ở nửa trái map ($X \approx 200..400$), nhìn sang phải hướng về cứ điểm trung tâm ($X = 960$).
- **Đội Phải (Team 2):** Xuất phát ở nửa phải map ($X \approx 1520..1720$), nhìn sang trái hướng về cứ điểm trung tâm ($X = 960$).
- Trong lúc giao tranh: các nhân vật liên tục né đòn, bay bọc sườn, hoặc sát thủ luồn ra phía sau lưng.

> [!IMPORTANT]
> **Tuyệt đối KHÔNG vẽ hay xuất thêm bộ sprite lật ngược:**
> Không bao giờ nhân đôi atlas hoặc tạo riêng bộ frame quay sang trái (gây phình to dung lượng repository, tốn VRAM và bộ nhớ APK mobile). Mọi nhân vật đều phải sử dụng cơ chế **Lật đối xứng ngang (Horizontal Flip quanh trục Pivot neo)**.

---

## 2. Quy chuẩn Node & Mã nguồn Godot 4 (`CharacterBody2D`)

Mọi script nhân vật chiến đấu (kế thừa `CharacterBody2D`) bắt buộc phải tuân thủ cấu trúc sau:

### 2.1. Cấu trúc Cây Node (Scene Tree)
```text
Vargost (CharacterBody2D)
├── AnimatedSprite2D    # Sprite hiển thị hoạt ảnh
├── CollisionShape2D   # Va chạm thân (CapsuleShape2D / CircleShape2D)
└── SpawnMarker (Marker2D) # Điểm phát chiêu / bắn đạn / chém melee
```

### 2.2. Điểm neo (Anchor Pivot) và Tọa độ Xuất phát Chiêu
- **Điểm neo (`anchor_px`):** Luôn đặt tại chân hoặc trọng tâm đối xứng của nhân vật (ví dụ Vargost là `[105.0, 162.0]` trong khung 200×200). Điểm neo này tương ứng với tọa độ gốc $(0, 0)$ của node cha.
- **Offset hiển thị:** `sprite.centered = false`, `sprite.offset = -anchor_px`.
- Khi lật trục ngang, điểm neo $(0, 0)$ giữ nguyên vị trí đứng vững chắc trên bệ đá, nhân vật quay mặt tại chỗ 180° không bị trượt dù chỉ 1 pixel.

### 2.3. Thuộc tính & Phương thức Lật Hướng Nội Suy 2.5D (`set_facing`)
Mọi nhân vật chiến đấu phải khai báo `facing_dir`, `target_facing`, `visual_facing` và thực hiện lật mặt mềm mại 2.5D (co dãn trục X qua 0 kèm squash & stretch nhẹ) để triệt tiêu hoàn toàn hiện tượng "đơ/giật hình" khi quay người:

```gdscript
## Hướng nhìn hiện tại: 1.0 (Nhìn sang Phải - Đội Trái), -1.0 (Nhìn sang Trái - Đội Phải)
var facing_dir: float = 1.0
var target_facing: float = 1.0
var visual_facing: float = 1.0

## Lật hướng nhân vật đối xứng qua trục Pivot neo:
func set_facing(dir: float) -> void:
    target_facing = -1.0 if dir < 0.0 else 1.0
    facing_dir = target_facing

func _physics_process(delta: float) -> void:
    # Nội suy lật mặt 2.5D mượt mà (~0.15s), không đổi đột ngột trong 1 tick
    if not combat_package.is_empty() and sprite != null:
        var scale_factor: float = float(combat_package.get("display_scale", 1.0))
        if absf(visual_facing - target_facing) > 0.02:
            visual_facing = move_toward(visual_facing, target_facing, delta * 12.0)
            var turn_squash_y := 1.0 + (1.0 - absf(visual_facing)) * 0.10
            sprite.scale.x = visual_facing * scale_factor
            sprite.scale.y = turn_squash_y * scale_factor
            if spawn_marker != null:
                spawn_marker.position.x = visual_facing * base_spawn_offset_x * scale_factor
        else:
            visual_facing = target_facing
            sprite.scale.x = target_facing * scale_factor
            sprite.scale.y = scale_factor
            if spawn_marker != null:
                spawn_marker.position.x = target_facing * base_spawn_offset_x * scale_factor
```

---

## 3. Quy chuẩn Đạn (Projectile) & Kỹ năng (Skill/Spell)

1. **Quỹ đạo bay Vector 2D:**
   - Vector vận tốc đạn phải luôn tính bằng toán học vector thuần túy:
     $$\vec{v} = \frac{\vec{P}_{\text{target}} - \vec{P}_{\text{spawn}}}{\|\vec{P}_{\text{target}} - \vec{P}_{\text{spawn}}\|} \times \text{speed}$$
   - Khi mục tiêu ở bên trái ($\vec{P}_{\text{target}}.x < \vec{P}_{\text{spawn}}.x$), thành phần vận tốc trục $X$ tự động mang dấu âm ($v_x < 0$), đạn bay vút từ phải sang trái tự nhiên.
2. **Thiết kế VFX Đạn:**
   - Ưu tiên hiệu ứng đạn đối xứng tâm (hình tròn xoay $360^\circ$ như Blazing Halo 8 frame).
   - Nếu đạn có hướng mũi nhọn (mũi tên, tia sét, đao khí): Node đạn phải xoay theo góc vector bay `rotation = velocity.angle()` hoặc lật `scale.x = facing_dir`.
3. **Hiệu ứng va chạm / Nổ (Explosion VFX):**
   - Nổ diện rộng tại vị trí tiếp xúc của mục tiêu hoặc nền đất, đối xứng tâm.

---

## 4. Quy chuẩn Động học Di chuyển (Locomotion) & Tốc độ Trục Y (Độ Cao)

1. **Giới hạn Tốc độ Trục Y (Bay Lên / Bay Xuống / Hạ Cánh / Cất Cánh):**
   - Mọi chuyển động thay đổi độ cao (bay thẳng đứng 12h/6h, cất cánh, hạ cánh, hoặc bay xéo 10h/2h/4h/8h) **bắt buộc phải giới hạn tốc độ trục Y trong khoảng $100 - 300\text{px/s}$** (mặc định tối ưu là $180 - 200\text{px/s}$).
   - Tuyệt đối không cho nhân vật lao vụt xuống đất hoặc phóng vụt lên trời ở tốc độ 400 - 700 px/s gây cảm giác giật cục, thiếu tự nhiên.
   - Khi hạ cánh/cất cánh: Phải tính toán thời lượng chuyển động theo quãng đường thực tế $\Delta Y / v_y$, kết hợp hàm giảm tốc tự nhiên (`ease-out`) khi gần chạm bệ đá.
2. **Góc nghiêng thân (Body Tilt $\pm 25^\circ$):**
   - Góc nghiêng phải tính theo **hướng di chuyển thực tế**:
     - Khi di chuyển sang phải ($v_x > 0$): Nghiêng thuận chiều kim đồng hồ ($+25^\circ$).
     - Khi di chuyển sang trái ($v_x < 0$): Nghiêng ngược chiều kim đồng hồ ($-25^\circ$).
     - Khi dừng lại / tiếp đất: Tự động mượt mà trở về đứng thẳng ($0^\circ$).
   - Nhờ đó:
     - Khi quay mặt sang phải: Bay sang phải là **Tiến** (chúi $+25^\circ$), bay sang trái là **Lùi** (ngửa $-25^\circ$).
     - Khi quay mặt sang trái: Bay sang trái là **Tiến** (chúi $-25^\circ$), bay sang phải là **Lùi** (ngửa $+25^\circ$).
3. **Vệt bóng mờ 2D (Motion Ghosts):**
   - Bóng mờ phát sinh tại vị trí thân nhân vật và kế thừa đúng `visual_facing` và `current_tilt` tại thời điểm đó.

---

## 5. Quy chuẩn Bộ não Utility AI 3v3 & Xử lý Khi Địch Sau Lưng (Target Tracking & Kiting)

1. **Theo dõi và Khóa mục tiêu Động (Dynamic Target Tracking & 2.5D Aim Facing):**
   - Trong thực chiến 3v3, kẻ địch liên tục di chuyển và có thể luồn lách hoặc vượt ra phía sau lưng. Việc nhân vật cứ giật lùi mù quáng mà không nhìn địch là bất cập vì kẻ địch di chuyển liên tục.
   - Do đó, khi phát hiện kẻ địch đã lọt ra sau lưng ($(\vec{P}_{\text{target}}.x - \vec{P}_{\text{self}}.x) \times \text{facing_dir} < -20\text{px}$):
     Nhân vật **lập tức kích hoạt xoay người 2.5D đối diện với kẻ địch** (`set_facing(signf(\Delta x), false)`).
   - Cơ chế nội suy **Smooth 2.5D Turn-around** (co dãn trục X và nhún trục Y trong ~0.15s) đảm bảo nhân vật xoay người sang hướng mới mềm mại, tự nhiên, triệt tiêu 100% hiện tượng đơ/giật hình.
2. **Kiting Chiến thuật (Vừa nhìn địch vừa bay lùi):**
   - Sau khi đã xoay mặt đối diện kẻ địch:
     - Nếu cự ly quá gần ($< 150\text{px}$): AI kích hoạt cơ chế **Kite** (nhân vật **vừa nhìn thẳng vào địch, vừa bay lùi né đòn** với góc nghiêng thân để giãn cự ly an toàn, đạn và điểm bắn luôn hướng thẳng vào địch).
     - Nếu cự ly nằm trong tầm tối ưu ($[150, 550]\text{px}$): AI khóa mục tiêu và lập tức xuất chiêu thẳng vào kẻ địch.
     - Nếu cự ly quá xa ($> 550\text{px}$): AI bay tiến áp sát mục tiêu.
3. **Phân hóa theo Class:**
   - Ranged (như Vargost): Ưu tiên xoay mặt khóa mục tiêu và Kite lùi dãn cách cự ly an toàn.
   - Tanker / Melee: Xoay mặt khóa mục tiêu và lập tức lao tới che chắn hoặc áp sát chém địch.

---

## 6. Quy chuẩn Giao diện Kiểm thử (Web Viewer / Skill Test Page)

Mỗi khi tạo công cụ kiểm thử trực quan trên Web Viewer (cổng 4173) cho một nhân vật mới:
1. **Bắt buộc có nút đảo phe:** `🔄 Hướng: Đội Trái (Trái ➔ Phải) ⇋ Đội Phải (Phải ➔ Trái)`.
2. **Bắt buộc có nút thử bay lố:** `⚠️ Thử Bay Lố (Địch sau lưng)` để kiểm chứng hành vi AI lùi tái định vị và xoay người 2.5D không bị đơ giật.
3. **Bắt buộc có thanh trượt tốc độ trục Y:** Cho phép tinh chỉnh tốc độ bay lên/bay xuống trong khoảng $100 - 300\text{px/s}$.
4. Chạy kiểm thử tự động xác nhận cả 2 chiều `set_facing(-1.0)` và `set_facing(1.0)` thành công trước khi báo hoàn thành.
