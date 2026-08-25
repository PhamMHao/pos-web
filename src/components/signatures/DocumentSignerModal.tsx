import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Key,
  Cloud,
  FileCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import {
  CaProvider,
  DigitalCertificateX509,
  DigitalSignatureMetadata,
  SignableDocument,
  SignatureAuditLog,
  SigningMethod,
  StoreSettings,
} from '../../types';
import {
  DEFAULT_CA_GATEWAYS,
  DEFAULT_CERTIFICATES,
  executeDigitalSignature,
} from '../../utils/digitalSignatureEngine';

export interface DocumentSignerModalProps {
  document: SignableDocument;
  settings?: StoreSettings;
  onClose: () => void;
  onSignSuccess: (signature: DigitalSignatureMetadata, auditLog: SignatureAuditLog) => void;
}

export const DocumentSignerModal: React.FC<DocumentSignerModalProps> = ({
  document,
  settings,
  onClose,
  onSignSuccess,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<CaProvider>('viettel_smartca');
  const [signingMethod, setSigningMethod] = useState<SigningMethod>('remote_signing');
  const [pinCode, setPinCode] = useState('123456');
  const [isSigning, setIsSigning] = useState(false);
  const [signStep, setSignStep] = useState<'idle' | 'contacting' | 'waiting_auth' | 'timestamping' | 'completed'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedGateway =
    DEFAULT_CA_GATEWAYS.find((g) => g.provider === selectedProvider) || DEFAULT_CA_GATEWAYS[0];

  const selectedCert =
    DEFAULT_CERTIFICATES.find((c) => c.provider === selectedProvider) || DEFAULT_CERTIFICATES[0];

  const handleStartSign = async () => {
    setIsSigning(true);
    setErrorMsg(null);
    setSignStep('contacting');

    try {
      // Step 1: Handshake with CA Gateway (600ms)
      await new Promise((r) => setTimeout(r, 600));
      setSignStep('waiting_auth');

      // Step 2: Waiting for Remote OTP / Token PIN (1000ms)
      await new Promise((r) => setTimeout(r, 1000));
      setSignStep('timestamping');

      // Step 3: TSA RFC 3161 Timestamp & SHA-256 Packing (600ms)
      const { signature, auditLog } = await executeDigitalSignature(
        document,
        selectedProvider,
        signingMethod,
        selectedCert,
        settings
      );

      setSignStep('completed');
      await new Promise((r) => setTimeout(r, 500));

      onSignSuccess(signature, auditLog);
    } catch (err: any) {
      setErrorMsg('Ký số không thành công: ' + (err.message || 'Lỗi kết nối cổng CA'));
      setIsSigning(false);
      setSignStep('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Ký Số Điện Tử Hợp Chuẩn Pháp Quy</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {document.legalStandard}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Luật Giao dịch điện tử số 20/2023/QH15 &amp; TT 78/2021/TT-BTC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSigning}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-xs">
          {/* Document Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chứng từ cần ký:</span>
              <span className="font-mono font-bold text-emerald-400">{document.code}</span>
            </div>
            <div className="font-bold text-white text-sm line-clamp-1">{document.title}</div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Đơn vị / Đối tác:</span>
              <span className="text-slate-200">{document.recipientName}</span>
            </div>
          </div>

          {/* Step 1: Select CA Provider */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">1. Chọn Nhà Cung Cấp Dịch Vụ Chứng Thực Số (CA):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_CA_GATEWAYS.map((gw) => (
                <button
                  key={gw.provider}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(gw.provider);
                    if (gw.provider === 'usb_token') setSigningMethod('usb_token');
                    else setSigningMethod('remote_signing');
                  }}
                  disabled={isSigning}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedProvider === gw.provider
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">{gw.logo}</span>
                    <span className="font-bold text-xs truncate">{gw.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Ping:</span>
                    <span className="text-emerald-400 font-mono font-bold">{gw.pingLatencyMs}ms</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Signing Method */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold">2. Phương Thức Xác Thực Ký Số:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSigningMethod('remote_signing')}
                disabled={isSigning}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  signingMethod === 'remote_signing'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span className="font-bold text-[11px] block">SmartCA App</span>
                <span className="text-[9px] text-slate-500">OTP / FaceID</span>
              </button>

              <button
                type="button"
                onClick={() => setSigningMethod('usb_token')}
                disabled={isSigning}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  signingMethod === 'usb_token'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <Key className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span className="font-bold text-[11px] block">USB Token</span>
                <span className="text-[9px] text-slate-500">Mã PIN Cục Bộ</span>
              </button>

              <button
                type="button"
                onClick={() => setSigningMethod('cloud_hsm')}
                disabled={isSigning}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  signingMethod === 'cloud_hsm'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <Cloud className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <span className="font-bold text-[11px] block">Cloud HSM</span>
                <span className="text-[9px] text-slate-500">Ký Tự Động</span>
              </button>
            </div>
          </div>

          {/* Selected Certificate Info */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Chứng thư số sử dụng:</span>
              <span className="text-emerald-400 font-bold">RSA 2048-bit (Hợp Lệ)</span>
            </div>
            <div className="font-semibold text-white">{selectedCert.subjectName}</div>
            <div className="text-slate-400 flex items-center justify-between">
              <span>Cấp bởi: {selectedCert.issuer}</span>
              <span>Hạn dùng: {selectedCert.validTo}</span>
            </div>
          </div>

          {/* Interactive Signing Process Screen */}
          {isSigning && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
                <div>
                  <h4 className="font-bold text-white text-xs">
                    {signStep === 'contacting' && 'Đang kết nối cổng Gateway CA...'}
                    {signStep === 'waiting_auth' &&
                      (signingMethod === 'remote_signing'
                        ? 'Đang chờ xác thực OTP / FaceID trên App SmartCA điện thoại...'
                        : 'Đang đọc chứng thư số & xác minh mã PIN Token...')}
                    {signStep === 'timestamping' && 'Đang đóng Dấu thời gian TSA RFC 3161 & Mã băm SHA-256...'}
                    {signStep === 'completed' && 'Ký số điện tử thành công 100%!'}
                  </h4>
                  <p className="text-[10px] text-slate-400">Hệ thống mã hóa chuẩn PAdES B-LT / XML-DSig</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                  style={{
                    width:
                      signStep === 'contacting'
                        ? '30%'
                        : signStep === 'waiting_auth'
                        ? '65%'
                        : signStep === 'timestamping'
                        ? '90%'
                        : '100%',
                  }}
                ></div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isSigning}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            onClick={handleStartSign}
            disabled={isSigning}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSigning ? 'Đang Xử Lý Ký Số...' : `Ký Số Ngay Với ${selectedGateway.name}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
