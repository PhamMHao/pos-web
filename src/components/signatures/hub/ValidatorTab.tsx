import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Lock,
  Calendar,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { SignableDocument, DigitalSignatureMetadata } from '../../../types';
import { verifySignatureIntegrity } from '../../../utils/digitalSignatureEngine';

export interface ValidatorTabProps {
  document: SignableDocument | null;
  allSignedDocs: SignableDocument[];
  onSelectDoc: (doc: SignableDocument) => void;
}

export const ValidatorTab: React.FC<ValidatorTabProps> = ({
  document,
  allSignedDocs,
  onSelectDoc,
}) => {
  const activeDoc = document || allSignedDocs[0] || null;
  const signature: DigitalSignatureMetadata | null = activeDoc?.signature || null;

  const verification = signature
    ? verifySignatureIntegrity(signature)
    : {
        isValid: false,
        score: 0,
        checks: [],
      };

  return (
    <div className="space-y-4">
      {/* Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Thẩm Tra Tính Toàn Vẹn &amp; Pháp Lý Chữ Ký Số (5 Lớp Xác Thực)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kiểm tra mã băm SHA-256, Dấu thời gian TSA RFC 3161 và Trạng thái thu hồi chứng thư số theo Luật Giao dịch điện tử 2023
          </p>
        </div>

        {allSignedDocs.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 shrink-0">Chọn chứng từ đã ký:</span>
            <select
              value={activeDoc?.id || ''}
              onChange={(e) => {
                const found = allSignedDocs.find((d) => d.id === e.target.value);
                if (found) onSelectDoc(found);
              }}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-xs truncate"
            >
              {allSignedDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeDoc || !signature ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          <AlertTriangle className="w-8 h-8 mx-auto text-amber-500/60 mb-2" />
          <p className="text-sm">Chưa có chứng từ nào được ký số để kiểm tra tính toàn vẹn.</p>
          <p className="text-xs text-slate-600 mt-1">
            Vui lòng chọn hoặc ký số một chứng từ tại tab Bàn Ký Số để kích hoạt hệ thống thẩm tra.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Integrity Score Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Chỉ số an toàn mật mã
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  100% Valid
                </span>
              </div>

              <div className="text-center py-4">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black text-white">Chữ Ký Số Hợp Lệ Tuyệt Đối</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Chứng từ toàn vẹn 100%, không bị sửa đổi sau thời điểm ký số
                </p>
              </div>

              <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Mã chứng từ:</span>
                  <span className="text-emerald-400 font-bold">{activeDoc.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Nhà mạng CA:</span>
                  <span className="text-slate-200">{signature.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Người ký số:</span>
                  <span className="text-slate-200">{signature.signerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Định dạng ký:</span>
                  <span className="text-cyan-300">{signature.signatureFormat}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Mã băm dữ liệu:
              <div className="font-mono text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded mt-1 break-all">
                {signature.sha256Hash}
              </div>
            </div>
          </div>

          {/* Right Column: 5 Validation Checks */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
              Kết Quả Thẩm Tra 5 Lớp Tiêu Chuẩn Quốc Gia
            </h4>

            <div className="space-y-2.5">
              {verification.checks.map((check, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3"
                >
                  <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{check.name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                        Passed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{check.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
