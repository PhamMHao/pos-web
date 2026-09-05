import React from 'react';
import { Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatVND } from '../../utils/vietqr';
import { TopProductItem, BestSellerMetric, PALETTE } from './dashboard.types';

export interface DashboardBestSellersProps {
  topProducts: TopProductItem[];
  top6ProductsForChart: TopProductItem[];
  bestSellerMetric: BestSellerMetric;
  setBestSellerMetric: (m: BestSellerMetric) => void;
}

export const DashboardBestSellers: React.FC<DashboardBestSellersProps> = ({
  topProducts,
  top6ProductsForChart,
  bestSellerMetric,
  setBestSellerMetric,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Top Sản Phẩm Bán Chạy Nhất</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xếp hạng các sản phẩm chủ lực đóng góp cao nhất cho doanh nghiệp.
          </p>
        </div>

        {/* Metric Switcher: Revenue vs Quantity */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setBestSellerMetric('revenue')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bestSellerMetric === 'revenue'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doanh Thu (VNĐ)
          </button>
          <button
            onClick={() => setBestSellerMetric('quantity')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              bestSellerMetric === 'quantity'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Số Lượng (Món)
          </button>
        </div>
      </div>

      {topProducts.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          Chưa có dữ liệu bán hàng sản phẩm
        </div>
      ) : (
        <div className="space-y-4">
          {/* Biểu đồ Recharts BarChart thanh ngang */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={top6ProductsForChart}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) =>
                    bestSellerMetric === 'revenue'
                      ? val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}tr`
                        : val.toLocaleString('vi-VN')
                      : val
                  }
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="displayName"
                  stroke="#475569"
                  fontSize={11}
                  width={120}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: '#0f172a',
                  }}
                  formatter={(val: any) => [
                    bestSellerMetric === 'revenue' ? formatVND(Number(val)) : `${val} món`,
                    bestSellerMetric === 'revenue' ? 'Doanh Thu' : 'Số Lượng',
                  ]}
                />
                <Bar
                  dataKey={bestSellerMetric === 'revenue' ? 'revenue' : 'quantity'}
                  fill={PALETTE.blue}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bảng Xếp Hạng Top Sản Phẩm Kèm Huy Hiệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-2.5 text-center w-12">Hạng</th>
                  <th className="py-2 px-2.5">Sản Phẩm</th>
                  <th className="py-2 px-2.5 text-center">Đã Bán</th>
                  <th className="py-2 px-2.5 text-right">Doanh Thu</th>
                  <th className="py-2 px-2.5 text-right">Tồn Kho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.slice(0, 5).map((p, idx) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.productId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-2.5 text-center">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs shadow-xs">
                            🥇
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black text-xs shadow-xs">
                            🥈
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-900 font-black text-xs border border-amber-200 shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold font-mono">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="font-bold text-slate-900 truncate max-w-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <span>SKU: {p.sku || '---'}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-800">
                        {p.quantity.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-blue-600">
                        {formatVND(p.revenue)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.currentStock} {isLow ? '(Thiếu)' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
