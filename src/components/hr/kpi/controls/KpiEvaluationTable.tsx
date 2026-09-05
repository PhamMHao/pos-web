import React from 'react';
import { Award, Sliders, FileText, CheckCircle2, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { KpiEvaluation, KpiRank } from '../../../../types';
import { formatVND } from '../../../../utils/vietqr';

export interface KpiEvaluationTableProps {
  evaluations: KpiEvaluation[];
  onOpenScoringModal: (evaluation: KpiEvaluation) => void;
  onOpenReportModal: (evalId: string) => void;
  onOpenPipModal?: (evaluation: KpiEvaluation) => void;
}

export const KpiEvaluationTable: React.FC<KpiEvaluationTableProps> = ({
  evaluations,
  onOpenScoringModal,
  onOpenReportModal,
  onOpenPipModal,
}) => {
  const getRankBadge = (rank: KpiRank) => {
    switch (rank) {
      case 'A+':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            🥇 A+ (Xuất sắc)
          </span>
        );
      case 'A':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            🥈 A (Tốt)
          </span>
        );
      case 'B':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            🥉 B (Khá)
          </span>
        );
      case 'C':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            ⚠️ C (Cần cải thiện)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            ⛔ D (Không đạt)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
              <th className="py-3 px-3 w-10 text-center">STT</th>
              <th className="py-3 px-4">Nhân sự</th>
              <th className="py-3 px-3">Phòng ban</th>
              <th className="py-3 px-3 text-center">Điểm KPI</th>
              <th className="py-3 px-3 text-center">Xếp loại</th>
              <th className="py-3 px-3 text-right">Lương CB</th>
              <th className="py-3 px-3 text-right">Thưởng KPI</th>
              <th className="py-3 px-3 text-right">Hoa hồng</th>
              <th className="py-3 px-4 text-right">Tổng thực lĩnh</th>
              <th className="py-3 px-3 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {evaluations.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-slate-400">
                  <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Không tìm thấy hồ sơ đánh giá KPI phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              evaluations.map((ev, index) => {
                const isApproved = ev.directorApprovalStatus === 'approved';
                const isNeedPip = ev.rank === 'C' || ev.rank === 'D';

                return (
                  <tr key={ev.id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{ev.employeeName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {ev.employeeCode} • {ev.role}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {ev.department}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-black text-emerald-700 text-sm">
                        {ev.finalScore}đ
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Tự chấm: {ev.selfTotalScore}đ
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getRankBadge(ev.rank)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatVND(ev.baseSalary)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      +{formatVND(ev.performanceBonus)}
                      <div className="text-[10px] text-slate-400 font-normal">
                        ({ev.performanceBonusRate}%)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-700 font-semibold">
                      +{formatVND(ev.commissionAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-xs">
                      {formatVND(ev.totalGrossPayout)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Nút Chấm điểm */}
                        <button
                          onClick={() => onOpenScoringModal(ev)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Chấm điểm và điều chỉnh trọng số KPI"
                        >
                          <Sliders className="w-3 h-3" /> Chấm Điểm
                        </button>

                        {/* Nút Xem Biểu Mẫu */}
                        <button
                          onClick={() => onOpenReportModal(ev.id)}
                          className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Xem & in phiếu đánh giá chuẩn Nghị định 30"
                        >
                          <FileText className="w-3 h-3" /> Biểu Mẫu
                        </button>

                        {/* Nút Lập PIP cho loại C/D */}
                        {isNeedPip && onOpenPipModal && (
                          <button
                            onClick={() => onOpenPipModal(ev)}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Lập Kế hoạch cải thiện hiệu suất (Điều 36 BLLĐ)"
                          >
                            <AlertTriangle className="w-3 h-3" /> Lập PIP
                          </button>
                        )}
                      </div>
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
