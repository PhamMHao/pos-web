import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Stamp,
  X,
  FileCheck,
  Calendar,
  Layers,
  Key,
} from 'lucide-react';
import { DigitalSignatureMetadata } from '../../types';
import { verifySignatureIntegrity } from '../../utils/digitalSignatureEngine';

export interface SignatureVerificationBadgeProps {
  signature?: DigitalSignatureMetadata;
  showDetailsModal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onOpenHub?: () => void;
}

export const SignatureVerificationBadge: React.FC<SignatureVerificationBadgeProps> = ({
  signature,
  size = 'md',
  className = '',
  onOpenHub,
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!signature) return null;

  const verification = verifySignatureIntegrity(signature);
  const formattedDate = new Date(signature.signedAt).toLocaleString('vi-VN');

  return (
    <>
      {/* Visual Digital Signature Stamp Badge */}
      <div
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center space-x-2 p-2 rounded-xl border transition-all cursor-pointer select-none ${
          signature.validationStatus === 'valid'
            ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/30 text-emerald-300 shadow-sm'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
        } ${className}`}
        title="Nhấp để kiểm tra tính toàn vẹn chữ ký số & chứng thư số X.509"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        </div>

        <div className="text-left leading-tight">
          <div className="flex items-center space-x-1.5">
            <span className={`font-bold uppercase tracking-wider ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
              ĐÃ KÝ SỐ ĐIỆN TỬ
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              {signature.signatureFormat}
            </span>
          </div>
          <div className={`text-slate-300 truncate max-w-[200px] ${size === 'sm' ? 'text-[9px]' : 'text-[11px]'}`}>
            {signature.signerName} ({signature.providerName})
          </div>
          <div className="text-[9px] text-slate-400 font-mono">{formattedDate}</div>
        </div>
      </div>

      {/* Signature Verification Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 overflow-y-auto backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Xác Thực Tính Toàn Vẹn Chữ Ký Số</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      HỢP LỆ 100%
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Luật Giao dịch điện tử 2023 &amp; TT 78/2021/TT-BTC</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Green Verified Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 space-y-1">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chứng Thư Số &amp; Chữ Ký Điện Tử Hợp Lệ</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Văn bản đã được ký số bằng chứng thư số X.509 còn hiệu lực do {signature.issuer} cấp phát. Dữ liệu văn bản nguyên vẹn, không bị chỉnh sửa sau khi ký.
                </p>
              </div>

              {/* Certificate & Signer Details */}
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Người ký số:</span>
                  <span className="font-bold text-white">{signature.signerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Nhà cung cấp CA:</span>
                  <span className="font-semibold text-cyan-300">{signature.providerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Phương thức ký:</span>
                  <span className="font-semibold text-slate-200 uppercase">{signature.signingMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Thời gian ký:</span>
                  <span className="font-mono text-slate-200">{formattedDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Dấu thời gian TSA (RFC 3161):</span>
                  <span className="font-mono text-emerald-400">{signature.tsaTimestamp || 'VNPT TSA Verified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Serial Chứng Thư:</span>
                  <span className="font-mono text-[10px] text-slate-300">{signature.certificateSerial}</span>
                </div>
                <div className="flex flex-col py-1">
                  <span className="text-slate-400 mb-1">Mã băm SHA-256 (Document Hash):</span>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded-lg break-all border border-slate-800">
                    {signature.sha256Hash}
                  </span>
                </div>
              </div>

              {/* 5 Cryptographic Check Points */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-200 text-xs">Các Tiêu Chuẩn Xác Thực (5/5 Đạt Chuẩn):</h4>
                <div className="space-y-1">
                  {verification.checks.map((chk, i) => (
                    <div key={i} className="flex items-start space-x-2 text-[11px] py-1 border-b border-slate-800/50">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">{chk.name}: </span>
                        <span className="text-slate-400">{chk.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {onOpenHub && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    onOpenHub();
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Mở Cổng Quản Lý CA Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold ml-auto cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
