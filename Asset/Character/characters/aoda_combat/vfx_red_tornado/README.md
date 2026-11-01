# Lốc Xoáy Đỏ (Red Tornado)

Nguồn: ảnh GIF "VFX COMPLETE SET - Season 3" lấy từ
link tìm kiếm Bing (file gốc trên img.itch.zone),
1920×1080, 22 frame, 16,67 fps (60 ms/frame).
Bản này là 1 trong 4 hiệu ứng tách ra từ GIF đó
(không convert lại — giữ nguyên pixel gốc).

## Nội dung

- Pack lấy **15 frame (frame gốc 1–15), 0,9 giây,
  giữ đúng 16,67 fps thật của GIF gốc**.
- Diễn biến: xoáy nhỏ xuất hiện ở mặt đất → lớn
  dần thành lốc xoáy đỏ cao → giữ nguyên → vỡ
  thành mảnh rồi mờ dần thành tàn lửa.
- Kích thước: **700×690** (giữ nguyên độ phân giải
  gốc, không thu nhỏ — anh thu nhỏ trong Godot
  nếu cần).
- Neo: đáy lốc (điểm chạm đất) ở giữa-dưới khung
  hình, giữ nguyên vị trí mọi frame nên gắn vào
  vị trí mặt đất là chạy đúng.

## Cách tách

- GIF gốc không phải lưới cố định: các hiệu ứng
  mọc lên, lớn dần rồi tàn ở vị trí và thời điểm
  khác nhau nên em tách theo vùng + thời gian +
  màu sắc. Lốc đỏ và lốc tím mọc cạnh nhau, lúc
  to nhất đỉnh lốc chạm nhau nên không cắt dọc
  được — em tách bằng màu: điểm ảnh đỏ (B-R ≤ -40)
  giữ lại, điểm ảnh tím loại bỏ; điểm ảnh trung
  tính (lõi trắng, mảnh vụn xám) chia theo vị trí
  (x < 650 giữ lại). Đã đo kiểm: 0 điểm ảnh tím
  lọt vào bản này, lốc không bị cắt phẳng đỉnh.
- Nền gốc là màu phẳng (34,28,26) nên tách nền
  bằng khóa màu chính xác: điểm ảnh bằng đúng màu
  nền → trong suốt, còn lại giữ nguyên 100% (alpha
  chỉ có 0 hoặc 255, không mờ). Khe giữa các vòng
  xoáy về trong suốt đúng như bản gốc.
- Chỉ lấy frame 1–15 (lốc tàn xong ở frame 15, từ
  frame 16 trở đi vùng này không còn lốc nữa).

## File trong pack

- `frames/frame_001.png` … `frame_015.png` — PNG RGBA
  trong suốt, 700×690
- `atlas.png` — bảng ghép 4×4 (2800×2760)
- `frames.json` — danh sách frame, fps, kích thước
- `preview.gif` — xem trước đúng kích thước gốc,
  16,67 fps, 15 frame

## Gợi ý dùng trong Godot

- Chạy đúng 16,67 fps (60 ms/frame).
- Nên dùng Normal blending (lốc có màu đặc, không
  phải hiệu ứng sáng thuần).
- Anchor ở đáy giữa (điểm chạm đất).
