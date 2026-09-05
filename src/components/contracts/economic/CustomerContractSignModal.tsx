import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Key,
  Cloud,
  Fingerprint,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { CustomerContract, SignContractPayload } from '../contracts.types';
import { formatVND } from '../../../utils/currency';

export interface CustomerContractSignModalProps {
  contract: CustomerContract | null;
  onClose: () => void;
  onSignSuccess: (payload: SignContractPayload) => Promise<void>;
}

export const CustomerContractSignModal: React.FC<CustomerContractSignModalProps> = ({
  contract,
  onClose,
  onSignSuccess,
}) => {
  const [signerType, setSignerType] = useState<'party_b' | 'party_a'>('party_b');
  const [signerName, setSignerName] = useState(
    contract?.companyRepresentative || 'Phạm Ngọc Thơm'
  );
  const [signerPosition, setSignerPosition] = useState(
    contract?.companyPosition || 'Tổng Giám Đốc'
  );
  const [caProvider, setCaProvider] = useState('viettel_smartca');
  const [signingMethod, setSigningMethod] = useState('FaceID / SmartCA Cloud');
  const [pinCode, setPinCode] = useState('123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'connecting' | 'signed'>('form');

  if (!contract) return null;

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep('connecting');

    // Simulate CA handshake & digital crypto hash signing
    setTimeout(async () => {
      try {
        const serial = `5401:0000:GP01:${new Date().getFullYear()}:CA${Math.floor(Math.random() * 9000 + 1000)}`;
        const signatureHash = `SHA256-${Array.from({ length: 32 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('')}`.toUpperCase();

        await onSignSuccess({
          signerType,
          signerName,
          signerPosition,
          signingMethod,
          caProvider,
          serialNumber: serial,
          tsaTimestamp: 'TSA RFC 3161 Certified',
          signatureHash,
          notes: `Ký duyệt hợp đồng kinh tế theo Cấp ${contract.approvalLevel} (${formatVND(contract.finalTotal)})`,
        });

        setStep('signed');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        alert(err?.response?.data?.message || err.message || 'Lỗi trong quá trình ký số!');
        setStep('form');
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ký Số Điện Tử Hợp Đồng Kinh Tế</h3>
              <p className="text-[11px] text-slate-400 font-mono">{contract.contractNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {step === 'connecting' ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="text-sm font-bold text-white">Đang kết nối cổng chứng thực số CA...</h4>
            <p className="text-xs text-slate-400">
              Đang gửi yêu cầu băm SHA-256 tới chứng thư số và đóng dấu thời gian TSA RFC 3161
            </p>
          </div>
        ) : step === 'signed' ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Ký Số Thành Công!</h4>
            <p className="text-xs text-slate-300">
              Chữ ký số đã được gắn vào Hợp đồng kinh tế và lưu trữ cơ sở dữ liệu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSign} className="p-5 space-y-4 text-xs">
            {/* Value & Level Reminder */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Giá trị hợp đồng:</span>
                <span className="font-bold text-cyan-400 font-mono ml-2">
                  {formatVND(contract.finalTotal)}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                Thẩm quyền: Cấp {contract.approvalLevel}
              </span>
            </div>

            {/* Select Party */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Bên Thực Hiện Ký Số</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSignerType('party_b');
                    setSignerName(contract.companyRepresentative || 'Phạm Ngọc Thơm');
                    setSignerPosition(contract.companyPosition || 'Tổng Giám Đốc');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                    signerType === 'party_b'
                      ? 'bg-blue-600/20 border-blue-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <div>
                    <div className="font-bold">Bên B (GP-ERP)</div>
                    <div className="text-[10px] opacity-80">Doanh nghiệp bán</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSignerType('party_a');
                    setSignerName(contract.customerRepresentative || contract.customerName);
                    setSignerPosition(contract.customerPosition || 'Đại diện Bên A');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                    signerType === 'party_a'
                      ? 'bg-blue-600/20 border-blue-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <div>
                    <div className="font-bold">Bên A (Khách Hàng)</div>
                    <div className="text-[10px] opacity-80">Đại diện bên mua</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Signer Name & Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Họ Tên Người Ký</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Chức Vụ</label>
                <input
                  type="text"
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            {/* CA Provider Selection */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nhà Cung Cấp Chứng Thư Số</label>
              <select
                value={caProvider}
                onChange={(e) => setCaProvider(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="viettel_smartca">Viettel SmartCA (Ký Số Di Động Cloud HSM)</option>
                <option value="vnpt_smartca">VNPT SmartCA (Chứng Thư Số Từ Xa)</option>
                <option value="fpt_ca">FPT-CA (USB Token PKI Phần Cứng)</option>
                <option value="bkav_ca">BKAV-CA</option>
              </select>
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-slate-400 mb-1">Mã PIN Ký Số / Xác Thực Sinh Trắc Học</label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono tracking-widest text-center text-sm"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Actions */}
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
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Xác Nhận Ký Số</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
