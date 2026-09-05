import React from "react";
import {
  Wrench,
  ShieldCheck,
  Briefcase,
  Crown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck2,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  Persona,
  ProjectTask,
  RoleQueueFilter,
} from "../../types/projects.types";

interface ProjectRoleActionBannerProps {
  currentPersona: Persona;
  roleQueueFilter: RoleQueueFilter;
  onSelectRoleQueueFilter: (filter: RoleQueueFilter) => void;
  tasks: ProjectTask[];
}

export const ProjectRoleActionBanner: React.FC<ProjectRoleActionBannerProps> = ({
  currentPersona,
  roleQueueFilter,
  onSelectRoleQueueFilter,
  tasks,
}) => {
  const { capabilities } = currentPersona;

  // Counts for each queue
  const myTasksCount = tasks.filter((t) => {
    const nameMatch =
      (t.assigneeName && t.assigneeName.toLowerCase().includes(currentPersona.name.toLowerCase())) ||
      (t.collaborators && t.collaborators.toLowerCase().includes(currentPersona.name.toLowerCase()));
    return Boolean(nameMatch);
  }).length;

  const inspectionQueueCount = tasks.filter(
    (t) => t.status === "review_pending" || t.status === "resubmitted"
  ).length;

  const dispatchQueueCount = tasks.filter(
    (t) => t.status === "todo" || t.status === "assigned" || t.status === "blocked"
  ).length;

  const executiveQueueCount = tasks.filter(
    (t) => t.status === "approved" || (t.status === "in_progress" && t.progressPercent >= 100)
  ).length;

  // Role icon & color theme based on level
  const getRoleTheme = () => {
    switch (currentPersona.level) {
      case 1:
        return {
          icon: Wrench,
          bg: "from-amber-500/10 via-orange-500/5 to-amber-500/10",
          border: "border-amber-200",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
          iconColor: "text-amber-600",
        };
      case 2:
        return {
          icon: ShieldCheck,
          bg: "from-blue-500/10 via-cyan-500/5 to-blue-500/10",
          border: "border-blue-200",
          badgeBg: "bg-blue-100 text-blue-800 border-blue-300",
          iconColor: "text-blue-600",
        };
      case 3:
        return {
          icon: Briefcase,
          bg: "from-indigo-500/10 via-violet-500/5 to-indigo-500/10",
          border: "border-indigo-200",
          badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-300",
          iconColor: "text-indigo-600",
        };
      case 4:
      default:
        return {
          icon: Crown,
          bg: "from-purple-500/10 via-rose-500/5 to-purple-500/10",
          border: "border-purple-200",
          badgeBg: "bg-purple-100 text-purple-800 border-purple-300",
          iconColor: "text-purple-600",
        };
    }
  };

  const theme = getRoleTheme();
  const Icon = theme.icon;

  const queueTabs: { id: RoleQueueFilter; label: string; count: number; icon: any }[] = [
    { id: "all", label: "Tất cả công việc", count: tasks.length, icon: Layers },
    { id: "my_tasks", label: "Bàn làm việc của tôi", count: myTasksCount, icon: Wrench },
    { id: "inspection_queue", label: "Chờ KCS nghiệm thu", count: inspectionQueueCount, icon: FileCheck2 },
    { id: "dispatch_queue", label: "Cần PM điều phối", count: dispatchQueueCount, icon: AlertTriangle },
    { id: "executive_queue", label: "Chờ Ban GĐ phê duyệt", count: executiveQueueCount, icon: Crown },
  ];

  return (
    <div className={`p-3.5 md:p-4 rounded-2xl bg-gradient-to-r ${theme.bg} border ${theme.border} shadow-xs transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Persona context & capability pills */}
        <div className="flex items-start md:items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0">
            <Icon className={`w-5 h-5 ${theme.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-sm font-black text-slate-800">{currentPersona.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${theme.badgeBg}`}>
                Cấp {currentPersona.level} • {currentPersona.title}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">({currentPersona.department})</span>
            </div>
            {/* Quick capability summary pills */}
            <div className="flex items-center space-x-1.5 mt-1 flex-wrap gap-y-1">
              <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" /> Thẩm quyền hoạt động:
              </span>
              {capabilities.canAcceptTask && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Nhận việc & Thi công
                </span>
              )}
              {capabilities.canInspectKcs && (
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  Kiểm định KCS Cấp 2
                </span>
              )}
              {capabilities.canRejectRework && (
                <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                  Lập Punch List sửa chữa
                </span>
              )}
              {capabilities.canApproveL3 && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                  Duyệt PM Cấp 3 (Tối đa 50tr)
                </span>
              )}
              {capabilities.canApproveL4 && (
                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                  Duyệt GĐ Cấp 4 & Quyết toán POS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: 1-Click Role Queue Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          {queueTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = roleQueueFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectRoleQueueFilter(tab.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
