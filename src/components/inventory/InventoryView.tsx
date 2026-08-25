import React, { useState, useMemo, useRef } from 'react';
import {
  Layers,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  FileText,
  Filter,
  X,
  History,
  FileCode2,
  RefreshCw,
  Printer,
  Scale,
  Ruler,
  Boxes,
  Calculator,
  ChevronDown,
  Info,
  Barcode,
  QrCode,
  Eye,
  Globe,
  Truck,
  AlertCircle,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  InventoryLog,
  InboundEInvoice,
  AccountingRecord,
  StockGoodsReceipt,
  StoreSettings,
  UOMOption,
  Employee,
  StockTransfer,
  StockTransferItem,
  Order,
  SerialDeviceRecord,
  StockOutboundNote,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { COMMON_UNITS, solveUomChain, getUomEquivalentsSummary } from '../../utils/uomConverter';
import { compressImageFile } from '../../utils/imageCompressor';
import { InboundEInvoiceModal } from '../invoices/InboundEInvoiceModal';
import { StockReceiptPrintModal } from './StockReceiptPrintModal';
import { ProductBarcodeLabelModal } from './ProductBarcodeLabelModal';
import { BarcodeLabelPreviewModal, PrintLabelItem } from '../common/BarcodeLabelPreviewModal';
import { ProductLifecycleModal } from './ProductLifecycleModal';
import { INITIAL_STORE_SETTINGS } from '../../data/initialData';
import { productsApi } from '../../features/products/api/productsApi';
import { QuickAddMasterDataModal, MasterDataType } from '../common/QuickAddMasterDataModal';
import { WebImagePickerModal } from '../common/WebImagePickerModal';
import { StockTransferModal } from './StockTransferModal';
import { BatchBarcodeLabelModal, BatchPrintItem } from './BatchBarcodeLabelModal';
import { OrderOutboundDispatchModal } from './OrderOutboundDispatchModal';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

const LIFECYCLE_STAGE_BADGES: Record<string, { label: string; badge: string }> = {
  new_inbound: { label: 'Nhập Mới', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  in_storage: { label: 'Lưu Kho Chuẩn', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  on_display: { label: 'Đang Bày Bán', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  reserved: { label: 'Đã Giữ Hàng', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  audited: { label: 'Kiểm Kê Đạt', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  under_repair: { label: 'Bảo Hành/Sửa', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  liquidation: { label: 'Thanh Lý/Hủy', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  discontinued: { label: 'Ngừng KD', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
};

interface InventoryViewProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAdjustStock: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  inventoryLogs: InventoryLog[];
  inboundInvoices?: InboundEInvoice[];
  setInboundInvoices?: (invoices: InboundEInvoice[] | ((prev: InboundEInvoice[]) => InboundEInvoice[])) => void;
  setAccountingRecords?: (records: AccountingRecord[] | ((prev: AccountingRecord[]) => AccountingRecord[])) => void;
  settings?: StoreSettings;
  stockReceipts?: StockGoodsReceipt[];
  setStockReceipts?: (receipts: StockGoodsReceipt[] | ((prev: StockGoodsReceipt[]) => StockGoodsReceipt[])) => void;
  transfers?: StockTransfer[];
  onSaveTransfer?: (transfer: StockTransfer) => Promise<void>;
  onUpdateTransferStatus?: (
    id: string,
    payload: { status: string; receiverName?: string; notes?: string }
  ) => Promise<void>;
  onDeleteTransfer?: (id: string) => Promise<void>;
  onRefreshDb?: () => void;
  onOpenDocOcrScanner?: (mode?: 'stock_in') => void;
  onSavePartner?: (partner: any) => void | Promise<void>;
  onSaveEmployee?: (employee: Employee) => void | Promise<void>;
  orders?: Order[];
  onSaveOrder?: (order: Order) => void;
  serialRecords?: SerialDeviceRecord[];
  setSerialRecords?: (records: SerialDeviceRecord[] | ((prev: SerialDeviceRecord[]) => SerialDeviceRecord[])) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Gạo & Nông Sản',
  'Sữa & Sản phẩm từ Sữa',
  'Mì & Thực phẩm ăn liền',
  'Gia vị & Dầu ăn',
  'Nước giải khát & Bia',
  'Điện tử & Cáp điện',
  'Dược phẩm & Y tế',
  'Gia dụng & Đời sống',
  'Thời trang & Phụ kiện',
];

const COMMON_UOM_CHIPS = ['Cái', 'Hộp', 'Bộ', 'Thùng', 'Cuộn', 'Mét', 'Kg', 'Gói', 'Lốc', 'Cây', 'Chai', 'Vỉ', 'Bao', 'Lon'];

const COMMON_LOCATION_CHIPS = [
  'Kệ A1 - Tầng 1',
  'Kệ A2 - Tầng 2',
  'Kệ B1 - Tầng 1',
  'Dãy B - Tầng 3',
  'Tủ C1 (Linh kiện)',
  'Kệ Trưng Bày 01',
  'Kho Sau',
];

const PRODUCT_IMAGE_PRESETS = [
  { label: '🖥️ Màn hình', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80' },
  { label: '💻 Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80' },
  { label: '⚡ SSD/RAM', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80' },
  { label: '🎮 VGA Card', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80' },
  { label: '⌨️ Phím/Chuột', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80' },
  { label: '📷 Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80' },
  { label: '🌾 Nông sản', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { label: '🥤 Giải khát', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
  { label: '📱 Điện thoại', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
  { label: '🎧 Tai nghe', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  products = [],
  onSaveProduct,
  onDeleteProduct,
  onAdjustStock,
  inventoryLogs = [],
  inboundInvoices = [],
  setInboundInvoices = () => {},
  setAccountingRecords = () => {},
  settings = INITIAL_STORE_SETTINGS,
  stockReceipts = [],
  setStockReceipts = () => {},
  transfers = [],
  onSaveTransfer,
  onUpdateTransferStatus,
  onDeleteTransfer,
  onRefreshDb,
  onOpenDocOcrScanner,
  onSavePartner,
  onSaveEmployee,
  orders = [],
  onSaveOrder,
  serialRecords = [],
  setSerialRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'outbound' | 'logs'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [quickAddType, setQuickAddType] = useState<MasterDataType | null>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>(CATEGORIES);
  const [warehouseList, setWarehouseList] = useState<string[]>(
    settings.warehouseList || [
      'Kho Chính Gia Phúc Computer',
      'Kho Kỹ Thuật & Showroom',
      'Kho Chi Nhánh TP.HCM',
      'Kho Chi Nhánh Bình Dương',
      'Kho Bảo Hành & Linh Kiện',
    ]
  );
  const [lifecycleStageFilter, setLifecycleStageFilter] = useState<string>('all');
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
  const [previewModalItems, setPreviewModalItems] = useState<PrintLabelItem[]>([]);
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [lifecycleModalProduct, setLifecycleModalProduct] = useState<Product | null>(null);

  // Outbound Dispatch State
  const [selectedDispatchOrder, setSelectedDispatchOrder] = useState<Order | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [printOutboundOrder, setPrintOutboundOrder] = useState<Order | null>(null);
  const [outboundSearchTerm, setOutboundSearchTerm] = useState('');
  const [outboundStatusFilter, setOutboundStatusFilter] = useState<'all' | 'pending' | 'dispatched'>('all');

  // Inter-Branch Transfer & Batch Barcode Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [batchBarcodeData, setBatchBarcodeData] = useState<{
    isOpen: boolean;
    title: string;
    sourceDocCode?: string;
    items: BatchPrintItem[];
  }>({
    isOpen: false,
    title: '',
    items: [],
  });

  const safeProducts = Array.isArray(products) ? products : [];
  const safeLogs = Array.isArray(inventoryLogs) ? inventoryLogs : [];

  const pendingInboundCount = (inboundInvoices || []).filter((i) => i.status === 'pending_review').length;

  // Product modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAddCategoryQuick = () => {
    const name = prompt('Nhập tên Danh mục ngành hàng mới:');
    if (name && name.trim()) {
      const trimmed = name.trim();
      if (!categoriesList.includes(trimmed)) {
        setCategoriesList((prev) => [...prev, trimmed]);
      }
      setFormData((prev) => ({ ...prev, category: trimmed as any }));
    }
  };

  const handleAddWarehouseQuick = () => {
    const name = prompt('Nhập tên Kho lưu trữ mới:');
    if (name && name.trim()) {
      const trimmed = name.trim();
      if (!warehouseList.includes(trimmed)) {
        setWarehouseList((prev) => [...prev, trimmed]);
      }
      setFormData((prev) => ({ ...prev, warehouse: trimmed }));
    }
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Thiết bị điện tử',
    unit: 'Cái',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: '',
    uomConversions: [],
  });

  // Web Image Picker & Computer File Upload Ref
  const [showWebImagePicker, setShowWebImagePicker] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setFormData((prev) => ({ ...prev, image: compressed }));
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
            setFormData((prev) => ({ ...prev, image: compressed }));
          } catch (err) {
            console.error('Error pasting image:', err);
          }
          break;
        }
      }
    }
  };

  // Stock Adjust Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'import' | 'export' | 'audit_adjustment'>('import');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustSelectedUom, setAdjustSelectedUom] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState('Nhập bổ sung hàng mới từ nhà cung cấp');
  const [performedBy, setPerformedBy] = useState('Quản lý kho');

  const filteredProducts = useMemo(() => {
    return safeProducts.filter((p) => {
      if (!p) return false;
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchWh = warehouseFilter === 'all' || (p.warehouse || 'Kho Chính Gia Phúc Computer') === warehouseFilter;
      const matchStage = lifecycleStageFilter === 'all' || (p.lifecycleStage || 'in_storage') === lifecycleStageFilter;
      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.stock > 0 && p.stock <= p.minStock;
      if (stockFilter === 'out') matchStock = p.stock <= 0;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.batchNumber && p.batchNumber.toLowerCase().includes(q)) ||
        (p.warehouse && p.warehouse.toLowerCase().includes(q)) ||
        (p.storageLocation && p.storageLocation.toLowerCase().includes(q));

      return matchCat && matchWh && matchStage && matchStock && matchSearch;
    });
  }, [safeProducts, categoryFilter, warehouseFilter, lifecycleStageFilter, stockFilter, searchTerm]);

  const filteredOutboundOrders = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'cancelled')
      .filter((o) => {
        if (outboundStatusFilter === 'pending') {
          return o.outboundStatus !== 'dispatched';
        }
        if (outboundStatusFilter === 'dispatched') {
          return o.outboundStatus === 'dispatched';
        }
        return true;
      })
      .filter((o) => {
        if (!outboundSearchTerm) return true;
        const q = outboundSearchTerm.toLowerCase().trim();
        return (
          o.code.toLowerCase().includes(q) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
          (o.customer?.phone && o.customer.phone.includes(q)) ||
          o.items.some((it) => it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
        );
      });
  }, [orders, outboundStatusFilter, outboundSearchTerm]);

  const openAddModal = () => {
    const randomSku = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
    const randomBarcode = '893' + Math.floor(100000000 + Math.random() * 900000000);
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: randomSku,
      barcode: String(randomBarcode),
      category: 'Thiết bị điện tử',
      unit: 'Cái',
      costPrice: 100000,
      sellingPrice: 180000,
      stock: 20,
      minStock: 5,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: '',
      uomConversions: [
        {
          unit: 'Cái',
          ratioToBase: 1,
          costPrice: 100000,
          sellingPrice: 180000,
          barcode: String(randomBarcode),
          description: 'Đơn vị cơ bản chuẩn',
        },
      ],
    });
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    // Ensure base unit is included in uomConversions if empty
    const conversions = product.uomConversions && product.uomConversions.length > 0
      ? product.uomConversions
      : [
          {
            unit: product.unit || 'Cái',
            ratioToBase: 1,
            costPrice: product.costPrice || 0,
            sellingPrice: product.sellingPrice || 0,
            barcode: product.barcode,
            description: 'Đơn vị cơ bản',
          },
        ];
    setFormData({
      ...product,
      uomConversions: conversions,
    });
    setShowProductModal(true);
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên sản phẩm trước khi tạo mô tả bằng AI.');
      return;
    }

    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/generate-product-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          category: formData.category,
          price: formData.sellingPrice,
          attributes: `Mã SKU: ${formData.sku}, Đơn vị: ${formData.unit}`,
        }),
      });

      const data = await response.json();
      if (data.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
      }
    } catch (e) {
      console.error('Error generating product description:', e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Preset UOM configurations
  const handleApplyUomPreset = (presetType: 'drink' | 'cable' | 'grain' | 'pharma') => {
    const baseCost = Number(formData.costPrice) || 0;
    const baseSelling = Number(formData.sellingPrice) || 0;

    let conversions: UOMOption[] = [];
    if (presetType === 'cable') {
      // 1 Thùng = 10 Cuộn; 1 Cuộn = 100 Mét; 1 Cuộn = 1.3 Kg; 1 Cuộn = 1300 Gam
      setFormData((prev) => ({ ...prev, unit: 'Mét' }));
      const meterCost = baseCost > 0 ? baseCost : 10000;
      const meterSelling = baseSelling > 0 ? baseSelling : 13500;

      conversions = [
        {
          unit: 'Thùng',
          referenceUnit: 'Cuộn',
          conversionRate: 10,
          ratioToBase: 1000,
          costPrice: meterCost * 1000,
          sellingPrice: meterSelling * 1000,
          description: '1 Thùng = 10 Cuộn = 1.000 Mét = 13 Kg = 13.000 Gam',
        },
        {
          unit: 'Cuộn',
          referenceUnit: 'Mét',
          conversionRate: 100,
          ratioToBase: 100,
          costPrice: meterCost * 100,
          sellingPrice: meterSelling * 100,
          description: '1 Cuộn = 100 Mét = 1.3 Kg = 1.300 Gam',
        },
        {
          unit: 'Kg',
          referenceUnit: 'Gam',
          conversionRate: 1000,
          ratioToBase: 100 / 1.3, // ~76.923 mét cho 1 kg
          costPrice: Math.round(meterCost * (100 / 1.3)),
          sellingPrice: Math.round(meterSelling * (100 / 1.3)),
          description: '1 Kg ≈ 76.92 Mét (1 Cuộn = 1.3 Kg)',
        },
        {
          unit: 'Gam',
          referenceUnit: 'Kg',
          conversionRate: 0.001,
          ratioToBase: 100 / 1300, // ~0.0769 mét cho 1 gam
          costPrice: Math.round(meterCost * (100 / 1300)),
          sellingPrice: Math.round(meterSelling * (100 / 1300)),
          description: '1 Gam ≈ 0.077 Mét (1 Cuộn = 1.300 Gam)',
        },
        {
          unit: 'Mét',
          referenceUnit: 'Mét',
          conversionRate: 1,
          ratioToBase: 1,
          costPrice: meterCost,
          sellingPrice: meterSelling,
          isBase: true,
          description: '1 Mét (ĐVT Cơ bản cắt lẻ)',
        },
      ];
    } else if (presetType === 'drink') {
      setFormData((prev) => ({ ...prev, unit: 'Lon' }));
      const lonCost = baseCost > 0 ? baseCost : 10000;
      const lonSelling = baseSelling > 0 ? baseSelling : 13000;

      conversions = [
        {
          unit: 'Thùng',
          referenceUnit: 'Lốc',
          conversionRate: 4,
          ratioToBase: 24,
          costPrice: lonCost * 24,
          sellingPrice: lonSelling * 24,
          description: '1 Thùng = 4 Lốc = 24 Lon',
        },
        {
          unit: 'Lốc',
          referenceUnit: 'Lon',
          conversionRate: 6,
          ratioToBase: 6,
          costPrice: lonCost * 6,
          sellingPrice: lonSelling * 6,
          description: '1 Lốc = 6 Lon',
        },
        {
          unit: 'Lon',
          referenceUnit: 'Lon',
          conversionRate: 1,
          ratioToBase: 1,
          costPrice: lonCost,
          sellingPrice: lonSelling,
          isBase: true,
          description: '1 Lon (ĐVT cơ bản)',
        },
      ];
    } else if (presetType === 'grain') {
      setFormData((prev) => ({ ...prev, unit: 'Kg' }));
      const kgCost = baseCost > 0 ? baseCost : 20000;
      const kgSelling = baseSelling > 0 ? baseSelling : 26000;

      conversions = [
        {
          unit: 'Bao lớn',
          referenceUnit: 'Túi',
          conversionRate: 10,
          ratioToBase: 50,
          costPrice: kgCost * 50,
          sellingPrice: kgSelling * 50,
          description: '1 Bao lớn = 10 Túi = 50 Kg',
        },
        {
          unit: 'Túi',
          referenceUnit: 'Kg',
          conversionRate: 5,
          ratioToBase: 5,
          costPrice: kgCost * 5,
          sellingPrice: kgSelling * 5,
          description: '1 Túi = 5 Kg đóng gói',
        },
        {
          unit: 'Kg',
          referenceUnit: 'Kg',
          conversionRate: 1,
          ratioToBase: 1,
          costPrice: kgCost,
          sellingPrice: kgSelling,
          isBase: true,
          description: '1 Kg (ĐVT cơ bản cân lẻ)',
        },
        {
          unit: 'Gam',
          referenceUnit: 'Kg',
          conversionRate: 0.001,
          ratioToBase: 0.001,
          costPrice: Math.round(kgCost * 0.001),
          sellingPrice: Math.round(kgSelling * 0.001),
          description: '1 Gam = 0.001 Kg',
        },
      ];
    } else if (presetType === 'pharma') {
      setFormData((prev) => ({ ...prev, unit: 'Viên' }));
      const vienCost = baseCost > 0 ? baseCost : 2000;
      const vienSelling = baseSelling > 0 ? baseSelling : 3500;

      conversions = [
        {
          unit: 'Thùng',
          referenceUnit: 'Hộp',
          conversionRate: 50,
          ratioToBase: 5000,
          costPrice: vienCost * 5000,
          sellingPrice: vienSelling * 5000,
          description: '1 Thùng = 50 Hộp = 500 Vỉ = 5.000 Viên',
        },
        {
          unit: 'Hộp',
          referenceUnit: 'Vỉ',
          conversionRate: 10,
          ratioToBase: 100,
          costPrice: vienCost * 100,
          sellingPrice: vienSelling * 100,
          description: '1 Hộp = 10 Vỉ = 100 Viên',
        },
        {
          unit: 'Vỉ',
          referenceUnit: 'Viên',
          conversionRate: 10,
          ratioToBase: 10,
          costPrice: vienCost * 10,
          sellingPrice: vienSelling * 10,
          description: '1 Vỉ = 10 Viên',
        },
        {
          unit: 'Viên',
          referenceUnit: 'Viên',
          conversionRate: 1,
          ratioToBase: 1,
          costPrice: vienCost,
          sellingPrice: vienSelling,
          isBase: true,
          description: '1 Viên (ĐVT cơ bản)',
        },
      ];
    }

    setFormData((prev) => ({
      ...prev,
      uomConversions: conversions,
    }));
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    // Ensure base unit exists in uomConversions
    let finalUomList = formData.uomConversions || [];
    const baseUnit = formData.unit || 'Cái';
    const baseCost = Number(formData.costPrice) || 0;
    const baseSelling = Number(formData.sellingPrice) || 0;

    const hasBase = finalUomList.some((u) => u.unit === baseUnit || u.ratioToBase === 1);
    if (!hasBase) {
      finalUomList = [
        {
          unit: baseUnit,
          ratioToBase: 1,
          costPrice: baseCost,
          sellingPrice: baseSelling,
          description: 'Đơn vị cơ bản chuẩn',
        },
        ...finalUomList,
      ];
    }

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
      sku: formData.sku || 'SKU-' + Date.now(),
      barcode: formData.barcode || '893' + Date.now(),
      name: formData.name,
      category: (formData.category as ProductCategory) || 'Điện tử & Cáp điện',
      unit: baseUnit,
      costPrice: baseCost,
      sellingPrice: baseSelling,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 5,
      image:
        formData.image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: formData.description || '',
      warehouse: formData.warehouse || settings.defaultWarehouse,
      storageLocation: formData.storageLocation || '',
      uomConversions: finalUomList,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(productToSave);
    setShowProductModal(false);
  };

  // Handle stock adjust submit with multi-UOM conversion
  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const selectedUom = adjustSelectedUom || adjustingProduct.unit;
    const matchedUom = adjustingProduct.uomConversions?.find((u) => u.unit === selectedUom);
    const ratio = matchedUom?.ratioToBase ?? 1;

    let inputQty = Number(adjustQuantity) || 0;
    const baseQtyConverted = inputQty * ratio;

    let qtyChange = baseQtyConverted;
    if (adjustType === 'export') qtyChange = -Math.abs(baseQtyConverted);

    const oldStock = adjustingProduct.stock;
    const newStock =
      adjustType === 'audit_adjustment'
        ? Number(baseQtyConverted)
        : Math.max(0, oldStock + qtyChange);

    const reasonDetail =
      ratio !== 1
        ? `${adjustReason} [Quy đổi: ${inputQty} ${selectedUom} = ${baseQtyConverted} ${adjustingProduct.unit}]`
        : adjustReason;

    onAdjustStock({
      productId: adjustingProduct.id,
      productName: adjustingProduct.name,
      sku: adjustingProduct.sku,
      type: adjustType,
      quantityChange: adjustType === 'audit_adjustment' ? newStock - oldStock : qtyChange,
      oldStock,
      newStock,
      reason: reasonDetail,
      performedBy,
    });

    setAdjustingProduct(null);
  };

  // Import CSV / Excel file into SQL Server
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingCsv(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('Tệp CSV rỗng hoặc chỉ có dòng tiêu đề.');
          setIsImportingCsv(false);
          return;
        }

        const itemsToImport: any[] = [];
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            const sku = cols[0] || `SKU-${Date.now()}-${i}`;
            const barcode = cols[1] || `893${Date.now().toString().slice(-8)}${i}`;
            const name = cols[2];
            const category = cols[3] || 'Thiết bị điện tử';
            const unit = cols[4] || 'Cái';
            const costPrice = Number(cols[5]) || 0;
            const sellingPrice = Number(cols[6]) || 0;
            const stock = Number(cols[7]) || 0;
            const minStock = Number(cols[8]) || 5;

            if (name) {
              itemsToImport.push({
                sku,
                barcode,
                name,
                category,
                unit,
                costPrice,
                sellingPrice,
                stock,
                minStock,
                warehouse: settings.defaultWarehouse || 'Kho Chính',
                description: `Nhập khẩu hàng loạt từ file ${file.name}`,
              });
            }
          }
        }

        if (itemsToImport.length === 0) {
          alert('Không tìm thấy dòng sản phẩm hợp lệ trong tệp CSV.');
          setIsImportingCsv(false);
          return;
        }

        const res = await productsApi.bulkImport(itemsToImport);
        alert(`🎉 Đã nạp thành công ${res.successCount}/${itemsToImport.length} sản phẩm trực tiếp vào SQL Server!`);
        if (onRefreshDb) {
          onRefreshDb();
        } else {
          const fresh = await productsApi.getProducts({ limit: 1000 });
          if (fresh?.data) {
            fresh.data.forEach((p) => onSaveProduct(p));
          }
        }
      } catch (err: any) {
        alert(`Lỗi khi nhập tệp CSV: ${err.message}`);
      } finally {
        setIsImportingCsv(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã SKU', 'Mã Vạch', 'Tên Sản Phẩm', 'Danh Mục', 'ĐVT', 'Giá Vốn', 'Giá Bán', 'Tồn Kho', 'Cảnh Báo Tối Thiểu'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.costPrice,
      p.sellingPrice,
      p.stock,
      p.minStock,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_san_pham_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalInventoryValue = useMemo(() => {
    return safeProducts.reduce((sum, p) => sum + (p?.costPrice || 0) * (p?.stock || 0), 0);
  }, [safeProducts]);

  const totalRetailValue = useMemo(() => {
    return safeProducts.reduce((sum, p) => sum + (p?.sellingPrice || 0) * (p?.stock || 0), 0);
  }, [safeProducts]);

  const lowStockCount = safeProducts.filter((p) => p && p.stock <= p.minStock).length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportCSV}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Quản Lý Sản Phẩm & Kho Hàng</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Quản lý danh mục, giá vốn, giá bán, nhập xuất tồn và đồng bộ trực tiếp SQL Server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenDocOcrScanner ? onOpenDocOcrScanner('stock_in') : null}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 border border-emerald-400/40 transition-all cursor-pointer active:scale-95"
            title="Quét phiếu nhập kho bằng camera điện thoại & Import Excel (AI Vision)"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Quét Phiếu Nhập Kho (AI)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImportingCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            title="Nhập hàng loạt sản phẩm từ file CSV / Excel"
          >
            <Upload className={`w-4 h-4 text-sky-400 ${isImportingCsv ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isImportingCsv ? 'Đang nạp file...' : 'Nhập Excel/CSV'}</span>
          </button>
          <button
            onClick={() => setShowInboundModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 border border-blue-400/30 transition-all hover:scale-[1.02] active:scale-98"
          >
            <FileCode2 className="w-4 h-4 text-blue-200" />
            <span>Nhập Kho Từ HĐĐT (Thuế / Gmail)</span>
            {pendingInboundCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black animate-pulse">
                {pendingInboundCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/25 border border-teal-400/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            title="Quản lý điều chuyển hàng hóa giữa Kho Tổng và các Cửa hàng chi nhánh"
          >
            <Truck className="w-4 h-4 text-teal-200" />
            <span>Chuyển Kho Nội Bộ ({transfers.length})</span>
          </button>
          <button
            onClick={() => {
              const items: PrintLabelItem[] = filteredProducts.slice(0, 50).map((p) => ({
                id: p.id,
                code: p.barcode || p.sku,
                name: p.name,
                price: p.sellingPrice,
                location: p.storageLocation || p.warehouse,
                unit: p.unit,
                quantity: 1,
              }));
              setPreviewModalItems(items);
              setShowPrintPreviewModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/25 border border-sky-400/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            title="Mở bản xem trước và in tem mã vạch (30x20mm, 50x30mm, Tùy chỉnh)"
          >
            <Eye className="w-4 h-4 text-sky-200" />
            <span>Xem Trước Tem (30x20, 50x30, Tùy Chỉnh)</span>
          </button>
          <button
            onClick={() => {
              setBarcodeModalProduct(null);
              setShowBarcodeModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/25 border border-amber-400/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            title="In tem nhãn mã vạch Barcode và QR Code theo kích thước máy in nhiệt (30x20mm, 35x22mm, 50x30mm...)"
          >
            <Barcode className="w-4 h-4 text-amber-200" />
            <span>In Tem Mã Vạch / QR</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Quick-Add Master Data Interactive Toolbar Banner */}
      <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30 shadow-sm shrink-0">
            ⚡
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Thêm Nhanh Danh Mục Gốc</span>
              <span className="text-[10px] font-mono font-normal text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">Quick-Add Master Data</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tạo nhanh danh mục trực tiếp tại chỗ không cần chuyển trang cài đặt</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setQuickAddType('product')}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>SP Mới</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddType('uom')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1 transition cursor-pointer hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>ĐVT</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddType('partner')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1 transition cursor-pointer hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>NCC / Đối Tác</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddType('location')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1 transition cursor-pointer hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Vị Trí Kệ</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddType('color')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1 transition cursor-pointer hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>Màu Sắc</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddType('department')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1 transition cursor-pointer hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Phòng Ban</span>
          </button>
          <button
            type="button"
            onClick={() => setQuickAddType('employee')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-1 transition cursor-pointer hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Nhân Sự</span>
          </button>
        </div>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tổng mã hàng:</span>
          <div className="text-xl font-bold font-mono text-white">
            {products.length} <span className="text-xs text-slate-400 font-sans">sản phẩm</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tổng giá trị kho (Giá vốn):</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatVND(totalInventoryValue)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Giá trị thương mại (Giá bán):</span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {formatVND(totalRetailValue)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Cảnh báo sắp hết:</span>
          <div className="text-xl font-bold font-mono text-rose-400 flex items-center space-x-1.5">
            <AlertTriangle className="w-5 h-5" />
            <span>{lowStockCount} mã</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Danh Mục Sản Phẩm ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('outbound')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'outbound'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Xuất Kho Đơn Hàng ({orders.filter((o) => o.status !== 'cancelled').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'logs'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch Sử Nhập Xuất ({inventoryLogs.length})</span>
            </button>
          </div>

          {activeTab === 'outbound' && (
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              {/* Search Outbound */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={outboundSearchTerm}
                  onChange={(e) => setOutboundSearchTerm(e.target.value)}
                  placeholder="Tìm mã đơn, khách hàng, Serial..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex space-x-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setOutboundStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    outboundStatusFilter === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setOutboundStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    outboundStatusFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Chờ xuất kho
                </button>
                <button
                  type="button"
                  onClick={() => setOutboundStatusFilter('dispatched')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    outboundStatusFilter === 'dispatched' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Đã xuất kho
                </button>
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tên, SKU, mã vạch..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Warehouse Filter */}
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả kho hàng</option>
                {(settings.warehouseList || [
                  'Kho Chính Gia Phúc Computer',
                  'Kho Kỹ Thuật & Showroom',
                  'Kho Chi Nhánh TP.HCM',
                  'Kho Chi Nhánh Bình Dương',
                  'Kho Bảo Hành & Linh Kiện',
                ]).map((wh) => (
                  <option key={wh} value={wh}>
                    {wh}
                  </option>
                ))}
              </select>

              {/* Stock status filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả tồn kho</option>
                <option value="low">Sắp hết hàng (Low)</option>
                <option value="out">Hết hàng (Out of stock)</option>
              </select>

              {/* Lifecycle Stage filter */}
              <select
                value={lifecycleStageFilter}
                onChange={(e) => setLifecycleStageFilter(e.target.value)}
                className="bg-slate-800 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
              >
                <option value="all">🔄 Tất cả giai đoạn dòng đời</option>
                <option value="new_inbound">📥 1. Nhập Mới</option>
                <option value="in_storage">🏬 2. Lưu Kho Chuẩn</option>
                <option value="on_display">🏪 3. Đang Bày Bán</option>
                <option value="reserved">🔒 4. Đã Giữ Hàng</option>
                <option value="audited">📋 5. Kiểm Kê Đạt</option>
                <option value="under_repair">🔧 6. Bảo Hành/Sửa Chữa</option>
                <option value="liquidation">🏷️ 7. Thanh Lý/Hủy</option>
                <option value="discontinued">🚫 8. Ngừng Kinh Doanh</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Table */}
      {activeTab === 'catalog' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Sản Phẩm</th>
                  <th className="py-3.5 px-4">Danh Mục</th>
                  <th className="py-3.5 px-4">Kho & Vị Trí Kệ</th>
                  <th className="py-3.5 px-4">Dòng Đời & Lô/HSD</th>
                  <th className="py-3.5 px-4">ĐVT</th>
                  <th className="py-3.5 px-4 text-right">Giá Vốn</th>
                  <th className="py-3.5 px-4 text-right">Giá Bán</th>
                  <th className="py-3.5 px-4 text-center">Tồn Kho</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Không tìm thấy sản phẩm nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = p.stock <= p.minStock && p.stock > 0;
                    const isOut = p.stock <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-850/60 transition-colors">
                        {/* Product info & thumb */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-semibold text-slate-200 line-clamp-1">
                                {p.name}
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>SKU: {p.sku}</span>
                                <span>•</span>
                                <span>Vạch: {p.barcode}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-slate-300">{p.category}</td>

                        {/* Warehouse & Storage Location */}
                        <td className="py-3 px-4">
                          <div className="text-[11px] space-y-0.5">
                            <span className="font-semibold text-blue-300 block line-clamp-1">
                              🏬 {p.warehouse || settings.defaultWarehouse || 'Kho Chính Gia Phúc Computer'}
                            </span>
                            {p.storageLocation ? (
                              <span className="text-emerald-400 font-medium block text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                                📍 {p.storageLocation}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[10px]">Chưa gán kệ</span>
                            )}
                          </div>
                        </td>

                        {/* Lifecycle Stage & Lot/Batch */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                LIFECYCLE_STAGE_BADGES[p.lifecycleStage || 'in_storage']?.badge || 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {LIFECYCLE_STAGE_BADGES[p.lifecycleStage || 'in_storage']?.label || 'Lưu Kho Chuẩn'}
                            </span>
                            {p.batchNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Lô: <strong className="text-slate-300">{p.batchNumber}</strong>
                              </div>
                            )}
                            {p.expiryDate && (
                              <div className="text-[10px] text-rose-400 font-mono">
                                HSD: {p.expiryDate}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
                              {p.unit}
                            </span>
                            {p.uomConversions && p.uomConversions.length > 1 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.uomConversions
                                  .filter((u) => u.unit !== p.unit)
                                  .map((u, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.2 rounded"
                                      title={`1 ${u.unit} = ${u.ratioToBase} ${p.unit} | Bán: ${formatVND(u.sellingPrice)}`}
                                    >
                                      {u.unit} (x{u.ratioToBase})
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Cost Price */}
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {formatVND(p.costPrice)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                          {formatVND(p.sellingPrice)}
                        </td>

                        {/* Stock status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              isOut
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : isLow
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Min: {p.minStock}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setLifecycleModalProduct(p);
                                setShowLifecycleModal(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 rounded-lg border border-purple-700/60 transition-colors cursor-pointer"
                              title="Xem & Cập nhật Dòng Đời Sản Phẩm (8 Giai Đoạn, Lô SX, Hạn Dùng, Chuyển Kệ)"
                            >
                              Dòng Đời
                            </button>
                            <button
                              onClick={() => {
                                setAdjustingProduct(p);
                                setAdjustSelectedUom(p.unit);
                                setAdjustQuantity(10);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 transition-colors"
                              title="Nhập / Xuất kho theo đơn vị tính"
                            >
                              Nhập/Xuất
                            </button>
                            <button
                              onClick={() => {
                                setPreviewModalItems([
                                  {
                                    id: p.id,
                                    code: p.barcode || p.sku,
                                    name: p.name,
                                    price: p.sellingPrice,
                                    location: p.storageLocation || p.warehouse,
                                    unit: p.unit,
                                    quantity: Math.max(1, p.stock || 1),
                                  },
                                ]);
                                setShowPrintPreviewModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
                              title="👁️ Xem trước tem nhãn (30x20, 50x30, tùy chỉnh) cho sản phẩm này"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setBarcodeModalProduct(p);
                                setShowBarcodeModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                              title="In tem mã vạch / QR cho sản phẩm này"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                              title="Sửa sản phẩm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa "${p.name}"?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Outbound Orders Dispatch Tab */}
      {activeTab === 'outbound' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Mã Đơn Hàng</th>
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4">Khách Hàng & Nơi Giao</th>
                  <th className="py-3.5 px-4">Sản Phẩm & Tiến Độ Serial</th>
                  <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái Xuất Kho</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOutboundOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Boxes className="w-8 h-8 text-slate-600" />
                        <p className="text-sm font-semibold">Không tìm thấy đơn hàng cần xuất kho</p>
                        <p className="text-xs text-slate-500">
                          Các đơn hàng tạo từ POS, Báo Giá hoặc Bán Hàng sẽ hiển thị tại đây để quét Serial và xuất kho.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOutboundOrders.map((ord) => {
                    const isDispatched = ord.outboundStatus === 'dispatched';
                    const totalQty = ord.items.reduce((s, i) => s + i.quantity, 0);
                    const totalAssignedSerials = ord.items.reduce(
                      (s, i) => s + (i.serials ? i.serials.length : 0),
                      0
                    );

                    return (
                      <tr key={ord.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-indigo-400">{ord.code}</div>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 mt-0.5 inline-block">
                            {ord.channel || 'Tại quầy (POS)'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          <div>{new Date(ord.createdAt).toLocaleDateString('vi-VN')}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200">{ord.customer?.name || 'Khách Lẻ Mua Tại Quầy'}</div>
                          {ord.customer?.phone && (
                            <div className="text-[11px] text-slate-400">{ord.customer.phone}</div>
                          )}
                          {ord.customer?.address && (
                            <div className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{ord.customer.address}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-300 font-medium">
                            {ord.items.length} món ({totalQty} cái)
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {ord.items.map((it, itIdx) => (
                              <span
                                key={itIdx}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                                  it.serials && it.serials.length > 0
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                                title={it.serials && it.serials.length > 0 ? `Serials: ${it.serials.join(', ')}` : 'Chưa gán Serial'}
                              >
                                {it.productName.slice(0, 16)}... ({it.serials ? it.serials.length : 0}/{it.quantity} SN)
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-emerald-400">
                            {formatVND(ord.total)}
                          </span>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {ord.paymentStatus === 'paid' ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isDispatched ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã xuất kho</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Chờ xuất kho</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDispatchOrder(ord);
                                setIsDispatchModalOpen(true);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer ${
                                isDispatched
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                              }`}
                              title="Xuất kho & Quét Serial"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                              <span>{isDispatched ? 'Xem / Sửa Serial' : 'Xuất Kho'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPrintOutboundOrder(ord)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                              title="In Phiếu Xuất Kho Kiêm Bàn Giao"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4">Sản Phẩm</th>
                  <th className="py-3.5 px-4">Loại Nghiệp Vụ</th>
                  <th className="py-3.5 px-4 text-center">Thay Đổi</th>
                  <th className="py-3.5 px-4 text-center">Tồn Trước/Sau</th>
                  <th className="py-3.5 px-4">Lý Do / Diễn Giải</th>
                  <th className="py-3.5 px-4">Người Thực Hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {inventoryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Chưa có nhật ký nhập xuất kho
                    </td>
                  </tr>
                ) : (
                  inventoryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {log.productName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {log.sku}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.type === 'import'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.type === 'export'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : log.type === 'sale_deduct'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}
                        >
                          {log.type === 'import' && 'Nhập kho'}
                          {log.type === 'export' && 'Xuất kho'}
                          {log.type === 'sale_deduct' && 'Bán hàng (POS)'}
                          {log.type === 'audit_adjustment' && 'Điều chỉnh kiểm kê'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            log.quantityChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }
                        >
                          {log.quantityChange > 0
                            ? `+${log.quantityChange}`
                            : log.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {log.oldStock} → <strong>{log.newStock}</strong>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                        {log.reason}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{log.performedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingProduct ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleProductSubmit}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tên sản phẩm (*):
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="VD: Tai nghe Bluetooth True Wireless Pro 2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mã SKU (*):
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mã vạch (Barcode):
                  </label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-xs">Danh mục:</label>
                    <button
                      type="button"
                      onClick={handleAddCategoryQuick}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      title="Thêm danh mục ngành hàng mới"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Danh Mục</span>
                    </button>
                  </div>
                  <select
                    value={formData.category || 'Thiết bị điện tử'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-xs">Đơn vị tính (ĐVT):</label>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('uom')}
                      className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      title="Mở cấu hình thêm ĐVT và tỷ lệ quy đổi"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm ĐVT</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    list="common-uom-datalist"
                    value={formData.unit || 'Cái'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-bold"
                    placeholder="Cái, Hộp, Gói, Kg..."
                  />
                  <datalist id="common-uom-datalist">
                    {COMMON_UOM_CHIPS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>

                  {/* Quick-select chips */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {COMMON_UOM_CHIPS.slice(0, 10).map((uom) => (
                      <button
                        key={uom}
                        type="button"
                        onClick={() => setFormData({ ...formData, unit: uom })}
                        className={`px-1.5 py-0.5 text-[10px] rounded-md border font-semibold transition-all cursor-pointer ${
                          formData.unit === uom
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-xs'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {uom}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giá vốn (COGS):
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giá bán niêm yết (*):
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số lượng tồn kho ban đầu:
                  </label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mức cảnh báo tồn tối thiểu:
                  </label>
                  <input
                    type="number"
                    value={formData.minStock || 5}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-xs">Kho hàng lưu trữ:</label>
                    <button
                      type="button"
                      onClick={handleAddWarehouseQuick}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      title="Thêm kho lưu trữ mới"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Kho</span>
                    </button>
                  </div>
                  <select
                    value={formData.warehouse || settings.defaultWarehouse || 'Kho Chính Gia Phúc Computer'}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    {warehouseList.map((wh) => (
                      <option key={wh} value={wh}>
                        {wh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-xs">Vị trí kệ / dãy / ô:</label>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('location')}
                      className="text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900 border border-sky-700/50 px-2 py-0.5 rounded-lg flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      title="Mở thêm vị trí kệ chuẩn hóa"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Vị Trí</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    list="common-location-datalist"
                    value={formData.storageLocation || ''}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                    placeholder="VD: Kệ A1 - Tầng 1, Tủ C1..."
                  />
                  <datalist id="common-location-datalist">
                    {COMMON_LOCATION_CHIPS.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>

                  {/* Quick-select chips */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {COMMON_LOCATION_CHIPS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setFormData({ ...formData, storageLocation: loc })}
                        className={`px-1.5 py-0.5 text-[9.5px] rounded-md border font-medium transition-all cursor-pointer ${
                          formData.storageLocation === loc
                            ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-xs'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <label className="text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                      <span>Link hình ảnh sản phẩm (URL):</span>
                    </label>

                    {/* Action buttons (Right next to label - Exact Red Oval spot in Screenshot) */}
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
                        title="Tải ảnh từ ổ đĩa máy tính hoặc kéo thả"
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

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-300 hover:text-rose-100 rounded-lg text-[10px] font-semibold flex items-center space-x-0.5 transition-all cursor-pointer"
                          title="Gỡ bỏ hình ảnh hiện tại"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Gỡ ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Image Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {PRODUCT_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                        className={`px-2 py-1 text-[10.5px] rounded-lg border font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                          formData.image === preset.url
                            ? 'bg-blue-600 text-white border-blue-400 shadow-sm font-bold scale-105'
                            : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input Field with Live Image Thumbnail Preview Box & Drag-Drop/Paste Zone */}
                  <div
                    onPaste={handlePasteImage}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const compressed = await compressImageFile(file);
                        setFormData((prev) => ({ ...prev, image: compressed }));
                      }
                    }}
                    className="flex items-center space-x-3"
                  >
                    <div
                      onClick={() => imageFileInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 hover:border-indigo-400 overflow-hidden flex items-center justify-center shrink-0 shadow-inner cursor-pointer group transition-all"
                      title="Bấm để chọn ảnh từ máy tính, kéo thả ảnh hoặc dán Ctrl+V vào đây"
                    >
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                      )}
                    </div>

                    <input
                      type="url"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      onPaste={handlePasteImage}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
                      placeholder="Dán link ảnh (https://...) hoặc bấm Ctrl+V để dán ảnh chụp màn hình..."
                    />
                  </div>
                </div>

                {/* Multi-UOM Conversion Configuration Section */}
                <div className="sm:col-span-2 p-3.5 bg-slate-850 rounded-xl border border-indigo-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-100 flex items-center space-x-1.5 text-xs">
                        <Scale className="w-4 h-4 text-indigo-400" />
                        <span>Cấu hình Đơn Vị Tính Quy Đổi & Bảng Giá Tương Đương (Đa Cấp / Đa Chiều):</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hỗ trợ chuỗi quy đổi linh hoạt (VD: 1 Thùng = 10 Cuộn; 1 Cuộn = 100 Mét = 1.3 Kg = 1.300 Gam). Tự động tính giá và tỷ lệ chuẩn.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const solved = solveUomChain(
                            formData.uomConversions || [],
                            formData.unit || 'Cái',
                            formData.costPrice,
                            formData.sellingPrice
                          );
                          setFormData((prev) => ({
                            ...prev,
                            uomConversions: solved,
                          }));
                        }}
                        className="px-2.5 py-1 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-300 rounded-lg text-[10px] font-bold border border-indigo-700/50 flex items-center space-x-1 transition-all"
                        title="Tính lại toàn bộ chuỗi quy đổi và bảng giá theo tỷ lệ chuẩn"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Tự Động Tính Chuỗi Quy Đổi & Giá</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const baseCost = Number(formData.costPrice) || 0;
                          const baseSelling = Number(formData.sellingPrice) || 0;
                          const current = formData.uomConversions || [];
                          const newUnit = current.length === 0 ? 'Cuộn' : 'ĐVT mới';
                          const refUnit = current.length > 0 ? current[current.length - 1].unit : (formData.unit || 'Cái');
                          
                          const newConversions: UOMOption[] = [
                            ...current,
                            {
                              unit: newUnit,
                              referenceUnit: refUnit,
                              conversionRate: 10,
                              ratioToBase: 10,
                              costPrice: baseCost * 10,
                              sellingPrice: baseSelling * 10,
                              description: `1 ${newUnit} = 10 ${refUnit}`,
                            },
                          ];
                          const solved = solveUomChain(newConversions, formData.unit || 'Cái', baseCost, baseSelling);
                          setFormData((prev) => ({
                            ...prev,
                            uomConversions: solved,
                          }));
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm ĐVT</span>
                      </button>
                    </div>
                  </div>

                  {/* Preset Templates Quick Selector */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-800 text-[11px] flex-wrap gap-y-1">
                    <span className="text-slate-400 font-semibold flex items-center space-x-1">
                      <Boxes className="w-3 h-3 text-slate-400" />
                      <span>Mẫu cấu hình nhanh:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyUomPreset('cable')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] font-semibold border border-slate-700 transition-colors"
                      title="1 Thùng = 10 Cuộn; 1 Cuộn = 100 Mét = 1.3 Kg = 1.300 Gam"
                    >
                      🔌 Cáp / Dây điện (Thùng - Cuộn - Mét - Kg - Gam)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyUomPreset('drink')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-semibold border border-slate-700 transition-colors"
                    >
                      🍺 Nước ngọt / Bia (Thùng - Lốc - Lon)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyUomPreset('grain')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-[10px] font-semibold border border-slate-700 transition-colors"
                    >
                      🌾 Gạo / Nông sản (Bao - Túi - Kg - Gam)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyUomPreset('pharma')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[10px] font-semibold border border-slate-700 transition-colors"
                    >
                      💊 Dược phẩm (Thùng - Hộp - Vỉ - Viên)
                    </button>
                  </div>

                  {/* Suggestions Datalist */}
                  <datalist id="uom-common-list">
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>

                  {/* UOM List Table */}
                  <div className="overflow-x-auto border border-slate-750 rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold">
                          <th className="py-2 px-2.5">Tên ĐVT</th>
                          <th className="py-2 px-2.5">Quy Đổi Chuyển Đổi (1 ĐVT = X ĐVT Chuyển)</th>
                          <th className="py-2 px-2.5">Quy Đổi Chuẩn</th>
                          <th className="py-2 px-2.5">Giá Vốn (đ)</th>
                          <th className="py-2 px-2.5">Giá Bán (đ)</th>
                          <th className="py-2 px-2.5">Diễn Giải / Quy Cách</th>
                          <th className="py-2 px-2 text-center w-10">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                        {(!formData.uomConversions || formData.uomConversions.length === 0) ? (
                          <tr>
                            <td colSpan={7} className="py-3 text-center text-slate-500 italic">
                              Chưa cấu hình ĐVT phụ. Nhấn "+ Thêm ĐVT" hoặc chọn "Mẫu nhanh" ở trên.
                            </td>
                          </tr>
                        ) : (
                          formData.uomConversions.map((uom, uIdx) => {
                            const otherUnits = (formData.uomConversions || [])
                              .map((x) => x.unit)
                              .filter((u) => u && u !== uom.unit);
                            const availableRefs = Array.from(
                              new Set([formData.unit || 'Cái', ...otherUnits, ...COMMON_UNITS])
                            );

                            return (
                              <tr key={uIdx} className="hover:bg-slate-800/40">
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    list="uom-common-list"
                                    value={uom.unit}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const updated = (formData.uomConversions || []).map((u, i) =>
                                        i === uIdx ? { ...u, unit: val } : u
                                      );
                                      const solved = solveUomChain(
                                        updated,
                                        formData.unit || 'Cái',
                                        formData.costPrice,
                                        formData.sellingPrice
                                      );
                                      setFormData((prev) => ({
                                        ...prev,
                                        uomConversions: solved,
                                      }));
                                    }}
                                    className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-white font-bold focus:outline-none focus:border-indigo-400"
                                    placeholder="Thùng, Cuộn..."
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-slate-500 font-mono text-[10px] whitespace-nowrap">
                                      1 {uom.unit || 'ĐVT'} =
                                    </span>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0.000001"
                                      value={uom.conversionRate ?? uom.ratioToBase}
                                      onChange={(e) => {
                                        const rate = Number(e.target.value) || 1;
                                        const updated = (formData.uomConversions || []).map((u, i) =>
                                          i === uIdx ? { ...u, conversionRate: rate } : u
                                        );
                                        const solved = solveUomChain(
                                          updated,
                                          formData.unit || 'Cái',
                                          formData.costPrice,
                                          formData.sellingPrice
                                        );
                                        setFormData((prev) => ({
                                          ...prev,
                                          uomConversions: solved,
                                        }));
                                      }}
                                      className="w-16 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-white font-mono font-bold text-center focus:outline-none focus:border-indigo-400"
                                    />
                                    <select
                                      value={uom.referenceUnit || formData.unit || 'Cái'}
                                      onChange={(e) => {
                                        const ref = e.target.value;
                                        const updated = (formData.uomConversions || []).map((u, i) =>
                                          i === uIdx ? { ...u, referenceUnit: ref } : u
                                        );
                                        const solved = solveUomChain(
                                          updated,
                                          formData.unit || 'Cái',
                                          formData.costPrice,
                                          formData.sellingPrice
                                        );
                                        setFormData((prev) => ({
                                          ...prev,
                                          uomConversions: solved,
                                        }));
                                      }}
                                      className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 text-[11px]"
                                    >
                                      <option value={formData.unit || 'Cái'}>
                                        {formData.unit || 'Cái'} (Cơ bản)
                                      </option>
                                      {availableRefs
                                        .filter((r) => r !== formData.unit)
                                        .map((ref) => (
                                          <option key={ref} value={ref}>
                                            {ref}
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                </td>
                                <td className="py-1.5 px-2">
                                  <div className="flex items-center space-x-1">
                                    <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono font-bold text-[10px] whitespace-nowrap">
                                      = {Number(uom.ratioToBase.toFixed(5))} {formData.unit || 'Cái'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="number"
                                    value={uom.costPrice}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setFormData((prev) => ({
                                        ...prev,
                                        uomConversions: prev.uomConversions?.map((u, i) =>
                                          i === uIdx ? { ...u, costPrice: val } : u
                                        ),
                                      }));
                                    }}
                                    className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-300 font-mono focus:outline-none focus:border-indigo-400 text-right"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="number"
                                    value={uom.sellingPrice}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setFormData((prev) => ({
                                        ...prev,
                                        uomConversions: prev.uomConversions?.map((u, i) =>
                                          i === uIdx ? { ...u, sellingPrice: val } : u
                                        ),
                                      }));
                                    }}
                                    className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500 text-right"
                                  />
                                </td>
                                <td className="py-1.5 px-2">
                                  <input
                                    type="text"
                                    value={uom.description || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        uomConversions: prev.uomConversions?.map((u, i) =>
                                          i === uIdx ? { ...u, description: val } : u
                                        ),
                                      }));
                                    }}
                                    className="w-full min-w-[140px] bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                                    placeholder="Mô tả quy cách..."
                                  />
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        uomConversions: prev.uomConversions?.filter((_, i) => i !== uIdx),
                                      }));
                                    }}
                                    className="text-slate-500 hover:text-rose-400 p-1"
                                    title="Xóa ĐVT này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Description generation block */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold">
                      Mô tả sản phẩm & Điểm bán hàng:
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDescription}
                      disabled={isAiGenerating}
                      className="px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center space-x-1 shadow-sm disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAiGenerating ? 'AI Đang Viết...' : 'Tạo Mô Tả Bằng AI'}</span>
                    </button>
                  </div>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="Nhập mô tả sản phẩm hoặc nhấn 'Tạo Mô Tả Bằng AI'..."
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 bg-slate-900 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow shadow-emerald-500/20"
                >
                  {editingProduct ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                Nhập / Xuất / Kiểm Kê Kho
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="font-semibold text-slate-200">
                  {adjustingProduct.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Mã SKU: {adjustingProduct.sku}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    Tồn hiện tại: {adjustingProduct.stock} {adjustingProduct.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Loại nghiệp vụ:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('import')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      adjustType === 'import'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    + Nhập Kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('export')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      adjustType === 'export'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    - Xuất Kho
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('audit_adjustment')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      adjustType === 'audit_adjustment'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Kiểm Kê
                  </button>
                </div>
              </div>

              {/* Unit selection if product has multiple UOMs */}
              {adjustingProduct.uomConversions && adjustingProduct.uomConversions.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Đơn vị tính thực hiện nhập / xuất:
                  </label>
                  <select
                    value={adjustSelectedUom || adjustingProduct.unit}
                    onChange={(e) => setAdjustSelectedUom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {adjustingProduct.uomConversions.map((uom, idx) => (
                      <option key={idx} value={uom.unit}>
                        {uom.unit} {uom.ratioToBase !== 1 ? `(1 ${uom.unit} = ${uom.ratioToBase} ${adjustingProduct.unit})` : `(ĐVT cơ bản)`} - {formatVND(uom.costPrice)}/đv
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {adjustType === 'audit_adjustment'
                    ? `Số lượng thực tế sau kiểm kê (${adjustSelectedUom || adjustingProduct.unit}):`
                    : `Số lượng thay đổi (${adjustSelectedUom || adjustingProduct.unit}):`}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  required
                />

                {/* Conversion Preview Box */}
                {(() => {
                  const selUom = adjustSelectedUom || adjustingProduct.unit;
                  const matched = adjustingProduct.uomConversions?.find((u) => u.unit === selUom);
                  const ratio = matched?.ratioToBase ?? 1;
                  const baseQty = (Number(adjustQuantity) || 0) * ratio;
                  const cost = matched?.costPrice || adjustingProduct.costPrice;
                  const totalVal = cost * (Number(adjustQuantity) || 0);

                  const equivalents = matched && adjustingProduct.uomConversions && adjustingProduct.uomConversions.length > 1
                    ? getUomEquivalentsSummary(
                        Number(adjustQuantity) || 0,
                        selUom,
                        adjustingProduct.uomConversions,
                        adjustingProduct.unit
                      )
                    : null;

                  return (
                    <div className="mt-2 p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-800/40 text-[11px] space-y-1">
                      <div className="flex justify-between items-center text-indigo-300">
                        <span className="font-semibold">Quy đổi đơn vị chuẩn:</span>
                        <span className="font-mono font-bold text-white">
                          {adjustQuantity} {selUom} = <span className="text-emerald-400">{baseQty}</span> {adjustingProduct.unit}
                        </span>
                      </div>
                      {equivalents && (
                        <div className="text-[10px] font-mono text-cyan-300 font-medium pt-0.5">
                          {equivalents}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-400 text-[10px]">
                        <span>Đơn giá vốn tương đương:</span>
                        <span className="font-mono text-slate-200">{formatVND(cost)} / {selUom}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300 text-[10px] pt-1 border-t border-indigo-900/40">
                        <span className="font-semibold">Tổng giá trị lô hàng:</span>
                        <span className="font-mono font-bold text-emerald-400">{formatVND(totalVal)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Lý do / Diễn giải:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Người thực hiện:
                </label>
                <input
                  type="text"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow"
                >
                  Xác Nhận Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inbound E-Invoice Modal for Tax/Gmail Ingestion & Stock Conversion */}
      {showInboundModal && (
        <InboundEInvoiceModal
          isOpen={showInboundModal}
          onClose={() => setShowInboundModal(false)}
          inboundInvoices={inboundInvoices}
          setInboundInvoices={setInboundInvoices}
          products={products}
          onSaveProduct={onSaveProduct}
          onAdjustStock={onAdjustStock}
          setAccountingRecords={setAccountingRecords}
          settings={settings}
          stockReceipts={stockReceipts}
          setStockReceipts={setStockReceipts}
        />
      )}

      {/* Product Barcode & QR Code Printable Label Modal */}
      {showBarcodeModal && (
        <ProductBarcodeLabelModal
          isOpen={showBarcodeModal}
          onClose={() => {
            setShowBarcodeModal(false);
            setBarcodeModalProduct(null);
          }}
          products={products}
          initialSelectedProduct={barcodeModalProduct}
          settings={settings}
        />
      )}

      {/* BarcodeLabelPreviewModal - Interactive 30x20, 50x30, Custom Preview & Direct Print */}
      {showPrintPreviewModal && (
        <BarcodeLabelPreviewModal
          isOpen={showPrintPreviewModal}
          onClose={() => {
            setShowPrintPreviewModal(false);
            setPreviewModalItems([]);
          }}
          title="Bản Xem Trước & In Tem Nhãn Mã Vạch (Print Preview)"
          items={previewModalItems}
          defaultPreset={
            settings?.labelPrintSettings?.product?.templateSize && settings.labelPrintSettings.product.templateSize !== 'custom'
              ? (settings.labelPrintSettings.product.templateSize as any)
              : '50x30'
          }
          defaultCodeType={settings?.labelPrintSettings?.product?.codeType || 'barcode'}
          storeName={settings?.brandName || settings?.storeName || 'GIA PHÚC COMPUTER'}
        />
      )}

      {/* Product Lifecycle Modal (8 Stages, Batch/Lot, Expiry, Warehouse Audit) */}
      {showLifecycleModal && lifecycleModalProduct && (
        <ProductLifecycleModal
          isOpen={showLifecycleModal}
          onClose={() => {
            setShowLifecycleModal(false);
            setLifecycleModalProduct(null);
          }}
          product={lifecycleModalProduct}
          onSaveProduct={(updatedProduct) => {
            onSaveProduct(updatedProduct);
            setLifecycleModalProduct(updatedProduct);
          }}
        />
      )}

      {/* Quick-Add Master Data Modal */}
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
              onSaveProduct(item);
            }
          }}
        />
      )}

      {/* Web Image Picker Modal */}
      {showWebImagePicker && (
        <WebImagePickerModal
          isOpen={showWebImagePicker}
          onClose={() => setShowWebImagePicker(false)}
          onSelectImage={(imageUrl) => setFormData((prev) => ({ ...prev, image: imageUrl }))}
          currentImageUrl={formData.image}
        />
      )}

      {/* Inter-Branch Stock Transfer Modal */}
      {showTransferModal && onSaveTransfer && onUpdateTransferStatus && (
        <StockTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          transfers={transfers}
          products={products}
          settings={settings}
          onSaveTransfer={onSaveTransfer}
          onUpdateTransferStatus={onUpdateTransferStatus}
          onDeleteTransfer={onDeleteTransfer}
        />
      )}

      {/* Batch Barcode Label Generator Modal */}
      {batchBarcodeData.isOpen && (
        <BatchBarcodeLabelModal
          isOpen={batchBarcodeData.isOpen}
          onClose={() =>
            setBatchBarcodeData({
              isOpen: false,
              title: '',
              items: [],
            })
          }
          title={batchBarcodeData.title}
          sourceDocCode={batchBarcodeData.sourceDocCode}
          items={batchBarcodeData.items}
          settings={settings}
        />
      )}

      {/* Warehouse Outbound Dispatch & Serial Management Modal */}
      {isDispatchModalOpen && selectedDispatchOrder && (
        <OrderOutboundDispatchModal
          isOpen={isDispatchModalOpen}
          order={selectedDispatchOrder}
          products={products}
          serialRecords={serialRecords}
          onClose={() => {
            setIsDispatchModalOpen(false);
            setSelectedDispatchOrder(null);
          }}
          onConfirmOutbound={(result) => {
            if (result.updatedOrder && onSaveOrder) {
              onSaveOrder(result.updatedOrder);
            }
            if (result.updatedProducts) {
              result.updatedProducts.forEach((p) => onSaveProduct(p));
            }
            if (result.updatedSerialRecords && setSerialRecords) {
              setSerialRecords(result.updatedSerialRecords);
            }
            if (result.inventoryLogs) {
              result.inventoryLogs.forEach((log) => onAdjustStock(log));
            }
          }}
          onPrintDeliveryNote={(ord) => {
            setPrintOutboundOrder(ord);
          }}
          currentUserName={settings.defaultCreatorName || 'Thủ Kho Trưởng'}
        />
      )}

      {/* Print Delivery Note / Outbound Note Modal */}
      {printOutboundOrder && (
        <PrintInvoiceModal
          isOpen={!!printOutboundOrder}
          order={printOutboundOrder}
          initialDocType="delivery_note"
          initialPaperSize="A4"
          settings={settings}
          onClose={() => setPrintOutboundOrder(null)}
        />
      )}
    </div>
  );
};
