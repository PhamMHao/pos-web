import React from 'react';
import {
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { SignableDocument } from '../../../types';
import { SignatureVerificationBadge } from '../SignatureVerificationBadge';
import { formatVND } from '../../../utils/vietqr';

export interface SigningDeskTabProps {
  documents: SignableDocument[];
  selectedDocIds: string[];
  docTypeFilter: string;
  docStatusFilter: string;
  searchTerm: string;
  isLoading: boolean;
  isBatchSigning: boolean;
  batchProgress: { current: number; total: number };
  filteredDocs: SignableDocument[];
  pendingDocs: SignableDocument[];
  onSetDocTypeFilter: (val: string) => void;
  onSetDocStatusFilter: (val: string) => void;
  onSetSearchTerm: (val: string) => void;
  onToggleSelectDoc: (id: string) => void;
  onSelectAllPending: () => void;
  onStartBatchSign: () => void;
  onRefreshDocs: () => void;
  onOpenSingleSign: (doc: SignableDocument) => void;
  onViewValidator: (doc: SignableDocument) => void;
}

export const SigningDeskTab: React.FC<SigningDeskTabProps> = ({
  documents,
  selectedDocIds,
  docTypeFilter,
  docStatusFilter,
  searchTerm,
  isLoading,
  isBatchSigning,
  batchProgress,
  filteredDocs,
  pendingDocs,
  onSetDocTypeFilter,
  onSetDocStatusFilter,
  onSetSearchTerm,
  onToggleSelectDoc,
  onSelectAllPending,
  onStartBatchSign,
  onRefreshDocs,
  onOpenSingleSign,
  onViewValidator,
}) => {
  return (
    <div className="space-y-4">
      {/* Filters & Batch Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã, tiêu đề, đối tác..."
              value={searchTerm}
              onChange={(e) => onSetSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Doc Type Filter */}
          <select
            value={docTypeFilter}
            onChange={(e) => onSetDocTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả loại chứng từ</option>
            <option value="einvoice">Hóa Đơn Điện Tử (XML-DSig)</option>
            <option value="order">Đơn Hàng POS / Dự Án</option>
            <option value="quote">Báo Giá Khách Hàng</option>
            <option value="contract">Hợp Đồng Lao Động</option>
          </select>

          {/* Status Filter */}
          <select
            value={docStatusFilter}
            onChange={(e) => onSetDocStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ ký số ({pendingDocs.length})</option>
            <option value="signed">Đã ký số</option>
          </select>

          <button
            type="button"
            onClick={onRefreshDocs}
            disabled={isLoading}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            title="Làm mới danh sách từ Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Batch Sign Action Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onStartBatchSign}
            disabled={selectedDocIds.length === 0 || isBatchSigning}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 border border-emerald-400/30 flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Ký Hàng Loạt SmartCA ({selectedDocIds.length})</span>
          </button>
        </div>
      </div>

      {/* Batch Progress Bar */}
      {isBatchSigning && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-300">
            <span>Đang tiến hành ký số hàng loạt qua Viettel / VNPT SmartCA Cloud HSM...</span>
            <span>
              {batchProgress.current} / {batchProgress.total} chứng từ
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-2 transition-all duration-300 rounded-full"
              style={{
                width: `${(batchProgress.current / Math.max(1, batchProgress.total)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-bold">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedDocIds.length > 0 && selectedDocIds.length === pendingDocs.length}
                  onChange={onSelectAllPending}
                  className="rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="p-3">Mã / Loại Chứng Từ</th>
              <th className="p-3">Tiêu Đề / Đối Tác</th>
              <th className="p-3">Giá Trị</th>
              <th className="p-3">Chuẩn Pháp Quy</th>
              <th className="p-3 text-center">Trạng Thái</th>
              <th className="p-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Đang nạp chứng từ chờ ký từ cơ sở dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Không tìm thấy chứng từ nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                const isSigned = doc.status === 'signed';

                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isSelected ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isSigned}
                        onChange={() => onToggleSelectDoc(doc.id)}
                        className="rounded text-emerald-500 focus:ring-0 cursor-pointer disabled:opacity-30"
                      />
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-200">
                      <div>{doc.code}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.typeLabel}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white text-xs max-w-xs truncate" title={doc.title}>
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Đối tác:</span>
                        <strong className="text-slate-300">{doc.recipientName}</strong>
                      </div>
                    </td>

                    <td className="p-3 font-mono font-bold text-amber-300">
                      {formatVND(doc.totalAmount)}
                    </td>

                    <td className="p-3">
                      <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/60">
                        {doc.legalStandard}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      {isSigned ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã Ký Số</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Chờ Ký Số</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {isSigned ? (
                          <button
                            type="button"
                            onClick={() => onViewValidator(doc)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium rounded-xl border border-slate-700 flex items-center space-x-1 transition cursor-pointer"
                            title="Thẩm tra tính toàn vẹn 5 lớp chữ ký số"
                          >
                            <Award className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Thẩm Tra CA</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenSingleSign(doc)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow border border-emerald-400/40 flex items-center space-x-1 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Ký Số CA</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
