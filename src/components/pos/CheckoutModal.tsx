import React, { useState } from 'react';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  FileText, 
  Check, 
  Sparkles,
  Copy,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, PaymentMethod, StoreSettings, Order } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';

export interface EInvoiceRequestData {
  requestEInvoice: boolean;
  buyerTaxCode: string;
  buyerCompanyName: string;
  buyerAddress: string;
  buyerEmail: string;
}

interface CheckoutModalProps {
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxAmount: number;
  taxRate: number;
  total: number;
  totalCost: number;
  selectedCustomer: Customer | null;
  deliveryAddress?: string;
  initialNote?: string;
  itemsCount: number;
  settings: StoreSettings;
  onConfirmPayment: (paymentDetails: {
    paymentMethod: PaymentMethod;
    paidAmount: number;
    changeAmount: number;
    paymentStatus: 'paid' | 'unpaid';
    note?: string;
    eInvoiceData?: EInvoiceRequestData;
  }) => Order;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  subtotal,
  discountAmount,
  discountCode,
  taxAmount,
  taxRate,
  total,
  totalCost,
  selectedCustomer,
  deliveryAddress,
  initialNote = '',
  itemsCount,
  settings,
  onConfirmPayment,
  onClose,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(total);
  const [orderNote, setOrderNote] = useState(initialNote);
  const [isCopied, setIsCopied] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // E-Invoice State
  const [wantEInvoice, setWantEInvoice] = useState(false);
  const [buyerTaxCode, setBuyerTaxCode] = useState('');
  const [buyerCompanyName, setBuyerCompanyName] = useState(selectedCustomer?.name || '');
  const [buyerAddress, setBuyerAddress] = useState(deliveryAddress || selectedCustomer?.address || '');
  const [buyerEmail, setBuyerEmail] = useState(selectedCustomer?.email || '');

  // Quick cash increments
  const cashSuggestions = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
    Math.ceil(total / 500000) * 500000,
    1000000,
    2000000,
  ].filter((v, i, a) => v >= total && a.indexOf(v) === i).slice(0, 5);

  const changeAmount = Math.max(0, (cashGiven || 0) - total);

  const tempOrderCode = 'HD-' + Date.now().toString().slice(-6);

  const vietQrUrl = generateVietQRUrl({
    bankCode: settings.bankCode,
    accountNo: settings.bankAccount,
    accountName: settings.bankAccountName,
    amount: total,
    description: `TT ${tempOrderCode}`,
  });

  const handleCopyBankInfo = () => {
    navigator.clipboard.writeText(
      `${settings.bankName} - STK: ${settings.bankAccount} - Chủ TK: ${settings.bankAccountName} - Số tiền: ${total} đ`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let paid = total;
    let change = 0;
    let status: 'paid' | 'unpaid' = 'paid';

    if (paymentMethod === 'cash') {
      paid = cashGiven;
      change = changeAmount;
    } else if (paymentMethod === 'debt') {
      paid = 0;
      change = 0;
      status = 'unpaid';
    }

    const order = onConfirmPayment({
      paymentMethod,
      paidAmount: paid,
      changeAmount: change,
      paymentStatus: status,
      note: orderNote,
      eInvoiceData: wantEInvoice
        ? {
            requestEInvoice: true,
            buyerTaxCode,
            buyerCompanyName: buyerCompanyName || (selectedCustomer ? selectedCustomer.name : 'Khách hàng lẻ'),
            buyerAddress: buyerAddress || (selectedCustomer ? selectedCustomer.address || '' : ''),
            buyerEmail: buyerEmail || (selectedCustomer ? selectedCustomer.email || '' : ''),
          }
        : undefined,
    });

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setCompletedOrder(order);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Thanh Toán Đơn Hàng</h3>
              <p className="text-xs text-slate-400">
                {itemsCount} món hàng • Khách:{' '}
                {selectedCustomer ? selectedCustomer.name : 'Khách lẻ vãng lai'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Total Banner */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-800/60 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Tổng thanh toán:</span>
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">
                {formatVND(total)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 space-x-2">
                <span>Tạm tính: {formatVND(subtotal)}</span>
                {discountAmount > 0 && (
                  <span className="text-rose-400">
                    • Giảm: -{formatVND(discountAmount)}
                  </span>
                )}
                {taxAmount > 0 && <span>• VAT ({taxRate}%): +{formatVND(taxAmount)}</span>}
              </div>
            </div>

            {selectedCustomer && (
              <div className="text-right">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Hạng: {selectedCustomer.tier}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Điểm: {selectedCustomer.points} pts
                </p>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Chọn phương thức thanh toán:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'cash', label: 'Tiền mặt', icon: Banknote, color: 'emerald' },
                { id: 'transfer', label: 'VietQR', icon: QrCode, color: 'cyan' },
                { id: 'card', label: 'Thẻ POS', icon: CreditCard, color: 'indigo' },
                { id: 'momo', label: 'MoMo / Zalo', icon: Smartphone, color: 'pink' },
                { id: 'debt', label: 'Ghi nợ', icon: FileText, color: 'amber' },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'cash' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tiền khách đưa:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Nhập số tiền khách đưa"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">
                    VNĐ
                  </span>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {cashSuggestions.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashGiven(amt)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-colors ${
                      cashGiven === amt
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {formatVND(amt)}
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs">
                <span className="text-slate-400">Tiền thối lại cho khách:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {formatVND(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <img
                  src={vietQrUrl}
                  alt="VietQR code"
                  className="w-36 h-36 object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2 text-xs text-slate-300 w-full">
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-semibold text-white">{settings.bankName}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {settings.bankAccount}
                  </span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-semibold text-white uppercase">
                    {settings.bankAccountName}
                  </span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Nội dung chuyển khoản:</span>
                  <span className="font-mono font-bold text-amber-300">
                    TT {tempOrderCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyBankInfo}
                  className="w-full py-1.5 text-center text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'Đã sao chép!' : 'Sao chép thông tin STK'}</span>
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'debt' && (
            <div className="bg-amber-950/30 border border-amber-800/50 p-4 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Ghi Nhận Công Nợ Khách Hàng</span>
              </div>
              <p className="text-amber-200/80 leading-relaxed">
                Đơn hàng sẽ được chuyển sang trạng thái <strong>Chưa thanh toán (Công nợ)</strong>{' '}
                và cộng dồn vào hồ sơ công nợ của khách hàng{' '}
                <strong>{selectedCustomer ? selectedCustomer.name : 'Khách lẻ'}</strong>.
              </p>
              {!selectedCustomer && (
                <p className="text-rose-400 font-semibold">
                  ⚠️ Lưu ý: Bạn chưa chọn khách hàng trong đơn. Nên chọn khách hàng để theo dõi công nợ chính xác!
                </p>
              )}
            </div>
          )}

          {/* E-Invoice Issuance Option */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs font-bold text-rose-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wantEInvoice}
                  onChange={(e) => setWantEInvoice(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-rose-500 focus:ring-offset-slate-900"
                />
                <span>🧾 Xuất Hóa Đơn Điện Tử VAT (Thông tư 78/NĐ123)</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Ký số CQT
              </span>
            </div>

            {wantEInvoice && (
              <div className="space-y-2.5 pt-2 border-t border-rose-900/40 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Mã số thuế người mua (MST):
                    </label>
                    <input
                      type="text"
                      value={buyerTaxCode}
                      onChange={(e) => setBuyerTaxCode(e.target.value)}
                      placeholder="VD: 0312345678"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email nhận hóa đơn:
                    </label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="ketoan@congty.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tên Công ty / Đơn vị mua hàng:
                  </label>
                  <input
                    type="text"
                    value={buyerCompanyName}
                    onChange={(e) => setBuyerCompanyName(e.target.value)}
                    placeholder="VD: Công ty TNHH Kỹ Thuật An Phát"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Địa chỉ xuất hóa đơn:
                  </label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi chú đơn hàng (Tùy chọn):
            </label>
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="VD: Giao trước 17h, hàng dễ vỡ..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 shrink-0 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
          >
            Quay Lại
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Hoàn Tất & In Hóa Đơn ({formatVND(total)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
