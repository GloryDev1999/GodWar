# Hướng dẫn Vận hành Song song: Codex CLI & Antigravity (AGY) CLI

Tài liệu này chuẩn hóa và đồng bộ môi trường phát triển cho dự án **GodWar**, giúp bạn và hai AI agent (**Codex CLI** và **Antigravity / AGY CLI**) làm việc linh hoạt, xuyên suốt và có thể hoán đổi bất cứ lúc nào mà không bị gián đoạn bộ nhớ hay quy trình.

---

## 1. Kiến trúc Đồng bộ Song mã (Dual-Agent Architecture)

Cả hai agent cùng làm việc trên một nền tảng phần cứng và mã nguồn thống nhất:

| Thành phần | Cơ chế cho Codex CLI | Cơ chế cho AGY CLI | Điểm dùng chung |
| :--- | :--- | :--- | :--- |
| **Hiến pháp làm việc** | `~/.codex/instructions.md` | Auto-discovery `<RULE[.../AGENTS.md]>` | File gốc [AGENTS.md](file:///workspaces/GodWar/AGENTS.md) |
| **Bộ nhớ dự án** | Đọc & ghi `state.json` theo UTC | Đọc & ghi `state.json` theo UTC | File gốc [state.json](file:///workspaces/GodWar/state.json) |
| **Hệ thống Skill** | Symlink `~/.codex/skills` | Quét tự động `.agents/skills/` | Thư mục [.agents/skills/](file:///workspaces/GodWar/.agents/skills) |
| **Engine Godot** | Godot 4.3 Headless CLI | Godot 4.3 Headless CLI | `~/.local/bin/godot` |
| **Asset Viewer** | Localhost Node.js (cổng 4173) | Localhost Node.js (cổng 4173) | [server.mjs](file:///workspaces/GodWar/tools/asset-viewer/server.mjs) |
| **Điện toán đám mây** | Scripts Colab GPU A100 | Scripts Colab GPU A100 | Thư mục [scripts/](file:///workspaces/GodWar/scripts) |

---

## 2. Trình duyệt hoạt ảnh nhân vật Localhost (Asset Viewer)

Dự án có sẵn trình xem hoạt ảnh cục bộ cực nhẹ viết bằng Node.js thuần (không cần cài thêm `node_modules`).

### Khởi chạy server:
```bash
# Cách 1: Dùng npm script
npm run dev

# Cách 2: Chạy trực tiếp qua Node (hỗ trợ bind 0.0.0.0 cho Codespaces)
HOST=0.0.0.0 PORT=4173 node tools/asset-viewer/server.mjs
```

### Cách truy cập & kiểm thử:
- **URL**: [http://localhost:4173](http://localhost:4173) (Trong GitHub Codespaces: Mở tab **Ports** ở thanh dưới, click vào icon trình duyệt tại cổng `4173`).
- **Thử nghiệm nhân vật**:
  - Gõ tên nhân vật vào ô tìm kiếm (ví dụ: `Actem`, `Amore`, `Kikontai`, `Diorai`, `Samset`, ...).
  - Điều khiển: Play / Pause, tua từng frame (Next / Prev), điều chỉnh tốc độ (0.5x, 0.75x, 1x, 2x), lặp một khoảng frame (loop range).
  - So sánh: Chuyển đổi giữa các phiên bản (Source atlas, candidate tách nền, bản sửa lỗi).
  - Nền: Bật tắt nền sáng / nền tối để soi viền và các hạt nền xanh / logo còn sót.
- **Thử nghiệm tỷ lệ trên Map**:
  - Truy cập: [http://localhost:4173/amore-scene.html](http://localhost:4173/amore-scene.html) để kiểm tra nhân vật đứng và di chuyển trên map tỉ lệ 1920x1080.

### Kiểm thử tự động Asset Viewer:
```bash
npm test
```
*(Chạy 7 bài test kiểm tra clock timing, frame switching, canvas buffer và routes).*

---

## 3. Hệ thống Kỹ năng chung (Skill Interoperability)

Để cả hai agent dùng chung mọi kỹ năng mà không phải nhân bản file:

1. **Kho kỹ năng trung tâm**: Đặt toàn bộ kỹ năng tại `.agents/skills/<tên-skill>/SKILL.md`.
2. **Liên kết với Codex**:
   ```bash
   mkdir -p ~/.codex
   ln -sfn /workspaces/GodWar/.agents/skills ~/.codex/skills
   ln -sfn /workspaces/GodWar/AGENTS.md ~/.codex/instructions.md
   ```
3. **Kỹ năng hiện hành**:
   - `godwar-add-character` ([SKILL.md](file:///workspaces/GodWar/.agents/skills/godwar-add-character/SKILL.md)): Tự động kích hoạt khi có yêu cầu "Thêm char mới" hoặc nhập GIF nhân vật. Tự động kiểm tra hash, tách nền 2 đợt, đo chiều cao tham chiếu, đóng atlas Godot và tạo clip Sprite Forge.
   - `godwar-combat-character` ([SKILL.md](file:///workspaces/GodWar/.agents/skills/godwar-combat-character/SKILL.md)): Quy chuẩn xây dựng nhân vật chiến đấu 3v3 Auto-battler, hỗ trợ xuất phát và tác chiến cả 2 hướng Trái ⇋ Phải đối xứng qua pivot neo chân.
   - `godwar-agent-safeguard` ([SKILL.md](file:///workspaces/GodWar/.agents/skills/godwar-agent-safeguard/SKILL.md)): Cẩm nang tự vệ và bảo vệ tệp dự án dành cho AI agent trên máy tính/môi trường mới; 5 điều cấm kỵ, quy tắc không tạo file rác/backup, quy trình 6 bước và checklist kiểm chứng an toàn.
   - `godwar-pr-workflow` ([SKILL.md](file:///workspaces/GodWar/.agents/skills/godwar-pr-workflow/SKILL.md)): Quy chuẩn đồng bộ đa máy (Multi-Machine Sync), phân nhánh tính năng, xử lý xung đột tệp nhị phân asset / `state.json`, kiểm tra chất lượng và tạo / hợp nhất Pull Request an toàn cho GodWar.

---

## 4. Pipeline Godot 4.3 Headless CLI & Android Mobile

Hệ thống được thiết kế để build và test hoàn toàn qua giao diện dòng lệnh (CLI), tối ưu cho Codespace và headless CI/CD.

### Tự động khởi tạo môi trường:
Chạy script bootstrap để tự động tải Godot 4.3, Android SDK Build-Tools, ADB và Export Templates:
```bash
./scripts/bootstrap.sh
```

### Lệnh thực thi Godot CLI thông dụng:
- **Kiểm tra phiên bản engine:**
  ```bash
  godot --headless --version
  ```
- **Chạy script kiểm tra logic / asset:**
  ```bash
  godot --headless --script tools/check_approved_animations.gd
  ```
- **Đóng gói Android APK (1-Click):**
  ```bash
  ./scripts/build_android_apk.sh
  ```
  *File APK xuất ra tại: `build/GodWar-debug.apk`.*
- **Nạp APK lên thiết bị Android qua Wi-Fi:**
  ```bash
  ./scripts/adb_install_phone.sh <IP_THIẾT_BỊ:PORT>
  ```

---

## 5. Tận dụng Google Colab GPU (Render nặng & AI Generation)

Khi cần thực hiện các tác vụ nặng (như chạy mô hình AI tách nền phức tạp, sinh master sprite mới hoặc render video), sử dụng GPU từ xa của Google Colab:

### Các bước kết nối:
1. **Khởi động phiên GPU A100 / L4:**
   ```bash
   ./scripts/colab_start_a100.sh
   ```
   *(Lần đầu tiên chạy, Colab CLI sẽ cung cấp 1 liên kết URL xác thực Google OAuth. Mở link trên trình duyệt, lấy mã xác thực và dán vào terminal).*

2. **Cài đặt thư viện AI trên Colab:**
   ```bash
   ./scripts/colab_setup_env.sh
   ```
   *Script tự động cài đặt PyTorch, CUDA, `transformers`, `diffusers`, `rembg`, `accelerate`.*

3. **Chạy tác vụ từ xa:**
   ```bash
   colab exec -s "godwar-render" "python your_heavy_render_script.py"
   ```

4. **Giải phóng GPU sau khi xong:**
   ```bash
   ./scripts/colab_stop.sh
   ```
   *Rất quan trọng: Luôn tắt session để tiết kiệm Compute Units của tài khoản Colab.*

---

## 6. Quy trình bàn giao phiên giữa Codex CLI và AGY CLI

Trước khi kết thúc lượt làm việc hoặc chuyển giao agent:
1. **Chạy toàn bộ bài kiểm thử:**
   - `npm test` (Asset viewer & pipeline)
   - `python3 -m unittest discover tests` (GIF extraction & processing)
2. **Kiểm tra git status:**
   - Đảm bảo các file rác hoặc file tạm không bị commit bừa bãi.
3. **Cập nhật `state.json`:**
   - Ghi nhận `updated_at_utc` chính xác.
   - Bổ sung nội dung vào `current_task` hoặc `history`.
   - Liệt kê các kiểm thử đã chạy thực tế và các việc còn tồn đọng/cần người dùng quyết định.
