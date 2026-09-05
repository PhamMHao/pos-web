import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { formatVND } from '../../utils/vietqr';
import { CategoryInventoryItem, InventoryMetrics, PIE_COLORS } from './dashboard.types';

export interface DashboardInventoryStructureProps {
  categoryInventory: CategoryInventoryItem[];
  inventoryMetrics: InventoryMetrics;
}

export const DashboardInventoryStructure: React.FC<DashboardInventoryStructureProps> = ({
  categoryInventory,
  inventoryMetrics,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
          <PieIcon className="w-5 h-5 text-purple-600" />
          <span>Tỷ Trọng &amp; Cơ Cấu Hàng Tồn Kho</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Phân bổ vốn lưu động theo danh mục và đánh giá mức độ rủi ro tồn kho.
        </p>
      </div>

      {categoryInventory.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">Chưa có sản phẩm trong kho</div>
      ) : (
        <div className="space-y-4">
          {/* Biểu đồ Donut Recharts */}
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryInventory}
                  dataKey="capital"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {categoryInventory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: '#0f172a',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${formatVND(Number(val))} (${item.payload.percentage}%)`,
                    item.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Text ở tâm Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Tổng Vốn
              </span>
              <span className="text-xs font-black text-purple-600 font-mono">
                {inventoryMetrics.totalStockCapital >= 1000000000
                  ? `${(inventoryMetrics.totalStockCapital / 1000000000).toFixed(2)} tỷ`
                  : `${(inventoryMetrics.totalStockCapital / 1000000).toFixed(0)} tr`}
              </span>
            </div>
          </div>

          {/* Danh sách cơ cấu ngành hàng */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {categoryInventory.slice(0, 5).map((cat, idx) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-50"
              >
                <div className="flex items-center space-x-2 truncate max-w-[160px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono font-bold text-slate-900">{formatVND(cat.capital)}</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Thanh Đo Sức Khỏe Tồn Kho */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-700">Tỷ lệ sức khỏe hàng tồn kho:</span>
              <span className="text-emerald-700">{inventoryMetrics.safePercent}% An Toàn</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${inventoryMetrics.safePercent}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`An toàn: ${inventoryMetrics.safeStockCount} SKU`}
              />
              <div
                style={{ width: `${inventoryMetrics.lowStockPercent}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`Sắp hết: ${inventoryMetrics.lowStockCount} SKU`}
              />
              <div
                style={{ width: `${inventoryMetrics.outOfStockPercent}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Hết hàng: ${inventoryMetrics.outOfStockCount} SKU`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Tồn an toàn ({inventoryMetrics.safeStockCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Sắp cạn ({inventoryMetrics.lowStockCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Cháy hàng ({inventoryMetrics.outOfStockCount})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
