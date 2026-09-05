import React, { useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
  FolderKanban,
  Calendar,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import { EnterpriseProject, ProjectTask, Employee } from "../../types/projects.types";
import { ProjectTasksQuickStatusTabs } from "./ProjectTasksQuickStatusTabs";
import { ProjectTasksFilterChips } from "./ProjectTasksFilterChips";

export type QuickStatusGroup =
  | "all"
  | "waiting"
  | "active"
  | "blocked"
  | "review"
  | "rework"
  | "approved"
  | "completed";

export type DeadlineFilterType =
  | "all"
  | "overdue"
  | "today"
  | "this_week"
  | "this_month";

export type SortByType =
  | "createdAt_desc"
  | "dueDate_asc"
  | "priority_desc"
  | "progress_desc"
  | "progress_asc"
  | "title_asc";

export interface ProjectTasksFilterBarProps {
  projects: EnterpriseProject[];
  tasks: ProjectTask[];
  employees?: Employee[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  quickStatusTab: QuickStatusGroup;
  setQuickStatusTab: (tab: QuickStatusGroup) => void;
  assigneeFilter: string;
  setAssigneeFilter: (a: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  phaseFilter: string;
  setPhaseFilter: (ph: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (d: string) => void;
  deadlineFilter: DeadlineFilterType;
  setDeadlineFilter: (d: DeadlineFilterType) => void;
  sortBy: SortByType;
  setSortBy: (s: SortByType) => void;
  viewMode: "kanban" | "table";
  setViewMode: (v: "kanban" | "table") => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  onAddNewTask: () => void;
  assigneeList: { name: string; count: number }[];
  departmentsList: string[];
  phasesList: string[];
  filteredCount: number;
  totalCount: number;
  avgProgress: number;
  overdueCount: number;
}

export const ProjectTasksFilterBar: React.FC<ProjectTasksFilterBarProps> = ({
  projects,
  tasks,
  employees = [],
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  quickStatusTab,
  setQuickStatusTab,
  assigneeFilter,
  setAssigneeFilter,
  priorityFilter,
  setPriorityFilter,
  selectedProjectId,
  setSelectedProjectId,
  phaseFilter,
  setPhaseFilter,
  departmentFilter,
  setDepartmentFilter,
  deadlineFilter,
  setDeadlineFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onResetFilters,
  activeFiltersCount,
  onAddNewTask,
  assigneeList,
  departmentsList,
  phasesList,
  filteredCount,
  totalCount,
  avgProgress,
  overdueCount,
}) => {
  // Collapsible Advanced Filter Row State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Thống kê số lượng cho từng nhóm trạng thái
  const baseTasks =
    selectedProjectId === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProjectId);

  const statusCounts: Record<QuickStatusGroup, number> = {
    all: baseTasks.length,
    waiting: baseTasks.filter((t) => t.status === "todo" || t.status === "assigned").length,
    active: baseTasks.filter((t) => t.status === "in_progress" || t.status === "resubmitted").length,
    blocked: baseTasks.filter((t) => t.status === "blocked").length,
    review: baseTasks.filter((t) => t.status === "review_pending").length,
    rework: baseTasks.filter((t) => t.status === "rework_required").length,
    approved: baseTasks.filter((t) => t.status === "approved").length,
    completed: baseTasks.filter((t) => t.status === "completed").length,
  };

  // Đếm số lượng theo độ ưu tiên
  const priorityCounts = {
    urgent: baseTasks.filter((t) => t.priority === "urgent").length,
    high: baseTasks.filter((t) => t.priority === "high").length,
    normal: baseTasks.filter((t) => t.priority === "normal").length,
    low: baseTasks.filter((t) => t.priority === "low").length,
  };

  // Merge danh sách nhân sự từ DB và danh sách từ task
  const taskAssigneeMap = new Map<string, number>();
  assigneeList.forEach((a) => taskAssigneeMap.set(a.name.toLowerCase(), a.count));

  return (
    <div className="space-y-3">
      {/* 1. Quick Status Pills & Switch View Mode */}
      <ProjectTasksQuickStatusTabs
        quickStatusTab={quickStatusTab}
        setQuickStatusTab={(tab) => {
          setQuickStatusTab(tab);
          // Đồng bộ nếu user chọn tab nhanh
          if (tab === "all") setStatusFilter("all");
          else setStatusFilter(tab);
        }}
        statusCounts={statusCounts}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddNewTask={onAddNewTask}
      />

      {/* 2. Main Filter Row (Search + Status + Assignee + Priority + Advanced Toggle) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên việc, mã CV, người nhận..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* A. Lọc Trạng Thái (Status) */}
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              if (
                val === "all" ||
                val === "waiting" ||
                val === "active" ||
                val === "blocked" ||
                val === "review" ||
                val === "rework" ||
                val === "approved" ||
                val === "completed"
              ) {
                setQuickStatusTab(val as QuickStatusGroup);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="all">⚡ Trạng thái: Tất cả ({tasks.length})</option>
            <option value="waiting">⏳ Đang chờ nhận việc ({statusCounts.waiting})</option>
            <option value="in_progress">⚙️ Đang thực hiện ({statusCounts.active})</option>
            <option value="completed">✅ Đã hoàn thành ({statusCounts.completed})</option>
            <option value="blocked">⏸️ Tạm dừng / Vướng mắc ({statusCounts.blocked})</option>
            <option value="review">🔍 Chờ KCS duyệt ({statusCounts.review})</option>
            <option value="rework">⚠️ Yêu cầu sửa chữa ({statusCounts.rework})</option>
            <option value="approved">🛡️ Đã duyệt kỹ thuật ({statusCounts.approved})</option>
          </select>

          {/* B. Lọc Thành Viên Thực Hiện (Assignee - Real DB Employees) */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="all">👤 Thành viên: Tất cả</option>
            <option value="my_tasks">⭐ Việc của tôi</option>
            <option value="unassigned">⏳ Chưa phân công</option>

            {/* Render Real DB Employees */}
            {employees.length > 0 && (
              <optgroup label="── Nhân sự từ DB (dbo.NhanVien) ──">
                {employees.map((emp) => {
                  const empName = emp.name || "";
                  const count = taskAssigneeMap.get(empName.toLowerCase()) || 0;
                  return (
                    <option key={emp.id} value={empName}>
                      {emp.code ? `[${emp.code}] ` : ""}
                      {empName}
                      {emp.role ? ` (${emp.role})` : ""}
                      {count > 0 ? ` • ${count} việc` : ""}
                    </option>
                  );
                })}
              </optgroup>
            )}

            {/* Additional task assignees not in employees list */}
            {assigneeList.filter(
              (a) =>
                !employees.some(
                  (e) => (e.name || "").toLowerCase() === a.name.toLowerCase()
                )
            ).length > 0 && (
              <optgroup label="── Nhân sự khác trên công trình ──">
                {assigneeList
                  .filter(
                    (a) =>
                      !employees.some(
                        (e) => (e.name || "").toLowerCase() === a.name.toLowerCase()
                      )
                  )
                  .map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.count} việc)
                    </option>
                  ))}
              </optgroup>
            )}
          </select>

          {/* C. Lọc Độ Ưu Tiên (Priority) */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="all">🎯 Ưu tiên: Tất cả</option>
            <option value="urgent">🔥 Khẩn cấp ({priorityCounts.urgent})</option>
            <option value="high">⚡ Cao ({priorityCounts.high})</option>
            <option value="normal">🔹 Bình thường ({priorityCounts.normal})</option>
            <option value="low">▫️ Thấp ({priorityCounts.low})</option>
          </select>

          {/* Nút Bật/Tắt Bộ Lọc Nâng Cao */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
              isAdvancedOpen ||
              selectedProjectId !== "all" ||
              phaseFilter !== "all" ||
              departmentFilter !== "all" ||
              deadlineFilter !== "all" ||
              sortBy !== "createdAt_desc"
                ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Bộ lọc mở rộng</span>
            {isAdvancedOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Collapsible Advanced Filters Drawer */}
      {isAdvancedOpen && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2.5 animate-fadeIn">
          {/* Lọc Dự án */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center shrink-0">
              <FolderKanban className="w-3.5 h-3.5 text-slate-400 mr-1" />
              Dự án:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer max-w-[200px]"
            >
              <option value="all">Tất cả dự án ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Giai đoạn thi công (Phase) */}
          {phasesList.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center shrink-0">
                <Compass className="w-3.5 h-3.5 text-slate-400 mr-1" />
                Giai đoạn:
              </span>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả giai đoạn</option>
                {phasesList.map((ph) => (
                  <option key={ph} value={ph}>
                    {ph}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lọc Tổ đội / Phòng ban */}
          {departmentsList.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400 mr-1" />
                Tổ đội:
              </span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả tổ đội</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lọc Hạn chót SLA */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
              Hạn chót:
            </span>
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Tất cả thời hạn</option>
              <option value="overdue">🔴 Quá hạn (Overdue)</option>
              <option value="today">🟡 Hôm nay</option>
              <option value="this_week">🔵 Trong tuần này</option>
              <option value="this_month">⚪ Trong tháng này</option>
            </select>
          </div>

          {/* Sắp xếp (Sort by) */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="createdAt_desc">Mới nhất trước</option>
              <option value="dueDate_asc">Hạn chót gần nhất</option>
              <option value="priority_desc">Ưu tiên cao nhất</option>
              <option value="progress_desc">Tiến độ % cao nhất</option>
              <option value="progress_asc">Tiến độ % thấp nhất</option>
              <option value="title_asc">Tên công việc (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. Active Filters Chips & Result Counter */}
      <ProjectTasksFilterChips
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery("")}
        statusFilter={statusFilter}
        onClearStatus={() => {
          setStatusFilter("all");
          setQuickStatusTab("all");
        }}
        quickStatusTab={quickStatusTab}
        onClearQuickStatus={() => {
          setQuickStatusTab("all");
          setStatusFilter("all");
        }}
        assigneeFilter={assigneeFilter}
        onClearAssignee={() => setAssigneeFilter("all")}
        priorityFilter={priorityFilter}
        onClearPriority={() => setPriorityFilter("all")}
        selectedProjectId={selectedProjectId}
        onClearProject={() => setSelectedProjectId("all")}
        projects={projects}
        phaseFilter={phaseFilter}
        onClearPhase={() => setPhaseFilter("all")}
        departmentFilter={departmentFilter}
        onClearDepartment={() => setDepartmentFilter("all")}
        deadlineFilter={deadlineFilter}
        onClearDeadline={() => setDeadlineFilter("all")}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
        filteredCount={filteredCount}
        totalCount={totalCount}
        avgProgress={avgProgress}
        overdueCount={overdueCount}
      />
    </div>
  );
};
