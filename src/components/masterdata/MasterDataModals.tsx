import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Check,
  Building,
  Briefcase,
  MapPin,
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
} from 'lucide-react';
import {
  Department,
  JobPosition,
  WarehouseLocation,
  UnitOfMeasure,
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
} from '../../types';

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
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
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
                <option value="admin">Quản Trị Viên (Admin)</option>
                <option value="manager">Quản Lý Cửa Hàng (Manager)</option>
                <option value="cashier">Thu Ngân POS (Cashier)</option>
                <option value="warehouse">Thủ Kho (Warehouse)</option>
                <option value="accountant">Kế Toán Trưởng (Accountant)</option>
                <option value="sales">Nhân Viên Kinh Doanh (Sales)</option>
                <option value="technician">Kỹ Thuật Viên (Technician)</option>
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
  const [isBaseUnit, setIsBaseUnit] = useState(true);
  const [baseUnitId, setBaseUnitId] = useState('');
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setSymbol(initialData.symbol || '');
      setIsBaseUnit(initialData.isBaseUnit !== undefined ? initialData.isBaseUnit : true);
      setBaseUnitId(initialData.baseUnitId || '');
      setConversionRate(initialData.conversionRate || 1);
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
    } else {
      setCode('');
      setName('');
      setSymbol('');
      setIsBaseUnit(true);
      setBaseUnitId(unitsOfMeasure.find((u) => u.isBaseUnit)?.id || '');
      setConversionRate(1);
      setDescription('');
      setStatus('active');
    }
  }, [initialData, unitsOfMeasure, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUom = unitsOfMeasure.find((u) => u.id === baseUnitId);
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      symbol: symbol.trim() || name.toLowerCase().trim(),
      isBaseUnit,
      baseUnitId: isBaseUnit ? undefined : baseUnitId,
      baseUnitName: isBaseUnit ? undefined : baseUom?.name,
      conversionRate: isBaseUnit ? 1 : conversionRate,
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
                placeholder="CAI, THUNG, HOP, CUON..."
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
              placeholder="VD: Thùng (10 Cái / Hộp)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isBaseUnit}
                onChange={(e) => setIsBaseUnit(e.target.checked)}
                className="rounded bg-slate-900 border-slate-600 text-purple-600 focus:ring-0 w-4 h-4"
              />
              <span>Là Đơn Vị Tính Cơ Sở (Gốc)</span>
            </label>

            {!isBaseUnit && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Quy đổi theo ĐVT gốc:</label>
                  <select
                    value={baseUnitId}
                    onChange={(e) => setBaseUnitId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    {unitsOfMeasure
                      .filter((u) => u.isBaseUnit && u.id !== initialData?.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Tỷ lệ quy đổi:</label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(parseFloat(e.target.value) || 1)}
                    placeholder="VD: 10"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold text-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả / Ghi chú</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="VD: 1 Thùng = 10 Cái linh kiện nguyên đai nguyên kiện..."
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
// 5. Warehouse Location Modal (Vị Trí Ô Kệ)
// ==========================================
interface WarehouseLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: WarehouseLocation | null;
  onSave: (data: Omit<WarehouseLocation, 'id' | 'createdAt'>) => void;
}

export const WarehouseLocationModal: React.FC<WarehouseLocationModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [zone, setZone] = useState('');
  const [barcode, setBarcode] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(100);
  const [storageType, setStorageType] = useState<'rack' | 'bin' | 'pallet' | 'secure' | 'bulk' | 'cold'>('rack');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setWarehouseName(initialData.warehouseName || 'Kho Chính Gia Phúc Computer');
      setZone(initialData.zone || 'Khu A - Linh Kiện');
      setBarcode(initialData.barcode || '');
      setMaxCapacity(initialData.maxCapacity || 100);
      setStorageType(initialData.storageType || 'rack');
      setNote(initialData.note || '');
      setStatus(initialData.status || 'active');
    } else {
      setCode('');
      setName('');
      setWarehouseName('Kho Chính Gia Phúc Computer');
      setZone('Khu A - Linh Kiện');
      setBarcode(`LOC-${Date.now().toString().slice(-6)}`);
      setMaxCapacity(100);
      setStorageType('rack');
      setNote('');
      setStatus('active');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      warehouseName: warehouseName.trim(),
      zone: zone.trim(),
      barcode: barcode.trim().toUpperCase(),
      maxCapacity,
      currentUsage: initialData?.currentUsage || 0,
      storageType,
      note: note.trim() || undefined,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {initialData ? 'Chỉnh Sửa Vị Trí Ô Kệ' : 'Thêm Vị Trí Ô Kệ Mới'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Vị Trí (Code) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="LOC-A1-01, LOC-B2..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã Barcode Quét Tem</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="LOC-A1-01-8899"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono text-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tên Vị Trí / Ngăn Kệ *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kệ A1 - Tầng 1 (Linh Kiện CPU & Mainboard)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kho Trực Thuộc</label>
              <input
                type="text"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                placeholder="Kho Chính Gia Phúc Computer"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phân Khu (Zone)</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Khu A - Linh Kiện Máy Tính"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Sức Chứa Tối Đa (Món)</label>
              <input
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Loại Lưu Trữ</label>
              <select
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="rack">Kệ hàng (Rack)</option>
                <option value="bin">Khay / Ngăn nhỏ (Bin)</option>
                <option value="pallet">Sàn Pallet cồng kềnh</option>
                <option value="secure">Tủ khóa an toàn (Secure)</option>
                <option value="bulk">Khu lưu trữ rời (Bulk)</option>
                <option value="cold">Kho lạnh bảo quản (Cold)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Ghi Chú Vị Trí</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú về chủng loại linh kiện phù hợp..."
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Cập Nhật Vị Trí' : 'Lưu Vị Trí'}</span>
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
      setDefaultDebtLimit(initialData.defaultDebtLimit || 0);
      setPaymentTermsDays(initialData.paymentTermsDays || 0);
      setPriorityLevel(initialData.priorityLevel || 'standard');
      setNote(initialData.note || '');
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
      paymentTermsDays,
      priorityLevel,
      note: note.trim() || undefined,
      customerCount: initialData?.customerCount || 0,
    });
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
      setMinSpent(initialData.minSpent || 0);
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
      discountPercent,
      color,
      benefits: benefits.trim(),
      status,
      customerCount: initialData?.customerCount || 0,
    });
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
  const [customerType, setCustomerType] = useState('Khách Hàng Cá Nhân');
  const [tier, setTier] = useState<CustomerTier>('Hạng Vàng');
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
      setCustomerType(initialData.customerType || initialData.groupName || 'Khách Hàng Cá Nhân');
      setTier(initialData.tier || 'Hạng Vàng');
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
      setCustomerType('Khách Hàng Cá Nhân');
      setTier('Hạng Vàng');
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
  }, [initialData, isOpen]);

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
                <label className="block text-xs font-bold text-slate-300 mb-1">Loại Khách Hàng</label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Khách Hàng Cá Nhân">Khách Hàng Cá Nhân</option>
                  <option value="Doanh Nghiệp B2B">Doanh Nghiệp B2B</option>
                  <option value="Đại Lý Cấp 1">Đại Lý Cấp 1</option>
                  <option value="Đại Lý Cấp 2">Đại Lý Cấp 2</option>
                  <option value="Khách Hàng Mua Sỉ">Khách Hàng Mua Sỉ</option>
                  {customerGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
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
                    <option value="Hạng Đồng">Hạng Đồng</option>
                    <option value="Hạng Bạc">Hạng Bạc</option>
                    <option value="Hạng Vàng">Hạng Vàng</option>
                    <option value="Hạng Kim Cương">Hạng Kim Cương</option>
                    <option value="VIP Doanh Nghiệp">VIP Doanh Nghiệp</option>
                    <option value="Đồng">Đồng</option>
                    <option value="Bạc">Bạc</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Kim Cương">Kim Cương</option>
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
  onSave: (data: Omit<Supplier, 'id' | 'createdAt'>) => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [tier, setTier] = useState<'Tier 1 Chính Hãng' | 'Tổng Đại Lý' | 'Nhà Phân Phối'>('Tier 1 Chính Hãng');
  const [category, setCategory] = useState('Linh kiện máy tính & Phụ kiện');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('Vietcombank');
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
      setTier(initialData.tier || 'Tier 1 Chính Hãng');
      setCategory(initialData.category || 'Linh kiện máy tính & Phụ kiện');
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setBankName(initialData.bankName || 'Vietcombank');
      setBankAccount(initialData.bankAccount || '');
      setCreditLimit(initialData.creditLimit || 50000000);
      setCreditDays(initialData.creditDays || 30);
      setCurrentDebt(initialData.currentDebt || 0);
      setNotes(initialData.notes || '');
    } else {
      setCode('');
      setName('');
      setTaxCode('');
      setTier('Tier 1 Chính Hãng');
      setCategory('Linh kiện máy tính & Phụ kiện');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setBankName('Vietcombank');
      setBankAccount('');
      setCreditLimit(50000000);
      setCreditDays(30);
      setCurrentDebt(0);
      setNotes('');
    }
  }, [initialData, isOpen]);

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
                <option value="Tier 1 Chính Hãng">Tier 1 Chính Hãng</option>
                <option value="Tổng Đại Lý">Tổng Đại Lý Cấp 1</option>
                <option value="Nhà Phân Phối">Nhà Phân Phối / Nhập Khẩu</option>
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

