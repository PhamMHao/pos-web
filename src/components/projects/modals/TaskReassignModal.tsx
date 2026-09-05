import React, { useState } from "react";
import { X, Users, ArrowRight } from "lucide-react";
import { ProjectTask, Employee } from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

interface TaskReassignModalProps {
  task: ProjectTask;
  employees: Employee[];
  currentUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskReassignModal: React.FC<TaskReassignModalProps> = ({
  task,
  employees,
  currentUserName,
  onClose,
  onSuccess,
}) => {
  const [selectedAssigneeName, setSelectedAssigneeName] = useState("");
  const [departmentName, setDepartmentName] = useState(task.departmentName || "");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeName.trim() || !reason.trim()) {
      alert("Vui lòng nhập tên người nhận mới và lý do chuyển giao công việc!");
      return;
    }

    setIsSubmitting(true);
    try {
      await projectsApi.reassignTask(task.id, {
        assigneeName: selectedAssigneeName.trim(),
        departmentName: departmentName.trim() || undefined,
        reason: reason.trim(),
        updatedBy: currentUserName,
      });
      alert("Chuyển giao công việc thành công!");
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi chuyển giao việc");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Chuyển Giao Công Việc Cho Nhân Sự Khác
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleReassign} className="p-4 space-y-3 text-xs">
          {/* Task preview */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-mono text-[11px] font-bold text-slate-600">
              {task.code}
            </div>
            <div className="font-bold text-slate-900 text-xs">{task.title}</div>
            <div className="text-[11px] text-slate-500">
              Người phụ trách hiện tại:{" "}
              <strong className="text-slate-700">
                {task.assigneeName || "Chưa phân công"}
              </strong>
            </div>
          </div>

          {/* New Assignee */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Người Nhận Việc Mới *
            </label>
            {employees.length > 0 ? (
              <select
                required
                value={selectedAssigneeName}
                onChange={(e) => setSelectedAssigneeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="">-- Chọn nhân viên kỹ thuật --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role || "Kỹ thuật"})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Nhập họ tên kỹ thuật viên nhận việc mới"
                value={selectedAssigneeName}
                onChange={(e) => setSelectedAssigneeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
              />
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Phòng Ban / Tổ Đội Phụ Trách
            </label>
            <input
              type="text"
              placeholder="VD: Đội Thi Công 2"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Lý Do Chuyển Giao Công Việc *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ghi rõ lý do (VD: KTV bận công trình khác, cần hỗ trợ chuyên môn mạng cao cấp...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center space-x-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang xử lý..." : "Xác Nhận Chuyển Giao"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
