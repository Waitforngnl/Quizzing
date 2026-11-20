# 📘 OnQuiz - Nền Tảng Thi Trắc Nghiệm Trực Tuyến

Hệ thống thi trắc nghiệm trực tuyến (Full-stack Web Application) cho phép tạo, quản lý, làm bài thi và thống kê báo cáo kết quả chi tiết.
Ứng dụng được xây dựng trên nền tảng **Meteor.js**, **React**, **Node.js (Express)**, **TypeScript** và **PostgreSQL**.

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

- **Frontend (Client)**: React 18 + TypeScript, chạy tại `http://localhost:3000` (được phục vụ bởi Meteor).
- **Backend (Server)**: Express.js REST API + PostgreSQL Pool, lắng nghe tại cổng `http://localhost:5000` (khởi chạy cùng tiến trình server của Meteor).
- **Database**: PostgreSQL (quản lý bảng và các Stored Procedures / Functions thông qua `db-migrate`).

---

## 🛠️ Yêu Cầu Cài Đặt (Prerequisites)

1. **Node.js**: Phiên bản 18+ hoặc 20+ (khuyến nghị).
2. **Meteor CLI**: Đã cài đặt trên máy.
   - Nếu chưa cài đặt, chạy lệnh:
     ```bash
     npm install -g meteor
     ```
   - Kiểm tra phiên bản:
     ```bash
     meteor --version
     ```
3. **PostgreSQL**: Đang chạy dịch vụ PostgreSQL (mặc định cổng `5432`).
4. **db-migrate**: Công cụ chạy migrations database:
   ```bash
   npm install -g db-migrate db-migrate-pg
   ```

---

## 🔐 Cấu Hình Môi Trường (Configuration)

### 1. File `.env` (ở thư mục gốc project)
Tạo hoặc kiểm tra file `.env` tại thư mục gốc:

```env
DATABASE_URL=postgres://postgres:your_password@localhost:5432/quiz_web
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```
> *Lưu ý: Thay `your_password` bằng mật khẩu tài khoản PostgreSQL của bạn.*

### 2. File `database.json` (dùng cho công cụ migration db-migrate)
Tạo file `database.json` ở thư mục gốc:

```json
{
  "dev": {
    "driver": "pg",
    "user": "postgres",
    "password": "your_password",
    "host": "localhost",
    "port": 5432,
    "database": "quiz_web"
  }
}
```

---

## 🗄️ Khởi Tạo Database & Chạy Migrations

1. **Tạo Database trên PostgreSQL**:
   Mở công cụ dòng lệnh `psql` hoặc **pgAdmin** và chạy:
   ```sql
   CREATE DATABASE quiz_web;
   ```

2. **Chạy Migration để tạo toàn bộ bảng & SQL Functions**:
   Tại thư mục gốc của project, thực hiện lệnh:
   ```bash
   db-migrate up
   ```
   *Lệnh này sẽ tự động chạy các tệp script trong thư mục `migrations/` để tạo các bảng `users`, `quizzes`, `questions`, `quiz_attempts`, `quiz_enrollments` cùng các hàm PL/pgSQL liên quan.*

---

## 🚀 Hướng Dẫn Chạy Chương Trình

### Bước 1: Cài đặt dependencies (nếu chưa cài)
```bash
npm install
```

### Bước 2: Khởi chạy toàn bộ ứng dụng
Chạy một lệnh duy nhất:
```bash
npm start
```
*(Lệnh này thực thi `env-cmd meteor run`, tự động nạp các biến môi trường từ `.env` và khởi động song song Frontend & Backend)*

### Bước 3: Truy cập ứng dụng
- **Giao diện Web (Frontend)**: Mở trình duyệt và truy cập vào [http://localhost:3000](http://localhost:3000)
- **API Server (Backend)**: Đang hoạt động tại [http://localhost:5000](http://localhost:5000)

---

## 🎯 Kịch Bản Dùng Thử / Chạy Mẫu (Workflow Demo)

1. **Đăng ký tài khoản (Register)**:
   - Truy cập `http://localhost:3000`, bấm **"Đăng ký ngay"**.
   - Nhập Tên đăng nhập, Email và Mật khẩu để tạo tài khoản mới.
   
2. **Đăng nhập (Login)**:
   - Nhập thông tin tài khoản vừa tạo để đăng nhập vào trang chính (`MainDashboard`).

3. **Tạo Đề Thi (Create Quiz)**:
   - Tại tab **"Cá nhân"**, chọn **"Tạo Quiz mới"**.
   - Nhập tên bài thi, thiết lập trạng thái:
     - `Công khai (Public)`: Mọi người đều có thể thấy và tham gia.
     - `Ẩn (Private)`: Cần có mã truy cập (`Access Code`) để vào thi.
   - Thêm câu hỏi trắc nghiệm / tự luận cùng đáp án đúng.

4. **Làm Bài Thi (Take Quiz)**:
   - Chuyển sang tab **"Khám phá"** để tham gia các đề thi nổi bật, hoặc tìm kiếm theo tên/mã đề.
   - Bấm **"Tham gia"** -> Thực hiện bài thi và bấm **"Nộp bài"** để xem điểm số ngay lập tức.

5. **Xem Thống Kê (Statistics)**:
   - Tại tab **"Thống kê"**, chọn bài thi đã tạo để xem:
     - Tổng số lượt làm bài, Điểm trung bình, Tỉ lệ đạt.
     - Bảng xếp hạng điểm số của thí sinh.
     - Phân tích tỉ lệ đúng/sai theo từng câu hỏi.

---

## 📂 Cấu Trúc Thư Mục Chính

```
Quiz_Web/
├── .agents/skills/          # Các Agent Skills cài đặt cho dự án
├── client/                  # Entry point React Client (main.tsx, main.css)
├── server/                  # Entry point Express Server (main.ts, routes.ts, db.ts)
├── imports/
│   ├── Controller/          # Bộ điều khiển (Quiz, Attempt, Auth, Middleware)
│   ├── Model/               # Định nghĩa Model và truy vấn DB (User, Quiz, Question)
│   ├── View/                # Giao diện UI (MainDashboard, Layout, Statistics, PersonalInfo,...)
│   ├── ui/                  # Component đăng nhập / đăng ký / quên mật khẩu
│   └── api/                 # Cầu nối gọi HTTP API giữa Client và Backend
├── migrations/              # Kịch bản di chuyển cấu trúc dữ liệu PostgreSQL
└── package.json             # Cấu hình dự án và dependencies
```
