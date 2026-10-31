# VFX nổ lửa mặt đất — bản 2D pixel (từ video Pinterest)

Nguồn: skill_vfx_source.mp4 (1258×646, 30fps, 119 frame).
Hiệu ứng: quả cầu lửa nổ trên mặt đất, chuyển thành đá ember rồi để lại
vết nứt phát sáng, tổng cộng 91 frame dùng được (frame gốc 12–102).

## Cách làm
- Nền sàn đá đứng yên nên tách nền bằng cách trừ nền: lấy trung vị của
  các frame sàn trống làm nền chuẩn, alpha mềm theo độ khác biệt.
  Watermark tĩnh của video gốc cũng bị trừ nền loại bỏ cùng lúc.
- Chuyển pixel: downscale NEAREST về 128×66 (giữ nguyên tỉ lệ khung gốc),
  không ép palette hẹp để giữ gradient phát sáng của lửa.
- GIF phóng 4× NEAREST lên 512×264 để nhìn rõ hạt pixel, nền trong suốt,
  lặp vô hạn, 30fps.

## File trong pack
- pixel_frames/frame_000.png … frame_090.png: 91 frame RGBA 128×66.
- vfx_fire_explosion_sheet.png: atlas 13 cột × 7 hàng (1664×462).
- frames.json: thông số frame, fps, kích thước, phương pháp.
- vfx_fire_explosion_pixel.gif: 91 frame, 512×264, nền trong suốt.
- README_VFX_PIXEL.md: file này.

## Cách dùng trong game
- Dùng bình thường với alpha (Normal blending).
- Muốn lửa rực hơn thì dùng Additive blending, vì phần sáng đã tách sạch.
- Lưu ý: asset dẹt 128×66 theo đúng tỉ lệ video gốc; khói giữ dạng
  bán trong suốt nên trên nền sáng sẽ mờ hơn trên nền tối.
