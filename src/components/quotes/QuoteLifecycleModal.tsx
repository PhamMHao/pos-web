import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  FileCheck,
  ShoppingBag,
  Trophy,
  XCircle,
  ArrowRight,
  User,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { PriceQuote, QuoteLifecycleStatus, QuoteLifecycleEvent } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface QuoteLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: PriceQuote;
  onUpdateQuote: (updatedQuote: PriceQuote) => void;
  onConvertToOrder?: (quote: PriceQuote) => void;
}

const LIFECYCLE_STEPS: {
  status: QuoteLifecycleStatus;
  label: string;
  subLabel: string;
  icon: any;
  color: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    status: 'draft',
    label: 'Dự Thảo',
    subLabel: 'Khởi tạo & chọn mặt hàng',
    icon: Clock,
    color: 'text-slate-400',
    badgeBg: 'bg-slate-800',
    badgeText: 'text-slate-300',
  },
  {
    status: 'sent',
    label: 'Đã Gửi Khách',
    subLabel: 'Gửi Zalo/Email/In A4-A5',
    icon: Send,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-950/60 border border-blue-500/30',
    badgeText: 'text-blue-300',
  },
  {
    status: 'negotiating',
    label: 'Đang Đàm Phán',
    subLabel: 'Thương lượng giá & điều khoản',
    icon: MessageSquare,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-950/60 border border-purple-500/30',
    badgeText: 'text-purple-300',
  },
  {
    status: 'approved',
    label: 'Đã Duyệt Bảng Giá',
    subLabel: 'Khách đồng thuận chốt giá',
    icon: FileCheck,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/60 border border-amber-500/30',
    badgeText: 'text-amber-300',
  },
  {
    status: 'converted_to_order',
    label: 'Đã Chuyển Đơn POS',
    subLabel: 'Xuất kho & tạo hóa đơn',
    icon: ShoppingBag,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/60 border border-emerald-500/30',
    badgeText: 'text-emerald-300',
  },
  {
    status: 'completed',
    label: 'ĐÃ HOÀN THÀNH',
    subLabel: 'Nghiệm thu & tất toán dự án',
    icon: Trophy,
    color: 'text-teal-400',
    badgeBg: 'bg-teal-950/60 border border-teal-500/30',
    badgeText: 'text-teal-300',
  },
];

export const QuoteLifecycleModal: React.FC<QuoteLifecycleModalProps> = ({
  isOpen,
  onClose,
  quote,
  onUpdateQuote,
  onConvertToOrder,
}) => {
  const [selectedTargetStatus, setSelectedTargetStatus] = useState<QuoteLifecycleStatus>(quote.status);
  const [transitionNote, setTransitionNote] = useState('');
  const [authorName, setAuthorName] = useState('Nguyễn Văn Trưởng (Sale Lead)');
  const [discountAdjustment, setDiscountAdjustment] = useState<number>(quote.discountPercent || 0);

  if (!isOpen || !quote) return null;

  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.status === quote.status);

  const handleApplyStatusChange = (newStatus: QuoteLifecycleStatus) => {
    sounds.playSuccessChime();

    const newEvent: QuoteLifecycleEvent = {
      id: 'event-' + Date.now(),
      timestamp: new Date().toISOString(),
      author: authorName.trim() || 'Hệ Thống ERP',
      fromStatus: quote.status,
      toStatus: newStatus,
      note: transitionNote.trim() || `Chuyển trạng thái sang ${LIFECYCLE_STEPS.find(s => s.status === newStatus)?.label || newStatus}`,
      discountAdjustment: Number(discountAdjustment),
    };

    const newTotal = quote.totalAmount;
    const newDiscount = Number(discountAdjustment);
    const newFinalTotal = Math.round(newTotal * (1 - newDiscount / 100));

    const updatedQuote: PriceQuote = {
      ...quote,
      status: newStatus,
      discountPercent: newDiscount,
      finalTotal: newFinalTotal,
      negotiationNotes: transitionNote ? `${quote.negotiationNotes ? quote.negotiationNotes + '\n' : ''}[${new Date().toLocaleDateString('vi-VN')}]: ${transitionNote}` : quote.negotiationNotes,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : quote.completedAt,
      lifecycleHistory: [newEvent, ...(quote.lifecycleHistory || [])],
    };

    onUpdateQuote(updatedQuote);
    setTransitionNote('');
    setSelectedTargetStatus(newStatus);
  };

  const handleQuickConvertToOrder = () => {
    handleApplyStatusChange('converted_to_order');
    if (onConvertToOrder) {
      onConvertToOrder(quote);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Theo Dõi Dòng Đời Báo Giá (Quote Lifecycle Tracker)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                  {quote.code}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Khách hàng: <strong className="text-white">{quote.customerName}</strong> ({quote.customerPhone}) • Giá trị: <strong className="text-emerald-400 font-mono">{formatVND(quote.finalTotal)}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Step Visual Stepper Bar */}
        <div className="p-4 px-6 bg-slate-950/80 border-b border-slate-800 overflow-x-auto shrink-0">
          <div className="flex items-center justify-between min-w-[700px] relative">
            {/* Connecting Bar */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-300"
                style={{
                  width: `${Math.max(0, (currentStepIndex / (LIFECYCLE_STEPS.length - 1)) * 100)}%`,
                }}
              />
            </div>

            {LIFECYCLE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.status}
                  onClick={() => setSelectedTargetStatus(step.status)}
                  className="flex flex-col items-center cursor-pointer relative z-10 group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/50 scale-110'
                        : isPast
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-slate-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>

                  <span
                    className={`text-[11px] font-bold mt-2 whitespace-nowrap ${
                      isCurrent ? 'text-blue-400 font-extrabold' : isPast ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[9px] text-slate-500 hidden sm:inline whitespace-nowrap">
                    {step.subLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-900/60 text-xs">
          
          {/* Left Panel: Status Transition Controls */}
          <div className="w-full md:w-5/12 bg-slate-950 p-5 border-r border-slate-800 space-y-4 overflow-y-auto shrink-0">
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Trạng Thái Hiện Tại:</span>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white">
                  {LIFECYCLE_STEPS.find((s) => s.status === quote.status)?.label || quote.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Bước {(currentStepIndex >= 0 ? currentStepIndex + 1 : 1)}/6
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-bold">Chuyển Tiến Độ Dòng Đời Sang:</label>
              <div className="grid grid-cols-2 gap-2">
                {LIFECYCLE_STEPS.map((step) => (
                  <button
                    key={step.status}
                    type="button"
                    onClick={() => handleApplyStatusChange(step.status)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                      quote.status === step.status
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow'
                        : 'bg-slate-900/90 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <step.icon className="w-4 h-4 shrink-0 text-amber-400" />
                    <span className="truncate">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Note & Discount Adjustment */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ghi Chú Đàm Phán / Lý Do Chuyển Bước:</label>
                <textarea
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="VD: Khách yêu cầu giảm thêm 3% dự án và bổ sung thêm 1 năm bảo hành tận nơi..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Người Thao Tác:</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chiết Khấu Đàm Phán (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountAdjustment}
                    onChange={(e) => setDiscountAdjustment(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-mono font-bold text-amber-400 text-right"
                  />
                </div>
              </div>

              {/* Special Conversion Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleQuickConvertToOrder}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>🛒 Chuyển Thẳng Sang POS (F2) & Xuất Kho</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyStatusChange('completed')}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-black rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
                >
                  <Trophy className="w-4 h-4" />
                  <span>🏆 Nghiệm Thu & ĐÃ HOÀN THÀNH Báo Giá</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Audit Trail History Timeline */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Nhật Ký Sự Kiện & Lịch Sử Đàm Phán (Audit Trail)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {(quote.lifecycleHistory?.length || 0) + 1} Sự kiện
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {/* Event List */}
              {quote.lifecycleHistory && quote.lifecycleHistory.length > 0 ? (
                quote.lifecycleHistory.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-purple-600 border-2 border-slate-950 shadow-md"></div>
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {evt.fromStatus} ➔ {evt.toStatus}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(evt.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs">{evt.note}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                        <span>👤 Thao tác: <strong>{evt.author}</strong></span>
                        {evt.discountAdjustment !== undefined && evt.discountAdjustment > 0 && (
                          <span className="text-amber-400 font-mono font-bold">
                            Chiết khấu: {evt.discountAdjustment}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-950 shadow-md"></div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      Khởi tạo báo giá
                    </span>
                    <p className="text-white font-semibold text-xs">Báo giá được tạo bản thảo ban đầu.</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(quote.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
