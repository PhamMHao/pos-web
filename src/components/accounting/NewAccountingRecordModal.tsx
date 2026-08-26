import React, { useState } from 'react';
import {
  X,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileText,
  DollarSign,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { AccountingRecord, PaymentMethod, Customer, Employee } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { useMasterData } from '../../core/contexts/MasterDataContext';

interface NewAccountingRecordModalProps {
  customers?: Customer[];
  employees?: Employee[];
  onClose: () => void;
  onSave: (record: AccountingRecord) => void;
}

const INCOME_CATEGORIES = [
  'Thu tiền bán sỉ / Dự án B2B',
  'Thu công nợ khách hàng',
  'Thu phí dịch vụ kỹ thuật / Sửa chữa',
  'Thu tiền nhượng quyền / Hoa hồng',
  'Thu lãi ngân hàng / Hoàn ứng',
  'Thu nhập khác',
];

const EXPENSE_CATEGORIES = [
  'Chi thanh toán tiền hàng cho NCC',
  'Chi lương & thưởng nhân viên',
  'Chi tiền thuê mặt bằng & Showroom',
  'Chi điện nước & Internet',
  'Chi tiếp khách & Marketing',
  'Chi sửa chữa máy móc & CCDC',
  'Chi thuế & Lệ phí nhà nước',
  'Chi phí quản lý khác',
];

export const NewAccountingRecordModal: React.FC<NewAccountingRecordModalProps> = ({
  customers = [],
  employees = [],
  onClose,
  onSave,
}) => {
  const { customers: masterCustomers, suppliers: masterSuppliers } = useMasterData();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(1000000);
  const [party, setParty] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ (> 0 VNĐ)!');
      return;
    }
    if (!party.trim()) {
      alert('Vui lòng nhập tên Đối tác / Người nộp hoặc nhận tiền!');
      return;
    }

    const prefix = type === 'income' ? 'PT' : 'PC';
    const code = `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    const newRecord: AccountingRecord = {
      id: `acc-${Date.now()}`,
      code,
      type,
      category,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      party: party.trim(),
      paymentMethod,
      status: 'completed',
      note: note.trim() || undefined,
      receiptNumber: code,
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {type === 'income' ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{type === 'income' ? 'Lập Phiếu Thu Tiền' : 'Lập Phiếu Chi Tiền'}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {type === 'income' ? 'Phiếu Thu (PT)' : 'Phiếu Chi (PC)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Ghi sổ quỹ tiền mặt, chuyển khoản ngân hàng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Loại Nghiệp Vụ *</label>
            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Thu Tiền (Ghi Có)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Chi Tiền (Ghi Nợ)</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              Số Tiền (VNĐ) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">VNĐ</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 italic">{formatVND(amount)}</div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              Hạng Mục Thu / Chi *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Party (Đối tác / Người nộp / nhận) */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              {type === 'income' ? 'Người Nộp Tiền / Khách Hàng *' : 'Người Nhận Tiền / Đối Tác *'}
            </label>
            <input
              type="text"
              required
              list="accounting-party-datalist"
              placeholder="VD: Anh Minh (Khách sỉ) / Cty Điện Lực..."
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <datalist id="accounting-party-datalist">
              {type === 'income'
                ? (masterCustomers || []).map((c) => <option key={c.id} value={`${c.name} (${c.phone})`} />)
                : (masterSuppliers || []).map((s) => <option key={s.id} value={`${s.name} (NCC)`} />)}
            </datalist>
          </div>

          {/* Method & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Phương Thức</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="cash">Tiền mặt (Cash)</option>
                <option value="transfer">Chuyển khoản (VietQR/Bank)</option>
                <option value="card">Thẻ POS / Quẹt thẻ</option>
                <option value="momo">Ví MoMo</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Ngày Ghi Sổ</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Diễn Giải / Ghi Chú</label>
            <textarea
              rows={2}
              placeholder="Chi tiết nội dung giao dịch chứng từ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
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
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-2 shadow transition ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{type === 'income' ? 'Lưu Phiếu Thu' : 'Lưu Phiếu Chi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
