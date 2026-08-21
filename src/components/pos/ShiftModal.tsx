import React, { useState } from 'react';
import { X, DollarSign, ArrowDownRight, ArrowUpRight, Check, AlertCircle, Clock } from 'lucide-react';
import { CashShift } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface ShiftModalProps {
  currentShift: CashShift | null;
  onOpenShift: (shiftData: { shiftName: string; staffName: string; initialCash: number }) => void;
  onCloseShift: (actualEndingCash: number, note: string) => void;
  onCloseModal: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  currentShift,
  onOpenShift,
  onCloseShift,
  onCloseModal,
}) => {
  const isOpen = currentShift && currentShift.status === 'open';

  // Open shift inputs
  const [shiftName, setShiftName] = useState('Ca Sáng (08:00 - 16:00)');
  const [staffName, setStaffName] = useState('Trần Thuỳ Linh');
  const [initialCash, setInitialCash] = useState<number>(2000000);

  // Close shift inputs
  const [actualCash, setActualCash] = useState<number>(
    currentShift ? currentShift.expectedEndingCash : 0
  );
  const [closeNote, setCloseNote] = useState('');

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenShift({
      shiftName,
      staffName,
      initialCash: Number(initialCash) || 0,
    });
    onCloseModal();
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseShift(Number(actualCash) || 0, closeNote);
    onCloseModal();
  };

  const difference = currentShift
    ? (Number(actualCash) || 0) - currentShift.expectedEndingCash
    : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95" id="shift-modal-card">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between" id="shift-modal-header">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isOpen ? 'Kết Thúc & Đóng Ca Làm Việc' : 'Mở Ca Bán Hàng Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {isOpen
                  ? 'Kiểm kê tiền mặt thực tế và đối soát doanh thu'
                  : 'Khai báo số dư tiền mặt đầu ca'}
              </p>
            </div>
          </div>
          <button
            onClick={onCloseModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6" id="shift-modal-body">
          {isOpen ? (
            /* Close Shift Mode */
            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Tên ca làm việc:</span>
                  <span className="font-semibold text-slate-200">{currentShift.shiftName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nhân viên trực ca:</span>
                  <span className="font-semibold text-slate-200">{currentShift.staffName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Thời gian bắt đầu:</span>
                  <span className="text-slate-300">
                    {new Date(currentShift.startTime).toLocaleTimeString('vi-VN')} -{' '}
                    {new Date(currentShift.startTime).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="border-t border-slate-700/80 pt-2 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Tiền mặt đầu ca:</span>
                    <span className="text-slate-200 font-mono">
                      {formatVND(currentShift.initialCash)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Thu tiền mặt trong ca:</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      +{formatVND(currentShift.cashSales)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Thu chuyển khoản (VietQR):</span>
                    <span className="text-cyan-400 font-mono">
                      {formatVND(currentShift.transferSales)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Thu ví khác (MoMo/Thẻ):</span>
                    <span className="text-indigo-300 font-mono">
                      {formatVND(currentShift.otherSales)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
                    <span>Tổng tiền mặt kỳ vọng:</span>
                    <span className="text-emerald-400 font-mono">
                      {formatVND(currentShift.expectedEndingCash)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tiền mặt thực tế trong két (đếm thực tế):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={actualCash}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Nhập số tiền mặt thực tế"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                    VNĐ
                  </span>
                </div>
              </div>

              {/* Difference badge */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  difference === 0
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                    : difference > 0
                    ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-300'
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}
              >
                <span className="flex items-center space-x-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Chênh lệch sổ sách:</span>
                </span>
                <span className="font-bold font-mono text-sm">
                  {difference > 0 ? `+${formatVND(difference)} (Thừa)` : difference < 0 ? `${formatVND(difference)} (Thiếu)` : 'Khớp 100%'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi chú kết ca / Bàn giao:
                </label>
                <textarea
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-16"
                  placeholder="Ghi chú thêm về ca trực, các vấn đề phát sinh..."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-rose-500 hover:bg-rose-400 rounded-xl transition-all shadow shadow-rose-500/20"
                >
                  Xác Nhận Đóng Ca
                </button>
              </div>
            </form>
          ) : (
            /* Open Shift Mode */
            <form onSubmit={handleOpenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên ca làm việc:
                </label>
                <select
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Ca Sáng (08:00 - 16:00)">Ca Sáng (08:00 - 16:00)</option>
                  <option value="Ca Chiều / Tối (16:00 - 22:30)">Ca Chiều / Tối (16:00 - 22:30)</option>
                  <option value="Ca Cả Ngày (Fulltime)">Ca Cả Ngày (Fulltime)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tên nhân viên thu ngân:
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tiền mặt đầu ca (tiền thối ban đầu trong két):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={initialCash}
                    onChange={(e) => setInitialCash(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="2000000"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                    VNĐ
                  </span>
                </div>
                <div className="flex space-x-2 mt-2">
                  {[1000000, 2000000, 3000000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInitialCash(amt)}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                    >
                      {formatVND(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow shadow-emerald-500/20 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Mở Ca</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
