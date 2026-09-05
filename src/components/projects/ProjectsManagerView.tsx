import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectTask,
  ProjectMaterialTicket,
  Persona,
  PERSONAS,
  Product,
  Customer,
  Employee,
  WeightedTaskStep,
} from "./types/projects.types";
import { projectsApi } from "../../features/projects/api/projectsApi";
import { useAuth } from "../../core/contexts/AuthContext";

// Subcomponents
import { ProjectPersonaBar } from "./components/persona/ProjectPersonaBar";
import { ProjectsViewHeader, ProjectSubTab } from "./components/header/ProjectsViewHeader";
import { ProjectsCardGrid } from "./components/projects-list/ProjectsCardGrid";
import { ProjectTasksView } from "./ProjectTasksView";
import { ProjectApprovalsTab } from "./components/approvals/ProjectApprovalsTab";
import { ProjectMaterialsTab } from "./components/materials/ProjectMaterialsTab";
import { ProjectBackupTab } from "./components/backup/ProjectBackupTab";
import { Project360DetailHub } from "./components/hub/Project360DetailHub";
import { ProjectModalsContainer } from "./modals/ProjectModalsContainer";

export { ProjectTasksView };
export { PERSONAS };
export type { Persona };

interface ProjectsManagerViewProps {
  products?: Product[];
  customers?: Customer[];
  employees?: Employee[];
  onNavigateTab?: (tab: string) => void;
  onRefreshGlobalData?: () => void;
}

export const ProjectsManagerView: React.FC<ProjectsManagerViewProps> = ({
  products = [],
  customers = [],
  employees = [],
  onRefreshGlobalData,
}) => {
  const { user: authUser } = useAuth();

  // Navigation & View States
  const [activeSubTab, setActiveSubTab] = useState<
    "tasks" | "projects" | "approvals" | "materials" | "backup"
  >("tasks");
  const [selectedProject360Id, setSelectedProject360Id] = useState<string | null>(null);

  // Persona Switcher
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);

  // Auto-sync persona with authenticated DB user if matched
  useEffect(() => {
    if (!authUser) return;
    const matchedByUsername = PERSONAS.find(
      (p) => p.username && p.username.toLowerCase() === authUser.username.toLowerCase()
    );
    if (matchedByUsername) {
      setCurrentPersona(matchedByUsername);
      return;
    }

    const roleStr = String(authUser.role || "").toLowerCase();
    if (roleStr === "admin" || roleStr === "super_admin") {
      const p = PERSONAS.find((x) => x.level === 4);
      if (p) setCurrentPersona(p);
    } else if (roleStr === "manager" || roleStr === "quanly") {
      const p = PERSONAS.find((x) => x.level === 3);
      if (p) setCurrentPersona(p);
    } else if (roleStr === "kcs" || roleStr === "qa" || roleStr === "qc") {
      const p = PERSONAS.find((x) => x.level === 2);
      if (p) setCurrentPersona(p);
    } else if (roleStr === "technician" || roleStr === "kythuat" || roleStr === "employee") {
      const p = PERSONAS.find((x) => x.level === 1);
      if (p) setCurrentPersona(p);
    }
  }, [authUser]);

  // Main Data States
  const [projects, setProjects] = useState<EnterpriseProject[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [materialTickets, setMaterialTickets] = useState<ProjectMaterialTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<EnterpriseProject | null>(null);

  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [targetTaskForApproval, setTargetTaskForApproval] = useState<ProjectTask | null>(null);
  const [approvalLevelToOpen, setApprovalLevelToOpen] = useState<number>(2);

  const [showReworkModal, setShowReworkModal] = useState<boolean>(false);
  const [targetTaskForRework, setTargetTaskForRework] = useState<ProjectTask | null>(null);

  const [showBorrowModal, setShowBorrowModal] = useState<boolean>(false);
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [targetTicketForReturn, setTargetTicketForReturn] = useState<ProjectMaterialTicket | null>(null);

  const [showSettleModal, setShowSettleModal] = useState<boolean>(false);
  const [targetTicketForSettle, setTargetTicketForSettle] = useState<ProjectMaterialTicket | null>(null);

  // Expanded task steps
  const [expandedTaskSteps, setExpandedTaskSteps] = useState<Record<string, boolean>>({
    "task-01": true,
    "task-02": true,
  });

  // Notifications
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotify = (text: string, type: "success" | "error" = "success") => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projsData, tasksData, ticketsData] = await Promise.all([
        projectsApi.getProjects(),
        projectsApi.getTasks(),
        projectsApi.getMaterialTickets(),
      ]);
      setProjects(projsData);
      setTasks(tasksData);
      setMaterialTickets(ticketsData);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu dự án:", err);
      showNotify(err.message || "Không thể tải dữ liệu dự án", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        Promise.all([
          projectsApi.getProjects(),
          projectsApi.getTasks(),
          projectsApi.getMaterialTickets(),
        ])
          .then(([projsData, tasksData, ticketsData]) => {
            setProjects(projsData);
            setTasks(tasksData);
            setMaterialTickets(ticketsData);
          })
          .catch(() => {});
      }
    }, 15000);
    return () => clearInterval(pollInterval);
  }, []);

  // Toggle Sub-step in task
  const handleToggleStep = async (task: ProjectTask, stepId: string) => {
    let steps: WeightedTaskStep[] = [];
    try {
      steps = task.weightedSteps ? JSON.parse(task.weightedSteps) : [];
    } catch (e) {
      steps = [];
    }

    if (steps.length === 0) return;

    const updatedSteps = steps.map((s) => {
      if (s.id === stepId) {
        const nextState = !s.isCompleted;
        return {
          ...s,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });

    try {
      const updated = await projectsApi.updateTaskSteps(
        task.id,
        updatedSteps,
        currentPersona.name
      );
      showNotify(`Đã cập nhật tiến độ công việc [${task.code}]!`);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (err: any) {
      showNotify(err.message || "Lỗi cập nhật bước công việc", "error");
    }
  };

  // Submit task for review (Cấp 1 -> Cấp 2)
  const handleSubmitForReview = async (task: ProjectTask) => {
    try {
      await projectsApi.submitTaskForReview(task.id, currentPersona.name);
      showNotify(`Đã nộp biên bản đề nghị KCS nghiệm thu cho [${task.code}]!`);
      fetchData();
    } catch (err: any) {
      showNotify(err.message || "Lỗi khi nộp biên bản", "error");
    }
  };

  // Delete Task
  const handleDeleteTask = async (task: ProjectTask) => {
    if (!window.confirm(`Bạn có chắc muốn xóa công việc [${task.code}] - "${task.title}" không?`)) {
      return;
    }
    try {
      await projectsApi.deleteTask(task.id);
      showNotify(`Đã xóa công việc [${task.code}] thành công!`);
      fetchData();
    } catch (err: any) {
      showNotify(err.message || "Lỗi khi xóa công việc", "error");
    }
  };

  // Delete Project
  const handleDeleteProject = async (project: EnterpriseProject) => {
    if (!window.confirm(`Bạn có chắc muốn xóa dự án "${project.name}" (${project.code}) không?`)) {
      return;
    }
    try {
      await projectsApi.deleteProject(project.id);
      showNotify(`Đã xóa dự án ${project.code} thành công!`);
      fetchData();
    } catch (err: any) {
      showNotify(err.message || "Lỗi khi xóa dự án", "error");
    }
  };

  // 360 Detail Hub View
  if (selectedProject360Id) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
        <Project360DetailHub
          projectId={selectedProject360Id}
          currentPersona={currentPersona}
          products={products}
          customers={customers}
          employees={employees}
          showNotify={showNotify}
          onOpenApprovalModal={(task, level) => { setTargetTaskForApproval(task); setApprovalLevelToOpen(level); setShowApprovalModal(true); }}
          onOpenReworkModal={(task) => { setTargetTaskForRework(task); setShowReworkModal(true); }}
          onEditTask={(task) => { setEditingTask(task); setShowTaskModal(true); }}
          onDeleteTask={handleDeleteTask}
          onAddNewTask={() => { setEditingTask(null); setShowTaskModal(true); }}
          onBack={() => { setSelectedProject360Id(null); fetchData(); }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-semibold transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-600 text-white border border-emerald-500 shadow-emerald-500/20"
              : "bg-rose-600 text-white border border-rose-500 shadow-rose-500/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* RBAC Persona Bar */}
      <ProjectPersonaBar
        currentPersona={currentPersona}
        authUser={authUser}
        onSelectPersona={(p) => {
          setCurrentPersona(p);
          showNotify(`Đã chuyển vai trò kiểm thử sang: ${p.name} (${p.title})`);
        }}
      />

      {/* Header Section */}
      <ProjectsViewHeader
        currentPersona={currentPersona}
        projects={projects}
        tasks={tasks}
        materialTickets={materialTickets}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        onOpenBorrowModal={() => setShowBorrowModal(true)}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setShowTaskModal(true);
        }}
        onOpenNewProjectModal={() => {
          setEditingProject(null);
          setShowProjectModal(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-600" />
            <span className="text-sm font-semibold">Đang tải dữ liệu dự án từ SQL Server...</span>
          </div>
        ) : (
          <>
            {activeSubTab === "tasks" && (
              <ProjectTasksView
                tasks={tasks}
                projects={projects}
                currentPersona={currentPersona}
                products={products}
                employees={employees}
                expandedTaskSteps={expandedTaskSteps}
                onToggleExpandedStep={(taskId) =>
                  setExpandedTaskSteps((prev) => ({
                    ...prev,
                    [taskId]: !prev[taskId],
                  }))
                }
                onToggleStep={handleToggleStep}
                onSubmitForReview={handleSubmitForReview}
                onOpenApprovalModal={(task, level) => {
                  setTargetTaskForApproval(task);
                  setApprovalLevelToOpen(level);
                  setShowApprovalModal(true);
                }}
                onOpenReworkModal={(task) => {
                  setTargetTaskForRework(task);
                  setShowReworkModal(true);
                }}
                onEditTask={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
                onDeleteTask={handleDeleteTask}
                onAddNewTask={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                onRefreshData={fetchData}
                onOpenReturnModal={(ticket) => {
                  setTargetTicketForReturn(ticket);
                  setShowReturnModal(true);
                }}
                onOpenOrderModal={(ticket) => {
                  setTargetTicketForSettle(ticket);
                  setShowSettleModal(true);
                }}
              />
            )}

            {activeSubTab === "projects" && (
              <ProjectsCardGrid
                projects={projects}
                currentPersona={currentPersona}
                onSelectProject360={(p) => setSelectedProject360Id(p.id)}
                onViewTasks={() => setActiveSubTab("tasks")}
                onEditProject={(p) => {
                  setEditingProject(p);
                  setShowProjectModal(true);
                }}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeSubTab === "approvals" && (
              <ProjectApprovalsTab
                tasks={tasks}
                currentPersona={currentPersona}
                onOpenApprovalModal={(task, level) => {
                  setTargetTaskForApproval(task);
                  setApprovalLevelToOpen(level);
                  setShowApprovalModal(true);
                }}
              />
            )}

            {activeSubTab === "materials" && (
              <ProjectMaterialsTab
                materialTickets={materialTickets}
                onOpenBorrowModal={() => setShowBorrowModal(true)}
                onOpenReturnModal={(tk) => {
                  setTargetTicketForReturn(tk);
                  setShowReturnModal(true);
                }}
                onOpenSettleModal={(tk) => {
                  setTargetTicketForSettle(tk);
                  setShowSettleModal(true);
                }}
              />
            )}

            {activeSubTab === "backup" && (
              <ProjectBackupTab
                projects={projects}
                tasks={tasks}
                materialTickets={materialTickets}
                onNotify={showNotify}
                onRefresh={fetchData}
              />
            )}
          </>
        )}
      </div>

      {/* Modals Container */}
      <ProjectModalsContainer
        projects={projects}
        tasks={tasks}
        products={products}
        customers={customers}
        employees={employees}
        currentPersona={currentPersona}
        showProjectModal={showProjectModal}
        editingProject={editingProject}
        onCloseProjectModal={() => setShowProjectModal(false)}
        onSuccessProjectModal={() => { setShowProjectModal(false); showNotify("Lưu thông tin dự án thành công!"); fetchData(); }}
        showTaskModal={showTaskModal}
        editingTask={editingTask}
        onCloseTaskModal={() => setShowTaskModal(false)}
        onSuccessTaskModal={() => { setShowTaskModal(false); showNotify("Lưu công việc thành công!"); fetchData(); }}
        showApprovalModal={showApprovalModal}
        targetTaskForApproval={targetTaskForApproval}
        approvalLevelToOpen={approvalLevelToOpen}
        onCloseApprovalModal={() => setShowApprovalModal(false)}
        onSuccessApprovalModal={() => { setShowApprovalModal(false); showNotify("Thực hiện phê duyệt nghiệm thu thành công!"); fetchData(); }}
        showReworkModal={showReworkModal}
        targetTaskForRework={targetTaskForRework}
        onCloseReworkModal={() => setShowReworkModal(false)}
        onSuccessReworkModal={() => { setShowReworkModal(false); showNotify(`Đã nộp lại biên bản khắc phục cho [${targetTaskForRework?.code || ""}]!`); fetchData(); }}
        showBorrowModal={showBorrowModal}
        onCloseBorrowModal={() => setShowBorrowModal(false)}
        onSuccessBorrowModal={() => { setShowBorrowModal(false); showNotify("Lập phiếu xuất mượn vật tư kho thành công!"); fetchData(); if (onRefreshGlobalData) onRefreshGlobalData(); }}
        showReturnModal={showReturnModal}
        targetTicketForReturn={targetTicketForReturn}
        onCloseReturnModal={() => setShowReturnModal(false)}
        onSuccessReturnModal={() => { setShowReturnModal(false); showNotify("Đã nhập hoàn trả vật tư thừa về kho!"); fetchData(); if (onRefreshGlobalData) onRefreshGlobalData(); }}
        showSettleModal={showSettleModal}
        targetTicketForSettle={targetTicketForSettle}
        onCloseSettleModal={() => setShowSettleModal(false)}
        onSuccessSettleModal={(orderCode) => { setShowSettleModal(false); showNotify(`Đã quyết toán thành công Đơn bán hàng POS: ${orderCode}!`); fetchData(); if (onRefreshGlobalData) onRefreshGlobalData(); }}
      />
    </div>
  );
};
