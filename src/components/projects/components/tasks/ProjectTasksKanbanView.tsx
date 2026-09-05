import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Boxes,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { ProjectTask, ProjectTaskStatus } from "../../types/projects.types";

interface ProjectTasksKanbanViewProps {
  tasks: ProjectTask[];
  onSelectTask: (task: ProjectTask) => void;
  onAcceptTask: (taskId: string) => void;
}

export const ProjectTasksKanbanView: React.FC<ProjectTasksKanbanViewProps> = ({
  tasks,
  onSelectTask,
  onAcceptTask,
}) => {
  const columns: {
    id: string;
    statusList: ProjectTaskStatus[];
    label: string;
    color: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "col-todo",
      statusList: ["todo", "assigned"],
      label: "1. Chờ Nhận Việc",
      color: "border-slate-200 bg-slate-100/70",
      badge: "bg-slate-200 text-slate-700",
      icon: <Clock className="w-4 h-4 text-slate-500" />,
    },
    {
      id: "col-in_progress",
      statusList: ["in_progress"],
      label: "2. Đang Thi Công",
      color: "border-blue-200 bg-blue-50/60",
      badge: "bg-blue-100 text-blue-800",
      icon: <Clock className="w-4 h-4 text-blue-600" />,
    },
    {
      id: "col-blocked",
      statusList: ["blocked"],
      label: "3. Tạm Dừng",
      color: "border-stone-300 bg-stone-100/70",
      badge: "bg-stone-200 text-stone-800",
      icon: <span className="text-sm">⏸️</span>,
    },
    {
      id: "col-review",
      statusList: ["review_pending", "resubmitted"],
      label: "4. Chờ KCS Duyệt",
      color: "border-amber-200 bg-amber-50/60",
      badge: "bg-amber-100 text-amber-800",
      icon: <FileCheck2 className="w-4 h-4 text-amber-600" />,
    },
    {
      id: "col-rework",
      statusList: ["rework_required"],
      label: "5. Cần Khắc Phục",
      color: "border-rose-200 bg-rose-50/60",
      badge: "bg-rose-100 text-rose-800",
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    },
    {
      id: "col-approved",
      statusList: ["approved"],
      label: "6. Đã Duyệt PM",
      color: "border-purple-200 bg-purple-50/60",
      badge: "bg-purple-100 text-purple-800",
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
    },
    {
      id: "col-completed",
      statusList: ["completed"],
      label: "7. Hoàn Thành",
      color: "border-emerald-200 bg-emerald-50/60",
      badge: "bg-emerald-100 text-emerald-800",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
  ];

  // Helper SLA
  const getDeadlineBadge = (task: ProjectTask) => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate).getTime();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    if (task.status === "completed") {
      return (
        <span className="text-[10px] text-emerald-700 font-medium">
          ✓ Xong đúng hạn
        </span>
      );
    }

    if (due < todayStart) {
      const days = Math.ceil((todayStart - due) / 86400000);
      return (
        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
          Trễ {days} ngày
        </span>
      );
    }

    if (due >= todayStart && due < todayEnd) {
      return (
        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
          Hôm nay đến hạn
        </span>
      );
    }

    const daysLeft = Math.ceil((due - todayEnd) / 86400000);
    return (
      <span className="text-[10px] text-slate-500">
        Còn {daysLeft} ngày
      </span>
    );
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => col.statusList.includes(t.status));

        return (
          <div
            key={col.id}
            className={`w-72 shrink-0 rounded-2xl border ${col.color} p-3 flex flex-col max-h-[calc(100vh-280px)] shadow-2xs`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
              <div className="flex items-center space-x-1.5">
                {col.icon}
                <span className="font-bold text-xs text-slate-800">{col.label}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.badge}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Column Body - Cards List */}
            <div className="space-y-2.5 overflow-y-auto flex-1 custom-scrollbar pr-1">
              {colTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic text-[11px]">
                  Không có công việc
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="bg-white rounded-xl p-3 border border-slate-200/80 hover:border-blue-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
                  >
                    {/* Header: Code & Priority */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {task.code}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          task.priority === "urgent"
                            ? "bg-rose-100 text-rose-800"
                            : task.priority === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Title */}
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h5>

                    {/* Department & Project badge */}
                    <div className="flex flex-wrap gap-1">
                      {task.departmentName && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-medium flex items-center space-x-0.5">
                          <Building className="w-2.5 h-2.5" />
                          <span>{task.departmentName}</span>
                        </span>
                      )}
                      {task.project && (
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          📁 {task.project.code}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Tiến độ</span>
                        <span className="font-mono font-bold text-blue-600">
                          {task.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            task.progressPercent === 100 ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${task.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Assignee & Deadline & Quick Action */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[100px]">
                          {task.assigneeName || "Chưa gán"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        {getDeadlineBadge(task)}
                      </div>
                    </div>

                    {/* Extra Badges: BOM and Accept button */}
                    <div className="flex items-center justify-between pt-0.5">
                      {task.materialDemands && task.materialDemands.length > 0 && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium flex items-center space-x-0.5">
                          <Boxes className="w-2.5 h-2.5" />
                          <span>BOM: {task.materialDemands.length} VT</span>
                        </span>
                      )}

                      {task.status === "assigned" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcceptTask(task.id);
                          }}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold flex items-center space-x-1 cursor-pointer ml-auto"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Nhận việc</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
