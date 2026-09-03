import React, { useState, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Search,
  Filter,
  Package,
  Calendar,
  User,
  Phone,
  FileText,
  Boxes,
  Printer,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Eye,
  DollarSign,
} from 'lucide-react';
import { ReturnOrder, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface ReturnsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  returns: ReturnOrder[];
  settings: StoreSettings;
  onDeleteReturn?: (id: string) => Promise<void>;
  onOpenCreateReturn?: () => void;
}

export const ReturnsHistoryModal: React.FC<ReturnsHistoryModalProps> = ({
  isOpen,
  onClose,
  returns,
  settings,
  onDeleteReturn,
  onOpenCreateReturn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);

  const filteredReturns = useMemo(() => {
    return (returns || []).filter((r) => {
      const matchSearch =
        !searchTerm.trim() ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.originalOrderCode && r.originalOrderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.customerPhone && r.customerPhone.includes(searchTerm));

      const matchReason = reasonFilter === 'all' || r.reason === reasonFilter;
      const matchDest = destinationFilter === 'all' || r.destinationType === destinationFilter;

      return matchSearch && matchReason && matchDest;
    });
  }, [returns, searchTerm, reasonFilter, destinationFilter]);

  const totalRefundSum = useMemo(() => {
    return filteredReturns.reduce((sum, r) => sum + (Number(r.refundAmount) || 0), 0);
  }, [filteredReturns]);

  const totalReturnQtySum = useMemo(() => {
    return filteredReturns.reduce((sum, r) => sum + (Number(r.totalReturnQuantity) || 0), 0);
  }, [filteredReturns]);

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'customer_mind_change':
        return 'Khách đổi ý';
      case 'defective':
        return 'Lỗi kỹ thuật';
      case 'wrong_item':
        return 'Giao nhầm mã';
      case 'warranty_exchange':
        return 'Đổi mới bảo hành';
      default:
        return 'Khác';
    }
  };

  const getDestinationBadge = (dest: string) => {
    switch (dest) {
      case 'restock':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            🟢 Nhập lại kho bán
          </span>
        );
      case 'faulty_warehouse':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
            🔴 Chuyển kho lỗi/BH
          </span>
        );
      case 'supplier_rma':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            🟡 Chờ trả NCC
          </span>
        );
      default:
        return null;
    }
  };

  const handlePrintSlip = (ret: ReturnOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu Trả Hàng - ${ret.code}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .store-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 20px; font-weight: bold; margin-top: 10px; color: #0284c7; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .total-box { text-align: right; font-size: 15px; font-weight: bold; margin-top: 10px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; text-align: center; margin-top: 40px; }
          .sign-line { margin-top: 60px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${settings.storeName || 'CỬA HÀNG GP-ERP ENTERPRISE'}</div>
          <div>${settings.address || ''} • Hotline: ${settings.phone || ''}</div>
          <div class="title">PHIẾU TRẢ HÀNG & HOÀN TIỀN</div>
          <div>Mã phiếu: <strong>${ret.code}</strong> • Ngày lập: ${new Date(ret.createdAt).toLocaleString('vi-VN')}</div>
        </div>

        <div class="meta-grid">
          <div><strong>Khách hàng:</strong> ${ret.customerName || 'Khách lẻ'}</div>
          <div><strong>Số điện thoại:</strong> ${ret.customerPhone || 'N/A'}</div>
          <div><strong>Đơn hàng gốc:</strong> ${ret.originalOrderCode || 'N/A'}</div>
          <div><strong>Lý do trả:</strong> ${getReasonLabel(ret.reason)}</div>
          <div><strong>Hình thức hoàn:</strong> ${ret.refundMethod === 'cash' ? 'Tiền mặt' : ret.refundMethod === 'transfer' ? 'Chuyển khoản' : 'Cấn trừ nợ'}</div>
          <div><strong>Kho xử lý:</strong> ${ret.warehouse}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mặt hàng</th>
              <th>Mã SKU</th>
              <th>ĐVT</th>
              <th>SL Trả</th>
              <th>Đơn giá hoàn</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${ret.items
              .map(
                (it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${it.productName}</td>
                <td>${it.sku}</td>
                <td>${it.unit}</td>
                <td>${it.quantity}</td>
                <td>${formatVND(it.refundUnitPrice)}</td>
                <td>${formatVND(it.totalRefund)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total-box">
          <div>Tổng số lượng trả: ${ret.totalReturnQuantity} món</div>
          <div style="font-size: 18px; color: #dc2626; margin-top: 4px;">
            Tổng tiền hoàn trả: ${formatVND(ret.refundAmount)}
          </div>
        </div>

        <div class="signatures">
          <div>
            <div>Người Trả Hàng</div>
            <div style="font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</div>
            <div class="sign-line">${ret.customerName || 'Khách hàng'}</div>
          </div>
          <div>
            <div>Người Lập Phiếu / Thủ Kho</div>
            <div style="font-size: 11px; color: #64748b;">(Ký và ghi rõ họ tên)</div>
            <div class="sign-line">${ret.performedBy || 'Nhân viên thu ngân'}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Lịch Sử Phiếu Trả Hàng & Hoàn Tiền
              </h2>
              <p className="text-xs text-slate-400">
                Theo dõi các đợt hoàn hàng, hoàn tiền mặt/chuyển khoản và biến động kho
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateReturn && (
              <button
                onClick={onOpenCreateReturn}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Tạo Phiếu Trả Hàng Mới
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-6 pb-2">
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Tổng số phiếu trả</div>
              <div className="text-2xl font-bold text-white mt-0.5">{filteredReturns.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Tổng số món trả lại</div>
              <div className="text-2xl font-bold text-amber-400 mt-0.5">{totalReturnQtySum} món</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Tổng tiền đã hoàn trả</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5 font-mono">
                {formatVND(totalRefundSum)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã phiếu (TH-...), mã đơn gốc, tên khách, SĐT..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả lý do trả</option>
              <option value="customer_mind_change">Khách đổi ý</option>
              <option value="defective">Lỗi kỹ thuật</option>
              <option value="wrong_item">Giao nhầm mã</option>
              <option value="warranty_exchange">Đổi mới bảo hành</option>
            </select>

            <select
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả điểm đến</option>
              <option value="restock">Nhập lại kho bán</option>
              <option value="faulty_warehouse">Chuyển kho lỗi/BH</option>
              <option value="supplier_rma">Chờ trả NCC</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filteredReturns.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <RotateCcw className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
              <p className="text-sm">Chưa có phiếu trả hàng nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
              {filteredReturns.map((ret) => (
                <div key={ret.id} className="p-4 hover:bg-slate-800/40 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-mono font-bold text-xs">
                        {ret.code.slice(-4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm font-mono">{ret.code}</span>
                          {getDestinationBadge(ret.destinationType)}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {getReasonLabel(ret.reason)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>Khách: <strong className="text-slate-200">{ret.customerName || 'Khách lẻ'}</strong></span>
                          {ret.customerPhone && <span>• SĐT: {ret.customerPhone}</span>}
                          {ret.originalOrderCode && (
                            <span>• Đơn gốc: <strong className="text-cyan-400 font-mono">{ret.originalOrderCode}</strong></span>
                          )}
                          <span>• Ngày trả: {new Date(ret.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">{ret.totalReturnQuantity} sản phẩm</div>
                        <div className="text-base font-bold text-emerald-400 font-mono">
                          {formatVND(ret.refundAmount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePrintSlip(ret)}
                          title="In phiếu trả hàng"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {onDeleteReturn && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa phiếu trả hàng ${ret.code}?`)) {
                                onDeleteReturn(ret.id);
                              }
                            }}
                            title="Xóa phiếu"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List items mini preview */}
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-xs flex flex-wrap gap-2">
                    {ret.items.map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50 flex items-center gap-1.5"
                      >
                        <span className="font-semibold text-white">{it.productName}</span>
                        <span className="text-amber-400 font-mono">x{it.quantity} {it.unit}</span>
                        <span className="text-slate-500">({formatVND(it.totalRefund)})</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
