export type ProductCategory = 
  | 'Gạo & Nông Sản'
  | 'Sữa & Sản phẩm từ Sữa'
  | 'Mì & Thực phẩm ăn liền'
  | 'Gia vị & Dầu ăn'
  | 'Nước giải khát & Bia'
  | 'Điện tử & Cáp điện'
  | 'Dược phẩm & Y tế'
  | 'Gia dụng & Đời sống'
  | 'Thời trang & Phụ kiện';

export interface UOMOption {
  unit: string; // VD: 'Thùng', 'Cuộn', 'Mét', 'Kg', 'Gam', 'Hộp', 'Lốc', 'Lon', 'Gói'
  ratioToBase: number; // 1 Đơn vị này = bao nhiêu Đơn vị cơ bản (base unit) để tính trừ kho chính xác
  costPrice: number; // Giá vốn tương ứng với ĐVT này
  sellingPrice: number; // Giá bán lẻ tương ứng với ĐVT này
  barcode?: string;
  isBase?: boolean;
  referenceUnit?: string; // Đơn vị tính chuyển đổi / tham chiếu (VD: 'Cuộn', 'Mét', 'Kg', 'Gam', 'Thùng')
  conversionRate?: number; // Hệ số chuyển đổi so với referenceUnit (VD: 1 Thùng = 10 Cuộn, 1 Cuộn = 100 Mét, 1 Cuộn = 1.3 Kg, 1 Cuộn = 1300 Gam)
  description?: string; // e.g., '1 Thùng = 10 Cuộn = 1000m = 13kg = 13000g'
}

export type ProductLifecycleStage = 
  | 'new_inbound' // Nhập Mới
  | 'in_storage' // Lưu Kho Chuẩn
  | 'on_display' // Đang Bày Bán / Trưng Bày
  | 'reserved' // Đã Đặt / Giữ Hàng Dự Án
  | 'audited' // Đã Kiểm Kê Đạt Chuẩn
  | 'under_repair' // Bảo Hành / Sửa Chữa
  | 'liquidation' // Thanh Lý / Xuất Hủy
  | 'discontinued'; // Ngừng Kinh Doanh

export interface ProductLifecycleLog {
  id: string;
  timestamp: string;
  stage: ProductLifecycleStage;
  warehouse: string;
  storageLocation: string;
  batchNumber?: string;
  expiryDate?: string;
  actionBy: string;
  note: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: ProductCategory | string;
  unit: string; // Đơn vị tính cơ bản
  costPrice: number; // Giá vốn (theo đơn vị cơ bản)
  sellingPrice: number; // Giá bán (theo đơn vị cơ bản)
  stock: number; // Tồn kho hiện tại (theo đơn vị cơ bản)
  minStock: number; // Cảnh báo tồn tối thiểu
  image: string;
  warehouse?: string; // Tên kho lưu trữ (VD: 'Kho Chính Gia Phúc Computer', 'Kho Kỹ Thuật & Showroom',...)
  storageLocation?: string; // Vị trí lưu kho / Kệ / Dãy / Ô (VD: 'Kệ A1-02', 'Dãy B - Tầng 3', 'Tủ Phụ Kiện 01')
  description?: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  uomTags?: string[]; // e.g., ['5 ĐVT', '3 Quy cách']
  weightOrVolume?: string;
  uomConversions?: UOMOption[]; // Danh sách đơn vị tính quy đổi đa năng
  lifecycleStage?: ProductLifecycleStage;
  batchNumber?: string; // Mã Lô sản xuất (Lot / Batch)
  expiryDate?: string; // Hạn sử dụng (YYYY-MM-DD)
  manufactureDate?: string; // Ngày sản xuất (YYYY-MM-DD)
  lifecycleLogs?: ProductLifecycleLog[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUOM?: string; // Đơn vị tính được chọn khi bán hàng (VD: 'Thùng', 'Cuộn', 'Mét', 'Kg', 'Gam')
  unitPrice?: number; // Đơn giá theo ĐVT đang chọn
  costPrice?: number; // Giá vốn theo ĐVT đang chọn
  ratioToBase?: number; // Tỷ lệ quy đổi so với đơn vị gốc để trừ kho chính xác
  discountPercent: number; // Giảm % trên từng món
  customPrice?: number;
  note?: string;
}

export type OrderChannel = 'Tại quầy (POS)' | 'Website' | 'Shopee' | 'TikTok Shop' | 'Lazada' | 'Facebook/Zalo';

export type OrderStatus = 
  | 'pending' // Chờ xác nhận
  | 'confirmed' // Đã xác nhận
  | 'processing' // Đang đóng gói
  | 'shipping' // Đang giao hàng
  | 'completed' // Hoàn tất
  | 'cancelled' // Đã hủy
  | 'refunded'; // Hoàn trả

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'momo' | 'debt';

export interface Order {
  id: string;
  code: string; // VD: DH-10029
  channel: OrderChannel;
  status: OrderStatus;
  customer?: {
    id: string;
    name: string;
    phone: string;
    address?: string;
    rank?: CustomerTier;
  };
  items: {
    productId: string;
    productName: string;
    sku: string;
    unit?: string;
    ratioToBase?: number;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discountPercent: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxRate: number; // % VAT
  taxAmount: number;
  shippingFee: number;
  shippingPartner?: string;
  trackingCode?: string;
  codAmount?: number; // Tiền thu hộ COD
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  stockIssued?: boolean; // Đã thực hiện xuất kho trừ tồn
  stockIssuedAt?: string;
  stockIssuedBy?: string;
  deliveryStatus?: 'pending_pickup' | 'in_transit' | 'delivered' | 'delivery_failed' | 'returned';
  deliveryNotes?: string;
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  changeAmount: number;
  note?: string;
  createdAt: string;
  completedAt?: string;
}

export type CustomerTier = 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  tier: CustomerTier;
  points: number; // Điểm tích lũy (1000đ = 1đ)
  totalSpent: number;
  totalOrders: number;
  debt: number; // Công nợ
  note?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'import' | 'export' | 'audit_adjustment' | 'sale_deduct';
  quantityChange: number; // + hoặc -
  oldStock: number;
  newStock: number;
  unitPrice?: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CashShift {
  id: string;
  shiftName: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;
  cashSales: number;
  transferSales: number;
  cardSales: number;
  otherSales: number;
  totalSales: number;
  cashWithdrawals: number;
  expectedEndingCash: number;
  actualEndingCash?: number;
  note?: string;
  status: 'open' | 'closed';
}

export type PaperSize = 'A4' | 'A5' | 'K80' | 'K58';

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  currency: string;
  vatDefault: number;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  bankCode: string; // MB, VCB, TCB, etc.
  receiptHeaderNote: string;
  receiptFooterNote: string;
  autoPrintReceipt: boolean;
  enableSoundEffects: boolean;
  lowStockThresholdDefault: number;
  theme?: 'dark' | 'light';
  // Extended Company & Print Profile
  logoUrl?: string;
  brandName?: string; // e.g. 'GIA PHÚC Computer'
  companyLegalName?: string; // e.g. 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC'
  zaloPhone?: string; // e.g. '0985 862 609 - 0914 665 994'
  faxPhone?: string; // e.g. '(0274) 3579 789'
  website?: string; // e.g. 'www.vitinhgiaphuc.com'
  defaultWarehouse?: string; // e.g. 'Kho Chính Gia Phúc Computer'
  defaultCreatorName?: string; // e.g. 'MR. THƠM'
  warehouseList?: string[]; // Danh sách các kho
  storageLocations?: string[]; // Danh sách các vị trí lưu kho kệ/ô
  customCategories?: string[]; // Danh sách nhóm hàng bổ sung
  defaultPrintPaperSize?: PaperSize;
  defaultPrintOrientation?: 'portrait' | 'landscape';
  defaultEmptyRowsCount?: number;
  defaultSignatureStyle?: 'two_blocks' | 'five_blocks';
  defaultShowVietQR?: boolean;
  defaultShowLogo?: boolean;
  defaultDeliveryTerms?: string;
  // Per-form custom configurations
  printDocConfigs?: Partial<
    Record<
      PrintDocType,
      {
        paperSize: PaperSize;
        orientation: 'portrait' | 'landscape';
        emptyRowsCount: number;
        signatureStyle: 'two_blocks' | 'five_blocks';
        showVietQR: boolean;
      }
    >
  >;
  // Hardware Printer & Cash Drawer
  printerConnectionType?: 'browser' | 'usb_escpos' | 'network_escpos' | 'bluetooth';
  printerIpAddress?: string;
  printerPort?: number;
  printerModel?: string;
  autoCutPaper?: boolean;
  openDrawerOnPayment?: boolean;
  // Hardware Barcode Scanner
  scannerMode?: 'hid_keyboard' | 'webusb' | 'serial' | 'camera';
  scannerBeepSound?: boolean;
  scannerAutoEnter?: boolean;
  scannerMinLength?: number;
  scannerDebounceMs?: number;
  // E-Invoice specifics
  eInvoiceSymbol?: string; // e.g. '1C26TGP'
  eInvoiceTemplate?: string; // e.g. '1/001'
  eInvoiceLookupUrl?: string; // e.g. 'https://hoadondientu.gdt.gov.vn'
  certProvider?: string; // e.g. 'VIETTEL-CA'
  // Barcode & QR Code Label Customization
  labelPrintSettings?: LabelPrintSettings;
  // Labor Contract specifics
  companyRepresentative?: string; // e.g. 'Phạm Gia Phúc'
  companyRepresentativeRole?: string; // e.g. 'Giám Đốc'
  companyIdCard?: string;
  companyIdCardDate?: string;
  companyIdCardPlace?: string;
  companyNationality?: string;
}

export interface LabelTargetConfig {
  templateSize: '30x20' | '35x22' | '40x30' | '50x30' | '60x40' | '75x50' | '100x70' | 'custom';
  customWidthMm?: number;
  customHeightMm?: number;
  columns?: number; // 1, 2, 3
  gapMm?: number;
  codeType: 'barcode' | 'qrcode' | 'both';
  showBrand: boolean;
  brandText?: string;
  showName: boolean;
  showPrice: boolean; // Giá bán hoặc Nguyên giá
  showCodeText: boolean; // SKU / Mã tài sản / Barcode
  showUnit?: boolean; // Đơn vị tính
  showLocation?: boolean; // Vị trí kho / Phòng ban
  showDate?: boolean; // Ngày mua / Ngày nhập
  fontSizeBrand?: number;
  fontSizeTitle?: number;
  fontSizePrice?: number;
  fontSizeCode?: number;
  barcodeHeight?: number;
}

export interface LabelPrintSettings {
  product: LabelTargetConfig;
  asset: LabelTargetConfig;
  material: LabelTargetConfig;
}

export type PrintDocType = 
  | 'sales_invoice' // HÓA ĐƠN BÁN HÀNG (Mẫu Gia Phúc Computer theo ảnh thực tế)
  | 'sales_order' // ĐƠN ĐẶT HÀNG (Ảnh 1)
  | 'goods_receipt' // PHIẾU NHẬP KHO (Ảnh 2)
  | 'exchange_return' // PHIẾU ĐỔI TRẢ HÀNG HÓA KIÊM PHIẾU NHẬP XUẤT (Ảnh 4)
  | 'warranty_intake' // PHIẾU NHẬN HÀNG BẢO HÀNH (Ảnh 5)
  | 'warranty_return' // PHIẾU TRẢ HÀNG BẢO HÀNH (Ảnh 6)
  | 'delivery_note' // PHIẾU XUẤT KHO KIÊM GIAO HÀNG
  | 'warranty_receipt' // PHIẾU BÁN HÀNG & BẢO HÀNH
  | 'payment_receipt' // PHIẾU THU TIỀN
  | 'einvoice_vat' // HÓA ĐƠN GTGT TT78
  | 'quote'
  | 'asset_handover' // PHIẾU BÀN GIAO & CUNG CẤP TÀI SẢN
  | 'asset_transfer' // PHIẾU ĐIỀU CHUYỂN TÀI SẢN / KHO
  | 'stock_disposal' // BIÊN BẢN TIÊU HỦY VẬT TƯ & TÀI SẢN
  | 'liquidation_receipt' // PHIẾU THU TIỀN THANH LÝ (THU HỒI VỐN)
  | 'delivery_dispatch' // PHIẾU ĐIỀU PHỐI GIAO HÀNG & THU TIỀN COD
  | 'shipping_label' // TEM VẬN ĐƠN DÁN KIỆN HÀNG (K80 / A5)
  | 'goods_delivery_record' // BIÊN BẢN GIAO NHẬN HÀNG HÓA (Theo Ảnh 1)
  | 'sales_return'; // PHIẾU HÀNG BÁN TRẢ LẠI MẪU 02-TT TT200 (Theo Ảnh 2)

// Enterprise Module Types
export interface AccountingRecord {
  id: string;
  code: string;
  type: 'income' | 'expense';
  category: 'Bán hàng' | 'Nhập hàng' | 'Chi lương nhân viên' | 'Thuế VAT' | 'Mặt bằng & Điện nước' | 'Thu nợ khách' | 'Khác' | string;
  amount: number;
  date: string;
  party: string; // Đối tác / Khách hàng / Nhà cung cấp
  paymentMethod: PaymentMethod;
  status: 'completed' | 'pending' | 'cancelled';
  note?: string;
  receiptNumber?: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  role: 'Thu Ngân' | 'Thủ Kho' | 'Kế Toán' | 'Quản Lý Cửa Hàng' | 'Nhân Viên Bán Hàng';
  phone: string;
  email: string;
  baseSalary: number; // Lương cứng
  salesKpiTarget: number; // Chỉ tiêu doanh số
  currentSales: number; // Doanh số đạt được
  commissionRate: number; // % hoa hồng
  status: 'active' | 'leave' | 'inactive';
  avatar?: string;
  joinedDate: string;
  shiftSchedule: string; // e.g. "Ca Sáng (06:00 - 14:00)"
}

export type QuoteLifecycleStatus = 
  | 'draft' // Dự Thảo
  | 'sent' // Đã Gửi Khách
  | 'negotiating' // Đang Đàm Phán
  | 'approved' // Đã Duyệt Chốt
  | 'converted_to_order' // Đã Chuyển Đơn Hàng POS
  | 'completed' // ĐÃ HOÀN THÀNH (Nghiệm thu tất toán)
  | 'rejected'; // Khách Từ Chối

export interface QuoteLifecycleEvent {
  id: string;
  timestamp: string;
  author: string;
  fromStatus: QuoteLifecycleStatus;
  toStatus: QuoteLifecycleStatus;
  note: string;
  discountAdjustment?: number;
}

export interface PriceQuote {
  id: string;
  code: string; // BG-2026-001
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  totalAmount: number;
  discountPercent: number;
  finalTotal: number;
  validUntil: string;
  status: QuoteLifecycleStatus;
  items: {
    productName: string;
    sku: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: string;
  notes?: string;
  negotiationNotes?: string;
  completedAt?: string;
  orderCode?: string;
  lifecycleHistory?: QuoteLifecycleEvent[];
}

export interface ProductCosting {
  id: string;
  productName: string;
  sku: string;
  rawMaterialsCost: number; // Chi phí nguyên vật liệu (BOM)
  laborCost: number; // Chi phí nhân công trực tiếp
  machineryAndOverheadCost: number; // Chi phí khấu hao & vận hành
  totalStandardCost: number; // Giá vốn định mức
  currentSellingPrice: number; // Giá bán hiện tại
  grossMarginPercent: number; // Tỷ suất lãi gộp %
  bomItems: {
    materialName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }[];
  lastUpdated: string;
}

export interface EnterpriseAsset {
  id: string;
  code: string; // TS-001
  name: string;
  category: 'Thiết bị bán hàng POS' | 'Máy móc & Băng chuyền' | 'Phương tiện vận tải' | 'Nội thất & Quầy kệ';
  purchaseDate: string;
  originalValue: number; // Nguyên giá
  depreciationMonths: number; // Thời gian khấu hao
  remainingValue: number; // Giá trị còn lại
  assignedTo: string; // Nhân sự / Vị trí chịu trách nhiệm
  status: 'good' | 'maintenance_required' | 'broken' | 'liquidated';
  lastMaintenanceDate?: string;
}

export interface FraudAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  source: 'POS' | 'CashShift' | 'Inventory' | 'Accounting';
  status: 'unresolved' | 'investigating' | 'resolved';
  suggestedAction: string;
}

// Warranty & Maintenance Module Types
export type WarrantyTicketType = 'warranty' | 'maintenance' | 'repair';

export type WarrantyStatus =
  | 'received' // Mới tiếp nhận
  | 'diagnosing' // Đang kiểm tra & chẩn đoán
  | 'repairing' // Đang sửa chữa / bảo dưỡng
  | 'waiting_parts' // Chờ linh kiện thay thế
  | 'sent_vendor' // Chuyển hãng bảo hành
  | 'ready_to_return' // Đã xử lý xong / Sẵn sàng bàn giao
  | 'returned' // Đã bàn giao trả khách
  | 'replaced_new' // Đã đổi mới (1 đổi 1)
  | 'unrepairable'; // Không thể sửa / Trả lại nguyên trạng

export type WarrantyPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WarrantyPartItem {
  id: string;
  partName: string; // Tên linh kiện thay thế
  sku?: string;
  quantity: number;
  unit: string;
  unitPrice: number; // Đơn giá linh kiện
  isUnderWarranty: boolean; // Miễn phí hay tính phí
  warrantyMonths: number; // Thời gian bảo hành linh kiện
}

export interface WarrantyTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
  status: WarrantyStatus;
}

export interface WarrantyTicket {
  id: string;
  code: string; // Mã phiếu: BH-2026-001, BT-2026-002, SC-2026-003
  type: WarrantyTicketType; // Bảo hành, Bảo trì định kỳ, Sửa chữa dịch vụ
  priority: WarrantyPriority;
  status: WarrantyStatus;
  
  // Product & Identification
  orderCode?: string; // Mã hóa đơn mua ban đầu
  productId?: string;
  productName: string; // Tên sản phẩm / thiết bị
  model?: string;
  serialNumber: string; // Số Serial / IMEI duy nhất
  qrCodeUrl?: string; // Link/Code QR tra cứu
  barcode?: string;
  
  // Customer
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  
  // Condition & Issue
  accessoriesIncluded: string; // Phụ kiện kèm theo (Dây nguồn, củ sạc, hộp...)
  cosmeticCondition: string; // Tình trạng ngoại quan khi nhận (Trầy xước, nguyên vẹn tem...)
  issueDescription: string; // Hiện tượng lỗi / Yêu cầu bảo trì
  technicianDiagnosis?: string; // Kết quả kiểm tra của kỹ thuật viên
  resolution?: string; // Phương án xử lý (Thay tụ, vệ sinh bảo dưỡng, hàn mạch...)
  
  // Technician & Dates
  technicianName: string; // Kỹ thuật viên phụ trách
  receivedDate: string; // Ngày tiếp nhận
  expectedReturnDate: string; // Hạn hẹn trả
  actualReturnDate?: string; // Ngày thực tế bàn giao
  
  // Costs & Billing
  parts: WarrantyPartItem[];
  laborCost: number; // Tiền công dịch vụ
  partsCost: number; // Tổng tiền linh kiện
  discountAmount: number; // Giảm giá
  totalFee: number; // Tổng chi phí (0đ nếu bảo hành miễn phí)
  paymentStatus: 'free' | 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  
  // Handover Info
  returnedToPerson?: string; // Tên người nhận khi trả hàng
  returnNote?: string; // Ghi chú bàn giao
  warrantyExtensionMonths?: number; // Thời hạn bảo hành tiếp theo sau sửa chữa (tháng)
  
  // History Logs
  timeline: WarrantyTimelineEvent[];
}

export interface SerialDeviceRecord {
  id: string;
  serialNumber: string; // Số Serial / IMEI
  productName: string;
  sku: string;
  soldOrderCode?: string;
  soldDate?: string;
  customerName?: string;
  customerPhone?: string;
  warrantyPeriodMonths: number;
  warrantyExpiryDate: string;
  warrantyStatus: 'valid' | 'expired' | 'voided';
  totalRepairsCount: number;
  totalMaintenancesCount: number;
  notes?: string;
}

// Electronic Invoice (Hóa Đơn Điện Tử - TT78 & NĐ123)
export type EInvoiceStatus = 
  | 'draft' // Hóa đơn dự thảo (chưa ký)
  | 'signed' // Đã ký số điện tử
  | 'sent_cqt' // Đã gửi Tổng Cục Thuế cấp mã
  | 'cqt_approved' // CQT Đã cấp mã hợp lệ (Có mã CQT)
  | 'cancelled' // Đã hủy / Bị thay thế
  | 'adjusted'; // Hóa đơn điều chỉnh

export type EInvoiceType = 'vat' | 'sales'; // Hóa đơn GTGT / Hóa đơn Bán hàng

export interface EInvoiceItem {
  id: string;
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number; // % (0, 5, 8, 10, -1 là KCT)
  taxAmount: number;
  total: number;
}

export interface EInvoice {
  id: string;
  invoiceCode: string; // Mẫu + Ký hiệu + Số: 1C26TGP-00000088
  invoiceNumber: string; // 00000088
  invoiceSymbol: string; // 1C26TGP (1: HĐ GTGT, C: Có mã CQT, 26: Năm 2026, T: Doanh nghiệp, GP: Ký hiệu GP-ERP)
  invoiceTemplate: string; // 1/001
  invoiceType: EInvoiceType;
  cqtCode?: string; // Mã xác thực Cơ quan Thuế (VD: TCT-84920491823901)
  lookupCode: string; // Mã tra cứu bảo mật (VD: GP-INV-2026-X89F2)
  lookupUrl: string; // https://hoadondientu.gdt.gov.vn hoặc cổng ERP
  issueDate: string;
  signDate?: string;
  status: EInvoiceStatus;
  orderId?: string;
  orderCode?: string;
  seller: {
    name: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
    bankAccount: string;
    bankName: string;
    representative: string;
  };
  buyer: {
    companyName?: string;
    buyerName: string;
    taxCode?: string;
    address?: string;
    phone?: string;
    email?: string;
    idCard?: string;
  };
  items: EInvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountInWords: string;
  paymentMethod: 'TM' | 'CK' | 'TM/CK' | 'Đối trừ công nợ';
  notes?: string;
  digitalSignature: {
    signedBy: string;
    serialNumber: string;
    signTime: string;
    certProvider: string;
    isVerified: boolean;
  };
  cqtStatusMessage?: string;
}

export type LaborContractType = 
  | 'Không xác định thời hạn'
  | 'Xác định thời hạn 12 tháng'
  | 'Xác định thời hạn 24 tháng'
  | 'Xác định thời hạn 36 tháng'
  | 'Thử việc 02 tháng'
  | 'Thử việc'
  | 'Học việc / Thời vụ'
  | 'Thời vụ'
  | string;

export type LaborContractStatus = 
  | 'draft' // Dự thảo
  | 'sent_for_signature' // Chờ người lao động ký
  | 'signed' // Đã ký 2 bên
  | 'active' // Đang hiệu lực
  | 'expired' // Hết hạn
  | 'terminated'; // Chấm dứt

export interface LaborContract {
  id: string;
  contractNumber: string; // HĐLĐ-2026/GP-001
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeRole: string;
  contractType: LaborContractType;
  startDate: string;
  endDate?: string; // Không có nếu là Không xác định thời hạn
  signDate: string;
  status: LaborContractStatus;
  employer: {
    companyName: string;
    representative: string;
    position: string;
    nationality: string;
    address: string;
    phone: string;
    taxCode: string;
  };
  employeeInfo: {
    name: string;
    dob: string;
    gender: 'Nam' | 'Nữ';
    nationality?: string;
    idCardNumber: string; // CCCD
    idCardDate: string;
    idCardPlace: string;
    registeredAddress: string;
    currentAddress: string;
    phone: string;
    email: string;
    department: string;
    position: string;
  };
  terms: {
    jobDescription: string;
    workLocation: string;
    workingHours: string;
    restSchedule: string;
    baseSalary: number;
    allowances: {
      position: number;
      lunch: number;
      fuel: number;
      phone: number;
      other: number;
    };
    commissionRate?: number;
    kpiBonusDesc?: string;
    insuranceSalary: number;
    salaryPaymentDay: number; // Ngày 5 hàng tháng
    annualLeaveDays: number; // 12 ngày
    uniformAndEquipment: string;
    confidentialityAgreed: boolean;
  };
  signatures: {
    employerSigned: boolean;
    employerSignedAt?: string;
    employerSignerName?: string;
    employeeSigned: boolean;
    employeeSignedAt?: string;
    employeeSignatureDataUrl?: string;
    eSignMethod: 'digital_token' | 'touch_signature' | 'sms_otp';
    auditHash: string;
  };
  notes?: string;
}

// Inbound E-Invoice (Hóa Đơn Điện Tử Đầu Vào - Lấy từ Thuế, Gmail, Tệp XML)
export type InboundSourceType = 'cqt_portal' | 'gmail_sync' | 'xml_upload';
export type InboundInvoiceStatus = 'pending_review' | 'matched' | 'imported_to_stock' | 'rejected';

export interface InboundInvoiceItem {
  id: string;
  lineNumber: number;
  productName: string; // Tên hàng hóa trên HĐ
  skuOrCode?: string; // Mã hàng nhà cung cấp
  unit: string; // ĐVT trên HĐ (Cái, Thùng, Hộp, Bộ, Mét,...)
  quantity: number;
  unitPrice: number; // Đơn giá chưa thuế
  subtotal: number; // Thành tiền chưa thuế
  taxRate: number; // % VAT (0, 5, 8, 10)
  taxAmount: number;
  total: number; // Tổng tiền sau thuế
  
  // Matching with Inventory & Auto-Creation Configuration
  matchedProductId?: string; // ID sản phẩm trong kho nếu đã khớp
  matchedProductName?: string;
  matchedProductSku?: string;
  currentStock?: number;
  currentCostPrice?: number;
  ratioToBaseUnit?: number; // Hệ số quy đổi ĐVT nếu khác đơn vị kho (mặc định 1)
  isNewProduct?: boolean; // Đánh dấu tạo mới
  status: 'matched' | 'unmatched' | 'needs_create' | 'ignored';
  
  // Customizable fields for direct auto-creation & location tagging
  assignedCategory?: string; // Nhóm / Phân loại hàng hóa
  assignedWarehouse?: string; // Kho lưu trữ chỉ định
  assignedStorageLocation?: string; // Vị trí kệ / ô / dãy (VD: Kệ A1-02, Tủ 03)
  suggestedSellingPrice?: number; // Giá bán lẻ đề xuất
  customSku?: string; // Mã SKU tự tạo hoặc sinh theo quy tắc
  customBarcode?: string; // Mã vạch EAN-13
}

export interface InboundEInvoice {
  id: string;
  source: InboundSourceType; // 'cqt_portal' | 'gmail_sync' | 'xml_upload'
  sourceDetail?: string; // e.g. "Email từ: invoice@synnexfpt.com.vn" hoặc "CQT Token Sync 0318999888"
  sourceFile?: string; // e.g. "HD_1C26TFP_0008492.xml"
  invoiceCode: string; // 1C26TFP-0008492
  invoiceNumber: string; // 0008492
  invoiceSymbol: string; // 1C26TFP
  invoiceTemplate: string; // 1/001
  issueDate: string; // Ngày lập HĐ
  receivedDate: string; // Ngày hệ thống lấy về
  cqtCode?: string; // Mã CQT cấp
  lookupCode?: string; // Mã tra cứu
  lookupUrl?: string; // Cổng tra cứu
  
  seller: {
    name: string; // Tên nhà cung cấp
    taxCode: string; // MST NCC
    address: string;
    phone?: string;
    email?: string;
    bankAccount?: string;
    bankName?: string;
    contactPerson?: string;
  };
  
  buyer: {
    name: string;
    taxCode: string;
    address: string;
  };
  
  items: InboundInvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  amountInWords: string;
  status: InboundInvoiceStatus; // 'pending_review' | 'matched' | 'imported_to_stock' | 'rejected'
  
  // Stock Import Reference
  goodsReceiptId?: string; // Mã phiếu nhập kho sau khi nhập: PNK-2026-0816-001
  importedAt?: string;
  importedBy?: string;
  targetWarehouse?: string; // Kho nhập hàng
  accountingRecordId?: string; // Mã chứng từ kế toán chi
  notes?: string;
  rawXmlContent?: string;
}

export interface StockGoodsReceipt {
  id: string;
  code: string; // PNK-2026-0816-001
  date: string;
  inboundInvoiceId?: string;
  inboundInvoiceCode?: string;
  supplierName: string;
  supplierTaxCode?: string;
  warehouseName: string;
  creatorName: string;
  receivedBy: string;
  totalItemsCount: number;
  totalQuantity: number;
  totalCostAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  items: {
    productId: string;
    productName: string;
    sku: string;
    unit: string;
    quantity: number;
    oldStock: number;
    newStock: number;
    oldCostPrice: number;
    newCostPrice: number;
    unitCost: number;
    taxRate: number;
    totalAmount: number;
    storageLocation?: string; // Vị trí kệ / ô lưu kho
    warehouse?: string; // Tên kho
    category?: string; // Nhóm sản phẩm
    notes?: string;
  }[];
  paymentStatus: 'paid' | 'debt_pending' | 'partial';
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  taxCode: string;
  tier: 'Tier 1 Chính Hãng' | 'Tổng Đại Lý' | 'Nhà Phân Phối';
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  bankName?: string;
  bankAccount?: string;
  bankCode?: string;
  creditLimit: number;
  creditDays: number;
  currentDebt: number;
  ratingQuality: number;
  ratingPrice: number;
  ratingOnTime: number;
  ratingWarranty: number;
  notes?: string;
  priceList: {
    sku: string;
    productName: string;
    costPrice: number;
    warrantyMonths: number;
    moq: number;
  }[];
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId?: string;
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierTaxCode?: string;
  warehouseId: string;
  warehouseName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'completed' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod: 'transfer' | 'cash' | 'debt_30d';
  notes?: string;
  receivedAt?: string;
  receivedBy?: string;
  receiptNote?: string;
  actualItemsReceived?: Array<{ productId?: string; sku: string; productName: string; quantity: number; serials?: string[] }>;
  createdAt: string;
}

// 16. Phiếu Trả Hàng & Hoàn Tiền (Customer Return & Supplier RMA)
export type ReturnReason = 'defective' | 'customer_mind_change' | 'wrong_item' | 'warranty_exchange' | 'other';
export type ReturnDestination = 'restock' | 'faulty_warehouse' | 'supplier_rma';
export type RefundMethod = 'cash' | 'transfer' | 'debt_deduct' | 'no_refund';

export interface ReturnOrderItem {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  ratioToBase: number;
  quantity: number;
  unitPrice: number;
  refundUnitPrice: number;
  totalRefund: number;
  serialNumber?: string | null;
  condition: 'normal' | 'damaged' | 'unopened';
}

export interface ReturnOrder {
  id: string;
  code: string;
  type: 'customer_return' | 'supplier_return';
  originalOrderCode?: string | null;
  originalOrderId?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  warehouse: string;
  refundMethod: RefundMethod;
  refundAmount: number;
  totalReturnQuantity: number;
  reason: ReturnReason | string;
  destinationType: ReturnDestination;
  status: 'completed' | 'pending' | 'cancelled';
  performedBy: string;
  notes?: string | null;
  createdAt: string;
  items: ReturnOrderItem[];
}

// 17. Chuyển Kho Nội Bộ (Inter-Branch Stock Transfer)
export type TransferStatus = 'draft' | 'in_transit' | 'completed' | 'cancelled';

export interface StockTransferItem {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StockTransfer {
  id: string;
  code: string;
  fromWarehouse: string;
  toWarehouse: string;
  transferDate: string;
  receivedDate?: string | null;
  status: TransferStatus;
  totalItems: number;
  totalQuantity: number;
  senderName: string;
  receiverName?: string | null;
  transportMethod?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  items: StockTransferItem[];
}

