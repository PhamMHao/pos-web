import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  Building,
  Briefcase,
  MapPin,
  Scale,
  FolderTree,
  Users,
  Truck,
  Sparkles,
  Package,
  UserCheck,
  Palette,
} from 'lucide-react';
import { useMasterData } from '../../core/contexts/MasterDataContext';
import { Product, StoreSettings, Employee } from '../../types';

export type MasterDataType =
  | 'departments'
  | 'positions'
  | 'locations'
  | 'uoms'
  | 'categories'
  | 'customerGroups'
  | 'customerTiers'
  | 'projects'
  | 'supplierCategories'
  | 'product'
  | 'uom'
  | 'partner'
  | 'color'
  | 'location'
  | 'employee'
  | 'department'
  | 'category';

export interface QuickAddMasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: MasterDataType | string;
  settings?: StoreSettings;
  onSaveProduct?: (product: Product) => void | Promise<void>;
  onSavePartner?: (partner: any) => void | Promise<void>;
  onSaveEmployee?: (employee: Employee) => void | Promise<void>;
  onSuccess?: (createdItem: any, type: MasterDataType | any) => void;
}

export const QuickAddMasterDataModal: React.FC<QuickAddMasterDataModalProps> = ({
  isOpen,
  onClose,
  initialType = 'uoms',
  settings,
  onSaveProduct,
  onSavePartner,
  onSaveEmployee,
  onSuccess,
}) => {
  const { quickAddMasterItem, departments } = useMasterData();

  // Normalize legacy type aliases
  const normalizeInitialType = (t: any): MasterDataType => {
    if (t === 'uom') return 'uoms';
    if (t === 'location') return 'locations';
    if (t === 'department') return 'departments';
    if (t === 'category') return 'categories';
    if (t === 'partner') return 'supplierCategories';
    if (t === 'employee') return 'positions';
    return (t as MasterDataType) || 'uoms';
  };

  const [selectedType, setSelectedType] = useState<MasterDataType>(() =>
    normalizeInitialType(initialType)
  );

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [extraField1, setExtraField1] = useState('');
  const [extraField2, setExtraField2] = useState('');
  const [numericField1, setNumericField1] = useState<number>(0);
  const [numericField2, setNumericField2] = useState<number>(0);
  const [selectField, setSelectField] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setCode('');
    setExtraField1('');
    setExtraField2('');
    setNumericField1(0);
    setNumericField2(0);
    setSelectField('');
    setDescription('');
    setError(null);
  };

  const handleTypeChange = (type: MasterDataType) => {
    setSelectedType(type);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      let createdItem: any = null;
      const genCode = code.trim() || `GEN-${Date.now().toString().slice(-4)}`;

      switch (selectedType) {
        case 'uoms':
        case 'uom':
          createdItem = quickAddMasterItem('uoms', {
            code: genCode.toUpperCase(),
            name: name.trim(),
            symbol: extraField1.trim() || name.toLowerCase().trim(),
            isBaseUnit: true,
            conversionRate: 1,
            description: description.trim() || undefined,
            status: 'active',
          });
          break;

        case 'categories':
          createdItem = quickAddMasterItem('categories', {
            code: genCode.toUpperCase(),
            name: name.trim(),
            defaultVatRate: numericField1 >= 0 ? numericField1 : 10,
            description: description.trim() || undefined,
            productCount: 0,
            status: 'active',
          });
          break;

        case 'locations':
        case 'location':
          createdItem = quickAddMasterItem('locations', {
            code: genCode.toUpperCase(),
            name: name.trim(),
            warehouseName: extraField1.trim() || 'Kho Chính Gia Phúc Computer',
            zone: extraField2.trim() || 'Khu A',
            barcode: `LOC-${genCode.toUpperCase()}`,
            maxCapacity: numericField1 > 0 ? numericField1 : 100,
            storageType: 'rack',
            note: description.trim() || undefined,
            status: 'active',
          });
          break;

        case 'departments':
          createdItem = quickAddMasterItem('departments', {
            code: genCode.toUpperCase(),
            name: name.trim(),
            headOfDepartment: extraField1.trim() || 'Chưa chỉ định',
            phone: extraField2.trim() || '0985 862 609',
            email: `${genCode.toLowerCase()}@vitinhgiaphuc.com`,
            location: 'Tầng 1 Showroom',
            description: description.trim() || undefined,
            employeeCount: 0,
            status: 'active',
          });
          break;

        case 'positions':
          createdItem = quickAddMasterItem('positions', {
            code: genCode.toUpperCase(),
            title: name.trim(),
            departmentId: selectField || (departments[0]?.id ?? 'dept-kd'),
            departmentName:
              departments.find((d) => d.id === selectField)?.name || departments[0]?.name || 'Phòng Kinh Doanh',
            baseSalary: numericField1 > 0 ? numericField1 : 10000000,
            responsibilityAllowance: numericField2 > 0 ? numericField2 : 1000000,
            salaryCoefficient: 1.0,
            linkedRole: extraField1 || 'sales',
            description: description.trim() || undefined,
            status: 'active',
          });
          break;

        case 'customerGroups':
          createdItem = quickAddMasterItem('customerGroups', {
            code: genCode.toUpperCase(),
            name: name.trim(),
            discountPercent: numericField1 >= 0 ? numericField1 : 5,
            defaultDebtLimit: numericField2 >= 0 ? numericField2 : 20000000,
            paymentTermsDays: 30,
            priorityLevel: 'standard',
            note: description.trim() || undefined,
            customerCount: 0,
          });
          break;

        case 'supplierCategories':
        case 'partner':
          createdItem = quickAddMasterItem('supplierCategories', {
            code: genCode.toUpperCase(),
            name: name.trim(),
            description: description.trim() || undefined,
            defaultPaymentTerms: extraField1.trim() || 'Gối đầu công nợ 30 ngày',
            supplierCount: 0,
          });
          if (onSavePartner) {
            onSavePartner({
              id: `sup-${Date.now()}`,
              code: genCode.toUpperCase(),
              name: name.trim(),
              contactPerson: extraField2 || 'Đại diện NCC',
              phone: '0985 862 609',
              email: 'ncc@vitinhgiaphuc.com',
              status: 'active',
            });
          }
          break;

        case 'product':
          if (onSaveProduct) {
            const newProd: Product = {
              id: `p-${Date.now()}`,
              sku: genCode.toUpperCase(),
              barcode: genCode.toUpperCase(),
              name: name.trim(),
              category: selectField || 'Điện tử & Cáp điện',
              unit: extraField1 || 'Cái',
              costPrice: numericField1 || 0,
              sellingPrice: numericField2 || 0,
              stock: 0,
              minStock: 5,
              image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            onSaveProduct(newProd);
            createdItem = newProd;
          }
          break;

        case 'employee':
          if (onSaveEmployee) {
            const newEmp: Employee = {
              id: `emp-${Date.now()}`,
              code: genCode.toUpperCase(),
              name: name.trim(),
              role: (selectField as any) || 'Nhân Viên Bán Hàng',
              phone: extraField1 || '0985 862 609',
              email: `${genCode.toLowerCase()}@vitinhgiaphuc.com`,
              baseSalary: numericField1 || 10000000,
              salesKpiTarget: 50000000,
              currentSales: 0,
              commissionRate: 2,
              status: 'active',
              joinedDate: new Date().toISOString().split('T')[0],
              shiftSchedule: 'Ca Sáng (08:00 - 17:00)',
            };
            onSaveEmployee(newEmp);
            createdItem = newEmp;
          }
          break;

        case 'color':
          createdItem = { id: `clr-${Date.now()}`, name: name.trim() };
          break;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess && createdItem) {
          onSuccess(createdItem, selectedType);
        }
        resetForm();
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu danh mục');
    }
  };

  const TYPE_OPTIONS: { type: MasterDataType; label: string; icon: any }[] = [
    { type: 'uoms', label: 'Đơn Vị Tính (ĐVT)', icon: Scale },
    { type: 'categories', label: 'Nhóm Hàng & VAT', icon: FolderTree },
    { type: 'locations', label: 'Vị Trí Ô Kệ Kho', icon: MapPin },
    { type: 'departments', label: 'Phòng Ban', icon: Building },
    { type: 'positions', label: 'Chức Vụ', icon: Briefcase },
    { type: 'customerGroups', label: 'Nhóm Khách Hàng', icon: Users },
    { type: 'supplierCategories', label: 'Nhóm Nhà Cung Ứng', icon: Truck },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thêm Nhanh Dữ Liệu Cơ Bản (Master Data)</h3>
              <p className="text-xs text-slate-400">Tự động đồng bộ và lưu trữ vào danh mục gốc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800 bg-slate-900/50 flex flex-wrap gap-1.5 overflow-x-auto">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.type || (selectedType === 'uom' && opt.type === 'uoms');
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleTypeChange(opt.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Đã thêm thành công vào Dữ liệu cơ bản!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tên danh mục / Quy cách <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  selectedType === 'uoms' || selectedType === 'uom'
                    ? 'VD: Thùng (12 Hộp)'
                    : selectedType === 'categories'
                    ? 'VD: Phụ Kiện Laptop'
                    : selectedType === 'locations' || selectedType === 'location'
                    ? 'VD: Kệ A2 - Tầng 3'
                    : selectedType === 'departments'
                    ? 'VD: Phòng Kỹ Thuật Dự Án'
                    : selectedType === 'positions' || selectedType === 'employee'
                    ? 'VD: Kỹ Thuật Viên Triển Khai'
                    : selectedType === 'customerGroups'
                    ? 'VD: Khách Hàng Đại Lý VIP'
                    : 'VD: Nhà Phân Phối Linh Kiện'
                }
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Mã định danh (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: THUNG, CAT-PK, LOC-A2, PB-KTDA..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Conditional Fields based on Type */}
          {(selectedType === 'uoms' || selectedType === 'uom') && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ký hiệu viết tắt</label>
              <input
                type="text"
                value={extraField1}
                onChange={(e) => setExtraField1(e.target.value)}
                placeholder="VD: cái, thùng, hộp, cuộn, m"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          )}

          {selectedType === 'categories' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Thuế suất VAT mặc định (%)</label>
              <div className="flex items-center space-x-2">
                {[10, 8, 5, 0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNumericField1(rate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      numericField1 === rate
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {(selectedType === 'locations' || selectedType === 'location') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Kho</label>
                <input
                  type="text"
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="Kho Chính Gia Phúc Computer"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sức chứa tối đa (món)</label>
                <input
                  type="number"
                  min="1"
                  value={numericField1 || ''}
                  onChange={(e) => setNumericField1(parseInt(e.target.value) || 100)}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Trưởng bộ phận</label>
                <input
                  type="text"
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="Họ và tên trưởng phòng"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số ĐT nội bộ</label>
                <input
                  type="text"
                  value={extraField2}
                  onChange={(e) => setExtraField2(e.target.value)}
                  placeholder="0985 862 609"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {(selectedType === 'positions' || selectedType === 'employee') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Phòng ban trực thuộc</label>
                <select
                  value={selectField}
                  onChange={(e) => setSelectField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mức lương cơ sở (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={numericField1 || ''}
                  onChange={(e) => setNumericField1(parseFloat(e.target.value) || 0)}
                  placeholder="10000000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'customerGroups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Chiết khấu mặc định (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={numericField1 || ''}
                  onChange={(e) => setNumericField1(parseFloat(e.target.value) || 0)}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hạn mức nợ tối đa (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="5000000"
                  value={numericField2 || ''}
                  onChange={(e) => setNumericField2(parseFloat(e.target.value) || 0)}
                  placeholder="50000000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {(selectedType === 'supplierCategories' || selectedType === 'partner') && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Điều khoản thanh toán mặc định</label>
              <input
                type="text"
                value={extraField1}
                onChange={(e) => setExtraField1(e.target.value)}
                placeholder="VD: Gối đầu công nợ 30 ngày, Thanh toán ngay"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả / Ghi chú</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Nhập thông tin chi tiết hoặc ghi chú lưu ý..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lưu Dữ Liệu Gốc</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
