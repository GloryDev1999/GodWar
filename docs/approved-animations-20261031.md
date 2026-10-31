# Danh sách hoạt ảnh chốt ngày 31/10/2026 (Mốc v9)

Tổng cộng 177 mục (178 profile). Chi tiết hash và đường dẫn atlas nằm tại [`Asset/Character/characters/approved-animations-20261031-v9.json`](file:///workspaces/GodWar/Asset/Character/characters/approved-animations-20261031-v9.json).

## Điểm nhấn mốc v9: Chốt Chuỗi Hoạt Ảnh Chiến Đấu Vargost

Theo yêu cầu của người dùng ngày 31/10/2026, nhân vật **Vargost** được chính thức chốt ở phiên bản kiểm thử combat hoàn chỉnh:
- **Bộ hoạt ảnh cơ thể (83 frame, chiều cao 75 px, lưới 2×2 texel):**
  - `Idle`: 22 frame lơ lửng tuần hoàn (0..43, loop 0..21).
  - `Cast Windup`: 21 frame tụ vòng lửa trên đầu (45..65).
  - `Cast Release`: Frame 66, vươn tay đẩy vòng lửa với điểm xuất phát chuẩn `[dx: +20, dy: -52]`.
  - `Cast Recovery`: 16 frame thu tay sạch sẽ (67..82), loại bỏ hoàn toàn vết cắt hình vuông ở mép phải và tàn lửa ở chân; giữ 100% chi tiết thân, áo choàng, tay và trượng với mép ngoài tự nhiên chỉ 2–4 pixel.
  - Atlas lưu tại: [`Asset/Character/characters/vargost_combat/vargost_body_atlas.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/vargost_body_atlas.png) và [`Asset/Character/measured_atlas_pilots/vargost/atlas_000.png`](file:///workspaces/GodWar/Asset/Character/measured_atlas_pilots/vargost/atlas_000.png) (SHA-256: `c7003dc6cef7a9bfcc4757166b33fa52f4401a55ecc76cd26040b83307b2de55`).
  - Bản atlas cũ trước khi chốt đã được lưu trữ an toàn tại `Asset/Character/archive/vargost_before_combat_freeze/`.
- **Đạn vòng lửa xoay 8 frame:**
  - 8 góc xoay 45° liên tục, kích thước 80×80 px trên lưới hạt 2×2 texel.
  - Tốc độ bay 900 px/s, chu kỳ xoay 35 ms/frame.
  - Atlas lưu tại: [`Asset/Character/characters/vargost_combat/projectile_sheet.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/projectile_sheet.png) (SHA-256: `ec4c89454db7ddb1c2110d23e6335fefd2ff7357f5015994b072151a7aa6988d`).
- **Hiệu ứng nổ mặt đất (91 frame):**
  - Chuẩn hóa đồng bộ 100% mật độ hạt 2×2 texel với phong cách đồ họa Vargost.
  - Atlas lưu tại: [`Asset/Character/characters/vargost_combat/vfx_fire_explosion_sheet.png`](file:///workspaces/GodWar/Asset/Character/characters/vargost_combat/vfx_fire_explosion_sheet.png) (SHA-256: `c4d99ff52414cb96796da3fc615274f30d47c404289679ae1155451c478abc14`).
- **Quy tắc Utility AI & Hoạt ảnh di chuyển:**
  - Tầm đánh chuẩn `[150px – 550px]`, tự động kiting lùi khi quá gần hoặc bay áp sát khi quá xa @ 900 px/s.
  - Hoạt ảnh di chuyển: Bay tới nghiêng $+12^\circ$ kèm vệt bóng mờ quán tính, Bay lùi nghiêng $-10^\circ$, Hạ cánh đáp nền đá $Y=194$ (squash va chạm + vòng bụi), Cất cánh bay lên bầu trời $Y=65$.
- **Bộ công cụ trực quan:**
  - Trình kiểm thử: [`tools/asset-viewer/vargost-skill-test.html`](file:///workspaces/GodWar/tools/asset-viewer/vargost-skill-test.html) và [`vargost-skill-test.js`](file:///workspaces/GodWar/tools/asset-viewer/vargost-skill-test.js).
  - Tích hợp Kính Lúp Pixel 10× có lưới ô pixel, đọc tọa độ Canvas, tọa độ tương đối từ neo (dx, dy), mã màu HEX/RGBA và nút click-to-pick gán điểm phóng.

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
| **vargost** | **vargost** | **75** | **83** | **Chốt Chuỗi Combat ngày 31/10/2026 (v9)** |
| vemou | vemou | 80 | 95 | Chốt ngày 30/10/2026 |
| venom | venom | 80 | 47 | Chốt ngày 30/10/2026 |
| wind | wind | 80 | 47 | Chốt ngày 30/10/2026 |
| zeus | zeus | 85 | 45 | Chốt ngày 30/10/2026 |
