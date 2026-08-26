-- ============================================================================
-- GP-ERP ENTERPRISE: DATABASE TABLE MIGRATION SCRIPT (SQL SERVER)
-- Chuyển đổi toàn bộ tên bảng từ Tiếng Anh sang Tiếng Việt không dấu
-- Sử dụng thủ tục hệ thống sp_rename để bảo toàn 100% dữ liệu, khóa chính, khóa ngoại
-- ============================================================================

USE [POS_WEB]; -- Thay đổi tên Database nếu cần
GO

PRINT 'Bắt đầu quá trình đổi tên bảng sang Tiếng Việt không dấu...';

-- 1. Người dùng & Phân quyền
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'User')
    EXEC sp_rename 'User', 'NguoiDung';

-- 2. Sản phẩm & Quy đổi đơn vị tính
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Product')
    EXEC sp_rename 'Product', 'SanPham';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductUOMConversion')
    EXEC sp_rename 'ProductUOMConversion', 'QuyDoiDonViTinh';

-- 3. Khách hàng & CRM
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Customer')
    EXEC sp_rename 'Customer', 'KhachHang';

-- 4. Bán hàng POS & Hóa đơn
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Order')
    EXEC sp_rename 'Order', 'HoaDon';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItem')
    EXEC sp_rename 'OrderItem', 'ChiTietHoaDon';

-- 5. Ca làm việc thu ngân
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CashShift')
    EXEC sp_rename 'CashShift', 'CaBanHang';

-- 6. Nhật ký kho & Phiếu nhập kho
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'InventoryLog')
    EXEC sp_rename 'InventoryLog', 'NhatKyKho';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'StockGoodsReceipt')
    EXEC sp_rename 'StockGoodsReceipt', 'PhieuNhapKho';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'StockGoodsReceiptItem')
    EXEC sp_rename 'StockGoodsReceiptItem', 'ChiTietPhieuNhapKho';

-- 7. Báo giá khách hàng
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'PriceQuote')
    EXEC sp_rename 'PriceQuote', 'BaoGia';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'PriceQuoteItem')
    EXEC sp_rename 'PriceQuoteItem', 'ChiTietBaoGia';

-- 8. Định mức sản xuất & BOM
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductCosting')
    EXEC sp_rename 'ProductCosting', 'DinhMucSanXuat';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'CostingBOMItem')
    EXEC sp_rename 'CostingBOMItem', 'ChiTietDinhMucBOM';

-- 9. Tài sản doanh nghiệp
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EnterpriseAsset')
    EXEC sp_rename 'EnterpriseAsset', 'TaiSanDoanhNghiep';

-- 10. Bảo hành & Serial
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'WarrantyTicket')
    EXEC sp_rename 'WarrantyTicket', 'PhieuBaoHanh';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'WarrantyPartItem')
    EXEC sp_rename 'WarrantyPartItem', 'LinhKienBaoHanh';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'WarrantyTimelineEvent')
    EXEC sp_rename 'WarrantyTimelineEvent', 'NhatKyBaoHanh';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SerialDeviceRecord')
    EXEC sp_rename 'SerialDeviceRecord', 'SoSerialThietBi';

-- 11. Hóa đơn điện tử
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EInvoice')
    EXEC sp_rename 'EInvoice', 'HoaDonDienTu';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EInvoiceItem')
    EXEC sp_rename 'EInvoiceItem', 'ChiTietHoaDonDienTu';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'InboundEInvoice')
    EXEC sp_rename 'InboundEInvoice', 'HoaDonDauVao';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'InboundInvoiceItem')
    EXEC sp_rename 'InboundInvoiceItem', 'ChiTietHoaDonDauVao';

-- 12. Hợp đồng lao động & Nhân sự
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'LaborContract')
    EXEC sp_rename 'LaborContract', 'HopDongLaoDong';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Employee')
    EXEC sp_rename 'Employee', 'NhanVien';

-- 13. Sổ thu chi kế toán & Cài đặt
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AccountingRecord')
    EXEC sp_rename 'AccountingRecord', 'SoThuChiKeToan';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Promotion')
    EXEC sp_rename 'Promotion', 'ChuongTrinhKhuyenMai';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'FraudAlert')
    EXEC sp_rename 'FraudAlert', 'CanhBaoGianLan';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'StoreSettings')
    EXEC sp_rename 'StoreSettings', 'CauHinhCuaHang';

-- 14. Nhà cung cấp & Bảng giá NCC
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Supplier')
    EXEC sp_rename 'Supplier', 'NhaCungCap';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SupplierPriceItem')
    EXEC sp_rename 'SupplierPriceItem', 'BangGiaNhaCungCap';

-- 15. Đơn đặt hàng mua
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'PurchaseOrder')
    EXEC sp_rename 'PurchaseOrder', 'DonDatHangMua';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'PurchaseOrderItem')
    EXEC sp_rename 'PurchaseOrderItem', 'ChiTietDonDatHangMua';

-- 16. Phiếu đổi trả hàng
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ReturnOrder')
    EXEC sp_rename 'ReturnOrder', 'PhieuTraHang';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ReturnOrderItem')
    EXEC sp_rename 'ReturnOrderItem', 'ChiTietPhieuTraHang';

-- 17. Phiếu điều chuyển kho
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'StockTransfer')
    EXEC sp_rename 'StockTransfer', 'PhieuDieuChuyenKho';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'StockTransferItem')
    EXEC sp_rename 'StockTransferItem', 'ChiTietDieuChuyenKho';

PRINT 'Hoàn tất chuyển đổi tên bảng Database sang Tiếng Việt không dấu thành công 100%!';
GO
