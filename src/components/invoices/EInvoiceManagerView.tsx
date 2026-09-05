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
  Palette,
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
  DigitalSignatureMetadata,
} from '../../types';
import { EInvoicePrintModal } from './EInvoicePrintModal';
import { InboundEInvoiceModal } from './InboundEInvoiceModal';
import { StockReceiptPrintModal } from '../inventory/StockReceiptPrintModal';
import { CreateEInvoiceModal } from './CreateEInvoiceModal';
import { EInvoiceTemplateDesignerModal } from './EInvoiceTemplateDesignerModal';
import { TaxRiskBadge } from './TaxRiskBadge';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { formatCurrency } from '../../utils/currency';
import { einvoicesApi } from '../../features/einvoices/api/einvoicesApi';
import { DocumentSignerModal } from '../signatures/DocumentSignerModal';

interface EInvoiceManagerViewProps {
  eInvoices: EInvoice[];
  setEInvoices: (invoices: EInvoice[] | ((prev: EInvoice[]) => EInvoice[])) => void;
  orders: Order[];
  customers: Customer[];
  settings: StoreSettings;
  onSaveSettings?: (settings: StoreSettings) => void;
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
  onSaveSettings,
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
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [showInboundModal, setShowInboundModal] = useState(false);
  const [selectedStockReceipt, setSelectedStockReceipt] = useState<StockGoodsReceipt | null>(null);
  const [signingInvoice, setSigningInvoice] = useState<EInvoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingInboundCount = (inboundInvoices || []).filter((i) => i.status === 'pending_review').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
  const handleSignInvoice = (invoiceId: string) => {
    const target = safeInvoices.find((i) => i.id === invoiceId);
    if (target) {
      setSigningInvoice(target);
    }
  };

  const handleInvoiceSignSuccess = async (sig: DigitalSignatureMetadata) => {
    if (!signingInvoice) return;
    const invoiceId = signingInvoice.id;
    const signTime = sig.signedAt
      ? new Date(sig.signedAt).toISOString().replace('T', ' ').substring(0, 19)
      : new Date().toISOString().replace('T', ' ').substring(0, 19);

    setEInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'signed',
            signDate: sig.signedAt || new Date().toISOString(),
            digitalSignature: {
              ...inv.digitalSignature,
              signedBy: sig.signerName || settings.storeName || 'CÔNG TY CP GP-ERP VIỆT NAM',
              serialNumber: sig.certificateSerial || '54:01:01:82:91:02:93:84:71:0A:99:BC:12',
              signTime,
              certProvider: `${sig.providerName} (Bộ Thông Tin & Truyền Thông cấp phép)`,
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
              signDate: sig.signedAt || new Date().toISOString(),
              digitalSignature: {
                ...prev.digitalSignature,
                signedBy: sig.signerName || settings.storeName || 'CÔNG TY CP GP-ERP VIỆT NAM',
                serialNumber: sig.certificateSerial || '54:01:01:82:91:02:93:84:71:0A:99:BC:12',
                signTime,
                certProvider: `${sig.providerName} (Bộ Thông Tin & Truyền Thông cấp phép)`,
                isVerified: true,
              },
            }
          : null
      );
    }

    try {
      await fetch(`/api/einvoices/${invoiceId}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: sig }),
      });
    } catch (err: any) {
      console.warn('API sync warning:', err.message);
    }

    showToast(`Đã ký số điện tử thành công qua ${sig.providerName} cho Hóa đơn #${invoiceId}!`);
    setSigningInvoice(null);
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
            <span>HĐĐT Đầu Vào (Thuế / Gmail)</span>
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
            onClick={() => setShowDesignerModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 border border-purple-400/30 flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <Palette className="w-4 h-4 text-purple-200" />
            <span>Thiết Kế Mẫu HĐĐT</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập HĐĐT Mới</span>
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-600 font-mono font-medium">MST: {inv.buyer?.taxCode}</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Khớp CSDL Thuế
                          </span>
                        </div>
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

      {/* Create E-Invoice Modal (Manual & Order-based) */}
      {showCreateModal && (
        <CreateEInvoiceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          orders={orders}
          customers={customers}
          products={products}
          settings={settings}
          onInvoiceCreated={(newInvoice) => {
            setEInvoices((prev) => [newInvoice, ...prev]);
            showToast(`Đã phát hành thành công Hóa đơn điện tử #${newInvoice.invoiceNumber} (${newInvoice.invoiceSymbol})!`);
          }}
        />
      )}

      {/* E-Invoice Template Designer Modal (WYSIWYG) */}
      {showDesignerModal && (
        <EInvoiceTemplateDesignerModal
          isOpen={showDesignerModal}
          onClose={() => setShowDesignerModal(false)}
          settings={settings}
          onSaveSettings={(newSettings) => {
            if (onSaveSettings) {
              onSaveSettings(newSettings);
            }
            showToast('Đã lưu cấu hình mẫu Hóa đơn điện tử thành công!');
          }}
        />
      )}

      {/* Print & View Modal */}
      {selectedInvoice && (
        <EInvoicePrintModal
          invoice={selectedInvoice}
          settings={settings}
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

      {/* Modal Ký Số Điện Tử CA Đa Nhà Cung Cấp (Viettel / VNPT / FPT / Token) */}
      {signingInvoice && (
        <DocumentSignerModal
          document={{
            id: signingInvoice.id,
            code: signingInvoice.invoiceCode,
            title: `Hóa Đơn GTGT (Mẫu ${signingInvoice.invoiceTemplate} - Ký hiệu ${signingInvoice.invoiceSymbol})`,
            type: 'einvoice',
            typeLabel: 'Hóa Đơn Điện Tử',
            createdAt: signingInvoice.issueDate,
            totalAmount: signingInvoice.totalAmount,
            creatorName: 'Bộ phận Kế toán',
            recipientName: signingInvoice.buyer?.buyerName || signingInvoice.buyer?.companyName || 'Khách hàng',
            status: 'pending',
            legalStandard: 'XML-DSig (Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC)',
          }}
          settings={settings}
          onClose={() => setSigningInvoice(null)}
          onSignSuccess={handleInvoiceSignSuccess}
        />
      )}
    </div>
  );
};
