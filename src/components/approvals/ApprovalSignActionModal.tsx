import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  PenTool,
  Lock,
  Cpu,
} from 'lucide-react';
import {
  SequentialApprovalProcess,
  SequentialApprovalStep,
  ApprovalActionPayload,
} from './approvals.types';

interface ApprovalSignActionModalProps {
  process: SequentialApprovalProcess | null;
  step: SequentialApprovalStep | null;
  currentUser: any;
  onClose: () => void;
  onSubmitAction: (payload: ApprovalActionPayload) => Promise<void>;
}

export const ApprovalSignActionModal: React.FC<ApprovalSignActionModalProps> = ({
  process,
  step,
  currentUser,
  onClose,
  onSubmitAction,
}) => {
  if (!process || !step) return null;

  const [decision, setDecision] = useState<'approve' | 'rework' | 'reject'>('approve');
  const [signMethod, setSignMethod] = useState<'pin' | 'pki_ca' | 'drawing'>('pin');
  const [pinCode, setPinCode] = useState('123456');
  const [caProvider, setCaProvider] = useState<'viettel_smartca' | 'vnpt_smartca' | 'fpt_esign' | 'usb_token'>('viettel_smartca');
  const [reviewNotes, setReviewNotes] = useState('Đồng ý phê duyệt. Đã kiểm tra đầy đủ hồ sơ theo quy định.');
  const [reworkRequirements, setReworkRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (decision === 'rework' && !reworkRequirements.trim()) {
      setErrorMsg('Vui lòng nêu rõ lý do và yêu cầu sửa đổi bổ sung.');
      return;
    }

    if (decision === 'reject' && !reviewNotes.trim()) {
      setErrorMsg('Vui lòng nêu rõ lý do từ chối tờ trình.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ApprovalActionPayload = {
        stepId: step.id,
        stepOrder: step.stepOrder,
        action: decision,
        actedBy: currentUser?.fullName || currentUser?.username || 'Người Thẩm Định',
        userRole: currentUser?.role || 'approver',
        reviewNotes: decision === 'rework' ? reworkRequirements : reviewNotes,
        reworkRequirements: decision === 'rework' ? reworkRequirements : undefined,
        signMethod: decision === 'approve' ? signMethod : undefined,
        caProvider: decision === 'approve' && signMethod === 'pki_ca' ? caProvider : undefined,
        signatureData:
          decision === 'approve'
            ? signMethod === 'pin'
              ? `PIN_VERIFIED:${pinCode}`
              : signMethod === 'pki_ca'
              ? `${caProvider.toUpperCase()}_SIGNATURE_VALID`
              : 'DRAWING_SIGNATURE_DATA'
            : undefined,
        pkiCertificateSerial:
          decision === 'approve' && signMethod === 'pki_ca'
            ? '5401:3819:2281:9914:B7A1'
            : undefined,
        pkiSignatureHash:
          decision === 'approve'
            ? 'a8f9c1b3e2d7f8a9c0b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3'
            : undefined,
      };

      await onSubmitAction(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Lỗi khi thực hiện thao tác.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Ký Duyệt Bước {step.stepOrder}: {step.stepName}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Hồ sơ: {process.processCode} • {process.referenceDocCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chọn quyết định thẩm định */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px] tracking-wider">
              1. Quyết Định Thẩm Định & Phê Duyệt
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDecision('approve');
                  setErrorMsg('');
                }}
                className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  decision === 'approve'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="block text-[11px]">Đồng Ý Duyệt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('rework');
                  setErrorMsg('');
                }}
                className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  decision === 'rework'
                    ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-400/20 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <RotateCcw className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                <span className="block text-[11px]">Yêu Cầu Sửa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('reject');
                  setErrorMsg('');
                }}
                className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  decision === 'reject'
                    ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-400/20 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span className="block text-[11px]">Từ Chối</span>
              </button>
            </div>
          </div>

          {/* Phương thức ký nếu Đồng Ý */}
          {decision === 'approve' && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <label className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                2. Phương Thức Ký Phê Duyệt Hợp Pháp
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSignMethod('pin')}
                  className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    signMethod === 'pin'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 mx-auto mb-0.5" />
                  <span>Mã PIN OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignMethod('pki_ca')}
                  className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    signMethod === 'pki_ca'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 mx-auto mb-0.5" />
                  <span>Ký Số CA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignMethod('drawing')}
                  className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    signMethod === 'drawing'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 mx-auto mb-0.5" />
                  <span>Ký Điện Tử</span>
                </button>
              </div>

              {/* Tùy chọn theo phương thức ký */}
              {signMethod === 'pin' && (
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">
                    Nhập mã PIN bảo mật cá nhân (Mặc định: 123456):
                  </span>
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>
              )}

              {signMethod === 'pki_ca' && (
                <div>
                  <span className="text-slate-500 text-[11px] block mb-1">
                    Chọn nhà cung cấp Chữ ký số SmartCA:
                  </span>
                  <select
                    value={caProvider}
                    onChange={(e: any) => setCaProvider(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="viettel_smartca">Viettel SmartCA (Cloud HSM)</option>
                    <option value="vnpt_smartca">VNPT SmartCA (Dấu Thời Gian TSA)</option>
                    <option value="fpt_esign">FPT.eSign</option>
                    <option value="usb_token">USB Token Phần Cứng (PKCS#11)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Ý kiến phê duyệt hoặc Yêu cầu sửa đổi */}
          {decision === 'rework' ? (
            <div>
              <label className="font-bold text-rose-700 block mb-1 text-[11px]">
                Nội dung yêu cầu làm lại & hồ sơ cần bổ sung (*):
              </label>
              <textarea
                value={reworkRequirements}
                onChange={(e) => setReworkRequirements(e.target.value)}
                placeholder="VD: Cần đính kèm thêm bản cam kết bảo hành của nhà cung cấp..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs text-slate-800 bg-rose-50/30"
              />
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                Ý kiến thẩm định & phê duyệt:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 bg-white"
              />
            </div>
          )}

          {/* Thông tin người ký */}
          <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              Người ký:{' '}
              <strong className="text-slate-800">
                {currentUser?.fullName || currentUser?.username || 'Người Thẩm Định'}
              </strong>
            </span>
            <span>
              Vai trò: <strong className="uppercase text-blue-700">{currentUser?.role || 'Admin'}</strong>
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                decision === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : decision === 'rework'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : 'bg-slate-800 hover:bg-slate-900 shadow-slate-700/20'
              }`}
            >
              {isSubmitting ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {decision === 'approve'
                      ? 'Xác Nhận Ký Duyệt'
                      : decision === 'rework'
                      ? 'Gửi Yêu Cầu Sửa'
                      : 'Xác Nhận Từ Chối'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
