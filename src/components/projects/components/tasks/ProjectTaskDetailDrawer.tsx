import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  Building,
  Flag,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  UserCheck,
  Edit3,
  Trash2,
  Boxes,
  FileCheck2,
  Layers,
} from "lucide-react";
import { ProjectTask, Product, WeightedTaskStep, Persona } from "../../types/projects.types";
import { ProjectTaskStepsTab } from "./ProjectTaskStepsTab";
import { ProjectTaskBomTab } from "./ProjectTaskBomTab";
import { ProjectTaskApprovalsTab } from "./ProjectTaskApprovalsTab";
import { ProjectTaskActionToolbar } from "./ProjectTaskActionToolbar";

interface ProjectTaskDetailDrawerProps {
  task: ProjectTask | null;
  onClose: () => void;
  currentPersona: Persona;
  products: Product[];
  onAcceptTask: (taskId: string) => Promise<void>;
  onOpenReassignModal: (task: ProjectTask) => void;
  onBlockTask: (taskId: string) => Promise<void>;
  onUnblockTask: (taskId: string) => Promise<void>;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onToggleStep: (task: ProjectTask, stepId: string) => void;
  onUpdateSteps: (task: ProjectTask, steps: WeightedTaskStep[]) => Promise<void>;
  onAddProgressLog: (taskId: string, data: any) => Promise<void>;
  onOpenApprovalModal: (task: ProjectTask, level: number) => void;
  onOpenReworkModal: (task: ProjectTask) => void;
  onSubmitForReview: (task: ProjectTask) => void;
  onRefreshTask: () => void;
  onOpenReturnModal?: (ticket: any) => void;
  onOpenOrderModal?: (ticket: any) => void;
}

export const ProjectTaskDetailDrawer: React.FC<ProjectTaskDetailDrawerProps> = ({
  task,
  onClose,
  currentPersona,
  products,
  onAcceptTask,
  onOpenReassignModal,
  onBlockTask,
  onUnblockTask,
  onEditTask,
  onDeleteTask,
  onToggleStep,
  onUpdateSteps,
  onAddProgressLog,
  onOpenApprovalModal,
  onOpenReworkModal,
  onSubmitForReview,
  onRefreshTask,
  onOpenReturnModal,
  onOpenOrderModal,
}) => {
  const [activeTab, setActiveTab] = useState<"steps" | "bom" | "approvals">("steps");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!task) return null;

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAcceptTask(task.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlock = async () => {
    const reason = window.prompt(
      "Nhập lý do tạm dừng thi công (VD: Thiếu vật tư, Chờ bàn giao mặt bằng...):",
      "Vướng mặt bằng thi công"
    );
    if (!reason) return;
    setIsProcessing(true);
    try {
      await onBlockTask(task.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblock = async () => {
    setIsProcessing(true);
    try {
      await onUnblockTask(task.id);
    } finally {
      setIsProcessing(false);
    }
  };

  // Lifecycle stage index calculation
  const getLifecycleStage = (status: string) => {
    switch (status) {
      case "todo":
        return 0;
      case "assigned":
        return 1;
      case "in_progress":
      case "blocked":
      case "rework_required":
      case "resubmitted":
        return 2;
      case "review_pending":
      case "approved":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  };
  const currentStage = getLifecycleStage(task.status);

  const stages = [
    { label: "1. Khởi tạo", desc: "Lập kế hoạch" },
    { label: "2. Giao việc", desc: "Chờ nhận việc" },
    { label: "3. Thi công", desc: "Trọng số %" },
    { label: "4. Nghiệm thu", desc: "KCS & PM" },
    { label: "5. Hoàn thành", desc: "Đóng việc" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {task.code}
              </span>
              {task.project && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  📁 {task.project.code}
                </span>
              )}
              {task.departmentName && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 flex items-center space-x-1">
                  <Building className="w-3 h-3" />
                  <span>{task.departmentName}</span>
                </span>
              )}
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  task.priority === "urgent"
                    ? "bg-rose-100 text-rose-800 font-black"
                    : task.priority === "high"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Ưu tiên: {task.priority}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 leading-snug">
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-slate-600 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <ProjectTaskActionToolbar
          task={task}
          currentPersona={currentPersona}
          isProcessing={isProcessing}
          onAccept={handleAccept}
          onOpenReassignModal={onOpenReassignModal}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onSubmitForReview={onSubmitForReview}
          onOpenApprovalModal={onOpenApprovalModal}
          onOpenReworkModal={onOpenReworkModal}
        />

        {/* Lifecycle Stepper */}
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200">
          <div className="grid grid-cols-5 gap-1 text-center">
            {stages.map((st, idx) => {
              const isPast = idx < currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div key={idx} className="space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isPast
                        ? "bg-emerald-500"
                        : isCurrent
                        ? "bg-blue-600"
                        : "bg-slate-200"
                    }`}
                  />
                  <div
                    className={`text-[11px] font-bold ${
                      isCurrent
                        ? "text-blue-700"
                        : isPast
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {st.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block">
                    {st.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Info Summary Cards */}
        <div className="p-4 bg-white border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Người Nhận Việc</div>
            <div className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>{task.assigneeName || "Chưa phân công"}</span>
            </div>
            {task.assignerName && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                Giao bởi: {task.assignerName}
              </div>
            )}
          </div>

          <div>
            <div className="text-slate-400 font-medium">Hạn Chót (Deadline)</div>
            <div className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                  : "Chưa đặt"}
              </span>
            </div>
            {task.estimatedHours && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                Ước tính: {task.estimatedHours}h
              </div>
            )}
          </div>

          <div>
            <div className="text-slate-400 font-medium">Tiến Độ Trọng Số</div>
            <div className="font-bold text-blue-600 text-sm font-mono mt-0.5">
              {task.progressPercent}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
              <div
                className="bg-blue-600 h-1 rounded-full"
                style={{ width: `${task.progressPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Trạng Thái Dòng Đời</div>
            <div className="font-bold text-slate-800 mt-0.5">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  task.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : task.status === "approved"
                    ? "bg-purple-100 text-purple-800"
                    : task.status === "review_pending"
                    ? "bg-amber-100 text-amber-800"
                    : task.status === "rework_required"
                    ? "bg-rose-100 text-rose-800"
                    : task.status === "blocked"
                    ? "bg-stone-200 text-stone-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {task.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 border-b border-slate-200 bg-slate-50 flex space-x-4">
          <button
            onClick={() => setActiveTab("steps")}
            className={`py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "steps"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tiến Độ & Trọng Số (%)</span>
          </button>

          <button
            onClick={() => setActiveTab("bom")}
            className={`py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "bom"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Vật Tư & Task BOM ({task.materialDemands?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`py-2.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "approvals"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Nghiệm Thu & Ký Duyệt ({task.approvals?.length || 0})</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "steps" && (
            <ProjectTaskStepsTab
              task={task}
              currentPersona={currentPersona}
              onToggleStep={onToggleStep}
              onUpdateSteps={onUpdateSteps}
              onAddProgressLog={onAddProgressLog}
            />
          )}

          {activeTab === "bom" && (
            <ProjectTaskBomTab
              task={task}
              products={products}
              onRefreshTask={onRefreshTask}
              onOpenReturnModal={onOpenReturnModal}
              onOpenOrderModal={onOpenOrderModal}
            />
          )}

          {activeTab === "approvals" && (
            <ProjectTaskApprovalsTab
              task={task}
              currentPersona={currentPersona}
              onOpenApprovalModal={onOpenApprovalModal}
              onOpenReworkModal={onOpenReworkModal}
              onSubmitForReview={onSubmitForReview}
            />
          )}
        </div>
      </div>
    </div>
  );
};
