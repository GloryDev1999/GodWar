# Cầu Lửa (Fire Orb)

Nguồn: ảnh GIF "VFX COMPLETE SET - Season 3" lấy từ
link tìm kiếm Bing (file gốc trên img.itch.zone),
1920×1080, 22 frame, 16,67 fps (60 ms/frame).
Bản này là 1 trong 4 hiệu ứng tách ra từ GIF đó
(không convert lại — giữ nguyên pixel gốc).

## Nội dung

- Pack lấy **trọn bộ 22 frame, 1,32 giây, giữ đúng
  16,67 fps thật của GIF gốc**.
- Diễn biến: chấm hồng nhỏ → chấm đỏ thẫm → cầu
  hồng có gai đỏ → cầu đỏ → cầu lửa vàng cam hình
  thành, lửa cháy trên đỉnh → cầu giữ nguyên, cháy
  đều → cầu sụp xuống, xoáy đỏ rồi vỡ thành tàn
  lửa bay ra.
- Kích thước: **620×620** (giữ nguyên độ phân giải
  gốc, không thu nhỏ — anh thu nhỏ trong Godot
  nếu cần).
- Neo: tâm cầu, giữ nguyên vị trí mọi frame.

## Cách tách

- GIF gốc không phải lưới cố định: các hiệu ứng
  mọc lên, lớn dần rồi tàn ở vị trí và thời điểm
  khác nhau nên em tách theo vùng + thời gian +
  màu sắc. Cầu xanh ở trên, cầu lửa ở dưới, không
  chồng nhau trong cùng 1 frame nhưng vùng bao của
  chúng phủ nhau qua các frame nên em tách bằng
  màu: điểm ảnh lửa (B-R ≤ 0, kể cả phần đáy cầu
  màu tím hồng) giữ lại, điểm ảnh xanh loại bỏ;
  điểm ảnh trung tính (chớp trắng) chia theo vị
  trí (y ≥ 515 giữ lại). Đã đo kiểm: 0 điểm ảnh
  xanh lọt vào bản này.
- Nền gốc là màu phẳng (34,28,26) nên tách nền
  bằng khóa màu chính xác: điểm ảnh bằng đúng màu
  nền → trong suốt, còn lại giữ nguyên 100% (alpha
  chỉ có 0 hoặc 255, không mờ).
- Lưu ý: tia sét trắng nối giữa cầu xanh và cầu lửa
  (ví dụ frame 10) bị chia đôi theo vị trí — bản
  này giữ nửa dưới của tia, nhìn vẫn như tia sét
  ngắn, không lỗi.

## File trong pack

- `frames/frame_001.png` … `frame_022.png` — PNG RGBA
  trong suốt, 620×620
- `atlas.png` — bảng ghép 5×5 (3100×3100)
- `frames.json` — danh sách frame, fps, kích thước
- `preview.gif` — xem trước đúng kích thước gốc,
  16,67 fps, 22 frame

## Gợi ý dùng trong Godot

- Chạy đúng 16,67 fps (60 ms/frame).
- Nên dùng Additive blending: cầu lửa sáng trên nền
  tối sẽ rực nhất; Normal cũng dùng được nếu muốn
  giữ màu trầm hơn.
- Anchor ở tâm cầu.
