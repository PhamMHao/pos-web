import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  Building2,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PriceQuote, Customer, Product, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface EquivalentQuoteRecommenderProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: PriceQuote[];
  customers: Customer[];
  products: Product[];
  settings?: StoreSettings;
  onSelectTemplateForNewQuote?: (templateData: {
    customerName: string;
    customerPhone: string;
    customerCompany: string;
    discountPercent: number;
    notes: string;
    items: Array<{
      productId?: string;
      productName: string;
      sku: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  }) => void;
}

export const EquivalentQuoteRecommenderModal: React.FC<EquivalentQuoteRecommenderProps> = ({
  isOpen,
  onClose,
  quotes = [],
  customers = [],
  products = [],
  settings,
  onSelectTemplateForNewQuote,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  if (!isOpen) return null;

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const getTierDiscount = (tier: string) => {
    switch (tier) {
      case 'Kim Cương':
        return 10;
      case 'Vàng':
        return 7;
      case 'Bạc':
        return 4;
      default:
        return 2;
    }
  };

  const recommendedDiscount = getTierDiscount(activeCustomer?.tier || 'Đồng');

  const dynamicBundles = useMemo(() => {
    // 1. From real existing quotes in DB
    const quoteBundles = (quotes || [])
      .filter((q) => q.items && q.items.length > 0)
      .slice(0, 5)
      .map((q) => ({
        id: `quote-${q.id}`,
        title: `Gói Báo Giá Dự Án - ${q.code}`,
        industry: q.customerName || 'Dự Án Doanh Nghiệp',
        suitableFor: `Khách hàng ${q.customerName || 'Doanh Nghiệp'} (Dựa trên báo giá đã tạo ${q.code})`,
        discountSuggest: recommendedDiscount,
        items: q.items.map((it) => ({
          productName: it.productName,
          sku: it.sku,
          unit: it.unit || 'Cái',
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0,
          total: (it.unitPrice || 0) * (it.quantity || 1),
        })),
      }));

    if (quoteBundles.length > 0) {
      return quoteBundles;
    }

    // 2. From real products grouped by category in database
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return categories.slice(0, 3).map((cat) => {
      const catProducts = products.filter((p) => p.category === cat).slice(0, 4);
      return {
        id: `bundle-cat-${cat}`,
        title: `Gói Giải Pháp ${cat} - Trọn Gói Tiêu Chuẩn`,
        industry: cat,
        suitableFor: `Dành cho khách hàng có nhu cầu trang bị danh mục ${cat}`,
        discountSuggest: recommendedDiscount,
        items: catProducts.map((p) => ({
          productName: p.name,
          sku: p.sku,
          unit: p.unit || 'Cái',
          quantity: 1,
          unitPrice: p.sellingPrice || 0,
          total: p.sellingPrice || 0,
        })),
      };
    });
  }, [quotes, products, recommendedDiscount]);

  const handleApplyTemplate = (bundle: typeof dynamicBundles[0]) => {
    if (onSelectTemplateForNewQuote) {
      onSelectTemplateForNewQuote({
        customerName: activeCustomer?.name || 'Khách Hàng Dự Án',
        customerPhone: activeCustomer?.phone || '',
        customerCompany: activeCustomer?.address || '',
        discountPercent: bundle.discountSuggest,
        notes: 'Báo giá theo gói giải pháp: ' + bundle.title + '. Đã áp dụng chính sách ưu đãi thành viên hạng ' + (activeCustomer?.tier || 'Đồng') + '.',
        items: bundle.items,
      });
    }
    sounds.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Kiến Nghị Báo Giá Tương Đương Cho Đơn Hàng Tiếp Theo</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  SQL Server Dynamic
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gợi ý các gói báo giá dựa trên lịch sử báo giá thực tế và danh mục sản phẩm từ CSDL
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

        {/* Customer Selector Bar */}
        <div className="p-4 px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Khách Hàng Tiếp Nhận:</p>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || 'Chưa có SĐT'}) - Hạng {c.tier || 'Đồng'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-purple-300 font-semibold">Ưu đãi hạng {activeCustomer?.tier || 'Đồng'}:</span>
            <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-xs">
              Giảm {recommendedDiscount}%
            </span>
          </div>
        </div>

        {/* Bundles Grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/60">
          {dynamicBundles.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
              Chưa có dữ liệu báo giá hoặc sản phẩm trong cơ sở dữ liệu để tạo kiến nghị.
            </div>
          ) : (
            dynamicBundles.map((bundle) => {
              const bundleTotal = bundle.items.reduce((acc, it) => acc + it.total, 0);
              const discountedTotal = Math.round(bundleTotal * (1 - bundle.discountSuggest / 100));

              return (
                <div
                  key={bundle.id}
                  className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-purple-500/50 transition-all shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-white">{bundle.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-purple-300 border border-slate-700">
                        {bundle.industry}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      🎯 Phù hợp: <strong className="text-slate-300">{bundle.suitableFor}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {bundle.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-800 flex items-center space-x-1"
                        >
                          <span>{it.productName}</span>
                          <strong className="text-purple-400 font-mono">x{it.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 line-through font-mono">
                        {formatVND(bundleTotal)}
                      </div>
                      <div className="text-base font-black text-amber-400 font-mono">
                        {formatVND(discountedTotal)}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold">
                        Tiết kiệm: {formatVND(bundleTotal - discountedTotal)} (-{bundle.discountSuggest}%)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(bundle)}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      <span>Chọn Gói Này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
