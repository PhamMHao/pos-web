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
} from 'lucide-react';
import { PriceQuote, StoreSettings, Product, Customer } from '../../types';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';
import { NewQuoteModal } from './NewQuoteModal';

interface QuotesViewProps {
  quotes?: PriceQuote[];
  products?: Product[];
  customers?: Customer[];
  settings?: StoreSettings;
  onSaveQuote?: (quote: PriceQuote) => void;
  onConvertToOrder?: (quote: PriceQuote) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes = [],
  products = [],
  customers = [],
  settings,
  onSaveQuote,
  onConvertToOrder,
}) => {
  const safeQuotes = Array.isArray(quotes) ? quotes : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<PriceQuote | null>(safeQuotes[0] || null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const formatVND = (amt: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
  };

  const filteredQuotes = safeQuotes.filter(
    (q) =>
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerCompany && q.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

        <button
          onClick={() => setShowNewModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo Báo Giá Mới</span>
        </button>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Quotes List */}
        <div className="w-full lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/40 shrink-0">
          <div className="p-3 border-b border-slate-800">
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
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-1">
            {filteredQuotes.map((q) => {
              const isSelected = selectedQuote?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuote(q)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 shadow-sm'
                      : 'hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-blue-400">{q.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {q.status === 'approved' ? 'Đã Chốt Giá' : 'Đã Gửi Báo Giá'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{q.customerCompany || q.customerName}</h4>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Hiệu lực đến {q.validUntil}</span>
                    <span className="font-mono font-bold text-emerald-400">{formatVND(q.finalTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quote Details & Print Preview */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950 flex flex-col justify-between">
          {selectedQuote ? (
            <div className="space-y-6 max-w-4xl">
              {/* Top info bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <span className="text-xs font-mono text-slate-400">BẢNG BÁO GIÁ THƯƠNG MẠI</span>
                  <h3 className="text-xl font-bold text-white">{selectedQuote.code}</h3>
                  <p className="text-xs text-slate-400">Ngày lập: {new Date(selectedQuote.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl border border-blue-500 flex items-center space-x-1.5 shadow transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Báo Giá (A4/A5)</span>
                  </button>
                  <button
                    onClick={() => onConvertToOrder && selectedQuote && onConvertToOrder(selectedQuote)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-colors"
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
            discountCode: selectedQuote.discountPercent > 0 ? `CK ${selectedQuote.discountPercent}%` : undefined,
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

      {showNewModal && (
        <NewQuoteModal
          products={products}
          customers={customers}
          settings={settings}
          onClose={() => setShowNewModal(false)}
          onSave={(newQuote) => {
            if (onSaveQuote) onSaveQuote(newQuote);
            setSelectedQuote(newQuote);
          }}
        />
      )}
    </div>
  );
};
