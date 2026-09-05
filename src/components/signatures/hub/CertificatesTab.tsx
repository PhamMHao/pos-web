import React from 'react';
import {
  Award,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  Key,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { DigitalCertificateX509 } from '../../../types';

export interface CertificatesTabProps {
  certificates: DigitalCertificateX509[];
  onSetDefaultCert: (id: string) => void;
}

export const CertificatesTab: React.FC<CertificatesTabProps> = ({
  certificates,
  onSetDefaultCert,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Kho Lưu Trữ Chứng Thư Số Doanh Nghiệp X.509</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý các cặp khóa RSA 2048-bit của Con Dấu Pháp Nhân và các Chức danh có thẩm quyền ký số (TGĐ, Kế toán trưởng)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            {certificates.length} Chứng thư sẵn sàng
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className={`p-4 rounded-2xl border transition-all ${
              cert.isDefault
                ? 'bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{cert.subjectName}</div>
                  <div className="text-[11px] text-slate-400">MST: <strong className="text-slate-300">{cert.subjectTaxCode}</strong></div>
                </div>
              </div>

              {cert.isDefault ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                  Mặc Định
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetDefaultCert(cert.id)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  Đặt mặc định
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nhà cấp phát (CA):</span>
                <span className="font-bold text-emerald-300">{cert.issuer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Số Serial:</span>
                <span className="font-mono text-[11px] text-cyan-300 truncate max-w-[200px]" title={cert.serialNumber}>
                  {cert.serialNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thuật toán khóa:</span>
                <span className="font-mono text-slate-300">{cert.keyAlgorithm}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hiệu lực chứng thư:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {cert.validFrom} ➔ {cert.validTo}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Ủy quyền sử dụng:</span>
                <span className="font-bold text-amber-300 text-[11px]">{cert.assignedTo}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {cert.keyUsage.map((usage, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/60 text-slate-300 border border-slate-700/60"
                >
                  {usage}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
