import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Crown,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectTask,
  TaskDependency,
  Persona,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectGanttChartTabProps {
  project: EnterpriseProject;
  tasks: ProjectTask[];
  currentPersona: Persona;
  onRefresh: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const ProjectGanttChartTab: React.FC<ProjectGanttChartTabProps> = ({
  project,
  tasks,
  currentPersona,
  onRefresh,
  showNotify,
}) => {
  const [showAddDepModal, setShowAddDepModal] = useState(false);
  const [sourceTaskId, setSourceTaskId] = useState("");
  const [targetTaskId, setTargetTaskId] = useState("");
  const [depType, setDepType] = useState("FS");
  const [lagDays, setLagDays] = useState(0);

  // Tính toán timeline bao quát (Min Start Date -> Max Due Date)
  const timelineDates = useMemo(() => {
    let minTime = new Date(project.startDate).getTime();
    let maxTime = project.endDate
      ? new Date(project.endDate).getTime()
      : minTime + 60 * 86400000;

    tasks.forEach((t) => {
      if (t.startDate) {
        const s = new Date(t.startDate).getTime();
        if (s < minTime) minTime = s;
      }
      if (t.dueDate) {
        const d = new Date(t.dueDate).getTime();
        if (d > maxTime) maxTime = d;
      }
    });

    const daysCount = Math.max(15, Math.ceil((maxTime - minTime) / 86400000) + 5);
    const dates = [];
    for (let i = 0; i < daysCount; i++) {
      dates.push(new Date(minTime + i * 86400000));
    }
    return { minTime, maxTime, daysCount, dates };
  }, [project, tasks]);

  // Xác định các task thuộc đường găng (Critical Path: task có tiến độ chưa 100% và thời hạn cận nhất)
  const criticalTaskIds = useMemo(() => {
    const ids = new Set<string>();
    // Đơn giản hóa thuật toán CPM: các task có priority 'urgent' hoặc 'high' chưa hoàn thành
    tasks.forEach((t) => {
      if (t.priority === "urgent" || (t.priority === "high" && t.status !== "completed")) {
        ids.add(t.id);
      }
    });
    // Nếu chưa có, lấy các task có dependencies chuỗi
    tasks.forEach((t) => {
      if (t.dependencies && t.dependencies.length > 0) {
        ids.add(t.id);
        t.dependencies.forEach((d) => ids.add(d.dependsOnTaskId));
      }
    });
    return ids;
  }, [tasks]);

  const handleAddDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTaskId || !targetTaskId) {
      showNotify("Vui lòng chọn cả 2 công việc", "error");
      return;
    }
    if (sourceTaskId === targetTaskId) {
      showNotify("Công việc không thể phụ thuộc vào chính nó", "error");
      return;
    }
    try {
      await projectsApi.addTaskDependency(sourceTaskId, {
        dependsOnTaskId: targetTaskId,
        type: depType,
        lagDays,
      });
      showNotify("Thiết lập mối quan hệ phụ thuộc thành công!");
      setShowAddDepModal(false);
      onRefresh();
    } catch (err: any) {
      showNotify(err.message || "Lỗi tạo mối quan hệ phụ thuộc", "error");
    }
  };

  const getPositionForDate = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    const diff = time - timelineDates.minTime;
    const dayIndex = Math.max(0, diff / 86400000);
    return (dayIndex / timelineDates.daysCount) * 100;
  };

  const getWidthForTask = (startDateStr?: string | null, dueDateStr?: string | null) => {
    const s = startDateStr ? new Date(startDateStr).getTime() : timelineDates.minTime;
    const d = dueDateStr ? new Date(dueDateStr).getTime() : s + 3 * 86400000;
    const days = Math.max(1, (d - s) / 86400000);
    return Math.max(3, (days / timelineDates.daysCount) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <span>Biểu Đồ Tiến Độ Gantt & Phụ Thuộc (CPM Dynamic Gantt)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Quan hệ FS / SS
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Theo dõi đường găng (Critical Path màu đỏ), cột mốc kim cương và liên kết phụ thuộc giữa các đầu việc
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentPersona.level >= 2 && (
            <button
              onClick={() => setShowAddDepModal(true)}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Phụ Thuộc Công Việc</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Path Notice Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50 via-amber-50 to-white border border-rose-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5 text-rose-900">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
          <span>
            <b>Đường Găng (Critical Path - CPM):</b> Đang có <b>{criticalTaskIds.size} công việc trọng yếu</b>. Bất kỳ sự chậm trễ nào tại chuỗi công việc viền đỏ này sẽ trực tiếp làm lùi ngày hoàn tất của toàn bộ dự án!
          </span>
        </div>
        <span className="text-[11px] font-bold text-rose-700 shrink-0 ml-2">
          Thời lượng dự kiến: {timelineDates.daysCount} ngày
        </span>
      </div>

      {/* Gantt Chart Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Timeline Header */}
            <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 py-2.5 px-4 text-[11px] font-bold text-slate-600">
              <div className="col-span-4 flex items-center space-x-2">
                <span>Hạng Mục / Công Việc</span>
              </div>
              <div className="col-span-8 flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>{timelineDates.dates[0]?.toLocaleDateString("vi-VN")}</span>
                <span>
                  {timelineDates.dates[Math.floor(timelineDates.dates.length / 2)]?.toLocaleDateString("vi-VN")}
                </span>
                <span>
                  {timelineDates.dates[timelineDates.dates.length - 1]?.toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Chưa có công việc nào trong dự án này.
                </div>
              ) : (
                tasks.map((task) => {
                  const isCrit = criticalTaskIds.has(task.id);
                  const leftPos = getPositionForDate(task.startDate);
                  const barWidth = getWidthForTask(task.startDate, task.dueDate);
                  const hasDeps = task.dependencies && task.dependencies.length > 0;

                  return (
                    <div
                      key={task.id}
                      className="grid grid-cols-12 py-3 px-4 hover:bg-slate-50/70 transition-colors items-center text-xs"
                    >
                      {/* Left: Task Name & Code */}
                      <div className="col-span-4 pr-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              isCrit
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {task.code}
                          </span>
                          <span className="font-bold text-slate-900 truncate" title={task.title}>
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                          <span>{task.phase || "Khảo sát"}</span>
                          <span>•</span>
                          <span>Phụ trách: <b>{task.assigneeName || "Chưa giao"}</b></span>
                          {hasDeps && (
                            <span className="text-indigo-600 font-semibold">
                              (🔗 Phụ thuộc {task.dependencies?.length} việc)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Gantt Bar Track */}
                      <div className="col-span-8 relative h-8 bg-slate-50 rounded-lg flex items-center px-1">
                        {/* Task Bar */}
                        <div
                          className={`absolute h-6 rounded-md shadow-xs transition-all flex items-center px-2 text-[10px] font-bold text-white overflow-hidden ${
                            isCrit
                              ? "bg-gradient-to-r from-rose-500 to-amber-500 ring-2 ring-rose-400/40"
                              : task.status === "completed"
                              ? "bg-emerald-600"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600"
                          }`}
                          style={{
                            left: `${leftPos}%`,
                            width: `${barWidth}%`,
                          }}
                          title={`${task.title} - ${task.progressPercent}%`}
                        >
                          {/* Inner Progress fill */}
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-white/25"
                            style={{ width: `${task.progressPercent}%` }}
                          />
                          <span className="relative z-10 truncate">
                            {task.progressPercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Task Dependency */}
      {showAddDepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-4">
              Thiết Lập Phụ Thuộc Tiến Độ (Task Dependency)
            </h3>

            <form onSubmit={handleAddDependency} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Công việc sau (Successor Task) *
                </label>
                <select
                  required
                  value={sourceTaskId}
                  onChange={(e) => setSourceTaskId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                >
                  <option value="">-- Chọn công việc thực hiện sau --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phụ thuộc vào công việc tiên quyết (Predecessor) *
                </label>
                <select
                  required
                  value={targetTaskId}
                  onChange={(e) => setTargetTaskId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                >
                  <option value="">-- Chọn việc bắt buộc xong trước --</option>
                  {tasks
                    .filter((t) => t.id !== sourceTaskId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kiểu quan hệ *
                  </label>
                  <select
                    value={depType}
                    onChange={(e) => setDepType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="FS">Finish-to-Start (FS - Chuẩn)</option>
                    <option value="SS">Start-to-Start (SS)</option>
                    <option value="FF">Finish-to-Finish (FF)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Độ trễ ngày (Lag Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={lagDays}
                    onChange={(e) => setLagDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-800 text-xs">
                ℹ️ <b>Quy tắc Finish-to-Start:</b> Công việc trước bắt buộc phải nghiệm thu hoàn tất thì công việc sau mới được phép bắt đầu thi công.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDepModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Lưu Quan Hệ Phụ Thuộc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
