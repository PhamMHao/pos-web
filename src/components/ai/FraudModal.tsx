import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  X,
  FileCheck,
  UserX,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { FraudAlert } from '../../types';

interface FraudModalProps {
  alert: FraudAlert | null;
  onClose: () => void;
  onResolve: (alertId: string) => void;
}

export const FraudModal: React.FC<FraudModalProps> = ({
  alert,
  onClose,
  onResolve,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-amber-300 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95" id="ai-fraud-modal">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                  Mức Độ Cao
                </span>
                <span className="text-xs text-slate-500 font-mono">{alert.timestamp}</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1">
                {alert.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3" id="fraud-modal-content">
          <div className="text-xs text-slate-700 leading-relaxed font-medium">
            {alert.description}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5" id="fraud-modal-suggestion">
            <div className="font-bold flex items-center space-x-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Khuyến nghị xử lý từ AI Guard:</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-95 text-slate-700">
              {alert.suggestedAction}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Xem Xét Sau
          </button>
          <button
            onClick={() => {
              onResolve(alert.id);
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lập Biên Bản & Xác Nhận Đã Xử Lý</span>
          </button>
        </div>
      </div>
    </div>
  );
};
