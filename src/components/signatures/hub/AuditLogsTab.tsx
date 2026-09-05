import React from 'react';
import { Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SignatureAuditLog } from '../../../types';

export interface AuditLogsTabProps {
  auditLogs: SignatureAuditLog[];
  onExportExcel: () => void;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  auditLogs,
  onExportExcel,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Nhật Ký Kiểm Toán &amp; Lưu Vết Chữ Ký Số (Audit Trail)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Lưu vết bất biến thời gian ký, địa chỉ IP máy trạm, mã băm SHA-256 và nhà mạng CA theo chuẩn an ninh mạng ISO 27001
          </p>
        </div>

        <button
          type="button"
          onClick={onExportExcel}
          disabled={auditLogs.length === 0}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Xuất Báo Cáo Kiểm Toán (Excel)</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-bold">
              <th className="p-3">Mã Log</th>
              <th className="p-3">Thời Gian Ký</th>
              <th className="p-3">Mã Chứng Từ</th>
              <th className="p-3">Tên Tài Liệu</th>
              <th className="p-3">Nhà Mạng CA</th>
              <th className="p-3">Người Ký</th>
              <th className="p-3">Địa Chỉ IP</th>
              <th className="p-3 text-center">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                  Chưa có phiên ký số nào được thực hiện trong phiên làm việc này.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-bold text-slate-300">{log.id}</td>
                  <td className="p-3 text-slate-400 font-sans">{log.timestamp}</td>
                  <td className="p-3 font-bold text-emerald-400">{log.documentCode}</td>
                  <td className="p-3 font-sans text-white max-w-xs truncate" title={log.documentTitle}>
                    {log.documentTitle}
                  </td>
                  <td className="p-3 text-cyan-300">{log.provider}</td>
                  <td className="p-3 font-sans text-slate-200">{log.signerName}</td>
                  <td className="p-3 text-slate-400">{log.ipAddress}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Thành Công</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
