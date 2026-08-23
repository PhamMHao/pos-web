import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  X,
  Gift,
} from 'lucide-react';
import { Promotion } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface PromotionsViewProps {
  promotions: Promotion[];
  onSavePromotion: (promotion: Promotion) => void;
  onDeletePromotion: (promotionId: string) => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({
  promotions = [],
  onSavePromotion,
  onDeletePromotion,
}) => {
  const safePromos = Array.isArray(promotions) ? promotions : [];
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: 100000,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: true,
  });

  const openAddModal = () => {
    setEditingPromo(null);
    setFormData({
      code: 'VOUCHER' + Math.floor(100 + Math.random() * 900),
      title: 'Giảm giá tri ân khách hàng',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 200000,
      maxDiscount: 50000,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (p: Promotion) => {
    setEditingPromo(p);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    const promoToSave: Promotion = {
      id: editingPromo ? editingPromo.id : 'promo-' + Date.now(),
      code: formData.code.toUpperCase().trim(),
      title: formData.title,
      discountType: formData.discountType || 'percentage',
      discountValue: Number(formData.discountValue) || 0,
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      startDate: formData.startDate || new Date().toISOString().slice(0, 10),
      endDate: formData.endDate || new Date().toISOString().slice(0, 10),
      isActive: formData.isActive ?? true,
      usageLimit: formData.usageLimit || 100,
      usedCount: editingPromo ? editingPromo.usedCount : 0,
    };

    onSavePromotion(promoToSave);
    setShowModal(false);
  };

  const toggleStatus = (p: Promotion) => {
    onSavePromotion({
      ...p,
      isActive: !p.isActive,
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Tag className="w-6 h-6 text-emerald-400" />
            <span>Chương Trình Khuyến Mãi & Voucher</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Tạo và quản lý mã giảm giá, voucher chiết khấu tại quầy POS và đơn online.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Khuyến Mãi</span>
        </button>
      </div>

      {/* Promos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safePromos.map((p) => (
          <div
            key={p.id}
            className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden shadow-lg ${
              p.isActive
                ? 'border-slate-800 hover:border-emerald-500/50'
                : 'border-slate-800/50 opacity-60'
            }`}
          >
            {/* Top decorative stripe */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                p.isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-700'
              }`}
            />

            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono font-extrabold text-xs rounded-lg uppercase tracking-wider">
                  {p.code}
                </span>

                <button
                  onClick={() => toggleStatus(p)}
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                    p.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {p.isActive ? 'Đang áp dụng' : 'Đã tạm dừng'}
                </button>
              </div>

              <h4 className="font-bold text-slate-100 text-sm mt-3">{p.title}</h4>

              <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <Gift className="w-3.5 h-3.5" />
                  <span>
                    Giảm:{' '}
                    {p.discountType === 'percentage'
                      ? `${p.discountValue}%`
                      : formatVND(p.discountValue)}
                    {p.maxDiscount ? ` (Tối đa ${formatVND(p.maxDiscount)})` : ''}
                  </span>
                </div>

                <div>
                  Đơn tối thiểu: <strong>{formatVND(p.minOrderValue)}</strong>
                </div>

                <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Hạn dùng: {p.startDate} → {p.endDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => openEditModal(p)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn xóa mã ${p.code}?`)) {
                    onDeletePromotion(p.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingPromo ? 'Chỉnh Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mã Voucher Code (*):
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                  placeholder="VD: SALE50K, TET2025"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tiêu đề / Tên chương trình (*):
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="VD: Khuyến mãi mừng khai trương"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hình thức giảm:
                  </label>
                  <select
                    value={formData.discountType || 'percentage'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="percentage">Theo Phần Trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giá trị giảm:
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Đơn hàng tối thiểu (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderValue || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giảm tối đa (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ngày bắt đầu:
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ngày kết thúc:
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow"
                >
                  {editingPromo ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
