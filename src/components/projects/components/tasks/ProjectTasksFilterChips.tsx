import React from "react";
import { X, RotateCcw, Filter, CheckCircle, AlertOctagon, TrendingUp } from "lucide-react";
import { QuickStatusGroup, DeadlineFilterType } from "./ProjectTasksFilterBar";
import { EnterpriseProject } from "../../types/projects.types";

interface ProjectTasksFilterChipsProps {
  searchQuery: string;
  onClearSearch: () => void;
  statusFilter: string;
  onClearStatus: () => void;
  quickStatusTab: QuickStatusGroup;
  onClearQuickStatus: () => void;
  assigneeFilter: string;
  onClearAssignee: () => void;
  priorityFilter: string;
  onClearPriority: () => void;
  selectedProjectId: string;
  onClearProject: () => void;
  projects: EnterpriseProject[];
  phaseFilter: string;
  onClearPhase: () => void;
  departmentFilter: string;
  onClearDepartment: () => void;
  deadlineFilter: DeadlineFilterType;
  onClearDeadline: () => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  avgProgress: number;
  overdueCount: number;
}

export const ProjectTasksFilterChips: React.FC<ProjectTasksFilterChipsProps> = ({
  searchQuery,
  onClearSearch,
  statusFilter,
  onClearStatus,
  quickStatusTab,
  onClearQuickStatus,
  assigneeFilter,
  onClearAssignee,
  priorityFilter,
  onClearPriority,
  selectedProjectId,
  onClearProject,
  projects,
  phaseFilter,
  onClearPhase,
  departmentFilter,
  onClearDepartment,
  deadlineFilter,
  onClearDeadline,
  activeFiltersCount,
  onResetFilters,
  filteredCount,
  totalCount,
  avgProgress,
  overdueCount,
}) => {
  if (activeFiltersCount === 0 && filteredCount === totalCount) {
    return (
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center space-x-1 font-medium">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Toàn bộ {totalCount} công việc đang hiển thị</span>
        </span>
        <span className="flex items-center space-x-1 text-slate-500 font-semibold">
          <TrendingUp className="w-3 h-3 text-blue-500" />
          <span>Tiến độ trung bình: {avgProgress}%</span>
        </span>
      </div>
    );
  }

  // Helper labels
  const getStatusLabel = (s: string) => {
    switch (s) {
      case "waiting":
        return "Đang chờ (Todo / Assigned)";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "blocked":
        return "Tạm dừng";
      case "review":
        return "Chờ KCS duyệt";
      case "rework":
        return "Yêu cầu sửa chữa";
      case "approved":
        return "Đã duyệt kỹ thuật";
      default:
        return s;
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case "urgent":
        return "🔥 Khẩn cấp (Urgent)";
      case "high":
        return "⚡ Cao (High)";
      case "normal":
        return "🔹 Bình thường";
      case "low":
        return "▫️ Thấp";
      default:
        return p;
    }
  };

  const getDeadlineLabel = (d: DeadlineFilterType) => {
    switch (d) {
      case "overdue":
        return "🔴 Quá hạn";
      case "today":
        return "🟡 Hôm nay";
      case "this_week":
        return "🔵 Tuần này";
      case "this_month":
        return "⚪ Tháng này";
      default:
        return d;
    }
  };

  const currentProjectName =
    selectedProjectId !== "all"
      ? projects.find((p) => p.id === selectedProjectId)?.name || selectedProjectId
      : null;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Active Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-500 flex items-center mr-1">
          <Filter className="w-3 h-3 text-blue-600 mr-1" />
          Đang lọc:
        </span>

        {/* Search Chip */}
        {searchQuery.trim() && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-[11px] font-semibold shadow-2xs">
            <span>Từ khóa: "{searchQuery}"</span>
            <button onClick={onClearSearch} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Status Dropdown Chip */}
        {statusFilter !== "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
            <span>Trạng thái: {getStatusLabel(statusFilter)}</span>
            <button onClick={onClearStatus} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Quick Status Tab Chip (if not redundant with statusFilter) */}
        {quickStatusTab !== "all" && statusFilter === "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold">
            <span>Nhóm: {getStatusLabel(quickStatusTab)}</span>
            <button onClick={onClearQuickStatus} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Assignee Chip */}
        {assigneeFilter !== "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span>
              Thành viên:{" "}
              {assigneeFilter === "my_tasks"
                ? "⭐ Việc của tôi"
                : assigneeFilter === "unassigned"
                ? "⏳ Chưa giao"
                : assigneeFilter}
            </span>
            <button onClick={onClearAssignee} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Priority Chip */}
        {priorityFilter !== "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
            <span>Ưu tiên: {getPriorityLabel(priorityFilter)}</span>
            <button onClick={onClearPriority} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Project Chip */}
        {currentProjectName && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-semibold">
            <span>Dự án: {currentProjectName}</span>
            <button onClick={onClearProject} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Phase Chip */}
        {phaseFilter !== "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-semibold">
            <span>Giai đoạn: {phaseFilter}</span>
            <button onClick={onClearPhase} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Department Chip */}
        {departmentFilter !== "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-semibold">
            <span>Tổ đội: {departmentFilter}</span>
            <button onClick={onClearDepartment} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Deadline Chip */}
        {deadlineFilter !== "all" && (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
            <span>Hạn chót: {getDeadlineLabel(deadlineFilter)}</span>
            <button onClick={onClearDeadline} className="hover:text-rose-600 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg transition-all cursor-pointer ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Đặt lại ({activeFiltersCount})</span>
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center space-x-3 text-[11px] text-slate-500 shrink-0 font-medium">
        <span className="flex items-center space-x-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            <b>{filteredCount}</b> / {totalCount} công việc
          </span>
        </span>

        <span className="flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>TB: <b>{avgProgress}%</b></span>
        </span>

        {overdueCount > 0 && (
          <span className="flex items-center space-x-1 text-rose-600 font-bold">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>{overdueCount} quá hạn</span>
          </span>
        )}
      </div>
    </div>
  );
};
