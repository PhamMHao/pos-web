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
  Monitor,
  Truck,
  UserCheck,
  Building2,
} from 'lucide-react';
import {
  Product,
  Order,
  WarrantyTicket,
  SerialDeviceRecord,
  EnterpriseAsset,
  StoreSettings,
  InventoryLog,
  PrintDocType,
} from '../../types';
import { sounds } from '../../utils/soundEffects';
import { formatVND } from '../../utils/vietqr';
import { PrintPreviewModal } from './PrintPreviewModal';
import { PrinterManagerModal } from './PrinterManagerModal';
import { PrintInvoiceModal, PrintItem } from './PrintInvoiceModal';

export interface ScannerPrinterHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScanCode?: string;
  initialTab?: 'batch_serial' | 'lookup' | 'register' | 'asset_handover' | 'stock_disposal' | 'printer_hub';
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
  initialTab = 'batch_serial',
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
  const [activeTab, setActiveTab] = useState<'batch_serial' | 'lookup' | 'register' | 'asset_handover' | 'stock_disposal' | 'printer_hub'>(initialTab);

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

  // Tab 4: Cung Cấp & Bàn Giao Tài Sản State
  const [handoverSerial, setHandoverSerial] = useState<string>('HKV-2CD2021-99282');
  const [handoverAssetTag, setHandoverAssetTag] = useState<string>('TS-640');
  const [handoverEmployee, setHandoverEmployee] = useState<string>('Nguyễn Văn Minh (KTV Trưởng)');
  const [handoverDepartment, setHandoverDepartment] = useState<string>('Phòng Kỹ Thuật Máy Tính & Mạng');
  const [handoverWarehouse, setHandoverWarehouse] = useState<string>(settings?.defaultWarehouse || 'Kho Chính Gia Phúc Computer');
  const [handoverCondition, setHandoverCondition] = useState<string>('Mới 100% nguyên hộp / Hoạt động hoàn hảo');

  // Tab 5: Lập Phiếu Xuất Hủy / Hao Hụt / Thanh Lý State
  const [disposalReason, setDisposalReason] = useState<string>('Hết hạn sử dụng / Lỗi thời phần cứng');
  const [disposalNotes, setDisposalNotes] = useState<string>('Hàng lỗi bo mạch / vỡ hỏng trong quá trình vận chuyển');
  const [selectedDisposalSerials, setSelectedDisposalSerials] = useState<string[]>([]);
  const [disposalSuccessMsg, setDisposalSuccessMsg] = useState<string>('');

  // Built-in Print Invoice Modal Config State
  const [printConfig, setPrintConfig] = useState<{
    isOpen: boolean;
    docType: PrintDocType;
    items: PrintItem[];
    customer?: { name?: string; phone?: string; address?: string; companyName?: string };
    orderCode?: string;
    deliveryNote?: string;
    subtotal?: number;
    total?: number;
    creatorName?: string;
    warehouseName?: string;
  } | null>(null);

  // Tab 6: Printer settings state
  const [autoPrintCheckout, setAutoPrintCheckout] = useState<boolean>(settings?.autoPrintReceipt !== false);
  const [openDrawerOnPay, setOpenDrawerOnPay] = useState<boolean>(settings?.openDrawerOnPayment !== false);
  const [scannerSound, setScannerSound] = useState<boolean>(settings?.scannerBeepSound !== false);
  const [showPrinterManagerModal, setShowPrinterManagerModal] = useState<boolean>(false);

  const lookupInputRef = useRef<HTMLInputElement | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);

  // Default rich pool of serial inventory items
  const allInventorySerials = [
    {
      serial: 'HKV-2CD2021-99282',
      productName: 'Camera IP Hikvision DS-2CD2021G1-I 2.0MP',
      sku: 'CAM-HKV-2021',
      costPrice: 650000,
      status: 'in_stock',
      unit: 'Cái',
    },
    {
      serial: 'SS-980EVO-250819',
      productName: 'Ổ cứng SSD Samsung 980 NVMe M.2 1TB PCIe 3.0',
      sku: 'SSD-SS980-1TB',
      costPrice: 1650000,
      status: 'in_stock',
      unit: 'Cái',
    },
    {
      serial: 'XP-Q800-SN882901',
      productName: 'Máy in bill nhiệt Xprinter XP-Q800 (Cắt giấy tự động)',
      sku: 'PRN-XPR-Q800',
      costPrice: 950000,
      status: 'in_stock',
      unit: 'Cái',
    },
    {
      serial: 'LT-DELL-5520-SN98',
      productName: 'Laptop Dell Precision 5520 Core i7-7820HQ 16GB 512GB',
      sku: 'NB-DELL-5520',
      costPrice: 12500000,
      status: 'in_stock',
      unit: 'Chiếc',
    },
    {
      serial: 'LCD-LG-27UP850-01',
      productName: 'Màn hình LG 27UP850-W 4K UHD IPS Type-C 96W',
      sku: 'MON-LG-27UP',
      costPrice: 8200000,
      status: 'in_stock',
      unit: 'Cái',
    },
    {
      serial: 'SW-CISCO-C2960-9',
      productName: 'Switch Cisco Catalyst WS-C2960-24TT-L 24 Port Gigabit',
      sku: 'SW-CISCO-2960',
      costPrice: 3400000,
      status: 'in_stock',
      unit: 'Cái',
    },
    {
      serial: 'VGA-RTX4060-ASUS',
      productName: 'Card màn hình ASUS Dual GeForce RTX 4060 OC 8GB',
      sku: 'VGA-ASUS-4060',
      costPrice: 8150000,
      status: 'in_stock',
      unit: 'Cái',
    },
    {
      serial: 'RAM-KST-32GB-D5',
      productName: 'RAM Kingston Fury Beast 32GB (2x16GB) DDR5 5600MHz',
      sku: 'RAM-KST-32GB',
      costPrice: 2450000,
      status: 'in_stock',
      unit: 'Bộ',
    },
  ];

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white">
                  Quản Lý Đa Serial & Quét Mã Vạch Thông Minh
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-mono font-bold">
                  {serialRecords?.length || 8} Serial trong hệ thống
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                1 Mã SP nhập nhiều Serial • Quét súng Barcode/QR • Nhập kho, Xuất bán, Bảo hành, Tài sản, Kiểm kê & Hủy kho
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
              setActiveTab('batch_serial');
              setTimeout(() => batchInputRef.current?.focus(), 100);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'batch_serial'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Nhập Kho Nhiều Serial</span>
            {batchList.length > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-300 text-purple-950 rounded-full text-[10px] font-black">
                {batchList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('lookup');
              setTimeout(() => lookupInputRef.current?.focus(), 100);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lookup'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Tra Cứu & Lịch Sử Serial</span>
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Kiểm Kê Bằng Máy Quét</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('asset_handover')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'asset_handover'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>4. Cung Cấp & Bàn Giao Tài Sản</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stock_disposal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stock_disposal'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>5. Phiếu Hủy & Thanh Lý</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('printer_hub')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'printer_hub'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>6. Cấu Hình Máy In</span>
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

          {/* TAB 4: CUNG CẤP & BÀN GIAO TÀI SẢN */}
          {activeTab === 'asset_handover' && (
            <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in">
              <div className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-3.5">
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-indigo-400" />
                    <span>Cấp Phát & Bàn Giao Thiết Bị Tài Sản Nội Bộ Bằng Serial</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Quét Serial thiết bị (Laptop, Máy in, Switch, PC...) để bàn giao quyền sử dụng cho Nhân viên / Phòng ban
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Serial Device */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Chọn Serial Thiết Bị Trong Kho *
                    </label>
                    <select
                      value={handoverSerial}
                      onChange={(e) => {
                        setHandoverSerial(e.target.value);
                        const found = allInventorySerials.find((s) => s.serial === e.target.value);
                        if (found) {
                          setHandoverAssetTag('TS-' + Math.floor(100 + Math.random() * 900));
                        }
                      }}
                      className="w-full h-10 px-3 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="">-- Chọn thiết bị tồn kho sẵn sàng bàn giao --</option>
                      {allInventorySerials.map((s) => (
                        <option key={s.serial} value={s.serial}>
                          {s.serial} — {s.productName} ({formatVND(s.costPrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Asset Tag */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Mã Tài Sản Doanh Nghiệp (Asset Tag)
                    </label>
                    <input
                      type="text"
                      value={handoverAssetTag}
                      onChange={(e) => setHandoverAssetTag(e.target.value)}
                      placeholder="TS-640"
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Custodian Employee */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Nhân Viên Tiếp Nhận / Chịu Trách Nhiệm *
                    </label>
                    <input
                      type="text"
                      value={handoverEmployee}
                      onChange={(e) => setHandoverEmployee(e.target.value)}
                      placeholder="Nguyễn Văn Minh (KTV Trưởng)"
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Phòng Ban / Bộ Phận
                    </label>
                    <select
                      value={handoverDepartment}
                      onChange={(e) => setHandoverDepartment(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Phòng Kỹ Thuật Máy Tính & Mạng">Phòng Kỹ Thuật Máy Tính & Mạng</option>
                      <option value="Phòng Bán Hàng & Thu Ngân POS">Phòng Bán Hàng & Thu Ngân POS</option>
                      <option value="Phòng Kế Toán & Quản Lý Kho">Phòng Kế Toán & Quản Lý Kho</option>
                      <option value="Ban Giám Đốc & Điều Hành">Ban Giám Đốc & Điều Hành</option>
                      <option value="Chi Nhánh 2 - Showroom Laptop">Chi Nhánh 2 - Showroom Laptop</option>
                    </select>
                  </div>

                  {/* Warehouse */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Kho Hiện Tại Đang Bảo Quản
                    </label>
                    <select
                      value={handoverWarehouse}
                      onChange={(e) => setHandoverWarehouse(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Kho Chính Gia Phúc Computer">Kho Chính Gia Phúc Computer</option>
                      <option value="Kho Kỹ Thuật Sửa Chữa">Kho Kỹ Thuật Sửa Chữa</option>
                      <option value="Kho Showroom Trưng Bày">Kho Showroom Trưng Bày</option>
                    </select>
                  </div>

                  {/* Equipment Condition */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Tình Trạng Thiết Bị & Biên Bản
                    </label>
                    <input
                      type="text"
                      value={handoverCondition}
                      onChange={(e) => setHandoverCondition(e.target.value)}
                      placeholder="Mới 100% nguyên hộp / Đầy đủ phụ kiện"
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Bottom Action Buttons (Matching Screenshot 2 - Red Oval Spot) */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                  {/* Print Button (Exact Red Oval in Screenshot 2) */}
                  <button
                    type="button"
                    onClick={() => {
                      const found = allInventorySerials.find((s) => s.serial === handoverSerial) || allInventorySerials[0];
                      setPrintConfig({
                        isOpen: true,
                        docType: 'asset_handover',
                        orderCode: 'BG-' + Math.floor(1000 + Math.random() * 9000),
                        creatorName: 'Bộ phận Quản lý Thiết bị / Thủ kho',
                        warehouseName: handoverWarehouse,
                        customer: {
                          name: handoverEmployee,
                          companyName: handoverDepartment,
                          address: handoverWarehouse,
                          phone: '0988 123 456',
                        },
                        items: [
                          {
                            id: 'item-1',
                            sku: handoverAssetTag,
                            productName: found.productName,
                            unit: found.unit || 'Cái',
                            quantity: 1,
                            actualQuantity: 1,
                            unitPrice: found.costPrice,
                            total: found.costPrice,
                            serialNumber: handoverSerial || found.serial,
                            note: handoverCondition,
                            warranty: '12 Tháng',
                          },
                        ],
                        deliveryNote: `Bàn giao quyền sử dụng tài sản doanh nghiệp ${handoverAssetTag} cho ${handoverEmployee} (${handoverDepartment}). Đơn vị sử dụng có trách nhiệm bảo quản tài sản.`,
                      });
                      sounds.playSuccessChime();
                    }}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
                    title="Mở mẫu in Phiếu Bàn Giao & Cung Cấp Tài Sản A4/A5"
                  >
                    <Printer className="w-4 h-4 text-indigo-400" />
                    <span>In Phiếu Bàn Giao & Cung Cấp Tài Sản</span>
                  </button>

                  {/* Confirm Handover Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSuccessChime();
                      alert(`Đã hoàn tất bàn giao tài sản "${handoverAssetTag}" (Serial: ${handoverSerial}) cho nhân viên ${handoverEmployee} (${handoverDepartment}) thành công!`);
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Bàn Giao Thiết Bị</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PHIẾU HỦY & THANH LÝ */}
          {activeTab === 'stock_disposal' && (
            <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in">
              <div className="bg-slate-950 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Trash2 className="w-5 h-5 text-rose-400" />
                      <span>Lập Phiếu Xuất Hủy / Hao Hụt / Thanh Lý Theo Serial</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Chọn các Serial bị hỏng, lỗi hoặc thanh lý để tự động ghi giảm tồn kho và lập biên bản kiểm toán
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedDisposalSerials.length === allInventorySerials.length) {
                          setSelectedDisposalSerials([]);
                        } else {
                          setSelectedDisposalSerials(allInventorySerials.map((s) => s.serial));
                        }
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 rounded-lg transition"
                    >
                      {selectedDisposalSerials.length === allInventorySerials.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Lý Do Xuất Hủy / Thanh Lý
                    </label>
                    <select
                      value={disposalReason}
                      onChange={(e) => setDisposalReason(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-900 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-semibold focus:border-rose-500 focus:outline-hidden"
                    >
                      <option value="Hết hạn sử dụng / Lỗi thời phần cứng">Hết hạn sử dụng / Lỗi thời phần cứng</option>
                      <option value="Hàng lỗi bo mạch / Vỡ hỏng trong quá trình vận chuyển">Hàng lỗi bo mạch / Vỡ hỏng trong quá trình vận chuyển</option>
                      <option value="Cháy nổ linh kiện / Sét đánh không thể sửa chữa">Cháy nổ linh kiện / Sét đánh không thể sửa chữa</option>
                      <option value="Thanh lý thiết bị cũ phế liệu thu hồi vốn">Thanh lý thiết bị cũ phế liệu thu hồi vốn</option>
                      <option value="Hao hụt chênh lệch sau kiểm kê định kỳ">Hao hụt chênh lệch sau kiểm kê định kỳ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Ghi Chú Chi Tiết Biên Bản
                    </label>
                    <input
                      type="text"
                      value={disposalNotes}
                      onChange={(e) => setDisposalNotes(e.target.value)}
                      placeholder="Hàng lỗi bo mạch / vỡ hỏng trong quá trình vận chuyển"
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Serials Checklist */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Chọn các Serial trong kho cần xuất hủy ({selectedDisposalSerials.length} đã chọn):
                  </label>
                  <div className="bg-slate-900/90 rounded-xl border border-slate-800 max-h-72 overflow-y-auto divide-y divide-slate-800">
                    {allInventorySerials.map((item) => {
                      const isSelected = selectedDisposalSerials.includes(item.serial);
                      return (
                        <div
                          key={item.serial}
                          onClick={() => {
                            setSelectedDisposalSerials((prev) =>
                              isSelected ? prev.filter((s) => s !== item.serial) : [...prev, item.serial]
                            );
                          }}
                          className={`p-3 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-rose-950/30 text-rose-200' : 'hover:bg-slate-850/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent div
                              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                            />
                            <span className="font-mono text-xs font-bold text-white">{item.serial}</span>
                            <span className="text-xs text-slate-400">— {item.productName}</span>
                          </div>

                          <div className="font-mono text-xs font-semibold text-slate-300">
                            {formatVND(item.costPrice)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Buttons (Matching Screenshot 1 - Red Oval Spot) */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                  {/* Button 1: Print Disposal Form (Exact Red Oval in Screenshot 1) */}
                  <button
                    type="button"
                    onClick={() => {
                      const chosenItems = allInventorySerials.filter((s) => selectedDisposalSerials.includes(s.serial));
                      const itemsToPrint = chosenItems.length > 0 ? chosenItems : [allInventorySerials[0]];
                      const totalLoss = itemsToPrint.reduce((acc, curr) => acc + curr.costPrice, 0);

                      setPrintConfig({
                        isOpen: true,
                        docType: 'stock_disposal',
                        orderCode: 'TH-' + Math.floor(1000 + Math.random() * 9000),
                        creatorName: 'Hội đồng Kiểm kê & Tiêu hủy',
                        warehouseName: 'Kho Chính Gia Phúc Computer',
                        customer: {
                          name: 'Hội đồng Tiêu hủy Tài sản GP-ERP',
                          address: 'Phòng Kỹ thuật & Kho lưu trữ',
                        },
                        items: itemsToPrint.map((item, idx) => ({
                          id: `disp-${idx}`,
                          sku: item.sku,
                          productName: item.productName,
                          unit: item.unit || 'Cái',
                          quantity: 1,
                          actualQuantity: 1,
                          unitPrice: item.costPrice,
                          total: item.costPrice,
                          serialNumber: item.serial,
                          note: disposalReason,
                        })),
                        subtotal: totalLoss,
                        total: totalLoss,
                        deliveryNote: `Biên bản tiêu hủy ${itemsToPrint.length} vật tư / thiết bị hư hỏng. Lý do: ${disposalReason}. Ghi chú: ${disposalNotes}`,
                      });
                      sounds.playSuccessChime();
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
                    title="Mở mẫu in Biên bản Tiêu hủy Vật tư & Tài sản A4/A5"
                  >
                    <Printer className="w-4 h-4 text-rose-400" />
                    <span>In Phiếu Hủy Vật Tư & Tài Sản</span>
                  </button>

                  {/* Button 2: Print Liquidation Receipt */}
                  <button
                    type="button"
                    onClick={() => {
                      const chosenItems = allInventorySerials.filter((s) => selectedDisposalSerials.includes(s.serial));
                      const itemsToPrint = chosenItems.length > 0 ? chosenItems : [allInventorySerials[0]];
                      const totalLiq = itemsToPrint.reduce((acc, curr) => acc + Math.round(curr.costPrice * 0.3), 0);

                      setPrintConfig({
                        isOpen: true,
                        docType: 'liquidation_receipt',
                        orderCode: 'TL-' + Math.floor(1000 + Math.random() * 9000),
                        creatorName: 'Kế toán Thanh lý / Thủ quỹ',
                        warehouseName: 'Kho Chính Gia Phúc Computer',
                        customer: {
                          name: 'Công Ty TNHH Thu Mua Phế Liệu & Tái Chế Công Nghệ',
                          phone: '0909 888 999',
                          address: '123 Đường Công Nghệ, TP.HCM',
                        },
                        items: itemsToPrint.map((item, idx) => ({
                          id: `liq-${idx}`,
                          sku: `TL-${item.sku}`,
                          productName: `[Thanh lý] ${item.productName}`,
                          unit: item.unit || 'Cái',
                          quantity: 1,
                          actualQuantity: 1,
                          unitPrice: Math.round(item.costPrice * 0.3),
                          total: Math.round(item.costPrice * 0.3),
                          serialNumber: item.serial,
                          note: 'Thu hồi vốn phế liệu',
                        })),
                        subtotal: totalLiq,
                        total: totalLiq,
                        deliveryNote: `Phiếu thu tiền thanh lý thu hồi vốn ${itemsToPrint.length} vật tư hư hỏng / hết date. Kế toán và thủ quỹ đã kiểm đếm và nhận đủ tiền.`,
                      });
                      sounds.playSuccessChime();
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md active:scale-95"
                    title="Mở mẫu in Phiếu Thu Tiền Thanh Lý Vật Tư / Tài Sản Thu Hồi Vốn"
                  >
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span>Lập & In Phiếu Thu Thanh Lý</span>
                  </button>

                  {/* Button 3: Confirm Stock Disposal */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDisposalSerials.length === 0) {
                        alert('Vui lòng tích chọn ít nhất 1 Serial để thực hiện xuất hủy kho!');
                        return;
                      }
                      sounds.playBarcodeBeep();
                      alert(`Đã lập biên bản và xuất hủy thành công ${selectedDisposalSerials.length} Serial khỏi tồn kho! Tự động cập nhật vào nhật ký kiểm toán.`);
                      setSelectedDisposalSerials([]);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Lập Phiếu Xuất Hủy ({selectedDisposalSerials.length} Serial)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRINTER HUB */}
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
                  </div>
                </div>

                {/* 2. Office Laser Printer */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Máy In Văn Phòng Khổ Lớn (A4 / A5)</h4>
                      <p className="text-[11px] text-slate-400">Canon LBP 2900, HP LaserJet, Brother, Epson</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <p>• Khổ in: <strong>A4 tiêu chuẩn / A5 chứng từ</strong></p>
                    <p>• Định dạng: <strong>Mẫu in chuẩn kế toán / Xuất PDF sắc nét</strong></p>
                  </div>
                </div>
              </div>

              {/* Hardware Toggles */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>Cấu Hình Tự Động & Trải Nghiệm Phần Cứng</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Tự động in bill khi bấm Thanh Toán</div>
                      <div className="text-[10px] text-slate-400">Mở hộp thoại in ngay lập tức không cần bấm nút in</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPrintCheckout}
                      onChange={(e) => {
                        setAutoPrintCheckout(e.target.checked);
                        if (onUpdateSettings) {
                          onUpdateSettings({ ...settings, autoPrintReceipt: e.target.checked });
                        }
                      }}
                      className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Tự động bung Két Tiền (Cash Drawer)</div>
                      <div className="text-[10px] text-slate-400">Gửi xung điện RJ11 mở ngăn kéo đựng tiền khi thanh toán</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={openDrawerOnPay}
                      onChange={(e) => {
                        setOpenDrawerOnPay(e.target.checked);
                        if (onUpdateSettings) {
                          onUpdateSettings({ ...settings, openDrawerOnPayment: e.target.checked });
                        }
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

      {/* Full Integrated Multi-Doc Print Invoice Modal */}
      {printConfig?.isOpen && (
        <PrintInvoiceModal
          isOpen={printConfig.isOpen}
          onClose={() => setPrintConfig(null)}
          initialDocType={printConfig.docType}
          items={printConfig.items}
          customer={printConfig.customer}
          orderCode={printConfig.orderCode}
          deliveryNote={printConfig.deliveryNote}
          creatorName={printConfig.creatorName}
          warehouseName={printConfig.warehouseName}
          subtotal={printConfig.subtotal}
          total={printConfig.total}
          settings={settings}
        />
      )}
    </div>
  );
};
