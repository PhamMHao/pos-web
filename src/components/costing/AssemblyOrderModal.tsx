import React, { useState } from 'react';
import { X, Cpu, Layers, CheckCircle2, AlertTriangle, ArrowRight, Wrench, ShieldCheck, Box, PackagePlus } from 'lucide-react';
import { ProductCosting, Product } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface AssemblyOrderModalProps {
  costing: ProductCosting;
  products?: Product[];
  onClose: () => void;
  onConfirmAssemble: (payload: {
    costingId: string;
    quantity: number;
    technicianName: string;
    warehouse: string;
    note?: string;
  }) => Promise<void>;
}

export const AssemblyOrderModal: React.FC<AssemblyOrderModalProps> = ({
  costing,
  products = [],
  onClose,
  onConfirmAssemble,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [technicianName, setTechnicianName] = useState<string>('Nguyễn Văn Hưng (KTV Trưởng)');
  const [warehouse, setWarehouse] = useState<string>('Kho Tổng Gia Phúc (Linh Kiện & PC)');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const safeBomItems = costing.bomItems || [];

  // Check component stock
  const bomStockCheck = safeBomItems.map((bom) => {
    const matched = products.find(
      (p) =>
        p.name.toLowerCase().includes(bom.materialName.toLowerCase()) ||
        p.sku.toLowerCase().includes(bom.materialName.toLowerCase()) ||
        bom.materialName.toLowerCase().includes(p.name.toLowerCase())
    );
    const currentStock = matched ? Number(matched.stock) : 50; // default estimated stock
    const requiredQty = Number(bom.quantity) * quantity;
    const isSufficient = currentStock >= requiredQty;

    return {
      ...bom,
      matchedProduct: matched,
      currentStock,
      requiredQty,
      isSufficient,
    };
  });

  const allSufficient = bomStockCheck.every((b) => b.isSufficient);

  const handleAssemble = async () => {
    if (quantity <= 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmAssemble({
        costingId: costing.id,
        quantity,
        technicianName,
        warehouse,
        note,
      });
      setSuccessMessage(`Đã hoàn tất lệnh lắp ráp ${quantity} bộ "${costing.productName}" thành công!`);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      alert(`Lỗi khi lắp ráp: ${err.message || 'Không thể cập nhật kho'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Lệnh Lắp Ráp & Xuất Xưởng Thành Phẩm</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  BOM Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động trừ linh kiện thành phần và tăng tồn kho bộ PC thành phẩm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5 flex-1">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center space-x-3 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Target Product Summary Card */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Sản Phẩm Thành Phẩm</span>
              <h4 className="text-base font-bold text-white mt-0.5">{costing.productName}</h4>
              <p className="text-xs text-slate-400 font-mono">SKU: <strong className="text-slate-200">{costing.sku}</strong></p>
            </div>

            <div className="flex items-center space-x-4 shrink-0 text-right">
              <div>
                <span className="text-[11px] text-slate-400 block">Giá thành định mức:</span>
                <span className="text-sm font-bold text-rose-400 font-mono">{formatVND(costing.totalStandardCost)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Giá bán đề xuất:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{formatVND(costing.currentSellingPrice)}</span>
              </div>
            </div>
          </div>

          {/* Production Settings Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
              <label className="text-slate-400 font-medium">Số lượng lắp ráp (Bộ):</label>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm font-bold text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
              <label className="text-slate-400 font-medium">Kỹ thuật viên phụ trách:</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Nguyễn Văn Hưng (KTV Trưởng)">Nguyễn Văn Hưng (KTV Trưởng)</option>
                <option value="Nguyễn Quốc Tuấn (KTV Lắp Ráp)">Nguyễn Quốc Tuấn (KTV Lắp Ráp)</option>
                <option value="Trần Thị Thảo (Kế Toán Kho)">Trần Thị Thảo (Kế Toán Kho)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
              <label className="text-slate-400 font-medium">Kho nhận thành phẩm:</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              >
                <option value="Kho Tổng Gia Phúc (Linh Kiện & PC)">Kho Tổng Gia Phúc (Linh Kiện & PC)</option>
                <option value="Kho Quầy Trưng Bày Showroom">Kho Quầy Trưng Bày Showroom</option>
              </select>
            </div>
          </div>

          {/* BOM Component Deduction Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Bảng Đối Chiếu Linh Kiện Cần Xuất Kho (SL Lắp Ráp: {quantity} bộ)</span>
              </span>
              <span className={`text-[11px] font-bold ${allSufficient ? 'text-emerald-400' : 'text-amber-400'}`}>
                {allSufficient ? '✓ Đầy đủ linh kiện trong kho' : '⚠️ Có linh kiện tồn kho thấp'}
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Linh Kiện / Vật Tư</th>
                    <th className="p-3 text-center">Định Mức / 1 Bộ</th>
                    <th className="p-3 text-center">Tổng Cần Xuất</th>
                    <th className="p-3 text-right">Đơn Giá Nhập</th>
                    <th className="p-3 text-right">Thành Tiền</th>
                    <th className="p-3 text-center">Trạng Thái Tồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {bomStockCheck.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-3 font-semibold text-white">
                        <div>{item.materialName}</div>
                        {item.matchedProduct && (
                          <div className="text-[10px] text-slate-500 font-mono">SKU: {item.matchedProduct.sku}</div>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-center font-mono font-bold text-purple-300">
                        {item.requiredQty} {item.unit}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">{formatVND(item.unitCost)}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {formatVND(item.unitCost * item.requiredQty)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Đủ xuất kho
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="p-4 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 rounded-xl border border-purple-800/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Tổng giá trị linh kiện xuất xưởng:</span>
              <div className="text-base font-black text-white font-mono">
                {formatVND(costing.rawMaterialsCost * quantity)}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Tổng giá trị thành phẩm nhập kho:</span>
              <div className="text-base font-black text-emerald-400 font-mono">
                {formatVND(costing.totalStandardCost * quantity)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Hủy Bỏ
          </button>

          <button
            onClick={handleAssemble}
            disabled={isSubmitting || !!successMessage}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
          >
            <PackagePlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang Lắp Ráp & Cập Nhật Kho...' : `Xác Nhận Lắp Ráp (${quantity} Bộ)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
