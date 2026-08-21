import React, { useState, useMemo } from 'react';
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
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { COMMON_UNITS, solveUomChain, getUomEquivalentsSummary } from '../../utils/uomConverter';
import { InboundEInvoiceModal } from '../invoices/InboundEInvoiceModal';
import { StockReceiptPrintModal } from './StockReceiptPrintModal';
import { ProductBarcodeLabelModal } from './ProductBarcodeLabelModal';
import { INITIAL_STORE_SETTINGS } from '../../data/initialData';
import { productsApi } from '../../features/products/api/productsApi';

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
  onRefreshDb?: () => void;
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
  onRefreshDb,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'logs'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeLogs = Array.isArray(inventoryLogs) ? inventoryLogs : [];

  const pendingInboundCount = (inboundInvoices || []).filter((i) => i.status === 'pending_review').length;

  // Product modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

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
      let matchStock = true;
      if (stockFilter === 'low') matchStock = p.stock > 0 && p.stock <= p.minStock;
      if (stockFilter === 'out') matchStock = p.stock <= 0;

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.warehouse && p.warehouse.toLowerCase().includes(q)) ||
        (p.storageLocation && p.storageLocation.toLowerCase().includes(q));

      return matchCat && matchWh && matchStock && matchSearch;
    });
  }, [safeProducts, categoryFilter, warehouseFilter, stockFilter, searchTerm]);

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
          {onRefreshDb && (
            <button
              onClick={onRefreshDb}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer"
              title="Đồng bộ lại danh sách sản phẩm mới nhất từ SQL Server"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Làm mới CSDL</span>
            </button>
          )}
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
            <span>📥 Nhập Kho Từ HĐĐT (Thuế / Gmail)</span>
            {pendingInboundCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black animate-pulse">
                {pendingInboundCount}
              </span>
            )}
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
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Sản Phẩm Mới</span>
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
                    <td colSpan={8} className="py-12 text-center text-slate-500">
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
                  <label className="block text-slate-300 font-semibold mb-1">
                    Danh mục:
                  </label>
                  <select
                    value={formData.category || 'Thiết bị điện tử'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Đơn vị tính (ĐVT):
                  </label>
                  <input
                    type="text"
                    value={formData.unit || 'Cái'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Cái, Hộp, Gói, Kg..."
                  />
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
                  <label className="block text-slate-300 font-semibold mb-1">
                    Kho hàng lưu trữ:
                  </label>
                  <select
                    value={formData.warehouse || settings.defaultWarehouse || 'Kho Chính Gia Phúc Computer'}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
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
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vị trí kệ / dãy / ô:
                  </label>
                  <input
                    type="text"
                    value={formData.storageLocation || ''}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="VD: Kệ A1 - Tầng 1, Tủ C1..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Link hình ảnh sản phẩm (URL):
                  </label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://..."
                  />
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
                        <span>⚡ Tự Động Tính Chuỗi Quy Đổi & Giá</span>
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
                        <span>+ Thêm ĐVT</span>
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
    </div>
  );
};
