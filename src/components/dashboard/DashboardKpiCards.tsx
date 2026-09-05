import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ShoppingBag,
  Activity,
} from 'lucide-react';
import { formatVND } from '../../utils/vietqr';
import { InventoryMetrics } from './dashboard.types';

export interface DashboardKpiCardsProps {
  totalRevenue: number;
  completedOrdersCount: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: string;
  inventoryMetrics: InventoryMetrics;
  averageOrderValue: number;
  avgItemsPerOrder: string;
  totalItemsSold: number;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  totalRevenue,
  completedOrdersCount,
  totalCost,
  grossProfit,
  profitMargin,
  inventoryMetrics,
  averageOrderValue,
  avgItemsPerOrder,
  totalItemsSold,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
      {/* KPI 1: Doanh thu thuần */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Doanh Thu Thuần
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-100">
            {completedOrdersCount} đơn
          </span>
        </div>
        <div className="text-xl md:text-2xl font-black font-mono text-blue-600 tracking-tight">
          {formatVND(totalRevenue)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Thực thu</span>
          </span>
          <span className="text-slate-400 font-mono text-[10px]">COGS: {formatVND(totalCost)}</span>
        </div>
      </div>

      {/* KPI 2: Lợi nhuận gộp */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Percent className="w-4 h-4 text-emerald-600" />
            Lợi Nhuận Gộp
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-100">
            Biên {profitMargin}%
          </span>
        </div>
        <div className="text-xl md:text-2xl font-black font-mono text-emerald-600 tracking-tight">
          +{formatVND(grossProfit)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-emerald-700 font-medium">Doanh thu trừ vốn</span>
          <span className="text-emerald-600 font-bold text-[10px]">Hiệu suất cao</span>
        </div>
      </div>

      {/* KPI 3: Tổng vốn kho */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Layers className="w-4 h-4 text-purple-600" />
            Tổng Vốn Tồn Kho
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-100">
            {inventoryMetrics.totalSku} SKU
          </span>
        </div>
        <div className="text-xl md:text-2xl font-black font-mono text-purple-600 tracking-tight">
          {formatVND(inventoryMetrics.totalStockCapital)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-purple-700 font-medium">
            {inventoryMetrics.totalStockUnits.toLocaleString('vi-VN')} món lưu kho
          </span>
          <span className="text-slate-400 text-[10px]">Giá vốn thực</span>
        </div>
      </div>

      {/* KPI 4: AOV */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            AOV / Đơn Hàng
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono text-[10px] font-bold border border-amber-100">
            {avgItemsPerOrder} món/đơn
          </span>
        </div>
        <div className="text-xl md:text-2xl font-black font-mono text-amber-600 tracking-tight">
          {formatVND(averageOrderValue)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-amber-700 font-medium">Bình quân mỗi khách</span>
          <span className="text-slate-400 font-mono text-[10px]">Bán: {totalItemsSold} món</span>
        </div>
      </div>

      {/* KPI 5: Sức khỏe kho */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all shadow-xs relative overflow-hidden col-span-1 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Activity className="w-4 h-4 text-rose-600" />
            Sức Khỏe Kho
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
              inventoryMetrics.safePercent >= 80
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {inventoryMetrics.safePercent}% An toàn
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <div className="text-xl md:text-2xl font-black font-mono text-rose-600">
            {inventoryMetrics.lowStockCount + inventoryMetrics.outOfStockCount}
          </div>
          <span className="text-xs text-slate-500 font-medium">SKU cần chú ý</span>
        </div>
        <div className="mt-2 text-[11px] flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-amber-600 font-bold">{inventoryMetrics.lowStockCount} sắp hết</span>
          <span className="text-rose-600 font-bold">{inventoryMetrics.outOfStockCount} cháy hàng</span>
        </div>
      </div>
    </div>
  );
};
