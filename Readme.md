# 🎬 Movie Reservation System — A-Z Guide

Chào mừng bạn đến với hệ thống đặt vé xem phim chuyên nghiệp phiên bản hiện đại! Dưới đây là hướng dẫn chi tiết để bạn làm chủ toàn bộ hệ thống này từ cài đặt đến vận hành.

---

## 1. Cài đặt và Khởi động (Setup)

Hệ thống gồm 2 phần chính: **Backend (ASP.NET API)** và **Frontend (Vite + React)**.

### a. Khởi động Database (Docker)
Máy của bạn cần cài đặt **Docker Desktop**.
1. Mở terminal tại thư mục `movie/movieReservation.API`.
2. Chạy lệnh: `docker compose up -d postgres`.
3. Kiểm tra cổng: Database sẽ chạy tại cổng **5433**.

### b. Khởi động Backend (API)
Bạn cần **.NET 8 SDK**.
1. Mở project trong **Rider** hoặc VS Code.
2. Nhấn **Run** hoặc dùng lệnh: `dotnet run`.
3. API sẽ chạy tại: `http://localhost:5176`.
4. Xem tài liệu API (Swagger) tại: `http://localhost:5176/swagger`.

### c. Khởi động Frontend
Bạn cần **Node.js**.
1. Di chuyển vào thư mục `movie/movie-reservation`.
2. Chạy: `npm install` (nếu là lần đầu).
3. Chạy: `npm run dev`.
4. Trang web sẽ chạy tại: `http://localhost:5173` (hoặc cổng lân cận tùy máy).

---

## 2. Tài khoản Đăng nhập Mẫu (Seed Data)

Hệ thống đã được cài đặt sẵn các tài khoản để bạn test nhanh:

| Vai trò | Email | Mật khẩu | Chức năng chính |
|---------|-------|----------|-----------------|
| **Admin** | `admin@example.com` | `admin123` | Quản lý phim, rạp, cài đặt Email |
| **Manager** | `manager@example.com` | `manager123` | Quản lý rạp và suất chiếu |
| **Customer** | `user@example.com` | `password123` | Đặt vé, xem lịch sử |

---

## 3. Cấu hình Email SMTP (Admin)

Để hệ thống gửi được Email chào mừng và vé xem phim, Admin cần cấu hình:
1. Đăng nhập bằng tài khoản **Admin**.
2. Vào mục **Settings > Email Configuration**.
3. Điền thông tin:
   - **SMTP Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Gmail của bạn.
   - **Password**: **App Password** của Google (mật khẩu ứng dụng 16 ký tự).
   - **From Email/Name**: Địa chỉ và tên hiển thị khi gửi.
4. Gạt nút **Status** sang **Enabled**.
5. Nhấn **Save All Settings**.

---

## 4. Quản lý Email Template (Dynamic)

Bạn có thể chỉnh sửa nội dung Email trực tiếp tại trang Admin mà không cần sửa code.

### Placeholder (Các biến động)
Sử dụng các ký hiệu sau trong Template để hệ thống tự điền thông tin:
- `{{name}}`: Tên người dùng.
- `{{movieTitle}}`: Tên phim đã đặt.
- `{{seats}}`: Danh sách ghế (VD: A1, A2).
- `{{totalPrice}}`: Tổng tiền vé.
- `{{bookingId}}`: Mã đặt vé (dùng để tạo QR Code).

### Cách sửa:
1. Copy HTML từ tệp `email_templates.md`.
2. Dán vào khung soạn thảo **Welcome Email** hoặc **Booking Email**.
3. Nhấn **Save**.

---

## 5. Xử lý sự cố (Troubleshooting)

### Lỗi "Fail to save settings"
- **Nguyên nhân**: Database cũ chưa có các cột mới (WelcomeEmailSubject, ...).
- **Khắc phục**: Tôi đã thêm cơ chế **Self-Healing** trong `Program.cs`. Chỉ cần bạn khởi động lại API, nó sẽ tự động nâng cấp Database cho bạn.

### Không nhận được Email
- Kiểm tra lại **App Password** của Gmail.
- Kiểm tra xem đã bật chế độ **Enabled** trong Settings chưa.
- Kiểm tra mục **Spam** trong hộp thư.

### Lỗi CORS (Khi đổi cổng)
- Nếu thay đổi cổng của Frontend (VD: sang 3001), hãy thêm cổng đó vào danh sách `WithOrigins` trong tệp `Program.cs` của Backend.

---

*Chúc bạn vận hành hệ thống thành công! Nếu có câu hỏi, hãy liên hệ với người phát triển.* 
