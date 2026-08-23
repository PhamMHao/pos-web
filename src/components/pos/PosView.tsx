import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  Percent,
  UserCheck,
  UserPlus,
  CreditCard,
  CheckCircle2,
  Tag,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Monitor,
  Printer,
  Scale,
  Layers,
  Ruler,
  ChevronDown,
  Info,
  Bot,
  MapPin,
  FileText,
  Phone,
  User,
  Truck,
  Building,
  Edit3,
} from 'lucide-react';
import {
  Product,
  CartItem,
  Customer,
  Promotion,
  Order,
  StoreSettings,
  CashShift,
  ProductCategory,
  PaymentMethod,
  UOMOption,
  EInvoice,
  EInvoiceItem,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { CheckoutModal, EInvoiceRequestData } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';
import { UomCalculatorModal } from './UomCalculatorModal';
import { SelectProductUomModal } from './SelectProductUomModal';

interface PosViewProps {
  products: Product[];
  customers: Customer[];
  promotions: Promotion[];
  settings: StoreSettings;
  currentShift: CashShift | null;
  onSaveOrder: (order: Order) => void;
  onUpdateProductStock: (productId: string, quantityDeducted: number) => void;
  onAddCustomer: (customer: Customer) => void;
  onOpenDevices?: () => void;
  onOpenAiAssistant?: () => void;
  onIssueEInvoice?: (invoice: EInvoice) => void;
  loadedQuoteData?: { items: CartItem[]; customer?: Customer | null } | null;
  onClearLoadedQuoteData?: () => void;
}

const CATEGORIES: ('Tất cả' | ProductCategory)[] = [
  'Tất cả',
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

export const PosView: React.FC<PosViewProps> = ({
  products = [],
  customers = [],
  promotions = [],
  settings,
  currentShift,
  onSaveOrder,
  onUpdateProductStock,
  onAddCustomer,
  onOpenDevices,
  onOpenAiAssistant,
  onIssueEInvoice,
  loadedQuoteData,
  onClearLoadedQuoteData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Tất cả' | ProductCategory>('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDeliveryAddress, setCustomerDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState('');
  const [applyTax, setApplyTax] = useState(true);

  // Sync cart from B2B Quote if transferred
  useEffect(() => {
    if (loadedQuoteData) {
      if (loadedQuoteData.items && loadedQuoteData.items.length > 0) {
        setCart(loadedQuoteData.items);
      }
      if (loadedQuoteData.customer) {
        setSelectedCustomer(loadedQuoteData.customer);
      }
      if (onClearLoadedQuoteData) onClearLoadedQuoteData();
    }
  }, [loadedQuoteData]);

  // Modals
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [printA4Order, setPrintA4Order] = useState<Order | null>(null);
  const [showQuickAddCust, setShowQuickAddCust] = useState(false);
  const [showUomCalculator, setShowUomCalculator] = useState(false);
  const [selectedUomProduct, setSelectedUomProduct] = useState<Product | null>(null);

  // Quick new customer inputs
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustDebt, setNewCustDebt] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync delivery address when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerDeliveryAddress(selectedCustomer.address || '');
    }
  }, [selectedCustomer]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const query = searchTerm.toLowerCase().trim();
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcode.includes(query);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchTerm]);

  // Cart operations with Multi-Unit support
  const addToCart = (
    product: Product,
    targetUnit?: string,
    customQuantity: number = 1,
    customUnitPrice?: number,
    customCostPrice?: number,
    customRatioToBase?: number
  ) => {
    if (product.stock <= 0) return;

    // Get product UOM options or fallback to default
    const uomList: UOMOption[] =
      product.uomConversions && product.uomConversions.length > 0
        ? product.uomConversions
        : [
            {
              unit: product.unit,
              ratioToBase: 1,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              isBase: true,
              description: 'Đơn vị cơ bản',
            },
          ];

    const chosenUOM = targetUnit
      ? uomList.find((u) => u.unit.toLowerCase() === targetUnit.toLowerCase()) || uomList[0]
      : uomList[0];

    const selectedUOM = chosenUOM.unit;
    const unitPrice = customUnitPrice ?? chosenUOM.sellingPrice;
    const costPrice = customCostPrice ?? chosenUOM.costPrice;
    const ratioToBase = customRatioToBase ?? chosenUOM.ratioToBase;

    setCart((prev) => {
      // Find item with same product ID and same selected unit
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (item.selectedUOM || item.product.unit).toLowerCase() === selectedUOM.toLowerCase()
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Number((existing.quantity + customQuantity).toFixed(4));
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          unitPrice,
          costPrice,
          ratioToBase,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: customQuantity,
            selectedUOM,
            unitPrice,
            costPrice,
            ratioToBase,
            discountPercent: 0,
          },
        ];
      }
    });
  };

  // Switch Unit of Measure (UOM) for a specific item in cart
  const changeCartItemUOM = (cartIndex: number, newUnitName: string) => {
    setCart((prev) => {
      const item = prev[cartIndex];
      if (!item) return prev;

      const uomList: UOMOption[] =
        item.product.uomConversions && item.product.uomConversions.length > 0
          ? item.product.uomConversions
          : [
              {
                unit: item.product.unit,
                ratioToBase: 1,
                costPrice: item.product.costPrice,
                sellingPrice: item.product.sellingPrice,
                isBase: true,
                description: 'Đơn vị cơ bản',
              },
            ];

      const targetUOM = uomList.find((u) => u.unit === newUnitName) || uomList[0];
      const updated = [...prev];
      updated[cartIndex] = {
        ...item,
        selectedUOM: targetUOM.unit,
        unitPrice: targetUOM.sellingPrice,
        costPrice: targetUOM.costPrice,
        ratioToBase: targetUOM.ratioToBase,
      };
      return updated;
    });
  };

  const updateQuantity = (cartIndex: number, delta: number) => {
    setCart((prev) => {
      const item = prev[cartIndex];
      if (!item) return prev;
      const newQty = Number((item.quantity + delta).toFixed(4));
      if (newQty <= 0) {
        return prev.filter((_, idx) => idx !== cartIndex);
      }
      const updated = [...prev];
      updated[cartIndex] = { ...item, quantity: newQty };
      return updated;
    });
  };

  const setExactQuantity = (cartIndex: number, exactQty: number) => {
    setCart((prev) => {
      const item = prev[cartIndex];
      if (!item) return prev;
      if (exactQty <= 0) {
        return prev.filter((_, idx) => idx !== cartIndex);
      }
      const updated = [...prev];
      updated[cartIndex] = { ...item, quantity: exactQty };
      return updated;
    });
  };

  const updateItemDiscount = (cartIndex: number, discountPercent: number) => {
    setCart((prev) => {
      const item = prev[cartIndex];
      if (!item) return prev;
      const updated = [...prev];
      updated[cartIndex] = {
        ...item,
        discountPercent: Math.max(0, Math.min(100, discountPercent)),
      };
      return updated;
    });
  };

  const removeFromCart = (cartIndex: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== cartIndex));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setDiscountCode('');
    setPromoError('');
    setSelectedCustomer(null);
  };

  // Barcode quick scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === searchTerm.toLowerCase() ||
        p.sku.toLowerCase() === searchTerm.toLowerCase()
    );

    if (found) {
      if (found.uomConversions && found.uomConversions.length > 1) {
        setSelectedUomProduct(found);
      } else {
        addToCart(found);
      }
      setSearchTerm('');
    }
  };

  // Apply voucher promo
  const handleApplyPromo = () => {
    setPromoError('');
    if (!discountCode.trim()) {
      setAppliedPromo(null);
      return;
    }

    const code = discountCode.trim().toUpperCase();
    const promo = promotions.find(
      (p) => p.code.toUpperCase() === code && p.isActive
    );

    if (!promo) {
      setPromoError('Mã khuyến mãi không tồn tại hoặc đã hết hạn.');
      setAppliedPromo(null);
      return;
    }

    if (subtotal < promo.minOrderValue) {
      setPromoError(
        `Đơn hàng tối thiểu ${formatVND(promo.minOrderValue)} để áp dụng mã này.`
      );
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(promo);
  };

  // Calculations with unit pricing
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.unitPrice ?? item.product.sellingPrice;
      const discountedPrice = itemPrice * (1 - item.discountPercent / 100);
      return sum + discountedPrice * item.quantity;
    }, 0);
  }, [cart]);

  const totalCost = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemCost = item.costPrice ?? item.product.costPrice;
      return sum + itemCost * item.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    let amt = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        amt = (subtotal * appliedPromo.discountValue) / 100;
        if (appliedPromo.maxDiscount && amt > appliedPromo.maxDiscount) {
          amt = appliedPromo.maxDiscount;
        }
      } else {
        amt = appliedPromo.discountValue;
      }
    }
    // Loyalty rank discount
    if (selectedCustomer) {
      if (selectedCustomer.tier === 'Kim Cương') amt += subtotal * 0.05; // 5% VIP
      else if (selectedCustomer.tier === 'Vàng') amt += subtotal * 0.03; // 3% Gold
    }
    return Math.min(subtotal, Math.round(amt));
  }, [subtotal, appliedPromo, selectedCustomer]);

  const taxRate = applyTax ? settings.vatDefault : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const finalTotal = taxableAmount + taxAmount;

  // Quick Customer Creation
  const handleQuickCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress || 'TP. Hồ Chí Minh',
      tier: 'Đồng',
      points: 10,
      totalSpent: 0,
      totalOrders: 0,
      debt: Number(newCustDebt) || 0,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCust);
    setSelectedCustomer(newCust);
    setCustomerDeliveryAddress(newCust.address || '');
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustDebt(0);
    setShowQuickAddCust(false);
  };

  // Complete Order
  const handleConfirmPayment = (paymentDetails: {
    paymentMethod: PaymentMethod;
    paidAmount: number;
    changeAmount: number;
    paymentStatus: 'paid' | 'unpaid';
    note?: string;
    eInvoiceData?: EInvoiceRequestData;
  }) => {
    const orderCode =
      'HD-' +
      new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' +
      Math.floor(100 + Math.random() * 900);

    const orderItems = cart.map((item) => {
      const effectivePrice = item.unitPrice ?? item.product.sellingPrice;
      const effectiveCost = item.costPrice ?? item.product.costPrice;
      const effectiveUnit = item.selectedUOM || item.product.unit;
      const effectiveRatio = item.ratioToBase ?? 1;

      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        unit: effectiveUnit,
        ratioToBase: effectiveRatio,
        quantity: item.quantity,
        unitPrice: effectivePrice,
        costPrice: effectiveCost,
        discountPercent: item.discountPercent,
        total: Math.round(
          effectivePrice * (1 - item.discountPercent / 100) * item.quantity
        ),
      };
    });

    const finalDeliveryAddress = customerDeliveryAddress || selectedCustomer?.address || '';
    const finalOrderNote = paymentDetails.note || orderNote || '';

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      code: orderCode,
      channel: 'Tại quầy (POS)',
      status: 'completed',
      customer: selectedCustomer
        ? {
            id: selectedCustomer.id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            address: finalDeliveryAddress,
            rank: selectedCustomer.tier,
          }
        : finalDeliveryAddress
        ? {
            id: 'guest',
            name: 'Khách lẻ giao hàng',
            phone: '',
            address: finalDeliveryAddress,
          }
        : undefined,
      items: orderItems,
      subtotal,
      discountAmount,
      discountCode: appliedPromo?.code,
      taxRate,
      taxAmount,
      shippingFee: 0,
      total: finalTotal,
      totalCost,
      profit: finalTotal - totalCost - taxAmount,
      paymentMethod: paymentDetails.paymentMethod,
      paymentStatus: paymentDetails.paymentStatus,
      paidAmount: paymentDetails.paidAmount,
      changeAmount: paymentDetails.changeAmount,
      note: finalOrderNote,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    // Deduct stock in BASE UNITS based on quantity * ratioToBase
    const stockDeductionMap: { [productId: string]: number } = {};
    cart.forEach((item) => {
      const baseQty = item.quantity * (item.ratioToBase ?? 1);
      stockDeductionMap[item.product.id] =
        (stockDeductionMap[item.product.id] || 0) + baseQty;
    });

    Object.entries(stockDeductionMap).forEach(([productId, deductedBaseQty]) => {
      onUpdateProductStock(productId, Number(deductedBaseQty.toFixed(4)));
    });

    onSaveOrder(newOrder);

    // Issue E-Invoice if requested
    if (paymentDetails.eInvoiceData?.requestEInvoice && onIssueEInvoice) {
      const eInvNumber = '00' + Math.floor(10000 + Math.random() * 90000);
      const taxRateValue = taxRate || 8;
      const invItems: EInvoiceItem[] = orderItems.map((oi, idx) => {
        const itemAmount = oi.total;
        const itemVat = Math.round((itemAmount * taxRateValue) / 100);
        return {
          id: `item-${Date.now()}-${idx}`,
          sku: oi.sku,
          productName: oi.productName,
          unit: oi.unit,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
          subtotal: oi.total,
          discountPercent: oi.discountPercent,
          discountAmount: Math.round(oi.unitPrice * (oi.discountPercent / 100) * oi.quantity),
          taxRate: taxRateValue,
          taxAmount: itemVat,
          total: itemAmount + itemVat,
        };
      });

      const randomAuthCode = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      const lookupCode = 'GP-INV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      const newEInvoice: EInvoice = {
        id: `inv-${Date.now()}`,
        invoiceCode: `1C26TGP-${eInvNumber}`,
        invoiceNumber: eInvNumber,
        invoiceSymbol: '1C26TGP',
        invoiceTemplate: '1/001',
        invoiceType: 'vat',
        cqtCode: `TCT-${new Date().getFullYear().toString().slice(-2)}${randomAuthCode}`,
        lookupCode,
        lookupUrl: 'https://hoadondientu.gdt.gov.vn',
        issueDate: new Date().toISOString().slice(0, 10),
        signDate: new Date().toISOString().slice(0, 10),
        status: 'cqt_approved',
        orderId: newOrder.id,
        orderCode: newOrder.code,
        seller: {
          name: settings.storeName || 'CÔNG TY TNHH GIẢI PHÁP DOANH NGHIỆP GP-ERP',
          taxCode: '0318999888',
          address: settings.address || 'Tầng 12, Tòa nhà Landmark, TP. Hồ Chí Minh',
          phone: settings.phone || '1900 6868',
          email: settings.email || 'info@gperp.vn',
          bankAccount: settings.bankAccount || '1903688899901',
          bankName: settings.bankName || 'Techcombank Chi nhánh TP.HCM',
          representative: 'Ban Giám Đốc GP-ERP',
        },
        buyer: {
          companyName: paymentDetails.eInvoiceData.buyerCompanyName || (selectedCustomer ? selectedCustomer.name : 'Khách hàng lẻ'),
          buyerName: selectedCustomer ? selectedCustomer.name : 'Người mua hàng',
          taxCode: paymentDetails.eInvoiceData.buyerTaxCode || '0310000000',
          address: paymentDetails.eInvoiceData.buyerAddress || 'TP. Hồ Chí Minh',
          phone: selectedCustomer?.phone,
          email: paymentDetails.eInvoiceData.buyerEmail || 'customer@gmail.com',
        },
        items: invItems,
        subtotal: taxableAmount,
        discountAmount: discountAmount,
        taxRate: taxRateValue,
        taxAmount: taxAmount,
        totalAmount: finalTotal,
        amountInWords: numberToVietnameseWords(finalTotal),
        paymentMethod: paymentDetails.paymentMethod === 'transfer' ? 'CK' : paymentDetails.paymentMethod === 'cash' ? 'TM' : 'TM/CK',
        notes: `Phát hành tự động qua POS đơn hàng ${newOrder.code}`,
        digitalSignature: {
          signedBy: settings.storeName || 'GP-ERP ENTERPRISE',
          serialNumber: '5404 8839 2026 VIETTEL-CA',
          signTime: new Date().toISOString(),
          certProvider: 'VIETTEL-CA (Bộ Thông tin & Truyền thông cấp phép)',
          isVerified: true,
        },
      };

      onIssueEInvoice(newEInvoice);
    }

    setLastCompletedOrder(newOrder);
    setShowCheckout(false);
    clearCart();

    return newOrder;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Left: Product Catalog & Search (Narrower width as requested) */}
      <div className="w-full lg:w-[48%] xl:w-[46%] 2xl:w-[44%] flex flex-col min-w-0 border-r border-slate-800/80 overflow-hidden shrink-0">
        {/* Search & Barcode Bar */}
        <div className="p-3 md:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row gap-2 shrink-0">
          <form
            onSubmit={handleBarcodeSubmit}
            className="flex-1 relative flex items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm theo Tên, Mã SKU, hoặc quét Mã vạch (Enter)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-24 py-2 text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quét</span>
            </button>
          </form>

          {/* Quick UOM Calculator & Converter Button */}
          <button
            onClick={() => setShowUomCalculator(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 rounded-xl border border-indigo-700/60 text-xs text-indigo-200 transition-all shadow-sm shrink-0"
            title="Bảng tính quy đổi đơn vị tính & giá tương ứng (Thùng, Cuộn, Mét, Kg, Gam)"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Quy Đổi ĐVT</span>
          </button>

          {/* Direct AI Assistant Trigger for Sales Cashier */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 rounded-xl border border-blue-500/50 text-xs text-blue-200 transition-all shadow-sm shrink-0 group"
              title="Mở Trợ Lý AI GP-Copilot: Tra cứu quy cách ĐVT, giá bán, chính sách bảo hành, tư vấn khách (Phím tắt: F1)"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="font-bold">Trợ Lý AI</span>
              <span className="px-1 py-0.2 bg-blue-500/30 text-cyan-300 text-[10px] font-mono rounded">F1</span>
            </button>
          )}

          {/* Hardware status badge & modal trigger */}
          {onOpenDevices && (
            <button
              onClick={onOpenDevices}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 text-xs text-blue-300 transition-colors shrink-0"
              title="Cấu hình máy in bill K80, máy quét 2D, két tiền, cân điện tử PC"
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span>Thiết Bị PC</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>
          )}

          {/* Shift status banner */}
          <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
            <span>{currentShift?.staffName || 'Thu ngân'}</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-3 md:px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-3 md:p-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-slate-600" />
              <p className="text-sm font-medium">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-xs text-slate-500 mt-1">
                Thử tìm với từ khóa khác hoặc chuyển danh mục
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredProducts.map((p) => {
                const inCartItems = cart.filter((item) => item.product.id === p.id);
                const totalInCartQty = inCartItems.reduce((s, i) => s + i.quantity, 0);
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStock;
                const hasMultiUOM = p.uomConversions && p.uomConversions.length > 1;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && (hasMultiUOM ? setSelectedUomProduct(p) : addToCart(p))}
                    className={`group relative bg-slate-900 border rounded-xl overflow-hidden transition-all duration-150 flex flex-col justify-between cursor-pointer select-none ${
                      isOutOfStock
                        ? 'opacity-50 border-slate-800 cursor-not-allowed'
                        : totalInCartQty > 0
                        ? 'border-emerald-500/80 ring-1 ring-emerald-500/30 bg-slate-900/90'
                        : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-850 hover:shadow-lg'
                    }`}
                  >
                    {/* Image & Badges */}
                    <div className="relative aspect-4/3 bg-slate-800 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      {totalInCartQty > 0 && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded-full shadow-md">
                          x{totalInCartQty}
                        </div>
                      )}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-2 py-1 rounded border border-rose-800">
                            Hết Hàng
                          </span>
                        </div>
                      ) : isLowStock ? (
                        <div className="absolute bottom-1.5 left-1.5 bg-rose-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Còn {p.stock} {p.unit}
                        </div>
                      ) : (
                        <div className="absolute bottom-1.5 left-1.5 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
                          Kho: {p.stock} {p.unit}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {p.sku}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 mt-0.5 group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </h4>
                      </div>

                      {/* Multi-unit quick buttons showing each unit & its corresponding price */}
                      {hasMultiUOM && (
                        <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-indigo-300 font-semibold">
                            <span className="flex items-center space-x-1">
                              <Scale className="w-3 h-3 text-indigo-400" />
                              <span>Chọn ĐVT & Giá:</span>
                            </span>
                            <span className="text-[9px] text-indigo-400 font-normal">
                              ({p.uomConversions?.length} ĐVT)
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {p.uomConversions?.map((uom) => (
                              <button
                                key={uom.unit}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p, uom.unit, 1, uom.sellingPrice, uom.costPrice, uom.ratioToBase);
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-[10px] font-semibold text-slate-200 rounded-lg border border-slate-700/80 transition-colors flex items-center justify-between group/btn"
                                title={`Bán theo ${uom.unit} với giá ${formatVND(uom.sellingPrice)}`}
                              >
                                <span className="truncate">{uom.unit}</span>
                                <span className="text-[10px] font-mono text-emerald-400 group-hover/btn:text-slate-950 font-bold ml-1">
                                  {formatVND(uom.sellingPrice)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Base Price */}
                      <div className="pt-1 border-t border-slate-800/80 flex items-baseline justify-between">
                        <span className="text-xs md:text-sm font-extrabold text-emerald-400 font-mono">
                          {formatVND(p.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          /{p.unit} (Chuẩn)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart, Customer & Checkout Area (Wider width as requested) */}
      <div className="flex-1 w-full lg:w-[52%] xl:w-[54%] 2xl:w-[56%] bg-slate-900/95 flex flex-col min-w-0 border-t lg:border-t-0 border-slate-800 shadow-2xl overflow-hidden">
        {/* Customer Header & Delivery Info Panel */}
        <div className="p-3 border-b border-slate-800 bg-slate-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Khách Hàng & Thông Tin Giao Hàng:</span>
            </span>
            <button
              onClick={() => setShowQuickAddCust(!showQuickAddCust)}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showQuickAddCust ? 'Đóng' : '+ Thêm nhanh'}</span>
            </button>
          </div>

          {showQuickAddCust ? (
            <form
              onSubmit={handleQuickCreateCustomer}
              className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2 mb-2 animate-in fade-in"
            >
              <div className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                <UserPlus className="w-3 h-3" />
                <span>Thêm Mới Khách Hàng Nhanh:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="Tên khách hàng (*)"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Số điện thoại (*)"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <input
                type="text"
                placeholder="Địa chỉ giao hàng (Tùy chọn)"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center space-x-1.5">
                <label className="text-[10px] text-slate-400 shrink-0">Công nợ đầu kì (nếu có):</label>
                <input
                  type="number"
                  value={newCustDebt || ''}
                  onChange={(e) => setNewCustDebt(Number(e.target.value))}
                  placeholder="0 đ"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuickAddCust(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow"
                >
                  Lưu & Chọn Ngay
                </button>
              </div>
            </form>
          ) : (
            /* Customer Selector Dropdown */
            <div className="relative">
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const cust = customers.find((c) => c.id === e.target.value);
                  setSelectedCustomer(cust || null);
                  if (cust && cust.address) {
                    setCustomerDeliveryAddress(cust.address);
                  } else {
                    setCustomerDeliveryAddress('');
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8"
              >
                <option value="">-- Khách lẻ vãng lai (Không lưu tên) --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.phone} ({c.tier}) {c.debt > 0 ? `[Nợ: ${formatVND(c.debt)}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Detailed Customer & Delivery Info Box */}
          {selectedCustomer ? (
            <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-700/80 space-y-2 text-xs">
              {/* Row 1: Name, Phone & Loyalty Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[11px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs">{selectedCustomer.name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({selectedCustomer.phone})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedCustomer.tier === 'Kim Cương'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : selectedCustomer.tier === 'Vàng'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {selectedCustomer.tier} ({selectedCustomer.points}đ)
                  </span>
                </div>
              </div>

              {/* Row 2: Current Debt status */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                <span className="text-slate-400">Công nợ hiện tại:</span>
                <span className={`font-mono font-bold ${
                  selectedCustomer.debt > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedCustomer.debt > 0
                    ? `Đang nợ ${formatVND(selectedCustomer.debt)}`
                    : '0 đ (Không nợ)'}
                </span>
              </div>

              {/* Row 3 & 4: Delivery Address & Order Note in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>Địa chỉ giao nhận:</span>
                  </span>
                  <input
                    type="text"
                    value={customerDeliveryAddress}
                    onChange={(e) => setCustomerDeliveryAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng cho shipper..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-indigo-400" />
                    <span>Ghi chú đơn hàng / Shipper:</span>
                  </span>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Ghi chú giao hàng, giờ giao, lưu ý..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Guest Customer: Optional Delivery Address & Notes in 2 columns */
            <div className="p-2 bg-slate-850/70 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Giao hàng cho khách lẻ (Tùy chọn):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerDeliveryAddress}
                  onChange={(e) => setCustomerDeliveryAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng (nếu có ship)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ghi chú đơn hàng..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto divide-y divide-slate-800/80">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
              <ShoppingBag className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Giỏ hàng đang trống</p>
              <p className="text-[11px] text-slate-500 text-center max-w-xs mt-1">
                Chọn sản phẩm từ danh mục bên trái, chọn ĐVT (Thùng, Cuộn, Mét, Kg, Gam) hoặc quét mã vạch
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const activePrice = item.unitPrice ?? item.product.sellingPrice;
              const activeCost = item.costPrice ?? item.product.costPrice;
              const activeUnit = item.selectedUOM || item.product.unit;
              const hasMultiUOM =
                item.product.uomConversions && item.product.uomConversions.length > 1;

              const itemTotal = Math.round(
                activePrice * (1 - item.discountPercent / 100) * item.quantity
              );

              return (
                <div key={`${item.product.id}_${activeUnit}_${idx}`} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  {/* Product Title & Remove */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <h5 className="text-xs font-semibold text-slate-100 line-clamp-1">
                        {item.product.name}
                      </h5>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                        <span>{item.product.sku}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          {formatVND(activePrice)} / {activeUnit}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Xóa món"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Multi-UOM Selector Bar */}
                  <div className="flex items-center justify-between bg-slate-850/90 rounded-lg p-1.5 border border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold text-slate-400">ĐVT:</span>
                      {hasMultiUOM ? (
                        <select
                          value={activeUnit}
                          onChange={(e) => changeCartItemUOM(idx, e.target.value)}
                          className="bg-slate-900 border border-indigo-700/60 text-indigo-300 font-bold rounded px-2 py-0.5 text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                        >
                          {item.product.uomConversions?.map((uom) => (
                            <option key={uom.unit} value={uom.unit}>
                              {uom.unit} ({formatVND(uom.sellingPrice)})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-200 font-bold text-xs rounded border border-slate-700">
                          {activeUnit}
                        </span>
                      )}
                    </div>

                    {/* Ratio info badge */}
                    {item.ratioToBase && item.ratioToBase !== 1 && (
                      <span className="text-[10px] text-indigo-300 font-mono">
                        (1 {activeUnit} = {item.ratioToBase} {item.product.unit})
                      </span>
                    )}
                  </div>

                  {/* Quantity Stepper & Price Breakdown */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Quantity input & stepper */}
                    <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-700 text-slate-300"
                        title="Giảm 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          setExactQuantity(idx, Math.max(0, Number(e.target.value)))
                        }
                        className="w-12 bg-transparent text-center text-xs font-bold text-white font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-700 text-slate-300"
                        title="Tăng 1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Discount % */}
                    <div className="flex items-center space-x-1">
                      <Percent className="w-3 h-3 text-slate-500" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent || ''}
                        onChange={(e) =>
                          updateItemDiscount(idx, Number(e.target.value))
                        }
                        placeholder="0"
                        className="w-10 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[11px] text-center text-white focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400">%</span>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 font-mono block">
                        {formatVND(itemTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Calculation & Voucher Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-3 shrink-0">
          {/* Coupon Code Input */}
          <div>
            <div className="flex space-x-1.5">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Mã voucher (VD: MAXSTORE10)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleApplyPromo}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                Áp dụng
              </button>
            </div>

            {appliedPromo && (
              <div className="mt-1 text-[11px] text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Đã áp dụng mã: {appliedPromo.title}</span>
              </div>
            )}
            {promoError && (
              <div className="mt-1 text-[11px] text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{promoError}</span>
              </div>
            )}
          </div>

          {/* Breakdown Lines */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tiền hàng ({cart.reduce((s, i) => s + i.quantity, 0)} món):</span>
              <span className="text-slate-200 font-mono">{formatVND(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Giảm giá / Voucher:</span>
                <span className="font-mono">-{formatVND(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-400">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Thuế VAT ({settings.vatDefault}%):</span>
              </label>
              <span className="text-slate-200 font-mono">
                +{formatVND(taxAmount)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-white">KHÁCH PHẢI TRẢ:</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {formatVND(finalTotal)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-1">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              title="Xóa giỏ hàng"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <CreditCard className="w-4 h-4" />
              <span>THANH TOÁN ({formatVND(finalTotal)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          subtotal={subtotal}
          discountAmount={discountAmount}
          discountCode={appliedPromo?.code}
          taxAmount={taxAmount}
          taxRate={taxRate}
          total={finalTotal}
          totalCost={totalCost}
          selectedCustomer={selectedCustomer}
          deliveryAddress={customerDeliveryAddress}
          initialNote={orderNote}
          itemsCount={cart.reduce((s, i) => s + i.quantity, 0)}
          settings={settings}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* Receipt Modal Preview */}
      {lastCompletedOrder && (
        <ReceiptModal
          order={lastCompletedOrder}
          settings={settings}
          onClose={() => setLastCompletedOrder(null)}
          onSwitchToA4={() => {
            setPrintA4Order(lastCompletedOrder);
            setLastCompletedOrder(null);
          }}
        />
      )}

      {/* A4/A5 Gia Phúc Document Print Modal */}
      {printA4Order && (
        <PrintInvoiceModal
          isOpen={!!printA4Order}
          order={printA4Order}
          settings={settings}
          onClose={() => setPrintA4Order(null)}
        />
      )}

      {/* Multi-UOM Calculator Modal */}
      <UomCalculatorModal
        isOpen={showUomCalculator}
        onClose={() => setShowUomCalculator(false)}
        products={products}
        onAddToCart={addToCart}
      />

      {/* Select Product UOM & Price Modal */}
      <SelectProductUomModal
        isOpen={!!selectedUomProduct}
        onClose={() => setSelectedUomProduct(null)}
        product={selectedUomProduct}
        onConfirm={(prod, unit, qty, unitPrice, costPrice, ratioToBase) => {
          addToCart(prod, unit, qty, unitPrice, costPrice, ratioToBase);
        }}
      />
    </div>
  );
};
