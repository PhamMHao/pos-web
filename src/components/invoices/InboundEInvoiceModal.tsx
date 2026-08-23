import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Upload,
  RefreshCw,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  Search,
  Layers,
  Sparkles,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Printer,
  X,
  FileCode2,
  Database,
  Check,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Warehouse,
  MapPin,
  Tag,
  Wand2,
  FolderPlus,
  SlidersHorizontal,
  PackagePlus,
  Edit3,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import {
  InboundEInvoice,
  InboundInvoiceItem,
  Product,
  ProductCategory,
  InventoryLog,
  AccountingRecord,
  StockGoodsReceipt,
  StoreSettings,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import {
  parseVietnameseInvoiceXml,
  matchInboundItemsWithInventory,
} from '../../utils/xmlInvoiceParser';
import {
  SAMPLE_SUPPLIER_XML_FPT,
  SAMPLE_SUPPLIER_XML_DGW,
  SIMULATED_CQT_NEW_INVOICES,
} from '../../data/mockInboundData';
import { inboundInvoicesApi } from '../../features/inbound-invoices/api/inboundInvoicesApi';
import { warehouseApi } from '../../features/warehouse/api/warehouseApi';
import { StockReceiptPrintModal } from '../inventory/StockReceiptPrintModal';
import { BatchBarcodeLabelModal, BatchPrintItem } from '../inventory/BatchBarcodeLabelModal';

interface InboundEInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  inboundInvoices: InboundEInvoice[];
  setInboundInvoices: (invoices: InboundEInvoice[] | ((prev: InboundEInvoice[]) => InboundEInvoice[])) => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onAdjustStock: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  setAccountingRecords: (records: AccountingRecord[] | ((prev: AccountingRecord[]) => AccountingRecord[])) => void;
  settings: StoreSettings;
  stockReceipts: StockGoodsReceipt[];
  setStockReceipts: (receipts: StockGoodsReceipt[] | ((prev: StockGoodsReceipt[]) => StockGoodsReceipt[])) => void;
}

export type SkuGenRule = 'name_abbr' | 'supplier_code' | 'gp_prefix' | 'incremental';

// Heuristic rule to auto-generate SKU
export function generateSkuByRule(
  rule: SkuGenRule,
  productName: string,
  supplierCode?: string,
  category?: string,
  index = 1
): string {
  if (rule === 'supplier_code' && supplierCode && supplierCode.trim()) {
    return supplierCode.trim().toUpperCase();
  }

  if (rule === 'gp_prefix') {
    let catCode = 'SP';
    const c = (category || '').toLowerCase();
    if (c.includes('camera') || c.includes('đầu ghi')) catCode = 'CAM';
    else if (c.includes('mạng') || c.includes('switch') || c.includes('wifi')) catCode = 'NET';
    else if (c.includes('linh kiện') || c.includes('ram') || c.includes('ssd') || c.includes('cpu')) catCode = 'LK';
    else if (c.includes('phụ kiện') || c.includes('chuột') || c.includes('phím')) catCode = 'PK';
    else if (c.includes('văn phòng') || c.includes('máy in')) catCode = 'VP';
    const rand = Math.floor(100 + Math.random() * 900);
    return `GP-${catCode}-${rand}`;
  }

  if (rule === 'incremental') {
    const timestamp = Date.now().toString().slice(-4);
    return `SP-26-${timestamp}${index}`;
  }

  // default 'name_abbr': Take significant letters from name
  const cleanName = productName
    .replace(/[^\w\s\d]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleanName.split(' ').filter(Boolean);
  const prefix = words.slice(0, 3).map((w) => w.slice(0, 4).toUpperCase()).join('-');
  const rand = Math.floor(10 + Math.random() * 90);
  return `${prefix || 'SP'}-${rand}`;
}

// Auto-detect category based on product title
export function guessCategoryFromName(productName: string, existingCategories: string[]): string {
  const name = productName.toLowerCase();
  if (name.includes('camera') || name.includes('dvr') || name.includes('nvr') || name.includes('đầu ghi')) {
    return existingCategories.find((c) => c.includes('Camera') || c.includes('Giám sát')) || 'Điện tử & Cáp điện';
  }
  if (
    name.includes('ram') ||
    name.includes('ssd') ||
    name.includes('hdd') ||
    name.includes('cpu') ||
    name.includes('mainboard') ||
    name.includes('vga') ||
    name.includes('ổ cứng')
  ) {
    return existingCategories.find((c) => c.includes('Linh kiện')) || 'Điện tử & Cáp điện';
  }
  if (
    name.includes('switch') ||
    name.includes('router') ||
    name.includes('wifi') ||
    name.includes('cáp mạng') ||
    name.includes('access point')
  ) {
    return existingCategories.find((c) => c.includes('Mạng')) || 'Điện tử & Cáp điện';
  }
  if (
    name.includes('chuột') ||
    name.includes('phím') ||
    name.includes('tai nghe') ||
    name.includes('mouse') ||
    name.includes('keyboard') ||
    name.includes('pad')
  ) {
    return existingCategories.find((c) => c.includes('Phụ kiện')) || 'Thời trang & Phụ kiện';
  }
  if (name.includes('máy in') || name.includes('mực') || name.includes('toner') || name.includes('giấy in')) {
    return existingCategories.find((c) => c.includes('Văn phòng')) || 'Gia dụng & Đời sống';
  }
  return existingCategories[0] || 'Điện tử & Cáp điện';
}

// Auto-detect storage shelf/bin based on category
export function guessLocationForCategory(category: string, availableLocations: string[]): string {
  const cat = category.toLowerCase();
  if (cat.includes('camera') || cat.includes('đầu ghi')) {
    return availableLocations.find((l) => l.includes('Camera') || l.includes('A1')) || availableLocations[0] || 'Kệ A1 - Tầng 1';
  }
  if (cat.includes('linh kiện') || cat.includes('ram') || cat.includes('ssd')) {
    return availableLocations.find((l) => l.includes('SSD') || l.includes('RAM') || l.includes('A2') || l.includes('B2')) || availableLocations[0] || 'Kệ A2 - Tầng 2';
  }
  if (cat.includes('mạng') || cat.includes('switch')) {
    return availableLocations.find((l) => l.includes('Switch') || l.includes('Mạng') || l.includes('B1')) || availableLocations[0] || 'Kệ B1 - Tầng 1';
  }
  if (cat.includes('phụ kiện') || cat.includes('dây')) {
    return availableLocations.find((l) => l.includes('Phụ kiện') || l.includes('C1')) || availableLocations[0] || 'Tủ C1 - Ngăn 01';
  }
  return availableLocations[0] || 'Khu Vực Hàng Mới Nhập';
}

export const InboundEInvoiceModal: React.FC<InboundEInvoiceModalProps> = ({
  isOpen,
  onClose,
  inboundInvoices,
  setInboundInvoices,
  products,
  onSaveProduct,
  onAdjustStock,
  setAccountingRecords,
  settings,
  stockReceipts,
  setStockReceipts,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'sync' | 'upload'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<InboundEInvoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'imported_to_stock'>('all');

  // Dynamic Lists for Warehouses, Storage Locations, and Categories
  const [warehouseList, setWarehouseList] = useState<string[]>(() => {
    return settings.warehouseList && settings.warehouseList.length > 0
      ? settings.warehouseList
      : [
          'Kho Chính Gia Phúc Computer',
          'Kho Kỹ Thuật & Showroom',
          'Kho Chi Nhánh TP.HCM',
          'Kho Chi Nhánh Bình Dương',
          'Kho Bảo Hành & Linh Kiện',
        ];
  });

  const [storageLocations, setStorageLocations] = useState<string[]>(() => {
    return settings.storageLocations && settings.storageLocations.length > 0
      ? settings.storageLocations
      : [
          'Kệ A1 - Tầng 1 (Đầu ghi & Camera)',
          'Kệ A2 - Tầng 2 (Ổ cứng & SSD)',
          'Kệ B1 - Tầng 1 (Switch & Thiết bị mạng)',
          'Kệ B2 - Tầng 2 (RAM & Linh kiện PC)',
          'Tủ C1 - Ngăn 01 (Dây cáp & Phụ kiện)',
          'Tủ Kỹ Thuật 02 (Đang test / Sửa chữa)',
          'Khu Vực Hàng Mới Nhập (Chờ phân loại)',
        ];
  });

  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    return settings.customCategories && settings.customCategories.length > 0
      ? settings.customCategories
      : [
          'Điện tử & Cáp điện',
          'Thiết bị Camera & Giám sát',
          'Linh kiện Máy tính & Laptop',
          'Thiết bị Mạng & Viễn thông',
          'Phụ kiện Gaming & Văn phòng',
          'Thiết bị Văn phòng & Máy in',
          'Gia dụng & Đời sống',
          'Thời trang & Phụ kiện',
        ];
  });

  // Batch Auto-Creation Settings
  const [batchSkuRule, setBatchSkuRule] = useState<SkuGenRule>('name_abbr');
  const [batchTargetWarehouse, setBatchTargetWarehouse] = useState<string>(
    settings.defaultWarehouse || warehouseList[0] || 'Kho Chính Gia Phúc Computer'
  );
  const [batchDefaultLocation, setBatchDefaultLocation] = useState<string>(
    storageLocations[0] || 'Kệ A1 - Tầng 1'
  );
  const [batchDefaultCategory, setBatchDefaultCategory] = useState<string>(
    categoriesList[0] || 'Điện tử & Cáp điện'
  );
  const [marginProfitPercent, setMarginProfitPercent] = useState<number>(25);

  // Inline Quick Add Modals
  const [showAddWarehouseDialog, setShowAddWarehouseDialog] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState('');

  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Sync state
  const [isSyncingCqt, setIsSyncingCqt] = useState(false);
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [syncProgressStep, setSyncProgressStep] = useState(0);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // XML upload state
  const [xmlInputText, setXmlInputText] = useState('');
  const [xmlUploadFileName, setXmlUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Single Product Create / Edit Modal
  const [editingItem, setEditingItem] = useState<InboundInvoiceItem | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: 'Điện tử & Cáp điện',
    unit: 'Cái',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    warehouse: 'Kho Chính Gia Phúc Computer',
    storageLocation: 'Kệ A1 - Tầng 1',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
    description: '',
  });
  const [itemProfitMargin, setItemProfitMargin] = useState<number>(25);

  // Print Receipt modal
  const [currentPrintReceipt, setCurrentPrintReceipt] = useState<StockGoodsReceipt | null>(null);

  // Batch Barcode Label Print modal
  const [batchBarcodePrint, setBatchBarcodePrint] = useState<{
    isOpen: boolean;
    title: string;
    sourceDocCode?: string;
    items: BatchPrintItem[];
  }>({
    isOpen: false,
    title: '',
    items: [],
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // When invoice selected, auto-run smart matching with current product inventory
  useEffect(() => {
    if (selectedInvoice && selectedInvoice.items) {
      const matched = matchInboundItemsWithInventory(selectedInvoice.items, products);
      setSelectedInvoice((prev) => (prev ? { ...prev, items: matched } : null));
    }
  }, [selectedInvoice?.id, products]);

  if (!isOpen) return null;

  // Filtered invoices
  const filteredInvoices = inboundInvoices.filter((inv) => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.invoiceCode.toLowerCase().includes(q) ||
      inv.seller.name.toLowerCase().includes(q) ||
      inv.seller.taxCode.includes(q);
    return matchStatus && matchSearch;
  });

  // Handle Quick Add New Warehouse
  const handleAddNewWarehouse = () => {
    const trimmed = newWarehouseName.trim();
    if (!trimmed) return;
    if (!warehouseList.includes(trimmed)) {
      setWarehouseList((prev) => [...prev, trimmed]);
      setBatchTargetWarehouse(trimmed);
      showToast(`Đã thêm kho mới: "${trimmed}"`);
    }
    setNewWarehouseName('');
    setShowAddWarehouseDialog(false);
  };

  // Handle Quick Add New Location
  const handleAddNewLocation = () => {
    const trimmed = newLocationName.trim();
    if (!trimmed) return;
    if (!storageLocations.includes(trimmed)) {
      setStorageLocations((prev) => [...prev, trimmed]);
      setBatchDefaultLocation(trimmed);
      showToast(`Đã thêm vị trí lưu kho: "${trimmed}"`);
    }
    setNewLocationName('');
    setShowAddLocationDialog(false);
  };

  // Handle Quick Add New Category
  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (!categoriesList.includes(trimmed)) {
      setCategoriesList((prev) => [...prev, trimmed]);
      setBatchDefaultCategory(trimmed);
      showToast(`Đã thêm nhóm sản phẩm: "${trimmed}"`);
    }
    setNewCategoryName('');
    setShowAddCategoryDialog(false);
  };

  // 1-Click Batch Auto-Generate Products & Link
  const handleBatchAutoGenerateAndMatch = () => {
    if (!selectedInvoice) return;

    const unmatchedItems = selectedInvoice.items.filter((i) => !i.matchedProductId);
    if (unmatchedItems.length === 0) {
      showToast('Tất cả sản phẩm trong hóa đơn này đã được ghép nối hoàn chỉnh!');
      return;
    }

    let createdCount = 0;
    const updatedItems = selectedInvoice.items.map((item, idx) => {
      if (item.matchedProductId) return item;

      // 1. Determine Category
      const autoCat = guessCategoryFromName(item.productName, categoriesList) || batchDefaultCategory;

      // 2. Generate SKU
      const genSku = generateSkuByRule(batchSkuRule, item.productName, item.skuOrCode, autoCat, idx + 1);

      // 3. Generate Barcode
      const genBarcode = `893${Date.now().toString().slice(-9)}${idx}`;

      // 4. Determine Location & Warehouse
      const autoLocation = guessLocationForCategory(autoCat, storageLocations) || batchDefaultLocation;
      const targetWarehouse = batchTargetWarehouse;

      // 5. Calculate Selling Price
      const calculatedSelling = Math.round((item.unitPrice * (1 + marginProfitPercent / 100)) / 1000) * 1000;

      // 6. Create New Product
      const newProd: Product = {
        id: 'prod-' + Date.now() + '-' + idx,
        sku: genSku,
        barcode: genBarcode,
        name: item.productName,
        category: autoCat as ProductCategory,
        unit: item.unit || 'Cái',
        costPrice: item.unitPrice,
        sellingPrice: calculatedSelling,
        stock: 0, // Will be incremented on Goods Receipt execution
        minStock: 5,
        warehouse: targetWarehouse,
        storageLocation: autoLocation,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
        description: `Tự động tạo từ HĐĐT ${selectedInvoice.invoiceCode} (NCC: ${selectedInvoice.seller.name})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveProduct(newProd);
      createdCount++;

      return {
        ...item,
        matchedProductId: newProd.id,
        matchedProductName: newProd.name,
        matchedProductSku: newProd.sku,
        currentStock: 0,
        currentCostPrice: newProd.costPrice,
        assignedWarehouse: targetWarehouse,
        assignedStorageLocation: autoLocation,
        assignedCategory: autoCat,
        suggestedSellingPrice: calculatedSelling,
        status: 'matched' as const,
        isNewProduct: true,
      };
    });

    setSelectedInvoice((prev) => (prev ? { ...prev, items: updatedItems } : null));
    setInboundInvoices((prev) =>
      prev.map((inv) => (inv.id === selectedInvoice.id ? { ...inv, items: updatedItems } : inv))
    );

    showToast(`⚡ Đã tự động tạo và phân loại ${createdCount} mã sản phẩm mới vào ${batchTargetWarehouse}!`);
  };

  // Open Single Product Modal for specific item
  const handleOpenEditProductModal = (item: InboundInvoiceItem) => {
    setEditingItem(item);
    const existingProd = item.matchedProductId ? products.find((p) => p.id === item.matchedProductId) : null;

    const suggestedSelling = Math.round((item.unitPrice * (1 + marginProfitPercent / 100)) / 1000) * 1000;
    const initialCat = existingProd?.category || guessCategoryFromName(item.productName, categoriesList) || batchDefaultCategory;
    const initialLocation = existingProd?.storageLocation || item.assignedStorageLocation || guessLocationForCategory(initialCat, storageLocations);
    const initialWarehouse = existingProd?.warehouse || item.assignedWarehouse || batchTargetWarehouse;

    setProductForm({
      name: existingProd?.name || item.productName,
      sku: existingProd?.sku || item.skuOrCode || generateSkuByRule(batchSkuRule, item.productName, item.skuOrCode, initialCat),
      barcode: existingProd?.barcode || `893${Date.now().toString().slice(-9)}`,
      category: initialCat as ProductCategory,
      unit: existingProd?.unit || item.unit || 'Cái',
      costPrice: item.unitPrice,
      sellingPrice: existingProd?.sellingPrice || suggestedSelling,
      stock: existingProd?.stock || 0,
      minStock: existingProd?.minStock || 5,
      warehouse: initialWarehouse,
      storageLocation: initialLocation,
      image: existingProd?.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
      description: existingProd?.description || `Sản phẩm nhập từ HĐĐT ${selectedInvoice?.invoiceCode} (${selectedInvoice?.seller.name})`,
    });
    setItemProfitMargin(marginProfitPercent);
  };

  // Save Single Product Form
  const handleSaveSingleProductAndMatch = () => {
    if (!editingItem || !productForm.name || !selectedInvoice) return;

    let targetProdId = editingItem.matchedProductId;
    let newOrUpdatedProd: Product;

    if (targetProdId) {
      const existing = products.find((p) => p.id === targetProdId);
      newOrUpdatedProd = {
        ...existing!,
        name: productForm.name,
        sku: productForm.sku || existing!.sku,
        barcode: productForm.barcode || existing!.barcode,
        category: (productForm.category || existing!.category) as ProductCategory,
        unit: productForm.unit || existing!.unit,
        costPrice: productForm.costPrice !== undefined ? productForm.costPrice : existing!.costPrice,
        sellingPrice: productForm.sellingPrice !== undefined ? productForm.sellingPrice : existing!.sellingPrice,
        minStock: productForm.minStock || existing!.minStock || 5,
        warehouse: productForm.warehouse || existing!.warehouse,
        storageLocation: productForm.storageLocation || existing!.storageLocation,
        updatedAt: new Date().toISOString(),
      };
    } else {
      targetProdId = 'prod-' + Date.now();
      newOrUpdatedProd = {
        id: targetProdId,
        sku: productForm.sku || `SP-${Date.now().toString().slice(-6)}`,
        barcode: productForm.barcode || `893${Date.now().toString().slice(-9)}`,
        name: productForm.name,
        category: (productForm.category || 'Điện tử & Cáp điện') as ProductCategory,
        unit: productForm.unit || 'Cái',
        costPrice: productForm.costPrice || 0,
        sellingPrice: productForm.sellingPrice || 0,
        stock: 0,
        minStock: productForm.minStock || 5,
        warehouse: productForm.warehouse || batchTargetWarehouse,
        storageLocation: productForm.storageLocation || batchDefaultLocation,
        image: productForm.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80',
        description: productForm.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    onSaveProduct(newOrUpdatedProd);

    // Update in Invoice State
    setSelectedInvoice((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((it) => {
          if (it.id === editingItem.id) {
            return {
              ...it,
              matchedProductId: newOrUpdatedProd.id,
              matchedProductName: newOrUpdatedProd.name,
              matchedProductSku: newOrUpdatedProd.sku,
              assignedWarehouse: newOrUpdatedProd.warehouse,
              assignedStorageLocation: newOrUpdatedProd.storageLocation,
              assignedCategory: String(newOrUpdatedProd.category),
              currentStock: newOrUpdatedProd.stock,
              currentCostPrice: newOrUpdatedProd.costPrice,
              suggestedSellingPrice: newOrUpdatedProd.sellingPrice,
              status: 'matched',
              isNewProduct: !editingItem.matchedProductId,
            };
          }
          return it;
        }),
      };
    });

    setEditingItem(null);
    showToast(`Đã lưu cấu hình sản phẩm "${newOrUpdatedProd.name}" (${newOrUpdatedProd.sku})!`);
  };

  // Handle Simulated Real-time CQT Sync
  const handleSyncFromCqt = async () => {
    setIsSyncingCqt(true);
    setSyncProgressStep(1);
    setSyncStatusMsg('Đang kết nối Cổng Dịch vụ Thuế Điện Tử (hoadondientu.gdt.gov.vn)...');

    await new Promise((r) => setTimeout(r, 800));
    setSyncProgressStep(2);
    setSyncStatusMsg(`Xác thực Doanh nghiệp MST: ${settings.taxCode || '0318999888'} & Chứng thư số Token CA...`);

    await new Promise((r) => setTimeout(r, 900));
    setSyncProgressStep(3);
    setSyncStatusMsg('Đang quét danh sách Hóa Đơn Điện Tử đầu vào được cấp mã CQT từ ngày 01/08/2026 đến nay...');

    await new Promise((r) => setTimeout(r, 1100));
    setSyncProgressStep(4);
    setSyncStatusMsg('Đang tải tệp dữ liệu XML gốc & xác thực chữ ký số NCC...');

    await new Promise((r) => setTimeout(r, 800));
    setSyncProgressStep(5);
    setSyncStatusMsg('Tự động phân tích bảng kê chi tiết hàng hóa & đối soát mã sản phẩm kho...');

    await new Promise((r) => setTimeout(r, 600));

    // Append new simulated invoice if not existing
    const newInv = SIMULATED_CQT_NEW_INVOICES[0];
    const exists = inboundInvoices.some((i) => i.invoiceCode === newInv.invoiceCode);
    if (!exists) {
      const matchedItems = matchInboundItemsWithInventory(newInv.items, products);
      const readyInv = { ...newInv, items: matchedItems };
      setInboundInvoices((prev) => [readyInv, ...prev]);
      setSelectedInvoice(readyInv);
      showToast(`Đã đồng bộ thành công HĐĐT ${newInv.invoiceCode} từ Tổng Cục Thuế!`);
    } else {
      showToast('Đã đồng bộ xong! Dữ liệu HĐĐT từ CQT đã là mới nhất.');
    }

    setIsSyncingCqt(false);
    setSyncProgressStep(0);
    setSyncStatusMsg('');
    setActiveTab('list');
  };

  // Handle Simulated Gmail Sync
  const handleSyncFromGmail = async () => {
    setIsSyncingGmail(true);
    setSyncProgressStep(1);
    setSyncStatusMsg('Đang kết nối Hộp thư Kế toán hrmgpsoft@gmail.com...');

    await new Promise((r) => setTimeout(r, 700));
    setSyncProgressStep(2);
    setSyncStatusMsg('Tìm kiếm các thư chứa tệp đính kèm Hóa đơn XML / PDF từ Nhà cung cấp...');

    await new Promise((r) => setTimeout(r, 1000));
    setSyncProgressStep(3);
    setSyncStatusMsg('Đã phát hiện 2 thư HĐĐT từ Synnex FPT và Digiworld. Đang bóc tách XML...');

    await new Promise((r) => setTimeout(r, 800));
    setSyncProgressStep(4);
    setSyncStatusMsg('Chuẩn hóa dữ liệu dòng sản phẩm và quy cách đóng gói...');

    await new Promise((r) => setTimeout(r, 600));
    setIsSyncingGmail(false);
    setSyncProgressStep(0);
    setSyncStatusMsg('');
    showToast('Đã quét hộp thư Gmail và cập nhật danh sách HĐĐT đầu vào!');
    setActiveTab('list');
  };

  // Handle XML File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setXmlUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setXmlInputText(content);
        processXmlContent(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  // Process XML String
  const processXmlContent = async (xmlStr: string, fileName = 'uploaded_invoice.xml') => {
    setUploadError(null);
    const parsed = parseVietnameseInvoiceXml(xmlStr, fileName);
    if (!parsed) {
      setUploadError('Không thể đọc cấu trúc tệp XML HĐĐT này. Vui lòng kiểm tra lại tệp theo chuẩn TT78/ND123.');
      return;
    }

    const matchedItems = matchInboundItemsWithInventory(parsed.items, products);
    const readyInvoice: InboundEInvoice = {
      ...parsed,
      items: matchedItems,
    };

    setInboundInvoices((prev) => [readyInvoice, ...prev.filter((i) => i.invoiceCode !== readyInvoice.invoiceCode)]);
    setSelectedInvoice(readyInvoice);
    showToast(`Đã nạp và bóc tách thành công HĐĐT: ${readyInvoice.invoiceCode}!`);
    setActiveTab('list');

    // Lưu trực tiếp HĐĐT đầu vào và các dòng hàng vào SQL Server
    try {
      await inboundInvoicesApi.createInboundInvoice(readyInvoice);
    } catch (err: any) {
      console.warn('API createInboundInvoice warning:', err.message);
    }
  };

  // Manual select match
  const handleAssignProductMatch = (itemId: string, selectedProdId: string) => {
    if (!selectedInvoice) return;
    const targetProd = products.find((p) => p.id === selectedProdId);
    if (!targetProd) return;

    setSelectedInvoice((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((it) => {
          if (it.id === itemId) {
            return {
              ...it,
              matchedProductId: targetProd.id,
              matchedProductName: targetProd.name,
              matchedProductSku: targetProd.sku,
              assignedWarehouse: targetProd.warehouse || batchTargetWarehouse,
              assignedStorageLocation: targetProd.storageLocation || batchDefaultLocation,
              assignedCategory: String(targetProd.category),
              currentStock: targetProd.stock,
              currentCostPrice: targetProd.costPrice,
              suggestedSellingPrice: targetProd.sellingPrice,
              status: 'matched',
              isNewProduct: false,
            };
          }
          return it;
        }),
      };
    });
  };

  // Core Conversion: Convert Inbound Invoice into Goods Receipt & Stock Inbound
  const handleExecuteStockImport = async () => {
    if (!selectedInvoice) return;

    // Check if any items are unhandled
    const unhandled = selectedInvoice.items.filter((i) => !i.matchedProductId);
    if (unhandled.length > 0) {
      const confirmProceed = window.confirm(
        `Hiện có ${unhandled.length} sản phẩm chưa được ghép nối hoặc tạo mã kho. Hệ thống sẽ bỏ qua các dòng chưa khớp này. Bạn có muốn tự động tạo mã & nhóm nhanh cho các dòng này trước khi nhập kho không?`
      );
      if (confirmProceed) {
        handleBatchAutoGenerateAndMatch();
        return;
      }
    }

    const matchedItems = selectedInvoice.items.filter((i) => i.matchedProductId);
    if (matchedItems.length === 0) {
      alert('Không có sản phẩm nào hợp lệ để nhập kho. Vui lòng ghép nối hoặc tạo mã sản phẩm trước.');
      return;
    }

    const receiptCode = `PNK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(stockReceipts.length + 1).padStart(3, '0')}`;
    const warehouseName = batchTargetWarehouse || settings.defaultWarehouse || 'Kho Chính Gia Phúc Computer';
    const creatorName = settings.defaultCreatorName || 'Nguyễn Văn Minh (Thủ Kho)';

    const receiptItems: StockGoodsReceipt['items'] = [];
    let totalQty = 0;
    let totalCost = 0;

    // Process each matched item
    matchedItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.matchedProductId);
      const oldStock = prod ? prod.stock : 0;
      const ratio = item.ratioToBaseUnit || 1;
      const addedQty = item.quantity * ratio;
      const newStock = oldStock + addedQty;
      const oldCost = prod ? prod.costPrice : item.unitPrice;
      const newCost = item.unitPrice; // Update to invoice unit cost
      const itemWarehouse = item.assignedWarehouse || prod?.warehouse || warehouseName;
      const itemLocation = item.assignedStorageLocation || prod?.storageLocation || batchDefaultLocation;
      const itemCategory = item.assignedCategory || String(prod?.category || 'Điện tử & Cáp điện');

      totalQty += addedQty;
      totalCost += item.subtotal;

      receiptItems.push({
        productId: item.matchedProductId!,
        productName: item.matchedProductName || item.productName,
        sku: item.matchedProductSku || item.skuOrCode || 'SKU',
        unit: item.unit,
        quantity: addedQty,
        oldStock,
        newStock,
        oldCostPrice: oldCost,
        newCostPrice: newCost,
        unitCost: item.unitPrice,
        taxRate: item.taxRate,
        totalAmount: item.subtotal,
        warehouse: itemWarehouse,
        storageLocation: itemLocation,
        category: itemCategory,
        notes: `Từ HĐĐT ${selectedInvoice.invoiceCode} (Kho: ${itemWarehouse} - ${itemLocation})`,
      });

      // 1. Adjust Stock & Log
      onAdjustStock({
        productId: item.matchedProductId!,
        productName: item.matchedProductName || item.productName,
        sku: item.matchedProductSku || item.skuOrCode || 'SKU',
        type: 'import',
        quantityChange: addedQty,
        oldStock,
        newStock,
        unitPrice: newCost,
        reason: `Nhập kho tự động từ HĐĐT ${selectedInvoice.invoiceCode} (NCC: ${selectedInvoice.seller.name}) [${itemWarehouse} - ${itemLocation}]`,
        performedBy: creatorName,
      });

      // 2. Update Product Cost Price, Stock & Warehouse Location if changed
      if (prod) {
        onSaveProduct({
          ...prod,
          costPrice: newCost,
          stock: newStock,
          warehouse: itemWarehouse,
          storageLocation: itemLocation,
        });
      }
    });

    // 3. Create Accounting Record (Khoản chi Nhập Hàng)
    const accRecord: AccountingRecord = {
      id: 'acc-' + Date.now(),
      code: 'PC-' + Date.now().toString().slice(-6),
      type: 'expense',
      category: 'Nhập hàng',
      amount: selectedInvoice.totalAmount,
      date: selectedInvoice.issueDate || new Date().toISOString().split('T')[0],
      party: selectedInvoice.seller.name,
      paymentMethod: 'transfer',
      status: 'completed',
      receiptNumber: selectedInvoice.invoiceCode,
      note: `Chi thanh toán tiền hàng nhập kho theo HĐĐT ${selectedInvoice.invoiceCode} (MST: ${selectedInvoice.seller.taxCode})`,
    };

    setAccountingRecords((prev) => [accRecord, ...prev]);

    // 4. Create Stock Goods Receipt
    const newReceipt: StockGoodsReceipt = {
      id: 'receipt-' + Date.now(),
      code: receiptCode,
      date: new Date().toISOString(),
      inboundInvoiceId: selectedInvoice.id,
      inboundInvoiceCode: selectedInvoice.invoiceCode,
      supplierName: selectedInvoice.seller.name,
      supplierTaxCode: selectedInvoice.seller.taxCode,
      warehouseName,
      creatorName,
      receivedBy: creatorName,
      totalItemsCount: receiptItems.length,
      totalQuantity: totalQty,
      totalCostAmount: totalCost,
      totalTaxAmount: selectedInvoice.taxAmount,
      grandTotal: selectedInvoice.totalAmount,
      items: receiptItems,
      paymentStatus: 'paid',
      notes: `Nhập kho tự động từ HĐĐT ${selectedInvoice.invoiceCode} tại ${warehouseName}`,
    };

    setStockReceipts((prev) => [newReceipt, ...prev]);

    // Lưu phiếu nhập kho vào SQL Server DB
    try {
      await warehouseApi.createGoodsReceipt({
        id: newReceipt.id,
        code: newReceipt.code,
        date: newReceipt.date,
        inboundInvoiceId: selectedInvoice.id,
        inboundInvoiceCode: selectedInvoice.invoiceCode,
        supplierName: newReceipt.supplierName,
        supplierTaxCode: newReceipt.supplierTaxCode,
        warehouseName: newReceipt.warehouseName,
        creatorName: newReceipt.creatorName,
        receivedBy: newReceipt.receivedBy,
        totalItemsCount: newReceipt.totalItemsCount,
        totalQuantity: newReceipt.totalQuantity,
        totalCostAmount: newReceipt.totalCostAmount,
        totalTaxAmount: newReceipt.totalTaxAmount,
        grandTotal: newReceipt.grandTotal,
        paymentStatus: newReceipt.paymentStatus,
        notes: newReceipt.notes,
        items: newReceipt.items as any,
      });
    } catch (err: any) {
      console.warn('API createGoodsReceipt warning:', err.message);
    }

    try {
      await inboundInvoicesApi.importToInventory(selectedInvoice.id, {
        targetWarehouse: warehouseName,
        performedBy: creatorName,
      });
    } catch (err: any) {
      console.warn('API importToInventory warning:', err.message);
    }

    // 5. Update Invoice status
    const updatedInv: InboundEInvoice = {
      ...selectedInvoice,
      status: 'imported_to_stock',
      goodsReceiptId: newReceipt.code,
      importedAt: new Date().toISOString(),
      importedBy: creatorName,
      targetWarehouse: warehouseName,
      accountingRecordId: accRecord.code,
    };

    setSelectedInvoice(updatedInv);
    setInboundInvoices((prev) => prev.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv)));

    showToast(`🎉 Nhập kho thành công! Đã tạo Phiếu Nhập Kho: ${receiptCode}`);
    setCurrentPrintReceipt(newReceipt);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-hidden">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2 text-white">
                  <span>Tự Động Lấy Hóa Đơn Điện Tử Đầu Vào & Chuẩn Hóa Nhập Kho</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                    Cơ Quan Thuế • Gmail • XML TT78
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tự động sinh mã SKU, phân nhóm hàng, chọn kho đích và định vị kệ/ô lưu trữ thông minh
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'list'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Danh Sách HĐĐT ({inboundInvoices.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'sync'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCqt || isSyncingGmail ? 'animate-spin text-emerald-300' : ''}`} />
                <span>Đồng Bộ Thuế & Gmail</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nạp Tệp XML</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex overflow-hidden bg-slate-100">
            {/* TAB 1: INVOICE LIST & STANDARDIZATION MATCHING */}
            {activeTab === 'list' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Left Invoice Master List (w-1/3) */}
                <div className="w-80 sm:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
                  {/* Search and Filters */}
                  <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/70">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm số HĐ, MST, tên nhà cung cấp..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          statusFilter === 'all'
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Tất cả ({inboundInvoices.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending_review')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          statusFilter === 'pending_review'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        Chờ nhập kho ({inboundInvoices.filter((i) => i.status === 'pending_review').length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('imported_to_stock')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          statusFilter === 'imported_to_stock'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        Đã nhập ({inboundInvoices.filter((i) => i.status === 'imported_to_stock').length})
                      </button>
                    </div>
                  </div>

                  {/* List items */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredInvoices.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                        <p className="text-xs">Không tìm thấy hóa đơn nào</p>
                      </div>
                    ) : (
                      filteredInvoices.map((inv) => {
                        const isSelected = selectedInvoice?.id === inv.id;
                        const isImported = inv.status === 'imported_to_stock';

                        return (
                          <div
                            key={inv.id}
                            onClick={() => setSelectedInvoice(inv)}
                            className={`p-3.5 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-50/80 border-l-4 border-emerald-600 shadow-sm'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {inv.invoiceCode}
                                </span>
                                {inv.source === 'cqt_portal' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700">
                                    CQT Thuế
                                  </span>
                                )}
                                {inv.source === 'gmail_sync' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700">
                                    Gmail
                                  </span>
                                )}
                                {inv.source === 'xml_upload' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                    XML File
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {inv.issueDate}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                              {inv.seller.name}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-xs">
                              <span className="text-[11px] font-bold text-emerald-700 font-mono">
                                {formatVND(inv.totalAmount)}
                              </span>
                              {isImported ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" />
                                  Đã nhập kho
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Chờ nhập kho
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Workspace: Standardization & Smart Matching Engine */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                  {selectedInvoice ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Top Action Header */}
                      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-sm text-slate-900">
                              HĐĐT Mua Vào: <span className="font-mono text-emerald-700">{selectedInvoice.invoiceCode}</span>
                            </h4>
                            <span className="text-xs font-medium text-slate-600">
                              (NCC: <strong className="text-slate-900">{selectedInvoice.seller.name}</strong>)
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ngày lập: {selectedInvoice.issueDate} • MST NCC: {selectedInvoice.seller.taxCode} • Nguồn: {selectedInvoice.sourceDetail}
                          </p>
                        </div>

                        {/* Import & Actions */}
                        <div className="flex items-center gap-2">
                          {selectedInvoice.status === 'imported_to_stock' ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Đã nhập kho: {selectedInvoice.goodsReceiptId}
                              </span>
                              <button
                                onClick={() => {
                                  const r = stockReceipts.find((rec) => rec.code === selectedInvoice.goodsReceiptId);
                                  if (r) setCurrentPrintReceipt(r);
                                  else {
                                    const fallbackReceipt: StockGoodsReceipt = {
                                      id: 'rec-view',
                                      code: selectedInvoice.goodsReceiptId || 'PNK-AUTO',
                                      date: selectedInvoice.importedAt || new Date().toISOString(),
                                      supplierName: selectedInvoice.seller.name,
                                      supplierTaxCode: selectedInvoice.seller.taxCode,
                                      warehouseName: selectedInvoice.targetWarehouse || settings.defaultWarehouse || 'Kho Chính Gia Phúc Computer',
                                      creatorName: selectedInvoice.importedBy || 'Thủ Kho',
                                      receivedBy: selectedInvoice.importedBy || 'Thủ Kho',
                                      totalItemsCount: selectedInvoice.items.length,
                                      totalQuantity: selectedInvoice.items.reduce((a, b) => a + b.quantity, 0),
                                      totalCostAmount: selectedInvoice.subtotal,
                                      totalTaxAmount: selectedInvoice.taxAmount,
                                      grandTotal: selectedInvoice.totalAmount,
                                      items: selectedInvoice.items.map((it) => ({
                                        productId: it.matchedProductId || 'sp',
                                        productName: it.matchedProductName || it.productName,
                                        sku: it.matchedProductSku || it.skuOrCode || 'SKU',
                                        unit: it.unit,
                                        quantity: it.quantity,
                                        oldStock: 10,
                                        newStock: 10 + it.quantity,
                                        oldCostPrice: it.unitPrice,
                                        newCostPrice: it.unitPrice,
                                        unitCost: itemPriceToNumber(it.unitPrice),
                                        taxRate: it.taxRate,
                                        totalAmount: it.subtotal,
                                        warehouse: it.assignedWarehouse || selectedInvoice.targetWarehouse || 'Kho Chính Gia Phúc Computer',
                                        storageLocation: it.assignedStorageLocation || 'Kệ A1 - Tầng 1',
                                        category: it.assignedCategory || 'Điện tử & Cáp điện',
                                      })),
                                      paymentStatus: 'paid',
                                    };
                                    setCurrentPrintReceipt(fallbackReceipt);
                                  }
                                }}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>In Phiếu Nhập Kho A4</span>
                              </button>

                              <button
                                onClick={() => {
                                  const printItems: BatchPrintItem[] = selectedInvoice.items.map((it) => {
                                    const matched = products.find((p) => p.sku === it.matchedProductSku || p.sku === it.skuOrCode);
                                    return {
                                      productId: matched?.id,
                                      sku: it.matchedProductSku || it.skuOrCode || 'SKU',
                                      productName: it.matchedProductName || it.productName,
                                      unit: it.unit || 'Cái',
                                      sellingPrice: matched?.sellingPrice || itemPriceToNumber(it.unitPrice) * 1.25,
                                      quantity: Math.max(1, it.quantity || 1),
                                    };
                                  });

                                  setBatchBarcodePrint({
                                    isOpen: true,
                                    title: `In Tem Mã Vạch Theo Hóa Đơn / Phiếu Nhập ${selectedInvoice.goodsReceiptId || selectedInvoice.invoiceNumber}`,
                                    sourceDocCode: selectedInvoice.goodsReceiptId || selectedInvoice.invoiceNumber,
                                    items: printItems,
                                  });
                                }}
                                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                title="In toàn bộ tem mã vạch cho các mặt hàng vừa nhập kho"
                              >
                                <span>In Tem Mã Vạch ({selectedInvoice.items.reduce((s, i) => s + (i.quantity || 1), 0)} Tem)</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleExecuteStockImport}
                              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-98"
                            >
                              <Sparkles className="w-4 h-4 text-emerald-200" />
                              <span>Hoàn Tất Nhập Kho (Cộng Tồn & Kế Toán)</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Scrollable Content */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {/* Summary Box */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-[11px] text-slate-500 font-medium">Số lượng mặt hàng</p>
                            <p className="text-base font-extrabold text-slate-900 mt-0.5">
                              {selectedInvoice.items.length} mặt hàng
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-[11px] text-slate-500 font-medium">Tiền hàng chưa VAT</p>
                            <p className="text-base font-extrabold text-slate-900 mt-0.5">
                              {formatVND(selectedInvoice.subtotal)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <p className="text-[11px] text-slate-500 font-medium">Tiền thuế GTGT (VAT)</p>
                            <p className="text-base font-extrabold text-blue-700 mt-0.5">
                              {formatVND(selectedInvoice.taxAmount)} ({selectedInvoice.taxRate}%)
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                            <p className="text-[11px] text-emerald-800 font-bold">Tổng thanh toán HĐ</p>
                            <p className="text-base font-black text-emerald-700 mt-0.5">
                              {formatVND(selectedInvoice.totalAmount)}
                            </p>
                          </div>
                        </div>

                        {/* SMART BATCH AUTO-STANDARDIZATION TOOLBAR */}
                        {selectedInvoice.status !== 'imported_to_stock' && (
                          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-lg border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Wand2 className="w-4 h-4 text-emerald-400" />
                                <h5 className="font-bold text-xs uppercase tracking-wide text-white">
                                  Bộ Công Cụ Tự Động Sinh Mã SKU, Nhóm Hàng, Kho & Vị Trí Lưu Trữ Hàng Loạt
                                </h5>
                              </div>
                              <span className="text-[11px] text-emerald-300 font-mono font-medium">
                                1 Chạm để chuẩn hóa & đồng bộ toàn hệ thống
                              </span>
                            </div>

                            {/* Options Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                              {/* 1. Sku Generation Rule */}
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-emerald-400" />
                                  Quy tắc sinh mã SKU:
                                </label>
                                <select
                                  value={batchSkuRule}
                                  onChange={(e) => setBatchSkuRule(e.target.value as SkuGenRule)}
                                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-400"
                                >
                                  <option value="name_abbr">Tên rút gọn (VD: RAM-8GB-01)</option>
                                  <option value="supplier_code">Theo Mã NCC trên HĐ</option>
                                  <option value="gp_prefix">Tiền tố GP (VD: GP-LK-001)</option>
                                  <option value="incremental">Mã số tăng dần (SP-26-XXXX)</option>
                                </select>
                              </div>

                              {/* 2. Target Warehouse */}
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                    <Warehouse className="w-3 h-3 text-blue-400" />
                                    Kho nhập đích:
                                  </label>
                                  <button
                                    onClick={() => setShowAddWarehouseDialog(true)}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Thêm kho
                                  </button>
                                </div>
                                <select
                                  value={batchTargetWarehouse}
                                  onChange={(e) => setBatchTargetWarehouse(e.target.value)}
                                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-400"
                                >
                                  {warehouseList.map((wh) => (
                                    <option key={wh} value={wh}>
                                      {wh}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 3. Storage Location */}
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-rose-400" />
                                    Vị trí Kệ / Ô mặc định:
                                  </label>
                                  <button
                                    onClick={() => setShowAddLocationDialog(true)}
                                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Thêm vị trí
                                  </button>
                                </div>
                                <select
                                  value={batchDefaultLocation}
                                  onChange={(e) => setBatchDefaultLocation(e.target.value)}
                                  className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg p-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-400"
                                >
                                  {storageLocations.map((loc) => (
                                    <option key={loc} value={loc}>
                                      {loc}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* 4. Margin Profit % */}
                              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-amber-400" />
                                    Tỷ suất lợi nhuận:
                                  </label>
                                  <span className="text-[11px] text-amber-400 font-bold">+{marginProfitPercent}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[15, 20, 25, 30, 40].map((m) => (
                                    <button
                                      key={m}
                                      onClick={() => setMarginProfitPercent(m)}
                                      className={`flex-1 py-1 text-[10px] font-bold rounded ${
                                        marginProfitPercent === m
                                          ? 'bg-amber-500 text-slate-950'
                                          : 'bg-slate-900 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {m}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* 5. Batch Action Button */}
                              <div className="flex items-end">
                                <button
                                  onClick={handleBatchAutoGenerateAndMatch}
                                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-98"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                                  <span>Tự Động Tạo Hàng Loạt</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Matching Engine Title */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Layers className="w-4 h-4 text-blue-600" />
                              <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                                Bảng Chuẩn Hóa & So Khớp Sản Phẩm Với Kho Hàng GP-ERP
                              </h5>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Tự động đối soát tên, SKU, nhóm hàng, kho & vị trí lưu trữ
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                                  <th className="p-3 w-8 text-center">#</th>
                                  <th className="p-3 min-w-[200px]">Hàng Hóa Trên HĐĐT</th>
                                  <th className="p-3 w-20 text-center">ĐVT / SL</th>
                                  <th className="p-3 w-24 text-right">Đơn Giá Nhập</th>
                                  <th className="p-3 min-w-[280px]">Khớp Với Sản Phẩm Trong Kho</th>
                                  <th className="p-3 min-w-[180px]">Kho & Vị Trí Lưu Trữ</th>
                                  <th className="p-3 w-24 text-center">Trạng Thái</th>
                                  <th className="p-3 w-20 text-center">Tùy Chỉnh</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedInvoice.items.map((item, idx) => {
                                  const isMatched = !!item.matchedProductId;
                                  const currentCost = item.currentCostPrice || 0;
                                  const priceDiff = currentCost > 0 ? item.unitPrice - currentCost : 0;
                                  const priceDiffPercent =
                                    currentCost > 0 ? Math.round((priceDiff / currentCost) * 100) : 0;

                                  const assignedWh = item.assignedWarehouse || batchTargetWarehouse;
                                  const assignedLoc = item.assignedStorageLocation || batchDefaultLocation;
                                  const assignedCat = item.assignedCategory || batchDefaultCategory;

                                  return (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                      <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                                      <td className="p-3">
                                        <p className="font-bold text-slate-900">{item.productName}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                          <span>Mã NCC: {item.skuOrCode || '---'}</span>
                                          <span>•</span>
                                          <span>Thành tiền: {formatVND(item.subtotal)}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className="font-bold text-slate-900 text-sm">{item.quantity}</span>
                                        <p className="text-[10px] text-slate-500">{item.unit}</p>
                                      </td>
                                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                                        {formatVND(item.unitPrice)}
                                      </td>
                                      <td className="p-3">
                                        {isMatched ? (
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                              <p className="font-semibold text-slate-900 text-[11px]">
                                                {item.matchedProductName}
                                              </p>
                                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-bold">
                                                {item.matchedProductSku}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-medium">
                                                {assignedCat}
                                              </span>
                                              <span>
                                                Tồn: <strong>{item.currentStock || 0}</strong>
                                              </span>
                                              {item.suggestedSellingPrice && (
                                                <span>
                                                  Giá bán: <strong className="text-emerald-700">{formatVND(item.suggestedSellingPrice)}</strong>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <select
                                              onChange={(e) => handleAssignProductMatch(item.id, e.target.value)}
                                              defaultValue=""
                                              className="text-[11px] p-1.5 bg-white border border-amber-300 rounded-lg text-slate-700 flex-1 focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="" disabled>
                                                -- Chọn mã có sẵn từ kho --
                                              </option>
                                              {products.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                  {p.name} ({p.sku} - Tồn: {p.stock})
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </td>

                                      {/* Warehouse & Location */}
                                      <td className="p-3">
                                        <div className="space-y-1 text-[11px]">
                                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                                            <Warehouse className="w-3 h-3 text-blue-500 shrink-0" />
                                            <span className="line-clamp-1">{assignedWh}</span>
                                          </p>
                                          <p className="text-slate-600 flex items-center gap-1 font-medium">
                                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                            <span className="line-clamp-1 text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                              {assignedLoc}
                                            </span>
                                          </p>
                                        </div>
                                      </td>

                                      {/* Status */}
                                      <td className="p-3 text-center">
                                        {isMatched ? (
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            Đã ghép
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                                            Chờ ghép
                                          </span>
                                        )}
                                      </td>

                                      {/* Actions */}
                                      <td className="p-3 text-center">
                                        <button
                                          onClick={() => handleOpenEditProductModal(item)}
                                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 mx-auto transition-colors ${
                                            isMatched
                                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                          }`}
                                          title="Tùy chỉnh mã, nhóm, kho, vị trí kệ ô"
                                        >
                                          {isMatched ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Raw XML Viewer toggler */}
                        {selectedInvoice.rawXmlContent && (
                          <details className="bg-white rounded-xl border border-slate-200 p-3 text-xs">
                            <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                              <FileCode2 className="w-4 h-4 text-slate-500" />
                              <span>Xem mã XML Hóa Đơn Điện Tử gốc (Chuẩn CQT TT78 / ND123)</span>
                            </summary>
                            <pre className="mt-3 p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-60">
                              {selectedInvoice.rawXmlContent}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-3">
                      <FileText className="w-12 h-12 text-slate-300 stroke-1" />
                      <p className="text-sm font-medium">Chọn một hóa đơn từ danh sách bên trái để đối soát và nhập kho</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SYNC FROM CQT & GMAIL */}
            {activeTab === 'sync' && (
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Cổng Kết Nối Đồng Bộ Hóa Đơn Điện Tử Tự Động
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto">
                    Kết nối trực tiếp tới Cổng Dịch vụ Thuế Điện Tử (CQT) và Hòm thư Doanh nghiệp để tự động thu thập hóa đơn đầu vào, không cần nhập liệu thủ công.
                  </p>
                </div>

                {/* Status progress box during sync */}
                {(isSyncingCqt || isSyncingGmail) && (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                        <div>
                          <p className="font-bold text-sm text-white">
                            {isSyncingCqt ? 'Đang đồng bộ với Cổng Tổng Cục Thuế...' : 'Đang quét hòm thư Gmail...'}
                          </p>
                          <p className="text-xs text-slate-300">{syncStatusMsg}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {syncProgressStep * 20}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${syncProgressStep * 20}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 2 Big Sync Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Tax Authority Portal (CQT) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-blue-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          Chính thức CQT
                        </span>
                      </div>
                      <h4 className="font-black text-base text-slate-900">
                        Cổng Hóa Đơn Điện Tử Tổng Cục Thuế
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tự động tra cứu và lấy toàn bộ HĐĐT có mã CQT mà tất cả các nhà cung cấp trên toàn quốc đã xuất cho MST của GP-ERP (<strong>{settings.taxCode || '0318999888'}</strong>).
                      </p>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                        <p><span className="text-slate-500">MST Tra cứu:</span> <strong>{settings.taxCode || '0318999888'}</strong></p>
                        <p><span className="text-slate-500">Cổng dịch vụ:</span> <span className="font-mono text-blue-600">hoadondientu.gdt.gov.vn</span></p>
                        <p><span className="text-slate-500">Phương thức:</span> API Token Tra Cứu & Chữ Ký Số Token CA</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncFromCqt}
                      disabled={isSyncingCqt || isSyncingGmail}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncingCqt ? 'animate-spin' : ''}`} />
                      <span>{isSyncingCqt ? 'Đang đồng bộ...' : 'Quét & Đồng Bộ Ngay Từ CQT'}</span>
                    </button>
                  </div>

                  {/* Option 2: Gmail Sync */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-red-300 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                          <Mail className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                          Hộp thư Kế toán
                        </span>
                      </div>
                      <h4 className="font-black text-base text-slate-900">
                        Quét Hộp Thư Email Doanh Nghiệp (Gmail)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tự động quét và phân loại các email nhận HĐĐT từ nhà cung cấp (Synnex FPT, Digiworld, Phong Vũ, Viettel, MISA, VNPT...) gửi về <strong>hrmgpsoft@gmail.com</strong>.
                      </p>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                        <p><span className="text-slate-500">Hộp thư nhận:</span> <strong>hrmgpsoft@gmail.com</strong></p>
                        <p><span className="text-slate-500">Định dạng bóc tách:</span> Tệp đính kèm .XML, .PDF, Link Tra Cứu</p>
                        <p><span className="text-slate-500">Bộ lọc thông minh:</span> Tự động lọc thư rác, chỉ nhận hóa đơn hợp lệ</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncFromGmail}
                      disabled={isSyncingCqt || isSyncingGmail}
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{isSyncingGmail ? 'Đang quét Gmail...' : '📬 Quét Hộp Thư Gmail Ngay'}</span>
                    </button>
                  </div>
                </div>

                {/* Workflow Explanation Banner */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
                  <h5 className="font-bold flex items-center gap-2 text-sm text-blue-950">
                    <Info className="w-4 h-4 text-blue-700" />
                    Quy trình xử lý hóa đơn đầu vào tự động chuẩn ERP:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-blue-200">
                      <strong className="text-blue-950 block">1. Thu thập tự động</strong>
                      <span className="text-slate-600">Đồng bộ từ Cổng Thuế hoặc quét tệp đính kèm Gmail.</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-200">
                      <strong className="text-blue-950 block">2. Bóc tách & Chuẩn hóa</strong>
                      <span className="text-slate-600">Phân tích XML chuẩn TT78, trích xuất mã hàng & đơn giá.</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-200">
                      <strong className="text-blue-950 block">3. Sinh mã SKU & Vị trí Kệ</strong>
                      <span className="text-slate-600">Tự động gắn nhóm, kho nhập và định vị kệ/ô lưu kho.</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-200">
                      <strong className="text-blue-950 block">4. Tạo Phiếu Nhập Kho</strong>
                      <span className="text-slate-600">Cộng tồn kho, hạch toán kế toán và in phiếu chuẩn A4.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD XML DIRECTLY */}
            {activeTab === 'upload' && (
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Tải Lên Hoặc Dán Tệp XML Hóa Đơn Điện Tử
                  </h3>
                  <p className="text-xs text-slate-600">
                    Hỗ trợ tệp .XML hóa đơn của mọi nhà cung cấp (MISA, Viettel Sinvoice, VNPT, Fast, BKAV, CyberBill...)
                  </p>
                </div>

                {uploadError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Drag & Drop Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 bg-white text-center space-y-3 transition-colors">
                  <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Kéo thả tệp <span className="text-blue-600 font-mono">.xml</span> vào đây hoặc bấm để chọn tệp
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ tự động bóc tách dữ liệu và đối soát kho hàng ngay</p>
                  </div>
                  <input
                    type="file"
                    accept=".xml,text/xml"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="xml-file-upload-input"
                  />
                  <label
                    htmlFor="xml-file-upload-input"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                  >
                    Chọn Tệp XML Từ Máy Tính
                  </label>
                  {xmlUploadFileName && (
                    <p className="text-xs text-emerald-700 font-mono font-semibold mt-2">
                      Đã chọn: {xmlUploadFileName}
                    </p>
                  )}
                </div>

                {/* Sample XML Buttons for 1-Click Testing */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    💡 Thử nghiệm nhanh với tệp XML mẫu chuẩn Tổng Cục Thuế từ các Nhà Phân Phối Lớn:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setXmlInputText(SAMPLE_SUPPLIER_XML_FPT);
                        processXmlContent(SAMPLE_SUPPLIER_XML_FPT, 'HD_FPT_0008492.xml');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      📦 Nạp XML Nhà PP Synnex FPT (RAM, SSD, Chuột)
                    </button>
                    <button
                      onClick={() => {
                        setXmlInputText(SAMPLE_SUPPLIER_XML_DGW);
                        processXmlContent(SAMPLE_SUPPLIER_XML_DGW, 'HD_DGW_0019482.xml');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      📦 Nạp XML Nhà PP Digiworld (Bàn phím, Tai nghe)
                    </button>
                  </div>
                </div>

                {/* Paste Raw XML Text Area */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Hoặc dán trực tiếp nội dung XML hóa đơn vào đây:
                  </label>
                  <textarea
                    rows={6}
                    value={xmlInputText}
                    onChange={(e) => setXmlInputText(e.target.value)}
                    placeholder="<HDon><DLHDon><TTChung>...</TTChung>...</HDon>"
                    className="w-full p-3 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => processXmlContent(xmlInputText, 'pasted_invoice.xml')}
                      disabled={!xmlInputText.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Bóc Tách & Nhập Vào Hệ Thống
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: SINGLE PRODUCT CREATE / EDIT & LOCATION ASSIGNMENT */}
      {editingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Tùy Chỉnh Mã Sản Phẩm, Nhóm Hàng, Kho & Vị Trí Lưu Kho
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Dòng HĐ: <span className="text-slate-200 font-semibold">{editingItem.productName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Hàng Hóa Chuẩn Hóa *</label>
                <input
                  type="text"
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm chuẩn..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Mã SKU Kho *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newSku = generateSkuByRule(
                          batchSkuRule,
                          productForm.name || editingItem.productName,
                          editingItem.skuOrCode,
                          String(productForm.category)
                        );
                        setProductForm({ ...productForm, sku: newSku });
                      }}
                      className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Sinh mã mới
                    </button>
                  </div>
                  <input
                    type="text"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Mã Vạch Barcode (EAN-13)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newBar = `893${Date.now().toString().slice(-9)}`;
                        setProductForm({ ...productForm, barcode: newBar });
                      }}
                      className="text-[10px] text-blue-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Sinh barcode
                    </button>
                  </div>
                  <input
                    type="text"
                    value={productForm.barcode || ''}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Nhóm / Danh Mục Sản Phẩm</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryDialog(true)}
                      className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> Thêm nhóm
                    </button>
                  </div>
                  <select
                    value={String(productForm.category || categoriesList[0])}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn Vị Tính (ĐVT)</label>
                  <input
                    type="text"
                    value={productForm.unit || 'Cái'}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="Cái, Bộ, Thùng, Hộp..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Warehouse & Storage Location (Kệ / Dãy / Ô) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                      Kho Hàng Lưu Trữ *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddWarehouseDialog(true)}
                      className="text-[10px] text-blue-700 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> Tạo kho mới
                    </button>
                  </div>
                  <select
                    value={productForm.warehouse || batchTargetWarehouse}
                    onChange={(e) => setProductForm({ ...productForm, warehouse: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
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
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      Vị Trí Kệ / Dãy / Ô *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddLocationDialog(true)}
                      className="text-[10px] text-rose-700 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> Tạo vị trí
                    </button>
                  </div>
                  <select
                    value={productForm.storageLocation || batchDefaultLocation}
                    onChange={(e) => setProductForm({ ...productForm, storageLocation: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500"
                  >
                    {storageLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Margin Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Vốn Nhập Từ HĐ (đ)</label>
                  <input
                    type="number"
                    value={productForm.costPrice || 0}
                    onChange={(e) => {
                      const cost = parseFloat(e.target.value) || 0;
                      const sell = Math.round((cost * (1 + itemProfitMargin / 100)) / 1000) * 1000;
                      setProductForm({ ...productForm, costPrice: cost, sellingPrice: sell });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Giá Bán Lẻ Đề Xuất (đ)</label>
                    <div className="flex items-center gap-1">
                      {[15, 20, 25, 30].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setItemProfitMargin(p);
                            const cost = productForm.costPrice || 0;
                            const sell = Math.round((cost * (1 + p / 100)) / 1000) * 1000;
                            setProductForm({ ...productForm, sellingPrice: sell });
                          }}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            itemProfitMargin === p ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border'
                          }`}
                        >
                          +{p}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={productForm.sellingPrice || 0}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-white border border-emerald-400 rounded-xl font-mono font-bold text-emerald-700 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSingleProductAndMatch}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình & Ghép Dòng Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL: ADD NEW WAREHOUSE */}
      {showAddWarehouseDialog && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-blue-600" />
                Tạo Nhanh Kho Hàng Mới
              </h4>
              <button
                onClick={() => setShowAddWarehouseDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Kho Hàng / Chi Nhánh Mới *
              </label>
              <input
                type="text"
                value={newWarehouseName}
                onChange={(e) => setNewWarehouseName(e.target.value)}
                placeholder="VD: Kho Dự Án Tân Uyên, Kho Showroom 02..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewWarehouse();
                }}
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAddWarehouseDialog(false)}
                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewWarehouse}
                disabled={!newWarehouseName.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm"
              >
                Thêm Kho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL: ADD NEW STORAGE LOCATION */}
      {showAddLocationDialog && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                Tạo Vị Trí Kệ / Dãy / Ô Lưu Kho
              </h4>
              <button
                onClick={() => setShowAddLocationDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Vị Trí Kệ / Tủ / Ngăn Lưu Trữ *
              </label>
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="VD: Kệ C3 - Tầng 2, Tủ Kỹ Thuật 05, Ngăn A2..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewLocation();
                }}
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAddLocationDialog(false)}
                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewLocation}
                disabled={!newLocationName.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm"
              >
                Thêm Vị Trí
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL: ADD NEW CATEGORY */}
      {showAddCategoryDialog && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Tạo Nhóm / Phân Loại Sản Phẩm Mới
              </h4>
              <button
                onClick={() => setShowAddCategoryDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Nhóm Sản Phẩm Mới *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="VD: Màn hình máy tính, Thiết bị Smarthome..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewCategory();
                }}
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAddCategoryDialog(false)}
                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm"
              >
                Thêm Nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Receipt Print Modal */}
      {currentPrintReceipt && (
        <StockReceiptPrintModal
          receipt={currentPrintReceipt}
          settings={settings}
          onClose={() => setCurrentPrintReceipt(null)}
        />
      )}

      {/* Batch Barcode Label Print Modal */}
      {batchBarcodePrint.isOpen && (
        <BatchBarcodeLabelModal
          isOpen={batchBarcodePrint.isOpen}
          onClose={() =>
            setBatchBarcodePrint({
              isOpen: false,
              title: '',
              items: [],
            })
          }
          title={batchBarcodePrint.title}
          sourceDocCode={batchBarcodePrint.sourceDocCode}
          items={batchBarcodePrint.items}
          settings={settings}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-80 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};

function itemPriceToNumber(val: any): number {
  if (typeof val === 'number') return val;
  const parsed = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}
