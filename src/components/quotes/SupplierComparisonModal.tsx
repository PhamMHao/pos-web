import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { Product, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';
import { useMasterData } from '../../core/contexts/MasterDataContext';

export interface SupplierOption {
  id: string;
  supplierName: string;
  supplierCode: string;
  costPrice: number;
  qualityRating: number;
  reputationRating: number;
  warrantyPolicy: string;
  warrantyMonths: number;
  deliveryDays: number;
  creditDays: number;
  stockAvailability: 'in_stock' | 'low_stock' | 'preorder';
  isOfficialDistributor: boolean;
}

interface SupplierComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings?: StoreSettings;
  onApplyPricingToNewQuote?: (
    items: Array<{
      productId: string;
      productName: string;
      sku: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      supplierName: string;
      warrantyMonths: number;
    }>,
    strategy: 'aggressive' | 'balanced' | 'premium'
  ) => void;
}

export const SupplierComparisonModal: React.FC<SupplierComparisonModalProps> = ({
  isOpen,
  onClose,
  products = [],
  settings,
  onApplyPricingToNewQuote,
}) => {
  const { suppliers: masterSuppliers } = useMasterData();
  const [pricingStrategy, setPricingStrategy] = useState<'aggressive' | 'balanced' | 'premium'>('balanced');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    products.slice(0, 4).map((p) => p.id)
  );
  const [appliedToast, setAppliedToast] = useState<string>('');

  if (!isOpen) return null;

  const marginRates = {
    aggressive: 0.15,
    balanced: 0.25,
    premium: 0.38,
  };

  const calculateSupplierScore = (sup: SupplierOption, minPrice: number) => {
    const priceScore = minPrice > 0 ? (minPrice / sup.costPrice) * 10 : 8;
    const qualityScore = sup.qualityRating;
    const reputationScore = sup.reputationRating;
    const warrantyScore = sup.warrantyMonths >= 24 ? 10 : sup.warrantyMonths >= 12 ? 8 : 6;
    const deliveryScore = sup.deliveryDays <= 1 ? 10 : 8;
    const compositeScore =
      priceScore * 0.35 +
      qualityScore * 0.25 +
      reputationScore * 0.2 +
      warrantyScore * 0.15 +
      deliveryScore * 0.05;
    return Number(compositeScore.toFixed(1));
  };

  const getProductSuppliers = (prod: Product): SupplierOption[] => {
    const baseCost = prod.costPrice || 500000;
    const list = masterSuppliers || [];

    if (list.length === 0) {
      return [];
    }

    return list.map((sup) => {
      // Find matching price item in supplier's price list if present
      const matchedPriceItem = (sup.priceList || []).find(
        (item) =>
          (item.sku && prod.sku && item.sku.toLowerCase() === prod.sku.toLowerCase()) ||
          (item.productName && prod.name && item.productName.toLowerCase().includes(prod.name.toLowerCase()))
      );

      const costPrice = matchedPriceItem
        ? Number(matchedPriceItem.costPrice)
        : Math.round(baseCost * (1 - ((sup.ratingPrice || 9) - 8.5) * 0.04));

      const warrantyMonths = matchedPriceItem?.warrantyMonths || (sup.ratingWarranty >= 9 ? 24 : 12);

      return {
        id: sup.id,
        supplierName: sup.name,
        supplierCode: sup.code,
        costPrice: Math.max(1000, costPrice),
        qualityRating: Number(sup.ratingQuality) || 9.0,
        reputationRating: Number(sup.ratingPrice) || 9.0,
        warrantyPolicy: sup.notes || `Bảo hành chính hãng ${warrantyMonths} tháng, hỗ trợ đổi mới`,
        warrantyMonths,
        deliveryDays: (sup.ratingOnTime || 9) >= 9.5 ? 1 : 2,
        creditDays: sup.creditDays || 30,
        stockAvailability: 'in_stock',
        isOfficialDistributor: sup.tier?.includes('Tier 1') || sup.tier?.includes('Chính Hãng') || false,
      };
    });
  };

  const handleApplyToQuote = () => {
    const selectedProds = products.filter((p) => selectedProductIds.includes(p.id));
    if (selectedProds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để xuất báo giá!');
      return;
    }

    const quoteItems = selectedProds.map((prod) => {
      const sups = getProductSuppliers(prod);
      const minPrice = sups.length > 0 ? Math.min(...sups.map((s) => s.costPrice)) : prod.costPrice || 0;
      const scored = sups.map((s) => ({ ...s, score: calculateSupplierScore(s, minPrice) }));
      const bestSup = scored.sort((a, b) => b.score - a.score)[0];
      const margin = marginRates[pricingStrategy];
      const costPrice = bestSup ? bestSup.costPrice : (prod.costPrice || 0);
      const sellingPrice = Math.round((costPrice * (1 + margin)) / 1000) * 1000;

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unit: prod.unit || 'Cái',
        quantity: 1,
        unitPrice: sellingPrice,
        costPrice,
        supplierName: bestSup ? bestSup.supplierName : 'Nhà phân phối chính thức',
        warrantyMonths: bestSup ? bestSup.warrantyMonths : 24,
      };
    });

    if (onApplyPricingToNewQuote) {
      onApplyPricingToNewQuote(quoteItems, pricingStrategy);
    }
    sounds.playSuccessChime();
    setAppliedToast('Đã chuyển thành công danh sách sản phẩm và mức giá tối ưu vào Trình Tạo Báo Giá!');
    setTimeout(() => {
      setAppliedToast('');
      onClose();
    }, 1200);
  };

  const toggleProductSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllProducts = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-6xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>So Sánh Giá Nhà Cung Ứng & Thuật Toán Tối Ưu Báo Giá</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  SQL Server Live Data
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Đánh giá đa tiêu chí từ dữ liệu NCC thực tế: Đơn giá (35%), Chất lượng (25%), Uy tín (20%), Hậu mãi (15%), Giao hàng (5%)
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

        {/* Applied Toast */}
        {appliedToast && (
          <div className="p-3 bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center space-x-2 px-6 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{appliedToast}</span>
          </div>
        )}

        {/* Strategy Bar */}
        <div className="p-4 px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Chiến Lược Định Giá Dự Án:</span>
            </span>
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setPricingStrategy('aggressive')}
                className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ' + (pricingStrategy === 'aggressive' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
              >
                🔥 Giá Cạnh Tranh (Lãi 15%)
              </button>
              <button
                type="button"
                onClick={() => setPricingStrategy('balanced')}
                className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ' + (pricingStrategy === 'balanced' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
              >
                ⭐ Cân Bằng Chuẩn (Lãi 25%)
              </button>
              <button
                type="button"
                onClick={() => setPricingStrategy('premium')}
                className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ' + (pricingStrategy === 'premium' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
              >
                💎 Doanh Nghiệp VIP (Lãi 38%)
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={selectAllProducts}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              {selectedProductIds.length === products.length ? 'Bỏ Chọn Tất Cả' : 'Chọn Tất Cả Sản Phẩm'}
            </button>
            <button
              type="button"
              onClick={handleApplyToQuote}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
            >
              <span>⭐ Tối Ưu & Xuất Báo Giá ({selectedProductIds.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Table Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900/60">
          {products.slice(0, 10).map((prod) => {
            const suppliers = getProductSuppliers(prod);
            const minCost = suppliers.length > 0 ? Math.min(...suppliers.map((s) => s.costPrice)) : prod.costPrice || 0;
            const isSelected = selectedProductIds.includes(prod.id);
            const scoredSuppliers = suppliers.map((s) => ({ ...s, score: calculateSupplierScore(s, minCost) }));
            const bestSupplier = scoredSuppliers.length > 0 ? [...scoredSuppliers].sort((a, b) => b.score - a.score)[0] : null;
            const margin = marginRates[pricingStrategy];
            const costPrice = bestSupplier ? bestSupplier.costPrice : (prod.costPrice || 0);
            const suggestedSellingPrice = Math.round((costPrice * (1 + margin)) / 1000) * 1000;

            return (
              <div
                key={prod.id}
                className={'p-5 rounded-2xl border transition-all ' + (isSelected ? 'bg-slate-950/90 border-blue-500/50 shadow-xl' : 'bg-slate-950/40 border-slate-800 opacity-75')}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProductSelect(prod.id)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-extrabold text-white">{prod.name}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                          {prod.sku}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ĐVT: <strong className="text-slate-300">{prod.unit || 'Cái'}</strong> • Danh mục: <strong className="text-slate-300">{prod.category}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-blue-950/60 p-2 px-3 rounded-xl border border-blue-500/40">
                    <div className="text-right">
                      <p className="text-[10px] text-blue-300 uppercase font-bold">Giá Đề Xuất Dự Án ({pricingStrategy})</p>
                      <p className="text-sm font-mono font-black text-amber-400">{formatVND(suggestedSellingPrice)}</p>
                    </div>
                    <div className="border-l border-blue-800 pl-3 text-right">
                      <p className="text-[10px] text-slate-400">Lãi gộp ước tính</p>
                      <p className="text-xs font-mono font-bold text-emerald-400">+{formatVND(suggestedSellingPrice - costPrice)} ({Math.round(margin * 100)}%)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                  {scoredSuppliers.length === 0 ? (
                    <div className="col-span-4 p-4 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                      Chưa có dữ liệu nhà cung cấp nào trong cơ sở dữ liệu SQL Server.
                    </div>
                  ) : (
                    scoredSuppliers.map((sup) => {
                      const isTop = bestSupplier && sup.id === bestSupplier.id;
                      return (
                        <div
                          key={sup.id}
                          className={'p-3.5 rounded-xl border flex flex-col justify-between transition-all relative ' + (isTop ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/40' : 'bg-slate-900/80 border-slate-800')}
                        >
                          {isTop && (
                            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                              ★ Khuyến Nghị Số 1
                            </div>
                          )}
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="text-xs font-bold text-white leading-tight">{sup.supplierName}</h5>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-amber-400 shrink-0">
                                {sup.score}/10đ
                              </span>
                            </div>
                            <div className="mt-2 space-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Giá vốn NCC:</span>
                                <strong className="text-white font-mono">{formatVND(sup.costPrice)}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Chất lượng / Uy tín:</span>
                                <span className="text-emerald-400 font-bold">{sup.qualityRating} / {sup.reputationRating} ⭐</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Bảo hành / SLA:</span>
                                <span className="text-slate-200 font-semibold">{sup.warrantyMonths} Tháng</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Giao hàng / Công nợ:</span>
                                <span className="text-slate-300">{sup.deliveryDays} ngày ({sup.creditDays}d nợ)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
