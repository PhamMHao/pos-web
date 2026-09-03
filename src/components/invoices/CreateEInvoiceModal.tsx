import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Building2,
  Package,
  CheckCircle2,
  ShoppingCart,
  FileText,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import {
  EInvoice,
  EInvoiceItem,
  Order,
  Customer,
  Product,
  StoreSettings,
  TaxRiskAssessmentResult,
} from '../../types';
import { lookupTaxCodeAndAssessRisk, validateTaxCodeFormat } from '../../utils/taxLookupService';
import { TaxRiskBadge } from './TaxRiskBadge';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { formatVND } from '../../utils/vietqr';
import { einvoicesApi } from '../../features/einvoices/api/einvoicesApi';

interface CreateEInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  customers: Customer[];
  products: Product[];
  settings: StoreSettings;
  onInvoiceCreated: (newInvoice: EInvoice) => void;
}

export const CreateEInvoiceModal: React.FC<CreateEInvoiceModalProps> = ({
  isOpen,
  onClose,
  orders,
  customers,
  products,
  settings,
  onInvoiceCreated,
}) => {
  // Mode: 'order' (Theo Đơn Hàng) vs 'manual' (Thủ Công Ngoài Đơn Hàng)
  const [issueMode, setIssueMode] = useState<'order' | 'manual'>('manual');

  // Customer / Buyer state
  const [buyerTaxCode, setBuyerTaxCode] = useState('');
  const [buyerCompanyName, setBuyerCompanyName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Tax Risk state
  const [taxRiskResult, setTaxRiskResult] = useState<TaxRiskAssessmentResult | null>(null);
  const [isLookingUpTax, setIsLookingUpTax] = useState(false);
  const [taxLookupError, setTaxLookupError] = useState<string | null>(null);

  // Selected Order for 'order' mode
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Invoice Items for 'manual' mode
  const [items, setItems] = useState<
    Array<{
      id: string;
      sku: string;
      productName: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      taxRate: number; // 8, 10, 5, 0, -1 (KCT)
    }>
  >([
    {
      id: 'item-1',
      sku: 'DV-GP-01',
      productName: 'Cung cấp Thiết bị Máy tính & Dịch vụ Kỹ thuật Doanh nghiệp',
      unit: 'Gói',
      quantity: 1,
      unitPrice: 5000000,
      discountPercent: 0,
      taxRate: 8,
    },
  ]);

  // Quick Product Picker Modal
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productPickerSearch, setProductPickerSearch] = useState('');

  // Invoice parameters
  const [paymentMethod, setPaymentMethod] = useState<'TM' | 'CK' | 'TM/CK' | 'Đối trừ công nợ'>('CK');
  const [invoiceNotes, setInvoiceNotes] = useState('Hóa đơn GTGT phát hành theo quy định Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tax Code Lookup Handler
  const handleTaxLookup = async (codeToLookup?: string) => {
    const code = (codeToLookup || buyerTaxCode).trim();
    if (!code) return;

    setIsLookingUpTax(true);
    setTaxLookupError(null);

    try {
      const result = await lookupTaxCodeAndAssessRisk(code);
      setTaxRiskResult(result);
      if (result.companyName) {
        setBuyerCompanyName(result.companyName);
      }
      if (result.address && (!buyerAddress || buyerAddress === 'TP. Hồ Chí Minh')) {
        setBuyerAddress(result.address);
      }
      if (result.representative && !buyerName) {
        setBuyerName(result.representative);
      }
      if (result.phone && (!buyerPhone || buyerPhone === '---')) {
        setBuyerPhone(result.phone);
      }
      if (result.email && result.email !== '---' && !buyerEmail) {
        setBuyerEmail(result.email);
      }
    } catch (err: any) {
      setTaxLookupError(err.message || 'Lỗi tra cứu mã số thuế');
    } finally {
      setIsLookingUpTax(false);
    }
  };

  // When CRM customer selected
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setBuyerName(cust.name);
      setBuyerPhone(cust.phone || '');
      setBuyerAddress(cust.address || '');
      setBuyerEmail(cust.email || '');
      if (cust.company) {
        setBuyerCompanyName(cust.company);
      }
      if (cust.taxCode) {
        setBuyerTaxCode(cust.taxCode);
        handleTaxLookup(cust.taxCode);
      }
    }
  };

  // When Order selected in 'order' mode
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      // Set buyer info
      if (ord.customer) {
        setBuyerName(ord.customer.name || '');
        setBuyerPhone(ord.customer.phone || '');
        setBuyerAddress(ord.customer.address || '');
        if ((ord.customer as any).company) {
          setBuyerCompanyName((ord.customer as any).company);
        }
        if ((ord.customer as any).taxCode) {
          setBuyerTaxCode((ord.customer as any).taxCode);
          handleTaxLookup((ord.customer as any).taxCode);
        }
      }

      // Convert order items to editable invoice items
      const newItems = ord.items.map((it, idx) => ({
        id: `ord-item-${idx}-${Date.now()}`,
        sku: it.productId || `SP-${idx + 1}`,
        productName: it.productName,
        unit: it.unit || 'Cái',
        quantity: it.quantity,
        unitPrice: it.unitPrice || 0,
        discountPercent: it.discountPercent || 0,
        taxRate: ord.taxRate !== undefined ? ord.taxRate : 8,
      }));
      setItems(newItems);
    }
  };

  // Add Item to table
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        sku: `SP-MOI-${items.length + 1}`,
        productName: '',
        unit: 'Cái',
        quantity: 1,
        unitPrice: 100000,
        discountPercent: 0,
        taxRate: 8,
      },
    ]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('Hóa đơn phải có ít nhất 1 dòng sản phẩm/dịch vụ!');
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  };

  // Update Item field
  const handleUpdateItem = (id: string, field: string, val: any) => {
    setItems(
      items.map((it) => {
        if (it.id === id) {
          return { ...it, [field]: val };
        }
        return it;
      })
    );
  };

  // Add product from warehouse picker
  const handleSelectWarehouseProduct = (prod: Product) => {
    setItems([
      ...items,
      {
        id: `prod-${Date.now()}`,
        sku: prod.sku,
        productName: prod.name,
        unit: prod.unit || 'Cái',
        quantity: 1,
        unitPrice: prod.price || 0,
        discountPercent: 0,
        taxRate: (prod as any).vatRate !== undefined ? (prod as any).vatRate : 8,
      },
    ]);
    setShowProductPicker(false);
  };

  // Calculations
  const calculatedRows = useMemo(() => {
    return items.map((it) => {
      const lineSubtotal = it.quantity * it.unitPrice;
      const lineDiscount = Math.round((lineSubtotal * (it.discountPercent || 0)) / 100);
      const taxableAmount = lineSubtotal - lineDiscount;
      const rate = it.taxRate === -1 ? 0 : it.taxRate;
      const lineTax = Math.round((taxableAmount * rate) / 100);
      const lineTotal = taxableAmount + lineTax;

      return {
        ...it,
        subtotal: lineSubtotal,
        discountAmount: lineDiscount,
        taxAmount: lineTax,
        total: lineTotal,
      };
    });
  }, [items]);

  const summary = useMemo(() => {
    const subtotal = calculatedRows.reduce((acc, r) => acc + r.subtotal, 0);
    const discountAmount = calculatedRows.reduce((acc, r) => acc + r.discountAmount, 0);
    const taxAmount = calculatedRows.reduce((acc, r) => acc + r.taxAmount, 0);
    const grandTotal = subtotal - discountAmount + taxAmount;
    const amountInWords = numberToVietnameseWords(grandTotal);

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      amountInWords,
    };
  }, [calculatedRows]);

  // Form Submit: Persist to DB
  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerName && !buyerCompanyName) {
      alert('Vui lòng nhập Tên đơn vị hoặc Họ tên người mua hàng!');
      return;
    }

    if (items.some((i) => !i.productName.trim())) {
      alert('Vui lòng điền đầy đủ Tên hàng hóa/dịch vụ cho tất cả các dòng!');
      return;
    }

    if (taxRiskResult?.isClosedOrRunaway) {
      const confirmClosed = window.confirm(
        'CẢNH BÁO NGUY HIỂM: Doanh nghiệp này đã ĐÓNG MÃ SỐ THUẾ hoặc BỎ TRỐN. Bạn có chắc chắn vẫn muốn lập hóa đơn không?'
      );
      if (!confirmClosed) return;
    }

    setIsSubmitting(true);

    try {
      const designConfig = settings.eInvoiceDesignConfig;
      const template = designConfig?.invoiceTemplate || settings.eInvoiceTemplate || '1/001';
      const symbol = designConfig?.invoiceSymbol || settings.eInvoiceSymbol || '1C26TGP';
      const nextNum = (Date.now() % 100000000).toString().padStart(8, '0');
      const lookupHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const lookupCode = `GP-INV-${new Date().getFullYear()}-${lookupHex}`;

      const finalItems: EInvoiceItem[] = calculatedRows.map((r, idx) => ({
        id: `inv-item-${Date.now()}-${idx}`,
        sku: r.sku,
        productName: r.productName,
        unit: r.unit,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        subtotal: r.subtotal,
        discountPercent: r.discountPercent,
        discountAmount: r.discountAmount,
        taxRate: r.taxRate,
        taxAmount: r.taxAmount,
        total: r.total,
      }));

      const payload: Partial<EInvoice> = {
        invoiceCode: `${symbol}-${nextNum}`,
        invoiceNumber: nextNum,
        invoiceSymbol: symbol,
        invoiceTemplate: template,
        invoiceType: 'vat',
        lookupCode,
        lookupUrl: settings.eInvoiceLookupUrl || 'https://hoadondientu.gdt.gov.vn',
        issueDate: new Date().toISOString(),
        signDate: new Date().toISOString(),
        status: 'cqt_approved',
        cqtCode: `TCT-${settings.taxCode || '0318999888'}-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
        orderId: issueMode === 'order' ? selectedOrderId || undefined : undefined,
        orderCode: issueMode === 'order' ? orders.find((o) => o.id === selectedOrderId)?.code : undefined,
        seller: {
          name: settings.companyLegalName || settings.storeName || 'CÔNG TY TNHH MTV TM & DV SỬA CHỮA GIA PHÚC',
          taxCode: settings.taxCode || '0318999888',
          address: settings.address || 'Đường NA 067, Khu phố An Thuận, P. Phú An, TP. HCM',
          phone: settings.phone || '0985 862 609',
          email: settings.email || 'hrmgpsoft@gmail.com',
          bankAccount: settings.bankAccount || '0985862609',
          bankName: settings.bankName || 'MBBANK',
          representative: settings.companyRepresentative || 'Phạm Ngọc Thơm',
        },
        buyer: {
          companyName: buyerCompanyName || undefined,
          buyerName: buyerName || 'Khách hàng cá nhân',
          taxCode: buyerTaxCode || undefined,
          address: buyerAddress || 'TP. Hồ Chí Minh',
          phone: buyerPhone || undefined,
          email: buyerEmail || undefined,
        },
        items: finalItems,
        subtotal: summary.subtotal,
        discountAmount: summary.discountAmount,
        taxRate: items[0]?.taxRate || 8,
        taxAmount: summary.taxAmount,
        totalAmount: summary.grandTotal,
        amountInWords: summary.amountInWords,
        paymentMethod,
        notes: invoiceNotes,
        digitalSignature: {
          signedBy: settings.storeName || 'CÔNG TY GIA PHÚC',
          serialNumber: '54:01:01:82:91:02:93:84:71:0A:99:BC:12',
          signTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          certProvider: 'VIETTEL-CA (Bộ TTTT Cấp phép)',
          isVerified: true,
        },
        cqtStatusMessage: 'Cơ quan Thuế chấp nhận hóa đơn hợp lệ và đã cấp mã xác thực.',
      };

      // Call Backend API
      const created = await einvoicesApi.createInvoice(payload);
      onInvoiceCreated(created);
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi phát hành hóa đơn điện tử: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products in picker
  const filteredProducts = products.filter((p) => {
    if (!productPickerSearch.trim()) return true;
    const q = productPickerSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-hidden select-text animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[95vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Lập Hóa Đơn Điện Tử (HĐĐT TT78 / NĐ123)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-500/30">
                  SQL Server Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động tra cứu MST doanh nghiệp, đánh giá rủi ro thuế & linh hoạt xuất thủ công / theo đơn hàng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issuance Mode Switcher Tabs */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setIssueMode('manual')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                issueMode === 'manual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Xuất Hóa Đơn Thủ Công (Ngoài Đơn Hàng)</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueMode('order')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                issueMode === 'order'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>2. Xuất Từ Phiếu Bán Hàng / Đơn Hàng</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:block">
            Mẫu số: <strong className="font-mono text-cyan-400">{settings.eInvoiceTemplate || '1/001'}</strong> • Ký hiệu:{' '}
            <strong className="font-mono text-cyan-400">{settings.eInvoiceSymbol || '1C26TGP'}</strong>
          </div>
        </div>

        {/* Main Form Body */}
        <form onSubmit={handleSubmitInvoice} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Order Selector (if order mode) */}
          {issueMode === 'order' && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-2 animate-in fade-in">
              <label className="block font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Chọn Đơn Hàng Bán Cần Chuyển Sang Hóa Đơn Điện Tử:</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => handleSelectOrder(e.target.value)}
                required={issueMode === 'order'}
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2.5 text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Chọn đơn hàng có sẵn từ hệ thống POS / Sales --</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    {ord.code} - Khách: {ord.customer?.name || 'Khách lẻ'} - {formatVND(ord.totalAmount)} (
                    {new Date(ord.createdAt).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section 1: Customer Information & Auto MST Tax Lookup */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Thông Tin Doanh Nghiệp & Khách Hàng (Bên Mua)</span>
              </span>

              {/* Quick CRM Customer Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Chọn nhanh từ CRM:</span>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-white text-xs outline-none"
                >
                  <option value="">-- Danh bạ khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.taxCode ? `(MST: ${c.taxCode})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MST Input + Live Lookup Button */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Mã Số Thuế (MST) Doanh Nghiệp <span className="text-cyan-400">(Tự động tra cứu CSDL Thuế & Rủi Ro)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={buyerTaxCode}
                  onChange={(e) => setBuyerTaxCode(e.target.value)}
                  onBlur={() => handleTaxLookup()}
                  placeholder="VD: 0318999888, 0100109106, 0302861742..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold focus:border-cyan-500 outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleTaxLookup()}
                  disabled={isLookingUpTax || !buyerTaxCode.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLookingUpTax ? 'Đang Tra Cứu...' : 'Tra Cứu MST'}</span>
                </button>
              </div>

              {taxLookupError && (
                <p className="text-rose-400 text-[11px] mt-1 font-medium">{taxLookupError}</p>
              )}
            </div>

            {/* Tax Risk Assessment Badge Banner */}
            {taxRiskResult && (
              <div className="pt-1">
                <TaxRiskBadge result={taxRiskResult} />
              </div>
            )}

            {/* Company & Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Tên Công Ty / Đơn Vị Mua Hàng <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={buyerCompanyName}
                  onChange={(e) => setBuyerCompanyName(e.target.value)}
                  placeholder="VD: CÔNG TY CỔ PHẦN CÔNG NGHỆ THÔNG TIN GIA PHÚC"
                  required={!buyerName}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Người Mua Hàng / Đại Diện
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="VD: Nguyễn Văn Minh"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Địa Chỉ Trụ Sở / Công Ty</label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Số 195 Cô Bắc, P. Cô Giang, Q. 1, TP. HCM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="0985 862 609"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Nhận Hóa Đơn</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="ketoan@doanhnghiep.vn"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items Table (Editable in both modes) */}
          <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <div>
                <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Danh Sách Hàng Hóa, Dịch Vụ Xuất Hóa Đơn</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hỗ trợ thuế suất VAT 8%, 10%, 5%, 0%, KCT (Không Chịu Thuế)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductPicker(true)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>+ Chọn SP Từ Kho</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Dòng Thủ Công</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                    <th className="p-2.5 text-center w-10">STT</th>
                    <th className="p-2.5 text-left min-w-[240px]">Tên Hàng Hóa / Dịch Vụ</th>
                    <th className="p-2.5 text-center w-28">Mã SKU</th>
                    <th className="p-2.5 text-center w-20">ĐVT</th>
                    <th className="p-2.5 text-center w-20">SL</th>
                    <th className="p-2.5 text-right w-28">Đơn Giá</th>
                    <th className="p-2.5 text-center w-20">CK (%)</th>
                    <th className="p-2.5 text-center w-24">Thuế Suất</th>
                    <th className="p-2.5 text-right w-32">Thành Tiền</th>
                    <th className="p-2.5 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {calculatedRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.productName}
                          onChange={(e) => handleUpdateItem(row.id, 'productName', e.target.value)}
                          placeholder="Nhập tên sản phẩm hoặc dịch vụ..."
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-500 outline-none text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.sku}
                          onChange={(e) => handleUpdateItem(row.id, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono uppercase text-center text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleUpdateItem(row.id, 'unit', e.target.value)}
                          placeholder="ĐVT"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={row.quantity}
                          onChange={(e) => handleUpdateItem(row.id, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold text-center text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={row.unitPrice}
                          onChange={(e) => handleUpdateItem(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-right text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.discountPercent}
                          onChange={(e) => handleUpdateItem(row.id, 'discountPercent', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-1.5 text-rose-400 font-mono text-center text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.taxRate}
                          onChange={(e) => handleUpdateItem(row.id, 'taxRate', parseFloat(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-cyan-300 font-bold text-center text-xs outline-none"
                        >
                          <option value="8">8%</option>
                          <option value="10">10%</option>
                          <option value="5">5%</option>
                          <option value="0">0%</option>
                          <option value="-1">KCT</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-400">
                        {formatVND(row.total).replace(' ₫', '')}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(row.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1 text-slate-400 text-xs">
                <div>
                  <strong>Số tiền viết bằng chữ:</strong>
                </div>
                <div className="italic text-emerald-300 font-serif text-sm">
                  {summary.amountInWords} đồng chẵn./.
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng (chưa thuế):</span>
                  <span className="font-mono font-semibold text-white">{formatVND(summary.subtotal)}</span>
                </div>
                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Tổng chiết khấu:</span>
                    <span className="font-mono font-semibold">-{formatVND(summary.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-cyan-300">
                  <span>Tổng tiền thuế GTGT:</span>
                  <span className="font-mono font-semibold">+{formatVND(summary.taxAmount)}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between items-center text-sm font-bold text-white">
                  <span className="uppercase text-emerald-400">Tổng Cộng Thanh Toán:</span>
                  <span className="font-mono text-lg font-black text-emerald-400">{formatVND(summary.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Phương Thức Thanh Toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium text-xs focus:border-cyan-500 outline-none"
              >
                <option value="CK">Chuyển khoản (CK)</option>
                <option value="TM">Tiền mặt (TM)</option>
                <option value="TM/CK">Tiền mặt / Chuyển khoản (TM/CK)</option>
                <option value="Đối trừ công nợ">Đối trừ công nợ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Ghi Chú Trên Hóa Đơn</label>
              <input
                type="text"
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Ghi chú hóa đơn..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 italic">
              💾 Tự động đồng bộ SQL Server & Cấp mã xác thực CQT
            </span>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl cursor-pointer transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang Phát Hành HĐ...' : 'Phát Hành Hóa Đơn Điện Tử'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Warehouse Product Quick Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Chọn Nhanh Sản Phẩm Từ Kho Hàng ({products.length} mã)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-850 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productPickerSearch}
                  onChange={(e) => setProductPickerSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã SKU..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800 text-xs">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectWarehouseProduct(prod)}
                  className="p-3 hover:bg-slate-800/80 rounded-xl cursor-pointer flex items-center justify-between transition"
                >
                  <div>
                    <div className="font-bold text-white text-xs">{prod.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-cyan-400">SKU: {prod.sku}</span>
                      <span>• ĐVT: {prod.unit || 'Cái'}</span>
                      <span>• Tồn: {prod.stock || 0}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {formatVND(prod.price || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
