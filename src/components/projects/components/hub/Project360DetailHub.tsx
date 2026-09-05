import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FolderKanban,
  Clock,
  DollarSign,
  TrendingUp,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Camera,
  FileText,
  ShieldCheck,
  Building,
  RefreshCw,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectTask,
  Persona,
  Product,
  Customer,
  Employee,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";
import { ProjectOverviewTab } from "./ProjectOverviewTab";
import { ProjectGanttChartTab } from "./ProjectGanttChartTab";
import { ProjectCostingTab } from "./ProjectCostingTab";
import { ProjectProcurementTab } from "./ProjectProcurementTab";
import { ProjectBillingTab } from "./ProjectBillingTab";
import { ProjectSiteDiaryTab } from "./ProjectSiteDiaryTab";
import { ProjectVariationOrdersTab } from "./ProjectVariationOrdersTab";
import { ProjectTasksView } from "../../ProjectTasksView";

interface Project360DetailHubProps {
  projectId: string;
  currentPersona: Persona;
  products: Product[];
  customers: Customer[];
  employees: Employee[];
  onBack: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
  onOpenApprovalModal: (task: ProjectTask, level: number) => void;
  onOpenReworkModal: (task: ProjectTask) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onAddNewTask: () => void;
}

export type HubTabType =
  | "overview"
  | "gantt"
  | "costing"
  | "tasks"
  | "procurement"
  | "billing"
  | "sitediary"
  | "variationorders";

export const Project360DetailHub: React.FC<Project360DetailHubProps> = ({
  projectId,
  currentPersona,
  products,
  customers,
  employees,
  onBack,
  showNotify,
  onOpenApprovalModal,
  onOpenReworkModal,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
}) => {
  const [activeTab, setActiveTab] = useState<HubTabType>("overview");
  const [project, setProject] = useState<EnterpriseProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTaskSteps, setExpandedTaskSteps] = useState<Record<string, boolean>>({});

  const fetchProjectDetail = async () => {
    setIsLoading(true);
    try {
      const data = await projectsApi.getProjectById(projectId);
      setProject(data as EnterpriseProject);
    } catch (err: any) {
      showNotify(err.message || "Lỗi tải chi tiết dự án", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [projectId]);

  if (isLoading || !project) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="font-semibold">Đang tải Trung Tâm Điều Hành 360° Dự Án...</p>
      </div>
    );
  }

  const tasks = project.tasks || [];
  const evm = project.evm;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 mt-0.5"
              title="Quay lại danh sách dự án"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                  {project.code}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    project.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : project.status === "in_progress"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {project.status === "completed"
                    ? "Đã hoàn thành"
                    : project.status === "in_progress"
                    ? "Đang thi công"
                    : project.status === "planning"
                    ? "Lập kế hoạch"
                    : "Tạm dừng"}
                </span>

                {evm && (
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${
                      evm.status === "good"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : evm.status === "warning"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {evm.status === "good"
                      ? "🟢 Sức Khỏe Dự Án: Rất Tốt"
                      : evm.status === "warning"
                      ? "🟡 Sức Khỏe Dự Án: Chú Ý"
                      : "🔴 Sức Khỏe Dự Án: Nguy Cấp"}
                  </span>
                )}
              </div>

              <h1 className="text-xl font-black text-slate-900">
                {project.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Khách hàng: <b>{project.customerName}</b></span>
                </span>
                <span>•</span>
                <span>Chỉ huy trưởng: <b className="text-indigo-700">{project.managerName}</b></span>
                <span>•</span>
                <span>Thời gian: {project.startDate} {project.endDate ? `➔ ${project.endDate}` : ""}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={fetchProjectDetail}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Làm mới dữ liệu dự án"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Tổng Quan & EVM S-Curve</span>
          </button>

          <button
            onClick={() => setActiveTab("gantt")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "gantt"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Biểu Đồ Gantt & Phụ Thuộc</span>
          </button>

          <button
            onClick={() => setActiveTab("costing")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "costing"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Dự Toán CBS & Chi Phí Thực Tế</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "tasks"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>4. Danh Sách Công Việc ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("procurement")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "procurement"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>5. Vật Tư & Đặt Hàng PO</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "billing"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>6. Thu Tiền Theo Đợt & Biên Bản A-B</span>
          </button>

          <button
            onClick={() => setActiveTab("sitediary")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "sitediary"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>7. Nhật Ký Công Trường</span>
          </button>

          <button
            onClick={() => setActiveTab("variationorders")}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === "variationorders"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>8. Phát Sinh Ngoài HĐ (VO)</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && <ProjectOverviewTab project={project} />}

      {activeTab === "gantt" && (
        <ProjectGanttChartTab
          project={project}
          tasks={tasks}
          currentPersona={currentPersona}
          onRefresh={fetchProjectDetail}
          showNotify={showNotify}
        />
      )}

      {activeTab === "costing" && (
        <ProjectCostingTab
          project={project}
          currentPersona={currentPersona}
          onRefresh={fetchProjectDetail}
          showNotify={showNotify}
        />
      )}

      {activeTab === "tasks" && (
        <ProjectTasksView
          tasks={tasks}
          projects={[project]}
          currentPersona={currentPersona}
          expandedTaskSteps={expandedTaskSteps}
          onToggleExpandedStep={(taskId) =>
            setExpandedTaskSteps((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
          }
          onToggleStep={async (task, stepId) => {
            try {
              const currentSteps: any[] = task.weightedSteps
                ? typeof task.weightedSteps === "string"
                  ? JSON.parse(task.weightedSteps)
                  : task.weightedSteps
                : [];
              const updatedSteps = currentSteps.map((s) =>
                s.id === stepId
                  ? { ...s, isCompleted: !s.isCompleted, completedAt: new Date().toISOString() }
                  : s
              );
              await projectsApi.updateTaskSteps(task.id, updatedSteps, currentPersona.name);
              showNotify(`Đã cập nhật tiến độ công việc [${task.code}]!`);
              fetchProjectDetail();
            } catch (e: any) {
              showNotify(e.message || "Lỗi cập nhật tiến độ", "error");
            }
          }}
          onSubmitForReview={async (task) => {
            try {
              await projectsApi.submitTaskForReview(task.id, currentPersona.name);
              showNotify(`Đã nộp biên bản nghiệm thu cho [${task.code}], chuyển sang chờ KCS!`);
              fetchProjectDetail();
            } catch (e: any) {
              showNotify(e.message || "Lỗi nộp nghiệm thu", "error");
            }
          }}
          onOpenApprovalModal={onOpenApprovalModal}
          onOpenReworkModal={onOpenReworkModal}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onAddNewTask={onAddNewTask}
        />
      )}

      {activeTab === "procurement" && (
        <ProjectProcurementTab
          project={project}
          currentPersona={currentPersona}
          onRefresh={fetchProjectDetail}
          showNotify={showNotify}
        />
      )}

      {activeTab === "billing" && (
        <ProjectBillingTab
          project={project}
          currentPersona={currentPersona}
          onRefresh={fetchProjectDetail}
          showNotify={showNotify}
        />
      )}

      {activeTab === "sitediary" && (
        <ProjectSiteDiaryTab
          project={project}
          currentPersona={currentPersona}
          onRefresh={fetchProjectDetail}
          showNotify={showNotify}
        />
      )}

      {activeTab === "variationorders" && (
        <ProjectVariationOrdersTab
          project={project}
          currentPersona={currentPersona}
          onRefresh={fetchProjectDetail}
          showNotify={showNotify}
        />
      )}
    </div>
  );
};
