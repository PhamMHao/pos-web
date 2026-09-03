import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Check,
  Building,
  Briefcase,
  MapPin,
  Warehouse,
  Scale,
  FolderTree,
  Users,
  Truck,
  Mail,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Sparkles,
  User,
  UserPlus,
  CreditCard,
  Percent,
  Award,
  Crown,
  Trash2,
  Layers,
  ArrowRightLeft,
  Equal,
  Palette,
  Boxes,
  Sliders,
} from 'lucide-react';
import {
  Department,
  JobPosition,
  MasterWarehouse,
  WarehouseLocation,
  UnitOfMeasure,
  MasterUomGroup,
  MasterUomGroupLine,
  MasterProductCategory,
  CustomerGroup,
  MasterCustomerTier,
  MasterSupplierCategory,
  EmailTemplate,
  PasswordResetRequest,
  Customer,
  Supplier,
  CustomerTier,
  EnterpriseProject,
  EnterpriseProjectStatus,
  MasterColor,
  MasterSpecification,
} from '../../types';
import { SYSTEM_ROLES } from '../../config/rbac.config';

// ==========================================
// 1. Department Modal
// ==========================================
interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Department | null;
  onSave: (data: Omit<Department, 'id' | 'createdAt'>) => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setHeadOfDepartment(initialData.headOfDepartment || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setLocation(initialData.location || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
    } else {
      setName('');
      setCode('');
      setHeadOfDepartment('');
      setPhone('0985 862 609');
      setEmail('');
      setLocation('Tầng 1 Showroom');
      setDescription('');
      setStatus('active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      headOfDepartment: headOfDepartment.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: location.trim(),
      description: description.trim(),
      status,
      employeeCount: initialData?.employeeCount || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Phòng Ban / Bộ Phận' : 'Thêm Phòng Ban Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Phòng Ban *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PB-KD, PB-KT..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Phòng Ban *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Phòng Kinh Doanh & Dự Án B2B"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trưởng bộ phận</label>
              <input
                type="text"
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                placeholder="Họ và tên trưởng phòng"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Số ĐT nội bộ</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0985 862 609"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email phòng ban</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@vitinhgiaphuc.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Vị trí / Khu vực làm việc</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tầng 1 Showroom"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả nhiệm vụ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Chức năng, quyền hạn của phòng ban..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật' : 'Thêm Phòng Ban'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. Job Position Modal
// ==========================================
interface JobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: JobPosition | null;
  departments: Department[];
  onSave: (data: Omit<JobPosition, 'id' | 'createdAt'>) => void;
}

export const JobPositionModal: React.FC<JobPositionModalProps> = ({
  isOpen,
  onClose,
  initialData,
  departments,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [baseSalary, setBaseSalary] = useState<number>(10000000);
  const [responsibilityAllowance, setResponsibilityAllowance] = useState<number>(1000000);
  const [salaryCoefficient, setSalaryCoefficient] = useState<number>(1.0);
  const [linkedRole, setLinkedRole] = useState('sales');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setTitle(initialData.title || '');
      setDepartmentId(initialData.departmentId || departments[0]?.id || '');
      setBaseSalary(initialData.baseSalary || 10000000);
      setResponsibilityAllowance(initialData.responsibilityAllowance || 1000000);
      setSalaryCoefficient(initialData.salaryCoefficient || 1.0);
      setLinkedRole(initialData.linkedRole || 'sales');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
    } else {
      setCode('');
      setTitle('');
      setDepartmentId(departments[0]?.id || '');
      setBaseSalary(10000000);
      setResponsibilityAllowance(1000000);
      setSalaryCoefficient(1.0);
      setLinkedRole('sales');
      setDescription('');
      setStatus('active');
    }
  }, [initialData, departments, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === departmentId);
    onSave({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      departmentId,
      departmentName: dept?.name || 'Phòng Ban',
      baseSalary,
      responsibilityAllowance,
      salaryCoefficient,
      linkedRole,
      description: description.trim(),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Chức Vụ / Chức Danh' : 'Thêm Chức Vụ Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Chức Vụ *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CV-CEO, CV-KTT, CV-TK..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phòng ban trực thuộc *</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <option value="">-- Chưa có phòng ban --</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Chức Danh / Vị Trí *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Kế Toán Trưởng & Tài Chính"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lương Cơ Sở (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="500000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phụ Cấp (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="100000"
                value={responsibilityAllowance}
                onChange={(e) => setResponsibilityAllowance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hệ Số Lương</label>
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={salaryCoefficient}
                onChange={(e) => setSalaryCoefficient(parseFloat(e.target.value) || 1.0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Liên kết Vai Trò RBAC</label>
              <select
                value={linkedRole}
                onChange={(e) => setLinkedRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nameVi}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả yêu cầu công việc</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Yêu cầu bằng cấp, kỹ năng và trách nhiệm..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật' : 'Thêm Chức Vụ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. Category & VAT Modal (Nhóm Hàng & VAT)
// ==========================================
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterProductCategory | null;
  onSave: (data: Omit<MasterProductCategory, 'id' | 'createdAt'>) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [defaultVatRate, setDefaultVatRate] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDefaultVatRate(initialData.defaultVatRate !== undefined ? initialData.defaultVatRate : 10);
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
    } else {
      setCode('');
      setName('');
      setDefaultVatRate(10);
      setDescription('');
      setStatus('active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      defaultVatRate,
      description: description.trim(),
      status,
      productCount: initialData?.productCount || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Nhóm Ngành Hàng & VAT' : 'Thêm Nhóm Hàng Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Nhóm Ngành Hàng *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CAT-LKPC, CAT-LAP..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Nhóm Ngành Hàng *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Linh Kiện PC & Máy Tính Để Bàn"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              <span>Thuế Suất VAT Mặc Định:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 8, 5, 0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setDefaultVatRate(rate)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    defaultVatRate === rate
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  VAT {rate}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả chi tiết / Sản phẩm đại diện</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="CPU, Mainboard, RAM, Ổ cứng SSD/HDD, Card VGA, Nguồn PSU..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Nhóm Hàng' : 'Lưu Nhóm Hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. Unit of Measure Modal (Đơn Vị Tính)
// ==========================================
interface UnitOfMeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UnitOfMeasure | null;
  unitsOfMeasure: UnitOfMeasure[];
  onSave: (data: Omit<UnitOfMeasure, 'id' | 'createdAt'>) => void;
}

export const UnitOfMeasureModal: React.FC<UnitOfMeasureModalProps> = ({
  isOpen,
  onClose,
  initialData,
  unitsOfMeasure,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setSymbol(initialData.symbol || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
    } else {
      setCode('');
      setName('');
      setSymbol('');
      setDescription('');
      setStatus('active');
    }
  }, [initialData, unitsOfMeasure, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      symbol: symbol.trim() || name.toLowerCase().trim(),
      isBaseUnit: true,
      conversionRate: 1,
      description: description.trim(),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Đơn Vị Tính' : 'Thêm Đơn Vị Tính Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã ĐVT *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CAI, THUNG, HOP, CUON, MET..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ký hiệu viết tắt</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="cái, thùng, hộp, m, kg..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Đơn Vị Tính *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cái, Thùng, Hộp, Cuộn, Mét..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả / Ghi chú</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="VD: Đơn vị tính chuẩn dùng cho các linh kiện và thiết bị..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật ĐVT' : 'Lưu ĐVT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4.1 UOM Conversion Group Modal (Bộ Nhóm ĐVT & Quy Đổi)
// ==========================================
interface UomGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterUomGroup | null;
  unitsOfMeasure: UnitOfMeasure[];
  onSave: (data: Omit<MasterUomGroup, 'id' | 'createdAt'>) => void;
}

export const UomGroupModal: React.FC<UomGroupModalProps> = ({
  isOpen,
  onClose,
  initialData,
  unitsOfMeasure,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [baseUnit, setBaseUnit] = useState('Cái');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [lines, setLines] = useState<Array<{
    id?: string;
    unit: string;
    conversionFactor: number;
    referenceUnit: string;
    ratioToBase?: number | null;
    note?: string | null;
    sortOrder?: number;
  }>>([]);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setBaseUnit(initialData.baseUnit || (unitsOfMeasure[0]?.name || 'Cái'));
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
      setLines(
        (initialData.lines || []).map((l, idx) => ({
          id: l.id,
          unit: l.unit,
          conversionFactor: Number(l.conversionFactor) || 1,
          referenceUnit: l.referenceUnit || initialData.baseUnit || 'Cái',
          ratioToBase: l.ratioToBase ? Number(l.ratioToBase) : null,
          note: l.note || '',
          sortOrder: l.sortOrder || idx + 1,
        }))
      );
    } else {
      setCode(`GRP-UOM-${Date.now().toString().slice(-4)}`);
      setName('');
      const defaultBase = unitsOfMeasure[0]?.name || 'Cái';
      setBaseUnit(defaultBase);
      setDescription('');
      setStatus('active');
      setLines([
        {
          unit: 'Hộp',
          conversionFactor: 10,
          referenceUnit: defaultBase,
          ratioToBase: 10,
          note: 'Quy cách đóng hộp',
          sortOrder: 1,
        },
        {
          unit: 'Thùng',
          conversionFactor: 20,
          referenceUnit: 'Hộp',
          ratioToBase: 200,
          note: 'Thùng lớn gồm nhiều hộp',
          sortOrder: 2,
        },
      ]);
    }
  }, [initialData, unitsOfMeasure, isOpen]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    const availableUnit = unitsOfMeasure.find((u) => u.name !== baseUnit && !lines.some((l) => l.unit === u.name));
    const nextUnitName = availableUnit ? availableUnit.name : 'Đơn vị mới';
    setLines((prev) => [
      ...prev,
      {
        unit: nextUnitName,
        conversionFactor: 1,
        referenceUnit: baseUnit,
        ratioToBase: 1,
        note: '',
        sortOrder: prev.length + 1,
      },
    ]);
  };

  const handleUpdateLine = (index: number, field: string, value: any) => {
    setLines((prev) =>
      prev.map((line, idx) => {
        if (idx !== index) return line;
        const updated = { ...line, [field]: value };
        return updated;
      })
    );
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên bộ nhóm quy đổi');
      return;
    }
    if (!baseUnit.trim()) {
      alert('Vui lòng chọn đơn vị tính cơ sở chuẩn');
      return;
    }

    const cleanLines = lines.map((l, idx) => ({
      id: l.id,
      unit: l.unit.trim(),
      conversionFactor: Number(l.conversionFactor) || 1,
      referenceUnit: (l.referenceUnit || baseUnit).trim(),
      ratioToBase: l.ratioToBase ? Number(l.ratioToBase) : Number(l.conversionFactor) || 1,
      note: l.note?.trim() || null,
      sortOrder: idx + 1,
    }));

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      baseUnit: baseUnit.trim(),
      description: description.trim() || null,
      status,
      lines: cleanLines as any,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Chỉnh Sửa Bộ Nhóm Quy Đổi ĐVT' : 'Thêm Mới Bộ Cấu Hình Nhóm ĐVT & Quy Đổi'}
              </h3>
              <p className="text-xs text-slate-400">Thiết lập nhóm đơn vị tính cơ sở và danh sách các cấp quy đổi tương ứng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* PHẦN 1: THÔNG TIN BỘ NHÓM QUY ĐỔI */}
          <div className="bg-slate-850/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Scale className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">Phần 1: Thông Tin Bộ Nhóm ĐVT</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mã nhóm quy đổi *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VD: GRP-UOM-CABLE, GRP-UOM-PACK..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tên bộ nhóm quy đổi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Quy chuẩn Dây Cáp & Điện, Đóng gói Thùng-Hộp-Cái..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ĐVT Cơ Sở Chuẩn (Base Unit) *
                </label>
                <div className="relative">
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-purple-500/50 rounded-xl text-purple-200 text-xs font-bold focus:border-purple-400 focus:outline-none cursor-pointer"
                  >
                    {unitsOfMeasure.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} {u.symbol ? `(${u.symbol})` : ''} - {u.code}
                      </option>
                    ))}
                    {!unitsOfMeasure.some((u) => u.name === baseUnit) && baseUnit && (
                      <option value={baseUnit}>{baseUnit} (Tùy chọn)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mô tả / Ghi chú nghiệp vụ</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả phạm vi áp dụng, ví dụ: Áp dụng cho các sản phẩm cáp mạng, dây điện xuất lẻ..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
                >
                  <option value="active">🟢 Đang hoạt động</option>
                  <option value="inactive">⚪ Tạm ngưng</option>
                </select>
              </div>
            </div>
          </div>

          {/* PHẦN 2: BẢNG CẤU HÌNH CÔNG THỨC QUY ĐỔI ĐỘNG (ĐVT = HỆ SỐ x ĐVT) */}
          <div className="bg-slate-850/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Phần 2: Bảng Cấu Hình Các Dòng Quy Đổi (ĐVT = Hệ số x ĐVT)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Quy tắc thiết lập: <span className="font-bold text-white">1 [ĐVT Quy Đổi] = [Hệ Số] x [ĐVT Tham Chiếu / Cơ Sở]</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow shadow-emerald-600/20 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Dòng Quy Đổi</span>
              </button>
            </div>

            {/* Dynamic Lines Table */}
            {lines.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-750 p-6 space-y-2">
                <p className="text-xs text-slate-400">Chưa có dòng quy đổi nào trong nhóm này.</p>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Dòng Quy Đổi Đầu Tiên</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/80 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-900/40">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[140px]">ĐVT Quy Đổi (Chọn thoải mái)</th>
                      <th className="py-2.5 px-2 w-8 text-center">=</th>
                      <th className="py-2.5 px-3 w-28">Hệ Số Quy Đổi</th>
                      <th className="py-2.5 px-3 min-w-[140px]">ĐVT Tham Chiếu / Chuẩn</th>
                      <th className="py-2.5 px-3 min-w-[150px]">Công Thức Trực Quan</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Ghi Chú Quy Cách</th>
                      <th className="py-2.5 px-2 w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {lines.map((line, idx) => {
                      const factor = Number(line.conversionFactor) || 1;
                      const ref = line.referenceUnit || baseUnit;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/50 transition-colors group">
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                          
                          {/* Đơn vị quy đổi (Chọn thoải mái từ Master UOM hoặc nhập) */}
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-1">
                              <select
                                value={line.unit}
                                onChange={(e) => handleUpdateLine(idx, 'unit', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs focus:border-purple-500 focus:outline-none"
                              >
                                {unitsOfMeasure.map((u) => (
                                  <option key={u.id} value={u.name}>
                                    {u.name} {u.symbol ? `(${u.symbol})` : ''}
                                  </option>
                                ))}
                                {!unitsOfMeasure.some((u) => u.name === line.unit) && line.unit && (
                                  <option value={line.unit}>{line.unit}</option>
                                )}
                              </select>
                            </div>
                          </td>

                          {/* Dấu = */}
                          <td className="py-2 px-2 text-center font-bold text-slate-400">
                            =
                          </td>

                          {/* Hệ số quy đổi */}
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0.0001"
                              step="any"
                              required
                              value={line.conversionFactor}
                              onChange={(e) => handleUpdateLine(idx, 'conversionFactor', parseFloat(e.target.value) || 0)}
                              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-300 font-mono font-bold text-xs text-right focus:border-emerald-500 focus:outline-none"
                              placeholder="VD: 305"
                            />
                          </td>

                          {/* Đơn vị tham chiếu */}
                          <td className="py-2 px-3">
                            <select
                              value={line.referenceUnit || baseUnit}
                              onChange={(e) => handleUpdateLine(idx, 'referenceUnit', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                            >
                              <option value={baseUnit}>⭐ {baseUnit} (Cơ sở chuẩn)</option>
                              {unitsOfMeasure
                                .filter((u) => u.name !== line.unit)
                                .map((u) => (
                                  <option key={u.id} value={u.name}>
                                    {u.name} {u.symbol ? `(${u.symbol})` : ''}
                                  </option>
                                ))}
                              {lines
                                .filter((l, i) => i !== idx && l.unit && l.unit !== line.unit && l.unit !== baseUnit)
                                .map((l, i) => (
                                  <option key={i} value={l.unit}>
                                    {l.unit} (ĐVT cùng nhóm)
                                  </option>
                                ))}
                            </select>
                          </td>

                          {/* Preview công thức trực quan */}
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                              <span>1 {line.unit || '?'}</span>
                              <span className="text-slate-400">=</span>
                              <span className="text-emerald-400">{factor}</span>
                              <span className="text-slate-300">{ref}</span>
                            </span>
                          </td>

                          {/* Ghi chú */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={line.note || ''}
                              onChange={(e) => handleUpdateLine(idx, 'note', e.target.value)}
                              placeholder="VD: Cáp mạng 305m..."
                              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs focus:border-purple-500 focus:outline-none"
                            />
                          </td>

                          {/* Nút xóa dòng */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Xóa dòng quy đổi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {lines.length > 0 && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm dòng quy đổi khác</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer shadow-lg shadow-purple-600/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Bộ Nhóm Quy Đổi' : 'Lưu Bộ Cấu Hình Nhóm ĐVT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// 4.5. Master Warehouse Modal (Kho Hàng)
// ==========================================
interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterWarehouse | null;
  onSave: (data: Omit<MasterWarehouse, 'id' | 'createdAt'>) => void;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'general' | 'showroom' | 'rma' | 'transit' | 'branch'>('general');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState<number>(1000);
  const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');
  const [isDefault, setIsDefault] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setType(initialData.type || 'general');
      setAddress(initialData.address || '');
      setManagerName(initialData.managerName || '');
      setPhone(initialData.phone || '');
      setCapacity(initialData.capacity || 1000);
      setStatus(initialData.status || 'active');
      setIsDefault(!!initialData.isDefault);
      setDescription(initialData.description || '');
    } else {
      setCode(`KHO-${Date.now().toString().slice(-4)}`);
      setName('');
      setType('general');
      setAddress('');
      setManagerName('');
      setPhone('');
      setCapacity(5000);
      setStatus('active');
      setIsDefault(false);
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      address: address.trim() || undefined,
      managerName: managerName.trim() || undefined,
      phone: phone.trim() || undefined,
      capacity,
      status,
      isDefault,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialData ? 'Chỉnh Sửa Thông Tin Kho Hàng' : 'Thêm Kho Hàng Mới Vào Hệ Thống'}
              </h3>
              <p className="text-[11px] text-slate-400">Quản lý định danh cơ sở kho, người phụ trách và sức chứa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Kho Hàng (Code) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="KHO-CHINH, KHO-HCM..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phân Loại Kho</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium"
              >
                <option value="general">Kho Tổng / Trung Tâm Phân Phối</option>
                <option value="showroom">Kho Showroom & Kỹ Thuật Ráp Máy</option>
                <option value="branch">Kho Chi Nhánh Bán Hàng</option>
                <option value="rma">Kho Bảo Hành, Đổi Trả & RMA</option>
                <option value="transit">Kho Trung Chuyển Giao Nhận</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Kho Hàng Đầy Đủ *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kho Chính Gia Phúc Computer - Tân Bình"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Địa Chỉ Thực Tế Của Kho</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Số 123 Đường Cộng Hòa, Phường 12, Quận Tân Bình, TP.HCM"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Thủ Kho / Người Quản Lý</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="VD: Nguyễn Văn Khoa"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hotline / Số Điện Thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0903112233"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Sức Chứa Ước Tính (Sản Phẩm)</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trạng Thái Kho</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="active">Hoạt động bình thường</option>
                <option value="maintenance">Bảo trì / Kiểm kê định kỳ</option>
                <option value="inactive">Đóng cửa / Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultWh"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
            />
            <label htmlFor="isDefaultWh" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Đặt làm Kho Xuất/Nhập Hàng Mặc Định của hệ thống
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô Tả / Ghi Chú Phân Khu</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ghi chú về phân luồng xuất nhập hoặc đặc thù lưu trữ của kho..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Kho' : 'Lưu Kho Hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ==========================================
// 5. Warehouse Location Modal (Vị Trí Ô Kệ Theo Kho)
// ==========================================
interface WarehouseLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: WarehouseLocation | null;
  warehouses?: MasterWarehouse[];
  defaultWarehouseId?: string;
  onSave: (data: Omit<WarehouseLocation, 'id' | 'createdAt'>) => void;
}

export const WarehouseLocationModal: React.FC<WarehouseLocationModalProps> = ({
  isOpen,
  onClose,
  initialData,
  warehouses = [],
  defaultWarehouseId,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouseCode, setWarehouseCode] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [zone, setZone] = useState('');
  const [shelf, setShelf] = useState('');
  const [tier, setTier] = useState('');
  const [bin, setBin] = useState('');
  const [barcode, setBarcode] = useState('');
  const [capacity, setCapacity] = useState<number>(100);
  const [storageType, setStorageType] = useState<'rack' | 'bin' | 'pallet' | 'secure' | 'bulk' | 'cold'>('rack');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance' | 'full'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setWarehouseId(initialData.warehouseId || '');
      setWarehouseCode(initialData.warehouseCode || '');
      setWarehouseName(initialData.warehouseName || 'Kho Chính Gia Phúc Computer');
      setZone(initialData.zone || 'Khu A - Linh Kiện Cao Cấp');
      setShelf(initialData.shelf || '');
      setTier(initialData.tier || '');
      setBin(initialData.bin || '');
      setBarcode(initialData.barcode || initialData.code || '');
      setCapacity(initialData.capacity || initialData.maxCapacity || 100);
      setStorageType(initialData.storageType || 'rack');
      setNote(initialData.notes || initialData.note || '');
      setStatus((initialData.status as any) || 'active');
    } else {
      setCode(`VT-${Date.now().toString().slice(-4)}`);
      setName('');
      
      const targetWh = warehouses.find((w) => w.id === defaultWarehouseId) || warehouses[0];
      if (targetWh) {
        setWarehouseId(targetWh.id);
        setWarehouseCode(targetWh.code);
        setWarehouseName(targetWh.name);
      } else {
        setWarehouseId('');
        setWarehouseCode('');
        setWarehouseName('Kho Chính Gia Phúc Computer');
      }

      setZone('Khu A - Linh Kiện Cao Cấp');
      setShelf('Kệ A1');
      setTier('Tầng 1');
      setBin('Ngăn 01');
      setBarcode(`LOC-${Date.now().toString().slice(-6)}`);
      setCapacity(100);
      setStorageType('rack');
      setNote('');
      setStatus('active');
    }
  }, [initialData, isOpen, defaultWarehouseId, warehouses]);

  if (!isOpen) return null;

  const handleWarehouseChange = (selectedId: string) => {
    setWarehouseId(selectedId);
    const found = warehouses.find((w) => w.id === selectedId);
    if (found) {
      setWarehouseCode(found.code);
      setWarehouseName(found.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      barcode: barcode.trim().toUpperCase() || code.trim().toUpperCase(),
      warehouseId: warehouseId || undefined,
      warehouseCode: warehouseCode || undefined,
      warehouseName: warehouseName.trim(),
      zone: zone.trim() || undefined,
      shelf: shelf.trim() || undefined,
      tier: tier.trim() || undefined,
      bin: bin.trim() || undefined,
      capacity,
      maxCapacity: capacity,
      currentUsage: initialData?.currentUsage || 0,
      storageType,
      notes: note.trim() || undefined,
      note: note.trim() || undefined,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialData ? 'Chỉnh Sửa Vị Trí Ô Kệ' : 'Thêm Vị Trí Ô Kệ Theo Kho'}
              </h3>
              <p className="text-[11px] text-slate-400">Định vị chính xác phân khu, kệ, tầng và ô chứa hàng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Kho Hàng Trực Thuộc *</label>
            {warehouses.length > 0 ? (
              <select
                value={warehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold text-blue-400"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                placeholder="Kho Chính Gia Phúc Computer"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Vị Trí (Code) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VT-MAIN-A1, VT-SR-01..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Barcode Quét Tem</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="LOC-MAIN-A1"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Vị Trí / Mô Tả Ô Kệ *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kệ A1 - Tầng 1 (CPU & Vi Xử Lý)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phân Khu Lưu Trữ (Zone)</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="VD: Khu A - Linh Kiện Cao Cấp"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kệ / Dãy Hàng (Shelf)</label>
              <input
                type="text"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                placeholder="VD: Kệ A1, Kệ B2"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tầng (Tier)</label>
              <input
                type="text"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                placeholder="VD: Tầng 1"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ô / Ngăn (Bin)</label>
              <input
                type="text"
                value={bin}
                onChange={(e) => setBin(e.target.value)}
                placeholder="VD: Ngăn 01"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Sức Chứa (SKU)</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Loại Hình Lưu Trữ</label>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="rack">Kệ Hàng Chia Tầng (Rack)</option>
                <option value="bin">Khay / Hộp Nhỏ (Bin)</option>
                <option value="pallet">Sàn Pallet Hàng Cồng Kềnh</option>
                <option value="secure">Tủ Kính / Khóa An Ninh (Secure)</option>
                <option value="bulk">Khu Lưu Trữ Rời (Bulk)</option>
                <option value="cold">Kho Lạnh Bảo Quản (Cold)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trạng Thái Ô Kệ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="active">Sẵn sàng chứa hàng</option>
                <option value="maintenance">Đang bảo trì / Kiểm kê</option>
                <option value="full">Đã đầy tải</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Ghi Chú Vị Trí</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú về điều kiện bảo quản, chủng loại thiết bị..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Vị Trí' : 'Lưu Vị Trí Ô Kệ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. Customer Group Modal (Nhóm Khách Hàng)
// ==========================================
interface CustomerGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomerGroup | null;
  onSave: (data: Omit<CustomerGroup, 'id' | 'createdAt'>) => void;
}

export const CustomerGroupModal: React.FC<CustomerGroupModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [defaultDebtLimit, setDefaultDebtLimit] = useState<number>(20000000);
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [priorityLevel, setPriorityLevel] = useState<'standard' | 'high' | 'vip'>('standard');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDiscountPercent(initialData.discountPercent || 0);
      setDefaultDebtLimit(initialData.defaultDebtLimit || (initialData as any).creditLimit || 0);
      setPaymentTermsDays(initialData.paymentTermsDays || 30);
      setPriorityLevel(initialData.priorityLevel || 'standard');
      setNote(initialData.note || (initialData as any).description || '');
    } else {
      setCode('');
      setName('');
      setDiscountPercent(5);
      setDefaultDebtLimit(20000000);
      setPaymentTermsDays(30);
      setPriorityLevel('standard');
      setNote('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      discountPercent,
      defaultDebtLimit,
      creditLimit: defaultDebtLimit,
      paymentTermsDays,
      paymentTerms: `Gối đầu ${paymentTermsDays} ngày`,
      priorityLevel,
      note: note.trim() || undefined,
      description: note.trim() || undefined,
      customerCount: initialData?.customerCount || 0,
    } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Nhóm Khách Hàng' : 'Thêm Nhóm Khách Hàng Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Nhóm *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GRP-SI, GRP-VIP..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mức Độ Ưu Tiên</label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="standard">Tiêu chuẩn (Standard)</option>
                <option value="high">Ưu tiên cao (High)</option>
                <option value="vip">VIP Đặc biệt</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Nhóm Khách Hàng *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Khách Hàng Mua Sỉ & Đại Lý Cấp 2"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chiết Khấu (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hạn Mức Nợ (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="5000000"
                value={defaultDebtLimit}
                onChange={(e) => setDefaultDebtLimit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kỳ Hạn (Ngày)</label>
              <input
                type="number"
                min="0"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Ghi Chú Chính Sách</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Áp dụng cho khách hàng đạt doanh số trên 50tr/tháng..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Nhóm Khách' : 'Lưu Nhóm Khách'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 7. Customer Tier Modal (Hạng Thành Viên & Ưu Đãi Tier)
// ==========================================
interface CustomerTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterCustomerTier | null;
  onSave: (data: Omit<MasterCustomerTier, 'id' | 'createdAt'>) => void;
}

export const CustomerTierModal: React.FC<CustomerTierModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [minPoints, setMinPoints] = useState<number>(0);
  const [minSpent, setMinSpent] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [color, setColor] = useState<string>('amber');
  const [benefits, setBenefits] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setMinPoints(initialData.minPoints || 0);
      setMinSpent(initialData.minSpent || (initialData as any).minSpend || 0);
      setDiscountPercent(initialData.discountPercent || 0);
      setColor(initialData.color || 'amber');
      setBenefits(initialData.benefits || '');
      setStatus(initialData.status || 'active');
    } else {
      setCode('');
      setName('');
      setMinPoints(1000);
      setMinSpent(20000000);
      setDiscountPercent(3);
      setColor('amber');
      setBenefits('Tích lũy 2%, chiết khấu sản phẩm, hỗ trợ kỹ thuật tận nơi...');
      setStatus('active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      minPoints,
      minSpent,
      minSpend: minSpent,
      discountPercent,
      color,
      benefits: benefits.trim(),
      status,
      customerCount: initialData?.customerCount || 0,
    } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Hạng Thành Viên (Tier)' : 'Thêm Hạng Thành Viên Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Hạng (Code) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TIER-VANG, TIER-VIP..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Màu Sắc Nhận Diện</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="slate">Xám Bạc (Slate / Đồng)</option>
                <option value="blue">Xanh Dương (Blue / Bạc)</option>
                <option value="amber">Vàng Ánh Kim (Amber / Vàng)</option>
                <option value="purple">Tím Hoàng Gia (Purple / Kim Cương)</option>
                <option value="emerald">Xanh Ngọc Lục Bảo (Emerald / VIP)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Hạng Thành Viên *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hạng Vàng (Gold Member), VIP Doanh Nghiệp..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Điểm Tối Thiểu</label>
              <input
                type="number"
                min="0"
                value={minPoints}
                onChange={(e) => setMinPoints(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chi Tiêu (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="5000000"
                value={minSpent}
                onChange={(e) => setMinSpent(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chiết Khấu (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Đặc Quyền & Quyền Lợi Hạng Thành Viên</label>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              rows={3}
              placeholder="VD: Chiết khấu 5% toàn bộ sản phẩm, miễn phí vận chuyển tận nơi 2h, bảo hành 1 đổi 1 trong 12 tháng, ưu tiên giải quyết sự cố kỹ thuật..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Hạng Thành Viên' : 'Lưu Hạng Thành Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 8. Supplier Category Modal (Nhóm NCC)
// ==========================================
interface SupplierCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterSupplierCategory | null;
  onSave: (data: Omit<MasterSupplierCategory, 'id' | 'createdAt'>) => void;
}

export const SupplierCategoryModal: React.FC<SupplierCategoryModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Gối đầu công nợ 30 ngày');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDefaultPaymentTerms(initialData.defaultPaymentTerms || 'Gối đầu công nợ 30 ngày');
      setDescription(initialData.description || '');
    } else {
      setCode('');
      setName('');
      setDefaultPaymentTerms('Gối đầu công nợ 30 ngày');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      defaultPaymentTerms: defaultPaymentTerms.trim(),
      description: description.trim() || undefined,
      supplierCount: initialData?.supplierCount || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Nhóm Nhà Cung Ứng' : 'Thêm Nhóm Nhà Cung Ứng Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Nhóm NCC *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUP-CAT-CHINHHANG..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Điều Khoản Thanh Toán</label>
              <input
                type="text"
                value={defaultPaymentTerms}
                onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                placeholder="Gối đầu 30 ngày..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Phân Loại Đối Tác / NCC *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nhà Phân Phối Chính Hãng (Synnex FPT, Digiworld...)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô Tả Chủng Loại Hàng Hóa</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Cung cấp linh kiện PC, Màn hình chính hãng bảo hành 36 tháng..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Nhóm NCC' : 'Lưu Nhóm NCC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 9. Customer Detail Modal (Khách Hàng - Match Design)
// ==========================================
interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Customer | null;
  customerGroups?: CustomerGroup[];
  customerTiers?: MasterCustomerTier[];
  onSave: (data: Omit<Customer, 'id' | 'createdAt'>) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  initialData,
  customerGroups = [],
  customerTiers = [],
  onSave,
}) => {
  // 1. Nhận diện & phân loại
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState(customerGroups[0]?.name || '');
  const [tier, setTier] = useState<CustomerTier>((customerTiers[0]?.name as CustomerTier) || ('' as any));
  const [points, setPoints] = useState<number>(0);

  // 2. Cấu hình email gửi hóa đơn & báo giá
  const [email, setEmail] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [address, setAddress] = useState('');

  // 3. Doanh nghiệp, MST & Công nợ
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(20000000);
  const [creditDays, setCreditDays] = useState<number>(30);
  const [debt, setDebt] = useState<number>(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setCustomerType(initialData.customerType || initialData.groupName || customerGroups[0]?.name || '');
      setTier(initialData.tier || (customerTiers[0]?.name as CustomerTier) || ('' as any));
      setPoints(initialData.points || 0);

      setEmail(initialData.email || '');
      setInvoiceEmail(initialData.invoiceEmail || initialData.email || '');
      setQuoteEmail(initialData.quoteEmail || initialData.email || '');
      setAddress(initialData.address || '');

      setCompanyName(initialData.companyName || '');
      setTaxCode(initialData.taxCode || '');
      setBankAccount(initialData.bankAccount || '');
      setBankName(initialData.bankName || '');
      setCreditLimit(initialData.creditLimit !== undefined ? initialData.creditLimit : 20000000);
      setCreditDays(initialData.creditDays !== undefined ? initialData.creditDays : 30);
      setDebt(initialData.debt || 0);
      setNote(initialData.note || '');
    } else {
      setName('');
      setPhone('');
      setCustomerType(customerGroups[0]?.name || '');
      setTier((customerTiers[0]?.name as CustomerTier) || ('' as any));
      setPoints(0);

      setEmail('');
      setInvoiceEmail('');
      setQuoteEmail('');
      setAddress('');

      setCompanyName('');
      setTaxCode('');
      setBankAccount('');
      setBankName('');
      setCreditLimit(20000000);
      setCreditDays(30);
      setDebt(0);
      setNote('');
    }
  }, [initialData, isOpen, customerGroups, customerTiers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      phone: phone.trim(),
      customerType,
      groupName: customerType,
      tier,
      points,
      email: email.trim() || undefined,
      invoiceEmail: invoiceEmail.trim() || email.trim() || undefined,
      quoteEmail: quoteEmail.trim() || email.trim() || undefined,
      address: address.trim() || undefined,
      companyName: companyName.trim() || undefined,
      taxCode: taxCode.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      bankName: bankName.trim() || undefined,
      creditLimit,
      creditDays,
      totalSpent: initialData?.totalSpent || 0,
      totalOrders: initialData?.totalOrders || 0,
      debt,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialData ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Hồ Sơ Khách Hàng Mới'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Thiết lập dữ liệu danh mục khách hàng & thông tin gửi hóa đơn/báo giá
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* SECTION 1: THÔNG TIN NHẬN DIỆN & PHÂN LOẠI */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>1. THÔNG TIN NHẬN DIỆN & PHÂN LOẠI</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Khách Hàng / Đại Diện *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MR. TÚ"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số Điện Thoại / Hotline *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0944474733"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Loại Khách Hàng / Nhóm</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {customerGroups.length > 0 ? (
                    customerGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))
                  ) : (
                    <option value="">-- Chưa có nhóm khách hàng --</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hạng Thành Viên & Điểm Tích Lũy</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CustomerTier)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {customerTiers.length > 0 ? (
                      customerTiers.map((t) => (
                        <option key={t.id} value={t.name as CustomerTier}>
                          {t.name} ({t.discountPercent}% off)
                        </option>
                      ))
                    ) : (
                      <option value="">-- Chưa có hạng thành viên --</option>
                    )}
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    placeholder="2600"
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CẤU HÌNH EMAIL GỬI HÓA ĐƠN VAT & BÁO GIÁ */}
          <div className="space-y-3.5 pt-3 border-t border-slate-850">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              <span>2. CẤU HÌNH EMAIL GỬI HÓA ĐƠN VAT & BÁO GIÁ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Chính Của Khách Hàng</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mrtu.daklak@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Chuyên Nhận Hóa Đơn Điện Tử TT78 <span className="text-emerald-400 text-[10px] font-normal">(Tự động CC/BCC)</span>
                </label>
                <input
                  type="email"
                  value={invoiceEmail}
                  onChange={(e) => setInvoiceEmail(e.target.value)}
                  placeholder="mrtu.daklak@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Chuyên Nhận Báo Giá Dự Án</label>
                <input
                  type="email"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                  placeholder="mrtu.daklak@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Địa Chỉ Nhận Hàng & Xuất HĐ</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ĐẮK LẮK (Gửi nhà xe Tiến Oanh - Chợ đầu mối Tân Hòa, Tp. Buôn Mê Thuộc)"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: THÔNG TIN DOANH NGHIỆP, MÃ SỐ THUẾ & CÔNG NỢ */}
          <div className="space-y-3.5 pt-3 border-t border-slate-850">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>3. THÔNG TIN DOANH NGHIỆP, MÃ SỐ THUẾ & CÔNG NỢ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Pháp Nhân Công Ty (Xuất VAT)</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="VD: CÔNG TY CỔ PHẦN XÂY LẮP ĐIỆN MIỀN NAM"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mã Số Thuế (MST)</label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="VD: 0318999888"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số Tài Khoản Ngân Hàng</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="VD: 1903688899901"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ngân Hàng Thụ Hưởng</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: Techcombank - CN Tân Bình"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hạn Mức Nợ Tối Đa (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="5000000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  placeholder="20000000"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Thời Hạn Công Nợ (Ngày)</label>
                <input
                  type="number"
                  min="0"
                  value={creditDays}
                  onChange={(e) => setCreditDays(parseInt(e.target.value) || 0)}
                  placeholder="30"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ghi Chú Đặc Thù Khách Hàng</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2.5}
                placeholder="Gửi hàng qua nhà xe Tiến Oanh - Chợ đầu mối Tân Hòa, Tp. Buôn Mê Thuộc. Đóng gói cẩn thận thiết bị camera."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 10. Supplier Detail Modal (Nhà Cung Ứng)
// ==========================================
interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Supplier | null;
  supplierCategories?: MasterSupplierCategory[];
  onSave: (data: Omit<Supplier, 'id' | 'createdAt'>) => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  initialData,
  supplierCategories = [],
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [tier, setTier] = useState<string>(supplierCategories[0]?.name || '');
  const [category, setCategory] = useState('Linh kiện máy tính & Phụ kiện');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(50000000);
  const [creditDays, setCreditDays] = useState<number>(30);
  const [currentDebt, setCurrentDebt] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setTaxCode(initialData.taxCode || '');
      setTier(initialData.tier || supplierCategories[0]?.name || '');
      setCategory(initialData.category || 'Linh kiện máy tính & Phụ kiện');
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setBankName(initialData.bankName || '');
      setBankAccount(initialData.bankAccount || '');
      setCreditLimit(initialData.creditLimit || 50000000);
      setCreditDays(initialData.creditDays || 30);
      setCurrentDebt(initialData.currentDebt || 0);
      setNotes(initialData.notes || '');
    } else {
      setCode('');
      setName('');
      setTaxCode('');
      setTier(supplierCategories[0]?.name || '');
      setCategory('Linh kiện máy tính & Phụ kiện');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setBankName('');
      setBankAccount('');
      setCreditLimit(50000000);
      setCreditDays(30);
      setCurrentDebt(0);
      setNotes('');
    }
  }, [initialData, isOpen, supplierCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      taxCode: taxCode.trim(),
      tier,
      category,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      bankName: bankName.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      creditLimit,
      creditDays,
      currentDebt,
      ratingQuality: initialData?.ratingQuality || 5,
      ratingPrice: initialData?.ratingPrice || 5,
      ratingOnTime: initialData?.ratingOnTime || 5,
      ratingWarranty: initialData?.ratingWarranty || 5,
      notes: notes.trim() || undefined,
      priceList: initialData?.priceList || [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Nhà Cung Ứng & Đối Tác' : 'Thêm Nhà Cung Ứng Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã NCC *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUP-FPT, SUP-DGW..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Tên Nhà Cung Cấp / Công Ty *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Công Ty Cổ Phần Synnex FPT"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Số Thuế (MST)</label>
              <input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="0300123456"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phân Cấp Đối Tác</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                {supplierCategories.length > 0 ? (
                  supplierCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="">-- Chưa có phân cấp đối tác --</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Người Liên Hệ / Sales Phụ Trách</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Số Điện Thoại Liên Hệ *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0985 862 609"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Nhận Đơn Đặt Hàng PO</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@synnexfpt.com.vn"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tên Ngân Hàng</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Vietcombank, MB Bank, Techcombank..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Số Tài Khoản Ngân Hàng (STK)</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="0071000123456"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hạn Mức Tín Dụng (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="10000000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Thời Hạn Gối Đầu (Ngày)</label>
              <input
                type="number"
                min="0"
                value={creditDays}
                onChange={(e) => setCreditDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Công Nợ Hiện Tại (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="5000000"
                value={currentDebt}
                onChange={(e) => setCurrentDebt(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Địa Chỉ Văn Phòng / Kho Hàng</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Tòa nhà FPT Cầu Giấy, Hà Nội hoặc Showroom TP.HCM..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Ghi Chú & Chính Sách Chiết Khấu</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Chính sách bảo hành đổi mới 30 ngày, chiết khấu thưởng quý..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Nhà Cung Ứng' : 'Lưu Nhà Cung Ứng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 11. Password Reset Approval Modal
// ==========================================
interface PasswordResetApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PasswordResetRequest | null;
  onApprove: (requestId: string, customTempPassword?: string) => Promise<any>;
  onReject: (requestId: string, adminNote?: string) => void;
}

export const PasswordResetApprovalModal: React.FC<PasswordResetApprovalModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [customPassword, setCustomPassword] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    setCustomPassword('');
    setAdminNote('');
    setResultMessage(null);
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    const res = await onApprove(request.id, customPassword.trim() || undefined);
    setIsSubmitting(false);
    if (res?.success) {
      setResultMessage(res.message);
      setTimeout(() => {
        setResultMessage(null);
        onClose();
      }, 1500);
    }
  };

  const handleReject = () => {
    onReject(request.id, adminNote.trim() || 'Quản trị viên từ chối');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Xác Nhận Cấp Lại Mật Khẩu (Admin)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {resultMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{resultMessage}</span>
            </div>
          )}

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tài khoản:</span>
              <span className="font-bold text-white">@{request.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Họ và tên:</span>
              <span className="font-bold text-slate-200">{request.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email nhân viên:</span>
              <span className="font-mono text-cyan-400">{request.userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mã xác thực:</span>
              <span className="font-bold text-rose-400 font-mono tracking-widest">{request.verificationCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lý do:</span>
              <span className="text-slate-300 italic">{request.reason}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Mật khẩu tạm thời mới (để trống để tạo ngẫu nhiên):
            </label>
            <input
              type="text"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              placeholder="VD: GP@123456 hoặc tự động sinh"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Ghi chú của Admin (nếu từ chối):</label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Lý do từ chối nếu không hợp lệ..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Từ Chối
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang gửi email...' : 'Duyệt & Cấp Mật Khẩu'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 12. Enterprise Project Modal (Dự Án Doanh Nghiệp)
// ==========================================
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: EnterpriseProject | null;
  onSave: (data: Omit<EnterpriseProject, 'id' | 'createdAt'>) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<EnterpriseProjectStatus>('in_progress');
  const [customerName, setCustomerName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [sector, setSector] = useState('Sản Xuất & Khu Công Nghiệp');
  const [description, setDescription] = useState('');
  const [linkedDeviceCount, setLinkedDeviceCount] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setStatus(initialData.status || 'in_progress');
      setCustomerName(initialData.customerName || '');
      setManagerName(initialData.managerName || '');
      setBudget(initialData.budget || 0);
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setSector(initialData.sector || 'Sản Xuất & Khu Công Nghiệp');
      setDescription(initialData.description || '');
      setLinkedDeviceCount(initialData.linkedDeviceCount || 0);
    } else {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCode(`DA-${year}-${randomNum}`);
      setName('');
      setStatus('in_progress');
      setCustomerName('');
      setManagerName('');
      setBudget(85000000);
      setStartDate(new Date().toISOString().split('T')[0]);
      setSector('Sản Xuất & Khu Công Nghiệp');
      setDescription('');
      setLinkedDeviceCount(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      status,
      customerName: customerName.trim(),
      managerName: managerName.trim(),
      budget,
      startDate,
      sector,
      description: description.trim(),
      linkedDeviceCount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {initialData ? 'Chỉnh Sửa Dự Án' : 'Thêm Dự Án Mới'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Quản lý danh mục dự án & công trình phục vụ xuất nhập kho
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã dự án *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="DA-2026-002"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái dự án</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnterpriseProjectStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="in_progress">Đang triển khai thi công</option>
                <option value="completed">Đã nghiệm thu hoàn thành</option>
                <option value="planning">Lập kế hoạch / Báo giá</option>
                <option value="on_hold">Tạm dừng thi công</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên dự án / Công trình *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nâng Cấp Hạ Tầng Mạng Wifi 6 Doanh Nghiệp"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chủ đầu tư / Khách hàng</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tập Đoàn Xây Dựng & Bất Động Sản Miền Nam"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Người phụ trách / Quản lý</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Đỗ Quang Hưng (Kỹ sư IT)"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tổng ngân sách (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="5000000"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                placeholder="85000000"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lĩnh vực hoạt động</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Sản Xuất & Khu Công Nghiệp">Sản Xuất & Khu Công Nghiệp</option>
                <option value="Xây Dựng & Bất Động Sản">Xây Dựng & Bất Động Sản</option>
                <option value="Giáo Dục & Đào Tạo">Giáo Dục & Đào Tạo</option>
                <option value="Y Tế & Bệnh Viện">Y Tế & Bệnh Viện</option>
                <option value="Tài Chính & Ngân Hàng">Tài Chính & Ngân Hàng</option>
                <option value="Khách Sạn & Resort">Khách Sạn & Resort</option>
                <option value="Bán Lẻ & Chuỗi Cửa Hàng">Bán Lẻ & Chuỗi Cửa Hàng</option>
                <option value="Công Nghệ & Viễn Thông">Công Nghệ & Viễn Thông</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả chi tiết & Ghi chú dự án</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Triển khai Router cân bằng tải Reyee và 12 Access Point Wifi 6 Mesh cho tòa nhà 5 tầng."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 12. Master Color Modal
// ==========================================
interface ColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterColor | null;
  onSave: (data: Omit<MasterColor, 'id' | 'createdAt'>) => void;
}

export const ColorModal: React.FC<ColorModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#1e293b');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const PRESET_COLORS = [
    { label: 'Đen Nhám', hex: '#1e293b' },
    { label: 'Bạc Titan', hex: '#cbd5e1' },
    { label: 'Xám Không Gian', hex: '#64748b' },
    { label: 'Trắng Ngọc Trai', hex: '#f8fafc' },
    { label: 'Đỏ Gaming', hex: '#ef4444' },
    { label: 'Xanh Sapphire', hex: '#3b82f6' },
    { label: 'Vàng Champagne', hex: '#f59e0b' },
    { label: 'Xanh Emerald', hex: '#10b981' },
    { label: 'Tím Neon', hex: '#8b5cf6' },
    { label: 'Hồng Rose Gold', hex: '#ec4899' },
    { label: 'Xanh Cyan', hex: '#06b6d4' },
    { label: 'Cam Rực Rỡ', hex: '#f97316' },
  ];

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setHexCode(initialData.hexCode || '#1e293b');
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setSortOrder(initialData.sortOrder || 0);
    } else {
      setCode(`CLR-${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setHexCode('#1e293b');
      setDescription('');
      setStatus('active');
      setSortOrder(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      hexCode: hexCode.trim() || '#000000',
      description: description.trim() || null,
      status,
      sortOrder: Number(sortOrder) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-pink-950/30 via-slate-900 to-rose-950/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-pink-600/20 border border-pink-500/30 rounded-2xl text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'Chỉnh Sửa Màu Sắc' : 'Thêm Màu Sắc Sản Phẩm Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Định nghĩa màu sắc & mã màu HEX chuẩn hiển thị trên toàn hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mã màu <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CLR-BLACK"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Trạng thái hoạt động
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="active">🟢 Hoạt động</option>
                <option value="inactive">⚪ Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Tên màu sắc sản phẩm <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Đen Nhám (Matte Black)"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Color Selector & Preview */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-300">
              Chọn Mã Màu HEX Trực Quan
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="color"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  className="w-12 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                placeholder="#1e293b"
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-pink-500"
              />
              <div
                className="w-20 h-10 rounded-xl border border-slate-700 flex items-center justify-center text-[10px] font-bold shadow-inner"
                style={{
                  backgroundColor: hexCode,
                  color: ['#ffffff', '#f8fafc', '#cbd5e1'].includes(hexCode.toLowerCase())
                    ? '#0f172a'
                    : '#ffffff',
                }}
              >
                Xem Trước
              </div>
            </div>

            {/* Quick Palette Swatches */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-400 mb-1.5 block">
                Bảng màu gợi ý nhanh:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setHexCode(c.hex)}
                    className={`w-6 h-6 rounded-lg border transition-transform hover:scale-110 cursor-pointer ${
                      hexCode.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-white ring-2 ring-pink-500 scale-110'
                        : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`${c.label} (${c.hex})`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Thứ tự sắp xếp
              </label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mô tả ứng dụng màu
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vỏ case, bàn phím, laptop"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer shadow-lg shadow-pink-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Lưu Thay Đổi' : 'Thêm Màu Sắc'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 13. Master Specification Modal
// ==========================================
interface SpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MasterSpecification | null;
  onSave: (data: Omit<MasterSpecification, 'id' | 'createdAt'>) => void;
}

export const SpecificationModal: React.FC<SpecificationModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Đóng gói & Hộp');
  const [standardValue, setStandardValue] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const SPEC_CATEGORIES = [
    'Đóng gói & Hộp',
    'Chiều dài & Cuộn',
    'Khay & Vỉ linh kiện',
    'Đóng gói Túi',
    'Khối lượng & Tuýp',
    'Kích thước & Tiêu chuẩn',
    'Khác',
  ];

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setName(initialData.name);
      setCategory(initialData.category || 'Đóng gói & Hộp');
      setStandardValue(initialData.standardValue || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setSortOrder(initialData.sortOrder || 0);
    } else {
      setCode(`SPEC-${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setCategory('Đóng gói & Hộp');
      setStandardValue('');
      setDescription('');
      setStatus('active');
      setSortOrder(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim() || null,
      standardValue: standardValue.trim() || null,
      description: description.trim() || null,
      status,
      sortOrder: Number(sortOrder) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/30 via-slate-900 to-orange-950/30">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600/20 border border-amber-500/30 rounded-2xl text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'Chỉnh Sửa Quy Cách' : 'Thêm Quy Cách Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Quy chuẩn đóng gói, chiều dài, khối lượng & thông số định mức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mã quy cách <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SPEC-BOX10"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="active">🟢 Hoạt động</option>
                <option value="inactive">⚪ Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Tên quy cách <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Quy cách Hộp 10 Cái tiêu chuẩn"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Phân loại quy cách
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {SPEC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Giá trị tiêu chuẩn
              </label>
              <input
                type="text"
                value={standardValue}
                onChange={(e) => setStandardValue(e.target.value)}
                placeholder="VD: 10 Cái/Hộp, 305 Mét/Cuộn"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Thứ tự sắp xếp
            </label>
            <input
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Mô tả quy cách & Hướng dẫn đóng gói
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quy chuẩn đóng gói chống sốc và dán tem niêm phong 10 con mỗi hộp."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer shadow-lg shadow-amber-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Lưu Thay Đổi' : 'Thêm Quy Cách'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

