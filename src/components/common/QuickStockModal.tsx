import React, { useState, useMemo } from 'react';
import {
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  Search,
  CheckCircle2,
  X,
  Boxes,
  ArrowRight,
  UserCheck,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
  Plus,
  Palette,
  MapPin,
} from 'lucide-react';
import { Product, InventoryLog, StoreSettings, Employee } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { QuickAddMasterDataModal, MasterDataType } from './QuickAddMasterDataModal';

interface QuickStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAdjustStock: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  initialType?: 'import' | 'export' | 'audit_adjustment';
  settings?: StoreSettings;
  onSaveProduct?: (product: Product) => void | Promise<void>;
  onSavePartner?: (partner: any) => void | Promise<void>;
  onSaveEmployee?: (employee: Employee) => void | Promise<void>;
}

export const QuickStockModal: React.FC<QuickStockModalProps> = ({
  isOpen,
  onClose,
  products = [],
  onAdjustStock,
  initialType = 'import',
  settings,
  onSaveProduct,
  onSavePartner,
  onSaveEmployee,
}) => {
  const [stockType, setStockType] = useState<'import' | 'export' | 'audit_adjustment'>(initialType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [partnerName, setPartnerName] = useState('Công ty Phân Phối Tổng Hợp');
  const [performer, setPerformer] = useState('Quản lý Kho');
  const [reason, setReason] = useState('Nhập hàng bổ sung đợt mới');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('Kệ A1 - Tầng 1');
  const [quickAddType, setQuickAddType] = useState<MasterDataType | null>(null);

  // Sync initial type when opened
  React.useEffect(() => {
    if (isOpen) {
      setStockType(initialType);
      if (initialType === 'import') {
        setReason('Nhập hàng mới từ nhà cung cấp');
      } else if (initialType === 'export') {
        setReason('Xuất chuyển kho / xuất bán sỉ hợp đồng');
      } else {
        setReason('Kiểm kê định kỳ & cân bằng thực tế');
      }
    }
  }, [isOpen, initialType]);

  // Sync selected product price & unit
  React.useEffect(() => {
    if (selectedProduct) {
      const uomList = selectedProduct.uomConversions && selectedProduct.uomConversions.length > 0
        ? selectedProduct.uomConversions
        : [{
            unit: selectedProduct.unit,
            ratioToBase: 1,
            costPrice: selectedProduct.costPrice,
            sellingPrice: selectedProduct.sellingPrice,
            isBase: true,
          }];

      setSelectedUnit(uomList[0].unit);
      setUnitCost(uomList[0].costPrice || selectedProduct.costPrice || 0);
    }
  }, [selectedProduct]);

  // Handle unit change
  const handleUnitChange = (newUnit: string) => {
    setSelectedUnit(newUnit);
    if (!selectedProduct) return;
    const option = selectedProduct.uomConversions?.find((u) => u.unit === newUnit);
    if (option) {
      setUnitCost(option.costPrice);
    } else if (newUnit === selectedProduct.unit) {
      setUnitCost(selectedProduct.costPrice);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products.slice(0, 15);
    const q = searchTerm.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }, [products, searchTerm]);

  if (!isOpen) return null;

  const currentStock = selectedProduct ? selectedProduct.stock : 0;
  const numQty = Number(quantity) || 0;

  // Conversion ratio to base unit
  const activeOption = selectedProduct?.uomConversions?.find((u) => u.unit === selectedUnit);
  const ratioToBase = activeOption?.ratioToBase ?? 1;
  const convertedBaseQty = Number((numQty * ratioToBase).toFixed(4));

  let calculatedNewStock = currentStock;
  if (stockType === 'import') {
    calculatedNewStock = Number((currentStock + convertedBaseQty).toFixed(4));
  } else if (stockType === 'export') {
    calculatedNewStock = Math.max(0, Number((currentStock - convertedBaseQty).toFixed(4)));
  } else {
    // audit adjustment: quantity is the actual counted stock in selected unit
    calculatedNewStock = convertedBaseQty;
  }

  const stockDifference = calculatedNewStock - currentStock;
  const totalValue = numQty * (unitCost || selectedProduct?.costPrice || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Vui lòng chọn sản phẩm cần xử lý kho.');
      return;
    }

    if (stockType !== 'audit_adjustment' && numQty <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0.');
      return;
    }

    onAdjustStock({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      type: stockType,
      quantityChange: stockType === 'export' ? -Math.abs(convertedBaseQty) : stockDifference,
      oldStock: currentStock,
      newStock: calculatedNewStock,
      unitPrice: unitCost || selectedProduct.costPrice,
      reason: `${reason} [ĐVT: ${numQty} ${selectedUnit || selectedProduct.unit}] (${partnerName ? 'Đối tác: ' + partnerName : ''})`,
      performedBy: performer,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border border-blue-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto" id="quick-stock-modal">
        {/* Modal Top Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50/80 via-white to-sky-50/80 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border shadow-sm ${
              stockType === 'import'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : stockType === 'export'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              {stockType === 'import' && <PackagePlus className="w-6 h-6" />}
              {stockType === 'export' && <PackageMinus className="w-6 h-6" />}
              {stockType === 'audit_adjustment' && <ClipboardCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Thao tác kho Desktop
                </span>
                <span className="text-xs text-slate-500 font-mono">ERP Real-Time</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 mt-0.5">
                {stockType === 'import' && 'Tạo Phiếu Nhập Kho Hàng Hóa'}
                {stockType === 'export' && 'Tạo Phiếu Xuất Kho Hàng Hóa'}
                {stockType === 'audit_adjustment' && 'Phiếu Kiểm Kê & Điều Chỉnh Tồn Thực Tế'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operation Mode Tabs */}
        <div className="px-5 pt-4 pb-1 bg-slate-50/60 border-b border-slate-100 flex space-x-2">
          <button
            type="button"
            onClick={() => {
              setStockType('import');
              setReason('Nhập hàng mới từ nhà cung cấp');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
              stockType === 'import'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PackagePlus className="w-4 h-4" />
            <span>Nhập Kho</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStockType('export');
              setReason('Xuất chuyển kho / xuất bán sỉ hợp đồng');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
              stockType === 'export'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PackageMinus className="w-4 h-4" />
            <span>Xuất Kho</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStockType('audit_adjustment');
              setReason('Kiểm kê định kỳ & cân bằng thực tế');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border ${
              stockType === 'audit_adjustment'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Kiểm Kho</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Step 1: Select Product */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                1. Chọn sản phẩm trong danh mục ({products.length} mặt hàng)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickAddType('product')}
                  className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Sản Phẩm Mới</span>
                </button>
                {selectedProduct && (
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Đổi sản phẩm khác
                  </button>
                )}
              </div>
            </div>

            {!selectedProduct ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Gõ tên sản phẩm, mã SKU hoặc mã vạch để tìm nhanh..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-inner">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Không tìm thấy sản phẩm nào khớp từ khóa.
                    </div>
                  ) : (
                    filteredProducts.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(prod);
                          setSearchTerm('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50/60 transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            <span>SKU: {prod.sku}</span>
                            <span>•</span>
                            <span>{prod.category}</span>
                          </div>
                        </div>
                        <div className="text-right pl-3 shrink-0">
                          <span className="text-xs font-bold text-slate-700">
                            Tồn: {prod.stock} {prod.unit}
                          </span>
                          <div className="text-[11px] text-blue-600 font-medium">
                            {formatVND(prod.costPrice)}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                    <Boxes className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {selectedProduct.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span>SKU: {selectedProduct.sku}</span>
                      <span>•</span>
                      <span>ĐVT: {selectedProduct.unit}</span>
                      <span>•</span>
                      <span className="text-blue-700 font-bold">Giá vốn: {formatVND(selectedProduct.costPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tồn hiện tại</div>
                  <div className="text-sm font-extrabold text-slate-800">
                    {selectedProduct.stock} <span className="text-xs font-normal text-slate-500">{selectedProduct.unit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Unit, Quantity & Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Đơn vị tính (ĐVT):</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('uom')}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Thêm ĐVT</span>
                </button>
              </div>
              {selectedProduct?.uomConversions && selectedProduct.uomConversions.length > 1 ? (
                <select
                  value={selectedUnit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-blue-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {selectedProduct.uomConversions.map((u) => (
                    <option key={u.unit} value={u.unit}>
                      {u.unit} ({formatVND(u.costPrice)})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={selectedUnit || selectedProduct?.unit || 'Đơn vị'}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {stockType === 'import' && `Số lượng nhập (${selectedUnit || 'ĐVT'}):`}
                {stockType === 'export' && `Số lượng xuất (${selectedUnit || 'ĐVT'}):`}
                {stockType === 'audit_adjustment' && `Đếm thực tế (${selectedUnit || 'ĐVT'}):`}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đơn giá vốn theo {selectedUnit || 'ĐVT'}:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">đ</span>
              </div>
            </div>
          </div>

          {/* Ratio conversion notice if unit != base */}
          {selectedProduct && ratioToBase !== 1 && (
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center justify-between">
              <span>
                💡 Quy đổi kho cơ bản: <strong>{quantity} {selectedUnit}</strong> = <strong className="text-indigo-950">{convertedBaseQty} {selectedProduct.unit}</strong>
              </span>
              <span className="text-[11px] text-indigo-600 font-mono">
                (Tỷ lệ 1 {selectedUnit} = {ratioToBase} {selectedProduct.unit})
              </span>
            </div>
          )}

          {/* Real-time Calculation Card */}
          {selectedProduct && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <span>Tồn cũ: <strong className="text-slate-800">{currentStock}</strong></span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Tồn mới sau xử lý:{' '}
                  <strong className={`text-sm ${
                    calculatedNewStock <= (selectedProduct.minStock || 5)
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}>
                    {calculatedNewStock} {selectedProduct.unit}
                  </strong>
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-500">Tổng giá trị phiếu: </span>
                <span className="font-extrabold text-blue-700 text-sm">
                  {formatVND(totalValue)}
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Partner, Performer, Location & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Đối tác / Nhà cung cấp:</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('partner')}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Thêm NCC</span>
                </button>
              </div>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="VD: Tổng kho FPT Synnex, DGW..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Người thực hiện:</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('employee')}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Thêm Nhân Sự</span>
                </button>
              </div>
              <input
                type="text"
                value={performer}
                onChange={(e) => setPerformer(e.target.value)}
                placeholder="VD: Quản lý kho, Mr. Thơm..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Vị trí kệ lưu kho:</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('location')}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Thêm Kệ Mới</span>
                </button>
              </div>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="VD: Kệ A1 - Tầng 1, Tủ Kỹ Thuật..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap items-center gap-1 mt-1">
                {['Kệ A1 - T1', 'Kệ A2 - T2', 'Kệ B1 - T1', 'Tủ C1', 'Kệ Trưng Bày'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-1.5 py-0.5 text-[9px] rounded-md border font-medium transition-all ${
                      selectedLocation === loc
                        ? 'bg-blue-600 text-white border-blue-500 font-bold'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Màu sắc / Biến thể:</label>
                <button
                  type="button"
                  onClick={() => setQuickAddType('color')}
                  className="text-[10px] text-blue-600 hover:underline font-bold flex items-center space-x-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Thêm Màu Sắc</span>
                </button>
              </div>
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                placeholder="VD: Space Gray, Titan, Đen bóng..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú & Lý do thực hiện:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Nhập thêm hàng mới từ nhà cung cấp..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={!selectedProduct}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 ${
                stockType === 'import'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  : stockType === 'export'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {stockType === 'import' && 'Xác Nhận Nhập Kho'}
                {stockType === 'export' && 'Xác Nhận Xuất Kho'}
                {stockType === 'audit_adjustment' && 'Xác Nhận Cân Bằng Kho'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick-Add Master Data Child Modal */}
      {quickAddType && (
        <QuickAddMasterDataModal
          isOpen={!!quickAddType}
          onClose={() => setQuickAddType(null)}
          initialType={quickAddType}
          settings={settings}
          onSaveProduct={onSaveProduct}
          onSavePartner={onSavePartner}
          onSaveEmployee={onSaveEmployee}
          onSuccess={(item, type) => {
            if (type === 'product') {
              setSelectedProduct(item);
            } else if (type === 'uom') {
              setSelectedUnit(item.unit);
            } else if (type === 'partner') {
              setPartnerName(item.name);
            } else if (type === 'color') {
              setSelectedColor(item.name);
            } else if (type === 'location') {
              setSelectedLocation(item.name);
            } else if (type === 'employee') {
              setPerformer(item.name);
            }
          }}
        />
      )}
    </div>
  );
};
