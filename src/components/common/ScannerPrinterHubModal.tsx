import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Printer,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Package,
  ShieldCheck,
  Building,
  Receipt,
  FileText,
  Copy,
  Download,
  Sparkles,
  X,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  CreditCard,
  QrCode,
  ArrowRight,
  Layers,
  Check,
  Info,
  Maximize2,
} from 'lucide-react';
import {
  Product,
  Order,
  WarrantyTicket,
  SerialDeviceRecord,
  EnterpriseAsset,
  StoreSettings,
  InventoryLog,
} from '../../types';
import { sounds } from '../../utils/soundEffects';
import { formatVND } from '../../utils/vietqr';
import { PrintPreviewModal } from './PrintPreviewModal';
import { PrinterManagerModal } from './PrinterManagerModal';

export interface ScannerPrinterHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScanCode?: string;
  initialTab?: 'lookup' | 'register' | 'batch_serial' | 'printer_hub';
  products: Product[];
  orders?: Order[];
  warranties?: WarrantyTicket[];
  serialRecords?: SerialDeviceRecord[];
  assets?: EnterpriseAsset[];
  settings: StoreSettings;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onAdjustStock?: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  onSaveProduct?: (product: Product) => void;
  onSaveSerialRecord?: (record: SerialDeviceRecord) => void;
  onNavigateToPos?: () => void;
  onOpenBarcodeLabelModal?: (product: Product) => void;
  onOpenDocumentPrintModal?: (order?: Order, docType?: any) => void;
  onUpdateSettings?: (settings: StoreSettings) => void;
}

export const ScannerPrinterHubModal: React.FC<ScannerPrinterHubModalProps> = ({
  isOpen,
  onClose,
  initialScanCode = '',
  initialTab = 'lookup',
  products = [],
  orders = [],
  warranties = [],
  serialRecords = [],
  assets = [],
  settings,
  onAddToCart,
  onAdjustStock,
  onSaveProduct,
  onSaveSerialRecord,
  onNavigateToPos,
  onOpenBarcodeLabelModal,
  onOpenDocumentPrintModal,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'lookup' | 'register' | 'batch_serial' | 'printer_hub'>(initialTab);

  // Tab 1: Smart Lookup State
  const [scanInput, setScanInput] = useState<string>(initialScanCode);
  const [activeCode, setActiveCode] = useState<string>(initialScanCode);
  const [stockAdjustQty, setStockAdjustQty] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState<string>('Quét điều chỉnh tồn kho');
  const [showTestDocPreview, setShowTestDocPreview] = useState(false);
  const [testDocPaperSize, setTestDocPaperSize] = useState<'A4' | 'A5' | 'K80'>('K80');

  // Tab 2: Quick Register Product State
  const [regBarcode, setRegBarcode] = useState<string>('');
  const [regSku, setRegSku] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regCategory, setRegCategory] = useState<string>('Thiết bị mạng & Camera');
  const [regUnit, setRegUnit] = useState<string>('Cái');
  const [regCostPrice, setRegCostPrice] = useState<number>(100000);
  const [regSellingPrice, setRegSellingPrice] = useState<number>(150000);
  const [regStock, setRegStock] = useState<number>(10);
  const [regLocation, setRegLocation] = useState<string>('Kệ A1');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string>('');

  // Tab 3: Batch Serial Scanner State
  const [batchInput, setBatchInput] = useState<string>('');
  const [batchList, setBatchList] = useState<Array<{ id: string; serial: string; time: string }>>([]);
  const [batchSelectedProduct, setBatchSelectedProduct] = useState<string>('');
  const [duplicateWarning, setDuplicateWarning] = useState<string>('');

  // Tab 4: Printer settings state
  const [autoPrintCheckout, setAutoPrintCheckout] = useState<boolean>(settings?.autoPrintReceipt !== false);
  const [openDrawerOnPay, setOpenDrawerOnPay] = useState<boolean>(settings?.openDrawerOnPayment !== false);
  const [scannerSound, setScannerSound] = useState<boolean>(settings?.scannerBeepSound !== false);
  const [showPrinterManagerModal, setShowPrinterManagerModal] = useState<boolean>(false);

  const lookupInputRef = useRef<HTMLInputElement | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialScanCode) {
        setScanInput(initialScanCode);
        setActiveCode(initialScanCode);
      }
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setTimeout(() => {
        if (activeTab === 'lookup') lookupInputRef.current?.focus();
        if (activeTab === 'batch_serial') batchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialScanCode, initialTab]);

  // Global listener for scanned barcode when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleBarcodeEvent = (e: any) => {
      const barcode = e.detail?.barcode;
      if (!barcode) return;

      if (activeTab === 'lookup') {
        setScanInput(barcode);
        setActiveCode(barcode);
        sounds.playBarcodeBeep();
      } else if (activeTab === 'register') {
        setRegBarcode(barcode);
        if (!regSku) setRegSku('SKU-' + barcode.slice(-4));
        sounds.playBarcodeBeep();
      } else if (activeTab === 'batch_serial') {
        handlePushBatchSerial(barcode);
      }
    };

    window.addEventListener('barcode-scanned', handleBarcodeEvent);
    return () => window.removeEventListener('barcode-scanned', handleBarcodeEvent);
  }, [isOpen, activeTab, batchList]);

  // Esc shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search matches for Active Code in 4 databases
  const normalizedQuery = (activeCode || '').trim().toLowerCase();

  const matchedProducts = products.filter((p) => {
    if (!normalizedQuery) return false;
    return (
      (p.barcode && p.barcode.toLowerCase() === normalizedQuery) ||
      (p.sku && p.sku.toLowerCase() === normalizedQuery) ||
      (p.name && p.name.toLowerCase().includes(normalizedQuery))
    );
  });

  const matchedOrders = orders.filter((o) => {
    if (!normalizedQuery) return false;
    return (
      (o.code && o.code.toLowerCase() === normalizedQuery) ||
      (o.id && o.id.toLowerCase() === normalizedQuery) ||
      (o.customer?.phone && o.customer.phone.includes(normalizedQuery)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(normalizedQuery))
    );
  });

  const matchedWarranties = warranties.filter((w) => {
    if (!normalizedQuery) return false;
    return (
      (w.code && w.code.toLowerCase() === normalizedQuery) ||
      (w.serialNumber && w.serialNumber.toLowerCase() === normalizedQuery) ||
      (w.customerPhone && w.customerPhone.includes(normalizedQuery))
    );
  });

  const matchedSerialDevices = serialRecords.filter((s) => {
    if (!normalizedQuery) return false;
    return s.serialNumber && s.serialNumber.toLowerCase() === normalizedQuery;
  });

  const matchedAssets = assets.filter((a) => {
    if (!normalizedQuery) return false;
    return (
      (a.code && a.code.toLowerCase() === normalizedQuery) ||
      (a.name && a.name.toLowerCase().includes(normalizedQuery))
    );
  });

  const hasAnyMatch =
    matchedProducts.length > 0 ||
    matchedOrders.length > 0 ||
    matchedWarranties.length > 0 ||
    matchedSerialDevices.length > 0 ||
    matchedAssets.length > 0;

  // Handler to search
  const handlePerformLookup = (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    setActiveCode(clean);
    if (clean) {
      sounds.playBarcodeBeep();
    }
  };

  // Handler for Batch Serial
  const handlePushBatchSerial = (serial: string) => {
    const cleanSerial = serial.trim();
    if (!cleanSerial) return;

    // Check duplicate in current batch
    const isDup = batchList.some((item) => item.serial.toLowerCase() === cleanSerial.toLowerCase());
    if (isDup) {
      setDuplicateWarning(`Cảnh báo: Mã "${cleanSerial}" đã tồn tại trong danh sách quét!`);
      sounds.playErrorBeep();
      setTimeout(() => setDuplicateWarning(''), 3000);
      return;
    }

    setDuplicateWarning('');
    sounds.playBarcodeBeep();
    setBatchList((prev) => [
      {
        id: 'batch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        serial: cleanSerial,
        time: new Date().toLocaleTimeString('vi-VN'),
      },
      ...prev,
    ]);
    setBatchInput('');
  };

  // Handler for Quick Product Register
  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regBarcode) return;

    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: regName.trim(),
      sku: regSku.trim() || 'SKU-' + regBarcode.slice(-4),
      barcode: regBarcode.trim(),
      category: regCategory,
      unit: regUnit,
      costPrice: Number(regCostPrice) || 0,
      sellingPrice: Number(regSellingPrice) || 0,
      stock: Number(regStock) || 0,
      minStock: 5,
      warehouse: settings?.defaultWarehouse || 'Kho Chính Gia Phúc Computer',
      storageLocation: regLocation,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: 'Sản phẩm tạo nhanh từ máy quét mã vạch súng laser',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSaveProduct) {
      onSaveProduct(newProd);
    }
    sounds.playSuccessChime();
    setRegSuccessMsg(`Đã thêm thành công sản phẩm "${newProd.name}" vào kho hàng!`);
    setTimeout(() => {
      setRegSuccessMsg('');
      setActiveCode(newProd.barcode);
      setActiveTab('lookup');
    }, 1200);
  };

  // Handler for Stock Adjustment
  const handleQuickAdjust = (product: Product, delta: number) => {
    if (!onAdjustStock) return;
    const newStock = Math.max(0, product.stock + delta);
    onAdjustStock({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: delta >= 0 ? 'import' : 'export',
      quantityChange: Math.abs(delta),
      oldStock: product.stock,
      newStock: newStock,
      unitPrice: product.costPrice,
      reason: adjustNote || (delta >= 0 ? 'Quét nạp thêm kho' : 'Quét xuất kho nhanh'),
      performedBy: 'Thu ngân / Quản lý kho',
    });
    sounds.playBarcodeBeep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 md:p-4 animate-in fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-6xl w-full h-[95vh] max-h-[920px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* HEADER BAR */}
        <div className="p-3.5 px-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Trung Tâm Máy Quét Mã Vạch & Máy In (F3)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  Hub V2.5 Pro
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Tương thích súng quét laser USB/Bluetooth • Máy in bill K80 • Máy in A4/A5 • Xuất PDF
              </p>
            </div>
          </div>

          {/* Quick Sound Toggle & Close */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const next = !scannerSound;
                setScannerSound(next);
                if (onUpdateSettings) {
                  onUpdateSettings({ ...settings, scannerBeepSound: next });
                }
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                scannerSound
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Bật/Tắt âm thanh BÍP súng quét laser"
            >
              {scannerSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{scannerSound ? 'Âm thanh BÍP' : 'Tắt tiếng'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-1 p-2 bg-slate-950 border-b border-slate-800 px-5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('lookup');
              setTimeout(() => lookupInputRef.current?.focus(), 100);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>1. 🔍 Tra Cứu Thông Minh (Smart Lookup)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              if (activeCode && !regBarcode) {
                setRegBarcode(activeCode);
                setRegSku('SKU-' + activeCode.slice(-4));
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>2. ➕ Đăng Ký Hàng Nhanh (Scan to Register)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('batch_serial');
              setTimeout(() => batchInputRef.current?.focus(), 100);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'batch_serial'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. ⚡ Quét Nạp Serial / IMEI Hàng Loạt</span>
            {batchList.length > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-300 text-purple-950 rounded-full text-[10px] font-black">
                {batchList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('printer_hub')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'printer_hub'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>4. 🖨️ Quản Lý & Test Máy In (Print Hub)</span>
          </button>
        </div>

        {/* BODY VIEWPORT */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/60">
          
          {/* TAB 1: SMART LOOKUP */}
          {activeTab === 'lookup' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Laser Search Input Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Barcode className="w-4 h-4 text-amber-400" />
                    <span>Cổng nhận tín hiệu súng quét Laser (Tự động nhận diện 1D, 2D QR, SKU, Serial, Mã đơn GP-...)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sẵn sàng quét liên tục</span>
                  </span>
                </label>

                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      ref={lookupInputRef}
                      type="text"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handlePerformLookup(scanInput);
                        }
                      }}
                      placeholder="Bắn tia laser súng quét hoặc gõ mã vạch / SKU / Mã đơn GP-... rồi bấm Enter"
                      className="w-full h-12 pl-11 pr-4 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      autoFocus
                    />
                    <Barcode className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePerformLookup(scanInput)}
                    className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    <span>Tra Cứu</span>
                  </button>
                </div>

                {/* Quick test code buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span>Mã mẫu gợi ý:</span>
                  {products.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setScanInput(p.barcode || p.sku);
                        handlePerformLookup(p.barcode || p.sku);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 font-mono text-[10px] transition-colors"
                    >
                      📦 {p.barcode || p.sku} ({p.name.slice(0, 18)}...)
                    </button>
                  ))}
                  {orders.slice(0, 1).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setScanInput(o.code);
                        handlePerformLookup(o.code);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-mono text-[10px] transition-colors"
                    >
                      🧾 {o.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEARCH RESULTS CONTAINER */}
              {activeCode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Kết quả tra cứu cho mã: <span className="text-amber-400 font-mono text-sm">{activeCode}</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {hasAnyMatch ? 'Đã tìm thấy dữ liệu tương ứng' : 'Chưa có trong hệ thống'}
                    </span>
                  </div>

                  {/* 1. MATCHED PRODUCTS */}
                  {matchedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-950/80 border border-blue-500/40 rounded-2xl p-4 md:p-5 shadow-xl space-y-4 animate-in fade-in"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                📦 Sản Phẩm Kho Hàng
                              </span>
                              <span className="text-xs text-slate-400">{p.category}</span>
                            </div>
                            <h4 className="text-base font-extrabold text-white mt-1">{p.name}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                              <span>Mã vạch: <strong className="text-amber-400">{p.barcode}</strong></span>
                              <span>•</span>
                              <span>SKU: <strong className="text-slate-200">{p.sku}</strong></span>
                              <span>•</span>
                              <span>Vị trí: <strong className="text-emerald-400">{p.storageLocation || 'Chưa gán'}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-lg font-mono font-black text-cyan-400">
                            {formatVND(p.sellingPrice)}
                          </div>
                          <p className="text-xs text-slate-400">
                            Tồn kho: <strong className={p.stock <= p.minStock ? 'text-rose-400 font-mono font-bold' : 'text-emerald-400 font-mono font-bold'}>
                              {p.stock} {p.unit}
                            </strong>
                          </p>
                          <p className="text-[10px] text-slate-500">Giá vốn: {formatVND(p.costPrice)}</p>
                        </div>
                      </div>

                      {/* 1-TOUCH ACTION TOOLBAR */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                        {/* Quick stock adjustment buttons */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs text-slate-400 mr-1">Điều chỉnh tồn:</span>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(p, 1)}
                            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Quét tăng 1 đơn vị"
                          >
                            +1 {p.unit}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(p, 5)}
                            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(p, -1)}
                            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-700/50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Quét giảm 1 đơn vị"
                          >
                            -1 {p.unit}
                          </button>
                        </div>

                        {/* Primary actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onAddToCart) {
                                onAddToCart(p, 1);
                                sounds.playSuccessChime();
                              }
                              if (onNavigateToPos) {
                                onNavigateToPos();
                                onClose();
                              }
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>🛒 Bán Hàng POS (F2)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenBarcodeLabelModal) {
                                onOpenBarcodeLabelModal(p);
                              }
                            }}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                            title="In tem mã vạch (30x20mm, 50x30mm, 35x22mm...)"
                          >
                            <Barcode className="w-4 h-4" />
                            <span>In Tem Mã Vạch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 2. MATCHED ORDERS */}
                  {matchedOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 md:p-5 shadow-xl space-y-3 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                            🧾 Đơn Hàng Bán Lẻ
                          </span>
                          <span className="text-sm font-mono font-bold text-white">{o.code}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          {o.status === 'completed' ? 'Hoàn tất' : o.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                        <div>Khách hàng: <strong className="text-white">{o.customer?.name || 'Khách lẻ'}</strong> ({o.customer?.phone || 'Không có SĐT'})</div>
                        <div>Tổng tiền: <strong className="text-cyan-400 font-mono text-sm">{formatVND(o.total)}</strong></div>
                        <div>Thời gian: <span className="text-slate-400">{new Date(o.createdAt).toLocaleString('vi-VN')}</span></div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenDocumentPrintModal) {
                              onOpenDocumentPrintModal(o, 'sales_invoice');
                            } else {
                              setShowTestDocPreview(true);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md"
                        >
                          <Printer className="w-4 h-4" />
                          <span>In Lại Hóa Đơn / Phiếu Xuất (A4 / A5 / K80)</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 3. MATCHED WARRANTIES & SERIALS */}
                  {matchedWarranties.map((w) => (
                    <div
                      key={w.id}
                      className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 md:p-5 shadow-xl space-y-3 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                          🛡️ Hồ Sơ Bảo Hành / Sửa Chữa
                        </span>
                        <span className="text-xs font-mono text-purple-400">{w.code}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{w.productName} (Serial: {w.serialNumber})</h4>
                      <p className="text-xs text-slate-300">Tình trạng: {w.issueDescription}</p>
                    </div>
                  ))}

                  {/* 4. MATCHED ENTERPRISE ASSETS */}
                  {matchedAssets.map((a) => (
                    <div
                      key={a.id}
                      className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 md:p-5 shadow-xl space-y-3 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          🏢 Tài Sản Doanh Nghiệp
                        </span>
                        <span className="text-xs font-mono text-amber-400">{a.code}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{a.name}</h4>
                      <p className="text-xs text-slate-400">Bộ phận: {a.assignedTo || 'Chung'} • Nguyên giá: {formatVND(a.originalValue)}</p>
                    </div>
                  ))}

                  {/* NOT FOUND PROMPT -> 1-CLICK REGISTER */}
                  {!hasAnyMatch && (
                    <div className="bg-slate-950/90 border border-dashed border-amber-500/50 rounded-2xl p-8 text-center space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <AlertTriangle className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-white">
                          Không tìm thấy dữ liệu cho mã: <span className="font-mono text-amber-400">{activeCode}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          Mã này chưa được đăng ký trong danh mục sản phẩm, đơn hàng hay hồ sơ bảo hành. Bạn có muốn đăng ký sản phẩm mới ngay không?
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRegBarcode(activeCode);
                          setRegSku('SKU-' + activeCode.slice(-4));
                          setActiveTab('register');
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 inline-flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>➕ Đăng Ký Sản Phẩm Mới Với Mã Này</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 space-y-2">
                  <Barcode className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
                  <p className="text-sm font-semibold">Chưa có mã quét nào được nạp</p>
                  <p className="text-xs text-slate-600">
                    Cầm súng quét bắn vào mã vạch bất kỳ hoặc gõ mã vào ô tìm kiếm ở trên để bắt đầu tra cứu
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCAN TO REGISTER */}
          {activeTab === 'register' && (
            <div className="max-w-2xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Đăng Ký Sản Phẩm Mới Siêu Tốc Bằng Máy Quét</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bắn súng laser vào vỏ hộp để tự động lấy Mã vạch và sinh SKU thông minh
                </p>
              </div>

              {regSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleQuickRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Mã Vạch Barcode <span className="text-amber-400 font-mono">(Tự động nhận)</span>
                    </label>
                    <input
                      type="text"
                      value={regBarcode}
                      onChange={(e) => setRegBarcode(e.target.value)}
                      placeholder="893..."
                      required
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-amber-300 focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Mã SKU Quản Lý
                    </label>
                    <input
                      type="text"
                      value={regSku}
                      onChange={(e) => setRegSku(e.target.value)}
                      placeholder="SKU-..."
                      required
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Tên Sản Phẩm Hàng Hóa *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="VD: Cáp Mạng Cat6 UTP Golden Link 305m hoặc Chuột Gaming Logitech G102"
                    required
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Danh Mục Hàng Hóa
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="Thiết bị điện tử">Thiết bị điện tử</option>
                      <option value="Thiết bị mạng & Camera">Thiết bị mạng & Camera</option>
                      <option value="Linh kiện máy tính">Linh kiện máy tính</option>
                      <option value="Phụ kiện & Cáp">Phụ kiện & Cáp</option>
                      <option value="Dịch vụ & Lắp đặt">Dịch vụ & Lắp đặt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Đơn Vị Tính (ĐVT)
                    </label>
                    <input
                      type="text"
                      value={regUnit}
                      onChange={(e) => setRegUnit(e.target.value)}
                      placeholder="Cái, Bộ, Cuộn, Chiếc..."
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Giá Vốn (Nhập)
                    </label>
                    <input
                      type="number"
                      value={regCostPrice}
                      onChange={(e) => setRegCostPrice(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Giá Bán Lẻ
                    </label>
                    <input
                      type="number"
                      value={regSellingPrice}
                      onChange={(e) => setRegSellingPrice(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-400 font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Tồn Kho Ban Đầu
                    </label>
                    <input
                      type="number"
                      value={regStock}
                      onChange={(e) => setRegStock(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 font-bold focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('lookup')}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Lưu Vào Kho Hàng (Enter)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BATCH SERIAL SCANNER */}
          {activeTab === 'batch_serial' && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="bg-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-purple-400" />
                      <span>Quét Nạp Danh Sách Serial / IMEI Hàng Loạt</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Chế độ quét liên tục: Cầm súng laser bắn lần lượt vào từng máy/vỏ hộp. Tự động chống trùng lặp.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-purple-950 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-mono font-extrabold">
                      Đã quét: {batchList.length} mã
                    </span>
                    {batchList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBatchList([])}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Xóa sạch danh sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Continuous Scan Input */}
                <div className="relative">
                  <input
                    ref={batchInputRef}
                    type="text"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePushBatchSerial(batchInput);
                      }
                    }}
                    placeholder="Bắn súng laser liên tục vào từng Serial/IMEI hoặc gõ rồi Enter..."
                    className="w-full h-12 pl-11 pr-4 bg-slate-900 border border-purple-500/50 rounded-xl text-sm font-mono text-purple-300 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500/50"
                    autoFocus
                  />
                  <Barcode className="w-5 h-5 text-purple-400 absolute left-3.5 top-3.5" />
                </div>

                {duplicateWarning && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                {/* Serial List Display */}
                <div className="bg-slate-900/90 rounded-xl border border-slate-800 max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {batchList.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Chưa có mã Serial nào trong phiên quét hiện tại. Cầm súng bắn để bắt đầu tích lũy.
                    </div>
                  ) : (
                    batchList.map((item, idx) => (
                      <div key={item.id} className="p-2.5 px-4 flex items-center justify-between hover:bg-slate-850/60">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-purple-300 text-xs font-mono font-bold flex items-center justify-center">
                            {batchList.length - idx}
                          </span>
                          <span className="font-mono text-sm font-bold text-slate-100">{item.serial}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                          <button
                            type="button"
                            onClick={() => setBatchList((prev) => prev.filter((b) => b.id !== item.id))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Assign to Product & Bump Stock */}
                {batchList.length > 0 && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Gán danh sách {batchList.length} Serial này vào sản phẩm trong kho:
                      </label>
                      <select
                        value={batchSelectedProduct}
                        onChange={(e) => setBatchSelectedProduct(e.target.value)}
                        className="w-full h-9 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="">-- Chọn sản phẩm để cộng dồn tồn kho (+{batchList.length}) --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Tồn hiện tại: {p.stock} {p.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={!batchSelectedProduct}
                      onClick={() => {
                        const targetProd = products.find((p) => p.id === batchSelectedProduct);
                        if (targetProd && onAdjustStock) {
                          onAdjustStock({
                            productId: targetProd.id,
                            productName: targetProd.name,
                            sku: targetProd.sku,
                            type: 'import',
                            quantityChange: batchList.length,
                            oldStock: targetProd.stock,
                            newStock: targetProd.stock + batchList.length,
                            unitPrice: targetProd.costPrice,
                            reason: `Quét nạp ${batchList.length} Serial/IMEI hàng loạt`,
                            performedBy: 'Thu ngân / Quản lý kho',
                          });
                          sounds.playSuccessChime();
                          alert(`Đã cộng dồn +${batchList.length} vào tồn kho sản phẩm "${targetProd.name}" thành công!`);
                          setBatchList([]);
                        }
                      }}
                      className="h-9 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow cursor-pointer transition-all shrink-0"
                    >
                      Cộng Dồn Tồn Kho (+{batchList.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRINTER HUB */}
          {activeTab === 'printer_hub' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Printer Hardware Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. K80 Thermal Receipt */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Máy In Hóa Đơn Nhiệt Bill (K80 / K58)</h4>
                      <p className="text-[11px] text-slate-400">Xprinter XP-Q800, XP-N160M, Bixolon, Gprinter</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p>• Khổ in: <strong>80mm / 58mm</strong> (Máy in bill cuộn nhiệt)</p>
                    <p>• Cắt giấy: <strong>Tự động cắt toàn phần (Full Cut)</strong></p>
                    <p>• Két tiền: <strong>Kích xung mở ngăn kéo pin 2/5 (ESC/POS)</strong></p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTestDocPaperSize('K80');
                        setShowTestDocPreview(true);
                      }}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>In Thử Mẫu Bill K80</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCashDrawerSound();
                        alert('Đã gửi tín hiệu xung kích mở két tiền thu ngân!');
                      }}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
                      title="Test mở két tiền"
                    >
                      ⚡ Mở Két Tiền
                    </button>
                  </div>
                </div>

                {/* 2. Office A4 / A5 Document Printer */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Máy In Văn Phòng (A4 / A5 & PDF)</h4>
                      <p className="text-[11px] text-slate-400">Canon LBP 2900/3300, HP LaserJet, Brother, Epson</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p>• Khổ in: <strong>A4 (210×297mm)</strong> hoặc <strong>A5 (148×210mm)</strong></p>
                    <p>• Chiều giấy: <strong>Dọc (Portrait) / Ngang (Landscape)</strong></p>
                    <p>• Mẫu in: <strong>Kẻ ô chuẩn màu Excel + Mã VietQR thanh toán</strong></p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTestDocPaperSize('A4');
                      setShowTestDocPreview(true);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Thử Mẫu Hóa Đơn A4 / A5</span>
                  </button>
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Tự Động Hóa In Ấn & Két Tiền POS</span>
                </h4>

                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Tự động mở lệnh in hóa đơn ngay khi thu ngân bấm Hoàn Tất</p>
                      <p className="text-[11px] text-slate-400">Bỏ qua các bước bấm chuột trung gian, kích hoạt ngay lệnh in ra máy</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPrintCheckout}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAutoPrintCheckout(checked);
                        if (onUpdateSettings) onUpdateSettings({ ...settings, autoPrintReceipt: checked });
                      }}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Tự động phát tín hiệu mở két tiền khi thanh toán tiền mặt</p>
                      <p className="text-[11px] text-slate-400">Gửi lệnh xung điện kích mở ngăn kéo đựng tiền quầy thu ngân</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={openDrawerOnPay}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOpenDrawerOnPay(checked);
                        if (onUpdateSettings) onUpdateSettings({ ...settings, openDrawerOnPayment: checked });
                      }}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Printer Management Button */}
              <div className="p-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 rounded-2xl border border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Quản Lý Chi Tiết Danh Sách Máy In & Cổng Kết Nối</h4>
                    <p className="text-xs text-slate-400">Thêm máy in IP mạng LAN, USB, Bluetooth hoặc máy in ảo PDF mặc định</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrinterManagerModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Sliders className="w-4 h-4" />
                  <span>⚙️ Mở Quản Lý Máy In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Document Print Preview Modal for Testing */}
      {showTestDocPreview && (
        <PrintPreviewModal
          isOpen={showTestDocPreview}
          onClose={() => setShowTestDocPreview(false)}
          title="Bản Xem Trước Mẫu In Thử Nghiệm"
          initialPaperSize={testDocPaperSize}
          settings={settings}
        />
      )}

      {/* Printer Manager Modal */}
      {showPrinterManagerModal && (
        <PrinterManagerModal
          isOpen={showPrinterManagerModal}
          onClose={() => setShowPrinterManagerModal(false)}
        />
      )}
    </div>
  );
};
