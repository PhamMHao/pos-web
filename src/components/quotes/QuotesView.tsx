import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Building2,
  Phone,
  FileText,
  Printer,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  BarChart3,
  TrendingUp,
  Sliders,
  MessageSquare,
  FileCheck,
  Trophy,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { PriceQuote, StoreSettings, Product, Customer, QuoteLifecycleStatus, SignableDocument, DigitalSignatureMetadata, SignatureAuditLog } from '../../types';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';
import { NewQuoteModal, InitialQuotePrefill } from './NewQuoteModal';
import { SupplierComparisonModal } from './SupplierComparisonModal';
import { QuoteAnalyticsReportModal } from './QuoteAnalyticsReportModal';
import { EquivalentQuoteRecommenderModal } from './EquivalentQuoteRecommenderModal';
import { QuoteLifecycleModal } from './QuoteLifecycleModal';
import { DocumentSignerModal } from '../signatures/DocumentSignerModal';
import { SignatureVerificationBadge } from '../signatures/SignatureVerificationBadge';

interface QuotesViewProps {
  quotes?: PriceQuote[];
  products?: Product[];
  customers?: Customer[];
  settings?: StoreSettings;
  onSaveQuote?: (quote: PriceQuote) => void;
  onConvertToOrder?: (quote: PriceQuote) => void;
  onOpenDocOcrScanner?: (mode?: 'customer_quote') => void;
}

const STATUS_CONFIG: Record<QuoteLifecycleStatus, { label: string; icon: any; color: string; badge: string }> = {
  draft: { label: 'Dự Thảo', icon: Clock, color: 'text-slate-400', badge: 'bg-slate-800 text-slate-300' },
  sent: { label: 'Đã Gửi', icon: Send, color: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  negotiating: { label: 'Đang Đàm Phán', icon: MessageSquare, color: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  approved: { label: 'Đã Duyệt', icon: FileCheck, color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  converted_to_order: { label: 'Đã Chuyển POS', icon: ShoppingCart, color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  completed: { label: 'ĐÃ HOÀN THÀNH', icon: Trophy, color: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' },
  rejected: { label: 'Từ Chối', icon: RotateCcw, color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
};

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes = [],
  products = [],
  customers = [],
  settings,
  onSaveQuote,
  onConvertToOrder,
  onOpenDocOcrScanner,
}) => {
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QuoteLifecycleStatus>('all');
  const [selectedQuote, setSelectedQuote] = useState<PriceQuote | null>(safeQuotes[0] || null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showEquivalentModal, setShowEquivalentModal] = useState(false);
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [showSignerModal, setShowSignerModal] = useState(false);
  const [quoteSignatures, setQuoteSignatures] = useState<Record<string, DigitalSignatureMetadata>>({});
  const [prefillData, setPrefillData] = useState<InitialQuotePrefill | null>(null);

  const formatVND = (amt: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
  };

  const filteredQuotes = safeQuotes.filter((q) => {
    const matchSearch =
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerCompany && q.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleApplySupplierPricing = (items: any[], strategy: string) => {
    setPrefillData({
      notes: 'Báo giá dự án tối ưu theo giá vốn NCC (Chiến lược: ' + (strategy === 'aggressive' ? 'Cạnh tranh 15%' : strategy === 'balanced' ? 'Cân bằng 25%' : 'Doanh nghiệp 38%') + ').',
      items: items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.unitPrice * it.quantity,
      })),
    });
    setShowNewModal(true);
  };

  const handleApplyEquivalentTemplate = (template: any) => {
    setPrefillData(template);
    setShowNewModal(true);
  };

  const handleUpdateQuote = (updatedQuote: PriceQuote) => {
    if (onSaveQuote) onSaveQuote(updatedQuote);
    setSelectedQuote(updatedQuote);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Quản Lý Báo Giá Dự Án & B2B</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ERP B2B
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Lập bảng báo giá chiết khấu dự án, quản lý thời hạn hiệu lực và chuyển đổi trực tiếp thành Đơn Hàng POS
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenDocOcrScanner ? onOpenDocOcrScanner('customer_quote') : null}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            title="Quét phiếu báo giá bằng camera điện thoại & bóc tách AI"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Quét Phiếu / Excel (AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAnalyticsModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Phân Tích &</span> Báo Cáo
          </button>

          <button
            type="button"
            onClick={() => setShowSupplierModal(true)}
            className="px-3 py-2 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>So Sánh NCC</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEquivalentModal(true)}
            className="px-3 py-2 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/40 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Gợi Ý Đơn Kế</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPrefillData(null);
              setShowNewModal(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Báo Giá Mới</span>
          </button>
        </div>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Quotes List */}
        <div className="w-full lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/40 shrink-0">
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã báo giá, công ty..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Lifecycle Status Filter Bar */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                Tất Cả ({safeQuotes.length})
              </button>
              {(['draft', 'sent', 'negotiating', 'approved', 'converted_to_order', 'completed'] as QuoteLifecycleStatus[]).map((st) => {
                const count = safeQuotes.filter((q) => q.status === st).length;
                const cfg = STATUS_CONFIG[st];
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cfg?.label || st} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((q) => {
                const isSelected = selectedQuote?.id === q.id;
                const statusCfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
                const Icon = statusCfg.icon;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuote(q)}
                    className={'p-3.5 cursor-pointer transition-colors ' +
                      (isSelected ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-slate-800/50')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-white flex items-center space-x-1.5">
                          <span className="text-blue-400 font-mono">{q.code}</span>
                          <span className="text-slate-400">•</span>
                          <span>{q.customerName}</span>
                        </div>
                        {q.customerCompany && (
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span className="truncate max-w-[200px]">{q.customerCompany}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${statusCfg.badge}`}>
                        <Icon className="w-3 h-3" />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40 text-[11px]">
                      <span className="text-slate-400">{new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="font-mono font-bold text-emerald-400">{formatVND(q.finalTotal)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">Không tìm thấy báo giá nào phù hợp</div>
            )}
          </div>
        </div>

        {/* Right: Detailed View */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-4 md:p-6">
          {selectedQuote ? (
            <div className="space-y-6 max-w-4xl">
              {/* Quote Main Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-white font-mono">{selectedQuote.code}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        STATUS_CONFIG[selectedQuote.status]?.badge || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {STATUS_CONFIG[selectedQuote.status]?.label || selectedQuote.status}
                    </span>
                    {quoteSignatures[selectedQuote.id] && (
                      <SignatureVerificationBadge signature={quoteSignatures[selectedQuote.id]} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ngày lập: {new Date(selectedQuote.createdAt).toLocaleDateString('vi-VN')} • Hiệu lực đến: {new Date(selectedQuote.validUntil).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSignerModal(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                    title="Ký số duyệt báo giá trực tiếp qua Viettel/VNPT/FPT SmartCA"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                    <span>{quoteSignatures[selectedQuote.id] ? 'Ký Lại (CA)' : 'Ký Số Báo Giá (CA)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLifecycleModal(true)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Quản Lý Dòng Đời (6 Bước)</span>
                  </button>

                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl border border-blue-500 flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Báo Giá (A4/A5)</span>
                  </button>
                  <button
                    onClick={() => onConvertToOrder && selectedQuote && onConvertToOrder(selectedQuote)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Chuyển Thành Đơn Hàng POS</span>
                  </button>
                </div>
              </div>

              {/* Customer Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Khách Hàng / Đơn Vị Nhận</div>
                  <div className="text-sm font-bold text-white">{selectedQuote.customerCompany || selectedQuote.customerName}</div>
                  <div className="text-xs text-slate-300 mt-0.5">Người liên hệ: {selectedQuote.customerName}</div>
                  <div className="text-xs text-slate-400">SĐT: {selectedQuote.customerPhone}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Ghi Chú & Điều Khoản</div>
                  <p className="text-xs text-slate-300 italic">{selectedQuote.notes || 'Không có ghi chú thêm.'}</p>
                </div>
              </div>

              {/* Item Details Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">STT</th>
                      <th className="px-4 py-3">Tên Hàng Hóa / Quy Cách</th>
                      <th className="px-4 py-3 text-center">ĐVT</th>
                      <th className="px-4 py-3 text-center">Số Lượng</th>
                      <th className="px-4 py-3 text-right">Đơn Giá</th>
                      <th className="px-4 py-3 text-right">Thành Tiền (VND)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedQuote.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {item.productName}
                          <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-300">{item.unit}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatVND(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatVND(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-full sm:w-80 bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-mono">{formatVND(selectedQuote.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Chiết khấu dự án ({selectedQuote.discountPercent}%):</span>
                    <span className="font-mono text-rose-400">
                      -{formatVND((selectedQuote.totalAmount * selectedQuote.discountPercent) / 100)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>Tổng Thanh Toán:</span>
                    <span className="font-mono text-emerald-400 font-black">{formatVND(selectedQuote.finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Chọn bảng báo giá để xem chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Print Quote Modal */}
      {showPrintModal && selectedQuote && (
        <PrintInvoiceModal
          isOpen={showPrintModal}
          initialDocType="quote"
          settings={settings}
          order={{
            id: selectedQuote.id,
            code: selectedQuote.code,
            items: selectedQuote.items.map((i) => ({
              productId: (i as any).productId || i.sku,
              productName: i.productName,
              sku: i.sku,
              barcode: i.sku,
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
              originalPrice: i.unitPrice,
              costPrice: i.unitPrice * 0.7,
              total: i.total,
              discountPercent: 0,
              discountAmount: 0,
            })),
            subtotal: selectedQuote.totalAmount,
            discountAmount: (selectedQuote.totalAmount * selectedQuote.discountPercent) / 100,
            discountCode: selectedQuote.discountPercent > 0 ? 'CK ' + selectedQuote.discountPercent + '%' : undefined,
            taxAmount: 0,
            taxRate: 0,
            total: selectedQuote.finalTotal,
            totalCost: selectedQuote.totalAmount * 0.7,
            profit: selectedQuote.finalTotal - selectedQuote.totalAmount * 0.7,
            profitMargin: 30,
            paidAmount: selectedQuote.finalTotal,
            changeAmount: 0,
            paymentMethod: 'transfer',
            paymentStatus: 'paid',
            status: 'confirmed',
            channel: 'Website',
            customer: {
              id: 'c-quote',
              name: selectedQuote.customerName,
              phone: selectedQuote.customerPhone,
              address: selectedQuote.customerCompany || '',
            },
            notes: selectedQuote.notes,
            createdAt: selectedQuote.createdAt,
          } as any}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* New / Edit Quote Modal */}
      {showNewModal && (
        <NewQuoteModal
          products={products}
          customers={customers}
          settings={settings}
          initialQuoteData={prefillData}
          onClose={() => setShowNewModal(false)}
          onSave={(newQuote) => {
            if (onSaveQuote) onSaveQuote(newQuote);
            setSelectedQuote(newQuote);
          }}
        />
      )}

      {/* Supplier Comparison Modal */}
      {showSupplierModal && (
        <SupplierComparisonModal
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          products={products}
          settings={settings}
          onApplyPricingToNewQuote={handleApplySupplierPricing}
        />
      )}

      {/* Quote Analytics Report Modal */}
      {showAnalyticsModal && (
        <QuoteAnalyticsReportModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          quotes={safeQuotes}
          customers={customers}
          settings={settings}
        />
      )}

      {/* Equivalent Quote Recommender Modal */}
      {showEquivalentModal && (
        <EquivalentQuoteRecommenderModal
          isOpen={showEquivalentModal}
          onClose={() => setShowEquivalentModal(false)}
          quotes={safeQuotes}
          customers={customers}
          products={products}
          settings={settings}
          onSelectTemplateForNewQuote={handleApplyEquivalentTemplate}
        />
      )}
      {/* Quote Lifecycle Tracker Modal (6 Steps) */}
      {showLifecycleModal && selectedQuote && (
        <QuoteLifecycleModal
          isOpen={showLifecycleModal}
          onClose={() => setShowLifecycleModal(false)}
          quote={selectedQuote}
          onUpdateQuote={handleUpdateQuote}
          onConvertToOrder={onConvertToOrder}
        />
      )}

      {/* Quick Digital Signer Modal for Quotes */}
      {showSignerModal && selectedQuote && (
        <DocumentSignerModal
          document={{
            id: selectedQuote.id,
            code: selectedQuote.code,
            title: `Báo Giá Thương Mại - ${selectedQuote.customerCompany || selectedQuote.customerName}`,
            type: 'quote',
            typeLabel: 'Báo Giá Dự Án',
            createdAt: selectedQuote.createdAt,
            totalAmount: selectedQuote.finalTotal,
            creatorName: 'Phòng Kinh Doanh POS',
            recipientName: selectedQuote.customerCompany || selectedQuote.customerName,
            status: 'pending',
            legalStandard: 'PAdES B-LT (ETSI EN 319 142)',
          }}
          settings={settings}
          onClose={() => setShowSignerModal(false)}
          onSignSuccess={(sig) => {
            setQuoteSignatures((prev) => ({ ...prev, [selectedQuote.id]: sig }));
            setShowSignerModal(false);
            if (selectedQuote.status === 'draft') {
              handleUpdateQuote({ ...selectedQuote, status: 'approved' });
            }
          }}
        />
      )}
    </div>
  );
};
