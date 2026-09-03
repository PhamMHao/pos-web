import React, { useState } from 'react';
import {
  Calculator,
  Layers,
  TrendingUp,
  Percent,
  Search,
  Plus,
  Box,
  Cpu,
  Flame,
  CheckCircle2,
  PackagePlus,
  Wrench,
} from 'lucide-react';
import { ProductCosting, Product } from '../../types';
import { NewCostingModal } from './NewCostingModal';
import { AssemblyOrderModal } from './AssemblyOrderModal';
import { formatVND } from '../../utils/currency';

interface CostingViewProps {
  costingList?: ProductCosting[];
  products?: Product[];
  onSaveCosting?: (costing: ProductCosting) => void;
  onAssembleProduct?: (payload: {
    costingId: string;
    quantity: number;
    technicianName: string;
    warehouse: string;
    note?: string;
  }) => Promise<void>;
}

export const CostingView: React.FC<CostingViewProps> = ({
  costingList = [],
  products = [],
  onSaveCosting,
  onAssembleProduct,
}) => {
  const safeCosting = Array.isArray(costingList) ? costingList : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCosting, setSelectedCosting] = useState<ProductCosting | null>(safeCosting[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);

  const filteredCosting = safeCosting.filter(
    (c) =>
      c.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Tính Giá Thành & Định Mức BOM (Bill of Materials)</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ERP Costing
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Phân tích cơ cấu chi phí nguyên phụ liệu, nhân công trực tiếp, máy móc và tối ưu tỷ suất lãi gộp
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thiết Lập BOM Mới</span>
        </button>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Product List */}
        <div className="w-full lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/40 shrink-0">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm định mức BOM..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-1">
            {filteredCosting.map((c) => {
              const isSelected = selectedCosting?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCosting(c)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 border border-purple-500/40 shadow-sm'
                      : 'hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="text-[10px] font-mono text-purple-400 font-bold">{c.sku}</div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 mt-0.5">{c.productName}</h4>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Giá vốn: {formatVND(c.totalStandardCost)}</span>
                    <span className="font-mono font-bold text-emerald-400">+{c.grossMarginPercent}% Lãi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: BOM Breakdown */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-950">
          {selectedCosting ? (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div>
                  <div className="text-xs font-mono text-purple-400">ĐỊNH MỨC GIÁ THÀNH SẢN XUẤT / ĐÓNG GÓI</div>
                  <h3 className="text-xl font-bold text-white">{selectedCosting.productName}</h3>
                  <p className="text-xs text-slate-400">SKU: {selectedCosting.sku} • Cập nhật lần cuối: {selectedCosting.lastUpdated}</p>
                </div>

                <button
                  onClick={() => setShowAssemblyModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition-all shrink-0"
                  title="Tạo lệnh xuất kho linh kiện và lắp ráp thành phẩm PC"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>🛠️ Lệnh Lắp Ráp / Xuất Xưởng</span>
                </button>
              </div>

              {/* 3 cost pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold mb-1">
                    <Box className="w-4 h-4" />
                    <span>Chi Phí Nguyên Vật Liệu (BOM)</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">{formatVND(selectedCosting.rawMaterialsCost)}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Chiếm {Math.round((selectedCosting.rawMaterialsCost / selectedCosting.totalStandardCost) * 100)}% giá vốn</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                    <Cpu className="w-4 h-4" />
                    <span>Chi Phí Nhân Công Trực Tiếp</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">{formatVND(selectedCosting.laborCost)}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Chiếm {Math.round((selectedCosting.laborCost / selectedCosting.totalStandardCost) * 100)}% giá vốn</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
                    <Flame className="w-4 h-4" />
                    <span>Chi Phí Khấu Hao & Vận Hành</span>
                  </div>
                  <div className="text-lg font-black text-white font-mono">{formatVND(selectedCosting.machineryAndOverheadCost)}</div>
                  <p className="text-[11px] text-slate-400 mt-1">Chiếm {Math.round((selectedCosting.machineryAndOverheadCost / selectedCosting.totalStandardCost) * 100)}% giá vốn</p>
                </div>
              </div>

              {/* BOM Details Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-800/60 border-b border-slate-700/80 font-bold text-xs text-white">
                  Danh Sách Thành Phần Nguyên Vật Liệu (BOM Structure)
                </div>
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/40 text-slate-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Tên Nguyên Liệu / Quy Cách</th>
                      <th className="px-4 py-3 text-center">Định Mức</th>
                      <th className="px-4 py-3 text-center">ĐVT</th>
                      <th className="px-4 py-3 text-right">Đơn Giá Nhập</th>
                      <th className="px-4 py-3 text-right">Tổng Chi Phí (VND)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedCosting.bomItems.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-semibold text-white">{b.materialName}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-purple-300">{b.quantity}</td>
                        <td className="px-4 py-3 text-center text-slate-400">{b.unit}</td>
                        <td className="px-4 py-3 text-right font-mono">{formatVND(b.unitCost)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatVND(b.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Gross Margin Summary */}
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-5 rounded-2xl border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-bold">GIÁ BÁN HIỆN TẠI (POS & B2B)</div>
                  <div className="text-2xl font-black text-white font-mono">{formatVND(selectedCosting.currentSellingPrice)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold">TỔNG GIÁ THÀNH ĐỊNH MỨC</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">{formatVND(selectedCosting.totalStandardCost)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold">TỶ SUẤT LÃI GỘP</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">+{selectedCosting.grossMarginPercent}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Chọn sản phẩm để xem định mức giá thành BOM
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewCostingModal
          onClose={() => setShowNewModal(false)}
          onSave={(newCosting) => {
            if (onSaveCosting) onSaveCosting(newCosting);
            setSelectedCosting(newCosting);
          }}
        />
      )}

      {showAssemblyModal && selectedCosting && (
        <AssemblyOrderModal
          costing={selectedCosting}
          products={products}
          onClose={() => setShowAssemblyModal(false)}
          onConfirmAssemble={async (payload) => {
            if (onAssembleProduct) {
              await onAssembleProduct(payload);
            }
          }}
        />
      )}
    </div>
  );
};
