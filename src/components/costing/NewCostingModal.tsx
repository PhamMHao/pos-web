import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Layers,
  Cpu,
  Flame,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { ProductCosting } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { useMasterData } from '../../core/contexts/MasterDataContext';

interface NewCostingModalProps {
  onClose: () => void;
  onSave: (costing: ProductCosting) => void;
}

interface BOMItemInput {
  materialName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export const NewCostingModal: React.FC<NewCostingModalProps> = ({
  onClose,
  onSave,
}) => {
  const { unitsOfMeasure: masterUOMs } = useMasterData();
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState(`BOM-${Date.now().toString().slice(-4)}`);
  const [laborCost, setLaborCost] = useState<number>(200000);
  const [machineryAndOverheadCost, setMachineryAndOverheadCost] = useState<number>(100000);
  const [currentSellingPrice, setCurrentSellingPrice] = useState<number>(2500000);

  const [bomItems, setBomItems] = useState<BOMItemInput[]>([
    {
      materialName: 'Khung vỏ / Mainboard',
      unit: 'Bộ',
      quantity: 1,
      unitCost: 800000,
      totalCost: 800000,
    },
    {
      materialName: 'Linh kiện thứ cấp / Cáp nguồn',
      unit: 'Sợi',
      quantity: 2,
      unitCost: 150000,
      totalCost: 300000,
    },
  ]);

  const handleAddBomItem = () => {
    setBomItems((prev) => [
      ...prev,
      {
        materialName: '',
        unit: 'Cái',
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
      },
    ]);
  };

  const handleRemoveBomItem = (index: number) => {
    if (bomItems.length <= 1) return;
    setBomItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBomItem = (
    index: number,
    field: keyof BOMItemInput,
    val: any
  ) => {
    setBomItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unitCost') {
            const q = field === 'quantity' ? Number(val) : updated.quantity;
            const u = field === 'unitCost' ? Number(val) : updated.unitCost;
            updated.totalCost = (q || 0) * (u || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const rawMaterialsCost = bomItems.reduce(
    (sum, it) => sum + (it.totalCost || 0),
    0
  );
  const totalStandardCost =
    rawMaterialsCost + (laborCost || 0) + (machineryAndOverheadCost || 0);

  const grossMarginPercent =
    currentSellingPrice > 0
      ? Math.round(
          ((currentSellingPrice - totalStandardCost) / currentSellingPrice) *
            100 *
            100
        ) / 100
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Vui lòng nhập tên sản phẩm lắp ráp / định mức BOM!');
      return;
    }
    const validBOM = bomItems.filter((b) => b.materialName.trim() && b.quantity > 0);
    if (validBOM.length === 0) {
      alert('Vui lòng nhập ít nhất 1 linh kiện hợp lệ vào định mức BOM!');
      return;
    }

    const newCosting: ProductCosting = {
      id: `costing-${Date.now()}`,
      productName: productName.trim(),
      sku: sku.trim().toUpperCase(),
      rawMaterialsCost,
      laborCost: Number(laborCost) || 0,
      machineryAndOverheadCost: Number(machineryAndOverheadCost) || 0,
      totalStandardCost,
      currentSellingPrice: Number(currentSellingPrice) || 0,
      grossMarginPercent,
      bomItems: validBOM.map((b) => ({
        materialName: b.materialName.trim(),
        unit: b.unit || 'Cái',
        quantity: Number(b.quantity) || 1,
        unitCost: Number(b.unitCost) || 0,
        totalCost: Number(b.totalCost) || 0,
      })),
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    onSave(newCosting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Thiết Lập Định Mức BOM & Tính Giá Thành</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Bill of Materials
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Phân tích cơ cấu chi phí vật tư, nhân công, khấu hao và tối ưu hóa tỷ suất lợi nhuận
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* General info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Tên Sản Phẩm Lắp Ráp / Đóng Gói *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Bộ Máy Tính Văn Phòng Core i5 / Gạo Đóng Túi 5kg..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Mã SKU Định Mức *</label>
              <input
                type="text"
                required
                placeholder="VD: BOM-PC-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-300 uppercase focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* BOM Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Chi Tiết Linh Kiện & Vật Tư Cấu Thành ({bomItems.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddBomItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Linh Kiện</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[220px]">Tên Linh Kiện / Nguyên Vật Liệu</th>
                    <th className="p-3 w-24">ĐVT</th>
                    <th className="p-3 w-28 text-right">Định Mức Qty</th>
                    <th className="p-3 w-36 text-right">Đơn Giá Mua (VNĐ)</th>
                    <th className="p-3 w-36 text-right">Tổng Chi Phí</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bomItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          required
                          placeholder="VD: CPU Intel Core i5 / Hạt nhựa PVC..."
                          value={item.materialName}
                          onChange={(e) => handleUpdateBomItem(idx, 'materialName', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          list="costing-uoms-datalist"
                          value={item.unit}
                          onChange={(e) => handleUpdateBomItem(idx, 'unit', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                        <datalist id="costing-uoms-datalist">
                          {(masterUOMs || []).map((u) => (
                            <option key={u.id} value={u.name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateBomItem(idx, 'quantity', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={item.unitCost}
                          onChange={(e) => handleUpdateBomItem(idx, 'unitCost', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-white text-xs">
                        {formatVND(item.totalCost)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          disabled={bomItems.length <= 1}
                          onClick={() => handleRemoveBomItem(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Allocation & Pricing Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase text-slate-300">Chi Phí Khác Cấu Thành Giá Vốn</h4>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Chi Phí Nhân Công Trực Tiếp (VNĐ/SP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Chi Phí Máy Móc, Điện & Vận Hành Chung (VNĐ/SP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={machineryAndOverheadCost}
                  onChange={(e) => setMachineryAndOverheadCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Giá Bán Kế Hoạch Hiện Tại (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={currentSellingPrice}
                  onChange={(e) => setCurrentSellingPrice(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tiền vật tư linh kiện (BOM):</span>
                  <span className="font-mono text-slate-200 font-bold">{formatVND(rawMaterialsCost)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tiền nhân công lắp ráp:</span>
                  <span className="font-mono text-slate-200">{formatVND(laborCost)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Khấu hao máy móc & vận hành:</span>
                  <span className="font-mono text-slate-200">{formatVND(machineryAndOverheadCost)}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
                  <span className="text-purple-300">Tổng Giá Vốn Định Mức:</span>
                  <span className="font-mono text-sm text-purple-400">{formatVND(totalStandardCost)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tỷ Suất Lãi Gộp Dự Kiến</div>
                  <div className={`text-xl font-black font-mono ${grossMarginPercent >= 20 ? 'text-emerald-400' : grossMarginPercent > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {grossMarginPercent > 0 ? `+${grossMarginPercent}%` : `${grossMarginPercent}%`}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Lãi: {formatVND(Math.max(0, currentSellingPrice - totalStandardCost))}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-purple-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Định Mức BOM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
