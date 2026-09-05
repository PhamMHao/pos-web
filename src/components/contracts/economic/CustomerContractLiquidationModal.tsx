import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  FileCheck2,
  Receipt,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CustomerContract, CreateLiquidationPayload } from '../contracts.types';
import { formatVND } from '../../../utils/currency';

export interface CustomerContractLiquidationModalProps {
  contract: CustomerContract | null;
  onClose: () => void;
  onSubmit: (payload: CreateLiquidationPayload) => Promise<void>;
}

export const CustomerContractLiquidationModal: React.FC<CustomerContractLiquidationModalProps> = ({
  contract,
  onClose,
  onSubmit,
}) => {
  const [actualAmount, setActualAmount] = useState<number>(contract?.finalTotal || 0);
  const [paidAmount, setPaidAmount] = useState<number>(contract?.paidAmount || 0);
  const [penaltyOrAdjustment, setPenaltyOrAdjustment] = useState<number>(0);
  const [warrantyCommitment, setWarrantyCommitment] = useState(
    `Bảo hành toàn bộ hệ thống thiết bị trong thời hạn ${contract?.warrantyMonths || 12} tháng theo đúng tiêu chuẩn kỹ thuật cam kết.`
  );
  const [conclusion, setConclusion] = useState(
    'Hai bên nhất trí nghiệm thu hoàn thành toàn bộ khối lượng công việc theo hợp đồng, không còn khiếu nại hay tranh chấp và tiến hành thanh lý hợp đồng.'
  );
  const [autoGenerateInvoice, setAutoGenerateInvoice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contract) return null;

  const finalPaymentAmount = Math.max(0, actualAmount - paidAmount - penaltyOrAdjustment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        actualAmount,
        paidAmount,
        penaltyOrAdjustment,
        finalPaymentAmount,
        warrantyCommitment,
        conclusion,
        signatureA: contract.customerRepresentative || contract.customerName,
        signatureB: contract.companyRepresentative || 'Phạm Ngọc Thơm',
        autoGenerateInvoice,
      });
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi thanh lý hợp đồng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Biên Bản Nghiệm Thu & Thanh Lý Hợp Đồng</h3>
              <p className="text-[11px] text-slate-400 font-mono">{contract.contractNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-300">
          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1">Giá Trị Hợp Đồng Gốc</label>
              <div className="font-bold text-cyan-400 font-mono text-sm">
                {formatVND(contract.finalTotal)}
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Giá Trị Thực Tế Quyết Toán</label>
              <input
                type="number"
                value={actualAmount}
                onChange={(e) => setActualAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Số Tiền Đã Thanh Toán</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Thanh Toán Đợt Cuối Còn Lại</label>
              <div className="font-bold text-amber-400 font-mono text-sm">
                {formatVND(finalPaymentAmount)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Cam Kết Nghĩa Vụ Bảo Hành</label>
            <textarea
              rows={2}
              value={warrantyCommitment}
              onChange={(e) => setWarrantyCommitment(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kết Luận Thanh Lý Hợp Đồng</label>
            <textarea
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              required
            />
          </div>

          {/* 1-Click Trigger E-Invoice VAT Option */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-3">
            <input
              type="checkbox"
              id="autoInvoice"
              checked={autoGenerateInvoice}
              onChange={(e) => setAutoGenerateInvoice(e.target.checked)}
              className="mt-0.5 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="autoInvoice" className="cursor-pointer">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-purple-400" />
                <span>Tự Động Xuất Hóa Đơn Điện Tử VAT TT78</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/30 text-purple-300">1-Click</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hệ thống sẽ tự động phát hành Hóa đơn điện tử VAT chuẩn Nghị định 123 / Thông tư 78 kết nối vào phân hệ Quản lý Hóa Đơn Điện Tử.
              </p>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/25 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nghiệm Thu & Thanh Lý</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
