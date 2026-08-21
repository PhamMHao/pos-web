import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  Scale,
  Ruler,
  Boxes,
  ArrowRight,
  Plus,
  Check,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { Product, UOMOption } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface UomCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product, unit: string, quantity: number) => void;
}

export const UomCalculatorModal: React.FC<UomCalculatorModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
}) => {
  // Find products that have multi-uom conversions
  const multiUomProducts = useMemo(() => {
    return products.filter(
      (p) => (p.uomConversions && p.uomConversions.length > 1) || p.uomTags?.length
    );
  }, [products]);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    multiUomProducts[0]?.id || products[0]?.id || ''
  );

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const uomList: UOMOption[] = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.uomConversions && selectedProduct.uomConversions.length > 0) {
      return selectedProduct.uomConversions;
    }
    return [
      {
        unit: selectedProduct.unit,
        ratioToBase: 1,
        costPrice: selectedProduct.costPrice,
        sellingPrice: selectedProduct.sellingPrice,
        isBase: true,
        description: 'Đơn vị cơ bản',
      },
    ];
  }, [selectedProduct]);

  // Active input unit for real-time conversion
  const [activeUnit, setActiveUnit] = useState<string>(uomList[0]?.unit || 'Thùng');
  const [inputValue, setInputValue] = useState<number>(1);

  // Sync active unit if product changes
  React.useEffect(() => {
    if (uomList.length > 0) {
      setActiveUnit(uomList[0].unit);
      setInputValue(1);
    }
  }, [selectedProductId]);

  if (!isOpen || !selectedProduct) return null;

  // Find the selected unit's ratio
  const currentUomOption = uomList.find((u) => u.unit === activeUnit) || uomList[0];
  const baseQuantity = inputValue * (currentUomOption?.ratioToBase || 1);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Bảng Quy Đổi Đơn Vị Tính & Tính Giá Bán Tương Ứng
              </h3>
              <p className="text-xs text-slate-400">
                Tính toán quy đổi linh hoạt giữa Thùng, Cuộn, Mét, Kg, Gam theo giá nhập & giá bán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 1. Chọn sản phẩm cần tính */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Chọn Mặt Hàng Cần Quy Đổi ĐVT:
            </label>
            <select
              value={selectedProduct.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - {p.uomTags?.join(', ') || p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Product Highlight Box */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                  {selectedProduct.category} • {selectedProduct.sku}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                  {selectedProduct.name}
                </h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="text-[10px] text-slate-400 block">Tồn kho cơ bản:</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>
            </div>

            {/* Formula badge */}
            <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-2 text-[11px] text-indigo-300">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-800/50">
                📦 1 Thùng = 10 Cuộn = 1.000 Mét = 12 Kg = 12.000 Gam
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
                💰 Nhập: {formatVND(selectedProduct.costPrice)} / {selectedProduct.unit}
              </span>
            </div>
          </div>

          {/* 2. Bộ chuyển đổi trực tiếp (Realtime Conversion Input) */}
          <div className="bg-indigo-950/20 border border-indigo-800/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-indigo-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Nhập Số Lượng Muốn Bán / Quy Đổi:</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Số lượng:</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Đơn vị tính nguồn:</label>
                <select
                  value={activeUnit}
                  onChange={(e) => setActiveUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                >
                  {uomList.map((u) => (
                    <option key={u.unit} value={u.unit}>
                      {u.unit} ({formatVND(u.sellingPrice)} / {u.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Bảng tương đương tất cả ĐVT & Nút Thêm vào giỏ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-200">
                Bảng Giá & Số Lượng Quy Đổi Tương Ứng:
              </span>
              <span className="text-[11px] text-slate-400">
                (Quy đổi từ: <strong>{inputValue} {activeUnit}</strong>)
              </span>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
              {uomList.map((u) => {
                // How many units of 'u' is equivalent to the input
                const equivalentQty = Number((baseQuantity / (u.ratioToBase || 1)).toFixed(4));
                const lineSellingTotal = Math.round(equivalentQty * u.sellingPrice);
                const lineCostTotal = Math.round(equivalentQty * u.costPrice);
                const isCurrent = u.unit === activeUnit;

                return (
                  <div
                    key={u.unit}
                    className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                      isCurrent
                        ? 'bg-indigo-950/40 border-l-2 border-indigo-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white">
                          {u.unit}
                        </span>
                        {u.isBase && (
                          <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
                            ĐVT cơ bản
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-indigo-300 font-semibold">
                          = {equivalentQty.toLocaleString('vi-VN')} {u.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {u.description || `Quy đổi: 1 ${u.unit} = ${u.ratioToBase} ${selectedProduct.unit}`}
                      </p>
                      <div className="text-[11px] text-slate-400 pt-0.5 space-x-2">
                        <span>Đơn giá vốn: <strong className="text-slate-300">{formatVND(u.costPrice)}</strong>/{u.unit}</span>
                        <span>•</span>
                        <span>Đơn giá bán: <strong className="text-emerald-400">{formatVND(u.sellingPrice)}</strong>/{u.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Thành tiền bán:</span>
                        <span className="font-mono font-bold text-sm text-emerald-400">
                          {formatVND(lineSellingTotal)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(selectedProduct, u.unit, equivalentQty);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition-all shadow-sm"
                        title={`Thêm ${equivalentQty} ${u.unit} vào giỏ hàng`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Chọn ({equivalentQty} {u.unit})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Hệ thống tự động trừ kho chính xác theo tỷ lệ quy đổi khi đơn hàng hoàn tất.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
