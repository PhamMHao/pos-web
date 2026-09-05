import React from 'react';
import { Award, FileText, ArrowRight } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { HrPerformanceItem } from '../dashboard.types';

export interface DashboardHrScorecardTableProps {
  hrPerformanceData: HrPerformanceItem[];
  onOpenKpiReportModal: () => void;
  onNavigate?: (tab: string) => void;
}

export const DashboardHrScorecardTable: React.FC<DashboardHrScorecardTableProps> = ({
  hrPerformanceData,
  onOpenKpiReportModal,
  onNavigate,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Bảng Scorecard Đánh Giá Hiệu Suất Nhân Sự Toàn Diện</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo hợp nhất: Doanh số thực tế, hoa hồng bán hàng, giờ làm việc và trạng thái hợp đồng lao động.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenKpiReportModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <FileText className="w-4 h-4" />
            <span>Đánh Giá KPI Định Kỳ</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('hr')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <span>Quản Lý HR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {hrPerformanceData.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs">
          Chưa có dữ liệu nhân sự trong hệ thống
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Mã NV</th>
                <th className="py-2.5 px-3">Nhân Viên</th>
                <th className="py-2.5 px-3">Chức Danh &amp; Ca Trực</th>
                <th className="py-2.5 px-3 text-right">Doanh Số</th>
                <th className="py-2.5 px-3 text-right">Chỉ Tiêu KPI</th>
                <th className="py-2.5 px-3 text-center">% Đạt</th>
                <th className="py-2.5 px-3 text-right">Hoa Hồng</th>
                <th className="py-2.5 px-3 text-right">Tổng Thu Nhập</th>
                <th className="py-2.5 px-3 text-center">Hợp Đồng LĐ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hrPerformanceData.map((emp) => {
                const isTargetReached = emp.kpiCompletion >= 100;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                      {emp.code || '---'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {emp.workHours}h làm việc • {emp.attendanceRate}% đúng giờ
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-700">{emp.role}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {emp.shiftSchedule}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">
                      {formatVND(emp.currentSales)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {formatVND(emp.salesKpiTarget)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-black border ${
                          isTargetReached
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {emp.kpiCompletion}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                      +{formatVND(emp.commission)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                      {formatVND(emp.totalIncome)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.contractStatus === 'active'
                            ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {emp.contractCode}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
