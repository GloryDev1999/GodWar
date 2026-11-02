# Sword Altar — item asset (video mp4 của anh)

Kiếm pha lê (xanh/tím/hồng) nhấp nhô + nghiêng nhẹ phía trên bệ đá đen
(khăn đỏ, tinh thể xanh, đá tím), kèm tia lửa tím bay lên và tan dần.
Bệ đá đứng yên, chỉ có kiếm và tia lửa chuyển động.

- Kích thước: 434×620, 55 frame, 10 fps (100ms/frame), tổng 5,5s, lặp kín.
- Giữ nguyên độ phân giải gốc 1:1, KHÔNG convert xuống pixel (để giữ chi tiết
  lưỡi kiếm và bệ đá). Nền tím xám phẳng (46,45,76) đã tách trong suốt.
- Cách dùng trong Godot: AnimatedSprite2D hoặc Sprite2D với SpriteFrames 55 frame,
  tốc độ 10 fps. Dùng **Normal** (đây là vật phẩm, không phải tia sáng).
- File: `frames/` (55 PNG trong suốt), `atlas.png` (lưới 8×7), `frames.json`,
  `preview.gif` (xem trước, nền trong suốt).
- File GIF giữ nguyên nền gốc: `sword_altar_original.gif` (cùng thư mục ngoài).
- Nguồn: video mp4 anh gửi (640×800, 10 fps, 55 frame). Không cắt frame nào.
