import React, { useState, useMemo } from "react";
import {
  Search,
  FolderKanban,
  Edit3,
  Trash2,
  ExternalLink,
  Crown,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { EnterpriseProject, Persona } from "../../types/projects.types";

interface ProjectsCardGridProps {
  projects: EnterpriseProject[];
  currentPersona: Persona;
  onSelectProject360: (project: EnterpriseProject) => void;
  onViewTasks: (projectId: string) => void;
  onEditProject: (project: EnterpriseProject) => void;
  onDeleteProject: (project: EnterpriseProject) => void;
}

export const ProjectsCardGrid: React.FC<ProjectsCardGridProps> = ({
  projects,
  currentPersona,
  onSelectProject360,
  onViewTasks,
  onEditProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.managerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án, khách hàng, mã DA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="in_progress">Đang thi công</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="planning">Lập kế hoạch</option>
            <option value="on_hold">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">
            Không tìm thấy dự án nào
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Thêm Dự Án" để tạo dự án mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {project.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
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
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {project.description || "Không có mô tả chi tiết."}
                </p>

                {/* Meta info */}
                <div className="mt-4 space-y-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Khách hàng:</span>
                    <span className="font-semibold text-slate-800">
                      {project.customerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chỉ huy trưởng:</span>
                    <span className="font-semibold text-indigo-700">
                      {project.managerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngân sách dự toán:</span>
                    <span className="font-black text-emerald-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(project.budget) || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Thời gian thi công:</span>
                    <span className="text-slate-700">
                      {project.startDate}{" "}
                      {project.endDate ? `➔ ${project.endDate}` : ""}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">
                      Tiến độ dự án
                    </span>
                    <span className="font-black text-blue-600">
                      {project.overallProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.overallProgress || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>
                      Hoàn thành: {project.completedTasks || 0} việc
                    </span>
                    <span>Tổng cộng: {project.totalTasks || 0} việc</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex flex-col gap-2 mt-5 pt-3 border-t border-slate-100">
                {/* 360 Hub Button */}
                <button
                  onClick={() => onSelectProject360(project)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Trung Tâm Điều Hành 360° Dự Án</span>
                </button>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewTasks(project.id)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Xem {project.totalTasks || 0} việc</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {currentPersona.level >= 3 && (
                      <button
                        onClick={() => onEditProject(project)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        title="Sửa thông tin dự án"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {currentPersona.level >= 4 && (
                      <button
                        onClick={() => onDeleteProject(project)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                        title="Xóa dự án"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
