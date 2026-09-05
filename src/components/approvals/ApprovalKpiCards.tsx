import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { SequentialApprovalProcess } from './approvals.types';

interface ApprovalKpiCardsProps {
  processes: SequentialApprovalProcess[];
  currentUserRole?: string;
  currentUserName?: string;
}

export const ApprovalKpiCards: React.FC<ApprovalKpiCardsProps> = ({
  processes,
  currentUserRole,
  currentUserName,
}) => {
  const total = processes.length;
  const approved = processes.filter((p) => p.status === 'approved').length;
  const inProgress = processes.filter((p) => p.status === 'in_progress').length;
  const reworkOrRejected = processes.filter(
    (p) => p.status === 'rework' || p.status === 'rejected'
  ).length;

  const overdueCount = processes.filter((p) => p.isOverdue).length;

  // Tính số phiếu đang chờ vai trò của user hiện tại ký
  const waitingForMe = processes.filter((p) => {
    if (p.status !== 'in_progress') return false;
    const activeStep = p.steps.find((s) => s.status === 'waiting');
    if (!activeStep) return false;
    if (currentUserRole === 'admin') return true;
    return (
      activeStep.requiredRole === currentUserRole ||
      (currentUserName && activeStep.assignedUserName.includes(currentUserName))
    );
  }).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5 select-none">
      {/* Thẻ 1: Chờ tôi phê duyệt */}
      <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Chờ Tôi Ký Duyệt
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-inner">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {waitingForMe}
          </span>
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Cần thao tác ngay
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          Hồ sơ đã đến lượt thẩm định
        </p>
      </div>

      {/* Thẻ 2: Đang xử lý tuần tự */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Đang Xử Lý Tuần Tự
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-inner">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {inProgress}
          </span>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {total > 0 ? Math.round((inProgress / total) * 100) : 0}% tổng số
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          Đang luân chuyển đa phòng ban
        </p>
      </div>

      {/* Thẻ 3: Đã hoàn tất duyệt */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Đã Ký Duyệt Xong
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-inner">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-emerald-700 tracking-tight">
            {approved}
          </span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Hiệu lực 100%
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          Đã chốt sổ & có chữ ký số
        </p>
      </div>

      {/* Thẻ 4: Yêu cầu làm lại / Rework */}
      <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Yêu Cầu Sửa / Trả Về
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shadow-inner">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-rose-700 tracking-tight">
            {reworkOrRejected}
          </span>
          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Cần giải trình
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          Sai số liệu hoặc thiếu chứng từ
        </p>
      </div>

      {/* Thẻ 5: Quá hạn SLA */}
      <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Cảnh Báo Chậm Trễ SLA
          </span>
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-inner">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-orange-700 tracking-tight">
            {overdueCount}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              overdueCount > 0
                ? 'text-red-700 bg-red-50 border-red-200 animate-pulse'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}
          >
            {overdueCount > 0 ? 'Chậm tiến độ' : 'Đạt 100%'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          Vượt ngưỡng thời gian cam kết
        </p>
      </div>
    </div>
  );
};
