---
name: godwar-combat-character
description: Quy chuẩn kiến trúc xây dựng nhân vật chiến đấu (Combat Character) cho GodWar 3v3 Mobile Auto-battler; bắt buộc hỗ trợ xuất phát và tác chiến cả 2 hướng (Trái ➔ Phải và Phải ➔ Trái), lật đối xứng ngang quanh trục neo chân pivot, tự động đồng bộ SpawnMarker2D, đạn vector 2D, động học bay nghiêng thân, hoạt ảnh nhảy liên tục không đơ hình tĩnh và bộ não Utility AI.
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

### 2.3. Thuộc tính & Phương thức Lật Hướng Siêu Tốc 2.5D Đánh Lừa Thị Giác (`set_facing`)
Mọi nhân vật chiến đấu phải khai báo `facing_dir`, `target_facing`, `visual_facing` và thực hiện lật mặt siêu tốc đánh lừa thị giác (tốc độ tối thiểu $\times 3$, `move_toward(visual_facing, target_facing, delta * 50.0)`) kèm hiệu ứng hạt Pixel Dissolve / Ember Burst khi đảo chiều qua 0 để triệt tiêu hoàn toàn cảm giác co giãn bẹp dí uể oải:

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
    # Lật mặt siêu tốc 2.5D đánh lừa thị giác (x3+ speed, ~0.04s)
    if absf(visual_facing - target_facing) > 0.02:
        var prev_vf := visual_facing
        visual_facing = move_toward(visual_facing, target_facing, delta * 50.0)
        # Kích hoạt Pixel Dissolve / Ember Burst khi đảo chiều qua 0
        if signf(prev_vf) != signf(visual_facing) and prev_vf != 0.0:
            _spawn_ember_burst(global_position, 8)
        var turn_squash_y := 1.0 + (1.0 - absf(visual_facing)) * 0.10
        sprite.scale.x = visual_facing * scale_factor
        sprite.scale.y = turn_squash_y * scale_factor
    else:
        visual_facing = target_facing
        sprite.scale.x = target_facing * scale_factor
        sprite.scale.y = scale_factor
```

---

## 3. Quy chuẩn Đạn (Projectile) & Kỹ năng (Skill/Spell)

1. **Khóa Quỹ Đạo Đường Bay Cố Định (Locked Straight Trajectory):**
   - Vector đường bay của đạn định hướng (như Blazing Halo) **bắt buộc phải chốt cứng tọa độ mục tiêu (`locked_target`) ngay tại thời điểm Windup** và phóng theo đường thẳng cố định từ vị trí tay xuất chiêu đến tọa độ đã khóa.
   - Tuyệt đối cấm bẻ cong quỹ đạo hay tự động bám theo đối thủ giữa đường bay (mid-flight homing/curving), đảm bảo chuẩn logic võ học công bằng.
   $$\vec{v} = \frac{\vec{P}_{\text{locked\_target}} - \vec{P}_{\text{hand}}}{\|\vec{P}_{\text{locked\_target}} - \vec{P}_{\text{hand}}\|} \times \text{speed}$$
2. **Va Chạm Đa Giác Địa Hình (Terrain Polygons Collision):**
   - Đạn bay trong arena phải thực hiện raycast kiểm tra giao cắt với các đa giác địa hình (Zone 1 bệ trái, Zone 2 bệ trung tâm, Zone 3 vách đá phải).
   - Ngay khi chạm vào bề mặt vách đá hoặc mặt đất địa hình, đạn lập tức phát nổ (`_spawn_explosion`) và tan biến, tuyệt đối không được bay xuyên vách đá ra ngoài rìa bản đồ.
3. **Thiết kế VFX Đạn:**
   - Ưu tiên hiệu ứng đạn đối xứng tâm (hình tròn xoay $360^\circ$ như Blazing Halo 8 frame).
   - Nếu đạn có hướng mũi nhọn (mũi tên, tia sét, đao khí): Node đạn phải xoay theo góc vector bay `rotation = velocity.angle()` hoặc lật `scale.x = facing_dir`.
4. **Hiệu ứng va chạm / Nổ (Explosion VFX):**
   - Nổ diện rộng tại vị trí tiếp xúc của mục tiêu hoặc nền đất/vách đá, đối xứng tâm.

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
4. **Quy chuẩn Hoạt ảnh khi Di chuyển / Nhảy Vượt Bệ (Airborne / Ledge Jumping Traversal):**
   - **TUYỆT ĐỐI KHÔNG KHÓA FRAME TĨNH KHI NHẢY (CẤM ĐỂ ẢNH ĐƠ):** Trong suốt quá trình nhân vật bay, nhảy bậc hoặc vượt địa hình (parabolic jump arc, lướt, nhảy vượt bệ đá), **hoạt ảnh sprite bắt buộc phải tiếp tục chạy liên tục** (advance frame theo chu kỳ di chuyển / chạy bộ / nhảy vút, ví dụ `animAccum += dt -> frameIndex++`).
   - **Lỗi nghiêm cấm lặp lại:** Tuyệt đối không gán chết một frame index tĩnh (như `frameIndex = 25`) xuyên suốt thời gian nhảy, khiến nhân vật biến thành một bức ảnh tĩnh bị kéo rê qua lại trên màn hình ('giống hệt dùng bức ảnh kéo tới kéo lui').
   - **Kết hợp biến dạng động học tự nhiên:** Kết hợp biến dạng squash & stretch nhẹ theo thời gian nhảy (lúc bật lên vút cao kéo giãn trục Y $+10..15\%$, lúc tiếp đất nhún hấp thụ xung lực squash Y $-15\%$, stretch X $+15\%$), trong khi các frame hoạt ảnh cử động tay chân, tà áo và cơ thể vẫn tiếp tục chuyển động sống động.
5. **Quy chuẩn Hoạt ảnh Gục Ngã (KO Animation Cycle & Clamping):**
   - Hoạt ảnh khi nhân vật tử trận (như Aoda) phải chạy liên tục từ frame ngã đến đúng frame nằm yên trên đất (ví dụ frame 58 của Aoda).
   - **Kẹp chặt (clamp)** tại frame nằm sàn này trong suốt thời gian bốc hơi pixel vào hư không, tuyệt đối không được để tràn loop qua frame chạy bộ hay frame trống.

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

---

## 7. Quy chuẩn Thanh Máu Gothic RPG & Tối Giản UI Mobile

1. **Chiều cao & Khoảng cách Đỉnh Đầu:**
   - Đáy ống máu Gothic của mọi nhân vật phải nằm cách đỉnh đầu đúng $10\text{px}$ (`bar_top_y = head_top_y - bar_h - 10px`).
   - Tuyệt đối không để thanh máu cách quá xa đầu (> 30px) gây lơ lửng mất thẩm mỹ, hoặc tụt xuống che mất đầu nhân vật.
2. **Tối giản UI Mobile (So với Web Viewer):**
   - Trên Web Viewer (test tool): Có thể hiển thị tia ngắm hướng đạn, vòng tâm ngắm (Aim Reticle), và vòng ma pháp báo trước dưới chân đối thủ để lập trình viên quan sát debug.
   - Trên bản Godot Mobile APK: Toàn bộ tia ngắm, vòng tròn định hướng, tâm ngắm và vòng quầng lửa/đổ bóng hình elip dưới chân kỹ năng diện rộng (như lốc xoáy) **phải được ẩn đi hoàn toàn**. Giao diện mobile chỉ giữ lại nhân vật, sprite kỹ năng thực tế, hiệu ứng va chạm nổ và thanh máu Gothic RPG.
3. **Thích ứng Đa Màn hình (Dynamic Aspect Ratio):**
   - Toàn bộ background và UI phải hỗ trợ chế độ `expand`, không để xuất hiện viền đen hai bên mép trên các thiết bị màn hình dài (Redmi K70E tỉ lệ 20:9 hoặc tương đương).
