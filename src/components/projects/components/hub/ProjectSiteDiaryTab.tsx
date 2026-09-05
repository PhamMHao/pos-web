import React, { useState } from "react";
import {
  Calendar,
  Sun,
  CloudRain,
  Users,
  HardHat,
  Plus,
  ShieldCheck,
  Camera,
  AlertCircle,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectDailySiteDiary,
  Persona,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectSiteDiaryTabProps {
  project: EnterpriseProject;
  currentPersona: Persona;
  onRefresh: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const ProjectSiteDiaryTab: React.FC<ProjectSiteDiaryTabProps> = ({
  project,
  currentPersona,
  onRefresh,
  showNotify,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().slice(0, 10));
  const [weather, setWeather] = useState("Nắng ráo");
  const [temperature, setTemperature] = useState("32°C");
  const [workforceCount, setWorkforceCount] = useState(4);
  const [machineryOnSite, setMachineryOnSite] = useState("Máy hàn cáp, thang nhôm, máy khoan bê tông");
  const [tasksExecuted, setTasksExecuted] = useState("");
  const [issuesFaced, setIssuesFaced] = useState("");
  const [safetyHseStatus, setSafetyHseStatus] = useState("An toàn 100%");

  const diaries = project.dailySiteDiaries || [];

  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasksExecuted.trim()) {
      showNotify("Vui lòng ghi nội dung công việc đã triển khai trong ngày", "error");
      return;
    }
    try {
      await projectsApi.addDailySiteDiary(project.id, {
        diaryDate,
        weather,
        temperature,
        workforceCount,
        machineryOnSite,
        tasksExecuted,
        issuesFaced,
        safetyHseStatus,
        recordedBy: currentPersona.name,
      });
      showNotify("Ghi nhật ký công trường thành công!");
      setShowAddModal(false);
      setTasksExecuted("");
      onRefresh();
    } catch (err: any) {
      showNotify(err.message || "Lỗi ghi nhật ký", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Sổ Nhật Ký Công Trường Hàng Ngày (Digital Daily Site Diary)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Hiện Trường
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Ghi nhận điều kiện thời tiết, nhân lực có mặt, máy móc hoạt động và an toàn lao động (HSE)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ghi Nhật Ký Hôm Nay</span>
        </button>
      </div>

      {/* Diary Entries List */}
      {diaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Chưa có nhật ký công trường nào. Bấm "Ghi Nhật Ký Hôm Nay" để mở cuốn sổ hiện trường đầu tiên.
        </div>
      ) : (
        <div className="space-y-4">
          {diaries.map((diary) => (
            <div
              key={diary.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
            >
              {/* Diary Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-black text-sm flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(diary.diaryDate).toLocaleDateString("vi-VN")}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{diary.weather} ({diary.temperature || "30°C"})</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px] flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{diary.workforceCount} thợ kỹ thuật</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{diary.safetyHseStatus}</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Ghi bởi: <b>{diary.recordedBy}</b>
                  </span>
                </div>
              </div>

              {/* Machinery */}
              {diary.machineryOnSite && (
                <div className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800">🚜 Máy móc & Thiết bị hoạt động:</span>{" "}
                  {diary.machineryOnSite}
                </div>
              )}

              {/* Tasks Executed */}
              <div>
                <h5 className="font-bold text-slate-800 mb-1">
                  🔨 Các hạng mục công việc đã thi công trong ngày:
                </h5>
                <p className="text-slate-700 leading-relaxed pl-1">
                  {diary.tasksExecuted}
                </p>
              </div>

              {/* Issues Faced */}
              {diary.issuesFaced && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                  <span className="font-bold">⚠️ Vướng mắc hiện trường:</span> {diary.issuesFaced}
                </div>
              )}

              {/* Photos Gallery */}
              {diary.photos && Array.isArray(diary.photos) && diary.photos.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Hình ảnh nghiệm thu hiện trường ({diary.photos.length} ảnh):</span>
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {diary.photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Hiện trường"
                        className="w-24 h-20 object-cover rounded-xl border border-slate-200 shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Diary Entry */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-4">
              Ghi Nhật Ký Thi Công Công Trường Hàng Ngày
            </h3>

            <form onSubmit={handleCreateDiary} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày thi công *</label>
                  <input
                    type="date"
                    required
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời tiết *</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="Nắng ráo">☀️ Nắng ráo, thuận lợi</option>
                    <option value="Mưa gián đoạn">🌦️ Mưa gián đoạn</option>
                    <option value="Mưa lớn ngừng việc">🌧️ Mưa lớn ngừng việc</option>
                    <option value="Âm u">☁️ Âm u, mát mẻ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quân số thợ có mặt *</label>
                  <input
                    type="number"
                    min={1}
                    value={workforceCount}
                    onChange={(e) => setWorkforceCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhiệt độ hiện trường</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Máy móc & Thiết bị hoạt động</label>
                <input
                  type="text"
                  value={machineryOnSite}
                  onChange={(e) => setMachineryOnSite(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Công việc đã triển khai trong ngày *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả chi tiết các hạng mục đã hoàn thành, số mét cáp, số thiết bị..."
                  value={tasksExecuted}
                  onChange={(e) => setTasksExecuted(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khó khăn / Vướng mắc hiện trường</label>
                <input
                  type="text"
                  placeholder="Mặt bằng vướng, cúp điện, chờ vật tư..."
                  value={issuesFaced}
                  onChange={(e) => setIssuesFaced(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Lưu Nhật Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
