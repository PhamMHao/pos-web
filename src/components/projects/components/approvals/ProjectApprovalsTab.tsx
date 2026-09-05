import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Crown,
  Lock,
  X,
  AlertTriangle,
  Filter,
  Check,
} from "lucide-react";
import { ProjectTask, Persona } from "../../types/projects.types";

interface ProjectApprovalsTabProps {
  tasks: ProjectTask[];
  currentPersona: Persona;
  onOpenApprovalModal: (task: ProjectTask, level: number) => void;
}

type ApprovalFilterStatus = "all" | "kcs_pending" | "pm_pending" | "director_pending" | "rework" | "completed";

export const ProjectApprovalsTab: React.FC<ProjectApprovalsTabProps> = ({
  tasks,
  currentPersona,
  onOpenApprovalModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<ApprovalFilterStatus>("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const approvals = t.approvals || [];
      const kcsApp = approvals.find((a) => a.level === 2 && a.status === "approved");
      const pmApp = approvals.find((a) => a.level === 3 && a.status === "approved");
      const dirApp = approvals.find((a) => a.level === 4 && a.status === "approved");

      if (filterStatus === "kcs_pending") {
        return (t.status === "review_pending" || t.status === "resubmitted") && !kcsApp;
      }
      if (filterStatus === "pm_pending") {
        return Boolean(kcsApp && !pmApp && t.status !== "completed");
      }
      if (filterStatus === "director_pending") {
        return Boolean(pmApp && !dirApp && t.status !== "completed");
      }
      if (filterStatus === "rework") {
        return t.status === "rework_required";
      }
      if (filterStatus === "completed") {
        return t.status === "completed" || Boolean(dirApp);
      }
      return true;
    });
  }, [tasks, filterStatus]);

  // Quick statistics
  const stats = useMemo(() => {
    let kcsPending = 0;
    let pmPending = 0;
    let dirPending = 0;
    let rework = 0;
    let completed = 0;

    tasks.forEach((t) => {
      const approvals = t.approvals || [];
      const kcsApp = approvals.find((a) => a.level === 2 && a.status === "approved");
      const pmApp = approvals.find((a) => a.level === 3 && a.status === "approved");
      const dirApp = approvals.find((a) => a.level === 4 && a.status === "approved");

      if ((t.status === "review_pending" || t.status === "resubmitted") && !kcsApp) kcsPending++;
      if (kcsApp && !pmApp && t.status !== "completed") pmPending++;
      if (pmApp && !dirApp && t.status !== "completed") dirPending++;
      if (t.status === "rework_required") rework++;
      if (t.status === "completed" || dirApp) completed++;
    });

    return { kcsPending, pmPending, dirPending, rework, completed };
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Hàng Đợi Nghiệm Thu & Ký Duyệt Phân Quyền Cấp Bậc (Hierarchical Sign-Off)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình khóa tuần tự: Cấp 1 (100% Checklist) ➔ Cấp 2 (KCS duyệt hiện trường) ➔ Cấp 3 (Chỉ huy trưởng) ➔ Cấp 4 (Ban Giám Đốc đóng việc).
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-500">Mã PIN Ký Số:</span>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 font-mono font-bold text-indigo-700 text-xs">
            123456
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "Tất cả", count: tasks.length },
          { id: "kcs_pending", label: "Chờ KCS Cấp 2", count: stats.kcsPending, color: "text-amber-600" },
          { id: "pm_pending", label: "Chờ PM Cấp 3", count: stats.pmPending, color: "text-purple-600" },
          { id: "director_pending", label: "Chờ Ban GĐ Cấp 4", count: stats.dirPending, color: "text-rose-600" },
          { id: "rework", label: "Lỗi Punch List", count: stats.rework, color: "text-red-600" },
          { id: "completed", label: "Đã Hoàn Thành", count: stats.completed, color: "text-emerald-600" },
        ].map((tab) => {
          const isSelected = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as ApprovalFilterStatus)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List of Tasks eligible for approval */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider bg-slate-50 flex items-center justify-between">
          <span>Hạng Mục Thi Công & Nhật Ký Ký Duyệt</span>
          <span className="text-slate-500 text-[11px] font-normal">
            Tài khoản hiện tại: <b className="text-slate-800">{currentPersona.name}</b> ({currentPersona.title})
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-medium">
              Không có hạng mục công việc nào trong hàng đợi này.
            </div>
          ) : (
            filteredTasks.map((t) => {
              const approvals = t.approvals || [];
              const kcsApp = approvals.find((a) => a.level === 2 && a.status === "approved");
              const pmApp = approvals.find((a) => a.level === 3 && a.status === "approved");
              const dirApp = approvals.find((a) => a.level === 4 && a.status === "approved");

              // Determine active sign action for this persona
              let targetLevelToOpen = 2;
              let isMyTurnToSign = false;
              if (currentPersona.level === 2 && (!kcsApp || t.status === "review_pending" || t.status === "resubmitted")) {
                targetLevelToOpen = 2;
                isMyTurnToSign = true;
              } else if (currentPersona.level === 3 && kcsApp && !pmApp) {
                targetLevelToOpen = 3;
                isMyTurnToSign = true;
              } else if (currentPersona.level === 4 && pmApp && !dirApp) {
                targetLevelToOpen = 4;
                isMyTurnToSign = true;
              }

              return (
                <div
                  key={t.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {t.code}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{t.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : t.status === "approved"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : t.status === "rework_required"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : t.status === "review_pending" || t.status === "resubmitted"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {t.status === "completed"
                          ? "Hoàn Thành (Cấp 4 Đã Ký)"
                          : t.status === "approved"
                          ? "Đã Duyệt Kỹ Thuật (Cấp 3)"
                          : t.status === "rework_required"
                          ? "Yêu Cầu Sửa Chữa (Punch List)"
                          : t.status === "resubmitted"
                          ? "Đã Nộp Lại Sửa Chữa"
                          : t.status === "review_pending"
                          ? "Chờ KCS Nghiệm Thu"
                          : "Đang Thi Công"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>
                        Dự án: <b className="text-slate-800">{t.project?.name || "Dự án chung"}</b>
                      </span>
                      <span>
                        Phụ trách: <b className="text-indigo-700">{t.assigneeName || "Chưa giao"}</b>
                      </span>
                      <span>
                        Tiến độ checklist: <b className="text-blue-600">{t.progressPercent}%</b>
                      </span>
                    </div>

                    {/* Hierarchical Progress Flow Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {/* Cấp 2 KCS */}
                      <div
                        className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                          kcsApp
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                            : t.status === "rework_required"
                            ? "bg-rose-50 border-rose-200 text-rose-800 font-semibold"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        {kcsApp ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : t.status === "rework_required" ? (
                          <X className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>
                          Cấp 2 (KCS):{" "}
                          {kcsApp
                            ? kcsApp.reviewerName
                            : t.status === "rework_required"
                            ? "Từ chối / Punch List"
                            : "Chờ nghiệm thu"}
                        </span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

                      {/* Cấp 3 Chỉ huy trưởng */}
                      <div
                        className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                          pmApp
                            ? "bg-purple-50 border-purple-200 text-purple-800 font-semibold"
                            : kcsApp
                            ? "bg-amber-50 border-amber-200 text-amber-800 font-semibold"
                            : "bg-slate-100 border-slate-200 text-slate-400"
                        }`}
                      >
                        {pmApp ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        ) : kcsApp ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>
                          Cấp 3 (PM):{" "}
                          {pmApp ? pmApp.reviewerName : kcsApp ? "Chờ PM duyệt" : "Khóa"}
                        </span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

                      {/* Cấp 4 Giám đốc */}
                      <div
                        className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                          dirApp
                            ? "bg-rose-50 border-rose-200 text-rose-800 font-bold"
                            : pmApp
                            ? "bg-amber-50 border-amber-200 text-amber-800 font-semibold"
                            : "bg-slate-100 border-slate-200 text-slate-400"
                        }`}
                      >
                        {dirApp ? (
                          <Crown className="w-3.5 h-3.5 text-rose-600" />
                        ) : pmApp ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>
                          Cấp 4 (GĐ):{" "}
                          {dirApp ? dirApp.reviewerName : pmApp ? "Chờ GĐ ký đóng" : "Khóa"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onOpenApprovalModal(t, targetLevelToOpen)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-all ${
                        isMyTurnToSign
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-500/20 ring-2 ring-indigo-400/40"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>{isMyTurnToSign ? `Ký Duyệt Cấp ${targetLevelToOpen} Ngay` : "Xem Biên Bản Nghiệm Thu"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
