import React, { useState, useMemo } from "react";
import {
  ProjectTask,
  EnterpriseProject,
  Product,
  Employee,
  WeightedTaskStep,
  Persona,
  RoleQueueFilter,
} from "./types/projects.types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { ProjectRoleActionBanner } from "./components/tasks/ProjectRoleActionBanner";
import {
  ProjectTasksFilterBar,
  QuickStatusGroup,
  DeadlineFilterType,
  SortByType,
} from "./components/tasks/ProjectTasksFilterBar";
import { ProjectTasksReminderWidget } from "./components/tasks/ProjectTasksReminderWidget";
import { ProjectTasksKanbanView } from "./components/tasks/ProjectTasksKanbanView";
import { ProjectTasksTableView } from "./components/tasks/ProjectTasksTableView";
import { ProjectTaskDetailDrawer } from "./components/tasks/ProjectTaskDetailDrawer";
import { TaskReassignModal } from "./modals/TaskReassignModal";

export interface ProjectTasksViewProps {
  tasks: ProjectTask[];
  projects: EnterpriseProject[];
  currentPersona: Persona;
  products?: Product[];
  employees?: Employee[];
  expandedTaskSteps?: Record<string, boolean>;
  onToggleExpandedStep?: (taskId: string) => void;
  onToggleStep: (task: ProjectTask, stepId: string) => void;
  onSubmitForReview: (task: ProjectTask) => void;
  onOpenApprovalModal: (task: ProjectTask, level: number) => void;
  onOpenReworkModal: (task: ProjectTask) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onAddNewTask: () => void;
  onRefreshData?: () => void;
  onOpenReturnModal?: (ticket: any) => void;
  onOpenOrderModal?: (ticket: any) => void;
}

export const ProjectTasksView: React.FC<ProjectTasksViewProps> = ({
  tasks,
  projects,
  currentPersona,
  products = [],
  employees = [],
  onToggleStep,
  onSubmitForReview,
  onOpenApprovalModal,
  onOpenReworkModal,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
  onRefreshData,
  onOpenReturnModal,
  onOpenOrderModal,
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quickStatusTab, setQuickStatusTab] = useState<QuickStatusGroup>("all");
  const [roleQueueFilter, setRoleQueueFilter] = useState<RoleQueueFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilterType>("all");
  const [sortBy, setSortBy] = useState<SortByType>("createdAt_desc");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Drawer and Modal States
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [reassigningTask, setReassigningTask] = useState<ProjectTask | null>(null);

  // Selected task reference (keeps in sync with updated tasks list)
  const selectedDrawerTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Extract assignees, departments and phases lists for filters
  const { assigneeList, departmentsList, phasesList } = useMemo(() => {
    const aMap = new Map<string, number>();
    const dSet = new Set<string>();
    const pSet = new Set<string>();

    tasks.forEach((t) => {
      const name = t.assigneeName?.trim();
      if (name) aMap.set(name, (aMap.get(name) || 0) + 1);
      if (t.departmentName?.trim()) dSet.add(t.departmentName.trim());
      if (t.phase?.trim()) pSet.add(t.phase.trim());
    });

    const aList = Array.from(aMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      assigneeList: aList,
      departmentsList: Array.from(dSet),
      phasesList: Array.from(pSet),
    };
  }, [tasks]);

  // SLA Deadline Checker
  const matchesDeadline = (task: ProjectTask, filter: DeadlineFilterType): boolean => {
    if (filter === "all") return true;
    if (!task.dueDate) return false;

    const due = new Date(task.dueDate).getTime();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    if (filter === "overdue") {
      return due < todayStart && task.status !== "completed";
    }
    if (filter === "today") {
      return due >= todayStart && due < todayEnd;
    }
    if (filter === "this_week") {
      const day = now.getDay() || 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).getTime();
      return due >= monday && due < monday + 7 * 86400000;
    }
    if (filter === "this_month") {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
      return due >= mStart && due < mEnd;
    }
    return true;
  };

  // Filter & Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (selectedProjectId !== "all" && task.projectId !== selectedProjectId) return false;

        // Status Filter Dropdown
        if (statusFilter !== "all") {
          if (statusFilter === "waiting" && task.status !== "todo" && task.status !== "assigned") return false;
          if (statusFilter === "in_progress" && task.status !== "in_progress" && task.status !== "resubmitted") return false;
          if (statusFilter === "completed" && task.status !== "completed") return false;
          if (statusFilter === "blocked" && task.status !== "blocked") return false;
          if (statusFilter === "review" && task.status !== "review_pending") return false;
          if (statusFilter === "rework" && task.status !== "rework_required") return false;
          if (statusFilter === "approved" && task.status !== "approved") return false;
          if (
            statusFilter !== "waiting" &&
            statusFilter !== "in_progress" &&
            statusFilter !== "completed" &&
            statusFilter !== "blocked" &&
            statusFilter !== "review" &&
            statusFilter !== "rework" &&
            statusFilter !== "approved" &&
            task.status !== statusFilter
          ) {
            return false;
          }
        }

        // Quick status pills (when statusFilter is "all")
        if (quickStatusTab !== "all" && statusFilter === "all") {
          if (quickStatusTab === "waiting" && task.status !== "todo" && task.status !== "assigned") return false;
          if (quickStatusTab === "active" && task.status !== "in_progress" && task.status !== "resubmitted") return false;
          if (quickStatusTab === "blocked" && task.status !== "blocked") return false;
          if (quickStatusTab === "review" && task.status !== "review_pending") return false;
          if (quickStatusTab === "rework" && task.status !== "rework_required") return false;
          if (quickStatusTab === "approved" && task.status !== "approved") return false;
          if (quickStatusTab === "completed" && task.status !== "completed") return false;
        }

        // Phase filter
        if (phaseFilter !== "all" && task.phase !== phaseFilter) return false;

        // Role Queue Quick Filter
        if (roleQueueFilter === "my_tasks") {
          const isMine =
            (task.assigneeName && task.assigneeName.toLowerCase().includes(currentPersona.name.toLowerCase())) ||
            (task.collaborators && task.collaborators.toLowerCase().includes(currentPersona.name.toLowerCase()));
          if (!isMine) return false;
        } else if (roleQueueFilter === "inspection_queue") {
          if (task.status !== "review_pending" && task.status !== "resubmitted") return false;
        } else if (roleQueueFilter === "dispatch_queue") {
          if (task.status !== "todo" && task.status !== "assigned" && task.status !== "blocked") return false;
        } else if (roleQueueFilter === "executive_queue") {
          if (task.status !== "approved" && !(task.status === "in_progress" && task.progressPercent >= 100)) return false;
        }

        // Assignee
        if (assigneeFilter === "my_tasks") {
          const isMine =
            (task.assigneeName && task.assigneeName.toLowerCase().includes(currentPersona.name.toLowerCase())) ||
            (task.collaborators && task.collaborators.toLowerCase().includes(currentPersona.name.toLowerCase()));
          if (!isMine) return false;
        } else if (assigneeFilter === "unassigned") {
          if (task.assigneeName && task.assigneeName.trim() !== "") return false;
        } else if (assigneeFilter !== "all" && task.assigneeName !== assigneeFilter) {
          return false;
        }

        // Department
        if (departmentFilter !== "all" && task.departmentName !== departmentFilter) return false;

        // Priority
        if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

        // Deadline
        if (!matchesDeadline(task, deadlineFilter)) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = task.code?.toLowerCase().includes(q);
          const matchTitle = task.title?.toLowerCase().includes(q);
          const matchAssignee = task.assigneeName?.toLowerCase().includes(q);
          const matchProject = task.project?.name?.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchAssignee && !matchProject) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "dueDate_asc") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "priority_desc") {
          const pOrder: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
          return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        }
        if (sortBy === "progress_desc") return b.progressPercent - a.progressPercent;
        if (sortBy === "progress_asc") return a.progressPercent - b.progressPercent;
        if (sortBy === "title_asc") return a.title.localeCompare(b.title);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    tasks,
    selectedProjectId,
    statusFilter,
    quickStatusTab,
    roleQueueFilter,
    assigneeFilter,
    phaseFilter,
    departmentFilter,
    priorityFilter,
    deadlineFilter,
    searchQuery,
    sortBy,
    currentPersona.name,
  ]);

  // Summary Metrics of filtered tasks
  const { avgProgress, overdueCount } = useMemo(() => {
    if (filteredAndSortedTasks.length === 0) return { avgProgress: 0, overdueCount: 0 };
    const totalProg = filteredAndSortedTasks.reduce((acc, t) => acc + (t.progressPercent || 0), 0);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const overdues = filteredAndSortedTasks.filter((t) => {
      if (!t.dueDate || t.status === "completed") return false;
      return new Date(t.dueDate).getTime() < todayStart;
    }).length;
    return {
      avgProgress: Math.round(totalProg / filteredAndSortedTasks.length),
      overdueCount: overdues,
    };
  }, [filteredAndSortedTasks]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedProjectId !== "all") count++;
    if (statusFilter !== "all") count++;
    else if (quickStatusTab !== "all") count++;
    if (roleQueueFilter !== "all") count++;
    if (assigneeFilter !== "all") count++;
    if (phaseFilter !== "all") count++;
    if (departmentFilter !== "all") count++;
    if (priorityFilter !== "all") count++;
    if (deadlineFilter !== "all") count++;
    return count;
  }, [
    searchQuery,
    selectedProjectId,
    statusFilter,
    quickStatusTab,
    roleQueueFilter,
    assigneeFilter,
    phaseFilter,
    departmentFilter,
    priorityFilter,
    deadlineFilter,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProjectId("all");
    setStatusFilter("all");
    setQuickStatusTab("all");
    setRoleQueueFilter("all");
    setAssigneeFilter("all");
    setPhaseFilter("all");
    setDepartmentFilter("all");
    setPriorityFilter("all");
    setDeadlineFilter("all");
    setSortBy("createdAt_desc");
  };

  // Task Workflow Handlers
  const handleAcceptTask = async (taskId: string) => {
    try {
      await projectsApi.acceptTask(taskId, { acceptedBy: currentPersona.name });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi nhận việc");
    }
  };

  const handleBlockTask = async (taskId: string) => {
    const reason = window.prompt("Nhập lý do tạm dừng thi công:", "Vướng mặt bằng / thiếu vật tư");
    if (!reason) return;
    try {
      await projectsApi.blockTask(taskId, { reason, updatedBy: currentPersona.name });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi tạm dừng");
    }
  };

  const handleUnblockTask = async (taskId: string) => {
    try {
      await projectsApi.unblockTask(taskId, { updatedBy: currentPersona.name });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi tiếp tục thi công");
    }
  };

  const handleUpdateSteps = async (task: ProjectTask, steps: WeightedTaskStep[]) => {
    try {
      await projectsApi.updateTaskSteps(task.id, steps, currentPersona.name);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật các bước");
    }
  };

  const handleAddProgressLog = async (taskId: string, data: any) => {
    try {
      await projectsApi.addProgressLog(taskId, data);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi ghi nhật ký tiến độ");
    }
  };

  return (
    <div className="space-y-4">
      {/* 0. Role Action & Filter Banner */}
      <ProjectRoleActionBanner
        currentPersona={currentPersona}
        roleQueueFilter={roleQueueFilter}
        onSelectRoleQueueFilter={(q) => setRoleQueueFilter(q)}
        tasks={tasks}
      />

      {/* 1. Smart Reminder Widget */}
      <ProjectTasksReminderWidget
        tasks={tasks}
        onSelectDeadlineFilter={(filter) => setDeadlineFilter(filter)}
        onSelectPriorityFilter={(p) => setPriorityFilter(p)}
      />

      {/* 2. Advanced Filters Bar */}
      <ProjectTasksFilterBar
        projects={projects}
        tasks={tasks}
        employees={employees}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        quickStatusTab={quickStatusTab}
        setQuickStatusTab={setQuickStatusTab}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        phaseFilter={phaseFilter}
        setPhaseFilter={setPhaseFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        deadlineFilter={deadlineFilter}
        setDeadlineFilter={setDeadlineFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onResetFilters={handleResetFilters}
        activeFiltersCount={activeFiltersCount}
        onAddNewTask={onAddNewTask}
        assigneeList={assigneeList}
        departmentsList={departmentsList}
        phasesList={phasesList}
        filteredCount={filteredAndSortedTasks.length}
        totalCount={tasks.length}
        avgProgress={avgProgress}
        overdueCount={overdueCount}
      />

      {/* 3. Main View: Kanban or Table */}
      {viewMode === "kanban" ? (
        <ProjectTasksKanbanView
          tasks={filteredAndSortedTasks}
          onSelectTask={(task) => setSelectedTaskId(task.id)}
          onAcceptTask={handleAcceptTask}
        />
      ) : (
        <ProjectTasksTableView
          tasks={filteredAndSortedTasks}
          onSelectTask={(task) => setSelectedTaskId(task.id)}
          onAcceptTask={handleAcceptTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {/* 4. Task 360° Detail Drawer */}
      {selectedDrawerTask && (
        <ProjectTaskDetailDrawer
          task={selectedDrawerTask}
          onClose={() => setSelectedTaskId(null)}
          currentPersona={currentPersona}
          products={products}
          onAcceptTask={handleAcceptTask}
          onOpenReassignModal={(task) => setReassigningTask(task)}
          onBlockTask={handleBlockTask}
          onUnblockTask={handleUnblockTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onToggleStep={onToggleStep}
          onUpdateSteps={handleUpdateSteps}
          onAddProgressLog={handleAddProgressLog}
          onOpenApprovalModal={onOpenApprovalModal}
          onOpenReworkModal={onOpenReworkModal}
          onSubmitForReview={onSubmitForReview}
          onRefreshTask={() => { if (onRefreshData) onRefreshData(); }}
          onOpenReturnModal={onOpenReturnModal}
          onOpenOrderModal={onOpenOrderModal}
        />
      )}

      {/* 5. Task Reassign Modal */}
      {reassigningTask && (
        <TaskReassignModal
          task={reassigningTask}
          employees={employees}
          currentUserName={currentPersona.name}
          onClose={() => setReassigningTask(null)}
          onSuccess={() => {
            setReassigningTask(null);
            if (onRefreshData) onRefreshData();
          }}
        />
      )}
    </div>
  );
};
