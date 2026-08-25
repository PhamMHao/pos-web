export type RoleKey =
  | 'admin'
  | 'manager'
  | 'cashier'
  | 'warehouse'
  | 'accountant'
  | 'sales'
  | 'technician';

export interface RoleMetadata {
  id: RoleKey;
  label: string;
  nameVi: string;
  description: string;
  badgeColor: string;
  gradient: string;
  defaultTab: string;
  isSystemAdmin?: boolean;
}

export interface ModulePermissionDef {
  id: string;
  label: string;
  category: 'core' | 'operation' | 'finance' | 'management' | 'system';
  description: string;
}

export interface ActionPermissionDef {
  id: string;
  label: string;
  description: string;
}

export const SYSTEM_ROLES: RoleMetadata[] = [
  {
    id: 'admin',
    label: 'Quản Trị Viên',
    nameVi: 'Quản Trị Viên (Admin)',
    description: 'Toàn quyền tối cao quản trị hệ thống, dữ liệu, tài khoản và cấu hình phân quyền',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    gradient: 'from-rose-600 to-red-600',
    defaultTab: 'pos',
    isSystemAdmin: true,
  },
  {
    id: 'manager',
    label: 'Quản Lý Cửa Hàng',
    nameVi: 'Quản Lý Cửa Hàng / Giám Đốc',
    description: 'Giám sát hoạt động bán hàng, kho, doanh thu, phê duyệt báo giá và đánh giá KPI nhân sự',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    gradient: 'from-blue-600 to-indigo-600',
    defaultTab: 'analytics',
  },
  {
    id: 'cashier',
    label: 'Thu Ngân POS',
    nameVi: 'Nhân Viên Thu Ngân POS',
    description: 'Bán hàng tại quầy, quản lý két tiền ca làm việc, in hóa đơn, đổi trả hàng tại quầy',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    gradient: 'from-emerald-600 to-teal-600',
    defaultTab: 'pos',
  },
  {
    id: 'warehouse',
    label: 'Thủ Kho',
    nameVi: 'Thủ Kho Vật Tư & Nhập Hàng',
    description: 'Quản lý tồn kho, nhập/xuất/kiểm kê kho, mua hàng PO, quản lý nhà cung cấp, in tem mã vạch',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    gradient: 'from-amber-600 to-orange-600',
    defaultTab: 'inventory',
  },
  {
    id: 'accountant',
    label: 'Kế Toán',
    nameVi: 'Kế Toán Trưởng & Tài Chính',
    description: 'Quản lý sổ quỹ, thu chi công nợ, hóa đơn điện tử TT78, hợp đồng lao động, tính lương và ký số CA',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    gradient: 'from-purple-600 to-fuchsia-600',
    defaultTab: 'accounting',
  },
  {
    id: 'sales',
    label: 'Kinh Doanh',
    nameVi: 'Nhân Viên Kinh Doanh / Bán Hàng',
    description: 'Lập báo giá khách hàng, quản lý CRM khách hàng, theo dõi đơn hàng và khuyến mãi',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    gradient: 'from-cyan-600 to-blue-600',
    defaultTab: 'quotes',
  },
  {
    id: 'technician',
    label: 'Kỹ Thuật Viên',
    nameVi: 'Kỹ Thuật Viên & Bảo Hành',
    description: 'Tiếp nhận xử lý bảo hành, sửa chữa thiết bị, tra cứu serial/IMEI và quản lý vật tư thay thế',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    gradient: 'from-teal-600 to-emerald-600',
    defaultTab: 'warranties',
  },
];

export const SYSTEM_MODULES: ModulePermissionDef[] = [
  {
    id: 'pos',
    label: 'Quản Lý Bán Hàng (POS)',
    category: 'core',
    description: 'Bán hàng thu ngân tại quầy, tính tiền nhanh, mở/đóng ca két tiền',
  },
  {
    id: 'quotes',
    label: 'Quản Lý Báo Giá',
    category: 'operation',
    description: 'Lập báo giá chuyên nghiệp cho khách hàng cá nhân / doanh nghiệp',
  },
  {
    id: 'suppliers',
    label: 'Nhà Cung Ứng & Mua Hàng',
    category: 'operation',
    description: 'Quản lý danh sách nhà cung cấp, bảng giá đối tác và đơn mua hàng PO',
  },
  {
    id: 'costing',
    label: 'Tính Giá Thành & BOM',
    category: 'operation',
    description: 'Định mức linh kiện vật tư BOM, chi phí nhân công, khấu hao máy móc',
  },
  {
    id: 'inventory',
    label: 'Quản Lý Kho Hàng',
    category: 'operation',
    description: 'Quản lý tồn kho, xuất nhập kho, kiểm kho, chuyển kho nội bộ',
  },
  {
    id: 'assets',
    label: 'Tài Sản & Thiết Bị',
    category: 'management',
    description: 'Quản lý trang thiết bị doanh nghiệp, tài sản cố định và khấu hao',
  },
  {
    id: 'warranties',
    label: 'Bảo Hành & Bảo Trì',
    category: 'operation',
    description: 'Tiếp nhận phiếu bảo hành, sửa chữa, theo dõi Serial/IMEI thiết bị',
  },
  {
    id: 'accounting',
    label: 'Kế Toán & Công Nợ',
    category: 'finance',
    description: 'Quản lý phiếu thu chi, sổ quỹ tiền mặt, công nợ khách hàng và NCC',
  },
  {
    id: 'einvoices',
    label: 'Hóa Đơn Điện Tử (TT78)',
    category: 'finance',
    description: 'Phát hành HĐĐT kết nối Tổng Cục Thuế, đồng bộ XML đầu vào',
  },
  {
    id: 'contracts',
    label: 'Hợp Đồng Lao Động Online',
    category: 'management',
    description: 'Soạn thảo hợp đồng lao động điện tử và ký số nhân sự',
  },
  {
    id: 'orders',
    label: 'Quản Lý Đơn Hàng & Vận Chuyển',
    category: 'core',
    description: 'Theo dõi đơn hàng đa kênh, trạng thái giao vận và đổi trả RMA',
  },
  {
    id: 'hr',
    label: 'Chấm Công & HR & Lương',
    category: 'management',
    description: 'Hồ sơ nhân viên, chấm công ca, đánh giá KPI và tính hoa hồng doanh số',
  },
  {
    id: 'ai',
    label: 'Dashboard AI Phân Tích',
    category: 'management',
    description: 'Trợ lý AI phân tích doanh số bán hàng, dự báo tồn kho và cảnh báo gian lận',
  },
  {
    id: 'customers',
    label: 'Khách Hàng & CRM',
    category: 'core',
    description: 'Quản lý thông tin khách hàng, tích điểm thưởng, phân hạng thành viên',
  },
  {
    id: 'promotions',
    label: 'Khuyến Mãi & Voucher',
    category: 'operation',
    description: 'Thiết lập chương trình khuyến mãi, mã giảm giá và voucher quà tặng',
  },
  {
    id: 'analytics',
    label: 'Báo Cáo & Doanh Thu',
    category: 'finance',
    description: 'Báo cáo trực quan doanh thu, lợi nhuận, biểu đồ dòng tiền và top bán chạy',
  },
  {
    id: 'accounts',
    label: 'Quản Lý Tài Khoản & RBAC',
    category: 'system',
    description: 'Quản lý tài khoản người dùng, đổi mật khẩu và tùy biến ma trận phân quyền',
  },
  {
    id: 'masterdata',
    label: 'Dữ Liệu Cơ Bản & MDM',
    category: 'system',
    description: 'Quản lý danh mục gốc: Khách hàng, NCC, ĐVT quy đổi, Phòng ban, Chức vụ, Vị trí ô kệ, Nhóm hàng & VAT, Cổng Email Gateway',
  },
  {
    id: 'settings',
    label: 'Cài Đặt & Cấu Hình',
    category: 'system',
    description: 'Cấu hình thông tin cửa hàng, máy in, kết nối cơ sở dữ liệu SQL Server',
  },
];

export const SYSTEM_ACTIONS: ActionPermissionDef[] = [
  {
    id: 'scanner_printer_hub',
    label: 'Quét & In Tem Mã Vạch (F3)',
    description: 'Mở trung tâm máy quét mã vạch và in tem nhãn sản phẩm',
  },
  {
    id: 'quick_stock',
    label: 'Nhập / Xuất Kho Nhanh',
    description: 'Tạo nhanh phiếu nhập kho, xuất kho hoặc kiểm kê từ thanh công cụ',
  },
  {
    id: 'ai_copilot',
    label: 'Trợ Lý AI Copilot (F1)',
    description: 'Sử dụng trợ lý AI giải đáp thông tin và gợi ý kinh doanh',
  },
  {
    id: 'cash_shift',
    label: 'Quản Lý Ca Thu Ngân',
    description: 'Mở ca, kết ca, kiểm kê tiền mặt trong két thu ngân',
  },
  {
    id: 'doc_ocr',
    label: 'Quét OCR Chứng Từ AI',
    description: 'Quét tự động hóa đơn, báo giá NCC bằng camera/file ảnh OCR',
  },
  {
    id: 'digital_signature',
    label: 'Ký Số Điện Tử CA',
    description: 'Cổng điều hành chữ ký số tập trung (Viettel, VNPT, FPT, SmartCA)',
  },
  {
    id: 'database_config',
    label: 'Cấu Hình & Khôi Phục Database',
    description: 'Cấu hình chuỗi kết nối SQL Server và sao lưu/phục hồi dữ liệu',
  },
  {
    id: 'fraud_alerts',
    label: 'Xem Cảnh Báo Gian Lận AI',
    description: 'Xem chi tiết các cảnh báo sai lệch ca, giảm giá bất thường từ AI',
  },
];

// Ma trận quyền mặc định chuẩn
export const DEFAULT_RBAC_MATRIX: Record<RoleKey, string[]> = {
  admin: [
    // All 19 modules
    'pos',
    'quotes',
    'suppliers',
    'costing',
    'inventory',
    'assets',
    'warranties',
    'accounting',
    'einvoices',
    'contracts',
    'orders',
    'hr',
    'ai',
    'customers',
    'promotions',
    'analytics',
    'accounts',
    'masterdata',
    'settings',
    // All actions
    'scanner_printer_hub',
    'quick_stock',
    'ai_copilot',
    'cash_shift',
    'doc_ocr',
    'digital_signature',
    'database_config',
    'fraud_alerts',
  ],
  manager: [
    'pos',
    'quotes',
    'suppliers',
    'costing',
    'inventory',
    'assets',
    'warranties',
    'accounting',
    'einvoices',
    'contracts',
    'orders',
    'hr',
    'ai',
    'customers',
    'promotions',
    'analytics',
    'masterdata',
    'scanner_printer_hub',
    'quick_stock',
    'ai_copilot',
    'cash_shift',
    'doc_ocr',
    'digital_signature',
    'fraud_alerts',
  ],
  cashier: [
    'pos',
    'orders',
    'customers',
    'warranties',
    'promotions',
    'quotes',
    'scanner_printer_hub',
    'cash_shift',
  ],
  warehouse: [
    'inventory',
    'suppliers',
    'costing',
    'assets',
    'orders',
    'scanner_printer_hub',
    'quick_stock',
    'doc_ocr',
  ],
  accountant: [
    'accounting',
    'einvoices',
    'contracts',
    'hr',
    'analytics',
    'ai',
    'suppliers',
    'orders',
    'costing',
    'assets',
    'masterdata',
    'digital_signature',
    'doc_ocr',
    'ai_copilot',
    'fraud_alerts',
  ],
  sales: [
    'quotes',
    'customers',
    'promotions',
    'orders',
  ],
  technician: [
    'warranties',
    'scanner_printer_hub',
  ],
};

const STORAGE_KEY = 'gp_erp_rbac_matrix_v2';

/**
 * Lấy ma trận phân quyền đang lưu hoặc mặc định
 */
export function getSavedRbacMatrix(): Record<RoleKey, string[]> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure admin always has all permissions
      parsed.admin = DEFAULT_RBAC_MATRIX.admin;
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse saved RBAC matrix, using default:', err);
  }
  return { ...DEFAULT_RBAC_MATRIX };
}

/**
 * Lưu ma trận phân quyền tùy chỉnh vào localStorage
 */
export function saveRbacMatrix(matrix: Record<RoleKey, string[]>): void {
  try {
    // Ensure admin always has all permissions
    const matrixToSave = {
      ...matrix,
      admin: DEFAULT_RBAC_MATRIX.admin,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrixToSave));
  } catch (err) {
    console.error('Failed to save RBAC matrix:', err);
  }
}

/**
 * Khôi phục ma trận phân quyền về mặc định
 */
export function resetRbacMatrix(): Record<RoleKey, string[]> {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_RBAC_MATRIX };
}

/**
 * Chuẩn hóa Role String từ tiếng Việt hoặc format khác về RoleKey chuẩn
 */
export function normalizeRoleKey(role?: string | null): RoleKey {
  if (!role) return 'cashier';
  const clean = role.toLowerCase().trim();
  if (clean === 'admin' || clean === 'quản trị viên' || clean === 'quantrivien') return 'admin';
  if (clean === 'manager' || clean === 'quản lý' || clean === 'quanly' || clean === 'quản lý cửa hàng') return 'manager';
  if (clean === 'cashier' || clean === 'thu ngân' || clean === 'thungan') return 'cashier';
  if (clean === 'warehouse' || clean === 'thủ kho' || clean === 'thukho') return 'warehouse';
  if (clean === 'accountant' || clean === 'kế toán' || clean === 'ketoan') return 'accountant';
  if (clean === 'sales' || clean === 'kinh doanh' || clean === 'bán hàng' || clean === 'banhang') return 'sales';
  if (clean === 'technician' || clean === 'kỹ thuật' || clean === 'kythuat' || clean === 'kỹ thuật viên') return 'technician';
  return 'cashier';
}

/**
 * Kiểm tra xem một vai trò có quyền truy cập vào module không
 */
export function canRoleAccessModule(
  role: RoleKey | string,
  moduleId: string,
  customMatrix?: Record<RoleKey, string[]>
): boolean {
  const normRole = normalizeRoleKey(role);
  if (normRole === 'admin') return true;

  const matrix = customMatrix || getSavedRbacMatrix();
  const allowedList = matrix[normRole] || DEFAULT_RBAC_MATRIX[normRole] || [];
  return allowedList.includes(moduleId);
}

/**
 * Kiểm tra xem một vai trò có quyền thực hiện một Quick Action không
 */
export function canRolePerformAction(
  role: RoleKey | string,
  actionId: string,
  customMatrix?: Record<RoleKey, string[]>
): boolean {
  const normRole = normalizeRoleKey(role);
  if (normRole === 'admin') return true;

  const matrix = customMatrix || getSavedRbacMatrix();
  const allowedList = matrix[normRole] || DEFAULT_RBAC_MATRIX[normRole] || [];
  return allowedList.includes(actionId);
}

/**
 * Lấy danh sách các Module ID mà một Role được phép truy cập
 */
export function getAccessibleModuleIds(
  role: RoleKey | string,
  customMatrix?: Record<RoleKey, string[]>
): string[] {
  const normRole = normalizeRoleKey(role);
  const matrix = customMatrix || getSavedRbacMatrix();
  const allowedList = matrix[normRole] || DEFAULT_RBAC_MATRIX[normRole] || [];
  const moduleIds = SYSTEM_MODULES.map((m) => m.id);
  return allowedList.filter((item) => moduleIds.includes(item));
}

/**
 * Lấy Module mặc định để redirect sau khi đăng nhập
 */
export function getDefaultModuleForRole(
  role: RoleKey | string,
  customMatrix?: Record<RoleKey, string[]>
): string {
  const normRole = normalizeRoleKey(role);
  const roleMeta = SYSTEM_ROLES.find((r) => r.id === normRole);
  const preferredDefault = roleMeta?.defaultTab || 'pos';

  if (canRoleAccessModule(normRole, preferredDefault, customMatrix)) {
    return preferredDefault;
  }

  const accessible = getAccessibleModuleIds(normRole, customMatrix);
  return accessible.length > 0 ? accessible[0] : 'pos';
}
