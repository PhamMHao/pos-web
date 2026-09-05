import React from "react";
import {
  FolderKanban,
  Clock,
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { EnterpriseProject, ProjectTask, ProjectMaterialTicket } from "../../types/projects.types";

interface ProjectKpiSummaryCardsProps {
  projects?: EnterpriseProject[];
  tasks?: ProjectTask[];
  materialTickets?: ProjectMaterialTicket[];
  totalProjectsCount?: number;
  runningProjectsCount?: number;
  inProgressTasksCount?: number;
  totalTasksCount?: number;
  reviewTasksCount?: number;
  reworkTasksCount?: number;
  approvedTasksCount?: number;
  completedTasksCount?: number;
}

export const ProjectKpiSummaryCards: React.FC<ProjectKpiSummaryCardsProps> = ({
  projects,
  tasks,
  totalProjectsCount,
  runningProjectsCount,
  inProgressTasksCount,
  totalTasksCount,
  reviewTasksCount,
  reworkTasksCount,
  approvedTasksCount,
  completedTasksCount,
}) => {
  const totalProj = projects ? projects.length : (totalProjectsCount || 0);
  const runningProj = projects ? projects.filter(p => p.status === 'in_progress').length : (runningProjectsCount || 0);
  const totalT = tasks ? tasks.length : (totalTasksCount || 0);
  const inProgT = tasks ? tasks.filter(t => t.status === 'in_progress').length : (inProgressTasksCount || 0);
  const reviewT = tasks ? tasks.filter(t => t.status === 'review_pending' || t.status === 'resubmitted').length : (reviewTasksCount || 0);
  const reworkT = tasks ? tasks.filter(t => t.status === 'rework_required').length : (reworkTasksCount || 0);
  const approvedT = tasks ? tasks.filter(t => t.status === 'approved').length : (approvedTasksCount || 0);
  const completedT = tasks ? tasks.filter(t => t.status === 'completed').length : (completedTasksCount || 0);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Dự án thi công</span>
          <FolderKanban className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-black text-slate-900 mt-1">
          {runningProj}{" "}
          <span className="text-xs text-slate-400 font-normal">
            / {totalProj}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Đang thi công</span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-xl font-black text-blue-600 mt-1">
          {inProgT}{" "}
          <span className="text-xs text-slate-400 font-normal">
            / {totalT}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-amber-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Chờ KCS nghiệm thu</span>
          <FileCheck2 className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-black text-amber-600 mt-1">
          {reviewT}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-rose-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Yêu cầu sửa chữa</span>
          <AlertTriangle className="w-4 h-4 text-rose-600" />
        </div>
        <div className="text-xl font-black text-rose-600 mt-1">
          {reworkT}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Đã duyệt kỹ thuật</span>
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-xl font-black text-indigo-600 mt-1">
          {approvedT}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
          <span>Nghiệm thu đóng</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-black text-emerald-600 mt-1">
          {completedT}
        </div>
      </div>
    </div>
  );
};
