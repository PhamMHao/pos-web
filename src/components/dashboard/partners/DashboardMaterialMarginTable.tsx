import React from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle2, ShoppingCart } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { MaterialMarginItem } from '../dashboard.types';
import { Product } from '../../../types';

export interface DashboardMaterialMarginTableProps {
  materialMargins: MaterialMarginItem[];
  products?: Product[];
  onOpenPO?: (product?: Product) => void;
}

export const DashboardMaterialMarginTable: React.FC<DashboardMaterialMarginTableProps> = ({
  materialMargins,
  products = [],
  onOpenPO,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Biên Lợi Nhuận Gộp & An Toàn Tồn Kho Theo Vật Tư
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh giá vốn, giá bán, biên lãi suất gộp (%) và cảnh báo định mức tồn kho từng mặt hàng
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold bg-slate-50">
              <th className="py-3 px-4">Mặt hàng / SKU</th>
              <th className="py-3 px-4">Ngành hàng</th>
              <th className="py-3 px-4 text-right">Giá vốn</th>
              <th className="py-3 px-4 text-right">Giá bán</th>
              <th className="py-3 px-4 text-right">Lãi gộp / ĐV</th>
              <th className="py-3 px-4 text-center">Tỷ suất lãi</th>
              <th className="py-3 px-4 text-center">Tồn kho / Định mức</th>
              <th className="py-3 px-4 text-center">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {materialMargins.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Chưa có dữ liệu biên lợi nhuận vật tư
                </td>
              </tr>
            ) : (
              materialMargins.slice(0, 10).map((item) => {
                const isLow = !item.isSafe;
                const matchedProduct = products.find((p) => p.id === item.id || p.sku === item.sku);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{item.name}</div>
                      <div className="text-xs text-slate-500 font-normal font-mono">
                        {item.sku} {item.unit ? `• ĐVT: ${item.unit}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 text-xs">
                      {formatVND(item.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                      {formatVND(item.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      +{formatVND(item.grossMargin)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.marginRate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          {item.stock} / {item.minStock}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.stock} / {item.minStock}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLow && onOpenPO && matchedProduct ? (
                        <button
                          onClick={() => onOpenPO(matchedProduct)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Tạo đơn đặt hàng PO với nhà cung cấp"
                        >
                          <ShoppingCart className="w-3 h-3" /> Nhập PO
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
