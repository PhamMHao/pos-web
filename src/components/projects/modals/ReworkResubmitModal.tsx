import React, { useState } from "react";
import { X, RefreshCw, Check } from "lucide-react";
import { ProjectTask } from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface ReworkResubmitModalProps {
  task: ProjectTask;
  personaName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReworkResubmitModal: React.FC<ReworkResubmitModalProps> = ({
  task,
  personaName,
  onClose,
  onSuccess,
}) => {
  const [reworkNotes, setReworkNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkNotes.trim()) {
      alert("Vui lòng ghi rõ nội dung khắc phục tồn đọng kỹ thuật!");
      return;
    }

    setIsSaving(true);
    try {
      await projectsApi.resubmitTaskAfterRework(task.id, {
        reworkNotes,
        updatedBy: personaName,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi nộp lại biên bản");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Khắc Phục Tồn Đọng & Nộp Lại Nghiệm Thu
            </h3>
            <p className="text-[11px] text-rose-700 mt-0.5 font-semibold">
              [{task.code}] {task.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
            <span className="font-bold">Lý do KCS / PM yêu cầu sửa chữa:</span>
            <p className="text-[11px] text-rose-700">
              {task.reworkReason || "Cần kiểm tra khắc phục lỗi kỹ thuật"}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Báo Cáo Giải Trình & Nội Dung Đã Khắc Phục *
            </label>
            <textarea
              rows={4}
              required
              placeholder="VD: Đã bấm lại toàn bộ 40 đầu cáp mạng, đo kiểm fluker đạt chuẩn 10Gbps và dán tem nhãn port hoàn chỉnh..."
              value={reworkNotes}
              onChange={(e) => setReworkNotes(e.target.value)}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Nộp Lại Cho KCS Duyệt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
