import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Send,
  Camera,
  AlertCircle,
  Clock,
  User,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { ProjectTask, WeightedTaskStep, Persona } from "../../types/projects.types";

interface ProjectTaskStepsTabProps {
  task: ProjectTask;
  currentPersona: Persona;
  onToggleStep: (task: ProjectTask, stepId: string) => void;
  onUpdateSteps: (task: ProjectTask, steps: WeightedTaskStep[]) => Promise<void>;
  onAddProgressLog: (
    taskId: string,
    data: {
      updatedBy: string;
      newPercent: number;
      workLogContent: string;
      issuesFaced?: string;
      attachments?: string[];
    }
  ) => Promise<void>;
}

export const ProjectTaskStepsTab: React.FC<ProjectTaskStepsTabProps> = ({
  task,
  currentPersona,
  onToggleStep,
  onUpdateSteps,
  onAddProgressLog,
}) => {
  // Parse steps
  const steps: WeightedTaskStep[] = React.useMemo(() => {
    if (!task.weightedSteps) return [];
    try {
      return typeof task.weightedSteps === "string"
        ? JSON.parse(task.weightedSteps)
        : task.weightedSteps;
    } catch (e) {
      return [];
    }
  }, [task.weightedSteps]);

  // New step input
  const [newStepName, setNewStepName] = useState("");
  const [newStepWeight, setNewStepWeight] = useState("20");
  const [isAddingStep, setIsAddingStep] = useState(false);

  // New progress log input
  const [logPercent, setLogPercent] = useState<number>(task.progressPercent || 0);
  const [logContent, setLogContent] = useState("");
  const [issuesFaced, setIssuesFaced] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const completedWeight = steps.reduce(
    (sum, s) => sum + (s.isCompleted ? Number(s.weight) || 0 : 0),
    0
  );
  const totalWeight = steps.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);

  const handleAddStep = async () => {
    if (!newStepName.trim()) return;
    const nextSteps = [
      ...steps,
      {
        id: `step-${Date.now()}`,
        name: newStepName.trim(),
        weight: Number(newStepWeight) || 20,
        isCompleted: false,
      },
    ];
    await onUpdateSteps(task, nextSteps);
    setNewStepName("");
    setNewStepWeight("20");
    setIsAddingStep(false);
  };

  const handleRemoveStep = async (stepId: string) => {
    const nextSteps = steps.filter((s) => s.id !== stepId);
    await onUpdateSteps(task, nextSteps);
  };

  const handleSubmitProgressLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;

    setIsSubmittingLog(true);
    try {
      await onAddProgressLog(task.id, {
        updatedBy: currentPersona.name,
        newPercent: Number(logPercent),
        workLogContent: logContent.trim(),
        issuesFaced: issuesFaced.trim() || undefined,
        attachments: photoUrl.trim() ? [photoUrl.trim()] : undefined,
      });
      setLogContent("");
      setIssuesFaced("");
      setPhotoUrl("");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="space-y-5 text-xs">
      {/* 1. Weighted Steps Checklist Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Các Bước Kỹ Thuật Có Trọng Số (%)
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                completedWeight === 100
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              Đã hoàn thành: {completedWeight}% / {totalWeight}%
            </span>
            <button
              type="button"
              onClick={() => setIsAddingStep(!isAddingStep)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm bước</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              completedWeight === 100 ? "bg-emerald-500" : "bg-blue-600"
            }`}
            style={{ width: `${Math.min(100, completedWeight)}%` }}
          />
        </div>

        {/* Add Step Inline Form */}
        {isAddingStep && (
          <div className="flex gap-2 p-2 bg-white rounded-xl border border-slate-300">
            <input
              type="text"
              placeholder="Tên bước kỹ thuật (VD: Kéo cáp & bấm hạt mạng)..."
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none"
            />
            <input
              type="number"
              placeholder="Trọng số %"
              value={newStepWeight}
              onChange={(e) => setNewStepWeight(e.target.value)}
              className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center focus:bg-white focus:outline-none"
            />
            <button
              onClick={handleAddStep}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer"
            >
              Lưu
            </button>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-1.5">
          {steps.length === 0 ? (
            <div className="py-4 text-center text-slate-400 italic">
              Chưa có phân rã bước kỹ thuật. Bấm "Thêm bước" để thiết lập.
            </div>
          ) : (
            steps.map((s, idx) => (
              <div
                key={s.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  s.isCompleted
                    ? "bg-emerald-50/70 border-emerald-200 text-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div
                  onClick={() => onToggleStep(task, s.id)}
                  className="flex items-center space-x-2.5 flex-1 cursor-pointer select-none"
                >
                  {s.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span
                    className={`font-semibold ${
                      s.isCompleted ? "line-through text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {idx + 1}. {s.name}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      s.isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {s.weight}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Log Progress Update Form */}
      <form
        onSubmit={handleSubmitProgressLog}
        className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Send className="w-4 h-4 text-blue-600" />
            <span>Ghi Nhật Ký Thi Công & Tiến Độ Ca</span>
          </h4>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Tiến độ cập nhật:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={logPercent}
              onChange={(e) => setLogPercent(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg bg-slate-50 border border-slate-300 text-center font-bold text-blue-700"
            />
            <span className="font-bold text-slate-600">%</span>
          </div>
        </div>

        <div>
          <textarea
            required
            rows={2}
            placeholder="Nội dung công việc đã hoàn thành trong ca..."
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Khó khăn / vướng mắc hiện trường (nếu có)..."
            value={issuesFaced}
            onChange={(e) => setIssuesFaced(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Camera className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                placeholder="Link ảnh hiện trường (URL)..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingLog}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs shadow-blue-600/30 transition-all"
            >
              {isSubmittingLog ? "Đang lưu..." : "Ghi Nhật Ký"}
            </button>
          </div>
        </div>
      </form>

      {/* 3. Progress Logs Timeline */}
      <div className="space-y-2">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Lịch Sử Báo Cáo Tiến Độ & Hiện Trường ({task.progressLogs?.length || 0})
        </h4>

        {(!task.progressLogs || task.progressLogs.length === 0) ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 italic">
            Chưa có ghi chép nhật ký nào cho công việc này.
          </div>
        ) : (
          <div className="space-y-2">
            {task.progressLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      {log.updatedBy.slice(0, 1)}
                    </div>
                    <span className="font-bold text-slate-800">{log.updatedBy}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] font-mono font-bold">
                    <span className="text-slate-400">{log.previousPercent}%</span>
                    <span className="text-slate-400">➔</span>
                    <span className="text-blue-600">{log.newPercent}%</span>
                  </div>
                </div>

                <div className="text-slate-700 leading-relaxed pl-8">
                  {log.workLogContent}
                </div>

                {log.issuesFaced && (
                  <div className="ml-8 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Vướng mắc: {log.issuesFaced}</span>
                  </div>
                )}

                {log.attachments && (
                  <div className="ml-8 pt-1 flex gap-2 flex-wrap">
                    {(typeof log.attachments === "string"
                      ? JSON.parse(log.attachments)
                      : log.attachments
                    ).map((att: string, i: number) => (
                      <a
                        key={i}
                        href={att}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block border border-slate-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={att}
                          alt="Ảnh hiện trường"
                          className="w-16 h-16 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
