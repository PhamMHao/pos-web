import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Department,
  JobPosition,
  WarehouseLocation,
  UnitOfMeasure,
  MasterProductCategory,
  CustomerGroup,
  MasterSupplierCategory,
  EmailGatewayConfig,
  EmailTemplate,
  EmailDispatchLog,
  PasswordResetRequest,
  EmailTemplateType,
  Customer,
  Supplier,
  MasterCustomerTier,
  EnterpriseProject,
  EnterpriseProjectStatus,
} from '../../types';
import { INITIAL_CUSTOMERS, INITIAL_SUPPLIERS } from '../../data/initialData';

// ==========================================
// Initial Vietnamese IT / ERP Master Seeds
// ==========================================

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-bgd',
    code: 'PB-BGD',
    name: 'Ban Giám Đốc & Điều Hành',
    headOfDepartment: 'Phạm Gia Phúc (Tổng Giám Đốc)',
    phone: '0985 862 609',
    email: 'admin@vitinhgiaphuc.com',
    location: 'Tầng 2 - Phòng Điều Hành Trọng Điểm',
    description: 'Hoạch định chiến lược kinh doanh, quản trị tài chính và phát triển hệ sinh thái ERP',
    employeeCount: 2,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'dept-kd',
    code: 'PB-KD',
    name: 'Phòng Kinh Doanh & Dự Án B2B',
    headOfDepartment: 'Trần Quốc Bảo (Trưởng Phòng)',
    phone: '0914 665 994',
    email: 'sales@vitinhgiaphuc.com',
    location: 'Tầng 1 - Showroom Trưng Bày & Bán Hàng',
    description: 'Tư vấn giải pháp CNTT, bán lẻ POS, lập báo giá dự án doanh nghiệp và trường học',
    employeeCount: 6,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'dept-kt',
    code: 'PB-KT',
    name: 'Phòng Kế Toán - Thuế & Tài Chính',
    headOfDepartment: 'Lê Thị Thu Thảo (Kế Toán Trưởng)',
    phone: '0977 112 233',
    email: 'ketoan@vitinhgiaphuc.com',
    location: 'Tầng 2 - Phòng Kế Toán Tổng Hợp',
    description: 'Sổ quỹ, thu chi công nợ, phát hành HĐĐT TT78, báo cáo tài chính và kê khai thuế',
    employeeCount: 3,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'dept-bh',
    code: 'PB-BH',
    name: 'Phòng Kỹ Thuật & Trung Tâm Bảo Hành',
    headOfDepartment: 'Đỗ Minh Khang (Trưởng Bộ Phận Kỹ Thuật)',
    phone: '0933 888 999',
    email: 'kythuat@vitinhgiaphuc.com',
    location: 'Tầng 1 - Khu Kỹ Thuật & Sửa Chữa Chuyên Sâu',
    description: 'Lắp ráp PC Gaming/Workstation, sửa chữa phần cứng, bảo hành và cứu dữ liệu',
    employeeCount: 4,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'dept-kho',
    code: 'PB-KHO',
    name: 'Phòng Kho Vận & Quản Lý Chuỗi Cung Ứng',
    headOfDepartment: 'Nguyễn Văn Minh (Thủ Kho)',
    phone: '0985 862 609 - Nhánh 104',
    email: 'thukho@vitinhgiaphuc.com',
    location: 'Khu Kho Tổng - Phía Sau Showroom',
    description: 'Kiểm soát nhập xuất kho, phân bổ ô kệ, dán nhãn tem barcode và đóng gói giao vận',
    employeeCount: 3,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'dept-it',
    code: 'PB-IT',
    name: 'Phòng Hệ Thống & Chuyển Đổi Số',
    headOfDepartment: 'Nguyễn Thanh Hùng (IT Lead)',
    phone: '0908 111 222',
    email: 'it@vitinhgiaphuc.com',
    location: 'Tầng 2 - Phòng Server & Nghiên Cứu AI',
    description: 'Vận hành hạ tầng máy chủ SQL, Cổng Email Gateway, Chữ ký số và GPSOFT ERP',
    employeeCount: 2,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_JOB_POSITIONS: JobPosition[] = [
  {
    id: 'pos-ceo',
    code: 'CV-CEO',
    title: 'Tổng Giám Đốc / Chủ Tịch HĐTV',
    departmentId: 'dept-bgd',
    departmentName: 'Ban Giám Đốc & Điều Hành',
    baseSalary: 45000000,
    responsibilityAllowance: 10000000,
    salaryCoefficient: 4.0,
    linkedRole: 'admin',
    description: 'Toàn quyền quyết định hoạt động, ký duyệt chứng từ và phân quyền hệ thống',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pos-ktt',
    code: 'CV-KTT',
    title: 'Kế Toán Trưởng & Trưởng Phòng Tài Chính',
    departmentId: 'dept-kt',
    departmentName: 'Phòng Kế Toán - Thuế & Tài Chính',
    baseSalary: 22000000,
    responsibilityAllowance: 4000000,
    salaryCoefficient: 2.2,
    linkedRole: 'accountant',
    description: 'Kiểm soát sổ sách kế toán, phát hành hóa đơn điện tử và phê duyệt thu chi',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pos-qlch',
    code: 'CV-QLCH',
    title: 'Quản Lý Cửa Hàng / Trưởng Phòng Kinh Doanh',
    departmentId: 'dept-kd',
    departmentName: 'Phòng Kinh Doanh & Dự Án B2B',
    baseSalary: 18000000,
    responsibilityAllowance: 3500000,
    salaryCoefficient: 1.8,
    linkedRole: 'manager',
    description: 'Điều phối hoạt động bán lẻ, giám sát chỉ tiêu doanh số và phân ca làm việc',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pos-thukho',
    code: 'CV-TK',
    title: 'Thủ Kho Trưởng & Quản Lý Vật Tư',
    departmentId: 'dept-kho',
    departmentName: 'Phòng Kho Vận & Quản Lý Chuỗi Cung Ứng',
    baseSalary: 14000000,
    responsibilityAllowance: 2000000,
    salaryCoefficient: 1.4,
    linkedRole: 'warehouse',
    description: 'Chịu trách nhiệm bảo quản hàng hóa, định vị ô kệ, xuất nhập tồn kho chính xác',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pos-sales',
    code: 'CV-NVKD',
    title: 'Chuyên Viên Kinh Doanh & Báo Giá Dự Án',
    departmentId: 'dept-kd',
    departmentName: 'Phòng Kinh Doanh & Dự Án B2B',
    baseSalary: 10000000,
    responsibilityAllowance: 1500000,
    salaryCoefficient: 1.0,
    linkedRole: 'sales',
    description: 'Tìm kiếm khách hàng, tư vấn cấu hình máy tính, lập báo giá và chốt hợp đồng',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pos-thungan',
    code: 'CV-TN',
    title: 'Nhân Viên Thu Ngân POS & Dịch Vụ Khách Hàng',
    departmentId: 'dept-kd',
    departmentName: 'Phòng Kinh Doanh & Dự Án B2B',
    baseSalary: 9500000,
    responsibilityAllowance: 1000000,
    salaryCoefficient: 1.0,
    linkedRole: 'cashier',
    description: 'Thanh toán tiền mặt, quẹt thẻ POS, chuyển khoản VietQR và bàn giao ca két tiền',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pos-kythuat',
    code: 'CV-KTV',
    title: 'Kỹ Thuật Viên Phần Cứng & Bảo Hành',
    departmentId: 'dept-bh',
    departmentName: 'Phòng Kỹ Thuật & Trung Tâm Bảo Hành',
    baseSalary: 12000000,
    responsibilityAllowance: 1500000,
    salaryCoefficient: 1.2,
    linkedRole: 'technician',
    description: 'Lắp ráp PC, kiểm tra xử lý sự cố, sửa chữa màn hình / laptop và bảo hành thiết bị',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_WAREHOUSE_LOCATIONS: WarehouseLocation[] = [
  {
    id: 'loc-a1-01',
    code: 'LOC-A1-01',
    name: 'Kệ A1 - Tầng 1 (Linh Kiện CPU & Mainboard)',
    warehouseName: 'Kho Chính Gia Phúc Computer',
    zone: 'Khu A - Linh Kiện Máy Tính',
    shelf: 'Kệ A1',
    bin: 'Tầng 1 - Ngăn 01',
    barcode: 'LOC-A1-01-8899',
    maxCapacity: 150,
    currentUsage: 85,
    storageType: 'rack',
    note: 'Khu vực lưu trữ bo mạch chủ ASUS, MSI, Gigabyte và vi xử lý Intel/AMD Core i5/i7/i9',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'loc-a1-02',
    code: 'LOC-A1-02',
    name: 'Kệ A1 - Tầng 2 (RAM & Ổ Cứng SSD NVMe)',
    warehouseName: 'Kho Chính Gia Phúc Computer',
    zone: 'Khu A - Linh Kiện Máy Tính',
    shelf: 'Kệ A1',
    bin: 'Tầng 2 - Ngăn 02',
    barcode: 'LOC-A1-02-8899',
    maxCapacity: 300,
    currentUsage: 140,
    storageType: 'bin',
    note: 'Lưu trữ RAM Kingston, Corsair, G.Skill DDR4/DDR5 và SSD Samsung/Kingston NVMe',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'loc-b1-01',
    code: 'LOC-B1-01',
    name: 'Kệ B1 - Tầng 1 (Card Màn Hình VGA & Nguồn PSU)',
    warehouseName: 'Kho Chính Gia Phúc Computer',
    zone: 'Khu B - Thiết Bị Đồ Họa & Nguồn',
    shelf: 'Kệ B1',
    bin: 'Tầng 1 - Ngăn 01',
    barcode: 'LOC-B1-01-8899',
    maxCapacity: 80,
    currentUsage: 45,
    storageType: 'rack',
    note: 'Lưu trữ Card RTX 3060, 4060, 4070 và nguồn Corsair, Cooler Master 650W/750W/850W',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'loc-tu-01',
    code: 'LOC-TU-01',
    name: 'Tủ Kính 01 - Phụ Kiện Gaming & Tai Nghe',
    warehouseName: 'Kho Showroom Gia Phúc',
    zone: 'Khu Phụ Kiện Cao Cấp',
    shelf: 'Tủ Kính 01',
    bin: 'Ngăn Trưng Bày 01',
    barcode: 'LOC-TU-01-8899',
    maxCapacity: 200,
    currentUsage: 110,
    storageType: 'secure',
    note: 'Lưu trữ chuột Logitech, bàn phím cơ Akko/Dareu, tai nghe gaming HyperX',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'loc-pallet-01',
    code: 'LOC-PALLET-01',
    name: 'Sàn Pallet 01 (Thùng Vỏ Case & Màn Hình LCD)',
    warehouseName: 'Kho Chính Gia Phúc Computer',
    zone: 'Khu C - Hàng Cồng Kềnh Pallet',
    shelf: 'Sàn Pallet 01',
    bin: 'Vị trí mặt sàn 01',
    barcode: 'LOC-PALLET-01-8899',
    maxCapacity: 60,
    currentUsage: 35,
    storageType: 'pallet',
    note: 'Lưu trữ màn hình AOC, LG, Samsung 24/27 inch và vỏ thùng case Xigmatek/NZXT',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'loc-bh-01',
    code: 'LOC-BH-01',
    name: 'Khu Kệ Tiếp Nhận & Trả Bảo Hành',
    warehouseName: 'Kho Kỹ Thuật & Bảo Hành',
    zone: 'Khu Kỹ Thuật',
    shelf: 'Kệ Bảo Hành 01',
    bin: 'Ngăn Chờ Khách Lấy',
    barcode: 'LOC-BH-01-8899',
    maxCapacity: 100,
    currentUsage: 22,
    storageType: 'bin',
    note: 'Lưu trữ máy và linh kiện khách hàng gửi bảo hành đang xử lý hoặc đã xong',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_UNITS_OF_MEASURE: UnitOfMeasure[] = [
  {
    id: 'uom-cai',
    code: 'CAI',
    name: 'Cái',
    symbol: 'cái',
    isBaseUnit: true,
    conversionRate: 1,
    description: 'Đơn vị tính cơ sở chuẩn cho linh kiện máy tính, phụ kiện đơn lẻ',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-bo',
    code: 'BO',
    name: 'Bộ',
    symbol: 'bộ',
    isBaseUnit: true,
    conversionRate: 1,
    description: 'Đơn vị tính cho combo dàn máy tính trọn bộ (PC + Màn hình + Phím chuột)',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-thung',
    code: 'THUNG',
    name: 'Thùng (10 Cái / Hộp)',
    symbol: 'thùng',
    isBaseUnit: false,
    baseUnitId: 'uom-cai',
    baseUnitName: 'Cái',
    conversionRate: 10,
    description: '1 Thùng = 10 Cái linh kiện nguyên đai nguyên kiện từ nhà phân phối',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-hop',
    code: 'HOP',
    name: 'Hộp (5 Cái)',
    symbol: 'hộp',
    isBaseUnit: false,
    baseUnitId: 'uom-cai',
    baseUnitName: 'Cái',
    conversionRate: 5,
    description: '1 Hộp = 5 Cái sản phẩm (đầu bấm mạng, keo tản nhiệt, fan case pack 5)',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-cuon',
    code: 'CUON',
    name: 'Cuộn (100 Mét / 305 Mét)',
    symbol: 'cuộn',
    isBaseUnit: false,
    baseUnitId: 'uom-met',
    baseUnitName: 'Mét',
    conversionRate: 305,
    description: '1 Cuộn cáp mạng Cat6 UTP = 305 Mét tiêu chuẩn',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-met',
    code: 'MET',
    name: 'Mét',
    symbol: 'm',
    isBaseUnit: true,
    conversionRate: 1,
    description: 'Đơn vị tính độ dài cáp mạng, dây điện, nẹp điện bán lẻ theo mét',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-kg',
    code: 'KG',
    name: 'Kilogram',
    symbol: 'kg',
    isBaseUnit: true,
    conversionRate: 1,
    description: 'Đơn vị tính trọng lượng cho nguyên vật liệu, đồng, dây hàn, linh kiện ký',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-chiec',
    code: 'CHIEC',
    name: 'Chiếc',
    symbol: 'chiếc',
    isBaseUnit: true,
    conversionRate: 1,
    description: 'Đơn vị tính cho laptop, máy in, máy chiếu, thiết bị độc lập',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-loc',
    code: 'LOC',
    name: 'Lốc (6 Gói / Lon)',
    symbol: 'lốc',
    isBaseUnit: false,
    baseUnitId: 'uom-cai',
    baseUnitName: 'Cái',
    conversionRate: 6,
    description: '1 Lốc = 6 Chai xịt vệ sinh mạch / bình khí nén vệ sinh máy tính',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'uom-dan',
    code: 'DAN',
    name: 'Dàn Máy Game / Phòng Net',
    symbol: 'dàn',
    isBaseUnit: true,
    conversionRate: 1,
    description: 'Đơn vị tính cho các gói lắp đặt phòng nét cyber game 10/20/50 máy',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_PRODUCT_CATEGORIES: MasterProductCategory[] = [
  {
    id: 'cat-lkpc',
    code: 'CAT-LKPC',
    name: 'Linh Kiện PC & Máy Tính Để Bàn',
    defaultVatRate: 10,
    icon: 'Cpu',
    description: 'CPU, Mainboard, RAM, Ổ cứng SSD/HDD, Card màn hình VGA, Nguồn PSU, Vỏ Case',
    productCount: 145,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-lap',
    code: 'CAT-LAP',
    name: 'Laptop & Máy Tính Xách Tay',
    defaultVatRate: 10,
    icon: 'Laptop',
    description: 'Laptop Gaming, Laptop Văn Phòng, Macbook, Workstation di động',
    productCount: 42,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-net',
    code: 'CAT-NET',
    name: 'Thiết Bị Mạng & Cáp Viễn Thông',
    defaultVatRate: 10,
    icon: 'Network',
    description: 'Router Wifi 6, Switch chia mạng PoE, Cáp mạng Cat6, Bộ phát 4G/5G, Đầu bấm hạt mạng',
    productCount: 68,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-cam',
    code: 'CAT-CAM',
    name: 'Camera Quan Sát & Hệ Thống An Ninh',
    defaultVatRate: 10,
    icon: 'Video',
    description: 'Camera IP, Camera Wifi Ezviz/Imou, Đầu ghi hình NVR/DVR, Ổ cứng giám sát WD Purple',
    productCount: 35,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-gear',
    code: 'CAT-GEAR',
    name: 'Phụ Kiện Gaming & Bàn Phím Chuột',
    defaultVatRate: 10,
    icon: 'Gamepad2',
    description: 'Bàn phím cơ, Chuột gaming không dây, Tai nghe 7.1, Lót chuột RGB, Tay cầm game',
    productCount: 89,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-mon',
    code: 'CAT-MON',
    name: 'Màn Hình Máy Tính & Máy In Văn Phòng',
    defaultVatRate: 10,
    icon: 'Monitor',
    description: 'Màn hình 144Hz/240Hz, Màn hình đồ họa IPS 2K/4K, Máy in Canon LBP2900, Máy in màu Epson',
    productCount: 28,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-dien',
    code: 'CAT-DIEN',
    name: 'Điện Tử & Cáp Điện Năng Lượng',
    defaultVatRate: 8,
    icon: 'Zap',
    description: 'Bộ lưu điện UPS, Ổ cắm điện đa năng chống sét, Dây nguồn công suất cao, Biến áp',
    productCount: 30,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'cat-soft',
    code: 'CAT-SOFT',
    name: 'Phần Mềm Bản Quyền & Dịch Vụ IT',
    defaultVatRate: 0,
    icon: 'FileCode2',
    description: 'Windows 11 Pro, Office 365, Diệt virus Kaspersky, Dịch vụ bảo trì phòng máy hàng tháng',
    productCount: 15,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_CUSTOMER_GROUPS: CustomerGroup[] = [
  {
    id: 'grp-si',
    code: 'GRP-SI',
    name: 'Khách Hàng Mua Sỉ & Cửa Hàng Bán Lại',
    discountPercent: 8,
    defaultDebtLimit: 50000000,
    paymentTermsDays: 30,
    priorityLevel: 'high',
    note: 'Áp dụng cho các đại lý máy tính tại các huyện, phòng máy game và thợ kỹ thuật',
    customerCount: 18,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'grp-duan',
    code: 'GRP-DUAN',
    name: 'Khách Hàng Doanh Nghiệp & Dự Án B2B',
    discountPercent: 6,
    defaultDebtLimit: 150000000,
    paymentTermsDays: 45,
    priorityLevel: 'vip',
    note: 'Cung cấp hệ thống máy văn phòng, camera nhà xưởng, trường học, xuất HĐĐT đầy đủ',
    customerCount: 12,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'grp-vip',
    code: 'GRP-VIP',
    name: 'Khách Hàng VIP Thân Thiết (Cá Nhân)',
    discountPercent: 5,
    defaultDebtLimit: 20000000,
    paymentTermsDays: 15,
    priorityLevel: 'vip',
    note: 'Khách hàng có tổng chi tiêu trên 30.000.000đ, miễn phí giao hàng & hỗ trợ kỹ thuật tại nhà',
    customerCount: 35,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'grp-le',
    code: 'GRP-LE',
    name: 'Khách Hàng Bán Lẻ Phổ Thông',
    discountPercent: 0,
    defaultDebtLimit: 0,
    paymentTermsDays: 0,
    priorityLevel: 'standard',
    note: 'Khách mua sắm trực tiếp tại showroom hoặc qua website, thanh toán ngay 100%',
    customerCount: 120,
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_CUSTOMER_TIERS: MasterCustomerTier[] = [
  {
    id: 'tier-dong',
    code: 'TIER-DONG',
    name: 'Hạng Đồng',
    minPoints: 0,
    minSpent: 0,
    discountPercent: 0,
    color: 'slate',
    benefits: 'Tích lũy 1% giá trị đơn hàng, bảo hành tiêu chuẩn chính hãng.',
    customerCount: 15,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'tier-bac',
    code: 'TIER-BAC',
    name: 'Hạng Bạc',
    minPoints: 500,
    minSpent: 10000000,
    discountPercent: 2,
    color: 'blue',
    benefits: 'Tích lũy 1.5%, chiết khấu 2% phụ kiện & linh kiện, ưu tiên giao nhanh 2h.',
    customerCount: 8,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'tier-vang',
    code: 'TIER-VANG',
    name: 'Hạng Vàng',
    minPoints: 2000,
    minSpent: 50000000,
    discountPercent: 5,
    color: 'amber',
    benefits: 'Chiết khấu 5% toàn bộ sản phẩm, hỗ trợ kỹ thuật tận nơi, quà tặng sinh nhật.',
    customerCount: 5,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'tier-kimcuong',
    code: 'TIER-KIMCUONG',
    name: 'Hạng Kim Cương',
    minPoints: 5000,
    minSpent: 150000000,
    discountPercent: 8,
    color: 'purple',
    benefits: 'Chiết khấu 8%, đổi mới 1-1 trong 12 tháng, công nợ gối đầu 30 ngày.',
    customerCount: 3,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'tier-vip',
    code: 'TIER-VIP',
    name: 'VIP Doanh Nghiệp',
    minPoints: 10000,
    minSpent: 300000000,
    discountPercent: 10,
    color: 'emerald',
    benefits: 'Chiết khấu tối đa 10%, Giám đốc dịch vụ phụ trách riêng, công nợ 45 ngày, xuất hóa đơn VAT điện tử tức thì.',
    customerCount: 2,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_SUPPLIER_CATEGORIES: MasterSupplierCategory[] = [
  {
    id: 'sup-cat-chinhhang',
    code: 'SUP-CAT-CHINHHANG',
    name: 'Nhà Phân Phối Chính Hãng (Synnex FPT, Digiworld, Viễn Sơn, Vĩnh Xuân)',
    description: 'Cung cấp linh kiện PC, Laptop, Màn hình chính hãng bảo hành 36 tháng tại TTBH',
    defaultPaymentTerms: 'Gối đầu công nợ 30 ngày',
    supplierCount: 8,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sup-cat-daily1',
    code: 'SUP-CAT-DAILY1',
    name: 'Đại Lý Cấp 1 & Nhập Khẩu Trực Tiếp',
    description: 'Chuyên cung cấp cáp mạng, nguồn, vỏ case và phụ kiện gaming giá sỉ số lượng lớn',
    defaultPaymentTerms: 'Thanh toán 50% cọc, 50% khi nhận hàng',
    supplierCount: 5,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'sup-cat-dichvu',
    code: 'SUP-CAT-DICHVU',
    name: 'Nhà Cung Cấp Dịch Vụ IT & Chữ Ký Số (Viettel, VNPT, FPT, SmartCA)',
    description: 'Cung cấp dịch vụ hạ tầng đám mây, chứng thư số CA, phần mềm hóa đơn điện tử',
    defaultPaymentTerms: 'Thanh toán định kỳ hàng năm',
    supplierCount: 4,
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_PROJECTS: EnterpriseProject[] = [
  {
    id: 'proj-1',
    code: 'DA-2026-001',
    name: 'Dự Án Camera Giám Sát Nhà Máy KCN VSIP 2',
    status: 'in_progress',
    customerName: 'Công Ty TNHH Polytex Far Eastern',
    managerName: 'Trần Hoàng Long (Kỹ thuật trưởng)',
    budget: 150000000,
    sector: 'Sản Xuất & Khu Công Nghiệp',
    description: 'Lắp đặt hệ thống 32 camera IP ColorVu 4MP, 2 đầu ghi 16 kênh NVR 4K và tủ Rack NOC trung tâm.',
    startDate: '2026-01-10',
    linkedDeviceCount: 3,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'proj-2',
    code: 'DA-2026-002',
    name: 'Nâng Cấp Hạ Tầng Mạng Wifi 6 Doanh Nghiệp',
    status: 'in_progress',
    customerName: 'Tập Đoàn Xây Dựng & Bất Động Sản Miền Nam',
    managerName: 'Đỗ Quang Hưng (Kỹ sư IT)',
    budget: 85000000,
    sector: 'Xây Dựng & Bất Động Sản',
    description: 'Triển khai Router cân bằng tải Reyee và 12 Access Point Wifi 6 Mesh cho tòa nhà 5 tầng.',
    startDate: '2026-02-01',
    linkedDeviceCount: 1,
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'proj-3',
    code: 'DA-2026-003',
    name: 'Cung Cấp Dàn Máy Tính Đồ Họa & Phòng Lab',
    status: 'completed',
    customerName: 'Trường Đại Học Quốc Tế Miền Đông (EIU)',
    managerName: 'Nguyễn Văn Minh (Thủ kho)',
    budget: 240000000,
    sector: 'Giáo Dục & Đào Tạo',
    description: 'Cung cấp 25 bộ PC Core i7-14700F, 32GB RAM DDR5, VGA RTX 4060 phục vụ sinh viên kiến trúc.',
    startDate: '2025-11-15',
    linkedDeviceCount: 0,
    createdAt: '2025-11-15T08:00:00Z',
  },
  {
    id: 'proj-4',
    code: 'DA-2026-004',
    name: 'Hệ Thống Tổng Đài IP & Hội Nghị Bệnh Viện',
    status: 'planning',
    customerName: 'Bệnh Viện Đa Khoa Quốc Tế Becamex',
    managerName: 'Đỗ Minh Khang (Trưởng Kỹ Thuật)',
    budget: 195000000,
    sector: 'Y Tế & Bệnh Viện',
    description: 'Triển khai tổng đài Grandstream 100 máy nhánh, thiết bị họp trực tuyến 4K phòng mổ và giao ban.',
    startDate: '2026-03-01',
    linkedDeviceCount: 5,
    createdAt: '2026-02-10T08:00:00Z',
  },
];

const INITIAL_EMAIL_CONFIG: EmailGatewayConfig = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  secure: false,
  authUser: 'hrmgpsoft@gmail.com',
  authPasswordMasked: '••••••••••••••••',
  defaultSenderName: 'GIA PHÚC Computer - Hệ Thống GPSOFT',
  defaultSenderEmail: 'hrmgpsoft@gmail.com',
  adminNotificationEmail: 'hrmgpsoft@gmail.com',
  accountingEmail: 'ketoan@vitinhgiaphuc.com',
  salesEmail: 'sales@vitinhgiaphuc.com',
  signatureHtml: `
    <div style="font-family: Arial, sans-serif; color: #1e293b; border-top: 2px solid #0284c7; padding-top: 10px; margin-top: 20px;">
      <strong style="color: #0284c7; font-size: 14px;">CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC</strong><br/>
      <span style="font-size: 12px; color: #64748b;">Hệ Thống Quản Trị Doanh Nghiệp GPSOFT Enterprise</span><br/>
      <span style="font-size: 12px;">📞 Hotline: 0985 862 609 - 0914 665 994 | 🌐 Website: www.vitinhgiaphuc.com</span><br/>
      <span style="font-size: 11px; color: #94a3b8;">Địa chỉ: 182/3 Tỉnh Lộ 8, Khu Phố 2, Thị Trấn Củ Chi, TP. Hồ Chí Minh</span>
    </div>
  `,
  isGatewayActive: true,
  lastTestSuccessAt: '2026-08-25T14:00:00Z',
};

const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-einvoice',
    type: 'einvoice_vat',
    name: 'Gửi Hóa Đơn Điện Tử VAT TT78 Cho Khách Hàng',
    subject: 'Hóa Đơn Điện Tử Số {{invoiceCode}} - GIA PHÚC Computer kính gửi Quý khách {{customerName}}',
    bodyHtml: `
      <p>Kính gửi Quý khách hàng <strong>{{customerName}}</strong>,</p>
      <p>GIA PHÚC Computer xin trân trọng cảm ơn Quý khách đã tin tưởng mua sắm và sử dụng dịch vụ tại công ty chúng tôi.</p>
      <p>Hệ thống đã phát hành thành công Hóa đơn điện tử theo thông tư 78/2021/TT-BTC với thông tin chi tiết như sau:</p>
      <ul>
        <li><strong>Số hóa đơn:</strong> {{invoiceCode}} (Ký hiệu: 1C26TGP)</li>
        <li><strong>Ngày lập:</strong> {{invoiceDate}}</li>
        <li><strong>Tổng tiền thanh toán:</strong> {{totalAmount}} VNĐ</li>
        <li><strong>Mã tra cứu CQT:</strong> {{lookupCode}}</li>
      </ul>
      <p>Quý khách vui lòng tải về file hóa đơn PDF có chữ ký số Viettel-CA và file dữ liệu gốc XML đính kèm theo thư này.</p>
      <p>Trân trọng cảm ơn Quý khách!</p>
    `,
    availableVariables: ['{{customerName}}', '{{invoiceCode}}', '{{invoiceDate}}', '{{totalAmount}}', '{{lookupCode}}', '{{pdfUrl}}', '{{xmlUrl}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'tmpl-quote',
    type: 'quote_proposal',
    name: 'Gửi Bảng Báo Giá Dự Án / Thiết Bị Máy Tính',
    subject: 'Bảng Báo Giá Thiết Bị Số {{quoteCode}} - GIA PHÚC Computer kính gửi Quý khách {{customerName}}',
    bodyHtml: `
      <p>Kính gửi Quý khách hàng <strong>{{customerName}}</strong>,</p>
      <p>Chúng tôi xin gửi đến Quý khách bảng báo giá chi tiết cho các hạng mục thiết bị máy tính / giải pháp CNTT theo yêu cầu.</p>
      <p><strong>Mã báo giá:</strong> {{quoteCode}} | <strong>Hiệu lực đến:</strong> {{validUntil}}</p>
      <p><strong>Tổng giá trị dự toán:</strong> {{finalTotal}} VNĐ</p>
      <p>Quý khách vui lòng xem chi tiết danh mục linh kiện, chính sách bảo hành và chiết khấu trong file đính kèm.</p>
      <p>Mọi thắc mắc xin liên hệ nhân viên phụ trách: <strong>{{staffName}} ({{staffPhone}})</strong>.</p>
    `,
    availableVariables: ['{{customerName}}', '{{quoteCode}}', '{{finalTotal}}', '{{validUntil}}', '{{staffName}}', '{{staffPhone}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'tmpl-po',
    type: 'purchase_order',
    name: 'Gửi Đơn Đặt Hàng Mua (PO) Cho Nhà Cung Ứng',
    subject: 'Đơn Đặt Hàng Mua Vật Tư PO-{{poCode}} - GIA PHÚC Computer gửi {{supplierName}}',
    bodyHtml: `
      <p>Kính gửi Ban Giám Đốc & Phòng Kinh Doanh <strong>{{supplierName}}</strong>,</p>
      <p>GIA PHÚC Computer xin gửi đơn đặt hàng mua linh kiện theo thỏa thuận báo giá với các chi tiết sau:</p>
      <ul>
        <li><strong>Mã đơn mua hàng:</strong> {{poCode}}</li>
        <li><strong>Số lượng mặt hàng:</strong> {{itemsCount}} loại</li>
        <li><strong>Tổng giá trị đơn hàng:</strong> {{totalPoAmount}} VNĐ</li>
        <li><strong>Địa điểm giao hàng:</strong> Kho Chính Gia Phúc - Củ Chi, TP.HCM</li>
      </ul>
      <p>Quý công ty vui lòng xác nhận đơn hàng và thời gian giao hàng sớm nhất.</p>
    `,
    availableVariables: ['{{supplierName}}', '{{poCode}}', '{{itemsCount}}', '{{totalPoAmount}}', '{{deliveryDate}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'tmpl-pwd-req',
    type: 'password_reset_request',
    name: 'Thông Báo Yêu Cầu Cấp Lại Mật Khẩu Tới Admin',
    subject: '[BẢO MẬT GPSOFT] Yêu cầu cấp lại mật khẩu cho tài khoản @{{username}}',
    bodyHtml: `
      <p>Kính gửi Quản Trị Viên Hệ Thống (Email: <strong>hrmgpsoft@gmail.com</strong>),</p>
      <p>Hệ thống bảo mật GPSOFT vừa tiếp nhận một yêu cầu cấp lại mật khẩu đăng nhập:</p>
      <ul>
        <li><strong>Tên đăng nhập:</strong> @{{username}}</li>
        <li><strong>Họ và tên nhân viên:</strong> {{fullName}}</li>
        <li><strong>Email nhân viên:</strong> {{userEmail}}</li>
        <li><strong>Thời gian yêu cầu:</strong> {{timestamp}}</li>
        <li><strong>Mã xác thực bảo mật:</strong> <span style="font-size: 16px; font-weight: bold; color: #dc2626;">{{verificationCode}}</span></li>
        <li><strong>Lý do:</strong> {{reason}}</li>
      </ul>
      <p>Vui lòng đăng nhập vào module <strong>Quản Lý Dữ Liệu Cơ Bản & MDM -> Tab Bảo Mật</strong> để xác nhận và cấp mật khẩu mới.</p>
    `,
    availableVariables: ['{{username}}', '{{fullName}}', '{{userEmail}}', '{{verificationCode}}', '{{reason}}', '{{timestamp}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
  {
    id: 'tmpl-pwd-appr',
    type: 'password_reset_approved',
    name: 'Thông Báo Mật Khẩu Mới Cho Nhân Viên Sau Khi Admin Duyệt',
    subject: 'Mật Khẩu Đăng Nhập GPSOFT Của Bạn Đã Được Quản Trị Viên Cấp Lại Thành Công',
    bodyHtml: `
      <p>Xin chào <strong>{{fullName}}</strong> (@{{username}}),</p>
      <p>Yêu cầu cấp lại mật khẩu của bạn đã được Quản trị viên hệ thống phê duyệt thành công.</p>
      <p>Mật khẩu tạm thời mới của bạn là: <strong style="font-size: 18px; color: #0284c7; background: #e0f2fe; padding: 4px 8px; border-radius: 4px;">{{tempPassword}}</strong></p>
      <p>Vui lòng đăng nhập vào hệ thống và đổi lại mật khẩu cá nhân ngay trong lần đăng nhập đầu tiên để đảm bảo tính bảo mật.</p>
    `,
    availableVariables: ['{{fullName}}', '{{username}}', '{{tempPassword}}', '{{approvedAt}}'],
    isActive: true,
    updatedAt: '2026-08-25T10:00:00Z',
  },
];

const INITIAL_EMAIL_LOGS: EmailDispatchLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-25T13:45:20Z',
    recipientEmail: 'khachhang.congtyabc@gmail.com',
    recipientName: 'Công Ty Cổ Phần Công Nghệ ABC',
    subject: 'Hóa Đơn Điện Tử Số HD-2026-00189 - GIA PHÚC Computer',
    type: 'einvoice_vat',
    typeLabel: 'Hóa Đơn GTGT TT78',
    status: 'sent',
    responseTimeMs: 342,
    referenceCode: 'HD-2026-00189',
  },
  {
    id: 'log-002',
    timestamp: '2026-08-25T12:15:10Z',
    recipientEmail: 'duan.truonghoc@tphcm.edu.vn',
    recipientName: 'Trường THCS Củ Chi - Dự Án Phòng Máy',
    subject: 'Bảng Báo Giá Thiết Bị Số BG-2026-042 - GIA PHÚC Computer',
    type: 'quote_proposal',
    typeLabel: 'Báo Giá Dự Án',
    status: 'sent',
    responseTimeMs: 418,
    referenceCode: 'BG-2026-042',
  },
  {
    id: 'log-003',
    timestamp: '2026-08-25T11:05:40Z',
    recipientEmail: 'kinhdoanh@synnexfpt.com.vn',
    recipientName: 'Synnex FPT - Ban Phân Phối Linh Kiện',
    subject: 'Đơn Đặt Hàng Mua Vật Tư PO-2026-0089',
    type: 'purchase_order',
    typeLabel: 'Đơn Mua Hàng PO',
    status: 'sent',
    responseTimeMs: 290,
    referenceCode: 'PO-2026-0089',
  },
];

const INITIAL_PASSWORD_RESET_REQUESTS: PasswordResetRequest[] = [
  {
    id: 'req-pwd-001',
    timestamp: '2026-08-25T13:30:00Z',
    userId: 'usr-thungan-01',
    username: 'thungan01',
    fullName: 'Nguyễn Thị Thu Ngân',
    userEmail: 'thungan@vitinhgiaphuc.com',
    adminEmail: 'hrmgpsoft@gmail.com',
    verificationCode: '849201',
    reason: 'Nhân viên quên mật khẩu sau khi đổi ca làm việc',
    status: 'pending_admin_approval',
    requestedAt: '2026-08-25T13:30:00Z',
  },
];

// ==========================================
// Master Data Context Interface
// ==========================================

export type MasterDataType =
  | 'customers'
  | 'suppliers'
  | 'projects'
  | 'departments'
  | 'positions'
  | 'locations'
  | 'uoms'
  | 'categories'
  | 'customerGroups'
  | 'customerTiers'
  | 'supplierCategories';

interface MasterDataContextType {
  // Customers
  customers: Customer[];
  addCustomer: (item: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, item: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Customer Tiers (Hạng Thành Viên)
  customerTiers: MasterCustomerTier[];
  addCustomerTier: (item: Omit<MasterCustomerTier, 'id' | 'createdAt'>) => MasterCustomerTier;
  updateCustomerTier: (id: string, item: Partial<MasterCustomerTier>) => void;
  deleteCustomerTier: (id: string) => void;

  // Projects (Dự Án Doanh Nghiệp)
  projects: EnterpriseProject[];
  addProject: (item: Omit<EnterpriseProject, 'id' | 'createdAt'>) => EnterpriseProject;
  updateProject: (id: string, item: Partial<EnterpriseProject>) => void;
  deleteProject: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (item: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, item: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Departments
  departments: Department[];
  addDepartment: (item: Omit<Department, 'id' | 'createdAt'>) => Department;
  updateDepartment: (id: string, item: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Job Positions
  jobPositions: JobPosition[];
  addJobPosition: (item: Omit<JobPosition, 'id' | 'createdAt'>) => JobPosition;
  updateJobPosition: (id: string, item: Partial<JobPosition>) => void;
  deleteJobPosition: (id: string) => void;

  // Warehouse Locations
  warehouseLocations: WarehouseLocation[];
  addWarehouseLocation: (item: Omit<WarehouseLocation, 'id' | 'createdAt'>) => WarehouseLocation;
  updateWarehouseLocation: (id: string, item: Partial<WarehouseLocation>) => void;
  deleteWarehouseLocation: (id: string) => void;

  // Units Of Measure (UOM)
  unitsOfMeasure: UnitOfMeasure[];
  addUnitOfMeasure: (item: Omit<UnitOfMeasure, 'id' | 'createdAt'>) => UnitOfMeasure;
  updateUnitOfMeasure: (id: string, item: Partial<UnitOfMeasure>) => void;
  deleteUnitOfMeasure: (id: string) => void;

  // Product Categories
  productCategories: MasterProductCategory[];
  addProductCategory: (item: Omit<MasterProductCategory, 'id' | 'createdAt'>) => MasterProductCategory;
  updateProductCategory: (id: string, item: Partial<MasterProductCategory>) => void;
  deleteProductCategory: (id: string) => void;

  // Customer Groups
  customerGroups: CustomerGroup[];
  addCustomerGroup: (item: Omit<CustomerGroup, 'id' | 'createdAt'>) => CustomerGroup;
  updateCustomerGroup: (id: string, item: Partial<CustomerGroup>) => void;
  deleteCustomerGroup: (id: string) => void;

  // Supplier Categories
  supplierCategories: MasterSupplierCategory[];
  addSupplierCategory: (item: Omit<MasterSupplierCategory, 'id' | 'createdAt'>) => MasterSupplierCategory;
  updateSupplierCategory: (id: string, item: Partial<MasterSupplierCategory>) => void;
  deleteSupplierCategory: (id: string) => void;

  // Email Gateway Config
  emailConfig: EmailGatewayConfig;
  updateEmailConfig: (config: Partial<EmailGatewayConfig>) => void;

  // Email Templates
  emailTemplates: EmailTemplate[];
  updateEmailTemplate: (id: string, template: Partial<EmailTemplate>) => void;

  // Email Dispatch Logs
  emailLogs: EmailDispatchLog[];
  sendEmailDispatch: (options: {
    recipientEmail: string;
    recipientName: string;
    type: EmailTemplateType;
    subject: string;
    bodyHtml?: string;
    referenceCode?: string;
  }) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  clearEmailLogs: () => void;

  // Password Reset Approval Flow
  passwordResetRequests: PasswordResetRequest[];
  requestPasswordReset: (username: string, email: string, reason?: string) => Promise<{ success: boolean; requestId: string; message: string }>;
  approvePasswordReset: (requestId: string, customTempPassword?: string) => Promise<{ success: boolean; tempPassword: string; message: string }>;
  rejectPasswordReset: (requestId: string, adminNote?: string) => void;

  // Universal Quick-Add Helper
  quickAddMasterItem: (type: MasterDataType, data: any) => any;
  resetMasterDataToDefaults: () => void;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 0. Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('gp_mdm_customers') || localStorage.getItem('gp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  // 0.1 Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('gp_mdm_suppliers') || localStorage.getItem('gp_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // 0.2 Projects (Dự Án Doanh Nghiệp)
  const [projects, setProjects] = useState<EnterpriseProject[]>(() => {
    const saved = localStorage.getItem('gp_mdm_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  // 1. Departments
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('gp_mdm_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  // 2. Job Positions
  const [jobPositions, setJobPositions] = useState<JobPosition[]>(() => {
    const saved = localStorage.getItem('gp_mdm_job_positions');
    return saved ? JSON.parse(saved) : INITIAL_JOB_POSITIONS;
  });

  // 3. Warehouse Locations
  const [warehouseLocations, setWarehouseLocations] = useState<WarehouseLocation[]>(() => {
    const saved = localStorage.getItem('gp_mdm_warehouse_locations');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_LOCATIONS;
  });

  // 4. Units Of Measure
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>(() => {
    const saved = localStorage.getItem('gp_mdm_uoms');
    return saved ? JSON.parse(saved) : INITIAL_UNITS_OF_MEASURE;
  });

  // 5. Product Categories
  const [productCategories, setProductCategories] = useState<MasterProductCategory[]>(() => {
    const saved = localStorage.getItem('gp_mdm_product_categories');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_CATEGORIES;
  });

  // 6. Customer Groups
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(() => {
    const saved = localStorage.getItem('gp_mdm_customer_groups');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_GROUPS;
  });

  // 6.1 Customer Tiers (Hạng Thành Viên)
  const [customerTiers, setCustomerTiers] = useState<MasterCustomerTier[]>(() => {
    const saved = localStorage.getItem('gp_mdm_customer_tiers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_TIERS;
  });

  // 7. Supplier Categories
  const [supplierCategories, setSupplierCategories] = useState<MasterSupplierCategory[]>(() => {
    const saved = localStorage.getItem('gp_mdm_supplier_categories');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_CATEGORIES;
  });

  // 8. Email Gateway Config
  const [emailConfig, setEmailConfig] = useState<EmailGatewayConfig>(() => {
    const saved = localStorage.getItem('gp_mdm_email_config');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_CONFIG;
  });

  // 9. Email Templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('gp_mdm_email_templates');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_TEMPLATES;
  });

  // 10. Email Dispatch Logs
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(() => {
    const saved = localStorage.getItem('gp_mdm_email_logs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  // 11. Password Reset Requests
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem('gp_mdm_pwd_reset_requests');
    return saved ? JSON.parse(saved) : INITIAL_PASSWORD_RESET_REQUESTS;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('gp_mdm_customers', JSON.stringify(customers));
    localStorage.setItem('gp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('gp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_job_positions', JSON.stringify(jobPositions));
  }, [jobPositions]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_warehouse_locations', JSON.stringify(warehouseLocations));
  }, [warehouseLocations]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_uoms', JSON.stringify(unitsOfMeasure));
  }, [unitsOfMeasure]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_product_categories', JSON.stringify(productCategories));
  }, [productCategories]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_customer_groups', JSON.stringify(customerGroups));
  }, [customerGroups]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_customer_tiers', JSON.stringify(customerTiers));
  }, [customerTiers]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_supplier_categories', JSON.stringify(supplierCategories));
  }, [supplierCategories]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_email_config', JSON.stringify(emailConfig));
  }, [emailConfig]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_email_templates', JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('gp_mdm_pwd_reset_requests', JSON.stringify(passwordResetRequests));
  }, [passwordResetRequests]);

  // ==========================================
  // CRUD Actions: Customers
  // ==========================================
  const addCustomer = (item: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...item,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, item: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // ==========================================
  // CRUD Actions: Suppliers
  // ==========================================
  const addSupplier = (item: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newSup: Supplier = {
      ...item,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, item: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // CRUD Actions: Departments
  // ==========================================
  const addDepartment = (item: Omit<Department, 'id' | 'createdAt'>): Department => {
    const newDept: Department = {
      ...item,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDepartments((prev) => [newDept, ...prev]);
    return newDept;
  };

  const updateDepartment = (id: string, item: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...item } : d)));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  // ==========================================
  // CRUD Actions: Job Positions
  // ==========================================
  const addJobPosition = (item: Omit<JobPosition, 'id' | 'createdAt'>): JobPosition => {
    const newPos: JobPosition = {
      ...item,
      id: `pos-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setJobPositions((prev) => [newPos, ...prev]);
    return newPos;
  };

  const updateJobPosition = (id: string, item: Partial<JobPosition>) => {
    setJobPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...item } : p)));
  };

  const deleteJobPosition = (id: string) => {
    setJobPositions((prev) => prev.filter((p) => p.id !== id));
  };

  // ==========================================
  // CRUD Actions: Warehouse Locations
  // ==========================================
  const addWarehouseLocation = (item: Omit<WarehouseLocation, 'id' | 'createdAt'>): WarehouseLocation => {
    const newLoc: WarehouseLocation = {
      ...item,
      id: `loc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWarehouseLocations((prev) => [newLoc, ...prev]);
    return newLoc;
  };

  const updateWarehouseLocation = (id: string, item: Partial<WarehouseLocation>) => {
    setWarehouseLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...item } : l)));
  };

  const deleteWarehouseLocation = (id: string) => {
    setWarehouseLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // ==========================================
  // CRUD Actions: Units Of Measure (UOM)
  // ==========================================
  const addUnitOfMeasure = (item: Omit<UnitOfMeasure, 'id' | 'createdAt'>): UnitOfMeasure => {
    const newUom: UnitOfMeasure = {
      ...item,
      id: `uom-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUnitsOfMeasure((prev) => [newUom, ...prev]);
    return newUom;
  };

  const updateUnitOfMeasure = (id: string, item: Partial<UnitOfMeasure>) => {
    setUnitsOfMeasure((prev) => prev.map((u) => (u.id === id ? { ...u, ...item } : u)));
  };

  const deleteUnitOfMeasure = (id: string) => {
    setUnitsOfMeasure((prev) => prev.filter((u) => u.id !== id));
  };

  // ==========================================
  // CRUD Actions: Product Categories
  // ==========================================
  const addProductCategory = (item: Omit<MasterProductCategory, 'id' | 'createdAt'>): MasterProductCategory => {
    const newCat: MasterProductCategory = {
      ...item,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProductCategories((prev) => [newCat, ...prev]);
    return newCat;
  };

  const updateProductCategory = (id: string, item: Partial<MasterProductCategory>) => {
    setProductCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...item } : c)));
  };

  const deleteProductCategory = (id: string) => {
    setProductCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ==========================================
  // CRUD Actions: Customer Groups
  // ==========================================
  const addCustomerGroup = (item: Omit<CustomerGroup, 'id' | 'createdAt'>): CustomerGroup => {
    const newGrp: CustomerGroup = {
      ...item,
      id: `grp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomerGroups((prev) => [newGrp, ...prev]);
    return newGrp;
  };

  const updateCustomerGroup = (id: string, item: Partial<CustomerGroup>) => {
    setCustomerGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...item } : g)));
  };

  const deleteCustomerGroup = (id: string) => {
    setCustomerGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // ==========================================
  // CRUD Actions: Customer Tiers (Hạng Thành Viên)
  // ==========================================
  const addCustomerTier = (item: Omit<MasterCustomerTier, 'id' | 'createdAt'>): MasterCustomerTier => {
    const newTier: MasterCustomerTier = {
      ...item,
      id: `tier-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomerTiers((prev) => [...prev, newTier]);
    return newTier;
  };

  const updateCustomerTier = (id: string, item: Partial<MasterCustomerTier>) => {
    setCustomerTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...item } : t)));
  };

  const deleteCustomerTier = (id: string) => {
    setCustomerTiers((prev) => prev.filter((t) => t.id !== id));
  };

  // ==========================================
  // CRUD Actions: Supplier Categories
  // ==========================================
  const addSupplierCategory = (item: Omit<MasterSupplierCategory, 'id' | 'createdAt'>): MasterSupplierCategory => {
    const newCat: MasterSupplierCategory = {
      ...item,
      id: `supcat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSupplierCategories((prev) => [newCat, ...prev]);
    return newCat;
  };

  const updateSupplierCategory = (id: string, item: Partial<MasterSupplierCategory>) => {
    setSupplierCategories((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
  };

  const deleteSupplierCategory = (id: string) => {
    setSupplierCategories((prev) => prev.filter((s) => s.id !== id));
  };

  // ==========================================
  // CRUD Actions: Enterprise Projects (Dự Án Doanh Nghiệp)
  // ==========================================
  const addProject = (item: Omit<EnterpriseProject, 'id' | 'createdAt'>): EnterpriseProject => {
    const newProj: EnterpriseProject = {
      ...item,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    return newProj;
  };

  const updateProject = (id: string, item: Partial<EnterpriseProject>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...item } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // ==========================================
  // Email Gateway & Dispatch Actions
  // ==========================================
  const updateEmailConfig = (config: Partial<EmailGatewayConfig>) => {
    setEmailConfig((prev) => ({ ...prev, ...config }));
  };

  const updateEmailTemplate = (id: string, template: Partial<EmailTemplate>) => {
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...template, updatedAt: new Date().toISOString() } : t))
    );
  };

  const sendEmailDispatch = async (options: {
    recipientEmail: string;
    recipientName: string;
    type: EmailTemplateType;
    subject: string;
    bodyHtml?: string;
    referenceCode?: string;
  }): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const startTime = performance.now();
    // Simulate real SMTP network round-trip (200 - 500ms)
    await new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 200));
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const isSuccess = emailConfig.isGatewayActive && Boolean(options.recipientEmail);

    const newLog: EmailDispatchLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientEmail: options.recipientEmail,
      recipientName: options.recipientName || options.recipientEmail,
      subject: options.subject,
      type: options.type,
      typeLabel:
        options.type === 'einvoice_vat'
          ? 'Hóa Đơn GTGT TT78'
          : options.type === 'quote_proposal'
          ? 'Báo Giá Dự Án'
          : options.type === 'purchase_order'
          ? 'Đơn Mua Hàng PO'
          : options.type === 'password_reset_request'
          ? 'Yêu Cầu Reset Mật Khẩu'
          : options.type === 'password_reset_approved'
          ? 'Mật Khẩu Mới'
          : 'Email Hệ Thống',
      status: isSuccess ? 'sent' : 'failed',
      responseTimeMs: latencyMs,
      referenceCode: options.referenceCode,
      errorMessage: isSuccess ? undefined : 'Cổng Email Gateway đang tạm ngắt hoặc sai cấu hình SMTP',
    };

    setEmailLogs((prev) => [newLog, ...prev]);

    if (isSuccess) {
      setEmailConfig((prev) => ({ ...prev, lastTestSuccessAt: new Date().toISOString() }));
      return {
        success: true,
        latencyMs,
        message: `Đã gửi thư thành công tới ${options.recipientEmail} qua SMTP (${latencyMs}ms)`,
      };
    } else {
      return {
        success: false,
        latencyMs,
        message: 'Lỗi gửi email: Vui lòng kiểm tra lại cấu hình tài khoản SMTP.',
      };
    }
  };

  const clearEmailLogs = () => {
    setEmailLogs([]);
  };

  // ==========================================
  // Password Reset Approval Actions
  // ==========================================
  const requestPasswordReset = async (
    username: string,
    email: string,
    reason: string = 'Nhân viên yêu cầu cấp lại mật khẩu'
  ): Promise<{ success: boolean; requestId: string; message: string }> => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const newReq: PasswordResetRequest = {
      id: `req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: `usr-${username}`,
      username: username,
      fullName: username,
      userEmail: email,
      adminEmail: emailConfig.adminNotificationEmail || 'hrmgpsoft@gmail.com',
      verificationCode: pin,
      reason,
      status: 'pending_admin_approval',
      requestedAt: new Date().toISOString(),
    };

    setPasswordResetRequests((prev) => [newReq, ...prev]);

    // Dispatch automatic alert email to Admin
    await sendEmailDispatch({
      recipientEmail: emailConfig.adminNotificationEmail || 'hrmgpsoft@gmail.com',
      recipientName: 'Quản Trị Viên Hệ Thống GPSOFT',
      type: 'password_reset_request',
      subject: `[BẢO MẬT GPSOFT] Yêu cầu cấp lại mật khẩu cho tài khoản @${username}`,
      referenceCode: pin,
    });

    return {
      success: true,
      requestId: newReq.id,
      message: `Yêu cầu cấp lại mật khẩu đã được gửi đến Email Quản Trị (${emailConfig.adminNotificationEmail || 'hrmgpsoft@gmail.com'}). Vui lòng chờ Admin xác nhận.`,
    };
  };

  const approvePasswordReset = async (
    requestId: string,
    customTempPassword?: string
  ): Promise<{ success: boolean; tempPassword: string; message: string }> => {
    const tempPass = customTempPassword || `GP@${Math.floor(100000 + Math.random() * 900000)}`;

    const targetReq = passwordResetRequests.find((r) => r.id === requestId);
    if (!targetReq) {
      return { success: false, tempPassword: '', message: 'Không tìm thấy yêu cầu cấp lại mật khẩu.' };
    }

    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              approvedAt: new Date().toISOString(),
              approvedBy: 'Phạm Gia Phúc (Quản Trị Viên)',
              tempPassword: tempPass,
            }
          : r
      )
    );

    // Send notification email with temporary password to user
    await sendEmailDispatch({
      recipientEmail: targetReq.userEmail,
      recipientName: targetReq.fullName || targetReq.username,
      type: 'password_reset_approved',
      subject: 'Mật Khẩu Đăng Nhập GPSOFT Của Bạn Đã Được Quản Trị Viên Cấp Lại',
      referenceCode: targetReq.verificationCode,
    });

    return {
      success: true,
      tempPassword: tempPass,
      message: `Đã phê duyệt và cấp mật khẩu mới "${tempPass}" cho tài khoản @${targetReq.username}. Email thông báo đã được gửi.`,
    };
  };

  const rejectPasswordReset = (requestId: string, adminNote?: string) => {
    setPasswordResetRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              approvedAt: new Date().toISOString(),
              approvedBy: 'Phạm Gia Phúc (Quản Trị Viên)',
              adminNote: adminNote || 'Từ chối bởi quản trị viên',
            }
          : r
      )
    );
  };

  // ==========================================
  // Universal Quick-Add Helper
  // ==========================================
  const quickAddMasterItem = (type: MasterDataType, data: any): any => {
    switch (type) {
      case 'customers':
        return addCustomer(data);
      case 'suppliers':
        return addSupplier(data);
      case 'departments':
        return addDepartment(data);
      case 'positions':
        return addJobPosition(data);
      case 'locations':
        return addWarehouseLocation(data);
      case 'uoms':
        return addUnitOfMeasure(data);
      case 'categories':
        return addProductCategory(data);
      case 'customerGroups':
        return addCustomerGroup(data);
      case 'customerTiers':
        return addCustomerTier(data);
      case 'projects':
        return addProject(data);
      case 'supplierCategories':
        return addSupplierCategory(data);
      default:
        throw new Error(`Unsupported master data type: ${type}`);
    }
  };

  const resetMasterDataToDefaults = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setProjects(INITIAL_PROJECTS);
    setDepartments(INITIAL_DEPARTMENTS);
    setJobPositions(INITIAL_JOB_POSITIONS);
    setWarehouseLocations(INITIAL_WAREHOUSE_LOCATIONS);
    setUnitsOfMeasure(INITIAL_UNITS_OF_MEASURE);
    setProductCategories(INITIAL_PRODUCT_CATEGORIES);
    setCustomerGroups(INITIAL_CUSTOMER_GROUPS);
    setCustomerTiers(INITIAL_CUSTOMER_TIERS);
    setSupplierCategories(INITIAL_SUPPLIER_CATEGORIES);
    setEmailConfig(INITIAL_EMAIL_CONFIG);
    setEmailTemplates(INITIAL_EMAIL_TEMPLATES);
  };

  return (
    <MasterDataContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        customerTiers,
        addCustomerTier,
        updateCustomerTier,
        deleteCustomerTier,

        projects,
        addProject,
        updateProject,
        deleteProject,

        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,

        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,

        jobPositions,
        addJobPosition,
        updateJobPosition,
        deleteJobPosition,

        warehouseLocations,
        addWarehouseLocation,
        updateWarehouseLocation,
        deleteWarehouseLocation,

        unitsOfMeasure,
        addUnitOfMeasure,
        updateUnitOfMeasure,
        deleteUnitOfMeasure,

        productCategories,
        addProductCategory,
        updateProductCategory,
        deleteProductCategory,

        customerGroups,
        addCustomerGroup,
        updateCustomerGroup,
        deleteCustomerGroup,

        supplierCategories,
        addSupplierCategory,
        updateSupplierCategory,
        deleteSupplierCategory,

        emailConfig,
        updateEmailConfig,

        emailTemplates,
        updateEmailTemplate,

        emailLogs,
        sendEmailDispatch,
        clearEmailLogs,

        passwordResetRequests,
        requestPasswordReset,
        approvePasswordReset,
        rejectPasswordReset,

        quickAddMasterItem,
        resetMasterDataToDefaults,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = (): MasterDataContextType => {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return context;
};
