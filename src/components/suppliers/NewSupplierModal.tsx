import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Star,
  Award,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Supplier } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  initialSupplier?: Supplier | null;
}

export const NewSupplierModal: React.FC<NewSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSupplier,
}) => {
  const [name, setName] = useState(initialSupplier?.name || '');
  const [code, setCode] = useState(initialSupplier?.code || ('NCC-' + Date.now().toString().slice(-4)));
  const [taxCode, setTaxCode] = useState(initialSupplier?.taxCode || '');
  const [tier, setTier] = useState<Supplier['tier']>(initialSupplier?.tier || 'Tier 1 Chính Hãng');
  const [category, setCategory] = useState(initialSupplier?.category || 'Camera & An Ninh');
  const [contactPerson, setContactPerson] = useState(initialSupplier?.contactPerson || '');
  const [phone, setPhone] = useState(initialSupplier?.phone || '');
  const [email, setEmail] = useState(initialSupplier?.email || '');
  const [address, setAddress] = useState(initialSupplier?.address || '');
  const [bankName, setBankName] = useState(initialSupplier?.bankName || 'Ngân Hàng TMCP Quân Đội (MB Bank)');
  const [bankAccount, setBankAccount] = useState(initialSupplier?.bankAccount || '');
  const [bankCode, setBankCode] = useState(initialSupplier?.bankCode || 'MB');
  const [creditLimit, setCreditLimit] = useState<number>(initialSupplier?.creditLimit || 100000000);
  const [creditDays, setCreditDays] = useState<number>(initialSupplier?.creditDays || 30);
  const [ratingQuality, setRatingQuality] = useState<number>(initialSupplier?.ratingQuality || 9.5);
  const [ratingPrice, setRatingPrice] = useState<number>(initialSupplier?.ratingPrice || 9.0);
  const [ratingOnTime, setRatingOnTime] = useState<number>(initialSupplier?.ratingOnTime || 9.5);
  const [ratingWarranty, setRatingWarranty] = useState<number>(initialSupplier?.ratingWarranty || 9.2);
  const [notes, setNotes] = useState(initialSupplier?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Vui lòng nhập tên nhà cung ứng và số điện thoại liên hệ!');
      return;
    }

    const supplierData: Supplier = {
      id: initialSupplier?.id || ('sup-' + Date.now()),
      code: code.trim(),
      name: name.trim(),
      taxCode: taxCode.trim(),
      tier,
      category,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      bankName: bankName.trim(),
      bankAccount: bankAccount.trim(),
      bankCode: bankCode.trim(),
      creditLimit: Number(creditLimit) || 0,
      creditDays: Number(creditDays) || 0,
      currentDebt: initialSupplier?.currentDebt || 0,
      ratingQuality: Number(ratingQuality) || 9,
      ratingPrice: Number(ratingPrice) || 9,
      ratingOnTime: Number(ratingOnTime) || 9,
      ratingWarranty: Number(ratingWarranty) || 9,
      notes: notes.trim(),
      priceList: initialSupplier?.priceList || [],
      createdAt: initialSupplier?.createdAt || new Date().toISOString(),
    };

    onSave(supplierData);
    sounds.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {initialSupplier ? 'Chỉnh Sửa Hồ Sơ Nhà Cung Ứng' : 'Thêm Nhà Cung Ứng Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Lưu trữ thông tin đối tác, hạn mức tín dụng công nợ và chỉ số năng lực
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/60 text-xs">
          {/* Row 1: Code, Name, Tier */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Mã Nhà Cung Ứng *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Tên Nhà Cung Ứng / Đơn Vị Phân Phối *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nhà Phân Phối Synnex FPT..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: TaxCode, Tier, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Mã Số Thuế (MST)</label>
              <input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="0101234567"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Phân Cấp Nhà Cung Ứng</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none"
              >
                <option value="Tier 1 Chính Hãng">👑 Tier 1 Chính Hãng (Official Disty)</option>
                <option value="Tổng Đại Lý">⭐ Tổng Đại Lý (Master Agent)</option>
                <option value="Nhà Phân Phối">📦 Nhà Phân Phối Vùng</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Ngành Hàng Chính</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Camera & An Ninh">Camera & Thiết Bị An Ninh</option>
                <option value="Hạ Tầng Mạng & WiFi">Hạ Tầng Mạng & WiFi</option>
                <option value="Thiết Bị Bán Hàng POS">Thiết Bị Bán Hàng POS & Barcode</option>
                <option value="Máy Tính & Linh Kiện">Máy Tính & Linh Kiện Server</option>
                <option value="Vật Tư & Cáp Điện">Vật Tư & Cáp Điện Tử</option>
              </select>
            </div>
          </div>

          {/* Row 3: Contact Person, Phone, Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Đại Diện Kinh Doanh / Sale</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="VD: Nguyễn Văn A (Quản lý đại lý)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Số Điện Thoại Hotline / Zalo *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Email Nhận Đơn Đặt Hàng</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@synnexfpt.com.vn"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Địa Chỉ Trụ Sở & Kho Xuất Hàng</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bank & Financial Credit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Tên Ngân Hàng & STK</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ngân Hàng MB Bank"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white mb-1.5"
              />
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Số tài khoản nhận tiền"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Hạn Mức Công Nợ (VND)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                step="1000000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold mb-1.5"
              />
              <p className="text-[10px] text-slate-500">{formatVND(creditLimit)}</p>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Hạn Thanh Toán (Ngày)</label>
              <input
                type="number"
                value={creditDays}
                onChange={(e) => setCreditDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold mb-1.5"
              />
              <p className="text-[10px] text-slate-500">Số ngày cho phép nợ gối đầu</p>
            </div>
          </div>

          {/* Ratings Matrix (1-10) */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Đánh Giá Chỉ Số Năng Lực & Uy Tín (Thang Điểm 1 - 10)</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Chất Lượng ({ratingQuality}⭐)</label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={ratingQuality}
                  onChange={(e) => setRatingQuality(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Độ Cạnh Tranh Giá ({ratingPrice}⭐)</label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={ratingPrice}
                  onChange={(e) => setRatingPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Giao Hàng Đúng Hẹn ({ratingOnTime}⭐)</label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={ratingOnTime}
                  onChange={(e) => setRatingOnTime(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Hậu Mãi & SLA ({ratingWarranty}⭐)</label>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="0.1"
                  value={ratingWarranty}
                  onChange={(e) => setRatingWarranty(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Ghi Chú Hợp Tác & Chính Sách Đổi Trả</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Chính sách bảo hành 1 đổi 1 trong 24h, hỗ trợ mượn thiết bị thay thế..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialSupplier ? 'Cập Nhật Hồ Sơ' : 'Lưu Nhà Cung Ứng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
