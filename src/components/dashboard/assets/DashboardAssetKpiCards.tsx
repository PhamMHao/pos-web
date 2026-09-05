import React from 'react';
import { Landmark, ShieldCheck, RefreshCw, BarChart2 } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { AssetSummary } from '../dashboard.types';

export interface DashboardAssetKpiCardsProps {
  summary: AssetSummary;
}

export const DashboardAssetKpiCards: React.FC<DashboardAssetKpiCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng nguyên giá */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-blue-600" />
          Tổng Nguyên Giá Tài Sản:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-slate-900">
          {formatVND(summary.totalOriginal)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Tổng số thiết bị</span>
          <span className="text-blue-700 font-bold font-mono">{summary.assetsList.length} tài sản</span>
        </div>
      </div>

      {/* KPI 2: Khấu hao lũy kế */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-amber-500" />
          Khấu Hao Lũy Kế:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-amber-600">
          {formatVND(summary.totalDepreciation)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Tỷ lệ trích hao mòn</span>
          <span className="text-amber-700 font-bold font-mono">{summary.wearRate}</span>
        </div>
      </div>

      {/* KPI 3: Giá trị còn lại */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Giá Trị Sổ Sách Còn Lại:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-emerald-600">
          {formatVND(summary.totalRemaining)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Vốn tài sản hiện hữu</span>
          <span className="text-emerald-700 font-bold">Giá trị thực tế</span>
        </div>
      </div>

      {/* KPI 4: Trạng thái vận hành */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4 text-purple-600" />
          Tình Trạng Vận Hành:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-purple-600">
          {summary.statusCount.good}/{summary.assetsList.length}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-rose-600 font-medium">
            {summary.statusCount.maintenance_required + summary.statusCount.broken} cần bảo trì/hỏng
          </span>
          <span className="text-purple-700 font-bold">Hoạt động tốt</span>
        </div>
      </div>
    </div>
  );
};
