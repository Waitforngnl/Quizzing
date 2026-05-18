# 🎓 MCQ Exam & Class Management System

Hệ thống quản lý thi trắc nghiệm trực tuyến toàn diện với các phân quyền: Admin, Teacher và Student.

## ⚙️ Hướng dẫn cài đặt & Khởi chạy

Dự án yêu cầu chạy song song Frontend và Backend ở 2 terminal khác nhau.

### 1. Cài đặt biến môi trường (Environment Variables) ✅
Copy file `backend/.env.example` ra thư mục gốc (hoặc thư mục backend) và đổi tên thành `.env`.
Ví dụ cấu hình `.env`:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/mcq_db
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development

```

*(Lưu ý: Giữ bảo mật `JWT_SECRET` khi deploy production và thay thế `MONGODB_URI` bằng link database thực tế của bạn).*

### 2. Khởi chạy Backend (Mở Terminal 1)

```bash
cd backend
npm install
npm run dev

```

### 3. Reset Database & Tạo Dữ liệu mẫu (Tùy chọn)

Tại terminal của backend, chạy lệnh sau để tự động tạo dữ liệu demo:

```bash
npm run seed

```

**Tài khoản Demo (Password chung: `123`):**

* Admin: `admin@test.com`
* Teacher: `teacher@test.com`
* Student: `student@test.com`

### 4. Khởi chạy Frontend (Mở Terminal 2)

```bash
cd frontend
npm install
npm run dev

```

---

## 🧪 Hướng dẫn Test các chức năng hệ thống

### 👤 1. Đăng ký / Đăng nhập

* [ ] Đăng ký tài khoản **Student** và **Teacher** (UI + API) và đăng nhập thành công.
* [ ] Đăng nhập kiểm tra phân quyền bằng các tài khoản demo: Admin, Teacher, Student.

### 👨‍🏫 2. Chức năng Giáo viên (Teacher)

* [ ] **Quản lý lớp học:** Tạo lớp mới, lấy mã tham gia (join code). Thêm sinh viên vào lớp thủ công hoặc **Import danh sách từ file Excel**.
* [ ] **Ngân hàng câu hỏi:** Tạo câu hỏi thủ công hoặc **Import hàng loạt (CSV / XLSX)**. Kiểm tra validation (môn/khối phải đồng nhất).
* [ ] **Quản lý kỳ thi:** Tạo kỳ thi từ ngân hàng (hoặc bộ import), kiểm tra tính năng auto-prefill môn/khối.
* [ ] Cấu hình kỳ thi: Phân phối kỳ thi cho một **Lớp học cụ thể**, giới hạn thời gian, đảo ngẫu nhiên câu hỏi.
* [ ] **Lịch sử bài thi:** Mở lịch sử bài thi, xem bảng điểm của sinh viên và thử tính năng Export CSV.

### 👨‍🎓 3. Chức năng Học sinh (Student)

* [ ] **Tham gia lớp học:** Nhập mã Code do giáo viên cung cấp để gia nhập lớp và nhận bài thi.
* [ ] **Làm bài thi:** Tham gia vào bài thi đang diễn ra, chọn đáp án, nộp bài. Kiểm tra tính năng tự động thu bài khi đồng hồ đếm ngược hết giờ.
* [ ] **Xem điểm:** Xem Lịch sử thi và Xem lại (Review) chi tiết bài làm đúng/sai.
* [ ] Kiểm tra giao diện tự động ẩn bài thi khi kỳ thi chưa mở, hoặc hiện trạng thái "Đã hoàn thành".

### 🛡️ 4. Chức năng Quản trị (Admin)

* [ ] Tạo / Sửa / Xóa tài khoản Student/Teacher. Thay đổi Role người dùng.
* [ ] **Tạo tài khoản hàng loạt:** Kéo thả file Excel để hệ thống tự động đăng ký hàng loạt tài khoản.
* [ ] **Audit Log:** Kiểm tra hệ thống có ghi nhận đúng các hành động (Đăng xuất, tạo/xóa câu hỏi, tạo/xóa exam...) hay không.

### 💾 5. Kiểm tra tính toàn vẹn dữ liệu (Seed Data)

* [ ] Chạy `npm run seed` và xác nhận hệ thống có sẵn 3 Exams demo với các trạng thái: Upcoming (Sắp diễn ra), Ongoing (Đang diễn ra) và Finished (Đã kết thúc).
