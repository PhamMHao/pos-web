import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Warehouse,
  User,
  Calendar,
  DollarSign,
  FileText,
  Boxes,
  Sparkles,
  ClipboardPaste,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
  PackageCheck,
  HelpCircle,
  Printer,
} from 'lucide-react';
import {
  Product,
  Supplier,
  PurchaseOrder,
  PriceQuote,
  InboundEInvoice,
  StoreSettings,
  StockGoodsReceipt,
  StockGoodsReceiptItem,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface NewStockGoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers?: Supplier[];
  purchaseOrders?: PurchaseOrder[];
  quotes?: PriceQuote[];
  inboundInvoices?: InboundEInvoice[];
  settings?: StoreSettings;
  onSaveReceipt: (receipt: Partial<StockGoodsReceipt>, options?: { printAfterSave?: boolean }) => Promise<void>;
  currentUserName?: string;
}

export const NewStockGoodsReceiptModal: React.FC<NewStockGoodsReceiptModalProps> = ({
  isOpen,
  onClose,
  products = [],
  suppliers = [],
  purchaseOrders = [],
  quotes = [],
  inboundInvoices = [],
  settings,
  onSaveReceipt,
  currentUserName = 'Nguyễn Văn Minh (Thủ Kho)',
}) => {
  // Source reference mode
  const [sourceType, setSourceType] = useState<'po' | 'quote' | 'inbound_invoice' | 'manual'>('manual');
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [selectedInboundInvId, setSelectedInboundInvId] = useState<string>('');
  const [hideCompletedPo, setHideCompletedPo] = useState<boolean>(true);

  // Receipt general info
  const [receiptCode, setReceiptCode] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [warehouseName, setWarehouseName] = useState<string>('Kho Chính Gia Phúc Computer');
  const [receivedBy, setReceivedBy] = useState<string>(currentUserName);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'debt_pending' | 'partial'>('paid');
  const [receiptNotes, setReceiptNotes] = useState<string>('');
  const [printAfterSave, setPrintAfterSave] = useState<boolean>(true);

  // Supplier info
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierTaxCode, setSupplierTaxCode] = useState<string>('');
  const [supplierPhone, setSupplierPhone] = useState<string>('');
  const [supplierAddress, setSupplierAddress] = useState<string>('');

  // Items table
  const [items, setItems] = useState<StockGoodsReceiptItem[]>([]);

  // Product Search / Scanner state
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [showProductSearchResults, setShowProductSearchResults] = useState<boolean>(false);

  // Active Serial Manager panel (index of item currently managing serials)
  const [activeSerialItemIndex, setActiveSerialItemIndex] = useState<number | null>(null);
  const [serialInput, setSerialInput] = useState<string>('');
  const [serialError, setSerialError] = useState<string | null>(null);

  // Bulk Paste & Auto Generate Modals
  const [showPasteModal, setShowPasteModal] = useState<boolean>(false);
  const [pasteText, setPasteText] = useState<string>('');
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState<boolean>(false);
  const [autoGenPrefix, setAutoGenPrefix] = useState<string>('SN-');
  const [autoGenStartNumber, setAutoGenStartNumber] = useState<number>(1);
  const [autoGenDigits, setAutoGenDigits] = useState<number>(4);

  // Expanded extended info row index (accordion)
  const [expandedInfoIndex, setExpandedInfoIndex] = useState<number | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize receipt code and defaults
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const codeDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const randomSuffix = String(Math.floor(100 + Math.random() * 900));
      setReceiptCode(`PNK-${codeDate}-${randomSuffix}`);
      setReceiptDate(now.toISOString().slice(0, 10));
      setWarehouseName(settings?.defaultWarehouse || 'Kho Chính Gia Phúc Computer');
      setReceivedBy(currentUserName);
      setPaymentStatus('paid');
      setReceiptNotes('');
      setSourceType('manual');
      setSelectedPoId('');
      setSelectedQuoteId('');
      setSelectedInboundInvId('');
      setSelectedSupplierId('');
      setSupplierName('');
      setSupplierTaxCode('');
      setSupplierPhone('');
      setSupplierAddress('');
      setActiveSerialItemIndex(null);
      setExpandedInfoIndex(null);

      // Default sample 1 item if empty
      if (products.length > 0) {
        const p = products[0];
        setItems([
          {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            unit: p.unit || 'Cái',
            quantity: 1,
            oldStock: p.stock || 0,
            newStock: (p.stock || 0) + 1,
            oldCostPrice: p.costPrice || 0,
            newCostPrice: p.costPrice || 0,
            unitCost: p.costPrice || 0,
            taxRate: 8,
            totalAmount: p.costPrice ? p.costPrice * 1.08 : 0,
            storageLocation: p.storageLocation || 'Kệ A1 - Tầng 1',
            warehouse: 'Kho Chính Gia Phúc Computer',
            category: typeof p.category === 'string' ? p.category : 'Thiết bị điện tử',
            specifications: p.specifications || '',
            color: p.color || 'Đen',
            brand: p.brand || 'Hikvision',
            warrantyMonths: p.warrantyMonths || 24,
            accessories: p.accessories || 'Adapter, Chuột quang, Ốc vít, Sách HDSD',
            serials: [],
            notes: '',
          },
        ]);
        setActiveSerialItemIndex(0);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, products, settings, currentUserName]);

  // Filter available POs
  const availablePurchaseOrders = useMemo(() => {
    if (!hideCompletedPo) return purchaseOrders;
    return purchaseOrders.filter((po) => po.status !== 'completed' && po.status !== 'cancelled');
  }, [purchaseOrders, hideCompletedPo]);

  // Handle PO selection
  const handleSelectPO = (poId: string) => {
    setSelectedPoId(poId);
    if (!poId) return;

    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    setSupplierName(po.supplierName);
    setSupplierPhone(po.supplierPhone || '');
    setSupplierAddress(po.supplierAddress || '');
    setSupplierTaxCode(po.supplierTaxCode || '');
    if (po.warehouseName) setWarehouseName(po.warehouseName);
    setReceiptNotes(`Nhập kho thực tế từ Đơn đặt hàng ${po.code}`);

    // Map PO items to Receipt Items
    const mappedItems: StockGoodsReceiptItem[] = po.items.map((it) => {
      const matchedProd = products.find((p) => p.id === it.productId || p.sku === it.sku);
      const curStock = matchedProd ? matchedProd.stock : 0;
      const curCost = matchedProd ? matchedProd.costPrice : it.unitPrice;
      const qty = it.quantity || 1;
      const unitCost = it.unitPrice || curCost;
      const taxRate = po.vatRate || 8;
      const totalAmount = qty * unitCost * (1 + taxRate / 100);

      return {
        productId: matchedProd ? matchedProd.id : `prod-${it.sku}`,
        productName: it.productName || (matchedProd ? matchedProd.name : 'Sản phẩm mới'),
        sku: it.sku,
        unit: it.unit || (matchedProd ? matchedProd.unit : 'Cái'),
        quantity: qty,
        oldStock: curStock,
        newStock: curStock + qty,
        oldCostPrice: curCost,
        newCostPrice: unitCost,
        unitCost: unitCost,
        taxRate: taxRate,
        totalAmount: totalAmount,
        storageLocation: matchedProd?.storageLocation || 'Kệ A1 - Tầng 1',
        warehouse: po.warehouseName || 'Kho Chính Gia Phúc Computer',
        category: matchedProd?.category || 'Thiết bị điện tử',
        specifications: matchedProd?.specifications || '',
        color: matchedProd?.color || 'Đen',
        brand: matchedProd?.brand || 'Hikvision',
        warrantyMonths: matchedProd?.warrantyMonths || 24,
        accessories: matchedProd?.accessories || 'Kèm phụ kiện tiêu chuẩn',
        serials: [],
        notes: `Từ PO ${po.code}`,
      };
    });

    setItems(mappedItems);
    if (mappedItems.length > 0) setActiveSerialItemIndex(0);
    sounds.notification();
  };

  // Handle Quote selection
  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    if (!quoteId) return;

    const q = quotes.find((quote) => quote.id === quoteId);
    if (!q) return;

    setSupplierName(q.customerCompany || q.customerName);
    setSupplierPhone(q.customerPhone || '');
    setReceiptNotes(`Nhập kho chuẩn bị hàng cho Báo giá ${q.code} (${q.customerName})`);

    const mappedItems: StockGoodsReceiptItem[] = q.items.map((it) => {
      const matchedProd = products.find((p) => p.sku === it.sku || p.name === it.productName);
      const curStock = matchedProd ? matchedProd.stock : 0;
      const curCost = matchedProd ? matchedProd.costPrice : Math.round(it.unitPrice * 0.75);
      const qty = it.quantity || 1;
      const taxRate = 8;
      const totalAmount = qty * curCost * (1 + taxRate / 100);

      return {
        productId: matchedProd ? matchedProd.id : `prod-${it.sku}`,
        productName: it.productName,
        sku: it.sku,
        unit: it.unit || 'Cái',
        quantity: qty,
        oldStock: curStock,
        newStock: curStock + qty,
        oldCostPrice: curCost,
        newCostPrice: curCost,
        unitCost: curCost,
        taxRate: taxRate,
        totalAmount: totalAmount,
        storageLocation: matchedProd?.storageLocation || 'Kệ A1 - Tầng 1',
        warehouse: 'Kho Chính Gia Phúc Computer',
        category: matchedProd?.category || 'Thiết bị điện tử',
        specifications: matchedProd?.specifications || '',
        color: matchedProd?.color || 'Đen',
        brand: matchedProd?.brand || 'Hikvision',
        warrantyMonths: matchedProd?.warrantyMonths || 24,
        accessories: matchedProd?.accessories || 'Kèm phụ kiện tiêu chuẩn',
        serials: [],
        notes: `Dự án theo Báo giá ${q.code}`,
      };
    });

    setItems(mappedItems);
    if (mappedItems.length > 0) setActiveSerialItemIndex(0);
    sounds.notification();
  };

  // Handle Inbound E-Invoice selection
  const handleSelectInboundInvoice = (invId: string) => {
    setSelectedInboundInvId(invId);
    if (!invId) return;

    const inv = inboundInvoices.find((i) => i.id === invId);
    if (!inv) return;

    let sellerObj: any = {};
    try {
      sellerObj = typeof inv.sellerData === 'string' ? JSON.parse(inv.sellerData) : inv.sellerData || {};
    } catch {}

    setSupplierName(sellerObj.name || inv.sellerData?.name || 'Nhà Cung Cấp HĐĐT');
    setSupplierTaxCode(sellerObj.taxCode || inv.sellerData?.taxCode || '');
    setSupplierAddress(sellerObj.address || inv.sellerData?.address || '');
    setReceiptNotes(`Nhập kho tự động từ HĐĐT số ${inv.invoiceNumber} (Ký hiệu ${inv.invoiceSymbol})`);

    const mappedItems: StockGoodsReceiptItem[] = (inv.items || []).map((it) => {
      const matchedProd = products.find((p) => p.id === it.matchedProductId || p.sku === it.skuOrCode);
      const curStock = matchedProd ? matchedProd.stock : 0;
      const curCost = matchedProd ? matchedProd.costPrice : it.unitPrice;
      const qty = it.quantity || 1;
      const taxRate = it.taxRate || 8;
      const totalAmount = it.total || qty * it.unitPrice * (1 + taxRate / 100);

      return {
        productId: matchedProd ? matchedProd.id : `prod-${it.skuOrCode || Date.now()}`,
        productName: it.productName,
        sku: it.skuOrCode || (matchedProd ? matchedProd.sku : `SKU-${Date.now()}`),
        unit: it.unit || 'Cái',
        quantity: qty,
        oldStock: curStock,
        newStock: curStock + qty,
        oldCostPrice: curCost,
        newCostPrice: it.unitPrice,
        unitCost: it.unitPrice,
        taxRate: taxRate,
        totalAmount: totalAmount,
        storageLocation: matchedProd?.storageLocation || 'Kệ A1 - Tầng 1',
        warehouse: 'Kho Chính Gia Phúc Computer',
        category: matchedProd?.category || 'Thiết bị điện tử',
        specifications: matchedProd?.specifications || '',
        color: matchedProd?.color || 'Đen',
        brand: matchedProd?.brand || 'Hikvision',
        warrantyMonths: matchedProd?.warrantyMonths || 24,
        accessories: matchedProd?.accessories || 'Kèm phụ kiện tiêu chuẩn',
        serials: [],
        notes: `Từ HĐĐT ${inv.invoiceNumber}`,
      };
    });

    setItems(mappedItems);
    if (mappedItems.length > 0) setActiveSerialItemIndex(0);
    sounds.notification();
  };

  // Quick Supplier select dropdown
  const handleSelectSupplierFromDirectory = (supId: string) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find((s) => s.id === supId);
    if (sup) {
      setSupplierName(sup.name);
      setSupplierTaxCode(sup.taxCode || '');
      setSupplierPhone(sup.phone || '');
      setSupplierAddress(sup.address || '');
    }
  };

  // Add a product to items table
  const handleAddProductToReceipt = (prod: Product) => {
    const existingIndex = items.findIndex((it) => it.productId === prod.id || it.sku === prod.sku);
    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...items];
      const target = updated[existingIndex];
      const newQty = target.quantity + 1;
      const totalAmount = newQty * target.unitCost * (1 + target.taxRate / 100);
      updated[existingIndex] = {
        ...target,
        quantity: newQty,
        newStock: target.oldStock + newQty,
        totalAmount: totalAmount,
      };
      setItems(updated);
      setActiveSerialItemIndex(existingIndex);
    } else {
      const qty = 1;
      const unitCost = prod.costPrice || 0;
      const taxRate = 8;
      const totalAmount = qty * unitCost * (1 + taxRate / 100);

      const newItem: StockGoodsReceiptItem = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unit: prod.unit || 'Cái',
        quantity: qty,
        oldStock: prod.stock || 0,
        newStock: (prod.stock || 0) + qty,
        oldCostPrice: prod.costPrice || 0,
        newCostPrice: unitCost,
        unitCost: unitCost,
        taxRate: taxRate,
        totalAmount: totalAmount,
        storageLocation: prod.storageLocation || 'Kệ A1 - Tầng 1',
        warehouse: warehouseName,
        category: typeof prod.category === 'string' ? prod.category : 'Thiết bị điện tử',
        specifications: prod.specifications || '',
        color: prod.color || 'Đen',
        brand: prod.brand || 'Hikvision',
        warrantyMonths: prod.warrantyMonths || 24,
        accessories: prod.accessories || 'Kèm phụ kiện tiêu chuẩn',
        serials: [],
        notes: '',
      };
      setItems([...items, newItem]);
      setActiveSerialItemIndex(items.length);
    }

    setProductSearchTerm('');
    setShowProductSearchResults(false);
    sounds.beep();
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (activeSerialItemIndex === index) {
      setActiveSerialItemIndex(updated.length > 0 ? 0 : null);
    } else if (activeSerialItemIndex !== null && activeSerialItemIndex > index) {
      setActiveSerialItemIndex(activeSerialItemIndex - 1);
    }
  };

  // Item field change
  const handleItemChange = (index: number, field: keyof StockGoodsReceiptItem, val: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: val };

    if (field === 'quantity') {
      const q = Math.max(1, Number(val) || 1);
      target.quantity = q;
      target.newStock = target.oldStock + q;
      target.totalAmount = q * target.unitCost * (1 + target.taxRate / 100);
    } else if (field === 'unitCost') {
      const c = Math.max(0, Number(val) || 0);
      target.unitCost = c;
      target.newCostPrice = c;
      target.totalAmount = target.quantity * c * (1 + target.taxRate / 100);
    } else if (field === 'taxRate') {
      const t = Math.max(0, Number(val) || 0);
      target.taxRate = t;
      target.totalAmount = target.quantity * target.unitCost * (1 + t / 100);
    }

    updated[index] = target;
    setItems(updated);
  };

  // ==========================================
  // SERIAL / BARCODE MANAGEMENT LOGIC
  // ==========================================
  const activeItem = activeSerialItemIndex !== null ? items[activeSerialItemIndex] : null;

  const handleAddSingleSerial = () => {
    if (!activeItem || activeSerialItemIndex === null) return;
    const clean = serialInput.trim().toUpperCase();
    if (!clean) return;

    const currentSerials = activeItem.serials || [];
    if (currentSerials.includes(clean)) {
      setSerialError(`Mã Serial "${clean}" đã có trong danh sách nạp của mặt hàng này!`);
      sounds.error();
      return;
    }

    if (currentSerials.length >= activeItem.quantity) {
      setSerialError(`Đã quét đủ ${activeItem.quantity}/${activeItem.quantity} số Serial! Vui lòng tăng số lượng nếu cần nhập thêm.`);
      sounds.error();
      return;
    }

    const updatedSerials = [...currentSerials, clean];
    handleItemChange(activeSerialItemIndex, 'serials', updatedSerials);
    setSerialInput('');
    setSerialError(null);
    sounds.beep();
  };

  const handleRemoveSerial = (serialIndex: number) => {
    if (!activeItem || activeSerialItemIndex === null) return;
    const currentSerials = activeItem.serials || [];
    const updatedSerials = currentSerials.filter((_, i) => i !== serialIndex);
    handleItemChange(activeSerialItemIndex, 'serials', updatedSerials);
  };

  // Bulk Paste Excel Serials
  const handleConfirmPasteSerials = () => {
    if (!activeItem || activeSerialItemIndex === null || !pasteText.trim()) return;

    const lines = pasteText
      .split(/[\r\n,\t;]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    const currentSerials = [...(activeItem.serials || [])];
    const duplicates: string[] = [];

    lines.forEach((s) => {
      if (!currentSerials.includes(s) && currentSerials.length < activeItem.quantity) {
        currentSerials.push(s);
      } else if (currentSerials.includes(s)) {
        duplicates.push(s);
      }
    });

    handleItemChange(activeSerialItemIndex, 'serials', currentSerials);
    setShowPasteModal(false);
    setPasteText('');

    if (duplicates.length > 0) {
      alert(`Đã nạp các Serial hợp lệ. Có ${duplicates.length} mã bị trùng đã tự động bỏ qua: ${duplicates.slice(0, 3).join(', ')}...`);
    }
    sounds.success();
  };

  // Auto Generate Serial Range
  const handleConfirmAutoGenerate = () => {
    if (!activeItem || activeSerialItemIndex === null) return;

    const neededCount = activeItem.quantity - (activeItem.serials?.length || 0);
    if (neededCount <= 0) {
      alert('Mặt hàng này đã có đủ số lượng Serial!');
      setShowAutoGenerateModal(false);
      return;
    }

    const currentSerials = [...(activeItem.serials || [])];
    let curNum = autoGenStartNumber;

    for (let i = 0; i < neededCount; i++) {
      const generatedSerial = `${autoGenPrefix}${String(curNum).padStart(autoGenDigits, '0')}`;
      if (!currentSerials.includes(generatedSerial)) {
        currentSerials.push(generatedSerial);
      }
      curNum++;
    }

    handleItemChange(activeSerialItemIndex, 'serials', currentSerials);
    setShowAutoGenerateModal(false);
    sounds.success();
  };

  // Filtered search list of products
  const filteredProducts = useMemo(() => {
    if (!productSearchTerm.trim()) return [];
    const term = productSearchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase().includes(term))
    );
  }, [products, productSearchTerm]);

  // Totals calculations
  const totalItemsCount = items.length;
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalCostAmount = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
  const totalTaxAmount = items.reduce((sum, it) => sum + (it.totalAmount - it.quantity * it.unitCost), 0);
  const grandTotal = items.reduce((sum, it) => sum + it.totalAmount, 0);

  // Submit & Save Receipt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Vui lòng nhập Tên Nhà Cung Cấp / Đối Tác!');
      return;
    }

    if (items.length === 0) {
      alert('Phiếu nhập kho phải có ít nhất 1 mặt hàng!');
      return;
    }

    // Check items with missing serials
    const itemsMissingSerials = items.filter(
      (it) => it.serials && it.serials.length > 0 && it.serials.length < it.quantity
    );
    if (itemsMissingSerials.length > 0) {
      const confirmContinue = window.confirm(
        `Có ${itemsMissingSerials.length} mặt hàng chưa nạp đủ 100% số Serial theo số lượng nhập. Bạn có muốn tiếp tục lưu phiếu nhập kho?`
      );
      if (!confirmContinue) return;
    }

    const payload: Partial<StockGoodsReceipt> = {
      code: receiptCode,
      date: receiptDate,
      sourceType: sourceType,
      sourceId:
        sourceType === 'po'
          ? selectedPoId
          : sourceType === 'quote'
          ? selectedQuoteId
          : sourceType === 'inbound_invoice'
          ? selectedInboundInvId
          : undefined,
      sourceCode:
        sourceType === 'po'
          ? purchaseOrders.find((p) => p.id === selectedPoId)?.code
          : sourceType === 'quote'
          ? quotes.find((q) => q.id === selectedQuoteId)?.code
          : sourceType === 'inbound_invoice'
          ? inboundInvoices.find((i) => i.id === selectedInboundInvId)?.invoiceNumber
          : undefined,
      supplierName: supplierName.trim(),
      supplierTaxCode: supplierTaxCode.trim() || undefined,
      supplierPhone: supplierPhone.trim() || undefined,
      supplierAddress: supplierAddress.trim() || undefined,
      warehouseName: warehouseName,
      creatorName: receivedBy,
      receivedBy: receivedBy,
      totalItemsCount: totalItemsCount,
      totalQuantity: totalQuantity,
      totalCostAmount: totalCostAmount,
      totalTaxAmount: totalTaxAmount,
      grandTotal: grandTotal,
      paymentStatus: paymentStatus,
      notes: receiptNotes.trim() || undefined,
      items: items,
    };

    try {
      setIsSubmitting(true);
      await onSaveReceipt(payload, { printAfterSave });
      sounds.success();
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi lưu phiếu nhập kho: ${err.message || 'Không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Lập Phiếu Nhập Kho (Inward Stock Receipt)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/50 shadow-inner">
                  {receiptCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập kho từ Báo Giá, Đơn Đặt Hàng (PO), HĐĐT Đầu Vào, Thủ Công • Quản lý nhiều sản phẩm & nhiều Serial/Mã Vạch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTAINER */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TOP 3 CARDS: 1. CHỨNG TỪ NGUỒN | 2. NHÀ CUNG CẤP | 3. KHO HÀNG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* 1. CHỨNG TỪ NGUỒN (4 COLUMNS) */}
            <div className="lg:col-span-4 bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-3">
                  <FileText className="w-4 h-4" />
                  <span>1. CHỨNG TỪ NGUỒN (THAM CHIẾU)</span>
                </div>

                {/* 4 Tabs Source Type */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('po');
                      if (availablePurchaseOrders.length > 0) handleSelectPO(availablePurchaseOrders[0].id);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'po'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    <span>📦 Đơn Đặt Hàng (PO)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('quote');
                      if (quotes.length > 0) handleSelectQuote(quotes[0].id);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'quote'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    <span>📋 Báo Giá (Quote)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSourceType('inbound_invoice');
                      if (inboundInvoices.length > 0) handleSelectInboundInvoice(inboundInvoices[0].id);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'inbound_invoice'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    <span>📑 HĐĐT Đầu Vào</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceType('manual')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      sourceType === 'manual'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    <span>✍️ Nhập Thủ Công</span>
                  </button>
                </div>

                {/* Conditional Source Selectors */}
                {sourceType === 'po' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Chọn Đơn Mua Hàng PO ({availablePurchaseOrders.length}):</span>
                      <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={hideCompletedPo}
                          onChange={(e) => setHideCompletedPo(e.target.checked)}
                          className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                        />
                        <span>Ẩn PO đã nhập</span>
                      </label>
                    </div>
                    <select
                      value={selectedPoId}
                      onChange={(e) => handleSelectPO(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Chọn đơn đặt hàng PO --</option>
                      {availablePurchaseOrders.map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.code} - {po.supplierName} ({po.items.length} món - {formatVND(po.totalAmount)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {sourceType === 'quote' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Chọn Phiếu Báo Giá ({quotes.length}):</label>
                    <select
                      value={selectedQuoteId}
                      onChange={(e) => handleSelectQuote(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Chọn báo giá nguồn --</option>
                      {quotes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.code} - {q.customerName} ({q.items.length} món - {formatVND(q.finalTotal)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {sourceType === 'inbound_invoice' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400">Chọn HĐĐT Đầu Vào ({inboundInvoices.length}):</label>
                    <select
                      value={selectedInboundInvId}
                      onChange={(e) => handleSelectInboundInvoice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">-- Chọn hóa đơn điện tử --</option>
                      {inboundInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          Số: {inv.invoiceNumber} - Ký hiệu: {inv.invoiceSymbol} ({formatVND(inv.totalAmount)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {sourceType === 'manual' && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                    Chế độ nhập tự do: Thêm sản phẩm trực tiếp từ danh mục hoặc quét mã vạch súng barcode.
                  </p>
                )}
              </div>
            </div>

            {/* 2. THÔNG TIN NHÀ CUNG CẤP (4 COLUMNS) */}
            <div className="lg:col-span-4 bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Building2 className="w-4 h-4" />
                <span>2. THÔNG TIN NHÀ CUNG CẤP</span>
              </div>

              {suppliers.length > 0 && (
                <div>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => handleSelectSupplierFromDirectory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 mb-2"
                  >
                    <option value="">-- Chọn từ danh bạ NCC có sẵn --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code} - {s.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Tên Nhà Cung Cấp / Đối Tác *"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Mã số thuế"
                  value={supplierTaxCode}
                  onChange={(e) => setSupplierTaxCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 3. KHO HÀNG & NGƯỜI TIẾP NHẬN (4 COLUMNS) */}
            <div className="lg:col-span-4 bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                <Warehouse className="w-4 h-4" />
                <span>3. KHO HÀNG & NGƯỜI TIẾP NHẬN</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Ngày nhập:</label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Kho lưu trữ:</label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    {(settings?.warehouseList || [
                      'Kho Chính Gia Phúc Computer',
                      'Kho Kỹ Thuật & Showroom',
                      'Kho Chi Nhánh TP.HCM',
                      'Kho Chi Nhánh Bình Dương',
                      'Kho Bảo Hành & Linh Kiện',
                    ]).map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Thủ kho tiếp nhận:</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Thanh toán:</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="paid">Đã thanh toán đủ</option>
                    <option value="debt_pending">Ghi nợ NCC (Chờ TT)</option>
                    <option value="partial">Thanh toán 1 phần</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 4: PRODUCT LIST & SERIAL MANAGER */}
          <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            
            {/* TOP BAR: SEARCH & SCAN BARCODE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Danh Sách Sản Phẩm Nhập Kho ({totalItemsCount} mặt hàng - Tổng {totalQuantity} cái)
                </h3>
              </div>

              {/* Autocomplete Search input */}
              <div className="relative flex-1 max-w-lg">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="🔍 Gõ tên SP, SKU hoặc quét mã vạch để thêm..."
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setShowProductSearchResults(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredProducts.length > 0) {
                        e.preventDefault();
                        handleAddProductToReceipt(filteredProducts[0]);
                      }
                    }}
                    onFocus={() => setShowProductSearchResults(true)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner"
                  />
                </div>

                {/* Dropdown Suggestions */}
                {showProductSearchResults && filteredProducts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-800">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProductToReceipt(p)}
                        className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            SKU: {p.sku} {p.barcode ? `• Barcode: ${p.barcode}` : ''} • Tồn: {p.stock} {p.unit}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {formatVND(p.costPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TABLE OF ITEMS */}
            <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-4 min-w-[220px]">SẢN PHẨM & MÃ SKU/BARCODE</th>
                    <th className="py-3 px-3 w-20 text-center">ĐVT</th>
                    <th className="py-3 px-3 w-24 text-center">SỐ LƯỢNG</th>
                    <th className="py-3 px-3 w-32 text-right">GIÁ VỐN (VNĐ)</th>
                    <th className="py-3 px-3 w-20 text-center">THUẾ %</th>
                    <th className="py-3 px-3 w-32 text-right">THÀNH TIỀN</th>
                    <th className="py-3 px-3 w-44 text-center">QUẢN LÝ SERIAL / BARCODE</th>
                    <th className="py-3 px-3 w-36">VỊ TRÍ KỆ</th>
                    <th className="py-3 px-3 w-12 text-center">XÓA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500 italic">
                        Chưa có sản phẩm nào được chọn. Hãy gõ tên hoặc quét mã vạch ở thanh tìm kiếm phía trên.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const serialCount = item.serials?.length || 0;
                      const hasEnoughSerials = serialCount >= item.quantity;
                      const isRowActiveForSerial = activeSerialItemIndex === idx;
                      const isExpanded = expandedInfoIndex === idx;

                      return (
                        <React.Fragment key={idx}>
                          <tr
                            className={`transition-colors ${
                              isRowActiveForSerial
                                ? 'bg-blue-950/30 border-l-4 border-l-blue-500'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                            
                            {/* Product Info */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{item.productName}</div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                                <span>{item.sku}</span>
                                {item.specifications && (
                                  <span className="text-slate-500">• {item.specifications}</span>
                                )}
                                <span className="text-emerald-400">
                                  Tồn: {item.oldStock} → {item.newStock}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedInfoIndex(isExpanded ? null : idx)}
                                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-1"
                              >
                                <span>{isExpanded ? 'Ẩn thông số mở rộng' : '+ Thông số (Quy cách, Màu, Hãng, BH, PK)'}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </td>

                            {/* Unit */}
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                                {item.unit}
                              </span>
                            </td>

                            {/* Quantity */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                className="w-16 px-2 py-1 text-center bg-slate-950 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Unit Cost */}
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.unitCost}
                                onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                                className="w-28 px-2 py-1 text-right bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-semibold focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Tax Rate % */}
                            <td className="py-3 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.taxRate}
                                onChange={(e) => handleItemChange(idx, 'taxRate', e.target.value)}
                                className="w-14 px-1.5 py-1 text-center bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Total Amount */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                              {formatVND(item.totalAmount)}
                            </td>

                            {/* SERIAL BUTTON */}
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setActiveSerialItemIndex(isRowActiveForSerial ? null : idx)}
                                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                                  hasEnoughSerials
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/60'
                                    : serialCount > 0
                                    ? 'bg-amber-950 text-amber-300 border-amber-600/60 hover:bg-amber-900/60'
                                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                                }`}
                              >
                                <Barcode className="w-3.5 h-3.5" />
                                <span>
                                  {serialCount === 0
                                    ? `Chưa nhập serial (${serialCount}/${item.quantity})`
                                    : hasEnoughSerials
                                    ? `Đã đủ (${serialCount}/${item.quantity})`
                                    : `Đang quét (${serialCount}/${item.quantity})`}
                                </span>
                              </button>
                            </td>

                            {/* Storage Shelf Location */}
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                placeholder="Kệ A1 - Tầng 1"
                                value={item.storageLocation || ''}
                                onChange={(e) => handleItemChange(idx, 'storageLocation', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Delete */}
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>

                          {/* EXPANDED ROW: EXTENDED ATTRIBUTES (Quy cách, Màu sắc, Hãng, BH, Phụ kiện) */}
                          {isExpanded && (
                            <tr className="bg-slate-950/60 border-b border-slate-800">
                              <td colSpan={10} className="p-3">
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                                  <div>
                                    <label className="text-slate-400 block mb-1">Quy cách kỹ thuật:</label>
                                    <input
                                      type="text"
                                      placeholder="VD: 16 Kênh NVR 4K, Chuẩn H.265+"
                                      value={item.specifications || ''}
                                      onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-1">Màu sắc:</label>
                                    <input
                                      type="text"
                                      placeholder="VD: Đen / Trắng"
                                      value={item.color || ''}
                                      onChange={(e) => handleItemChange(idx, 'color', e.target.value)}
                                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-1">Hãng sản xuất:</label>
                                    <input
                                      type="text"
                                      placeholder="VD: Hikvision, Gigabyte"
                                      value={item.brand || ''}
                                      onChange={(e) => handleItemChange(idx, 'brand', e.target.value)}
                                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-1">Thời gian bảo hành (tháng):</label>
                                    <input
                                      type="number"
                                      placeholder="24"
                                      value={item.warrantyMonths || 24}
                                      onChange={(e) => handleItemChange(idx, 'warrantyMonths', Number(e.target.value))}
                                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-400 block mb-1">Kèm phụ kiện (nếu có):</label>
                                    <input
                                      type="text"
                                      placeholder="VD: Adapter, Chuột, Cáp, Ốc vít"
                                      value={item.accessories || ''}
                                      onChange={(e) => handleItemChange(idx, 'accessories', e.target.value)}
                                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* SECTION 5: SERIAL / BARCODE SUB-PANEL (FOR ACTIVE ITEM) */}
            {activeItem && activeSerialItemIndex !== null && (
              <div className="bg-slate-950/80 border-2 border-blue-500/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xl">
                
                {/* Header Sub-panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <Barcode className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Quản Lý Số Serial / Mã Vạch Cho: <span className="text-emerald-400">{activeItem.productName}</span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cần nhập: <span className="font-bold text-white">{activeItem.quantity}</span> serial • Đã quét:{' '}
                      <span className="font-bold text-emerald-400">{activeItem.serials?.length || 0}</span> serial
                    </p>
                  </div>

                  {/* Actions: Dán Excel, Sinh tự động, Đóng */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasteModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-blue-400" />
                      <span>Dán Nhiều Serial (Excel)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAutoGenerateModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tự Động Sinh Dải Serial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSerialItemIndex(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Gun Barcode Scanner Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="🔫 Cầm súng bắn mã vạch vào vỏ hộp / thiết bị hoặc gõ serial rồi nhấn Enter..."
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSingleSerial();
                        }
                      }}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSingleSerial}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    + Thêm Serial
                  </button>
                </div>

                {serialError && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{serialError}</span>
                  </div>
                )}

                {/* List of Scanned Serials */}
                <div>
                  <label className="text-xs text-slate-400 block mb-2">
                    Danh sách serial đã nạp ({activeItem.serials?.length || 0}):
                  </label>
                  {(!activeItem.serials || activeItem.serials.length === 0) ? (
                    <div className="py-6 text-center text-xs text-slate-500 italic border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                      Chưa có mã Serial nào được quét. Dùng súng barcode hoặc dán hàng loạt ở trên.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-800 rounded-xl bg-slate-900/40">
                      {activeItem.serials.map((sn, snIdx) => (
                        <span
                          key={snIdx}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-950 text-blue-200 border border-blue-800/60 flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="text-blue-400">#{snIdx + 1}</span>
                          <span>{sn}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSerial(snIdx)}
                            className="hover:text-rose-400 text-slate-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* FOOTER BAR: SUMMARY & SUBMIT */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Notes & Checkbox */}
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Ghi chú phiếu nhập kho..."
                value={receiptNotes}
                onChange={(e) => setReceiptNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printAfterSave}
                  onChange={(e) => setPrintAfterSave(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>In Phiếu Nhập Kho sau khi lưu thành công</span>
              </label>
            </div>

            {/* Price Calculations */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
              <div>
                <p className="text-slate-400">Tiền hàng:</p>
                <p className="text-white font-bold">{formatVND(totalCostAmount)}</p>
              </div>
              <div>
                <p className="text-slate-400">Thuế VAT:</p>
                <p className="text-amber-400 font-bold">{formatVND(totalTaxAmount)}</p>
              </div>
              <div className="bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-700/50">
                <p className="text-emerald-400 text-[11px]">TỔNG THANH TOÁN:</p>
                <p className="text-emerald-300 font-bold text-base">{formatVND(grandTotal)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang lưu vào DB...' : '💾 Hoàn Tất & Nhập Kho'}</span>
              </button>
            </div>

          </div>

        </form>

      </div>

      {/* MODAL 1: BULK PASTE SERIALS (EXCEL) */}
      {showPasteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Dán Hàng Loạt Serial (Từ Excel / Notepad)</h3>
              </div>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Copy cột danh sách Serial từ file Excel và paste vào khung bên dưới (mỗi mã 1 dòng hoặc cách nhau bởi dấu phẩy/tab):
            </p>
            <textarea
              rows={8}
              placeholder="VD:&#10;SN202608001&#10;SN202608002&#10;SN202608003..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmPasteSerials}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Nạp Serial Vào Danh Sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AUTO GENERATE SERIAL RANGE */}
      {showAutoGenerateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Tự Động Sinh Dải Số Serial Liên Tục</h3>
              </div>
              <button onClick={() => setShowAutoGenerateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Hệ thống sẽ tự sinh tiếp các số serial cho đủ số lượng cần nhập (còn thiếu:{' '}
              <span className="text-amber-400 font-bold">
                {activeItem ? activeItem.quantity - (activeItem.serials?.length || 0) : 0}
              </span>{' '}
              mã):
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tiền tố (Prefix):</label>
                <input
                  type="text"
                  value={autoGenPrefix}
                  onChange={(e) => setAutoGenPrefix(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Số bắt đầu:</label>
                  <input
                    type="number"
                    value={autoGenStartNumber}
                    onChange={(e) => setAutoGenStartNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Số chữ số (padding 0):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={autoGenDigits}
                    onChange={(e) => setAutoGenDigits(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Mẫu sinh ra: <span className="font-mono text-emerald-400 font-bold">{autoGenPrefix}{String(autoGenStartNumber).padStart(autoGenDigits, '0')}</span>, <span className="font-mono text-emerald-400 font-bold">{autoGenPrefix}{String(autoGenStartNumber + 1).padStart(autoGenDigits, '0')}</span>...
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAutoGenerateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAutoGenerate}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Sinh Dải Serial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
