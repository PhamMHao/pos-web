import React from 'react';
import { Users, Award, Clock, DollarSign } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { HrKpiSummary } from '../dashboard.types';

export interface DashboardHrKpiCardsProps {
  summary: HrKpiSummary;
}

export const DashboardHrKpiCards: React.FC<DashboardHrKpiCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Tổng doanh số đội ngũ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-600" />
          Tổng Doanh Số Đội Ngũ:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-emerald-600">
          {formatVND(summary.totalHrSales)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Quy mô nhân sự:</span>
          <span className="text-emerald-700 font-bold">{summary.employeeCount} nhân viên</span>
        </div>
      </div>

      {/* KPI 2: % Đạt chỉ tiêu KPI */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-600" />
          Tỷ Lệ Đạt KPI Doanh Số:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-amber-600">
          {summary.avgKpiCompletion}%
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Chỉ tiêu tổng:</span>
          <span className="text-slate-700 font-mono font-medium">
            {formatVND(summary.totalHrKpiTarget)}
          </span>
        </div>
      </div>

      {/* KPI 3: Giờ công & Chuyên cần */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-600" />
          Thời Gian Làm Việc &amp; Chuyên Cần:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-cyan-600">
          8.0h <span className="text-xs font-normal text-slate-500">/ ca chuẩn</span>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Tỷ lệ đi làm đúng giờ:</span>
          <span className="text-cyan-700 font-bold font-mono">98.5%</span>
        </div>
      </div>

      {/* KPI 4: Quỹ lương & Hoa hồng */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-purple-600" />
          Quỹ Lương &amp; Hoa Hồng Dự Kiến:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-purple-600">
          {formatVND(summary.totalSalaryFund)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Lương cứng + Thưởng DS</span>
          <span className="text-purple-700 font-bold">Tháng hiện tại</span>
        </div>
      </div>
    </div>
  );
};
