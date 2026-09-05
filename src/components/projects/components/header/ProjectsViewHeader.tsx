import React from "react";
import {
  HardHat,
  Plus,
  FolderKanban,
  Clock,
  Truck,
  FileCheck2,
  Download,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectTask,
  ProjectMaterialTicket,
  Persona,
} from "../../types/projects.types";
import { ProjectKpiSummaryCards } from "../kpi/ProjectKpiSummaryCards";

export type ProjectSubTab = "tasks" | "projects" | "approvals" | "materials" | "backup";

interface ProjectsViewHeaderProps {
  currentPersona: Persona;
  projects: EnterpriseProject[];
  tasks: ProjectTask[];
  materialTickets: ProjectMaterialTicket[];
  activeSubTab: ProjectSubTab;
  setActiveSubTab: (tab: ProjectSubTab) => void;
  onOpenBorrowModal: () => void;
  onOpenNewTaskModal: () => void;
  onOpenNewProjectModal: () => void;
}

export const ProjectsViewHeader: React.FC<ProjectsViewHeaderProps> = ({
  currentPersona,
  projects,
  tasks,
  materialTickets,
  activeSubTab,
  setActiveSubTab,
  onOpenBorrowModal,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
}) => {
  return (
    <div className="p-4 md:p-6 border-b border-slate-200 bg-white shrink-0 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                Quản Lý Dự Án & Thi Công Công Trình
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ERP Doanh Nghiệp
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Quản trị toàn diện: EVM S-Curve, Dự toán CBS, Tiến độ CPM Gantt, Nghiệm thu A-B, Nhật ký & 360° Hub
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenBorrowModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Lập Phiếu Mượn Vật Tư</span>
          </button>

          {currentPersona.capabilities.canCreateTask && (
            <button
              onClick={onOpenNewTaskModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Công Việc Mới</span>
            </button>
          )}

          {currentPersona.level >= 3 && (
            <button
              onClick={onOpenNewProjectModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Khởi Tạo Dự Án Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="mt-4">
        <ProjectKpiSummaryCards
          projects={projects}
          tasks={tasks}
          materialTickets={materialTickets}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto">
        {[
          { id: "tasks", label: "Tiến Độ & Trọng Số Checklist", icon: Clock, count: tasks.length },
          { id: "projects", label: "Danh Sách Dự Án (Tổng Quan & 360°)", icon: FolderKanban, count: projects.length },
          { id: "approvals", label: "Ký Duyệt Nghiệm Thu 4 Cấp (RBAC)", icon: FileCheck2 },
          { id: "materials", label: "Vật Tư Công Trình (Mượn - Trả - Bán)", icon: Truck, count: materialTickets.length },
          { id: "backup", label: "Sao Lưu & Phục Hồi Dữ Liệu", icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as ProjectSubTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
