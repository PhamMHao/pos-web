import React, { useState } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  User,
  CheckCircle2,
  Phone,
  MapPin,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { Customer, PaymentMethod } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface CollectDebtModalProps {
  customer: Customer;
  onClose: () => void;
  onConfirm: (customerId: string, amount: number, paymentMethod: PaymentMethod, note: string) => void;
}

export const CollectDebtModal: React.FC<CollectDebtModalProps> = ({
  customer,
  onClose,
  onConfirm,
}) => {
  const currentDebt = customer.debt || 0;
  const [collectAmount, setCollectAmount] = useState<number>(currentDebt);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState<string>(`Thu công nợ khách hàng ${customer.name}`);

  const handleQuickPercent = (percent: number) => {
    setCollectAmount(Math.round((currentDebt * percent) / 100));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectAmount || collectAmount <= 0) {
      alert('Vui lòng nhập số tiền thu nợ lớn hơn 0!');
      return;
    }
    if (collectAmount > currentDebt) {
      if (!confirm(`Số tiền thu (${formatVND(collectAmount)}) lớn hơn dư nợ hiện tại (${formatVND(currentDebt)}). Bạn có muốn tiếp tục?`)) {
        return;
      }
    }

    onConfirm(customer.id, collectAmount, paymentMethod, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Thu Hồi Công Nợ Khách Hàng</h3>
              <p className="text-xs text-slate-400">Ghi nhận phiếu thu & giảm nợ trực tiếp vào CSDL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-4">
          {/* Customer Summary */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{customer.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                {customer.tier}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>SĐT: {customer.phone}</span>
              <span>Tổng chi tiêu: {formatVND(customer.totalSpent)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-rose-400 font-medium">Dư nợ hiện tại:</span>
              <span className="text-base font-black text-rose-400 font-mono">
                {formatVND(currentDebt)}
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-300 font-semibold">Số Tiền Thu Nợ (VNĐ) *</label>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPercent(50)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(100)}
                  className="px-2 py-0.5 rounded text-[10px] bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 font-bold transition"
                >
                  Toàn Bộ
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={collectAmount}
                onChange={(e) => setCollectAmount(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">VNĐ</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 italic">{formatVND(collectAmount)}</div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-semibold">Phương Thức Thu Tiền</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="cash">Tiền mặt (Thu ngân trực tiếp)</option>
              <option value="transfer">Chuyển khoản (VietQR / Techcombank)</option>
              <option value="card">Quẹt thẻ ngân hàng POS</option>
              <option value="momo">Ví điện tử MoMo</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-semibold">Ghi Chú Phiếu Thu</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Thu tiền công nợ đơn hàng đợt 1..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Thu Nợ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
