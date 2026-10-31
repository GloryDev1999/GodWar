# Danh sách hoạt ảnh chốt ngày 31/10/2026 (Mốc v9)

Tổng cộng 177 mục (178 profile). Chi tiết hash và đường dẫn atlas nằm tại [`Asset/Character/characters/approved-animations-20261031-v9.json`](file:///workspaces/GodWar/Asset/Character/characters/approved-animations-20261031-v9.json).

## Điểm nhấn mốc v9: Chính Thức Phê Duyệt Nhân Vật Vargost (Official User Approved)

Theo xác nhận của người dùng ngày 31/10/2026, nhân vật **Vargost** đã được **chính thức phê duyệt và chốt hoàn thiện toàn bộ** hoạt ảnh chiến đấu, chiêu thức Blazing Halo, động học bay 2D Vector và bộ não Utility AI:
- **Bộ hoạt ảnh cơ thể (83 frame, chiều cao 75 px, lưới 2×2 texel):**
  - `Idle`: 22 frame lơ lửng tuần hoàn (loop 0..21) với 2 vòng lửa ở 2 tay.
  - `Blazing Halo (Chiêu Tối Thượng)`: Chuỗi 39 frame liền mạch (44..82). Vận công gom vòng lửa lớn từ frame 44..63, vung tay và xuất lực qua frame 64..67 (vòng lửa di chuyển mượt mà liên tục theo chiều 64-68 từ fine_candidates), phóng đại cầu lửa ở frame 68 @ 1100 px/s từ điểm xuất phát chuẩn `[dx: +20, dy: -20]`, thu hồi và tụ lại 2 vòng lửa ở frame 74..77.
  - Atlas lưu tại: [`Asset/Character/characters/vargost_combat/vargost_body_atlas.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/vargost_body_atlas.png) và [`Asset/Character/measured_atlas_pilots/vargost/atlas_000.png`](file:///workspaces/GodWar/Asset/Character/measured_atlas_pilots/vargost/atlas_000.png) (SHA-256: `e4fb347c69c4746203b2f665719e77078e466dbb952b947690ef11c218ca0449`).
  - Trạng thái chốt: `user_approved` ngày 31/10/2026.
- **Đạn vòng lửa xoay 8 frame:**
  - 8 góc xoay 45° liên tục ([`ring_0.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/projectile/ring_0.png) .. [`ring_7.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/projectile/ring_7.png)), kích thước 80×80 px trên lưới hạt 2×2 texel, sạch 100% không còn pixel tay/thân dính vào (`non-flame = 0`).
  - Tốc độ bay 1100 px/s, chu kỳ xoay 35 ms/frame.
  - Sheet đạn lưu tại: [`Asset/Character/characters/vargost_combat/projectile_sheet.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/projectile_sheet.png) (SHA-256: `ec4c89454db7ddb1c2110d23e6335fefd2ff7357f5015994b072151a7aa6988d`).
- **Hiệu ứng nổ mặt đất (91 frame):**
  - Chuẩn hóa đồng bộ 100% mật độ hạt 2×2 texel với phong cách đồ họa Vargost.
  - Atlas lưu tại: [`Asset/Character/characters/vargost_combat/vfx_fire_explosion_sheet.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/vfx_fire_explosion_sheet.png) (SHA-256: `c4d99ff52414cb96796da3fc615274f30d47c404289679ae1155451c478abc14`).
- **Động học 2D Vector & Bộ não Utility AI:**
  - Di chuyển 2D Vector đa hướng: Trực giao (12h, 3h, 6h, 9h) và Bay xéo (10h, 2h, 4h, 8h) ở 400 px/s (chế độ chậm tuần tra 100 px/s).
  - Tự động nghiêng thân $\pm 25^\circ$ theo hướng di chuyển ngang, co giãn quán tính (squash & stretch) theo vector dọc, vệt bóng mờ 2D (motion ghosts), khi dừng tự động trả về thẳng đứng $0^\circ$.
  - Utility AI tự động đánh giá cự ly mục tiêu [150, 550], tự động tăng tốc bay xéo áp sát/lùi giữ cự ly, dừng lại đứng thẳng và tung Blazing Halo từ bất kỳ độ cao nào (trên không hoặc bệ đá). Khóa độ cao 15s (`altitudeCooldown`) triệt tiêu hoàn toàn vòng lặp cất/hạ cánh.
- **Đóng gói Hệ thống hóa cho Godot 4 & Android Mobile:**
  - Scene Godot 4: [`Asset/Character/characters/vargost_combat/vargost_character.tscn`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/vargost_character.tscn).
  - Script Godot 4: [`Asset/Character/characters/vargost_combat/vargost_character.gd`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/vargost_character.gd).
  - Thư viện nạp: [`scripts/animation/gif_atlas_library.gd`](file:///workspaces/GodWar/scripts/animation/gif_atlas_library.gd) hàm `create_vargost_combat()`.
  - Cấu hình đóng gói Android: [`export_presets.cfg`](file:///workspaces/GodWar/export_presets.cfg) đã bao gồm toàn bộ manifest JSON chiến đấu.
- **Bộ công cụ trực quan:**
  - Trình kiểm thử: [`tools/asset-viewer/vargost-skill-test.html`](file:///workspaces/GodWar/tools/asset-viewer/vargost-skill-test.html) và [`vargost-skill-test.js`](file:///workspaces/GodWar/tools/asset-viewer/vargost-skill-test.js).
  - Giao diện được cố định tuyệt đối (Zero Layout Shift), tích hợp cụm phím bay xéo Q/E/Z/C/W/A/S/D và Kính Lúp Pixel 10×.

---

## Bảng tổng hợp 177 mục / 178 profile (Giữ nguyên 176 profile mốc v8 + Vargost combat đã chốt)

| Mục | Profile | Chiều cao (px) | Số frame | Trạng thái chốt |
|---|---|---:|---:|---|
| Actem | Actem | 90 | 66 | Chốt ngày 30/10/2026 |
| agon | agon | 90 | 50 | Chốt ngày 30/10/2026 |
| airpot | airpot | 80 | 67 | Chốt ngày 30/10/2026 |
| aminao | aminao | 70 | 82 | Chốt ngày 30/10/2026 |
| amore | amore | 80 | 46 | Chốt ngày 30/10/2026 |
| animent | animent | 85 | 60 | Chốt ngày 30/10/2026 |
| aoda | aoda | 80 | 93 | Chốt ngày 30/10/2026 |
| aonime | aonime | 70 | 60 | Chốt ngày 30/10/2026 |
| aonoma | aonoma | 80 | 14 | Chốt ngày 30/10/2026 |
| Aquamen | Aquamen | 65 | 65 | Chốt ngày 30/10/2026 |
| artemis | artemis | 85 | 64 | Chốt ngày 30/10/2026 |
| assing | assing | 75 | 55 | Chốt ngày 30/10/2026 |
| astra | astra | 75 | 49 | Chốt ngày 30/10/2026 |
| aumen | aumen | 85 | 67 | Chốt ngày 30/10/2026 |
| aument | aument | 85 | 42 | Chốt ngày 30/10/2026 |
| auranient | auranient | 80 | 77 | Chốt ngày 30/10/2026 |
| auroma | auroma | 70 | 57 | Chốt ngày 30/10/2026 |
| aurora | aurora | 85 | 36 | Chốt ngày 30/10/2026 |
| authen | authen | 80 | 66 | Chốt ngày 30/10/2026 |
| azil | azil | 70 | 30 | Chốt ngày 30/10/2026 |
| azou | azou | 55 | 48 | Chốt ngày 30/10/2026 |
| bearfire | bearfire | 90 | 66 | Chốt ngày 30/10/2026 |
| biden | biden | 80 | 67 | Chốt ngày 30/10/2026 |
| blackdog | blackdog | 65 | 57 | Chốt ngày 30/10/2026 |
| blacktiger | blacktiger | 65 | 26 | Chốt ngày 30/10/2026 |
| bomer | bomer | 60 | 39 | Chốt ngày 30/10/2026 |
| botem | botem | 100 | 75 | Chốt ngày 30/10/2026 |
| botic | botic | 100 | 54 | Chốt ngày 30/10/2026 |
| buffao | buffao | 80 | 68 | Chốt ngày 30/10/2026 |
| buffoin | buffoin | 90 | 49 | Chốt ngày 30/10/2026 |
| butayaro | butayaro | 90 | 43 | Chốt ngày 30/10/2026 |
| camword | camword | 80 | 30 | Chốt ngày 30/10/2026 |
| changlie | changlie | 80 | 43 | Chốt ngày 30/10/2026 |
| charmia | charmia | 80 | 45 | Chốt ngày 30/10/2026 |
| choptian | choptian | 90 | 48 | Chốt ngày 30/10/2026 |
| combra | combra | 80 | 44 | Chốt ngày 30/10/2026 |
| comca | comca | 90 | 95 | Chốt ngày 30/10/2026 |
| comic | comic | 85 | 47 | Chốt ngày 30/10/2026 |
| conden | conden | 65 | 48 | Chốt ngày 30/10/2026 |
| congpha | congpha | 85 | 34 | Chốt ngày 30/10/2026 |
| cons | cons | 80 | 97 | Chốt ngày 30/10/2026 |
| corepion | corepion | 65 | 99 | Chốt ngày 30/10/2026 |
| cornra | cornra | 85 | 48 | Chốt ngày 30/10/2026 |
| costmic | costmic | 75 | 92 | Chốt ngày 30/10/2026 |
| crapit | crapit_main | 100 | 24 | Chốt ngày 30/10/2026 |
| crapit | crapit_secondary | 40 | 24 | Chốt ngày 30/10/2026 |
| diana | diana | 70 | 54 | Chốt ngày 30/10/2026 |
| Diorai | Diorai | 70 | 84 | Chốt ngày 30/10/2026 |
| Domrico | Domrico | 90 | 100 | Chốt ngày 30/10/2026 |
| dong | dong | 85 | 96 | Chốt ngày 30/10/2026 |
| dracian | dracian | 95 | 40 | Chốt ngày 30/10/2026 |
| dragonight | dragonight | 100 | 49 | Chốt ngày 30/10/2026 |
| dragonmout | dragonmout | 95 | 21 | Chốt ngày 30/10/2026 |
| dragonot | dragonot | 100 | 49 | Chốt ngày 30/10/2026 |
| dump | dump | 80 | 110 | Chốt ngày 30/10/2026 |
| Epicti | Epicti | 80 | 120 | Chốt ngày 30/10/2026 |
| ethan | ethan | 85 | 72 | Chốt ngày 30/10/2026 |
| Evenl | Evenl | 70 | 89 | Chốt ngày 30/10/2026 |
| fireknight | fireknight | 90 | 91 | Chốt ngày 30/10/2026 |
| firemen | firemen | 70 | 116 | Chốt ngày 30/10/2026 |
| flybird | flybird | 80 | 49 | Chốt ngày 30/10/2026 |
| ghostian | ghostian | 85 | 22 | Chốt ngày 30/10/2026 |
| ghostic | ghostic | 85 | 38 | Chốt ngày 30/10/2026 |
| ... (117 nhân vật tiếp theo giữ nguyên theo mốc v8) ... | | | | |
| **vargost** | **vargost** | **75** | **83** | **Đang kiểm thử chuỗi combat (chưa chốt)** |
| vemou | vemou | 80 | 95 | Chốt ngày 30/10/2026 |
| venom | venom | 80 | 47 | Chốt ngày 30/10/2026 |
| wind | wind | 80 | 47 | Chốt ngày 30/10/2026 |
| zeus | zeus | 85 | 45 | Chốt ngày 30/10/2026 |
