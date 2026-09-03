import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Check,
  Building,
  Briefcase,
  MapPin,
  Warehouse,
  Scale,
  FolderTree,
  Users,
  Truck,
  Sparkles,
  UserCheck,
  Palette,
  Boxes,
  Phone,
  Mail,
} from 'lucide-react';
import { useMasterData } from '../../core/contexts/MasterDataContext';
import { Product, StoreSettings, Employee, Supplier } from '../../types';

export type MasterDataType =
  | 'departments'
  | 'positions'
  | 'warehouses'
  | 'locations'
  | 'uoms'
  | 'categories'
  | 'colors'
  | 'specifications'
  | 'customerGroups'
  | 'partner'
  | 'employee'
  | 'supplierCategories';

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
  const {
    warehouses,
    departments,
    jobPositions,
    addSupplier,
    addWarehouseLocation,
    addUnitOfMeasure,
    addColor,
    addDepartment,
    addJobPosition,
    addWarehouse,
    addProductCategory,
    addSpecification,
    addCustomerGroup,
    quickAddMasterItem,
  } = useMasterData();

  // Normalize legacy type aliases
  const normalizeInitialType = (t: any): MasterDataType => {
    if (t === 'uom') return 'uoms';
    if (t === 'warehouse') return 'warehouses';
    if (t === 'location') return 'locations';
    if (t === 'department') return 'departments';
    if (t === 'category') return 'categories';
    if (t === 'partner' || t === 'supplier' || t === 'suppliers') return 'partner';
    if (t === 'employee') return 'employee';
    if (t === 'color') return 'colors';
    if (t === 'specification') return 'specifications';
    if (t === 'position') return 'positions';
    return (t as MasterDataType) || 'uoms';
  };

  const [selectedType, setSelectedType] = useState<MasterDataType>(() =>
    normalizeInitialType(initialType)
  );

  useEffect(() => {
    if (isOpen && initialType) {
      setSelectedType(normalizeInitialType(initialType));
      resetForm();
    }
  }, [isOpen, initialType]);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [extraField1, setExtraField1] = useState('');
  const [extraField2, setExtraField2] = useState('');
  const [phoneField, setPhoneField] = useState('');
  const [emailField, setEmailField] = useState('');
  const [addressField, setAddressField] = useState('');
  const [taxCodeField, setTaxCodeField] = useState('');
  const [colorHex, setColorHex] = useState('#1e293b');
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
    setPhoneField('');
    setEmailField('');
    setAddressField('');
    setTaxCodeField('');
    setColorHex('#1e293b');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên danh mục / đối tượng.');
      return;
    }

    try {
      let createdItem: any = null;
      const genCode = code.trim() || `GEN-${Date.now().toString().slice(-4)}`;

      switch (selectedType) {
        // 1. ĐƠN VỊ TÍNH (UOM)
        case 'uoms': {
          const itemCode = genCode.toUpperCase();
          createdItem = addUnitOfMeasure({
            code: itemCode,
            name: name.trim(),
            symbol: extraField1.trim() || name.toLowerCase().trim(),
            conversionFactor: numericField1 > 0 ? numericField1 : 1,
            isBase: numericField1 === 1 || numericField1 === 0,
            sortOrder: 0,
            status: 'active',
          });
          break;
        }

        // 2. NHÀ CUNG CẤP / ĐỐI TÁC (SUPPLIER)
        case 'partner':
        case 'supplierCategories': {
          const supCode = genCode.startsWith('NCC-') ? genCode.toUpperCase() : `NCC-${genCode.toUpperCase()}`;
          const newSup: Supplier = {
            id: `sup-${Date.now()}`,
            code: supCode,
            name: name.trim(),
            contactPerson: extraField1.trim() || 'Đại diện NCC',
            phone: phoneField.trim() || '0985 862 609',
            email: emailField.trim() || 'ncc@vitinhgiaphuc.com',
            address: addressField.trim() || 'Hồ Chí Minh',
            taxCode: taxCodeField.trim() || undefined,
            debt: 0,
            creditLimit: numericField1 > 0 ? numericField1 : 50000000,
            currentDebt: 0,
            paymentTerms: extraField2.trim() || 'Gối đầu công nợ 30 ngày',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          createdItem = addSupplier(newSup);
          if (onSavePartner) {
            await onSavePartner(newSup);
          }
          break;
        }

        // 3. VỊ TRÍ Ô KỆ KHO (LOCATION)
        case 'locations': {
          const locCode = genCode.startsWith('LOC-') || genCode.startsWith('KE-') ? genCode.toUpperCase() : `LOC-${genCode.toUpperCase()}`;
          const targetWarehouse = warehouses.find((w) => w.id === selectField || w.name === extraField1) || warehouses[0];
          createdItem = addWarehouseLocation({
            code: locCode,
            name: name.trim(),
            warehouseId: targetWarehouse?.id || (warehouses[0]?.id ?? 'wh-main'),
            zone: extraField2.trim() || 'Khu A',
            maxCapacity: numericField1 > 0 ? numericField1 : 100,
            barcode: locCode,
            status: 'active',
          });
          break;
        }

        // 4. MÀU SẮC SẢN PHẨM (COLOR)
        case 'colors': {
          const colorCode = genCode.startsWith('CLR-') ? genCode.toUpperCase() : `CLR-${genCode.toUpperCase()}`;
          createdItem = addColor({
            code: colorCode,
            name: name.trim(),
            hexCode: colorHex || extraField1.trim() || '#1e293b',
            status: 'active',
          });
          break;
        }

        // 5. PHÒNG BAN TỔ CHỨC (DEPARTMENT)
        case 'departments': {
          const deptCode = genCode.startsWith('PB-') ? genCode.toUpperCase() : `PB-${genCode.toUpperCase()}`;
          createdItem = addDepartment({
            code: deptCode,
            name: name.trim(),
            managerName: extraField1.trim() || 'Chưa chỉ định',
            phone: phoneField.trim() || '0985 862 609',
            email: emailField.trim() || `${genCode.toLowerCase()}@vitinhgiaphuc.com`,
            location: addressField.trim() || 'Tầng 1 Showroom',
            description: description.trim() || undefined,
            status: 'active',
          });
          break;
        }

        // 6. NHÂN SỰ / NHÂN VIÊN (EMPLOYEE)
        case 'employee': {
          const empCode = genCode.startsWith('NV-') ? genCode.toUpperCase() : `NV-${genCode.toUpperCase()}`;
          const targetDept = departments.find((d) => d.id === selectField) || departments[0];
          const newEmp: Employee = {
            id: `emp-${Date.now()}`,
            code: empCode,
            name: name.trim(),
            role: (extraField1.trim() as any) || 'Nhân Viên Bán Hàng',
            department: targetDept?.name || 'Phòng Kinh Doanh',
            phone: phoneField.trim() || '0985 862 609',
            email: emailField.trim() || `${genCode.toLowerCase()}@vitinhgiaphuc.com`,
            baseSalary: numericField1 > 0 ? numericField1 : 10000000,
            salesKpiTarget: 50000000,
            currentSales: 0,
            commissionRate: 2,
            status: 'active',
            joinedDate: new Date().toISOString().split('T')[0],
            shiftSchedule: extraField2.trim() || 'Ca Sáng (08:00 - 17:00)',
          };
          if (onSaveEmployee) {
            await onSaveEmployee(newEmp);
          }
          createdItem = newEmp;
          break;
        }

        // 7. NHÓM NGÀNH HÀNG & VAT (CATEGORY)
        case 'categories': {
          const catCode = genCode.startsWith('DM-') ? genCode.toUpperCase() : `DM-${genCode.toUpperCase()}`;
          createdItem = addProductCategory({
            code: catCode,
            name: name.trim(),
            vatRate: numericField1 >= 0 ? numericField1 : 10,
            status: 'active',
          });
          break;
        }

        // 8. KHO HÀNG MASTER (WAREHOUSE)
        case 'warehouses': {
          const whCode = genCode.startsWith('KHO-') ? genCode.toUpperCase() : `KHO-${genCode.toUpperCase()}`;
          createdItem = addWarehouse({
            code: whCode,
            name: name.trim(),
            address: addressField.trim() || 'TP. Hồ Chí Minh',
            managerName: extraField1.trim() || 'Thủ kho chính',
            phone: phoneField.trim() || '0985 862 609',
            type: 'standard',
            status: 'active',
          });
          break;
        }

        // 9. CHỨC VỤ (JOB POSITION)
        case 'positions': {
          const posCode = genCode.startsWith('CV-') ? genCode.toUpperCase() : `CV-${genCode.toUpperCase()}`;
          const targetDept = departments.find((d) => d.id === selectField) || departments[0];
          createdItem = addJobPosition({
            code: posCode,
            title: name.trim(),
            departmentId: targetDept?.id || 'dept-kd',
            baseSalary: numericField1 > 0 ? numericField1 : 10000000,
            responsibilityAllowance: numericField2 > 0 ? numericField2 : 1000000,
            status: 'active',
          });
          break;
        }

        // 10. QUY CÁCH ĐÓNG GÓI (SPECIFICATION)
        case 'specifications': {
          const specCode = genCode.startsWith('SPEC-') ? genCode.toUpperCase() : `SPEC-${genCode.toUpperCase()}`;
          createdItem = addSpecification({
            code: specCode,
            name: name.trim(),
            groupName: extraField1.trim() || 'Đóng gói & Hộp',
            status: 'active',
          });
          break;
        }

        // 11. NHÓM KHÁCH HÀNG (CUSTOMER GROUP)
        case 'customerGroups': {
          createdItem = addCustomerGroup({
            code: genCode.toUpperCase(),
            name: name.trim(),
            discountPercent: numericField1 >= 0 ? numericField1 : 5,
            creditLimit: numericField2 >= 0 ? numericField2 : 20000000,
            status: 'active',
          });
          break;
        }

        default:
          createdItem = quickAddMasterItem(selectedType, {
            code: genCode.toUpperCase(),
            name: name.trim(),
            status: 'active',
          });
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
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu danh mục vào hệ thống');
    }
  };

  const TYPE_OPTIONS: { type: MasterDataType; label: string; icon: any; color: string }[] = [
    { type: 'uoms', label: 'Đơn Vị Tính (ĐVT)', icon: Scale, color: 'text-emerald-400' },
    { type: 'partner', label: 'NCC / Đối Tác', icon: Truck, color: 'text-indigo-400' },
    { type: 'locations', label: 'Vị Trí Ô Kệ Kho', icon: MapPin, color: 'text-amber-400' },
    { type: 'colors', label: 'Màu Sắc Sản Phẩm', icon: Palette, color: 'text-rose-400' },
    { type: 'departments', label: 'Phòng Ban', icon: Building, color: 'text-blue-400' },
    { type: 'employee', label: 'Nhân Sự', icon: UserCheck, color: 'text-purple-400' },
    { type: 'categories', label: 'Nhóm Hàng & VAT', icon: FolderTree, color: 'text-cyan-400' },
    { type: 'warehouses', label: 'Kho Hàng Master', icon: Warehouse, color: 'text-teal-400' },
    { type: 'positions', label: 'Chức Vụ', icon: Briefcase, color: 'text-amber-300' },
    { type: 'specifications', label: 'Quy Cách & Đóng Gói', icon: Boxes, color: 'text-slate-300' },
    { type: 'customerGroups', label: 'Nhóm Khách Hàng', icon: Users, color: 'text-sky-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Thêm Nhanh Dữ Liệu Cơ Bản</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                  SQL Server Sync
                </span>
              </h3>
              <p className="text-xs text-slate-400">Dữ liệu được lưu trực tiếp vào Database & đồng bộ tức thì trên toàn hệ thống</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800 bg-slate-900/60 flex flex-wrap gap-1.5 overflow-x-auto">
          {TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.type;

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleTypeChange(opt.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : opt.color}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 font-medium">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 font-medium flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Đã lưu thành công vào Cơ sở dữ liệu và đồng bộ danh mục gốc!</span>
            </div>
          )}

          {/* Core Name & Code Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {selectedType === 'uoms' || selectedType === 'uom'
                  ? 'Tên Đơn Vị Tính (ĐVT)'
                  : selectedType === 'partner' || selectedType === 'supplierCategories'
                  ? 'Tên Nhà Cung Cấp / Đối Tác'
                  : selectedType === 'locations' || selectedType === 'location'
                  ? 'Tên Vị Trí Ô Kệ Kho'
                  : selectedType === 'colors' || selectedType === 'color'
                  ? 'Tên Màu Sắc'
                  : selectedType === 'departments' || selectedType === 'department'
                  ? 'Tên Phòng Ban'
                  : selectedType === 'employee'
                  ? 'Họ và Tên Nhân Viên'
                  : selectedType === 'categories' || selectedType === 'category'
                  ? 'Tên Nhóm Ngành Hàng'
                  : selectedType === 'warehouses' || selectedType === 'warehouse'
                  ? 'Tên Kho Hàng Master'
                  : selectedType === 'positions'
                  ? 'Tên Chức Vụ / Vị Trí'
                  : 'Tên Danh Mục Gốc'}{' '}
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  selectedType === 'uoms' || selectedType === 'uom'
                    ? 'VD: Thùng, Hộp, Cuộn, Cái, Mét, Kg, Gói, Bộ'
                    : selectedType === 'partner' || selectedType === 'supplierCategories'
                    ? 'VD: Công Ty CP Thế Giới Số (Digiworld Corp), FPT Synnex'
                    : selectedType === 'locations' || selectedType === 'location'
                    ? 'VD: Kệ A1 - Tầng 1 (Khu CPU/RAM), Kệ B2 - Tầng 3'
                    : selectedType === 'colors' || selectedType === 'color'
                    ? 'VD: Đen Nhám (Matte Black), Trắng Ngọc Trai, Bạc Titan'
                    : selectedType === 'departments' || selectedType === 'department'
                    ? 'VD: Phòng Kho Vận & Hậu Cần, Phòng Kỹ Thuật & Bảo Hành'
                    : selectedType === 'employee'
                    ? 'VD: Nguyễn Văn Minh, Trần Thị Kim Oanh'
                    : selectedType === 'categories' || selectedType === 'category'
                    ? 'VD: Bộ Vi Xử Lý (CPU), Card Màn Hình (VGA), Bộ Nhớ RAM'
                    : selectedType === 'warehouses' || selectedType === 'warehouse'
                    ? 'VD: Kho Chính Gia Phúc Computer, Kho Showroom Q1'
                    : selectedType === 'positions'
                    ? 'VD: Trưởng Phòng Kho Vận, Kỹ Thuật Viên Phần Cứng'
                    : 'Nhập tên danh mục...'
                }
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Mã Định Danh (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={
                  selectedType === 'uoms' || selectedType === 'uom'
                    ? 'VD: THUNG, HOP, CUON, BO, CAI'
                    : selectedType === 'partner' || selectedType === 'supplierCategories'
                    ? 'VD: NCC-DGW, NCC-FPT, NCC-PV'
                    : selectedType === 'locations' || selectedType === 'location'
                    ? 'VD: LOC-A1-T1, KE-B2-03'
                    : selectedType === 'colors' || selectedType === 'color'
                    ? 'VD: CLR-BLACK, CLR-WHITE, CLR-SILVER'
                    : selectedType === 'departments' || selectedType === 'department'
                    ? 'VD: PB-KHO, PB-KT, PB-KD'
                    : selectedType === 'employee'
                    ? 'VD: NV-MINH, NV-008'
                    : selectedType === 'categories' || selectedType === 'category'
                    ? 'VD: DM-CPU, DM-VGA, DM-RAM'
                    : selectedType === 'warehouses' || selectedType === 'warehouse'
                    ? 'VD: KHO-CHINH, KHO-Q1'
                    : 'VD: GEN-01'
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 1. UOM (ĐƠN VỊ TÍNH) */}
          {(selectedType === 'uoms' || selectedType === 'uom') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Ký hiệu viết tắt</label>
                <input
                  type="text"
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="VD: thùng, hộp, cuộn, cái, m, kg"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Hệ số quy đổi chuẩn (mặc định = 1)</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={numericField1 || 1}
                  onChange={(e) => setNumericField1(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 2. NHÀ CUNG CẤP / ĐỐI TÁC */}
          {(selectedType === 'partner' || selectedType === 'supplierCategories') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Người liên hệ / Đại diện</label>
                  <input
                    type="text"
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    placeholder="VD: Anh Nguyễn Văn A (Phụ trách bán hàng)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Số điện thoại liên hệ</span>
                  </label>
                  <input
                    type="text"
                    value={phoneField}
                    onChange={(e) => setPhoneField(e.target.value)}
                    placeholder="0985 862 609"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Email liên hệ</span>
                  </label>
                  <input
                    type="email"
                    value={emailField}
                    onChange={(e) => setEmailField(e.target.value)}
                    placeholder="kinhdoanh@digiworld.com.vn"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mã số thuế (MST)</label>
                  <input
                    type="text"
                    value={taxCodeField}
                    onChange={(e) => setTaxCodeField(e.target.value)}
                    placeholder="0302861742"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Địa chỉ trụ sở / Kho</label>
                  <input
                    type="text"
                    value={addressField}
                    onChange={(e) => setAddressField(e.target.value)}
                    placeholder="Số 195 Cô Bắc, P. Cô Giang, Q. 1, TP. HCM"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Điều khoản thanh toán & Công nợ</label>
                  <input
                    type="text"
                    value={extraField2}
                    onChange={(e) => setExtraField2(e.target.value)}
                    placeholder="Gối đầu công nợ 30 ngày / Thanh toán ngay"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. VỊ TRÍ Ô KỆ KHO */}
          {(selectedType === 'locations' || selectedType === 'location') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Kho hàng trực thuộc</label>
                <select
                  value={selectField}
                  onChange={(e) => setSelectField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Phân khu / Dãy / Zone</label>
                <input
                  type="text"
                  value={extraField2}
                  onChange={(e) => setExtraField2(e.target.value)}
                  placeholder="VD: Khu A - Linh Kiện"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Sức chứa tối đa (món)</label>
                <input
                  type="number"
                  min="1"
                  value={numericField1 || ''}
                  onChange={(e) => setNumericField1(parseInt(e.target.value) || 100)}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 4. MÀU SẮC SẢN PHẨM */}
          {(selectedType === 'colors' || selectedType === 'color') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Mã Hex Code Màu</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#1e293b"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border border-slate-600 shadow-inner"
                  style={{ backgroundColor: colorHex }}
                />
                <div>
                  <div className="font-bold text-white text-xs">{name || 'Xem trước màu sắc'}</div>
                  <div className="text-[11px] font-mono text-slate-400">{colorHex}</div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PHÒNG BAN TỔ CHỨC */}
          {(selectedType === 'departments' || selectedType === 'department') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Trưởng bộ phận / Phụ trách</label>
                <input
                  type="text"
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="VD: Nguyễn Văn Minh"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Số ĐT nội bộ</label>
                <input
                  type="text"
                  value={phoneField}
                  onChange={(e) => setPhoneField(e.target.value)}
                  placeholder="0985 862 609"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email phòng ban</label>
                <input
                  type="email"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder="kho@vitinhgiaphuc.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          {/* 6. NHÂN SỰ / NHÂN VIÊN */}
          {selectedType === 'employee' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phòng ban trực thuộc</label>
                  <select
                    value={selectField}
                    onChange={(e) => setSelectField(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chức danh / Vị trí</label>
                  <input
                    type="text"
                    value={extraField1}
                    onChange={(e) => setExtraField1(e.target.value)}
                    placeholder="VD: Quản Lý Kho, Nhân Viên Kỹ Thuật, Thu Ngân"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phoneField}
                    onChange={(e) => setPhoneField(e.target.value)}
                    placeholder="0985 862 609"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email nhân viên</label>
                  <input
                    type="email"
                    value={emailField}
                    onChange={(e) => setEmailField(e.target.value)}
                    placeholder="minh.nguyen@vitinhgiaphuc.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Lương cơ sở (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    value={numericField1 || ''}
                    onChange={(e) => setNumericField1(parseFloat(e.target.value) || 0)}
                    placeholder="12000000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Ca làm việc & Lịch trực</label>
                <input
                  type="text"
                  value={extraField2}
                  onChange={(e) => setExtraField2(e.target.value)}
                  placeholder="VD: Ca Sáng (08:00 - 17:00), Xoay Ca Kho"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          {/* 7. NHÓM NGÀNH HÀNG & VAT */}
          {(selectedType === 'categories' || selectedType === 'category') && (
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Thuế suất VAT mặc định (%)</label>
              <div className="flex items-center space-x-2">
                {[10, 8, 5, 0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setNumericField1(rate)}
                    className={`px-4 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                      numericField1 === rate
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. KHO HÀNG MASTER */}
          {(selectedType === 'warehouses' || selectedType === 'warehouse') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Địa chỉ kho hàng</label>
                <input
                  type="text"
                  value={addressField}
                  onChange={(e) => setAddressField(e.target.value)}
                  placeholder="VD: 123 Đường 3/2, Q. 10, TP. HCM"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Thủ kho phụ trách</label>
                <input
                  type="text"
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="VD: Phạm Ngọc Thơm"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          {/* 9. CHỨC VỤ */}
          {selectedType === 'positions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Phòng ban</label>
                <select
                  value={selectField}
                  onChange={(e) => setSelectField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Lương cơ sở (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={numericField1 || ''}
                  onChange={(e) => setNumericField1(parseFloat(e.target.value) || 0)}
                  placeholder="10000000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Phụ cấp trách nhiệm (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={numericField2 || ''}
                  onChange={(e) => setNumericField2(parseFloat(e.target.value) || 0)}
                  placeholder="1000000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* 10. QUY CÁCH */}
          {selectedType === 'specifications' && (
            <div>
              <label className="block font-bold text-slate-300 mb-1">Nhóm áp dụng</label>
              <input
                type="text"
                value={extraField1}
                onChange={(e) => setExtraField1(e.target.value)}
                placeholder="VD: Đóng gói & Hộp, Tiêu chuẩn kỹ thuật"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
          )}

          {/* 11. NHÓM KHÁCH HÀNG */}
          {selectedType === 'customerGroups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Chiết khấu mặc định (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={numericField1 || ''}
                  onChange={(e) => setNumericField1(parseFloat(e.target.value) || 0)}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Hạn mức nợ tối đa (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="5000000"
                  value={numericField2 || ''}
                  onChange={(e) => setNumericField2(parseFloat(e.target.value) || 0)}
                  placeholder="50000000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-300 mb-1">Mô tả / Ghi chú chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Nhập thông tin chi tiết hoặc ghi chú lưu ý..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 italic">
              💾 Tự động đồng bộ và lưu vào Database SQL Server
            </span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu Dữ Liệu Gốc</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
