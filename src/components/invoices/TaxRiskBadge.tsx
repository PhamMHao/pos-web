import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { TaxRiskAssessmentResult, TaxRiskLevel } from '../../types';

interface TaxRiskBadgeProps {
  result: TaxRiskAssessmentResult | null;
  compact?: boolean;
}

export const TaxRiskBadge: React.FC<TaxRiskBadgeProps> = ({ result, compact = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const { riskLevel, riskBadge, riskScore, riskReasons, verifiedBadges, isClosedOrRunaway, operatingStatus } = result;

  const config: Record<
    TaxRiskLevel,
    {
      bg: string;
      text: string;
      border: string;
      icon: any;
      description: string;
      lightBg: string;
    }
  > = {
    safe: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      lightBg: 'bg-emerald-950/50',
      icon: ShieldCheck,
      description: 'Doanh nghiệp hoạt động bình thường, chấp hành tốt pháp luật thuế.',
    },
    warning: {
      bg: 'bg-amber-600',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      lightBg: 'bg-amber-950/50',
      icon: AlertTriangle,
      description: 'Doanh nghiệp mới hoặc có biến động thông tin pháp nhân gần đây.',
    },
    high_risk: {
      bg: 'bg-orange-600',
      text: 'text-orange-300',
      border: 'border-orange-500/40',
      lightBg: 'bg-orange-950/50',
      icon: AlertOctagon,
      description: 'Doanh nghiệp thuộc diện giám sát rủi ro cao về hóa đơn theo CQT.',
    },
    closed: {
      bg: 'bg-rose-600',
      text: 'text-rose-300',
      border: 'border-rose-500/50',
      lightBg: 'bg-rose-950/60',
      icon: XCircle,
      description: 'Doanh nghiệp đã ngừng hoạt động, đóng MST hoặc không hoạt động tại địa chỉ đăng ký.',
    },
  };

  const current = config[riskLevel] || config.safe;
  const Icon = current.icon;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.lightBg} ${current.text} ${current.border}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{riskBadge}</span>
      </span>
    );
  }

  return (
    <div className={`rounded-xl border ${current.border} ${current.lightBg} p-3 text-xs space-y-2`}>
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${current.bg} text-white shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black uppercase tracking-wide text-xs ${current.text}`}>
                Đánh Giá Rủi Ro Thuế: {riskBadge}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Điểm Rủi Ro: {riskScore}/100
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {operatingStatus || current.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
        >
          <span>{showDetails ? 'Thu gọn' : 'Chi tiết'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Warning Alert Banner for Closed or High Risk */}
      {isClosedOrRunaway && (
        <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-start gap-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-100">CẢNH BÁO NGUY CẤP CHO KẾ TOÁN:</strong> Mã số thuế này đã ngừng hoạt động hoặc có dấu hiệu bỏ trốn. Xuất hóa đơn cho MST này sẽ bị Cơ quan Thuế từ chối khấu trừ chi phí và áp dụng chế tài xử phạt!
          </div>
        </div>
      )}

      {/* Verified Badges */}
      {verifiedBadges && verifiedBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {verifiedBadges.map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10.5px] font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{badge}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expandable Details */}
      {showDetails && (
        <div className="pt-2 border-t border-slate-700/60 space-y-1.5 text-[11px] text-slate-300">
          <div className="font-bold text-slate-200">Các yếu tố đánh giá:</div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
            {riskReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
          {result.taxAuthority && (
            <div className="text-slate-400 pt-1">
              Cơ quan thuế quản lý: <strong className="text-slate-200">{result.taxAuthority}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
