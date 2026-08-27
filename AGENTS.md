# 📌 GP-ERP Enterprise - Quy Chuẩn Phát Triển & Quy Tắc Dự Án (Project Rules)

Tất cả các prompt và tác vụ phát triển code trong dự án **GP-ERP Enterprise** BẮT BUỘC tuân thủ nghiêm ngặt các quy tắc sau:

---

## 🚫 1. TUYỆT ĐỐI KHÔNG MOCK DATA TRONG SOURCE CODE
* **KHÔNG** tạo các biến, mảng dữ liệu mẫu hardcode trong source code (ví dụ: `const mockData = [...]`, `const dummyUsers = [...]`, `const initialSampleItems = [...]`).
* **KHÔNG** mock API response tạm thời ở frontend hoặc backend.
* **KHÔNG** lưu trạng thái nghiệp vụ lâu dài chỉ vào local state/in-memory biến tạm khi yêu cầu nghiệp vụ là lưu trữ.

---

## 💾 2. DỮ LIỆU PHẢI LƯU THẲNG VÀO DATABASE (DB)
* Mọi thao tác Thêm, Sửa, Xóa, Lấy dữ liệu (CRUD) và trạng thái nghiệp vụ PHẢI tương tác trực tiếp với cơ sở dữ liệu qua **Prisma ORM** và các API backend (`server/modules/...`, `server.ts`).
* Dữ liệu hiển thị trên giao diện người dùng (UI) PHẢI được fetch trực tiếp từ API backend kết nối DB thật.

---

## 🚀 3. QUY TRÌNH CHUẨN KHI PHÁT TRIỂN CHỨC NĂNG MỚI (NEW FEATURE WORKFLOW)
Khi được yêu cầu phát triển hoặc bổ sung một chức năng mới:
1. **Database & Schema**:
   * Kiểm tra và cập nhật model trong `prisma/schema.prisma` (nếu cần bảng hoặc trường mới).
   * Chạy `npx prisma generate` và `npx prisma db push` để đồng bộ cơ sở dữ liệu.
2. **Seed Data Vào DB (Thay vì Mock Data)**:
   * Viết hoặc cập nhật dữ liệu seed vào `prisma/seed.ts` hoặc `prisma/seedData.ts` (hoặc tạo script seed riêng).
   * Seed dữ liệu trực tiếp vào Database (`npx prisma db seed` / `npm run prisma:seed`).
   * Dữ liệu ban đầu để hiển thị lên màn hình PHẢI xuất phát từ DB thông qua quá trình seed này.
3. **Backend API**:
   * Xây dựng Controller, Service, Route trong `server/modules/<feature>/` và đăng ký route vào `server.ts`.
   * Sử dụng Prisma Client để truy vấn và lưu dữ liệu thực tế vào DB.
4. **Frontend UI**:
   * Xây dựng giao diện hoàn chỉnh (React, TypeScript, Tailwind CSS, Lucide icons).
   * Gọi API backend để lấy dữ liệu thực từ DB về render.
   * **Không tạo giao diện mẫu / placeholder vô nghĩa**: Giao diện phải gắn liền với nghiệp vụ thực tế, có xử lý trạng thái Loading, Empty, Error và CRUD đầy đủ.

---

## 🛠️ 4. KIẾN TRÚC & CÔNG NGHỆ CHÍNH
* **Backend**: Express.js (Node.js), TypeScript, Prisma ORM, Zod Validation, Microsoft SQL Server Client (`mssql`).
* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons, Recharts, Vite.
* **Database**: Microsoft SQL Server.
* **Scripts hữu ích**:
  * `npm run dev`: Chạy server & frontend Vite.
  * `npx prisma generate`: Tạo Prisma client.
  * `npx prisma db push`: Đồng bộ schema vào DB.
  * `npm run prisma:seed`: Nạp dữ liệu seed vào DB.
