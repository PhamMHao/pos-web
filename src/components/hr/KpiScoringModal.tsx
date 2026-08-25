import React, { useState, useMemo } from 'react';
import {
  X,
  Save,
  CheckCircle2,
  Award,
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  FileCheck,
  User,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { KpiCriterion, KpiEvaluation, KpiRank } from '../../types';
import { calculateKpiScoresAndBonuses } from '../../utils/kpiDefaults';
import { formatVND } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';

export interface KpiScoringModalProps {
  evaluation: KpiEvaluation;
  onSave: (updatedEval: KpiEvaluation) => void;
  onClose: () => void;
  onOpenReport?: (evalId: string) => void;
}

export const KpiScoringModal: React.FC<KpiScoringModalProps> = ({
  evaluation,
  onSave,
  onClose,
  onOpenReport,
}) => {
  const [criteria, setCriteria] = useState<KpiCriterion[]>(evaluation.criteria || []);
  const [strengths, setStrengths] = useState(evaluation.employeeStrengths || '');
  const [improvements, setImprovements] = useState(evaluation.employeeImprovements || '');
  const [developmentPlan, setDevelopmentPlan] = useState(evaluation.developmentPlan || '');
  const [isDirectorApproved, setIsDirectorApproved] = useState(
    evaluation.directorApprovalStatus === 'approved'
  );

  // Live calculation based on criteria changes
  const computed = useMemo(() => {
    return calculateKpiScoresAndBonuses(
      criteria,
      evaluation.baseSalary,
      evaluation.salesRevenue,
      evaluation.commissionRate
    );
  }, [criteria, evaluation.baseSalary, evaluation.salesRevenue, evaluation.commissionRate]);

  const handleScoreChange = (
    index: number,
    field: 'selfScore' | 'managerScore',
    value: number
  ) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    setCriteria((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: clamped };
      return next;
    });
  };

  const handleSave = () => {
    const updated: KpiEvaluation = {
      ...evaluation,
      criteria,
      selfTotalScore: computed.selfTotalScore,
      managerTotalScore: computed.managerTotalScore,
      finalScore: computed.finalScore,
      rank: computed.rank,
      performanceBonusRate: computed.performanceBonusRate,
      performanceBonus: computed.performanceBonus,
      commissionAmount: computed.commissionAmount,
      attendanceBonus: computed.attendanceBonus,
      initiativeBonus: computed.initiativeBonus,
      totalGrossPayout: computed.totalGrossPayout,
      employeeStrengths: strengths,
      employeeImprovements: improvements,
      developmentPlan,
      directorApprovalStatus: isDirectorApproved ? 'approved' : 'pending',
      approvedBy: isDirectorApproved ? 'Tổng Giám Đốc' : undefined,
      approvedAt: isDirectorApproved ? new Date().toISOString().slice(0, 10) : undefined,
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Chấm Điểm &amp; Xét Thưởng KPI (Điều 104 BLLĐ 2019)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {evaluation.period}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Nhân sự: <span className="text-white font-bold">{evaluation.employeeName}</span> ({evaluation.employeeCode}) - {evaluation.role}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar text-slate-200">
          {/* Live Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400">Điểm Tự Chấm</span>
              <div className="text-xl font-black font-mono text-slate-300">{computed.selfTotalScore}đ</div>
              <p className="text-[10px] text-slate-500">Người LĐ chấm</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-blue-500/30 text-center space-y-1">
              <span className="text-[11px] text-blue-400 font-semibold">Điểm Quản Lý Duyệt</span>
              <div className="text-2xl font-black font-mono text-cyan-400">{computed.finalScore}đ</div>
              <p className="text-[10px] text-cyan-300">Điểm chốt KPI</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-1">
              <span className="text-[11px] text-amber-400 font-semibold">Xếp Loại Danh Hiệu</span>
              <div className="text-2xl font-black text-amber-300">Loại {computed.rank}</div>
              <p className="text-[10px] text-amber-400/80">
                {computed.rank === 'A+' ? 'Xuất sắc (+25%)' : computed.rank === 'A' ? 'Tốt (+15%)' : computed.rank === 'B' ? 'Khá (+8%)' : 'Cần cải thiện'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-1">
              <span className="text-[11px] text-emerald-400 font-semibold">Thưởng KPI (BLLĐ)</span>
              <div className="text-lg font-black font-mono text-emerald-400">
                +{formatVND(computed.performanceBonus)}
              </div>
              <p className="text-[10px] text-emerald-300/80">{computed.performanceBonusRate}% Lương cơ bản</p>
            </div>
          </div>

          {/* Detailed Criteria Sliders & Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Chi Tiết Tiêu Chí &amp; Chấm Điểm 3 Cấp (Weight Scale 100%):</span>
              </h3>
              <span className="text-xs text-slate-400">Kéo thanh trượt hoặc nhập trực tiếp (0 - 100)</span>
            </div>

            <div className="space-y-3">
              {criteria.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100">{c.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Trọng số: {c.weight}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <p className="text-slate-400">
                        Chỉ tiêu: <span className="text-white font-medium">{c.targetValue}</span>
                      </p>
                      <p className="text-emerald-400 font-semibold">
                        Thực tế: <span>{c.actualValue}</span>
                      </p>
                    </div>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                    {/* Self Score */}
                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">1. Người LĐ Tự Chấm:</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={c.selfScore}
                            onChange={(e) => handleScoreChange(idx, 'selfScore', Number(e.target.value))}
                            className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-center font-mono font-bold text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-slate-500 text-xs">/100</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={c.selfScore}
                        onChange={(e) => handleScoreChange(idx, 'selfScore', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
                      />
                    </div>

                    {/* Manager Score */}
                    <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-cyan-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-300 font-semibold">2. Quản Lý Thẩm Định:</span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={c.managerScore}
                            onChange={(e) => handleScoreChange(idx, 'managerScore', Number(e.target.value))}
                            className="w-14 bg-slate-950 border border-cyan-500/50 rounded-lg px-2 py-0.5 text-center font-mono font-bold text-cyan-300 text-xs focus:outline-none focus:border-cyan-400"
                          />
                          <span className="text-cyan-400 text-xs">/100</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={c.managerScore}
                        onChange={(e) => handleScoreChange(idx, 'managerScore', Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualitative Evaluation & Development Plan */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <h4 className="font-bold text-sm text-white">Nhận Xét Điểm Mạnh, Điểm Cần Cải Thiện &amp; Kế Hoạch:</h4>
            
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">1. Điểm mạnh nổi bật:</label>
                <input
                  type="text"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Ví dụ: Tận tâm phục vụ khách hàng, không sai sót tiền quỹ..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">2. Điểm cần khắc phục:</label>
                <input
                  type="text"
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Ví dụ: Cần đẩy mạnh bán chéo phụ kiện và tối ưu thời gian đóng gói..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">3. Kế hoạch phát triển kỳ tới:</label>
                <input
                  type="text"
                  value={developmentPlan}
                  onChange={(e) => setDevelopmentPlan(e.target.value)}
                  placeholder="Ví dụ: Tham gia đào tạo kỹ năng tư vấn khách hàng VIP và kiểm định chất lượng..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Payroll Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-sm text-white pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Tổng Hợp Thu Nhập &amp; Thưởng Hiệu Suất:
              </span>
              <span className="text-emerald-400 font-mono text-base">{formatVND(computed.totalGrossPayout)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-slate-300 pt-1">
              <div>
                <span className="text-slate-500 block">Lương HĐLĐ:</span>
                <span className="font-mono font-semibold">{formatVND(evaluation.baseSalary)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Thưởng KPI ({computed.performanceBonusRate}%):</span>
                <span className="font-mono font-bold text-blue-400">+{formatVND(computed.performanceBonus)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Hoa hồng bán hàng:</span>
                <span className="font-mono font-bold text-cyan-400">+{formatVND(computed.commissionAmount)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Chuyên cần:</span>
                <span className="font-mono font-semibold">+{formatVND(computed.attendanceBonus)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sáng kiến / Trách nhiệm:</span>
                <span className="font-mono font-semibold">+{formatVND(computed.initiativeBonus)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1">
              Bằng chữ: <span className="font-semibold text-slate-200">{numberToVietnameseWords(computed.totalGrossPayout)}</span>
            </p>
          </div>

          {/* Director Approval Checkbox */}
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <input
              type="checkbox"
              id="directorApprove"
              checked={isDirectorApproved}
              onChange={(e) => setIsDirectorApproved(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="directorApprove" className="text-xs text-slate-200 cursor-pointer select-none">
              <span className="font-bold text-white">Tổng Giám Đốc Phê Duyệt Ký Số</span> (Xác nhận kết quả đánh giá KPI và đồng ý chi trả thưởng theo Điều 104 BLLĐ 2019)
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {onOpenReport && (
            <button
              onClick={() => {
                onSave({
                  ...evaluation,
                  criteria,
                  selfTotalScore: computed.selfTotalScore,
                  managerTotalScore: computed.managerTotalScore,
                  finalScore: computed.finalScore,
                  rank: computed.rank,
                  performanceBonusRate: computed.performanceBonusRate,
                  performanceBonus: computed.performanceBonus,
                  commissionAmount: computed.commissionAmount,
                  attendanceBonus: computed.attendanceBonus,
                  initiativeBonus: computed.initiativeBonus,
                  totalGrossPayout: computed.totalGrossPayout,
                  employeeStrengths: strengths,
                  employeeImprovements: improvements,
                  developmentPlan,
                  directorApprovalStatus: isDirectorApproved ? 'approved' : 'pending',
                });
                onOpenReport(evaluation.id);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>In Biểu Mẫu / Quyết Định</span>
            </button>
          )}

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu &amp; Phê Duyệt KPI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
