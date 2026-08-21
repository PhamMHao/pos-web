import React, { useState } from 'react';
import {
  X,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Wrench,
  Trash2,
  Ban,
  Save,
  Tag,
  Building2,
  Box,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Product, ProductLifecycleStage, ProductLifecycleLog } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface ProductLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSaveProduct: (updatedProduct: Product) => void;
}

const LIFECYCLE_STAGES: {
  stage: ProductLifecycleStage;
  label: string;
  desc: string;
  icon: any;
  color: string;
  badgeClass: string;
}[] = [
  {
    stage: 'new_inbound',
    label: '1. Nhập Mới',
    desc: 'Hàng mới nhập về cảng/kho chưa phân loại',
    icon: Box,
    color: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    stage: 'in_storage',
    label: '2. Lưu Kho Chuẩn',
    desc: 'Lưu trữ trên kệ chuẩn, sẵn sàng xuất bán',
    icon: Layers,
    color: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    stage: 'on_display',
    label: '3. Đang Bày Bán',
    desc: 'Trưng bày tại showroom / quầy thu ngân',
    icon: Tag,
    color: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    stage: 'reserved',
    label: '4. Đã Đặt / Giữ Hàng',
    desc: 'Đang khóa tồn cho dự án hoặc hợp đồng',
    icon: ShieldCheck,
    color: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    stage: 'audited',
    label: '5. Kiểm Kê Đạt',
    desc: 'Đã qua kỳ kiểm kê số lượng & chất lượng',
    icon: CheckCircle2,
    color: 'text-teal-400',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
  {
    stage: 'under_repair',
    label: '6. Bảo Hành / Sửa Chữa',
    desc: 'Linh kiện lỗi đang được bảo hành hoặc RMA',
    icon: Wrench,
    color: 'text-purple-400',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    stage: 'liquidation',
    label: '7. Thanh Lý / Xuất Hủy',
    desc: 'Hàng cận date, xả kho giá vốn hoặc hủy',
    icon: Trash2,
    color: 'text-orange-400',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  {
    stage: 'discontinued',
    label: '8. Ngừng Kinh Doanh',
    desc: 'Mẫu cũ đã End-of-Life (EOL), dừng nhập',
    icon: Ban,
    color: 'text-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
];

export const ProductLifecycleModal: React.FC<ProductLifecycleModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveProduct,
}) => {
  const [stage, setStage] = useState<ProductLifecycleStage>(product.lifecycleStage || 'in_storage');
  const [warehouse, setWarehouse] = useState<string>(product.warehouse || 'Kho Tổng Gia Phúc TP.HCM');
  const [storageLocation, setStorageLocation] = useState<string>(product.storageLocation || 'Kệ A1-02');
  const [batchNumber, setBatchNumber] = useState<string>(product.batchNumber || ('LOT-' + new Date().getFullYear() + '-01'));
  const [manufactureDate, setManufactureDate] = useState<string>(product.manufactureDate || '');
  const [expiryDate, setExpiryDate] = useState<string>(product.expiryDate || '');
  const [logNote, setLogNote] = useState('');
  const [actionBy, setActionBy] = useState('Trần Thủ Kho');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccessChime();

    const newLog: ProductLifecycleLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      stage,
      warehouse,
      storageLocation,
      batchNumber,
      expiryDate,
      actionBy: actionBy.trim() || 'Thủ Kho',
      note: logNote.trim() || `Chuyển giai đoạn sang ${LIFECYCLE_STAGES.find(s => s.stage === stage)?.label || stage}`,
    };

    const updatedProduct: Product = {
      ...product,
      lifecycleStage: stage,
      warehouse,
      storageLocation,
      batchNumber,
      manufactureDate,
      expiryDate,
      lifecycleLogs: [newLog, ...(product.lifecycleLogs || [])],
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(updatedProduct);
    setLogNote('');
    alert('🎉 Đã cập nhật dòng đời và kiểm soát kho hàng thành công!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Dòng Đời Sản Phẩm & Kiểm Soát Kho (Product Lifecycle)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {product.sku}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {product.name} • Tồn kho: <strong className="text-white font-mono">{product.stock} {product.unit}</strong> • Giá vốn: <strong className="text-emerald-400 font-mono">{formatVND(product.costPrice)}</strong>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-900/60 text-xs">
          
          {/* Left Panel: Stage Selector & Location */}
          <div className="w-full md:w-6/12 bg-slate-950 p-5 border-r border-slate-800 space-y-4 overflow-y-auto shrink-0">
            
            {/* 8 Stages Grid */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Chọn Giai Đoạn Dòng Đời Sản Phẩm (8 Bước Chuẩn ERP):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LIFECYCLE_STAGES.map((st) => {
                  const Icon = st.icon;
                  const isSelected = stage === st.stage;
                  return (
                    <div
                      key={st.stage}
                      onClick={() => setStage(st.stage)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2 ${
                        isSelected
                          ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-bold text-xs">{st.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{st.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warehouse & Shelf Location */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Vị Trí Lưu Kho & Kệ Hàng Thực Tế</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Kho Lưu Trữ:</label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                  >
                    <option value="Kho Tổng Gia Phúc TP.HCM">Kho Tổng Gia Phúc TP.HCM</option>
                    <option value="Kho Chi Nhánh Hà Nội">Kho Chi Nhánh Hà Nội</option>
                    <option value="Kho Kỹ Thuật & Showroom">Kho Kỹ Thuật & Showroom</option>
                    <option value="Kho Bảo Hành & RMA">Kho Bảo Hành & RMA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Vị Trí Kệ / Ô / Dãy:</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Kệ A1-02, Tầng 3..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Lot / Batch & Expiry */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Số Lô Sản Xuất (Batch/Lot) & Hạn Dùng</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Số Lô (Lot/Batch):</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="LOT-2026-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ngày Sản Xuất:</label>
                  <input
                    type="date"
                    value={manufactureDate}
                    onChange={(e) => setManufactureDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200 text-center font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Hạn Sử Dụng (Exp):</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-rose-400 text-center font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Log Note */}
            <div>
              <label className="block text-slate-400 font-bold mb-1">Ghi Chú Luân Chuyển / Kiểm Kê:</label>
              <textarea
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder="VD: Kiểm kê quý 1 đạt chuẩn 100%, chuyển từ kho phụ về kệ trưng bày..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Giai Đoạn & Vị Trí Kho</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Lifecycle Logs Timeline */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Nhật Ký Luân Chuyển & Biến Động Sản Phẩm</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {(product.lifecycleLogs?.length || 0) + 1} Sự kiện
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {product.lifecycleLogs && product.lifecycleLogs.length > 0 ? (
                product.lifecycleLogs.map((log, idx) => {
                  const stageInfo = LIFECYCLE_STAGES.find((s) => s.stage === log.stage);
                  return (
                    <div key={log.id || idx} className="relative group">
                      <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-slate-950 shadow-md"></div>
                      <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stageInfo?.badgeClass || 'bg-slate-800 text-slate-300'}`}>
                            {stageInfo?.label || log.stage}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-white font-semibold text-xs">{log.note}</p>
                        <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900 gap-2">
                          <span>📍 Kho: <strong>{log.warehouse}</strong> ({log.storageLocation})</span>
                          <span>👤 Thực hiện: <strong>{log.actionBy}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-slate-950 shadow-md"></div>
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Nhập kho ban đầu
                    </span>
                    <p className="text-white font-semibold text-xs">Sản phẩm được tạo và nạp vào kho hàng.</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {new Date(product.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
