# Burst Sao Phải (VFX Collection Vol 8 — hiệu ứng phải)

Nguồn: GIF "VFX COLLECTION - VOL 8" của kiddolonk
lấy từ link ảnh Bing (file img.itch.zone),
1920×1080, 15 frame, 20 fps. GIF gốc có 3 hiệu
ứng đứng cạnh nhau; đây là hiệu ứng bên phải,
đã tách riêng.

## Nội dung

- **15 frame, 632×820, 20 fps, 0,75 giây**.
- Diễn biến (thứ tự đã XOAY về đúng vòng kỹ
  năng, vì GIF gốc bắt đầu giữa chừng ở đoạn
  nổ): cầu tối hình thành → cầu hồng có lõi
  trắng kèm tia sét xanh → sao 4 cánh trắng →
  burst chữ X xanh → burst sao trắng vàng lớn
  (đỉnh, kèm tia ngang dọc) → burst hoa vàng →
  hoa cam đỏ tàn dần → mảnh xám tan dần → 2
  frame trống cuối (nhịp nghỉ nối lại được với
  cầu đầu khi lặp).
- Thứ tự frame trong pack: frame gốc 10, 11, 12,
  13, 14, 15, 1, 2, 3, 4, 5, 6, 7, 8, 9 (bảng ánh
  xạ đầy đủ trong frames.json).
- Neo: tâm burst sao, giữ nguyên vị trí mọi frame.

## Cách tách

- Đã là pixel sẵn nên KHÔNG convert, giữ nguyên
  pixel gốc 1:1, chỉ xóa nền phẳng (34,28,26)
  bằng khóa màu chính xác.
- Tách theo vị trí: vùng phải x1288–1920.
- Lưu ý: tia ngang dọc của burst sao vốn dài
  vượt khỏi thân burst nên ở các frame đỉnh tia
  sẽ chạm mép pack (bị cắt ở biên) — đó là đúng
  hình gốc, không phải lỗi cắt; khi gắn vào game
  nên để anchor ở tâm burst và chừa khoảng trống
  xung quanh cho tia.
- Đã kiểm tra: 4 góc mọi frame đều trong suốt
  hoàn toàn, không còn vệt nền nào.

## File trong pack

- `frames/frame_001.png` … `frame_015.png` — PNG
  RGBA trong suốt, 632×820
- `atlas.png` — bảng ghép 4×4 (2528×3280)
- `frames.json` — danh sách frame, fps, kích thước
- `preview.gif` — xem trước đúng kích thước gốc,
  20 fps, 15 frame

## Gợi ý dùng trong Godot

- Chạy đúng 20 fps (50 ms/frame).
- Nên dùng Additive blending (burst sao phát sáng
  sẽ đẹp nhất trên nền tối).
- Anchor ở tâm burst sao.
