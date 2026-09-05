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
} from 'lucide-react';
import { KpiCriterion, KpiEvaluation, KpiRank } from '../../../../types';
import { calculateKpiScoresAndBonuses } from '../../../../utils/kpiDefaults';
import { formatVND } from '../../../../utils/vietqr';
import { numberToVietnameseWords } from '../../../../utils/numberToWords';

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
  const [isSaving, setIsSaving] = useState(false);

  // Live calculation based on criteria adjustments
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

  const handleSave = async () => {
    setIsSaving(true);
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

    try {
      await fetch(`/api/kpi-evaluations/${evaluation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Error saving KPI evaluation to DB:', e);
    } finally {
      setIsSaving(false);
      onSave(updated);
    }
  };

  const getRankColor = (rank: KpiRank) => {
    switch (rank) {
      case 'A+':
        return 'text-amber-600 bg-amber-50 border-amber-300';
      case 'A':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300';
      case 'B':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      default:
        return 'text-rose-700 bg-rose-50 border-rose-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 text-sm">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Chấm Điểm &amp; Thẩm Định KPI: {evaluation.employeeName}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                  {evaluation.employeeCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {evaluation.role} • {evaluation.department} • Kỳ: {evaluation.period}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenReport && (
              <button
                onClick={() => onOpenReport(evaluation.id)}
                className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Xem Biểu Mẫu</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Calculation Summary Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Điểm Tổng Hợp:
            </span>
            <div className="text-xl font-black font-mono text-slate-900">{computed.finalScore}đ</div>
            <div className="text-[11px] text-slate-500">Tự chấm: {computed.selfTotalScore}đ</div>
          </div>

          <div className={`p-3 rounded-xl border space-y-1 ${getRankColor(computed.rank)}`}>
            <span className="text-xs font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Xếp Loại Hiệu Suất:
            </span>
            <div className="text-2xl font-black">Hạng {computed.rank}</div>
            <div className="text-[11px] font-bold">Thưởng {computed.performanceBonusRate}% LCB</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Tiền Thưởng KPI:
            </span>
            <div className="text-lg font-black font-mono text-emerald-700">+{formatVND(computed.performanceBonus)}</div>
            <div className="text-[11px] text-slate-500">Hoa hồng: +{formatVND(computed.commissionAmount)}</div>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-emerald-800 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              Tổng Thu Nhập:
            </span>
            <div className="text-lg font-black font-mono text-emerald-900">{formatVND(computed.totalGrossPayout)}</div>
            <div className="text-[10px] text-emerald-700 italic">Gồm LCB + Thưởng + Hoa hồng</div>
          </div>
        </div>

        {/* Scrollable Criteria Scoring List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              1. Bảng Tiêu Chí Nghiệp Vụ &amp; Điểm Đánh Giá 3 Cấp
            </div>

            {criteria.map((crit, idx) => (
              <div key={crit.id || idx} className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{crit.name}</div>
                    <div className="text-xs text-slate-500">{crit.description}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Trọng số: {crit.weight}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400">Chỉ tiêu giao:</span>{' '}
                    <b className="text-slate-700">{crit.targetValue}</b>
                  </div>
                  <div>
                    <span className="text-slate-400">Thực tế đạt:</span>{' '}
                    <b className="text-slate-900">{crit.actualValue}</b>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Tự chấm */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Người LĐ tự chấm:</span>
                      <span className="font-mono font-bold text-slate-800">{crit.selfScore} điểm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={crit.selfScore}
                      onChange={(e) => handleScoreChange(idx, 'selfScore', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
                    />
                  </div>

                  {/* Quản lý thẩm định */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold">Quản lý thẩm định:</span>
                      <span className="font-mono font-black text-emerald-800 text-sm">{crit.managerScore} điểm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={crit.managerScore}
                      onChange={(e) => handleScoreChange(idx, 'managerScore', Number(e.target.value))}
                      className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback & Improvement Plan */}
          <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
            <div className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              2. Nhận Xét Của Quản Lý &amp; Kế Hoạch Đào Tạo
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Điểm mạnh &amp; Thành tích nổi bật:</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="Ghi nhận sự nỗ lực, tinh thần trách nhiệm..."
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Điểm cần cải thiện:</label>
                <textarea
                  rows={2}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="Kỹ năng cần bổ trợ, tối ưu hóa quy trình..."
                />
              </div>
            </div>
          </div>

          {/* Ban Giám Đốc Phê Duyệt */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-slate-900">Ban Giám Đốc Phê Duyệt &amp; Duyệt Chi</div>
                <div className="text-[11px] text-slate-500">Đánh dấu trạng thái hồ sơ đánh giá và chi trả thưởng</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDirectorApproved}
                onChange={(e) => setIsDirectorApproved(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 italic">
            Thu nhập bằng chữ: <b className="text-slate-800 uppercase">{numberToVietnameseWords(computed.totalGrossPayout)} đồng</b>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Kết Quả Đánh Giá'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiScoringModal;
