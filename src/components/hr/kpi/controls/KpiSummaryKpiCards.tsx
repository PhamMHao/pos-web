import React from 'react';
import { Award, DollarSign, TrendingUp, Printer, CheckCircle2 } from 'lucide-react';
import { KpiEvaluation } from '../../../../types';
import { formatVND } from '../../../../utils/vietqr';

export interface KpiSummaryKpiCardsProps {
  evaluations: KpiEvaluation[];
  onOpenReportModal: () => void;
}

export const KpiSummaryKpiCards: React.FC<KpiSummaryKpiCardsProps> = ({
  evaluations,
  onOpenReportModal,
}) => {
  const totalBonusFund = evaluations.reduce((sum, e) => sum + e.performanceBonus, 0);
  const totalPayoutFund = evaluations.reduce((sum, e) => sum + e.totalGrossPayout, 0);
  const avgScore = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.finalScore, 0) / evaluations.length).toFixed(1)
    : '0';

  const rankACount = evaluations.filter((e) => e.rank === 'A+' || e.rank === 'A').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Thẻ 1: Điểm KPI TB */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          Điểm KPI Trung Bình Toàn Công Ty:
        </span>
        <div className="text-2xl font-black font-mono text-emerald-600">{avgScore}đ</div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Xuất sắc &amp; Tốt (A+/A)</span>
          <span className="text-emerald-700 font-bold font-mono">
            {rankACount}/{evaluations.length} NV ({evaluations.length > 0 ? Math.round((rankACount / evaluations.length) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* Thẻ 2: Quỹ Thưởng Hiệu Suất Điều 104 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-blue-600" />
          Quỹ Thưởng Hiệu Suất (Điều 104 BLLĐ):
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-blue-600">
          {formatVND(totalBonusFund)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Trích Quỹ Khen Thưởng</span>
          <span className="text-blue-700 font-bold">Quy chế thưởng</span>
        </div>
      </div>

      {/* Thẻ 3: Tổng Thu Nhập Thực Lĩnh */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Tổng Ngân Sách Thực Lĩnh Sau KPI:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-purple-600">
          {formatVND(totalPayoutFund)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Lương CB + Thưởng + Hoa hồng</span>
          <span className="text-purple-700 font-bold">Toàn doanh nghiệp</span>
        </div>
      </div>

      {/* Thẻ 4: Bộ Biểu Mẫu Pháp Quy */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-cyan-600" />
            Bộ 4 Biểu Mẫu Pháp Quy Chuẩn:
          </span>
          <div className="text-sm font-bold text-slate-900 mt-1">Nghị Định 30/2020/NĐ-CP</div>
          <p className="text-[11px] text-slate-500">Mẫu 01, Mẫu 02, Mẫu 03 (QĐ), Mẫu 04</p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="mt-2 w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Mở Biểu Mẫu &amp; Quyết Định</span>
        </button>
      </div>
    </div>
  );
};
