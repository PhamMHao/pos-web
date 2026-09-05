import React, { useState } from 'react';
import { X, Truck, CheckCircle2, ShieldCheck, MapPin, User, Phone, FileText } from 'lucide-react';
import { CustomerContract, CreateHandoverPayload } from '../contracts.types';

export interface CustomerContractHandoverModalProps {
  contract: CustomerContract | null;
  onClose: () => void;
  onSubmit: (payload: CreateHandoverPayload) => Promise<void>;
}

export const CustomerContractHandoverModal: React.FC<CustomerContractHandoverModalProps> = ({
  contract,
  onClose,
  onSubmit,
}) => {
  const [delivererName, setDelivererName] = useState('Trần Quốc Bảo');
  const [delivererPhone, setDelivererPhone] = useState('0988 123 456');
  const [receiverName, setReceiverName] = useState(
    contract?.customerRepresentative || contract?.customerName || ''
  );
  const [receiverPhone, setReceiverPhone] = useState(contract?.customerPhone || '');
  const [deliveryLocation, setDeliveryLocation] = useState(contract?.customerAddress || '');
  const [technicalCondition, setTechnicalCondition] = useState(
    'Hàng mới 100%, nguyên đai nguyên kiện, hoạt động bình thường, đầy đủ CO/CQ và phụ kiện theo hợp đồng.'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        delivererName,
        delivererPhone,
        receiverName,
        receiverPhone,
        deliveryLocation,
        technicalCondition,
        notes,
        digitalSignatureDeliverer: `${delivererName} (Kỹ thuật GP-ERP)`,
        digitalSignatureReceiver: `${receiverName} (Đại diện bên nhận)`,
      });
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi lập biên bản bàn giao!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Lập Biên Bản Bàn Giao Thiết Bị & Nghiệm Thu Kỹ Thuật</h3>
              <p className="text-[11px] text-slate-400 font-mono">{contract.contractNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs text-slate-300">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Cán Bộ Giao Hàng (GP-ERP)</label>
              <input
                type="text"
                value={delivererName}
                onChange={(e) => setDelivererName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">SĐT Người Giao</label>
              <input
                type="text"
                value={delivererPhone}
                onChange={(e) => setDelivererPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Người Nhận Hàng (Bên A)</label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">SĐT Người Nhận</label>
              <input
                type="text"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Địa Điểm Bàn Giao</label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Hiện Trạng Kỹ Thuật & Tình Trạng Hàng Hóa</label>
            <textarea
              rows={3}
              value={technicalCondition}
              onChange={(e) => setTechnicalCondition(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Ghi Chú Thêm (Nếu có)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Đã bàn giao đầy đủ tài liệu hướng dẫn và chìa khóa tủ rack"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Xác Nhận Bàn Giao</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
