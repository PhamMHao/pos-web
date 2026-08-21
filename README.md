# 🚀 GP-ERP Enterprise (Gia Phúc Computer POS & ERP)

> **Hệ thống Quản Trị Doanh Nghiệp Toàn Diện (ERP) & Bán Hàng (POS)** chuyên sâu cho chuỗi cửa hàng máy tính, linh kiện, dịch vụ bảo hành & lắp ráp máy bộ PC.

---

## 🌟 Phân Hệ Tính Năng Cốt Lõi

1. **Bán Hàng Tại Quầy (POS)**
   - Đa Đơn Vị Tính Quy Đổi (Multi-UOM: Cái, Thùng, Hộp, Cuộn, Mét, Kg...).
   - Chiết khấu đơn hàng, mã giảm giá/Voucher, tính thuế VAT tự động.
   - Hỗ trợ đa hình thức thanh toán: Tiền mặt, Chuyển khoản QR, Thẻ ngân hàng, Ví điện tử, Ghi nợ khách hàng.
   - In hóa đơn nhiệt K80 và in phiếu A4/A5 chuẩn doanh nghiệp.
   - Xuất hóa đơn điện tử chuẩn Nghị định 123 / Thông tư 78.

2. **Tự Động Kích Hoạt Bảo Hành & Sổ Serial/IMEI**
   - Tự động liên thông đơn hàng POS ➔ Tạo hồ sơ thiết bị `SerialDeviceRecord` với thời hạn bảo hành (12/24/36 tháng).
   - Tra cứu nhanh hạn bảo hành và lịch sử sửa chữa thông qua quét mã vạch/QR/Serial.

3. **Định Mức BOM & Lệnh Lắp Ráp Máy Tính (BOM Production)**
   - Xây dựng định mức BOM 3 trụ cột: Chi phí vật tư, Chi phí nhân công trực tiếp, Chi phí máy móc chung.
   - **Lệnh Lắp Ráp / Xuất Xưởng**: Tự động kiểm tra tồn kho linh kiện, trừ số lượng linh kiện thành phần và tăng tồn kho PC nguyên bộ.

4. **Hóa Đơn Điện Tử Đầu Vào XML (Inbound Invoice)**
   - Đọc và phân tích tệp XML hóa đơn điện tử từ các nhà phân phối lớn (FPT Synnex, Digiworld, Viễn Sơn...).
   - Tự động đối soát và khớp mã sản phẩm kho.
   - **Duyệt & Đẩy vào kho hàng**: Tự động tính toán lại **Giá vốn bình quân gia quyền (Weighted Average Cost)** và cập nhật sổ kế toán.

5. **Quản Lý Kho Hàng & Tồn Kho**
   - Cảnh báo tồn kho dưới mức tối thiểu.
   - Phiếu kiểm kê và điều chỉnh kho theo thời gian thực.
   - Nhật ký xuất nhập tồn chi tiết (`InventoryLog`).

6. **Báo Giá & Hợp Đồng Dự Án (Price Quotes)**
   - Lập báo giá chuyên nghiệp gửi đối tác/khách hàng.
   - 1-Click chuyển đổi báo giá thành Đơn hàng POS.

7. **Sổ Quỹ Kế Toán (Thu / Chi)**
   - Theo dõi dòng tiền thu chi tự động từ đơn bán hàng và nhập hàng NCC.
   - Báo cáo tài chính và lợi nhuận kinh doanh.

8. **Quản Lý Nhân Sự & Hợp Đồng Lao Động (HR)**
   - Quản lý hồ sơ nhân viên, phân ca, doanh số KPI và tỷ lệ hoa hồng.
   - Hợp đồng lao động điện tử.

9. **Quản Lý Tài Sản Doanh Nghiệp (Assets)**
   - Danh mục tài sản, máy móc, trang thiết bị.
   - Tự động tính khấu hao tài sản theo thời gian.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite.
- **Backend**: Node.js, Express, Prisma ORM, Zod Validation, Microsoft SQL Server Client (`mssql`).
- **Database**: Microsoft SQL Server (tương thích SQL Server 2008 R2 / 2012 / 2019 / 2022).
- **Architecture**: Modular Monolith, RESTful APIs, Clean Architecture.

---

## 🚀 Cài Đặt & Chạy Dự Án

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình biến môi trường (`.env`):
```env
PORT=3000
DATABASE_URL="sqlserver://localhost:1433;database=POS_WEB;user=sa;password=YourPassword;trustServerCertificate=true"
JWT_SECRET="your-jwt-secret"
```

### 3. Đồng bộ cơ sở dữ liệu:
```bash
npx prisma generate
npx prisma db push
```

### 4. Khởi chạy ứng dụng:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`.

---

## 📄 License
Phát triển bởi **Gia Phúc Computer**. Mọi quyền được bảo lưu.
