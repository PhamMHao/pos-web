import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Scale,
  Plus,
  Minus,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  PackageCheck,
  Coins,
  ShoppingCart,
  Info,
} from 'lucide-react';
import { Product, UOMOption } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { getUomEquivalentsSummary } from '../../utils/uomConverter';

interface SelectProductUomModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (product: Product, unit: string, quantity: number, unitPrice: number, costPrice: number, ratioToBase: number) => void;
}

export const SelectProductUomModal: React.FC<SelectProductUomModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  const uomList: UOMOption[] = useMemo(() => {
    if (product.uomConversions && product.uomConversions.length > 0) {
      return product.uomConversions;
    }
    return [
      {
        unit: product.unit,
        ratioToBase: 1,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        isBase: true,
        description: 'Đơn vị cơ bản',
      },
    ];
  }, [product]);

  // Selected UOM state
  const [selectedUnit, setSelectedUnit] = useState<string>(uomList[0]?.unit || product.unit);
  const [quantity, setQuantity] = useState<number>(1);

  // Reset when product changes or opens
  useEffect(() => {
    if (uomList.length > 0) {
      setSelectedUnit(uomList[0].unit);
      setQuantity(1);
    }
  }, [product]);

  const activeOption = useMemo(() => {
    return uomList.find((u) => u.unit === selectedUnit) || uomList[0];
  }, [uomList, selectedUnit]);

  const activePrice = activeOption.sellingPrice;
  const activeCost = activeOption.costPrice;
  const activeRatio = activeOption.ratioToBase || 1;
  const lineTotal = Math.round(activePrice * quantity);
  const lineProfit = Math.round((activePrice - activeCost) * quantity);

  // Quick preset quantities depending on unit type
  const quickQuantities = useMemo(() => {
    const unitLower = selectedUnit.toLowerCase();
    if (unitLower.includes('mét') || unitLower.includes('met') || unitLower.includes('m')) {
      return [1, 5, 10, 20, 50, 100];
    }
    if (unitLower.includes('gam') || unitLower.includes('g')) {
      return [100, 200, 500, 1000, 2000];
    }
    if (unitLower.includes('kg')) {
      return [0.5, 1, 2, 5, 10];
    }
    return [1, 2, 5, 10, 20, 50];
  }, [selectedUnit]);

  const handleConfirm = () => {
    if (quantity <= 0) return;
    onConfirm(
      product,
      activeOption.unit,
      quantity,
      activeOption.sellingPrice,
      activeOption.costPrice,
      activeRatio
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Chọn Đơn Vị Tính & Giá Bán</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {uomList.length} ĐVT hỗ trợ
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Giá bán và tồn kho tự động đồng bộ theo từng đơn vị được chọn
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
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Product Banner */}
          <div className="flex items-center gap-3.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                  {product.sku}
                </span>
                <span className="text-[11px] text-slate-400">{product.category}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                {product.name}
              </h4>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                <span>Tồn kho cơ bản: <strong className="text-emerald-400">{product.stock} {product.unit}</strong></span>
              </div>
            </div>
          </div>

          {/* Unit Selection Grid (Interactive Cards showing Unit & Corresponding Price) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              Bước 1: Chọn Đơn Vị Tính (ĐVT) xuất hiện giá tương ứng:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {uomList.map((uom) => {
                const isSelected = uom.unit === selectedUnit;
                return (
                  <button
                    key={uom.unit}
                    type="button"
                    onClick={() => setSelectedUnit(uom.unit)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-extrabold text-sm ${
                            isSelected ? 'text-emerald-300' : 'text-white'
                          }`}
                        >
                          {uom.unit}
                        </span>
                        {uom.isBase && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-slate-900 text-slate-300 rounded border border-slate-700 font-medium">
                            Chuẩn
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Price corresponding to this unit */}
                    <div className="mt-1 flex items-baseline justify-between w-full">
                      <span className="text-xs text-slate-400 font-medium">Giá bán:</span>
                      <span
                        className={`font-mono font-extrabold text-sm sm:text-base ${
                          isSelected ? 'text-emerald-400' : 'text-emerald-400/90'
                        }`}
                      >
                        {formatVND(uom.sellingPrice)}
                      </span>
                    </div>

                    {/* Ratio description */}
                    <div className="mt-1 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 w-full">
                      <span>{uom.description || `1 ${uom.unit} = ${uom.ratioToBase} ${product.unit}`}</span>
                      <span className="text-slate-500 font-mono">Vốn: {formatVND(uom.costPrice)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper & Quick Presets */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Bước 2: Nhập số lượng muốn bán ({selectedUnit}):
              </label>
              <span className="text-[11px] text-indigo-300 font-medium">
                Đơn giá: <strong className="text-emerald-400">{formatVND(activePrice)}</strong> / {selectedUnit}
              </span>
            </div>

            {/* Stepper + Input */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(0.1, Number((q - 1).toFixed(2))))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white transition-colors"
                title="Giảm 1"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.001, Number(e.target.value)))}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2 text-center text-base sm:text-lg font-bold font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                  {selectedUnit}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setQuantity((q) => Number((q + 1).toFixed(2)))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-white transition-colors"
                title="Tăng 1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Gợi ý nhanh:</span>
              {quickQuantities.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-colors ${
                    quantity === preset
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  +{preset} {selectedUnit}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-tier Unit Conversion Equivalents Display */}
          {uomList.length > 1 && (
            <div className="bg-slate-900/80 border border-slate-750 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-300">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Quy đổi tương đương đa đơn vị:</span>
              </div>
              <div className="text-[11px] font-mono text-cyan-300 font-medium">
                {getUomEquivalentsSummary(quantity, selectedUnit, uomList, product.unit)}
              </div>
            </div>
          )}

          {/* Real-time Summary Card */}
          <div className="bg-gradient-to-r from-slate-850 to-slate-800 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[11px] text-slate-400">
                Thành tiền ({quantity} {selectedUnit} x {formatVND(activePrice)}):
              </div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
                {formatVND(lineTotal)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400">Tồn trừ kho gốc:</div>
              <div className="text-xs font-bold text-indigo-300 font-mono">
                {(quantity * activeRatio).toLocaleString('vi-VN')} {product.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-colors text-xs"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Thêm Vào Giỏ ({formatVND(lineTotal)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
