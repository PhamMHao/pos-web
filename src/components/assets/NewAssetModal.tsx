import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Wrench,
  Truck,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import { EnterpriseAsset } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface NewAssetModalProps {
  assetToEdit?: EnterpriseAsset | null;
  onClose: () => void;
  onSave: (asset: EnterpriseAsset) => void;
}

const CATEGORIES: EnterpriseAsset['category'][] = [
  'Thiết bị bán hàng POS',
  'Máy móc & Băng chuyền',
  'Phương tiện vận tải',
  'Nội thất & Quầy kệ',
];

export const NewAssetModal: React.FC<NewAssetModalProps> = ({
  assetToEdit,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState(
    assetToEdit?.code || `TS-${Date.now().toString().slice(-4)}`
  );
  const [name, setName] = useState(assetToEdit?.name || '');
  const [category, setCategory] = useState<EnterpriseAsset['category']>(
    assetToEdit?.category || 'Thiết bị bán hàng POS'
  );
  const [purchaseDate, setPurchaseDate] = useState(
    assetToEdit?.purchaseDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );
  const [originalValue, setOriginalValue] = useState<number>(
    assetToEdit?.originalValue || 5000000
  );
  const [depreciationMonths, setDepreciationMonths] = useState<number>(
    assetToEdit?.depreciationMonths || 24
  );
  const [remainingValue, setRemainingValue] = useState<number>(
    assetToEdit?.remainingValue !== undefined ? assetToEdit.remainingValue : 5000000
  );
  const [assignedTo, setAssignedTo] = useState(assetToEdit?.assignedTo || 'Quầy Thu Ngân 01');
  const [status, setStatus] = useState<EnterpriseAsset['status']>(
    assetToEdit?.status || 'good'
  );
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(
    assetToEdit?.lastMaintenanceDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );

  const handleOriginalValueChange = (val: number) => {
    setOriginalValue(val);
    if (!assetToEdit) {
      setRemainingValue(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên tài sản / thiết bị!');
      return;
    }

    const savedAsset: EnterpriseAsset = {
      id: assetToEdit ? assetToEdit.id : `asset-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      purchaseDate,
      originalValue: Number(originalValue) || 0,
      depreciationMonths: Number(depreciationMonths) || 12,
      remainingValue: Number(remainingValue) || 0,
      assignedTo: assignedTo.trim() || 'Chưa bàn giao',
      status,
      lastMaintenanceDate: lastMaintenanceDate || undefined,
    };

    onSave(savedAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{assetToEdit ? 'Chỉnh Sửa Tài Sản' : 'Thêm Mới Tài Sản / Thiết Bị'}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ERP Assets
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý thiết bị POS, máy in, phương tiện vận tải & khấu hao TSCĐ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Code & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Mã Tài Sản *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TS-POS-01"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Tên Thiết Bị / Tài Sản *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Máy POS Cảm ứng Sunmi D2s..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Phân Loại Nhóm</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EnterpriseAsset['category'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Tình Trạng Vận Hành</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnterpriseAsset['status'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="good">Hoạt động tốt (100%)</option>
                <option value="maintenance_required">Cần bảo dưỡng / Kiểm tra</option>
                <option value="broken">Hỏng hóc / Đang sửa</option>
                <option value="liquidated">Đã thanh lý</option>
              </select>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Nguyên Giá (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="10000"
                required
                value={originalValue}
                onChange={(e) => handleOriginalValueChange(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="text-[10px] text-slate-400 mt-0.5">{formatVND(originalValue)}</div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Khấu Hao (Tháng)</label>
              <input
                type="number"
                min="1"
                required
                value={depreciationMonths}
                onChange={(e) => setDepreciationMonths(Number(e.target.value) || 12)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Giá Trị Còn Lại</label>
              <input
                type="number"
                min="0"
                required
                value={remainingValue}
                onChange={(e) => setRemainingValue(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
              <div className="text-[10px] text-cyan-400 mt-0.5">{formatVND(remainingValue)}</div>
            </div>
          </div>

          {/* Assigned & Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Bàn Giao / Chịu Trách Nhiệm</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="VD: Quầy Thu Ngân 01 / Anh Minh"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Ngày Đưa Vào Sử Dụng</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Maintenance */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Lịch Bảo Trì Gần Nhất</label>
            <input
              type="date"
              value={lastMaintenanceDate}
              onChange={(e) => setLastMaintenanceDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
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
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{assetToEdit ? 'Cập Nhật Thiết Bị' : 'Lưu Tài Sản Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
