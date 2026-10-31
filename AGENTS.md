# Hiến pháp làm việc của agent — GodWar

## Sự thật và hiểu biết

- Đọc mã, cấu hình, dữ liệu nguồn và hướng dẫn liên quan trước khi thay đổi hoặc kết luận. Không giả định hành vi của dự án khi chưa kiểm chứng.
- Không bịa mã, dữ liệu, tên nhân vật, hoạt ảnh, tính năng, kết quả kiểm thử hay bằng chứng. Phân biệt rõ thông tin đã kiểm chứng, suy luận, giả định và việc còn thiếu.
- Khi thông tin thiếu có ảnh hưởng đến quyết định hoặc không thể suy ra từ dự án, hỏi người dùng; vẫn tiếp tục những phần độc lập đã được cho phép. Không tự coi thời gian chờ là câu trả lời.
- Không báo hoàn thành khi còn yêu cầu hoặc kiểm thử cần thiết chưa thực hiện. Báo rõ phạm vi, giới hạn, lỗi và những việc chưa hoàn tất.

## Thực hiện và kiểm chứng

- Chia công việc lớn thành các bước có thể kiểm tra; cập nhật trạng thái và bằng chứng thực tế trong tài liệu theo dõi của dự án.
- Chạy các kiểm thử phù hợp với thay đổi; kiểm tra đường đi chính, các trường hợp biên quan trọng và tích hợp liên quan. Báo lệnh, kết quả và giới hạn; không gọi kiểm thử là đã chạy nếu chưa chạy.
- Nếu thiếu thiết bị, dữ liệu, quyền hoặc công cụ để kiểm tra, ghi rõ phần chưa kiểm chứng và cách kiểm chứng. Không chốt chất lượng phát hành khi chưa có bằng chứng thích hợp.
- Bảo vệ dữ liệu gốc và thay đổi hiện có của người dùng. Mọi xử lý asset phải có đường dẫn về nguồn, có thể tái tạo và không ghi đè nguồn GIF gốc ban đầu.
- **Quy tắc chỉnh sửa asset hoàn thiện nhân vật:** Trong quá trình dựng và tinh chỉnh asset theo phản hồi/yêu cầu của người dùng, mọi chỉnh sửa/sửa lỗi phải được **ghi đè trực tiếp lên asset cũ** để đảm bảo tính nhất quán, tránh nhầm lẫn giữa các phiên bản và **không tạo bản backup cho các bản cũ/bản lỗi** nhằm tránh phình to dung lượng repository.
- Với GIF: không mặc định tên file là danh tính nhân vật hay một đoạn là động tác/skill khi chưa xem và xác nhận. Ghi riêng dữ kiện quan sát, dữ liệu còn thiếu và các quyết định cần người dùng duyệt.
- Ưu tiên Godot 4 và mobile; việc tối ưu, kiểm tra Android/iOS và thiết bị thật phải có số liệu trước khi tuyên bố đạt mục tiêu.

## Mục tiêu sản phẩm

- GodWar hướng tới game mobile đối kháng tự động (Auto-battler / Utility AI 3v3 trên mobile): Hai đội (mỗi đội 3 nhân vật = 6 nhân vật) được thả vào map ngang 1920×1080 (phát triển từ scene Thử tỷ lệ Amore/Vargost).
- Cơ chế điều khiển: Nhân vật tự động vận hành hoàn toàn bằng **Utility AI** (mỗi model/class có tư duy và trọng số quyết định riêng: di chuyển, bay, chọn mục tiêu, kích hoạt skill đúng thời điểm, Tanker che chắn cho đồng đội, Healer ưu tiên hồi máu đồng đội nguy cấp).
- Mục tiêu trận đấu & Điều kiện thắng: Ở giữa map có 1 vật phẩm / cứ điểm tranh chấp. Đội nào có nhân vật đứng trong vùng chiếm giữ vật phẩm liên tục trong **15 giây** (không bị tấn công ngắt quãng hoặc rời vùng) thì chiến thắng. Cả hai đội liên tục giao tranh và tranh đoạt vị trí này.
- Lộ trình kỹ thuật: Bắt đầu chuẩn hóa model đầu tiên với **Vargost**, phân rã và ghép toàn bộ hoạt ảnh thành chuỗi hành động hoàn chỉnh (State Machine: Idle, Move/Fly, Windup, Release Projectile, Recovery, Impact VFX), làm nền tảng nạp vào bộ não Utility AI.
- Đây là định hướng sản phẩm chính thức do người dùng xác nhận ngày 2026-10-31. Các agent khi tiếp nhận dự án phải bám sát mục tiêu này để xây dựng kiến trúc mã nguồn và asset đồng bộ.

## Bộ nhớ dự án và bàn giao phiên

- Khi bắt đầu hoặc tiếp tục công việc, đọc `state.json` ở thư mục gốc, kiểm tra `git status` và đọc các nguồn liên quan trước khi hành động. `state.json` là điểm bắt đầu, không thay thế mã, tài liệu gốc hay yêu cầu mới của người dùng; khi có mâu thuẫn, kiểm tra nguồn và cập nhật lại trạng thái.
- Sau mỗi task, kể cả task dở dang, bị chặn hoặc chỉ nghiên cứu, cập nhật `state.json` trước khi báo kết quả: mục tiêu và tình trạng liên quan, thay đổi, bằng chứng/đường dẫn, kiểm thử thực sự đã chạy và kết quả, phần chưa kiểm chứng, việc tiếp theo và trở ngại hoặc quyết định còn chờ. Ghi mốc thời gian UTC và giữ JSON hợp lệ.
- Khi công việc dài, cập nhật tại các mốc có thể kiểm tra và trước khi bàn giao hoặc dừng; nếu phiên bị ngắt đột ngột, agent tiếp theo phải đối chiếu trạng thái với thực tế. Không coi ghi chép cũ là bằng chứng rằng tình trạng hiện tại vẫn đúng.
- Giữ trạng thái ngắn gọn, ưu tiên thông tin giúp tiếp tục công việc; dẫn tới tài liệu chi tiết thay vì sao chép. Không xóa lịch sử hoặc thay đổi của người khác tùy tiện, không lưu bí mật hay thông tin nhạy cảm. Nếu không thể cập nhật, nêu rõ lý do và nội dung bàn giao trong phản hồi.
