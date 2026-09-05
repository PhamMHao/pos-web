import React from "react";
import { Download, Upload } from "lucide-react";
import { EnterpriseProject, ProjectTask, ProjectMaterialTicket } from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectBackupTabProps {
  projects: EnterpriseProject[];
  tasks: ProjectTask[];
  materialTickets: ProjectMaterialTicket[];
  onNotify: (text: string, type?: "success" | "error") => void;
  onRefresh: () => void;
}

export const ProjectBackupTab: React.FC<ProjectBackupTabProps> = ({
  projects,
  tasks,
  materialTickets,
  onNotify,
  onRefresh,
}) => {
  const handleExport = async () => {
    try {
      const backupData = await projectsApi.exportProjectsData();
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `gperp_projects_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onNotify("Đã tải xuống tệp sao lưu an toàn thành công!");
    } catch (e: any) {
      onNotify(e.message || "Lỗi sao lưu dữ liệu", "error");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        await projectsApi.restoreProjectsData(parsed);
        onNotify("Phục hồi dữ liệu dự án vào SQL Server thành công!");
        onRefresh();
      } catch (err: any) {
        onNotify(err.message || "Tệp sao lưu không hợp lệ", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Sao Lưu Dữ Liệu Dự Án & Công Việc</h3>
            <p className="text-xs text-slate-500">
              Xuất toàn bộ cơ sở dữ liệu dự án, công việc, thành viên, nhật ký tiến độ và phiếu vật tư ra tệp JSON an toàn.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 mb-4">
          <div>• Tổng số dự án: <b>{projects.length}</b></div>
          <div>• Tổng số công việc (tasks): <b>{tasks.length}</b></div>
          <div>• Tổng số phiếu vật tư: <b>{materialTickets.length}</b></div>
          <div>• Cơ sở dữ liệu: Microsoft SQL Server (Lưu trữ vĩnh viễn)</div>
        </div>

        <button
          onClick={handleExport}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm shadow-blue-600/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Tải Xuống Tệp Sao Lưu Dự Án (.JSON)</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Phục Hồi Dữ Liệu Từ Bản Sao Lưu</h3>
            <p className="text-xs text-slate-500">
              Tải lên tệp JSON sao lưu để khôi phục và đồng bộ trực tiếp vào cơ sở dữ liệu SQL Server.
            </p>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-700 font-semibold">
            Kéo thả tệp sao lưu .json vào đây hoặc bấm để chọn tệp
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="mt-3 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
