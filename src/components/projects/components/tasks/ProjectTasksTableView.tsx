import React from "react";
import {
  User,
  Calendar,
  Building,
  Edit3,
  Trash2,
  Eye,
  UserCheck,
  Boxes,
} from "lucide-react";
import { ProjectTask } from "../../types/projects.types";

interface ProjectTasksTableViewProps {
  tasks: ProjectTask[];
  onSelectTask: (task: ProjectTask) => void;
  onAcceptTask: (taskId: string) => void;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
}

export const ProjectTasksTableView: React.FC<ProjectTasksTableViewProps> = ({
  tasks,
  onSelectTask,
  onAcceptTask,
  onEditTask,
  onDeleteTask,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">Chờ giao</span>;
      case "assigned":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Đã giao (Chờ nhận)</span>;
      case "in_progress":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">Đang thi công</span>;
      case "blocked":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-stone-200 text-stone-800">⏸️ Tạm dừng</span>;
      case "review_pending":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">Chờ KCS duyệt</span>;
      case "rework_required":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Cần sửa (Rework)</span>;
      case "resubmitted":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">Đã nộp lại</span>;
      case "approved":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">Đã duyệt PM</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Hoàn thành</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getDeadlineBadge = (task: ProjectTask) => {
    if (!task.dueDate) return <span className="text-slate-400 italic">Chưa đặt</span>;
    const due = new Date(task.dueDate).getTime();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    if (task.status === "completed") {
      return (
        <span className="text-[11px] text-emerald-700 font-medium">
          {new Date(task.dueDate).toLocaleDateString("vi-VN")}
        </span>
      );
    }

    if (due < todayStart) {
      const days = Math.ceil((todayStart - due) / 86400000);
      return (
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-rose-600">
            {new Date(task.dueDate).toLocaleDateString("vi-VN")}
          </span>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded w-fit">
            Trễ {days} ngày
          </span>
        </div>
      );
    }

    if (due >= todayStart && due < todayEnd) {
      return (
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-amber-700">Hôm nay</span>
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded w-fit">
            Đến hạn
          </span>
        </div>
      );
    }

    return (
      <span className="text-[11px] text-slate-700">
        {new Date(task.dueDate).toLocaleDateString("vi-VN")}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3">Mã CV</th>
              <th className="py-3 px-3">Tên Công Việc / Hạng Mục</th>
              <th className="py-3 px-3">Dự Án</th>
              <th className="py-3 px-3">Phòng Ban / Tổ Đội</th>
              <th className="py-3 px-3">Nhân Sự Phụ Trách</th>
              <th className="py-3 px-3">Hạn Chót (SLA)</th>
              <th className="py-3 px-3 text-center">Tiến Độ %</th>
              <th className="py-3 px-3 text-center">Trạng Thái</th>
              <th className="py-3 px-3 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                  Không tìm thấy công việc nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                >
                  {/* Mã CV */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {task.code}
                    </span>
                  </td>

                  {/* Tên công việc & giai đoạn */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-bold text-slate-900 leading-tight hover:text-blue-600 transition-colors">
                      {task.title}
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5 text-[10px] text-slate-400">
                      <span>{task.phase || "Chưa phân kỳ"}</span>
                      {task.materialDemands && task.materialDemands.length > 0 && (
                        <span className="text-indigo-600 font-medium flex items-center space-x-0.5">
                          <Boxes className="w-2.5 h-2.5" />
                          <span>BOM: {task.materialDemands.length} VT</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dự án */}
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700">
                      {task.project?.name || task.projectId}
                    </span>
                  </td>

                  {/* Phòng ban */}
                  <td className="py-3 px-3">
                    {task.departmentName ? (
                      <span className="text-purple-700 font-medium flex items-center space-x-1">
                        <Building className="w-3 h-3" />
                        <span>{task.departmentName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>

                  {/* Nhân sự phụ trách */}
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-800">
                        {task.assigneeName || "Chưa gán"}
                      </span>
                    </div>
                    {task.assignerName && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Giao: {task.assignerName}
                      </div>
                    )}
                  </td>

                  {/* Hạn chót SLA */}
                  <td className="py-3 px-3">
                    {getDeadlineBadge(task)}
                  </td>

                  {/* Tiến độ % */}
                  <td className="py-3 px-3 text-center">
                    <div className="font-mono font-bold text-blue-600 text-[11px]">
                      {task.progressPercent}%
                    </div>
                    <div className="w-16 bg-slate-200 rounded-full h-1 mx-auto mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          task.progressPercent === 100 ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${task.progressPercent}%` }}
                      />
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-3 text-center">
                    {getStatusBadge(task.status)}
                  </td>

                  {/* Thao tác */}
                  <td
                    className="py-3 px-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      {task.status === "assigned" && (
                        <button
                          onClick={() => onAcceptTask(task.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                          title="Nhận việc ngay"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectTask(task)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                        title="Xem chi tiết 360°"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                        title="Sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
