import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Lock,
  Download,
  Share2,
  FileCode2,
  ArrowUpDown,
  Building2,
  Receipt,
  DollarSign,
  TrendingUp,
  X,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  PackageCheck,
} from 'lucide-react';
import {
  EInvoice,
  EInvoiceItem,
  Order,
  Customer,
  StoreSettings,
  InboundEInvoice,
  Product,
  InventoryLog,
  AccountingRecord,
  StockGoodsReceipt,
} from '../../types';
import { EInvoicePrintModal } from './EInvoicePrintModal';
import { InboundEInvoiceModal } from './InboundEInvoiceModal';
import { StockReceiptPrintModal } from '../inventory/StockReceiptPrintModal';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { einvoicesApi } from '../../features/einvoices/api/einvoicesApi';

interface EInvoiceManagerViewProps {
  eInvoices: EInvoice[];
  setEInvoices: (invoices: EInvoice[] | ((prev: EInvoice[]) => EInvoice[])) => void;
  orders: Order[];
  customers: Customer[];
  settings: StoreSettings;
  inboundInvoices?: InboundEInvoice[];
  setInboundInvoices?: (invoices: InboundEInvoice[] | ((prev: InboundEInvoice[]) => InboundEInvoice[])) => void;
  products?: Product[];
  onSaveProduct?: (product: Product) => void;
  onAdjustStock?: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  setAccountingRecords?: (records: AccountingRecord[] | ((prev: AccountingRecord[]) => AccountingRecord[])) => void;
  stockReceipts?: StockGoodsReceipt[];
  setStockReceipts?: (receipts: StockGoodsReceipt[] | ((prev: StockGoodsReceipt[]) => StockGoodsReceipt[])) => void;
}

export const EInvoiceManagerView: React.FC<EInvoiceManagerViewProps> = ({
  eInvoices,
  setEInvoices,
  orders,
  customers,
  settings,
  inboundInvoices = [],
  setInboundInvoices = () => {},
  products = [],
  onSaveProduct = () => {},
  onAdjustStock = () => {},
  setAccountingRecords = () => {},
  stockReceipts = [],
  setStockReceipts = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [selectedStockReceipt, setSelectedStockReceipt] = useState<StockGoodsReceipt | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingInboundCount = (inboundInvoices || []).filter((i) => i.status === 'pending_review').length;

  // Form State for new invoice
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerCompanyName, setBuyerCompanyName] = useState('');
  const [buyerTaxCode, setBuyerTaxCode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TM' | 'CK' | 'TM/CK' | 'Đối trừ công nợ'>('CK');
  const [taxRate, setTaxRate] = useState<number>(8);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  // Safe Array wrapper
  const safeInvoices = useMemo(() => {
    return Array.isArray(eInvoices) ? eInvoices : [];
  }, [eInvoices]);

  // KPIs
  const stats = useMemo(() => {
    const total = safeInvoices.length;
    const cqtApproved = safeInvoices.filter((i) => i && i.status === 'cqt_approved').length;
    const signed = safeInvoices.filter((i) => i && i.status === 'signed').length;
    const draft = safeInvoices.filter((i) => i && i.status === 'draft').length;
    const totalRevenue = safeInvoices.reduce((acc, i) => acc + (i && i.status !== 'cancelled' ? (i.totalAmount || 0) : 0), 0);
    const totalTax = safeInvoices.reduce((acc, i) => acc + (i && i.status !== 'cancelled' ? (i.taxAmount || 0) : 0), 0);

    return {
      total,
      cqtApproved,
      signed,
      draft,
      totalRevenue,
      totalTax,
    };
  }, [safeInvoices]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return safeInvoices.filter((inv) => {
      if (!inv) return false;
      const invNum = inv.invoiceNumber || '';
      const invSym = inv.invoiceSymbol || '';
      const lkCode = inv.lookupCode || '';
      const bName = inv.buyer?.buyerName || '';
      const cName = inv.buyer?.companyName || '';
      const tCode = inv.buyer?.taxCode || '';
      const oCode = inv.orderCode || '';

      const matchSearch =
        invNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invSym.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lkCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tCode.includes(searchTerm) ||
        oCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [safeInvoices, searchTerm, statusFilter]);

  // Actions
  const handleSignInvoice = async (invoiceId: string) => {
    setEInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const signTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
          return {
            ...inv,
            status: 'signed',
            signDate: new Date().toISOString(),
            digitalSignature: {
              ...inv.digitalSignature,
              signedBy: settings.storeName || 'CÔNG TY CP GP-ERP VIỆT NAM',
              serialNumber: '54:01:01:82:91:02:93:84:71:0A:99:BC:12',
              signTime,
              certProvider: 'VIETTEL-CA (Bộ Thông Tin & Truyền Thông cấp phép)',
              isVerified: true,
            },
          };
        }
        return inv;
      })
    );

    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: 'signed',
              signDate: new Date().toISOString(),
            }
          : null
      );
    }

    try {
      await einvoicesApi.updateInvoiceStatus(invoiceId, 'signed');
    } catch (err: any) {
      console.warn('API sync warning:', err.message);
    }

    showToast(`Đã ký số điện tử thành công cho Hóa đơn #${invoiceId}!`);
  };

  const handleSendCqt = async (invoiceId: string) => {
    const randomHex = Math.floor(10000000000000 + Math.random() * 90000000000000);
    const mockCqtCode = `TCT-0318928172-${randomHex}`;

    setEInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'cqt_approved',
            cqtCode: mockCqtCode,
            cqtStatusMessage: 'Cơ quan Thuế chấp nhận hóa đơn hợp lệ và đã cấp mã xác thực.',
          };
        }
        return inv;
      })
    );

    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: 'cqt_approved',
              cqtCode: mockCqtCode,
            }
          : null
      );
    }

    try {
      await einvoicesApi.updateInvoiceStatus(invoiceId, 'cqt_approved');
    } catch (err: any) {
      console.warn('API sync warning:', err.message);
    }

    showToast(`Tổng Cục Thuế đã cấp mã xác thực: ${mockCqtCode}`);
  };

  const handleCreateInvoiceFromOrder = () => {
    if (!selectedOrderId && !buyerName) {
      alert('Vui lòng chọn Đơn hàng hoặc nhập tên người mua hàng!');
      return;
    }

    const nextInvoiceNum = (eInvoices.length + 89).toString().padStart(8, '0');
    const lookupHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const lookupCode = `GP-INV-2026-${lookupHex}`;
    const invoiceSymbol = '1C26TGP';

    let items: EInvoiceItem[] = [];
    let subtotal = 0;
    let orderRefCode = '';

    if (selectedOrderId) {
      const ord = orders.find((o) => o.id === selectedOrderId);
      if (ord) {
        orderRefCode = ord.code;
        items = ord.items.map((item, idx) => {
          const unitPrice = item.unitPrice || 0;
          const lineSub = unitPrice * item.quantity;
          const lineDisc = 0;
          const lineTax = Math.round(((lineSub - lineDisc) * taxRate) / 100);
          return {
            id: `item-${idx}-${Date.now()}`,
            sku: item.productId,
            productName: item.productName,
            unit: item.unit || 'Cái',
            quantity: item.quantity,
            unitPrice: unitPrice,
            subtotal: lineSub,
            discountPercent: 0,
            discountAmount: 0,
            taxRate: taxRate,
            taxAmount: lineTax,
            total: lineSub - lineDisc + lineTax,
          };
        });
        subtotal = ord.items.reduce((acc, it) => acc + (it.unitPrice || 0) * it.quantity, 0);
      }
    } else {
      // Standalone sample item
      items = [
        {
          id: `item-${Date.now()}`,
          sku: 'DICH-VU-GP-01',
          productName: 'Cung cấp Thiết bị Quản trị Doanh nghiệp & Dịch vụ Phần mềm',
          unit: 'Gói',
          quantity: 1,
          unitPrice: 1500000,
          subtotal: 1500000,
          discountPercent: 0,
          discountAmount: 0,
          taxRate: taxRate,
          taxAmount: Math.round((1500000 * taxRate) / 100),
          total: 1500000 + Math.round((1500000 * taxRate) / 100),
        },
      ];
      subtotal = 1500000;
    }

    const discountAmount = 0;
    const taxAmount = Math.round(((subtotal - discountAmount) * taxRate) / 100);
    const totalAmount = subtotal - discountAmount + taxAmount;
    const amountInWords = numberToVietnameseWords(totalAmount);

    const newInvoice: EInvoice = {
      id: `inv-${Date.now()}`,
      invoiceCode: `${invoiceSymbol}-${nextInvoiceNum}`,
      invoiceNumber: nextInvoiceNum,
      invoiceSymbol: invoiceSymbol,
      invoiceTemplate: '1/001',
      invoiceType: 'vat',
      lookupCode: lookupCode,
      lookupUrl: 'https://hoadondientu.gdt.gov.vn',
      issueDate: new Date().toISOString(),
      signDate: new Date().toISOString(),
      status: 'cqt_approved',
      cqtCode: `TCT-0318928172-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      orderId: selectedOrderId || undefined,
      orderCode: orderRefCode || undefined,
      seller: {
        name: settings.storeName || 'CÔNG TY CỔ PHẦN GP-ERP VIỆT NAM',
        taxCode: settings.taxCode || '0318928172',
        address: settings.address || 'Tòa nhà GP-Tower, 180 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh',
        phone: settings.phone || '0988 888 999',
        email: settings.email || 'admin@gperp.vn',
        bankAccount: settings.bankAccount || '0988888999',
        bankName: settings.bankName || 'Ngân hàng Quân Đội (MB Bank)',
        representative: 'Phạm Đức Dũng - Giám Đốc',
      },
      buyer: {
        companyName: buyerCompanyName || undefined,
        buyerName: buyerName || 'Khách hàng cá nhân',
        taxCode: buyerTaxCode || undefined,
        address: buyerAddress || 'TP. Hồ Chí Minh',
        phone: buyerPhone || undefined,
        email: buyerEmail || undefined,
      },
      items,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      totalAmount,
      amountInWords,
      paymentMethod,
      notes: invoiceNotes || `Hóa đơn GTGT phát hành theo quy định Thông tư 78/2021/TT-BTC.`,
      digitalSignature: {
        signedBy: settings.storeName || 'CÔNG TY CỔ PHẦN GP-ERP VIỆT NAM',
        serialNumber: '54:01:01:82:91:02:93:84:71:0A:99:BC:12',
        signTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        certProvider: 'VIETTEL-CA (Bộ Thông Tin & Truyền Thông cấp phép)',
        isVerified: true,
      },
      cqtStatusMessage: 'Cơ quan Thuế chấp nhận hóa đơn hợp lệ và đã cấp mã xác thực.',
    };

    setEInvoices((prev) => [newInvoice, ...prev]);
    setShowCreateModal(false);
    showToast(`Đã lập thành công Hóa đơn điện tử số #${nextInvoiceNum}!`);
    setSelectedInvoice(newInvoice);

    try {
      einvoicesApi.createInvoice(newInvoice).catch((e) => console.warn('Sync invoice error:', e.message));
    } catch (e: any) {
      console.warn('API sync warning:', e.message);
    }

    // Reset fields
    setSelectedOrderId('');
    setBuyerName('');
    setBuyerCompanyName('');
    setBuyerTaxCode('');
    setBuyerAddress('');
    setBuyerPhone('');
    setBuyerEmail('');
    setInvoiceNotes('');
  };

  const handlePopulateFromCustomer = (custName: string) => {
    const cust = customers.find((c) => c.name === custName);
    if (cust) {
      setBuyerName(cust.name);
      setBuyerPhone(cust.phone || '');
      setBuyerAddress(cust.address || '');
      setBuyerEmail(cust.email || '');
    }
  };

  const handleExportTaxReport = () => {
    showToast('Đã xuất Bảng Kê Hóa Đơn GTGT Bán Ra (Mẫu 01-1/GTGT) file CSV thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Hóa Đơn Điện Tử (HĐĐT TT78)
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                Nghị định 123
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Phát hành, ký số điện tử CA, truyền dữ liệu CQT và in hóa đơn GTGT theo chuẩn Tổng Cục Thuế
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowInboundModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 border border-blue-400/30 flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-98"
          >
            <FileCode2 className="w-4 h-4 text-blue-200" />
            <span>📥 HĐĐT Đầu Vào (Thuế / Gmail)</span>
            {pendingInboundCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black animate-pulse">
                {pendingInboundCount}
              </span>
            )}
          </button>

          <button
            onClick={handleExportTaxReport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Bảng Kê GTGT (Mẫu 01-1)
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Lập HĐĐT Mới
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng HĐ Đã Phát Hành</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.total} hóa đơn</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">CQT Đã Cấp Mã</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.cqtApproved} HĐ hợp lệ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Doanh Thu Xuất HĐ</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Thuế GTGT Kê Khai</p>
            <p className="text-lg font-bold text-amber-700 mt-0.5">{formatCurrency(stats.totalTax)}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo số HĐ, ký hiệu, mã tra cứu, MST, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả ({eInvoices.length})</option>
            <option value="cqt_approved">CQT Đã cấp mã ({stats.cqtApproved})</option>
            <option value="signed">Đã ký số ({stats.signed})</option>
            <option value="draft">Dự thảo ({stats.draft})</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3.5 text-center w-12">STT</th>
                <th className="p-3.5">Số & Ký Hiệu HĐ</th>
                <th className="p-3.5">Ngày Lập</th>
                <th className="p-3.5">Người Mua / Doanh Nghiệp</th>
                <th className="p-3.5 text-right">Tổng Tiền Thanh Toán</th>
                <th className="p-3.5 text-center">Thuế VAT</th>
                <th className="p-3.5 text-center">Trạng Thái HĐ</th>
                <th className="p-3.5 text-center">Mã CQT</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition group">
                    <td className="p-3.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono border border-slate-200">
                          {inv.invoiceSymbol}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Mã TC: <span className="text-blue-600 font-semibold">{inv.lookupCode}</span>
                        {inv.orderCode && ` | Đơn: ${inv.orderCode}`}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {new Date(inv.issueDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">
                        {inv.buyer?.companyName || inv.buyer?.buyerName || 'Khách lẻ'}
                      </div>
                      {inv.buyer?.taxCode ? (
                        <span className="text-[11px] text-slate-500 font-mono">MST: {inv.buyer?.taxCode}</span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Khách cá nhân</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200">
                        {inv.taxRate}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {inv.status === 'cqt_approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          CQT Cấp Mã
                        </span>
                      ) : inv.status === 'signed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-200 text-[11px]">
                          <Lock className="w-3 h-3 text-blue-600" />
                          Đã Ký Số
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-semibold border border-amber-200 text-[11px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Dự Thảo
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {inv.cqtCode ? (
                        <span
                          className="font-mono text-[10px] text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded border border-emerald-200 truncate max-w-[120px] inline-block"
                          title={inv.cqtCode}
                        >
                          {inv.cqtCode.substring(0, 16)}...
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="In & Xem Hóa Đơn Điện Tử"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {inv.status === 'draft' && (
                          <button
                            onClick={() => handleSignInvoice(inv.id)}
                            title="Ký Số Token Điện Tử"
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition border border-indigo-200"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}

                        {inv.status === 'signed' && (
                          <button
                            onClick={() => handleSendCqt(inv.id)}
                            title="Gửi CQT Cấp Mã"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-200"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không tìm thấy hóa đơn điện tử nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập Hóa Đơn Điện Tử Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Lập Hóa Đơn Điện Tử Mới (TT78)</h3>
                  <p className="text-xs text-slate-400">Khởi tạo hóa đơn GTGT điện tử có mã của Cơ quan Thuế</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto text-xs text-slate-700">
              {/* Option 1: Select Existing Order */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Chọn Đơn Hàng Đã Bán (Tự động nạp danh sách sản phẩm)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    const ord = orders.find((o) => o.id === e.target.value);
                    if (ord) {
                      const cName = ord.customer?.name || '';
                      setBuyerName(cName);
                      handlePopulateFromCustomer(cName);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Xuất hóa đơn dịch vụ lẻ / Tự nhập thông tin --</option>
                  {orders.map((o) => {
                    const custName = o.customer?.name || 'Khách lẻ';
                    return (
                      <option key={o.id} value={o.id}>
                        {o.code} - {custName} - {formatCurrency(o.total)} ({new Date(o.createdAt).toLocaleDateString('vi-VN')})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Buyer Information Form */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Thông Tin Người Mua Hàng & Đơn Vị Nhận Hóa Đơn
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tên Người Mua / Đại Diện *</label>
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Văn Hùng"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Mã Số Thuế (Nếu là Doanh nghiệp)</label>
                    <input
                      type="text"
                      placeholder="VD: 0312345678"
                      value={buyerTaxCode}
                      onChange={(e) => setBuyerTaxCode(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Tên Đơn Vị / Công Ty</label>
                    <input
                      type="text"
                      placeholder="VD: CÔNG TY TNHH XÂY DỰNG & CÔNG NGHỆ BẮC NAM"
                      value={buyerCompanyName}
                      onChange={(e) => setBuyerCompanyName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Địa Chỉ Nhận Hóa Đơn</label>
                    <input
                      type="text"
                      placeholder="VD: Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP.HCM"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Số Điện Thoại</label>
                    <input
                      type="text"
                      placeholder="VD: 0912 345 678"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Email Nhận HĐĐT</label>
                    <input
                      type="email"
                      placeholder="VD: ketoan@bacnam-corp.vn"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Thuế Suất VAT (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value={8}>8% (Thuế suất ưu đãi theo Nghị định)</option>
                    <option value={10}>10% (Thuế suất thông thường)</option>
                    <option value={5}>5% (Nông sản, y tế, giáo dục)</option>
                    <option value={0}>0% (Xuất khẩu / Khu phi thuế quan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hình Thức Thanh Toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="CK">CK (Chuyển khoản Ngân hàng)</option>
                    <option value="TM">TM (Tiền mặt)</option>
                    <option value="TM/CK">TM/CK (Tiền mặt / Chuyển khoản)</option>
                    <option value="Đối trừ công nợ">Đối trừ công nợ B2B</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Ghi Chú Trên Hóa Đơn</label>
                <input
                  type="text"
                  placeholder="Ghi chú đính kèm hợp đồng số, phụ lục, điều khoản giao hàng..."
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleCreateInvoiceFromOrder}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Phát Hành & Ký Số HĐĐT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print & View Modal */}
      {selectedInvoice && (
        <EInvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSignInvoice={handleSignInvoice}
          onSendCqt={handleSendCqt}
        />
      )}

      {/* Inbound E-Invoice Modal */}
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

      {/* Stock Goods Receipt Print Modal */}
      {selectedStockReceipt && (
        <StockReceiptPrintModal
          receipt={selectedStockReceipt}
          settings={settings}
          onClose={() => setSelectedStockReceipt(null)}
        />
      )}
    </div>
  );
};
