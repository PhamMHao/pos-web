import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Package,
  Ruler,
  Users,
  Palette,
  MapPin,
  Building,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Save,
  Tag,
  DollarSign,
  Boxes,
  Layers,
  Phone,
  Mail,
  Shield,
  Briefcase,
  Upload,
  Globe,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  Product,
  Customer,
  Supplier,
  Employee,
  StoreSettings,
  UOMOption,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { compressImageFile } from '../../utils/imageCompressor';
import { WebImagePickerModal } from './WebImagePickerModal';

export type MasterDataType =
  | 'product'
  | 'uom'
  | 'partner'
  | 'color'
  | 'location'
  | 'department'
  | 'employee';

export interface QuickAddMasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: MasterDataType;
  settings?: StoreSettings;
  onSaveProduct?: (product: Product) => void | Promise<void>;
  onSavePartner?: (partner: { type: 'customer' | 'supplier'; data: any }) => void | Promise<void>;
  onSaveEmployee?: (employee: Employee) => void | Promise<void>;
  onSuccess?: (createdItem: any, type: MasterDataType) => void;
  existingProducts?: Product[];
}

export const PRESET_UOMS = [
  'Cái',
  'Bộ',
  'Cây',
  'Thùng',
  'Lốc',
  'Cuộn',
  'Hộp',
  'Gói',
  'Mét',
  'Kilogram',
  'Gam',
  'Bao',
  'Vỉ',
  'Thanh',
];

export const PRESET_COLORS = [
  { name: 'Space Gray (Xám Không Gian)', hex: '#4B5563' },
  { name: 'Titan Tự Nhiên (Natural Titanium)', hex: '#9CA3AF' },
  { name: 'Đen Nhám (Matte Black)', hex: '#1F2937' },
  { name: 'Trắng Ngọc Trai (Pearl White)', hex: '#F9FAFB' },
  { name: 'Xanh Midnight (Midnight Blue)', hex: '#1E3A8A' },
  { name: 'Bạc Ánh Kim (Silver Metallic)', hex: '#E5E7EB' },
  { name: 'Vàng Đồng (Gold Sand)', hex: '#D97706' },
  { name: 'Đỏ Cherry (Cherry Red)', hex: '#DC2626' },
  { name: 'Xanh Rêu (Forest Green)', hex: '#15803D' },
];

export const PRESET_LOCATIONS = [
  'Kệ A1 - Tầng 1 (Linh Kiện Nhỏ)',
  'Kệ A2 - Tầng 2 (Ổ Cứng & Ram)',
  'Kệ B1 - Tầng 1 (Camera & Đầu Ghi)',
  'Kệ B2 - Tầng 2 (Nguồn & Switch PoE)',
  'Kệ C1 - Tầng 1 (Màn Hình & Vỏ Case)',
  'Tủ Kỹ Thuật 01 (Thiết Bị Đang Sửa)',
  'Kho Tạm Nhập (Chờ Phân Loại)',
  'Kho Thanh Lý & Đổi Trả',
];

export const PRESET_DEPARTMENTS = [
  'Phòng Kỹ Thuật & Sửa Chữa',
  'Bộ Phận Bán Hàng & Thu Ngân (POS)',
  'Kho Tổng & Điều Vận',
  'Phòng Kế Toán & Tài Chính',
  'Ban Giám Đốc & Điều Hành',
  'Bộ Phận Chăm Sóc Khách Hàng (CSKH)',
];

export const QuickAddMasterDataModal: React.FC<QuickAddMasterDataModalProps> = ({
  isOpen,
  onClose,
  initialType = 'product',
  settings,
  onSaveProduct,
  onSavePartner,
  onSaveEmployee,
  onSuccess,
  existingProducts = [],
}) => {
  const [activeTab, setActiveTab] = useState<MasterDataType>(initialType);

  // Sync initial type when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
    }
  }, [isOpen, initialType]);

  // 1. PRODUCT STATE
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Thiết bị điện tử',
    unit: 'Cái',
    costPrice: 0,
    sellingPrice: 0,
    stock: 10,
    minStock: 2,
    warehouse: settings?.defaultWarehouse || 'Kho Chính Gia Phúc Computer',
    storageLocation: 'Kệ A1 - Tầng 1',
    description: '',
  });

  // Auto generate SKU & Barcode for product
  const generateNewSkuBarcode = () => {
    const sku = 'SP-' + Math.floor(1000 + Math.random() * 9000);
    const barcode = '893' + Math.floor(100000000 + Math.random() * 900000000);
    setProductForm((prev) => ({ ...prev, sku, barcode }));
  };

  useEffect(() => {
    if (isOpen && activeTab === 'product' && !productForm.sku) {
      generateNewSkuBarcode();
    }
  }, [isOpen, activeTab]);

  // 1. PRODUCT IMAGE & PICKER STATE
  const [showWebImagePicker, setShowWebImagePicker] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setProductForm((prev) => ({ ...prev, image: compressed }));
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const handlePasteImage = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const compressed = await compressImageFile(file);
            setProductForm((prev) => ({ ...prev, image: compressed }));
          } catch (err) {
            console.error('Error pasting image:', err);
          }
          break;
        }
      }
    }
  };

  // 2. UOM STATE
  const [uomName, setUomName] = useState('Thùng');
  const [uomRatio, setUomRatio] = useState<number>(10);
  const [uomBaseUnit, setUomBaseUnit] = useState('Cái');
  const [uomTargetProductId, setUomTargetProductId] = useState<string>('');

  // 3. PARTNER STATE (Supplier / Customer)
  const [partnerType, setPartnerType] = useState<'supplier' | 'customer' | 'both'>('supplier');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerTaxCode, setPartnerTaxCode] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerAddress, setPartnerAddress] = useState('');
  const [partnerContactPerson, setPartnerContactPerson] = useState('');

  // 4. COLOR STATE
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#4B5563');
  const [colorNotes, setColorNotes] = useState('');

  // 5. LOCATION STATE
  const [locationName, setLocationName] = useState('');
  const [locationWarehouse, setLocationWarehouse] = useState(settings?.defaultWarehouse || 'Kho Chính Gia Phúc');
  const [locationCapacity, setLocationCapacity] = useState('100 sản phẩm');

  // 6. DEPARTMENT STATE
  const [deptName, setDeptName] = useState('');
  const [deptManager, setDeptManager] = useState('');
  const [deptNotes, setDeptNotes] = useState('');

  // 7. EMPLOYEE STATE
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState<'cashier' | 'warehouse' | 'technician' | 'accountant' | 'manager'>('warehouse');
  const [empDept, setEmpDept] = useState('Kho Tổng & Điều Vận');
  const [empSalary, setEmpSalary] = useState<number>(8500000);

  if (!isOpen) return null;

  // HANDLE FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'product') {
      if (!productForm.name || !productForm.sku) {
        alert('Vui lòng nhập đầy đủ Tên sản phẩm và Mã SKU');
        return;
      }
      const nowIso = new Date().toISOString();
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        name: productForm.name,
        sku: productForm.sku,
        barcode: productForm.barcode || productForm.sku,
        category: (productForm.category as any) || 'Điện tử & Cáp điện',
        unit: productForm.unit || 'Cái',
        costPrice: Number(productForm.costPrice) || 0,
        sellingPrice: Number(productForm.sellingPrice) || 0,
        stock: Number(productForm.stock) || 0,
        minStock: Number(productForm.minStock) || 2,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        warehouse: productForm.warehouse || 'Kho Chính Gia Phúc Computer',
        storageLocation: productForm.storageLocation || 'Kệ A1 - Tầng 1',
        description: productForm.description || '',
        lifecycleStage: 'in_storage',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (onSaveProduct) await onSaveProduct(newProduct);
      if (onSuccess) onSuccess(newProduct, 'product');
      onClose();
    } else if (activeTab === 'uom') {
      const uomData: UOMOption = {
        unit: uomName,
        ratioToBase: Number(uomRatio) || 1,
        costPrice: 0,
        sellingPrice: 0,
        isBase: false,
        barcode: '893' + Date.now().toString().slice(-9),
      };
      if (onSuccess) onSuccess(uomData, 'uom');
      onClose();
    } else if (activeTab === 'partner') {
      if (!partnerName.trim()) {
        alert('Vui lòng nhập Tên đối tác');
        return;
      }
      const partnerData = {
        id: (partnerType === 'supplier' ? 'sup-' : 'cust-') + Date.now(),
        code: (partnerType === 'supplier' ? 'NCC-' : 'KH-') + Date.now().toString().slice(-4),
        name: partnerName,
        phone: partnerPhone,
        taxCode: partnerTaxCode,
        email: partnerEmail,
        address: partnerAddress,
        contactPerson: partnerContactPerson,
        totalPurchases: 0,
        debt: 0,
      };

      if (onSavePartner) {
        await onSavePartner({
          type: partnerType === 'both' ? 'supplier' : partnerType,
          data: partnerData,
        });
      }
      if (onSuccess) onSuccess(partnerData, 'partner');
      onClose();
    } else if (activeTab === 'color') {
      if (!colorName.trim()) {
        alert('Vui lòng nhập Tên màu sắc');
        return;
      }
      const colorData = { name: colorName, hex: colorHex, notes: colorNotes };
      if (onSuccess) onSuccess(colorData, 'color');
      onClose();
    } else if (activeTab === 'location') {
      if (!locationName.trim()) {
        alert('Vui lòng nhập Tên vị trí kệ');
        return;
      }
      const locationData = { name: locationName, warehouse: locationWarehouse, capacity: locationCapacity };
      if (onSuccess) onSuccess(locationData, 'location');
      onClose();
    } else if (activeTab === 'department') {
      if (!deptName.trim()) {
        alert('Vui lòng nhập Tên phòng ban');
        return;
      }
      const deptData = { name: deptName, manager: deptManager, notes: deptNotes };
      if (onSuccess) onSuccess(deptData, 'department');
      onClose();
    } else if (activeTab === 'employee') {
      if (!empName.trim()) {
        alert('Vui lòng nhập Họ tên nhân viên');
        return;
      }
      const roleMap: Record<string, Employee['role']> = {
        warehouse: 'Thủ Kho',
        cashier: 'Thu Ngân',
        accountant: 'Kế Toán',
        manager: 'Quản Lý Cửa Hàng',
        sales: 'Nhân Viên Bán Hàng',
      };
      const newEmployee: Employee = {
        id: 'emp-' + Date.now(),
        code: 'NV-' + Date.now().toString().slice(-4),
        name: empName,
        phone: empPhone,
        email: empEmail || `${empPhone || Date.now()}@gperp.vn`,
        role: roleMap[empRole] || 'Thủ Kho',
        baseSalary: Number(empSalary) || 8500000,
        salesKpiTarget: 50000000,
        currentSales: 0,
        commissionRate: 2,
        status: 'active',
        joinedDate: new Date().toISOString().slice(0, 10),
        shiftSchedule: 'Ca Sáng (06:00 - 14:00)',
      };
      if (onSaveEmployee) await onSaveEmployee(newEmployee);
      if (onSuccess) onSuccess(newEmployee, 'employee');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-4 md:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <span>Bộ Thêm Nhanh Danh Mục Toàn Diện (Master Data)</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                  In-Place Quick Add
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tạo trực tiếp tại chỗ không cần chuyển trang, tự động gắn vào form nhập kho & chứng từ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center space-x-1 p-2 bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'product', label: '1. Sản Phẩm Mới', icon: Package },
            { id: 'uom', label: '2. Đơn Vị Tính', icon: Ruler },
            { id: 'partner', label: '3. Đối Tác / NCC', icon: Users },
            { id: 'color', label: '4. Màu Sắc', icon: Palette },
            { id: 'location', label: '5. Vị Trí Kệ', icon: MapPin },
            { id: 'department', label: '6. Phòng Ban', icon: Building },
            { id: 'employee', label: '7. Nhân Sự', icon: UserCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as MasterDataType)}
                className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: PRODUCT */}
          {activeTab === 'product' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tên Sản Phẩm / Hàng Hóa <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="VD: Camera IP Thân Trụ 4MP Hikvision..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">Mã SKU</label>
                    <button
                      type="button"
                      onClick={generateNewSkuBarcode}
                      className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-0.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sinh tự động</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mã Vạch Barcode (EAN-13/128)</label>
                  <input
                    type="text"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Đơn Vị Tính Gốc</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {PRESET_UOMS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nhóm Hàng / Danh Mục</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Giá Vốn Nhập Kho (VNĐ)</label>
                  <input
                    type="number"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Giá Bán Lẻ (VNĐ)</label>
                  <input
                    type="number"
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tồn Kho Ban Đầu</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Vị Trí Kệ / Tủ Lưu Trữ</label>
                  <select
                    value={productForm.storageLocation}
                    onChange={(e) => setProductForm({ ...productForm, storageLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {PRESET_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Product Image Section */}
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <label className="text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                      <span>Hình ảnh sản phẩm:</span>
                    </label>

                    <div className="flex items-center space-x-1.5">
                      <input
                        type="file"
                        ref={imageFileInputRef}
                        onChange={handleImageFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Tải ảnh từ ổ đĩa máy tính"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Từ máy tính</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowWebImagePicker(true)}
                        className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-600/50 text-indigo-300 hover:text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Mở thư viện ảnh sản phẩm HD & Tìm kiếm Web"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Từ Web</span>
                      </button>

                      {productForm.image && (
                        <button
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}
                          className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 hover:text-rose-100 rounded-lg text-[10px] font-semibold flex items-center space-x-0.5 transition-all cursor-pointer"
                          title="Gỡ bỏ hình ảnh hiện tại"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Gỡ ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input with Live Thumbnail Preview Box */}
                  <div
                    onPaste={handlePasteImage}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const compressed = await compressImageFile(file);
                        setProductForm((prev) => ({ ...prev, image: compressed }));
                      }
                    }}
                    className="flex items-center space-x-3"
                  >
                    <div
                      onClick={() => imageFileInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-cyan-400 overflow-hidden flex items-center justify-center shrink-0 shadow-inner cursor-pointer group transition-all"
                      title="Bấm để chọn ảnh từ máy tính, kéo thả ảnh hoặc dán Ctrl+V vào đây"
                    >
                      {productForm.image ? (
                        <img
                          src={productForm.image}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-600 group-hover:text-cyan-400" />
                      )}
                    </div>

                    <input
                      type="url"
                      value={productForm.image || ''}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      onPaste={handlePasteImage}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                      placeholder="Dán link ảnh (https://...) hoặc bấm Ctrl+V để dán ảnh chụp màn hình..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UOM */}
          {activeTab === 'uom' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300">
                Thiết lập đơn vị tính quy đổi phụ (Ví dụ: 1 Thùng = 12 Cái, 1 Hộp = 10 Gói).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tên Đơn Vị Tính Mới</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={uomName}
                      onChange={(e) => setUomName(e.target.value)}
                      placeholder="VD: Thùng, Lốc, Cuộn, Cây..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {PRESET_UOMS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUomName(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          uomName === u
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tỷ Lệ Quy Đổi (1 {uomName || 'ĐVT mới'} = bao nhiêu {uomBaseUnit}?)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={uomRatio}
                    onChange={(e) => setUomRatio(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Công thức: 1 <strong>{uomName}</strong> = <strong>{uomRatio}</strong> {uomBaseUnit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PARTNER (Supplier / Customer) */}
          {activeTab === 'partner' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300">Loại Đối Tác:</span>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPartnerType('supplier')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      partnerType === 'supplier' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Nhà Cung Cấp
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerType('customer')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      partnerType === 'customer' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Khách Hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartnerType('both')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      partnerType === 'both' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cả Hai
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tên Đối Tác / Doanh Nghiệp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="VD: Công Ty CP Công Nghệ Viễn Thông Tân Phát..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="0909 123 456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mã Số Thuế (MST)</label>
                  <input
                    type="text"
                    value={partnerTaxCode}
                    onChange={(e) => setPartnerTaxCode(e.target.value)}
                    placeholder="0315897210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="contact@tanphat.vn"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Người Đại Diện / Liên Hệ</label>
                  <input
                    type="text"
                    value={partnerContactPerson}
                    onChange={(e) => setPartnerContactPerson(e.target.value)}
                    placeholder="Mr. Tuấn (Trưởng phòng KD)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Địa Chỉ Đăng Ký Kinh Doanh</label>
                  <input
                    type="text"
                    value={partnerAddress}
                    onChange={(e) => setPartnerAddress(e.target.value)}
                    placeholder="123 Đường Số 7, P. An Lạc A, Q. Bình Tân, TP. HCM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COLOR */}
          {activeTab === 'color' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tên Màu Sắc</label>
                  <input
                    type="text"
                    required
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    placeholder="VD: Space Gray, Titan, Đen bóng..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />

                  {/* Preset color buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setColorName(c.name);
                          setColorHex(c.hex);
                        }}
                        className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-slate-300 transition-all"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-500" style={{ backgroundColor: c.hex }} />
                        <span>{c.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mã Màu HEX & Xem Trước</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-12 h-10 rounded-xl cursor-pointer bg-slate-950 border border-slate-700 p-1"
                    />
                    <input
                      type="text"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-lg border border-slate-600 shadow" style={{ backgroundColor: colorHex }} />
                    <span className="text-xs font-bold text-white">{colorName || 'Màu hiển thị'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tên Vị Trí Kệ / Tủ Kho</label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="VD: Kệ A1 - Tầng 2, Ô B3..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />

                  {/* Preset Locations */}
                  <div className="space-y-1 mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gợi ý mẫu vị trí:</span>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocationName(loc)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kho Trực Thuộc</label>
                  <input
                    type="text"
                    value={locationWarehouse}
                    onChange={(e) => setLocationWarehouse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />

                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Sức Chứa Dự Kiến</label>
                    <input
                      type="text"
                      value={locationCapacity}
                      onChange={(e) => setLocationCapacity(e.target.value)}
                      placeholder="VD: 50-100 thiết bị"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DEPARTMENT */}
          {activeTab === 'department' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tên Phòng Ban / Bộ Phận</label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="VD: Phòng Kỹ Thuật & Sửa Chữa..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />

                  <div className="flex flex-wrap gap-1 mt-2">
                    {PRESET_DEPARTMENTS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setDeptName(dept)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trưởng Bộ Phận Phụ Trách</label>
                  <input
                    type="text"
                    value={deptManager}
                    onChange={(e) => setDeptManager(e.target.value)}
                    placeholder="Mr. Thơm / Phạm Gia Phúc"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EMPLOYEE */}
          {activeTab === 'employee' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Họ Và Tên Nhân Viên</label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Chức Vụ / Vai Trò</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="warehouse">Thủ Kho / Quản Lý Kho</option>
                    <option value="technician">Kỹ Thuật Viên Sửa Chữa</option>
                    <option value="cashier">Thu Ngân / Bán Hàng POS</option>
                    <option value="accountant">Kế Toán Thu Chi & Công Nợ</option>
                    <option value="manager">Quản Lý Chi Nhánh / Cửa Hàng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phòng Ban Phụ Trách</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {PRESET_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Hủy Bỏ (Esc)
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Tự Động Gắn Vào Form</span>
            </button>
          </div>
        </form>
      </div>

      {/* Web Image Picker Modal */}
      {showWebImagePicker && (
        <WebImagePickerModal
          isOpen={showWebImagePicker}
          onClose={() => setShowWebImagePicker(false)}
          onSelectImage={(imageUrl) => setProductForm((prev) => ({ ...prev, image: imageUrl }))}
          currentImageUrl={productForm.image}
        />
      )}
    </div>
  );
};
