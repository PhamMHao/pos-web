import React, { useState } from "react";
import { X, Check, RefreshCw } from "lucide-react";
import {
  EnterpriseProject,
  ProjectTask,
  ProjectTaskPriority,
  WeightedTaskStep,
  Product,
  Employee,
} from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface TaskModalProps {
  initialData?: ProjectTask | null;
  projects: EnterpriseProject[];
  employees: Employee[];
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  initialData,
  projects,
  employees,
  products,
  onClose,
  onSuccess,
}) => {
  const [projectId, setProjectId] = useState(initialData?.projectId || (projects[0]?.id || ""));
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [phase, setPhase] = useState(initialData?.phase || "Khảo sát");
  const [priority, setPriority] = useState<ProjectTaskPriority>(initialData?.priority || "normal");
  const [assigneeName, setAssigneeName] = useState(initialData?.assigneeName || "");
  const [assignerName, setAssignerName] = useState(initialData?.assignerName || "Chỉ huy trưởng");
  const [collaborators, setCollaborators] = useState(initialData?.collaborators || "");
  const [departmentName, setDepartmentName] = useState(initialData?.departmentName || "Phòng Kỹ Thuật");
  const [reminderSetting, setReminderSetting] = useState(initialData?.reminderSetting || "before_due_1d");
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 10) : ""
  );
  const [estimatedHours, setEstimatedHours] = useState(initialData?.estimatedHours?.toString() || "8");

  // Weighted steps
  const [steps, setSteps] = useState<WeightedTaskStep[]>(() => {
    if (initialData?.weightedSteps) {
      try {
        return JSON.parse(initialData.weightedSteps);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: "s1", name: "Khảo sát mặt bằng & chuẩn bị vật tư", weight: 30, isCompleted: false },
      { id: "s2", name: "Thi công kéo cáp & lắp đặt thiết bị", weight: 40, isCompleted: false },
      { id: "s3", name: "Đo kiểm thông mạch & dán nhãn", weight: 30, isCompleted: false },
    ];
  });

  const [newStepName, setNewStepName] = useState("");
  const [newStepWeight, setNewStepWeight] = useState("20");

  const handleAddStep = () => {
    if (!newStepName.trim()) return;
    setSteps([
      ...steps,
      {
        id: `s-${Date.now()}`,
        name: newStepName.trim(),
        weight: Number(newStepWeight) || 20,
        isCompleted: false,
      },
    ]);
    setNewStepName("");
    setNewStepWeight("20");
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) {
      alert("Vui lòng nhập tên công việc và chọn dự án!");
      return;
    }

    setIsSaving(true);
    try {
      if (initialData?.id) {
        await projectsApi.updateTask(initialData.id, {
          title,
          description,
          phase,
          priority,
          assigneeName,
          assignerName,
          collaborators: collaborators.trim() || undefined,
          departmentName,
          reminderSetting,
          dueDate: dueDate || undefined,
          estimatedHours: Number(estimatedHours) || undefined,
          weightedSteps: JSON.stringify(steps),
        });
      } else {
        await projectsApi.createTask({
          projectId,
          title,
          description,
          phase,
          priority,
          status: assigneeName.trim() ? "assigned" : "todo",
          assigneeName: assigneeName || "Kỹ thuật viên",
          assignerName,
          collaborators: collaborators.trim() || undefined,
          departmentName,
          reminderSetting,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          estimatedHours: Number(estimatedHours) || 8,
          weightedSteps: JSON.stringify(steps),
        });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu công việc");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-bold text-sm text-slate-900">
            {initialData ? "Cập Nhật Công Việc" : "Giao Việc Mới & Thiết Lập Trọng Số Từng Bước"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Thuộc Dự Án / Công Trình *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tên Công Việc / Hạng Mục *</label>
            <input
              type="text"
              required
              placeholder="VD: Lắp đặt 16 camera ColorVu và cấu hình Switch PoE"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Giai Đoạn Thi Công</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Khảo sát">1. Khảo sát & Thiết kế</option>
                <option value="Thi công thô">2. Thi công thô & Đục tường</option>
                <option value="Kéo cáp & Lắp đặt">3. Kéo cáp & Lắp thiết bị</option>
                <option value="Cấu hình & Test">4. Cấu hình phần mềm & Kiểm thử</option>
                <option value="Nghiệm thu">5. Nghiệm thu bàn giao</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mức Độ Ưu Tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="low">Thấp</option>
                <option value="normal">Bình thường</option>
                <option value="high">Ưu tiên cao</option>
                <option value="urgent">Khẩn cấp (Urgent)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Người Nhận Việc Chính *</label>
              <input
                type="text"
                required
                placeholder="Tên kỹ thuật viên phụ trách"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Người Giao Việc</label>
              <input
                type="text"
                placeholder="Tên người giao việc / Quản lý"
                value={assignerName}
                onChange={(e) => setAssignerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phòng Ban / Tổ Đội</label>
              <input
                type="text"
                placeholder="VD: Đội Kỹ Thuật 1"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nhân Sự Phối Hợp (Cộng tác)</label>
              <input
                type="text"
                placeholder="VD: Lê Văn Tuấn, Phạm Minh Hải..."
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hạn Chót (Deadline)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Giờ Công (Hours)</label>
              <input
                type="number"
                min="1"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cài Đặt Nhắc Nhở</label>
              <select
                value={reminderSetting}
                onChange={(e) => setReminderSetting(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="none">Không nhắc</option>
                <option value="daily">Hàng ngày</option>
                <option value="before_due_1d">Trước hạn 1 ngày</option>
                <option value="before_due_2h">Trước hạn 2 giờ</option>
              </select>
            </div>
          </div>

          {/* WEIGHTED STEPS CONFIGURATION */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-bold">
                Phân Rã Trọng Số Từng Bước Công Việc (Checklist %)
              </label>
              <span
                className={`font-mono text-xs font-black ${
                  totalWeight === 100 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                Tổng: {totalWeight}% {totalWeight === 100 ? "✓ Chuẩn 100%" : "(Chưa đủ 100%)"}
              </span>
            </div>

            {/* Steps list */}
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-2">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                  <span className="text-slate-800">
                    {idx + 1}. {s.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold font-mono text-[11px]">
                      {s.weight}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(s.id)}
                      className="text-rose-600 hover:text-rose-700 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add step */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên bước thực hiện con..."
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              />
              <input
                type="number"
                min="5"
                max="100"
                value={newStepWeight}
                onChange={(e) => setNewStepWeight(e.target.value)}
                placeholder="%"
                className="w-16 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-center font-mono"
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Thêm Bước
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mô Tả Chi Tiết Nhiệm Vụ</label>
            <textarea
              rows={2}
              placeholder="Yêu cầu kỹ thuật, lưu ý an toàn lao động..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{initialData ? "Cập Nhật Việc" : "Xác Nhận Giao Việc"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
