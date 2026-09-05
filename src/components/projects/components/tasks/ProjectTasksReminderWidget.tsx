import React from "react";
import { AlertCircle, Clock, Flame, ArrowRight } from "lucide-react";
import { ProjectTask } from "../../types/projects.types";

interface ProjectTasksReminderWidgetProps {
  tasks: ProjectTask[];
  onSelectDeadlineFilter: (filter: "overdue" | "today" | "all") => void;
  onSelectPriorityFilter: (priority: "urgent" | "all") => void;
}

export const ProjectTasksReminderWidget: React.FC<ProjectTasksReminderWidgetProps> = ({
  tasks,
  onSelectDeadlineFilter,
  onSelectPriorityFilter,
}) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;

  // 1. Quá hạn
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "completed" || t.status === "cancelled") return false;
    return new Date(t.dueDate).getTime() < todayStart;
  });

  // 2. Đến hạn hôm nay
  const dueTodayTasks = tasks.filter((t) => {
    if (!t.dueDate || t.status === "completed" || t.status === "cancelled") return false;
    const dueTime = new Date(t.dueDate).getTime();
    return dueTime >= todayStart && dueTime < todayEnd;
  });

  // 3. Khẩn cấp (Urgent) đang làm
  const urgentTasks = tasks.filter(
    (t) =>
      t.priority === "urgent" &&
      t.status !== "completed" &&
      t.status !== "cancelled"
  );

  // 4. Bị tạm dừng (Blocked)
  const blockedTasks = tasks.filter((t) => t.status === "blocked");

  if (
    overdueTasks.length === 0 &&
    dueTodayTasks.length === 0 &&
    urgentTasks.length === 0 &&
    blockedTasks.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Cảnh báo quá hạn */}
      {overdueTasks.length > 0 && (
        <div
          onClick={() => onSelectDeadlineFilter("overdue")}
          className="bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-rose-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                Việc Quá Hạn
              </div>
              <div className="text-lg font-black text-rose-900 leading-tight">
                {overdueTasks.length}{" "}
                <span className="text-xs font-semibold text-rose-700">công việc</span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      )}

      {/* Đến hạn hôm nay */}
      {dueTodayTasks.length > 0 && (
        <div
          onClick={() => onSelectDeadlineFilter("today")}
          className="bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Đến Hạn Hôm Nay
              </div>
              <div className="text-lg font-black text-amber-900 leading-tight">
                {dueTodayTasks.length}{" "}
                <span className="text-xs font-semibold text-amber-700">công việc</span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      )}

      {/* Hỏa tốc / Khẩn cấp */}
      {urgentTasks.length > 0 && (
        <div
          onClick={() => onSelectPriorityFilter("urgent")}
          className="bg-purple-50 border border-purple-200 hover:border-purple-300 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-purple-600/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                Khẩn Cấp / Hỏa Tốc
              </div>
              <div className="text-lg font-black text-purple-900 leading-tight">
                {urgentTasks.length}{" "}
                <span className="text-xs font-semibold text-purple-700">công việc</span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      )}

      {/* Tạm dừng vướng mắc */}
      {blockedTasks.length > 0 && (
        <div className="bg-slate-100 border border-slate-300 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-base">⏸️</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Đang Tạm Dừng
              </div>
              <div className="text-lg font-black text-slate-900 leading-tight">
                {blockedTasks.length}{" "}
                <span className="text-xs font-semibold text-slate-600">vướng mắc</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
