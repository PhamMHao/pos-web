import React from "react";
import {
  Layers,
  Clock,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { QuickStatusGroup } from "./ProjectTasksFilterBar";

interface ProjectTasksQuickStatusTabsProps {
  quickStatusTab: QuickStatusGroup;
  setQuickStatusTab: (tab: QuickStatusGroup) => void;
  statusCounts: Record<QuickStatusGroup, number>;
  viewMode: "kanban" | "table";
  setViewMode: (v: "kanban" | "table") => void;
  onAddNewTask: () => void;
}

export const ProjectTasksQuickStatusTabs: React.FC<ProjectTasksQuickStatusTabsProps> = ({
  quickStatusTab,
  setQuickStatusTab,
  statusCounts,
  viewMode,
  setViewMode,
  onAddNewTask,
}) => {
  return (
    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
      {/* Quick Status Pills */}
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          onClick={() => setQuickStatusTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "all"
              ? "bg-slate-900 text-white shadow-xs shadow-slate-900/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tất cả</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-800"
            }`}
          >
            {statusCounts.all || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("waiting")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "waiting"
              ? "bg-slate-700 text-white shadow-xs shadow-slate-700/20"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Đang chờ</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "waiting" ? "bg-slate-600 text-white" : "bg-white text-slate-800"
            }`}
          >
            {statusCounts.waiting || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("active")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "active"
              ? "bg-blue-600 text-white shadow-xs shadow-blue-600/20"
              : "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-300" />
          <span>Đang thực hiện</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "active" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-900"
            }`}
          >
            {statusCounts.active || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("blocked")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "blocked"
              ? "bg-stone-700 text-white shadow-xs shadow-stone-700/20"
              : "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200"
          }`}
        >
          <span>⏸️ Tạm dừng</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "blocked" ? "bg-stone-800 text-white" : "bg-white text-stone-900"
            }`}
          >
            {statusCounts.blocked || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("review")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "review"
              ? "bg-amber-600 text-white shadow-xs shadow-amber-600/20"
              : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Chờ KCS duyệt</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "review" ? "bg-amber-700 text-white" : "bg-amber-100 text-amber-900"
            }`}
          >
            {statusCounts.review || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("rework")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "rework"
              ? "bg-rose-600 text-white shadow-xs shadow-rose-600/20"
              : "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/50"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
          <span>Yêu cầu sửa</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "rework" ? "bg-rose-700 text-white" : "bg-rose-100 text-rose-900"
            }`}
          >
            {statusCounts.rework || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("approved")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "approved"
              ? "bg-purple-600 text-white shadow-xs shadow-purple-600/20"
              : "bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
          <span>Đã duyệt kỹ thuật</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "approved" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-900"
            }`}
          >
            {statusCounts.approved || 0}
          </span>
        </button>

        <button
          onClick={() => setQuickStatusTab("completed")}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
            quickStatusTab === "completed"
              ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Hoàn thành</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              quickStatusTab === "completed" ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {statusCounts.completed || 0}
          </span>
        </button>
      </div>

      {/* Switch View Mode & Add Task Button */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
              viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
              viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bảng Chi Tiết</span>
          </button>
        </div>

        <button
          onClick={onAddNewTask}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Giao Việc Mới</span>
        </button>
      </div>
    </div>
  );
};
