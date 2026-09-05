import React from 'react';
import {
  FileText,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import { CustomerContract } from '../contracts.types';
import { formatVND } from '../../../utils/currency';

export interface CustomerContractHeaderProps {
  contracts: CustomerContract[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
  onExportExcel: () => void;
}

export const CustomerContractHeader: React.FC<CustomerContractHeaderProps> = ({
  contracts,
  loading,
  onRefresh,
  onCreateNew,
  onExportExcel,
}) => {
  // Compute KPI metrics
  const totalCount = contracts.length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.finalTotal || 0), 0);
  const activeCount = contracts.filter((c) =>
    ['in_progress', 'purchasing', 'customer_confirmed', 'sent_to_customer'].includes(c.status)
  ).length;
  const completedCount = contracts.filter((c) =>
    ['completed', 'liquidated', 'handover_completed'].includes(c.status)
  ).length;
  const level3Count = contracts.filter((c) => c.approvalLevel === 3).length;
  const pendingApprovalCount = contracts.filter(
    (c) => c.status === 'internal_review' || c.approvalStatus === 'pending'
  ).length;

  return (
    <div className="space-y-4">
      {/* Title & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Quản Lý Hợp Đồng Kinh Tế
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-cyan-300">
                    B2B CLM
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý vòng đời hợp đồng, ký số SmartCA/Token PKI, bàn giao hàng hóa & thanh lý tự động hóa đơn VAT
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={onExportExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
            title="Xuất bảng kê Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={onCreateNew}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Hợp Đồng Kinh Tế</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* KPI 1: Tổng Giá Trị Hợp Đồng */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tổng Doanh Số HĐ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            {formatVND(totalValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-blue-400">{totalCount}</span> hợp đồng trong hệ thống
          </div>
        </div>

        {/* KPI 2: Đang Hiệu Lực / Triển Khai */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Đang Thực Hiện</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-amber-300 tracking-tight">
            {activeCount} Hợp đồng
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Chờ mua hàng & bàn giao nghiệm thu</span>
          </div>
        </div>

        {/* KPI 3: Phê Duyệt Phân Cấp & Chờ Duyệt */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Chờ Duyệt Phân Cấp</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-indigo-300 tracking-tight">
            {pendingApprovalCount} Hồ sơ
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-rose-400 font-semibold">{level3Count} HĐ</span> cấp 3 (&gt;200 triệu TGĐ)
          </div>
        </div>

        {/* KPI 4: Hoàn Tất & Thanh Lý */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 shadow-lg transition-all group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Hoàn Tất & Thanh Lý</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-400 tracking-tight">
            {completedCount} Hợp đồng
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Đã xuất hóa đơn VAT TT78</span>
          </div>
        </div>
      </div>
    </div>
  );
};
