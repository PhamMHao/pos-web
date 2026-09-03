import React, { useState } from 'react';
import {
  Database,
  Building,
  Briefcase,
  MapPin,
  Warehouse,
  Scale,
  FolderTree,
  Users,
  Truck,
  Mail,
  KeyRound,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  ArrowUpDown,
  Check,
  X,
  ExternalLink,
  Info,
  Server,
  FileText,
  FileCode,
  Download,
  Upload,
  RefreshCw,
  Phone,
  DollarSign,
  Award,
  CreditCard,
  Percent,
  Crown,
  Star,
  FolderKanban,
  Package,
  Layers,
  ArrowRightLeft,
  Palette,
  Boxes,
} from 'lucide-react';
import {
  useMasterData,
  MasterDataType,
} from '../../core/contexts/MasterDataContext';
import { useAuth } from '../../core/contexts/AuthContext';
import { formatVND } from '../../utils/currency';
import { QuickAddMasterDataModal } from '../common/QuickAddMasterDataModal';
import {
  DepartmentModal,
  JobPositionModal,
  PasswordResetApprovalModal,
  CustomerModal,
  CustomerTierModal,
  SupplierModal,
  CategoryModal,
  UnitOfMeasureModal,
  UomGroupModal,
  WarehouseModal,
  WarehouseLocationModal,
  CustomerGroupModal,
  SupplierCategoryModal,
  ProjectModal,
  ColorModal,
  SpecificationModal,
} from './MasterDataModals';
import {
  Department,
  JobPosition,
  MasterWarehouse,
  WarehouseLocation,
  UnitOfMeasure,
  MasterUomGroup,
  MasterProductCategory,
  CustomerGroup,
  MasterCustomerTier,
  MasterSupplierCategory,
  EmailTemplate,
  PasswordResetRequest,
  Customer,
  Supplier,
  EnterpriseProject,
  EnterpriseProjectStatus,
  MasterColor,
  MasterSpecification,
} from '../../types';

export const MasterDataManagerView: React.FC = () => {
  const {
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
    deleteDepartment,
    addDepartment,
    updateDepartment,

    jobPositions,
    deleteJobPosition,
    addJobPosition,
    updateJobPosition,

    warehouses,
    deleteWarehouse,
    addWarehouse,
    updateWarehouse,

    warehouseLocations,
    deleteWarehouseLocation,
    addWarehouseLocation,
    updateWarehouseLocation,

    unitsOfMeasure,
    deleteUnitOfMeasure,
    addUnitOfMeasure,
    updateUnitOfMeasure,

    uomGroups,
    deleteUomGroup,
    addUomGroup,
    updateUomGroup,

    productCategories,
    deleteProductCategory,
    addProductCategory,
    updateProductCategory,

    colors,
    deleteColor,
    addColor,
    updateColor,

    specifications,
    deleteSpecification,
    addSpecification,
    updateSpecification,

    customerGroups,
    deleteCustomerGroup,
    addCustomerGroup,
    updateCustomerGroup,

    supplierCategories,
    deleteSupplierCategory,
    addSupplierCategory,
    updateSupplierCategory,

    emailConfig,
    updateEmailConfig,

    emailTemplates,
    updateEmailTemplate,

    emailLogs,
    sendEmailDispatch,
    clearEmailLogs,

    passwordResetRequests,
    approvePasswordReset,
    rejectPasswordReset,

    resetMasterDataToDefaults,
    refreshMasterDataFromDb,
  } = useMasterData();

  const { user: currentUser } = useAuth();

  // Active Tab State (12 Tabs including Colors & Specifications)
  const [activeTab, setActiveTab] = useState<
    | 'customers'
    | 'projects'
    | 'suppliers'
    | 'departments'
    | 'positions'
    | 'locations'
    | 'uoms'
    | 'categories'
    | 'colors'
    | 'specifications'
    | 'security'
    | 'email'
  >('customers');

  // Sub-tabs for Customers (3 Sub-Tabs: Danh Sách, Hạng Thành Viên, Phân Nhóm)
  const [customerSubTab, setCustomerSubTab] = useState<'list' | 'tiers' | 'groups'>('list');
  // Sub-tabs for Suppliers
  const [supplierSubTab, setSupplierSubTab] = useState<'list' | 'categories'>('list');

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Add Modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<MasterDataType>('uoms');

  // Detailed CRUD Modals State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isCustomerTierModalOpen, setIsCustomerTierModalOpen] = useState(false);
  const [editingCustomerTier, setEditingCustomerTier] = useState<MasterCustomerTier | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<EnterpriseProject | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<JobPosition | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterProductCategory | null>(null);

  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<MasterColor | null>(null);

  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<MasterSpecification | null>(null);

  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<UnitOfMeasure | null>(null);

  const [isUomGroupModalOpen, setIsUomGroupModalOpen] = useState(false);
  const [editingUomGroup, setEditingUomGroup] = useState<MasterUomGroup | null>(null);

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<MasterWarehouse | null>(null);
  const [warehouseSubTab, setWarehouseSubTab] = useState<'warehouses' | 'locations'>('warehouses');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<WarehouseLocation | null>(null);

  const [isCustomerGroupModalOpen, setIsCustomerGroupModalOpen] = useState(false);
  const [editingCustomerGroup, setEditingCustomerGroup] = useState<CustomerGroup | null>(null);

  const [isSupplierCategoryModalOpen, setIsSupplierCategoryModalOpen] = useState(false);
  const [editingSupplierCategory, setEditingSupplierCategory] = useState<MasterSupplierCategory | null>(null);

  const [isPwdApprovalOpen, setIsPwdApprovalOpen] = useState(false);
  const [selectedPwdRequest, setSelectedPwdRequest] = useState<PasswordResetRequest | null>(null);

  // Email Test Console State
  const [testEmailRecipient, setTestEmailRecipient] = useState(
    emailConfig.adminNotificationEmail || 'hrmgpsoft@gmail.com'
  );
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  // Email Config Local Form
  const [localEmailConfig, setLocalEmailConfig] = useState(emailConfig);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenQuickAdd = (type: MasterDataType) => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient) {
      showToast('Vui lòng nhập địa chỉ email nhận test');
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    const res = await sendEmailDispatch({
      recipientEmail: testEmailRecipient,
      recipientName: 'Quản Trị Viên / Khách Hàng Thử Nghiệm',
      type: 'custom',
      subject: `[KIỂM TRA CỔNG SMTP] Thông điệp thử nghiệm từ hệ thống GPSOFT Enterprise`,
      bodyHtml: `<p>Xin chào, đây là thư kiểm tra kết nối Cổng Email Gateway SMTP của hệ thống GPSOFT ERP.</p>`,
      referenceCode: `TEST-${Date.now().toString().slice(-4)}`,
    });

    setIsSendingTestEmail(false);
    setTestEmailResult(res.message);
    showToast(res.message);
  };

  const handleSaveEmailConfig = () => {
    updateEmailConfig(localEmailConfig);
    showToast('Đã lưu cấu hình Cổng Email Gateway SMTP thành công!');
  };

  const getTierBadgeStyle = (tierName: string) => {
    if (tierName.includes('Kim Cương') || tierName.includes('VIP')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
    if (tierName.includes('Vàng')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (tierName.includes('Bạc')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    const matchQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTier = tierFilter === 'all' || c.tier.includes(tierFilter) || tierFilter.includes(c.tier);
    return matchQuery && matchTier;
  });

  // Filtered Enterprise Projects
  const filteredProjects = projects.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sector && p.sector.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
    return matchQuery && matchStatus;
  });

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter((s) => {
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTier = tierFilter === 'all' || s.tier === tierFilter;
    return matchQuery && matchTier;
  });

  return (
    <div className="flex flex-col h-full bg-[#090d16] text-slate-100 overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 border border-blue-500/50 shadow-2xl rounded-2xl px-4 py-3 text-xs font-bold text-white flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-white tracking-tight">Dữ Liệu Cơ Bản & Danh Mục Gốc (MDM)</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                MASTER DATA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quản lý chuẩn hóa Khách hàng, Hạng thành viên, Dự án Doanh nghiệp, Nhà cung ứng, Phòng ban, Chức vụ, Ô kệ, ĐVT & Cổng Email
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={async () => {
              await refreshMasterDataFromDb();
              showToast('Đã tải lại toàn bộ dữ liệu trực tiếp từ SQL Server Database');
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-cyan-200 rounded-xl text-xs font-bold border border-cyan-500/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Đồng bộ & Tải lại dữ liệu mới nhất từ SQL Server"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải Lại Từ DB</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn khôi phục toàn bộ Dữ liệu cơ bản về mặc định chuẩn?')) {
                resetMasterDataToDefaults();
                showToast('Đã khôi phục Dữ liệu cơ bản về mặc định');
              }
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Khôi phục mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
          </button>

          <button
            onClick={() => handleOpenQuickAdd(
              activeTab === 'uoms'
                ? 'uoms'
                : activeTab === 'categories'
                ? 'categories'
                : activeTab === 'colors'
                ? 'colors'
                : activeTab === 'specifications'
                ? 'specifications'
                : activeTab === 'locations'
                ? 'locations'
                : activeTab === 'departments'
                ? 'departments'
                : activeTab === 'positions'
                ? 'positions'
                : activeTab === 'projects'
                ? 'projects'
                : activeTab === 'suppliers'
                ? 'supplierCategories'
                : 'customerGroups'
            )}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhanh Dữ Liệu</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (12 Tabs including Colors & Specifications) */}
      <div className="px-6 border-b border-slate-800 bg-slate-900/60 shrink-0 overflow-x-auto flex space-x-1 py-2 scrollbar-none">
        {[
          { id: 'customers', label: 'Khách Hàng & Phân Nhóm', icon: Users, count: customers.length },
          { id: 'projects', label: 'Dự Án Doanh Nghiệp', icon: FolderKanban, count: projects.length, highlight: true },
          { id: 'suppliers', label: 'Nhà Cung Ứng & Đối Tác', icon: Truck, count: suppliers.length },
          { id: 'departments', label: 'Phòng Ban & Bộ Phận', icon: Building, count: departments.length },
          { id: 'positions', label: 'Chức Vụ & Cấp Bậc', icon: Briefcase, count: jobPositions.length },
          { id: 'locations', label: 'Kho & Vị Trí Ô Kệ', icon: Warehouse, count: (warehouses || []).length + (warehouseLocations || []).length },
          { id: 'uoms', label: 'Đơn Vị Tính & Quy Đổi', icon: Scale, count: unitsOfMeasure.length },
          { id: 'categories', label: 'Nhóm Hàng & VAT', icon: FolderTree, count: productCategories.length },
          { id: 'colors', label: 'Màu Sắc Sản Phẩm', icon: Palette, count: (colors || []).length },
          { id: 'specifications', label: 'Quy Cách & Đóng Gói', icon: Boxes, count: (specifications || []).length },
          { id: 'security', label: 'Bảo Mật & Cấp Lại Mật Khẩu', icon: KeyRound, count: passwordResetRequests.filter(r => r.status === 'pending_admin_approval').length, alert: true },
          { id: 'email', label: 'Cổng Email Gateway & Logs', icon: Mail, count: emailLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
                setTierFilter('all');
                setProjectStatusFilter('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.alert && tab.count > 0
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: KHÁCH HÀNG & PHÂN NHÓM & HẠNG THÀNH VIÊN */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Sub-Tabs: 3 Sub-Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCustomerSubTab('list')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    customerSubTab === 'list'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Danh Sách Khách Hàng ({customers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSubTab('tiers')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    customerSubTab === 'tiers'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Hạng Thành Viên & Ưu Đãi Tier ({customerTiers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerSubTab('groups')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    customerSubTab === 'groups'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <FolderTree className="w-4 h-4 text-cyan-300" />
                  <span>Phân Loại Nhóm Khách ({customerGroups.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {customerSubTab === 'list' && (
                  <button
                    onClick={() => {
                      setEditingCustomer(null);
                      setIsCustomerModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Khách Hàng Mới</span>
                  </button>
                )}
                {customerSubTab === 'tiers' && (
                  <button
                    onClick={() => {
                      setEditingCustomerTier(null);
                      setIsCustomerTierModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Hạng Thành Viên</span>
                  </button>
                )}
                {customerSubTab === 'groups' && (
                  <button
                    onClick={() => {
                      setEditingCustomerGroup(null);
                      setIsCustomerGroupModalOpen(true);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nhóm Khách Hàng</span>
                  </button>
                )}
              </div>
            </div>

            {/* SubTab 1: Danh Sách Khách Hàng */}
            {customerSubTab === 'list' && (
              <div className="space-y-4">
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm khách hàng theo tên, số điện thoại, email, công ty, địa chỉ..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tất cả hạng thành viên</option>
                    {customerTiers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.discountPercent}% off)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customers Data Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-850 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Tên Khách Hàng / Đại Diện</th>
                          <th className="py-3.5 px-4">Số Điện Thoại</th>
                          <th className="py-3.5 px-4">Email Nhận HĐĐT / Báo Giá</th>
                          <th className="py-3.5 px-4">Hạng & Phân Nhóm</th>
                          <th className="py-3.5 px-4 text-right">Tổng Chi Tiêu</th>
                          <th className="py-3.5 px-4 text-right">Công Nợ</th>
                          <th className="py-3.5 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((cust) => (
                            <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white flex items-center space-x-1.5">
                                  <span>{cust.name}</span>
                                </div>
                                {cust.companyName && (
                                  <div className="text-[11px] text-amber-400 font-semibold truncate max-w-xs mt-0.5">
                                    🏢 {cust.companyName}
                                  </div>
                                )}
                                {cust.address && (
                                  <div className="text-[11px] text-slate-400 truncate max-w-xs">{cust.address}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-cyan-400">{cust.phone}</td>
                              <td className="py-3 px-4 font-mono text-slate-300">
                                {cust.invoiceEmail || cust.email ? (
                                  <span className="text-blue-400">{cust.invoiceEmail || cust.email}</span>
                                ) : (
                                  <span className="text-slate-500 italic">Chưa có email</span>
                                )}
                              </td>
                              {/* SHOW BOTH TIER AND GROUP IN THE SAME CELL */}
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadgeStyle(
                                        cust.tier
                                      )}`}
                                    >
                                      {cust.tier}
                                    </span>
                                    {(Number(cust.points) || 0) > 0 && (
                                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                                        ★ {(Number(cust.points) || 0).toLocaleString('vi-VN')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-300 font-medium flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-cyan-400 shrink-0" />
                                    <span className="truncate max-w-[160px]">
                                      {cust.customerType || cust.groupName || 'Khách Hàng Cá Nhân'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-400">
                                {formatVND(cust.totalSpent)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {(Number(cust.debt) || 0) > 0 ? (
                                  <span className="font-bold text-rose-400">
                                    {formatVND(cust.debt)}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">{formatVND(0)}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingCustomer(cust);
                                    setIsCustomerModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                                  title="Chỉnh sửa thông tin"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Xóa khách hàng ${cust.name}?`)) {
                                      deleteCustomer(cust.id);
                                      showToast('Đã xóa khách hàng');
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                                  title="Xóa khách hàng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SubTab 2: Hạng Thành Viên & Ưu Đãi Tier */}
            {customerSubTab === 'tiers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {customerTiers.map((t) => (
                  <div
                    key={t.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3.5 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTierBadgeStyle(
                              t.name
                            )}`}
                          >
                            {t.code}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Giảm {t.discountPercent}%
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white mt-1.5 flex items-center space-x-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>{t.name}</span>
                        </h4>
                      </div>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCustomerTier(t);
                            setIsCustomerTierModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                          title="Chỉnh sửa hạng thành viên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa hạng thành viên ${t.name}?`)) {
                              deleteCustomerTier(t.id);
                              showToast('Đã xóa hạng thành viên');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                          title="Xóa hạng thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điểm tích lũy tối thiểu:</span>
                        <span className="font-mono font-bold text-amber-400">
                          ★ {(t.minPoints ?? Math.floor(((t as any).minSpend || t.minSpent || 0) / 100000)).toLocaleString('vi-VN')} pts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chi tiêu tích lũy:</span>
                        <span className="font-bold text-emerald-400">
                          {formatVND((t as any).minSpend ?? t.minSpent ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Khách hàng thuộc hạng:</span>
                        <span className="font-bold text-cyan-400">{t.customerCount || 0} thành viên</span>
                      </div>
                    </div>

                    {t.benefits && (
                      <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
                        <div className="font-bold text-amber-300 mb-0.5">Đặc quyền ưu đãi:</div>
                        <p className="line-clamp-2 italic">{t.benefits}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SubTab 3: Phân Loại Nhóm Khách Hàng */}
            {customerSubTab === 'groups' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {customerGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {grp.code}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{grp.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCustomerGroup(grp);
                            setIsCustomerGroupModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                          title="Chỉnh sửa nhóm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa nhóm khách ${grp.name}?`)) {
                              deleteCustomerGroup(grp.id);
                              showToast('Đã xóa nhóm khách hàng');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                          title="Xóa nhóm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chiết khấu mặc định:</span>
                        <span className="font-bold text-emerald-400">+{grp.discountPercent || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hạn mức nợ tối đa:</span>
                        <span className="font-bold text-amber-400">
                          {formatVND((grp as any).defaultDebtLimit ?? (grp as any).creditLimit ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thời hạn thanh toán:</span>
                        <span className="font-bold text-cyan-400">
                          {(grp as any).paymentTermsDays ? `${(grp as any).paymentTermsDays} ngày` : ((grp as any).paymentTerms || 'Thanh toán ngay')}
                        </span>
                      </div>
                    </div>

                    {grp.note && <p className="text-[11px] text-slate-400 italic pt-1">{grp.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DỰ ÁN DOANH NGHIỆP (ENTERPRISE PROJECTS) */}
        {activeTab === 'projects' && (
          <div className="space-y-5">
            {/* Top Action Bar & Filter Pills (Match Screenshot 1) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm dự án theo tên, mã, khách hàng, người quản lý..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Status Filter Pills & Add Button */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 shrink-0">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'in_progress', label: 'Đang chạy' },
                    { id: 'completed', label: 'Đã xong' },
                    { id: 'planning', label: 'Lập kế hoạch' },
                    { id: 'on_hold', label: 'Tạm dừng' },
                  ].map((filter) => {
                    const isActive = projectStatusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setProjectStatusFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setIsProjectModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Dự Án Mới (+)</span>
                </button>
              </div>
            </div>

            {/* Project Cards Grid (Match Screenshot 1) */}
            {filteredProjects.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Không tìm thấy dự án nào</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm Dự Án Mới (+)" để tạo dự án mới.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/90 p-5 rounded-3xl space-y-3.5 transition-all group flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-indigo-950/20"
                  >
                    <div>
                      {/* Card Top: Code Badge, Status Badge & Actions */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                            {p.code}
                          </span>
                          {p.status === 'in_progress' ? (
                            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Đang triển khai</span>
                            </span>
                          ) : p.status === 'completed' ? (
                            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Đã nghiệm thu</span>
                            </span>
                          ) : p.status === 'planning' ? (
                            <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-500/30 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>Lập kế hoạch</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3 text-slate-400" />
                              <span>Tạm dừng</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingProject(p);
                              setIsProjectModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                            title="Chỉnh sửa dự án"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa dự án ${p.name}?`)) {
                                deleteProject(p.id);
                                showToast('Đã xóa dự án thành công');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                            title="Xóa dự án"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Project Title */}
                      <h4 className="text-base font-black text-white leading-snug hover:text-indigo-300 transition-colors">
                        {p.name}
                      </h4>

                      {/* Project Description */}
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {p.description || 'Chưa có mô tả chi tiết công việc dự án.'}
                      </p>

                      {/* Project Metadata Container Box */}
                      <div className="mt-4 p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-2xl space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[11px] text-slate-400">Chủ đầu tư / Đối tác:</div>
                            <div className="font-bold text-white truncate" title={p.customerName}>
                              {p.customerName || 'Chưa cập nhật'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400">Người phụ trách:</div>
                            <div className="font-bold text-cyan-300 truncate" title={p.managerName}>
                              {p.managerName || 'Chưa phân công'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-800/60">
                          <div>
                            <div className="text-[11px] text-slate-400">Tổng mức đầu tư:</div>
                            <div className="font-mono font-bold text-emerald-400">
                              {p.budget ? formatVND(p.budget) : formatVND(0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400">Lĩnh vực:</div>
                            <div className="font-semibold text-slate-200 truncate" title={p.sector}>
                              {p.sector || 'Khác'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Bắt đầu: {p.startDate || '2026-01-01'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-400 font-semibold text-[11px]">
                        <span>📦 {p.linkedDeviceCount || 0} thiết bị liên kết</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NHÀ CUNG ỨNG & ĐỐI TÁC */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            {/* Sub-Tabs: Danh Sách NCC vs Phân Loại Nhóm */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSupplierSubTab('list')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    supplierSubTab === 'list'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Danh Sách Nhà Cung Ứng ({suppliers.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSupplierSubTab('categories')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                    supplierSubTab === 'categories'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Phân Loại Nhóm Đối Tác ({supplierCategories.length})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {supplierSubTab === 'list' ? (
                  <button
                    onClick={() => {
                      setEditingSupplier(null);
                      setIsSupplierModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nhà Cung Ứng Mới</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingSupplierCategory(null);
                      setIsSupplierCategoryModalOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nhóm Nhà Cung Ứng</span>
                  </button>
                )}
              </div>
            </div>

            {/* SubTab 1: Danh Sách Nhà Cung Ứng */}
            {supplierSubTab === 'list' && (
              <div className="space-y-4">
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm NCC theo tên, mã NCC, người liên hệ, số điện thoại, email..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tất cả phân cấp đối tác</option>
                    {supplierCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Suppliers Data Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-850 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">Mã NCC & Tên Nhà Cung Cấp</th>
                          <th className="py-3.5 px-4">Mã Số Thuế</th>
                          <th className="py-3.5 px-4">Người Liên Hệ / SĐT</th>
                          <th className="py-3.5 px-4">Email Nhận Đơn PO</th>
                          <th className="py-3.5 px-4">Phân Cấp Đối Tác</th>
                          <th className="py-3.5 px-4 text-right">Công Nợ Hiện Tại</th>
                          <th className="py-3.5 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredSuppliers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500">
                              Không tìm thấy nhà cung ứng nào phù hợp với bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredSuppliers.map((sup) => (
                            <tr key={sup.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                                    {sup.code}
                                  </span>
                                  <span className="font-bold text-white">{sup.name}</span>
                                </div>
                                {sup.address && (
                                  <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                    {sup.address}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">{sup.taxCode || '-'}</td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-200">{sup.contactPerson || 'Chưa chỉ định'}</div>
                                <div className="font-mono text-[11px] text-cyan-400">{sup.phone}</div>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-300">{sup.email}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-amber-500/30">
                                  {sup.tier}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-amber-400">
                                {sup.currentDebt > 0 ? formatVND(sup.currentDebt) : formatVND(0)}
                              </td>
                              <td className="py-3 px-4 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingSupplier(sup);
                                    setIsSupplierModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                                  title="Chỉnh sửa thông tin NCC"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Xóa nhà cung ứng ${sup.name}?`)) {
                                      deleteSupplier(sup.id);
                                      showToast('Đã xóa nhà cung ứng');
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                                  title="Xóa nhà cung ứng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SubTab 2: Phân Loại Nhóm Nhà Cung Ứng */}
            {supplierSubTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplierCategories.map((sup) => (
                  <div
                    key={sup.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {sup.code}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{sup.name}</h4>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingSupplierCategory(sup);
                            setIsSupplierCategoryModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                          title="Chỉnh sửa nhóm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa nhóm NCC ${sup.name}?`)) {
                              deleteSupplierCategory(sup.id);
                              showToast('Đã xóa nhóm nhà cung ứng');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                          title="Xóa nhóm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">{sup.description || 'Chưa có mô tả'}</p>

                    <div className="pt-2 border-t border-slate-800 text-xs flex justify-between">
                      <span className="text-slate-400">Điều khoản thanh toán:</span>
                      <span className="font-bold text-amber-400">{sup.defaultPaymentTerms}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PHÒNG BAN & BỘ PHẬN */}
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Cơ Cấu Phòng Ban & Tổ Chức Doanh Nghiệp</h3>
                  <p className="text-xs text-slate-400">Quản lý sơ đồ bộ phận, trưởng phòng, số máy nhánh và vị trí làm việc</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingDept(null);
                  setIsDeptModalOpen(true);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Phòng Ban</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3.5 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {dept.code}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            dept.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {dept.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{dept.name}</h4>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setIsDeptModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                        title="Chỉnh sửa phòng ban"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa phòng ban ${dept.name}?`)) {
                            deleteDepartment(dept.id);
                            showToast('Đã xóa phòng ban');
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                        title="Xóa phòng ban"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{dept.description || 'Chưa có mô tả'}</p>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trưởng bộ phận:</span>
                      <span className="font-bold text-white">{dept.headOfDepartment || 'Chưa chỉ định'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hotline / Nội bộ:</span>
                      <span className="font-mono text-cyan-400">{dept.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vị trí làm việc:</span>
                      <span className="text-slate-300">{dept.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CHỨC VỤ & CẤP BẬC */}
        {activeTab === 'positions' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Danh Mục Chức Vụ, Cấp Bậc & Lương Cơ Sở</h3>
                  <p className="text-xs text-slate-400">Định nghĩa chức danh, mức lương tham chiếu, phụ cấp và liên kết quyền hạn RBAC</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPos(null);
                  setIsPosModalOpen(true);
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Chức Vụ</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Mã CV</th>
                    <th className="py-3.5 px-4">Chức Danh / Vị Trí</th>
                    <th className="py-3.5 px-4">Phòng Ban</th>
                    <th className="py-3.5 px-4 text-right">Lương Cơ Sở</th>
                    <th className="py-3.5 px-4 text-right">Phụ Cấp</th>
                    <th className="py-3.5 px-4">Quyền RBAC</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {jobPositions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{pos.code}</td>
                      <td className="py-3 px-4 font-bold text-white">{pos.title}</td>
                      <td className="py-3 px-4 text-slate-300">{pos.departmentName}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatVND(pos.baseSalary)}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-400 font-medium">
                        +{formatVND(pos.responsibilityAllowance)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-300 border border-blue-500/30 uppercase">
                          {pos.linkedRole || 'Nhân Viên'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingPos(pos);
                            setIsPosModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                          title="Chỉnh sửa chức vụ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa chức vụ ${pos.title}?`)) {
                              deleteJobPosition(pos.id);
                              showToast('Đã xóa chức vụ');
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                          title="Xóa chức vụ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: KHO & VỊ TRÍ Ô KỆ (WAREHOUSES & SHELF LOCATIONS) */}
        {activeTab === 'locations' && (() => {
          const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];
          const safeLocations = Array.isArray(warehouseLocations) ? warehouseLocations : [];

          const totalWarehouseCapacity = safeWarehouses.reduce((sum, w) => sum + (Number(w.capacity) || 0), 0);
          const defaultWarehouse = safeWarehouses.find((w) => w.isDefault) || safeWarehouses[0];

          const getWarehouseTypeBadge = (type: string) => {
            switch (type) {
              case 'general':
                return { label: 'Kho Tổng Phân Phối', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
              case 'showroom':
                return { label: 'Showroom & Kỹ Thuật', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
              case 'branch':
                return { label: 'Kho Chi Nhánh', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
              case 'rma':
                return { label: 'Bảo Hành & RMA', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
              case 'transit':
                return { label: 'Kho Trung Chuyển', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
              default:
                return { label: 'Kho Lưu Trữ', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
            }
          };

          const filteredWarehouses = safeWarehouses.filter((w) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              w.name.toLowerCase().includes(q) ||
              w.code.toLowerCase().includes(q) ||
              (w.address && w.address.toLowerCase().includes(q)) ||
              (w.managerName && w.managerName.toLowerCase().includes(q)) ||
              (w.phone && w.phone.includes(q))
            );
          });

          const filteredLocations = safeLocations.filter((loc) => {
            const matchWarehouse =
              selectedWarehouseFilter === 'all' ||
              loc.warehouseId === selectedWarehouseFilter ||
              loc.warehouseCode === selectedWarehouseFilter ||
              loc.warehouseName === selectedWarehouseFilter;

            if (!matchWarehouse) return false;

            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              loc.name.toLowerCase().includes(q) ||
              loc.code.toLowerCase().includes(q) ||
              (loc.barcode && loc.barcode.toLowerCase().includes(q)) ||
              (loc.zone && loc.zone.toLowerCase().includes(q)) ||
              (loc.shelf && loc.shelf.toLowerCase().includes(q)) ||
              loc.warehouseName.toLowerCase().includes(q)
            );
          });

          return (
            <div className="space-y-6">
              {/* Sub-Tabs Selector & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setWarehouseSubTab('warehouses');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      warehouseSubTab === 'warehouses'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <Warehouse className="w-4 h-4 text-blue-300" />
                    <span>Danh Sách Kho Hàng ({safeWarehouses.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWarehouseSubTab('locations');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      warehouseSubTab === 'locations'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-emerald-300" />
                    <span>Vị Trí Ô Kệ Theo Kho ({safeLocations.length})</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {warehouseSubTab === 'warehouses' && (
                    <button
                      onClick={() => {
                        setEditingWarehouse(null);
                        setIsWarehouseModalOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Kho Hàng Mới</span>
                    </button>
                  )}
                  {warehouseSubTab === 'locations' && (
                    <button
                      onClick={() => {
                        setEditingLocation(null);
                        setIsLocationModalOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Vị Trí Ô Kệ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SUB-TAB 1: DANH SÁCH KHO HÀNG (MASTER WAREHOUSES) */}
              {warehouseSubTab === 'warehouses' && (
                <div className="space-y-6">
                  {/* KPI Overview Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5">
                      <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Cơ Sở Kho</div>
                        <div className="text-xl font-black text-white">{safeWarehouses.length} Kho hàng</div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5">
                      <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kho Xuất Mặc Định</div>
                        <div className="text-sm font-bold text-amber-300 truncate max-w-[170px]" title={defaultWarehouse?.name}>
                          {defaultWarehouse ? defaultWarehouse.name : 'Chưa thiết lập'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5">
                      <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng Sức Chứa SKU</div>
                        <div className="text-xl font-black text-emerald-400">
                          {totalWarehouseCapacity.toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3.5">
                      <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vị Trí Ô Kệ Toàn Hệ Thống</div>
                        <div className="text-xl font-black text-cyan-400">{safeLocations.length} Vị trí</div>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm kho theo mã kho, tên kho, địa chỉ, thủ kho, số điện thoại..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Warehouses Grid Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredWarehouses.map((wh) => {
                      const typeBadge = getWarehouseTypeBadge(wh.type);
                      const whLocations = safeLocations.filter(
                        (l) => l.warehouseId === wh.id || l.warehouseCode === wh.code || l.warehouseName === wh.name
                      );

                      return (
                        <div
                          key={wh.id}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-4 transition-all group flex flex-col justify-between shadow-lg"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="text-[11px] font-mono font-bold text-blue-400 px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    {wh.code}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${typeBadge.bg}`}>
                                    {typeBadge.label}
                                  </span>
                                  {wh.isDefault && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                                      <span>★ Mặc Định</span>
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-white pt-1">{wh.name}</h4>
                              </div>

                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingWarehouse(wh);
                                    setIsWarehouseModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                                  title="Chỉnh sửa kho hàng"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${wh.name}"?`)) {
                                      deleteWarehouse(wh.id);
                                      showToast('Đã xóa kho hàng khỏi hệ thống');
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-colors"
                                  title="Xóa kho hàng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {wh.address && (
                              <div className="flex items-start space-x-2 text-xs text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span>{wh.address}</span>
                              </div>
                            )}

                            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Quản lý / Thủ kho:</span>
                                <span className="font-bold text-slate-200">{wh.managerName || 'Chưa chỉ định'}</span>
                              </div>
                              {wh.phone && (
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Hotline liên hệ:</span>
                                  <span className="font-mono text-cyan-400 font-semibold">{wh.phone}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Sức chứa tối đa:</span>
                                <span className="font-bold text-amber-400">{(wh.capacity || 1000).toLocaleString('vi-VN')} SKU</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Phân khu ô kệ:</span>
                                <span className="font-bold text-emerald-400">{whLocations.length} vị trí</span>
                              </div>
                            </div>

                            {wh.description && (
                              <p className="text-[11px] text-slate-400 italic line-clamp-2">
                                {wh.description}
                              </p>
                            )}
                          </div>

                          {/* Switch to Locations Tab Filtered */}
                          <div className="pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWarehouseFilter(wh.id);
                                setWarehouseSubTab('locations');
                              }}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-700/60"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Xem {whLocations.length} vị trí ô kệ của kho này</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: VỊ TRÍ Ô KỆ THEO KHO (WAREHOUSE LOCATIONS) */}
              {warehouseSubTab === 'locations' && (
                <div className="space-y-5">
                  {/* Warehouse Filter Pills */}
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedWarehouseFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        selectedWarehouseFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tất Cả Kho ({safeLocations.length})
                    </button>
                    {safeWarehouses.map((wh) => {
                      const count = safeLocations.filter(
                        (l) => l.warehouseId === wh.id || l.warehouseCode === wh.code || l.warehouseName === wh.name
                      ).length;
                      const isSelected = selectedWarehouseFilter === wh.id || selectedWarehouseFilter === wh.name;

                      return (
                        <button
                          key={wh.id}
                          type="button"
                          onClick={() => setSelectedWarehouseFilter(wh.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>{wh.name}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Bar & Stats */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm ô kệ theo mã vị trí, mã barcode, tên vị trí, phân khu, kệ, tầng..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    {selectedWarehouseFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedWarehouseFilter('all')}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl shrink-0 cursor-pointer flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Bỏ lọc kho</span>
                      </button>
                    )}
                  </div>

                  {/* Locations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3.5 transition-all group shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                {loc.code}
                              </span>
                              {loc.barcode && (
                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                                  {loc.barcode}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1.5">{loc.name}</h4>
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingLocation(loc);
                                setIsLocationModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                              title="Chỉnh sửa vị trí"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa vị trí "${loc.name}"?`)) {
                                  deleteWarehouseLocation(loc.id);
                                  showToast('Đã xóa vị trí ô kệ');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-colors"
                              title="Xóa vị trí"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Kho trực thuộc:</span>
                            <span className="font-bold text-blue-400 flex items-center space-x-1">
                              <Warehouse className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                              <span>{loc.warehouseName}</span>
                            </span>
                          </div>
                          {loc.zone && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Phân khu (Zone):</span>
                              <span className="text-cyan-300 font-medium">{loc.zone}</span>
                            </div>
                          )}
                          {(loc.shelf || loc.tier || loc.bin) && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Layout Kệ / Tầng / Ô:</span>
                              <span className="text-slate-200 font-mono">
                                {[loc.shelf, loc.tier, loc.bin].filter(Boolean).join(' • ')}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Sức chứa tối đa:</span>
                            <span className="font-bold text-amber-400">
                              {(loc.capacity || loc.maxCapacity || 100).toLocaleString('vi-VN')} SKU
                            </span>
                          </div>
                        </div>

                        {(loc.notes || loc.note) && (
                          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
                            {loc.notes || loc.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {filteredLocations.length === 0 && (
                    <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                      <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-300">Không tìm thấy vị trí ô kệ nào</h4>
                      <p className="text-xs text-slate-500">
                        {selectedWarehouseFilter !== 'all'
                          ? 'Kho hàng này chưa có ô kệ nào được tạo. Hãy nhấn "Thêm Vị Trí Ô Kệ" để phân bổ layout.'
                          : 'Thử thay đổi từ khóa tìm kiếm hoặc bấm nút thêm mới.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 7: ĐƠN VỊ TÍNH & QUY ĐỔI (UOM & CONVERSION GROUPS) */}
        {activeTab === 'uoms' && (() => {
          const safeUomGroups = Array.isArray(uomGroups) ? uomGroups : [];
          const safeUnitsOfMeasure = Array.isArray(unitsOfMeasure) ? unitsOfMeasure : [];

          return (
            <div className="space-y-8">
              {/* KHU VỰC 1: BỘ CẤU HÌNH NHÓM ĐƠN VỊ TÍNH & QUY ĐỔI */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-5 rounded-3xl border border-purple-800/30 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-600/20 border border-purple-500/30 rounded-2xl text-purple-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white">Bộ Cấu Hình Nhóm Đơn Vị Tính & Quy Đổi</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {safeUomGroups.length} Bộ nhóm
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Thiết lập các bộ quy chuẩn quy đổi đa cấp (VD: Cáp mạng Cuộn ↔ Mét, Đóng gói Thùng ↔ Hộp ↔ Cái, Khối lượng Kg ↔ Gram)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUomGroup(null);
                      setIsUomGroupModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-600/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Bộ Nhóm ĐVT Mới</span>
                  </button>
                </div>

                {/* Danh Sách Các Bộ Nhóm Quy Đổi (Master-Detail Table / Cards) */}
                {safeUomGroups.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 p-8 space-y-3">
                    <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">Chưa có bộ cấu hình nhóm quy đổi nào</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Tạo bộ nhóm quy đổi giúp chuẩn hóa quy cách đóng gói và hệ số tính toán xuyên suốt từ POS, Kho hàng đến Báo giá & Hóa đơn.
                    </p>
                    <button
                      onClick={() => {
                        setEditingUomGroup(null);
                        setIsUomGroupModalOpen(true);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo Bộ Nhóm Đầu Tiên</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeUomGroups.map((group) => (
                      <div
                        key={group.id}
                        className="bg-slate-900 border border-slate-800 hover:border-purple-500/30 rounded-3xl p-5 space-y-4 transition-all shadow-md"
                      >
                        {/* Phần Đầu (Header): Thông tin nhóm, mã lưu, ĐVT cơ sở */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-purple-300 px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                {group.code}
                              </span>
                              <h4 className="text-base font-bold text-white">{group.name}</h4>
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                                <span>⭐ ĐVT Cơ sở:</span>
                                <strong className="text-white">{group.baseUnit}</strong>
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  group.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {group.status === 'active' ? '🟢 Hoạt động' : '⚪ Tạm ngưng'}
                              </span>
                            </div>
                            {group.description && (
                              <p className="text-xs text-slate-400 italic pt-0.5">{group.description}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setEditingUomGroup(group);
                                setIsUomGroupModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors border border-slate-700"
                              title="Chỉnh sửa bộ nhóm quy đổi"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                              <span>Sửa Nhóm</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa bộ nhóm quy đổi "${group.name}"? Thao tác này sẽ xóa tất cả các dòng quy đổi bên trong.`)) {
                                  deleteUomGroup(group.id);
                                  showToast('Đã xóa bộ nhóm quy đổi');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer border border-slate-800"
                              title="Xóa bộ nhóm quy đổi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Phần Dưới: Bảng các dòng quy đổi con (ĐVT = Hệ số x ĐVT) */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Bảng Quy Đổi Chi Tiết ({group.lines?.length || 0} cấp quy đổi)</span>
                            </span>
                          </div>

                          {(!group.lines || group.lines.length === 0) ? (
                            <p className="text-xs text-slate-500 italic py-2">Chưa cấu hình dòng quy đổi con nào.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold bg-slate-900/80">
                                    <th className="py-2 px-3 w-10 text-center">#</th>
                                    <th className="py-2 px-3">ĐVT Quy Đổi</th>
                                    <th className="py-2 px-2 w-8 text-center">=</th>
                                    <th className="py-2 px-3">Hệ Số</th>
                                    <th className="py-2 px-3">ĐVT Tham Chiếu / Chuẩn</th>
                                    <th className="py-2 px-3">Công Thức Trực Quan</th>
                                    <th className="py-2 px-3">Ghi Chú Quy Cách</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                  {group.lines.map((line, idx) => {
                                    const factor = Number(line.conversionFactor) || 1;
                                    const ref = line.referenceUnit || group.baseUnit;
                                    return (
                                      <tr key={line.id || idx} className="hover:bg-slate-850/50 transition-colors">
                                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                                          {idx + 1}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                                            {line.unit}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-center font-bold text-slate-400">=</td>
                                        <td className="py-2.5 px-3">
                                          <span className="font-mono font-bold text-emerald-400 text-sm">
                                            {factor.toLocaleString('vi-VN')}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="text-slate-300 font-medium">
                                            {ref === group.baseUnit ? (
                                              <span className="text-amber-300 font-semibold">{ref} (Cơ sở)</span>
                                            ) : (
                                              ref
                                            )}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-300 font-mono text-xs">
                                            <span className="font-bold text-white">1 {line.unit}</span>
                                            <span className="text-slate-400">=</span>
                                            <span className="font-bold text-emerald-400">{factor}</span>
                                            <span className="text-slate-300">{ref}</span>
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-400 italic text-[11px]">
                                          {line.note || '—'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* KHU VỰC 2: DANH MỤC ĐƠN VỊ TÍNH CHUẨN */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Danh Mục Đơn Vị Tính Đơn Lẻ (Từ Điển ĐVT Chuẩn)</h3>
                      <p className="text-xs text-slate-400">Danh sách các đơn vị tính cơ sở và ký hiệu hiển thị dùng chung trên toàn hệ thống</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUom(null);
                      setIsUomModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-purple-300 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer border border-purple-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm ĐVT Đơn Lẻ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {safeUnitsOfMeasure.map((uom) => (
                    <div
                      key={uom.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                              {uom.code}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white mt-1.5">{uom.name}</h4>
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingUom(uom);
                              setIsUomModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                            title="Chỉnh sửa ĐVT"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa ĐVT ${uom.name}?`)) {
                                deleteUnitOfMeasure(uom.id);
                                showToast('Đã xóa đơn vị tính');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                            title="Xóa ĐVT"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ký hiệu hiển thị:</span>
                          <span className="font-bold text-white font-mono">{uom.symbol}</span>
                        </div>
                      </div>

                      {uom.description && <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">{uom.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 8: NHÓM HÀNG & THUẾ SUẤT VAT */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderTree className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Danh Mục Nhóm Ngành Hàng & Thuế Suất VAT</h3>
                  <p className="text-xs text-slate-400">Quản lý phân loại sản phẩm và thiết lập thuế suất VAT mặc định (8%, 10%, 5%, 0%)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nhóm Hàng Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {productCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {cat.code}
                        </span>
                        <span className="text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.2 rounded">
                          VAT {cat.defaultVatRate}%
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{cat.name}</h4>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                        title="Chỉnh sửa nhóm hàng & VAT"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa nhóm hàng ${cat.name}?`)) {
                            deleteProductCategory(cat.id);
                            showToast('Đã xóa nhóm ngành hàng');
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                        title="Xóa nhóm hàng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{cat.description || 'Chưa có mô tả'}</p>

                  <div className="pt-2 border-t border-slate-800 text-xs flex justify-between">
                    <span className="text-slate-400">Số lượng SKU liên kết:</span>
                    <span className="font-bold text-cyan-400">{cat.productCount || 0} sản phẩm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MÀU SẮC SẢN PHẨM (Master Colors) */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Danh Mục Màu Sắc Sản Phẩm & Mã Màu HEX</h3>
                    <span className="px-2 py-0.5 bg-pink-500/10 text-pink-300 border border-pink-500/20 rounded-full text-xs font-mono font-bold">
                      {(colors || []).length} màu
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Bảng mã màu chuẩn quốc tế HEX và tên gọi cho linh kiện PC, case, gaming gear và thiết bị mạng
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingColor(null);
                    setIsColorModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Màu Sắc Mới</span>
                </button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã màu, tên màu, mã HEX..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Grid Colors */}
            {(() => {
              const safeColors = Array.isArray(colors) ? colors : [];
              const filteredColors = safeColors.filter((c) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  c.code?.toLowerCase().includes(q) ||
                  c.name?.toLowerCase().includes(q) ||
                  c.hexCode?.toLowerCase().includes(q) ||
                  c.description?.toLowerCase().includes(q)
                );
              });

              if (filteredColors.length === 0) {
                return (
                  <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
                    <Palette className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-400">Không tìm thấy màu sắc nào</h4>
                    <p className="text-xs text-slate-500 mt-1">Thử đổi từ khóa tìm kiếm hoặc nhấn nút thêm màu mới</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredColors.map((col) => (
                    <div
                      key={col.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-4 transition-all group flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        {/* Top header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-8 h-8 rounded-xl border-2 border-slate-700 shadow-md flex items-center justify-center shrink-0"
                              style={{ backgroundColor: col.hexCode || '#1e293b' }}
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-1">
                                {col.name}
                              </h4>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                {col.code}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingColor(col);
                                setIsColorModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                              title="Chỉnh sửa màu"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa màu ${col.name}?`)) {
                                  deleteColor(col.id);
                                  showToast('Đã xóa màu sắc');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                              title="Xóa màu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* HEX & Description */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                            <span className="text-[11px] text-slate-400 font-medium">Mã HEX:</span>
                            <span className="text-xs font-mono font-bold text-pink-300 flex items-center space-x-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: col.hexCode }}
                              />
                              <span>{col.hexCode}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2">
                            {col.description || 'Chưa có mô tả chi tiết'}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between">
                        <span className="text-slate-500">
                          Thứ tự: <strong className="text-slate-300 font-mono">{col.sortOrder || 0}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            col.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {col.status === 'active' ? '🟢 Hoạt động' : '⚪ Tạm ngưng'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB: QUY CÁCH SẢN PHẨM & ĐÓNG GÓI (Master Specifications) */}
        {activeTab === 'specifications' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Danh Mục Quy Cách Sản Phẩm & Định Mức Đóng Gói</h3>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-xs font-mono font-bold">
                      {(specifications || []).length} quy cách
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Quy chuẩn đóng gói thùng - hộp, cuộn chiều dài, vỉ linh kiện IC, túi zip và định mức tiêu chuẩn
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingSpec(null);
                    setIsSpecModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Quy Cách Mới</span>
                </button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã, tên quy cách, phân loại, giá trị chuẩn..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Grid Specifications */}
            {(() => {
              const safeSpecs = Array.isArray(specifications) ? specifications : [];
              const filteredSpecs = safeSpecs.filter((s) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  s.code?.toLowerCase().includes(q) ||
                  s.name?.toLowerCase().includes(q) ||
                  s.category?.toLowerCase().includes(q) ||
                  s.standardValue?.toLowerCase().includes(q) ||
                  s.description?.toLowerCase().includes(q)
                );
              });

              if (filteredSpecs.length === 0) {
                return (
                  <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
                    <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-400">Không tìm thấy quy cách nào</h4>
                    <p className="text-xs text-slate-500 mt-1">Thử chọn danh mục khác hoặc tạo quy cách mới</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpecs.map((spec) => (
                    <div
                      key={spec.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all group flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md text-[10px] font-bold">
                                {spec.category || 'Quy cách'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                {spec.code}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                              {spec.name}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingSpec(spec);
                                setIsSpecModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                              title="Chỉnh sửa quy cách"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa quy cách ${spec.name}?`)) {
                                  deleteSpecification(spec.id);
                                  showToast('Đã xóa quy cách');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                              title="Xóa quy cách"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Badges Info */}
                        <div className="space-y-2 mb-3">
                          {spec.standardValue && (
                            <div className="flex items-center space-x-2 text-xs bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                              <span className="text-slate-400 font-medium">📦 Giá trị chuẩn:</span>
                              <span className="font-bold text-amber-300 font-mono">{spec.standardValue}</span>
                            </div>
                          )}

                          <p className="text-xs text-slate-300 line-clamp-2">
                            {spec.description || 'Chưa có mô tả chi tiết'}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-slate-800 text-[11px] flex items-center justify-between">
                        <span className="text-slate-500">
                          Thứ tự: <strong className="text-slate-300 font-mono">{spec.sortOrder || 0}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            spec.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {spec.status === 'active' ? '🟢 Hoạt động' : '⚪ Tạm ngưng'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 9: BẢO MẬT & PHÊ DUYỆT CẤP LẠI MẬT KHẨU */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-500/30 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Quy Trình Bảo Mật & Cấp Lại Mật Khẩu Qua Email Admin</h3>
                  <p className="text-xs text-slate-300">
                    Email Quản Trị tiếp nhận yêu cầu xác thực:{' '}
                    <strong className="text-amber-400 font-mono">{emailConfig.adminNotificationEmail || 'hrmgpsoft@gmail.com'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Requests Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-3">
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Danh Sách Yêu Cầu Cấp Lại Mật Khẩu Chờ Phê Duyệt ({passwordResetRequests.length})
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Tài Khoản</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Email Nhận Mật Khẩu</th>
                      <th className="py-3 px-4">Mã PIN Xác Thực</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác Phê Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {passwordResetRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {new Date(req.requestedAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-cyan-400">@{req.username}</td>
                        <td className="py-3 px-4 font-bold text-white">{req.fullName}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{req.userEmail}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 tracking-wider">
                            {req.verificationCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {req.status === 'pending_admin_approval' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center w-max space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Chờ Admin duyệt</span>
                            </span>
                          ) : req.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center w-max space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Đã cấp mật khẩu</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center w-max space-x-1">
                              <X className="w-3 h-3" />
                              <span>Từ chối</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'pending_admin_approval' ? (
                            <button
                              onClick={() => {
                                setSelectedPwdRequest(req);
                                setIsPwdApprovalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                            >
                              Xác Nhận & Cấp Pass
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono">
                              {req.tempPassword ? `Pass: ${req.tempPassword}` : 'Đã hoàn tất'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: CỔNG EMAIL GATEWAY & LOGS */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* SMTP Settings Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Server className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Cấu Hình Máy Chủ SMTP & Email Hệ Thống</h3>
                    <p className="text-xs text-slate-400">Tích hợp Gmail SMTP / Google Workspace để gửi Hóa đơn & Báo giá tự động</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveEmailConfig}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Cấu Hình SMTP</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Máy chủ SMTP (Host)</label>
                  <input
                    type="text"
                    value={localEmailConfig.smtpHost}
                    onChange={(e) => setLocalEmailConfig({ ...localEmailConfig, smtpHost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cổng SMTP (Port)</label>
                  <input
                    type="number"
                    value={localEmailConfig.smtpPort}
                    onChange={(e) =>
                      setLocalEmailConfig({ ...localEmailConfig, smtpPort: parseInt(e.target.value) || 587 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Quản Trị Cảnh Báo (Admin)</label>
                  <input
                    type="email"
                    value={localEmailConfig.adminNotificationEmail}
                    onChange={(e) =>
                      setLocalEmailConfig({ ...localEmailConfig, adminNotificationEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tài khoản gửi SMTP (User)</label>
                  <input
                    type="email"
                    value={localEmailConfig.authUser}
                    onChange={(e) => setLocalEmailConfig({ ...localEmailConfig, authUser: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mật khẩu ứng dụng (App Password)</label>
                  <input
                    type="password"
                    value={localEmailConfig.authPasswordMasked}
                    onChange={(e) =>
                      setLocalEmailConfig({ ...localEmailConfig, authPasswordMasked: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tên Người Gửi Hiển Thị</label>
                  <input
                    type="text"
                    value={localEmailConfig.defaultSenderName}
                    onChange={(e) =>
                      setLocalEmailConfig({ ...localEmailConfig, defaultSenderName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Test Console */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Kiểm Tra Kết Nối & Gửi Thử Nghiệm (Test Dispatch)</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Nhập email nhận thử nghiệm (VD: hrmgpsoft@gmail.com)"
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingTestEmail ? 'Đang gửi...' : 'Gửi Thử Nghiệm'}</span>
                </button>
              </div>

              {testEmailResult && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{testEmailResult}</span>
                </div>
              )}
            </div>

            {/* Email Dispatch Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-3">
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Nhật Ký Phát Thư Điện Tử ({emailLogs.length} bức thư)
                  </h4>
                </div>
                {emailLogs.length > 0 && (
                  <button
                    onClick={clearEmailLogs}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Xóa nhật ký
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Người Nhận</th>
                      <th className="py-3 px-4">Loại Thư</th>
                      <th className="py-3 px-4">Tiêu Đề</th>
                      <th className="py-3 px-4">Mã Tham Chiếu</th>
                      <th className="py-3 px-4">Độ Trễ SMTP</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{log.recipientName}</div>
                          <div className="font-mono text-[11px] text-cyan-400">{log.recipientEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {log.typeLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200 truncate max-w-[200px]">{log.subject}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{log.referenceCode || '-'}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{log.responseTimeMs} ms</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center w-max space-x-1 ${
                              log.status === 'sent'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {log.status === 'sent' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{log.status === 'sent' ? 'Thành công' : 'Thất bại'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Universal Quick Add Modal */}
      <QuickAddMasterDataModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddType}
        onSuccess={(item, type) => {
          showToast(`Đã thêm mới thành công vào danh mục gốc!`);
        }}
      />

      {/* Enterprise Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        initialData={editingProject}
        onSave={(data) => {
          if (editingProject) {
            updateProject(editingProject.id, data);
            showToast('Đã cập nhật dự án thành công');
          } else {
            addProject(data);
            showToast('Đã thêm dự án mới thành công');
          }
        }}
      />

      {/* Customer Detail Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        initialData={editingCustomer}
        customerGroups={customerGroups}
        customerTiers={customerTiers}
        onSave={(data) => {
          if (editingCustomer) {
            updateCustomer(editingCustomer.id, data);
            showToast('Đã cập nhật hồ sơ khách hàng thành công');
          } else {
            addCustomer(data);
            showToast('Đã thêm khách hàng mới thành công');
          }
        }}
      />

      {/* Customer Tier Modal */}
      <CustomerTierModal
        isOpen={isCustomerTierModalOpen}
        onClose={() => {
          setIsCustomerTierModalOpen(false);
          setEditingCustomerTier(null);
        }}
        initialData={editingCustomerTier}
        onSave={(data) => {
          if (editingCustomerTier) {
            updateCustomerTier(editingCustomerTier.id, data);
            showToast('Đã cập nhật hạng thành viên');
          } else {
            addCustomerTier(data);
            showToast('Đã thêm hạng thành viên mới');
          }
        }}
      />

      {/* Customer Group Modal */}
      <CustomerGroupModal
        isOpen={isCustomerGroupModalOpen}
        onClose={() => {
          setIsCustomerGroupModalOpen(false);
          setEditingCustomerGroup(null);
        }}
        initialData={editingCustomerGroup}
        onSave={(data) => {
          if (editingCustomerGroup) {
            updateCustomerGroup(editingCustomerGroup.id, data);
            showToast('Đã cập nhật nhóm khách hàng');
          } else {
            addCustomerGroup(data);
            showToast('Đã thêm nhóm khách hàng mới');
          }
        }}
      />

      {/* Supplier Detail Modal */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
        initialData={editingSupplier}
        supplierCategories={supplierCategories}
        onSave={(data) => {
          if (editingSupplier) {
            updateSupplier(editingSupplier.id, data);
            showToast('Đã cập nhật nhà cung ứng');
          } else {
            addSupplier(data);
            showToast('Đã thêm nhà cung ứng mới');
          }
        }}
      />

      {/* Supplier Category Modal */}
      <SupplierCategoryModal
        isOpen={isSupplierCategoryModalOpen}
        onClose={() => {
          setIsSupplierCategoryModalOpen(false);
          setEditingSupplierCategory(null);
        }}
        initialData={editingSupplierCategory}
        onSave={(data) => {
          if (editingSupplierCategory) {
            updateSupplierCategory(editingSupplierCategory.id, data);
            showToast('Đã cập nhật nhóm nhà cung ứng');
          } else {
            addSupplierCategory(data);
            showToast('Đã thêm nhóm nhà cung ứng mới');
          }
        }}
      />

      {/* Product Category & VAT Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        onSave={(data) => {
          if (editingCategory) {
            updateProductCategory(editingCategory.id, data);
            showToast('Đã cập nhật nhóm ngành hàng & VAT');
          } else {
            addProductCategory(data);
            showToast('Đã thêm nhóm ngành hàng mới');
          }
        }}
      />

      {/* Unit of Measure Modal */}
      <UnitOfMeasureModal
        isOpen={isUomModalOpen}
        onClose={() => {
          setIsUomModalOpen(false);
          setEditingUom(null);
        }}
        initialData={editingUom}
        unitsOfMeasure={unitsOfMeasure}
        onSave={(data) => {
          if (editingUom) {
            updateUnitOfMeasure(editingUom.id, data);
            showToast('Đã cập nhật đơn vị tính');
          } else {
            addUnitOfMeasure(data);
            showToast('Đã thêm đơn vị tính mới');
          }
        }}
      />

      {/* UOM Conversion Group Modal */}
      <UomGroupModal
        isOpen={isUomGroupModalOpen}
        onClose={() => {
          setIsUomGroupModalOpen(false);
          setEditingUomGroup(null);
        }}
        initialData={editingUomGroup}
        unitsOfMeasure={unitsOfMeasure}
        onSave={(data) => {
          if (editingUomGroup) {
            updateUomGroup(editingUomGroup.id, data);
            showToast('Đã cập nhật bộ nhóm quy đổi ĐVT');
          } else {
            addUomGroup(data);
            showToast('Đã thêm bộ nhóm quy đổi ĐVT mới');
          }
        }}
      />

      {/* Master Warehouse Modal */}
      <WarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => {
          setIsWarehouseModalOpen(false);
          setEditingWarehouse(null);
        }}
        initialData={editingWarehouse}
        onSave={(data) => {
          if (editingWarehouse) {
            updateWarehouse(editingWarehouse.id, data);
            showToast('Đã cập nhật thông tin kho hàng');
          } else {
            addWarehouse(data);
            showToast('Đã thêm kho hàng mới vào hệ thống');
          }
        }}
      />

      {/* Warehouse Location Modal */}
      <WarehouseLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        }}
        initialData={editingLocation}
        warehouses={warehouses}
        defaultWarehouseId={selectedWarehouseFilter !== 'all' ? selectedWarehouseFilter : undefined}
        onSave={(data) => {
          if (editingLocation) {
            updateWarehouseLocation(editingLocation.id, data);
            showToast('Đã cập nhật vị trí ô kệ');
          } else {
            addWarehouseLocation(data);
            showToast('Đã thêm vị trí ô kệ mới');
          }
        }}
      />

      {/* Department Detail Modal */}
      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => {
          setIsDeptModalOpen(false);
          setEditingDept(null);
        }}
        initialData={editingDept}
        onSave={(data) => {
          if (editingDept) {
            updateDepartment(editingDept.id, data);
            showToast('Đã cập nhật phòng ban thành công');
          } else {
            addDepartment(data);
            showToast('Đã thêm phòng ban mới');
          }
        }}
      />

      {/* Job Position Detail Modal */}
      <JobPositionModal
        isOpen={isPosModalOpen}
        onClose={() => {
          setIsPosModalOpen(false);
          setEditingPos(null);
        }}
        initialData={editingPos}
        departments={departments}
        onSave={(data) => {
          if (editingPos) {
            updateJobPosition(editingPos.id, data);
            showToast('Đã cập nhật chức vụ thành công');
          } else {
            addJobPosition(data);
            showToast('Đã thêm chức vụ mới');
          }
        }}
      />

      {/* Color Detail Modal */}
      <ColorModal
        isOpen={isColorModalOpen}
        onClose={() => {
          setIsColorModalOpen(false);
          setEditingColor(null);
        }}
        initialData={editingColor}
        onSave={(data) => {
          if (editingColor) {
            updateColor(editingColor.id, data);
            showToast('Đã cập nhật màu sắc thành công');
          } else {
            addColor(data);
            showToast('Đã thêm màu sắc mới');
          }
        }}
      />

      {/* Specification Detail Modal */}
      <SpecificationModal
        isOpen={isSpecModalOpen}
        onClose={() => {
          setIsSpecModalOpen(false);
          setEditingSpec(null);
        }}
        initialData={editingSpec}
        onSave={(data) => {
          if (editingSpec) {
            updateSpecification(editingSpec.id, data);
            showToast('Đã cập nhật quy cách thành công');
          } else {
            addSpecification(data);
            showToast('Đã thêm quy cách mới');
          }
        }}
      />

      {/* Password Reset Approval Modal */}
      <PasswordResetApprovalModal
        isOpen={isPwdApprovalOpen}
        onClose={() => {
          setIsPwdApprovalOpen(false);
          setSelectedPwdRequest(null);
        }}
        request={selectedPwdRequest}
        onApprove={async (id, tempPass) => {
          const res = await approvePasswordReset(id, tempPass);
          showToast(res.message);
          return res;
        }}
        onReject={(id, note) => {
          rejectPasswordReset(id, note);
          showToast('Đã từ chối yêu cầu cấp lại mật khẩu');
        }}
      />
    </div>
  );
};
