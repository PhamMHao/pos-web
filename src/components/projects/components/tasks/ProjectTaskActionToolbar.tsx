import React from "react";
import {
  UserCheck,
  Users,
  Pause,
  Play,
  Edit3,
  Trash2,
  FileCheck2,
  AlertTriangle,
  Send,
  RotateCcw,
  Lock,
} from "lucide-react";
import { ProjectTask, Persona } from "../../types/projects.types";

interface ProjectTaskActionToolbarProps {
  task: ProjectTask;
  currentPersona: Persona;
  isProcessing: boolean;
  onAccept: () => void;
  onOpenReassignModal: (task: ProjectTask) => void;
  onBlock: () => void;
  onUnblock: () => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
  onSubmitForReview: (task: ProjectTask) => void;
  onOpenApprovalModal: (task: ProjectTask, level: number) => void;
  onOpenReworkModal: (task: ProjectTask) => void;
}

export const ProjectTaskActionToolbar: React.FC<ProjectTaskActionToolbarProps> = ({
  task,
  currentPersona,
  isProcessing,
  onAccept,
  onOpenReassignModal,
  onBlock,
  onUnblock,
  onEditTask,
  onDeleteTask,
  onSubmitForReview,
  onOpenApprovalModal,
  onOpenReworkModal,
}) => {
  const { capabilities } = currentPersona;
  const approvals = task.approvals || [];
  const kcsApproval = approvals.find((a) => a.level === 2);
  const pmApproval = approvals.find((a) => a.level === 3);

  // Check if current persona can accept this task
  const canAccept =
    capabilities.canAcceptTask &&
    (task.status === "assigned" || task.status === "todo");

  // Check if current persona can submit for review (progress must be 100%)
  const isEligibleForReview =
    (task.status === "in_progress" || task.status === "resubmitted") &&
    task.progressPercent >= 100;

  // Check if KCS can review
  const canKcsInspect =
    capabilities.canInspectKcs &&
    (task.status === "review_pending" || task.status === "resubmitted");

  // Check if PM can sign Level 3
  const canPmApprove =
    capabilities.canApproveL3 &&
    kcsApproval?.status === "approved" &&
    pmApproval?.status !== "approved" &&
    task.status !== "completed";

  // Check if Director can sign Level 4
  const canDirectorApprove =
    capabilities.canApproveL4 &&
    pmApproval?.status === "approved" &&
    task.status !== "completed";

  return (
    <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {/* 1. Nút Nhận Việc (Cấp 1 & Thợ) */}
        {task.status === "assigned" && (
          <button
            onClick={onAccept}
            disabled={isProcessing || !capabilities.canAcceptTask}
            title={
              !capabilities.canAcceptTask
                ? "Chỉ Kỹ thuật viên phụ trách hoặc người có quyền mới được nhận việc"
                : "Tiếp nhận công việc và bắt đầu tính giờ thi công"
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all ${
              capabilities.canAcceptTask
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Nhận Việc Ngay</span>
          </button>
        )}

        {/* 2. Nút Nộp Nghiệm Thu (Cần 100% tiến độ) */}
        {(task.status === "in_progress" || task.status === "resubmitted") && (
          <button
            onClick={() => onSubmitForReview(task)}
            disabled={isProcessing || !isEligibleForReview}
            title={
              !isEligibleForReview
                ? `Chưa đạt 100% tiến độ (Hiện tại: ${task.progressPercent}%). Cần hoàn thành toàn bộ checklist.`
                : "Nộp biên bản đề nghị KCS nghiệm thu hiện trường"
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all ${
              isEligibleForReview
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Nghiệm Thu {task.progressPercent < 100 ? `(${task.progressPercent}%)` : "(100%)"}</span>
          </button>
        )}

        {/* 3. Nút KCS Kiểm Định Cấp 2 */}
        {canKcsInspect && (
          <>
            <button
              onClick={() => onOpenApprovalModal(task, 2)}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>KCS Nghiệm Thu (Cấp 2)</span>
            </button>

            {capabilities.canRejectRework && (
              <button
                onClick={() => onOpenReworkModal(task)}
                disabled={isProcessing}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Báo Lỗi (Punch List)</span>
              </button>
            )}
          </>
        )}

        {/* 4. Nút Nộp lại sau khắc phục nếu task bị trả về */}
        {task.status === "rework_required" && (
          <button
            onClick={() => onOpenReworkModal(task)}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Báo Cáo Khắc Phục Lỗi</span>
          </button>
        )}

        {/* 5. Nút PM Duyệt Cấp 3 */}
        {canPmApprove && (
          <button
            onClick={() => onOpenApprovalModal(task, 3)}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>PM Ký Duyệt (Cấp 3)</span>
          </button>
        )}

        {/* 6. Nút Giám Đốc Duyệt Cấp 4 */}
        {canDirectorApprove && (
          <button
            onClick={() => onOpenApprovalModal(task, 4)}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
          >
            <FileCheck2 className="w-4 h-4 text-purple-400" />
            <span>GĐ Duyệt Đóng Việc (Cấp 4)</span>
          </button>
        )}

        {/* 7. Nút Điều chuyển người (Chỉ PM/GĐ Level >= 3) */}
        <button
          onClick={() => onOpenReassignModal(task)}
          disabled={!capabilities.canAssignTask}
          title={
            !capabilities.canAssignTask
              ? "Chỉ Chỉ Huy Trưởng (PM) hoặc Ban Giám Đốc mới có quyền điều chuyển người phụ trách"
              : "Điều chuyển nhân sự phụ trách công việc"
          }
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
            capabilities.canAssignTask
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              : "bg-slate-50 text-slate-300 cursor-not-allowed"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Chuyển Người</span>
        </button>

        {/* 8. Tạm Dừng / Tiếp Tục Thi Công */}
        {task.status === "in_progress" && (
          <button
            onClick={onBlock}
            disabled={isProcessing || !capabilities.canBlockTask}
            title={
              !capabilities.canBlockTask
                ? "Bạn không có quyền báo sự cố tạm dừng thi công"
                : "Báo vướng mặt bằng, thiếu vật tư hoặc sự cố kỹ thuật"
            }
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-all ${
              capabilities.canBlockTask
                ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300 cursor-pointer"
                : "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
            }`}
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Tạm Dừng</span>
          </button>
        )}

        {task.status === "blocked" && (
          <button
            onClick={onUnblock}
            disabled={isProcessing || !capabilities.canUnblockTask}
            title={
              !capabilities.canUnblockTask
                ? "Chỉ PM hoặc người được phân quyền mới có thể khôi phục thi công sau tạm dừng"
                : "Xác nhận đã xử lý vướng mắc và tiếp tục thi công"
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition-all ${
              capabilities.canUnblockTask
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Tiếp Tục Thi Công</span>
          </button>
        )}
      </div>

      {/* Edit / Delete actions */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => onEditTask(task)}
          disabled={!capabilities.canCreateTask}
          className={`p-1.5 rounded-lg transition-colors ${
            capabilities.canCreateTask
              ? "text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
              : "text-slate-300 cursor-not-allowed"
          }`}
          title={capabilities.canCreateTask ? "Chỉnh sửa công việc" : "Không có quyền chỉnh sửa"}
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {currentPersona.level >= 3 && (
          <button
            onClick={() => onDeleteTask(task)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
            title="Xóa công việc (PM/GĐ)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
