import React from "react";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lock,
  Edit3,
  PenTool,
} from "lucide-react";
import { ProjectTask, Persona } from "../../types/projects.types";

interface ProjectTaskApprovalsTabProps {
  task: ProjectTask;
  currentPersona: Persona;
  onOpenApprovalModal: (task: ProjectTask, level: number) => void;
  onOpenReworkModal: (task: ProjectTask) => void;
  onSubmitForReview: (task: ProjectTask) => void;
}

export const ProjectTaskApprovalsTab: React.FC<ProjectTaskApprovalsTabProps> = ({
  task,
  currentPersona,
  onOpenApprovalModal,
  onOpenReworkModal,
  onSubmitForReview,
}) => {
  const approvals = task.approvals || [];

  const kcsApproval = approvals.find((a) => a.level === 2);
  const pmApproval = approvals.find((a) => a.level === 3);
  const dirApproval = approvals.find((a) => a.level === 4);

  const canSubmitReview =
    currentPersona.level === 1 &&
    task.progressPercent === 100 &&
    task.status !== "review_pending" &&
    task.status !== "approved" &&
    task.status !== "completed";

  const canKcsApprove =
    currentPersona.level >= 2 &&
    (task.status === "review_pending" || task.status === "resubmitted") &&
    kcsApproval?.status !== "approved";

  const canPmApprove =
    currentPersona.level >= 3 &&
    kcsApproval?.status === "approved" &&
    pmApproval?.status !== "approved";

  const canDirApprove =
    currentPersona.level === 4 &&
    pmApproval?.status === "approved" &&
    dirApproval?.status !== "approved";

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Sequential 4-Level Pipeline Visual */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Quy Trình Nghiệm Thu & Ký Duyệt Phân Quyền 4 Cấp (RBAC)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Cấp 1 */}
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px]">Cấp 1: Thi Công</span>
              {task.progressPercent === 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <span className="text-[10px] text-slate-400">{task.progressPercent}%</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Kỹ thuật viên nộp nghiệm thu khi đạt 100%</p>
            {canSubmitReview && (
              <button
                onClick={() => onSubmitForReview(task)}
                className="w-full mt-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Nộp Nghiệm Thu
              </button>
            )}
          </div>

          {/* Cấp 2 */}
          <div
            className={`p-3 rounded-xl border space-y-1 ${
              kcsApproval?.status === "approved"
                ? "bg-emerald-50/70 border-emerald-200"
                : kcsApproval?.status === "rejected"
                ? "bg-rose-50/70 border-rose-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px]">Cấp 2: KCS / QA-QC</span>
              {kcsApproval?.status === "approved" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : kcsApproval?.status === "rejected" ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              ) : (
                <FileCheck2 className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <p className="text-[11px] text-slate-500">Kiểm tra hiện trường & đánh giá chất lượng</p>
            {canKcsApprove && (
              <button
                onClick={() => onOpenApprovalModal(task, 2)}
                className="w-full mt-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
              >
                KCS Ký Duyệt
              </button>
            )}
          </div>

          {/* Cấp 3 */}
          <div
            className={`p-3 rounded-xl border space-y-1 ${
              pmApproval?.status === "approved"
                ? "bg-emerald-50/70 border-emerald-200"
                : !kcsApproval || kcsApproval.status !== "approved"
                ? "bg-slate-100/70 border-slate-200 opacity-70"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px]">Cấp 3: Chỉ Huy Trưởng</span>
              {pmApproval?.status === "approved" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : !kcsApproval || kcsApproval.status !== "approved" ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              )}
            </div>
            <p className="text-[11px] text-slate-500">Duyệt kỹ thuật tổng thể (Khóa sau KCS)</p>
            {canPmApprove && (
              <button
                onClick={() => onOpenApprovalModal(task, 3)}
                className="w-full mt-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer"
              >
                PM Ký Duyệt
              </button>
            )}
          </div>

          {/* Cấp 4 */}
          <div
            className={`p-3 rounded-xl border space-y-1 ${
              dirApproval?.status === "approved"
                ? "bg-emerald-50/70 border-emerald-200"
                : !pmApproval || pmApproval.status !== "approved"
                ? "bg-slate-100/70 border-slate-200 opacity-70"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px]">Cấp 4: Ban Giám Đốc</span>
              {dirApproval?.status === "approved" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : !pmApproval || pmApproval.status !== "approved" ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <span className="text-amber-500">👑</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Nghiệm thu bàn giao & quyết toán POS</p>
            {canDirApprove && (
              <button
                onClick={() => onOpenApprovalModal(task, 4)}
                className="w-full mt-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Giám Đốc Duyệt
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Rework Alert Banner */}
      {task.status === "rework_required" && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Yêu Cầu Khắc Phục Lỗi (Punch List Cần Sửa)</span>
            </div>
            <button
              onClick={() => onOpenReworkModal(task)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
            >
              Nộp Lại Biên Bản
            </button>
          </div>
          {task.reworkReason && (
            <div className="text-rose-900 bg-white/70 p-2.5 rounded-xl border border-rose-200">
              {task.reworkReason}
            </div>
          )}
        </div>
      )}

      {/* 3. Existing Approval Records */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Lịch Sử Biên Bản Nghiệm Thu ({approvals.length})
        </h4>

        {approvals.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 italic">
            Chưa có biên bản nghiệm thu nào được ghi nhận.
          </div>
        ) : (
          <div className="space-y-2">
            {approvals.map((app) => (
              <div
                key={app.id}
                className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{app.approvalCode}</span>
                    <span className="text-slate-400">|</span>
                    <span className="font-semibold text-slate-700">{app.levelName || `Cấp ${app.level}`}</span>
                    <span className="text-slate-500">({app.reviewerName})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {app.qualityRating && (
                      <div className="flex text-amber-500">
                        {Array.from({ length: app.qualityRating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {app.status === "approved" ? "ĐẠT CHUẨN" : "TỪ CHỐI"}
                    </span>
                  </div>
                </div>

                {app.reviewNotes && (
                  <div className="text-slate-700 italic pl-2 border-l-2 border-slate-300">
                    "{app.reviewNotes}"
                  </div>
                )}

                {app.punchList && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                    <strong>Tồn đọng / Punch List:</strong> {app.punchList}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Phương thức: {app.approvalMethod === "pin" ? "Mã PIN bảo mật" : app.approvalMethod === "pki_ca" ? "Chứng thư số PKI-CA" : "Chữ ký tay cảm ứng"}</span>
                  <span>{new Date(app.createdAt).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
