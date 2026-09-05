import React, { useState } from "react";
import {
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectVariationOrder,
  Persona,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectVariationOrdersTabProps {
  project: EnterpriseProject;
  currentPersona: Persona;
  onRefresh: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const ProjectVariationOrdersTab: React.FC<ProjectVariationOrdersTabProps> = ({
  project,
  currentPersona,
  onRefresh,
  showNotify,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [voTitle, setVoTitle] = useState("");
  const [voReason, setVoReason] = useState("");
  const [requestedBy, setRequestedBy] = useState("Chủ đầu tư Bên A");
  const [costAdjustment, setCostAdjustment] = useState(0);
  const [timeAdjustmentDays, setTimeAdjustmentDays] = useState(0);

  const variationOrders = project.variationOrders || [];

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const handleCreateVO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voTitle.trim()) {
      showNotify("Vui lòng nhập tiêu đề hạng mục phát sinh", "error");
      return;
    }
    try {
      await projectsApi.addVariationOrder(project.id, {
        title: voTitle,
        reason: voReason,
        requestedBy,
        costAdjustment,
        timeAdjustmentDays,
      });
      showNotify("Tạo phiếu đề xuất phát sinh VO thành công!");
      setShowAddModal(false);
      setVoTitle("");
      setVoReason("");
      setCostAdjustment(0);
      setTimeAdjustmentDays(0);
      onRefresh();
    } catch (err: any) {
      showNotify(err.message || "Lỗi tạo phiếu phát sinh", "error");
    }
  };

  const handleApproveVO = async (vo: ProjectVariationOrder) => {
    try {
      await projectsApi.approveVariationOrder(project.id, vo.id, currentPersona.name);
      showNotify(`Đã ký duyệt phát sinh [${vo.voCode}], tự động cộng thêm ${formatVnd(Number(vo.costAdjustment))} vào ngân sách dự án!`);
      onRefresh();
    } catch (err: any) {
      showNotify(err.message || "Lỗi phê duyệt phát sinh", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Quản Lý Hạng Mục Phát Sinh Ngoài Hợp Đồng (Variation Orders - VO)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Site Change Orders
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Kiểm soát các thay đổi thiết kế hiện trường, phát sinh tăng/giảm chi phí và gia hạn thời gian thi công
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo Đề Xuất Phát Sinh (VO)</span>
        </button>
      </div>

      {/* VO Cards List */}
      {variationOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          Chưa có hạng mục phát sinh nào ngoài hợp đồng.
        </div>
      ) : (
        <div className="space-y-3">
          {variationOrders.map((vo) => (
            <div
              key={vo.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                    {vo.voCode}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {vo.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      vo.status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {vo.status === "approved" ? "✅ Đã phê duyệt" : "⏳ Chờ CĐT ký duyệt"}
                  </span>
                </div>

                <p className="text-slate-600 mt-1.5 leading-relaxed">
                  <b>Lý do phát sinh:</b> {vo.reason}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>Yêu cầu bởi: <b>{vo.requestedBy}</b></span>
                  <span>•</span>
                  <span>
                    Chi phí điều chỉnh:{" "}
                    <b
                      className={
                        Number(vo.costAdjustment) >= 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      {Number(vo.costAdjustment) >= 0 ? "+" : ""}
                      {formatVnd(Number(vo.costAdjustment))}
                    </b>
                  </span>
                  <span>•</span>
                  <span>
                    Gia hạn tiến độ: <b>+{vo.timeAdjustmentDays} ngày</b>
                  </span>
                  {vo.approvedBy && (
                    <>
                      <span>•</span>
                      <span>Duyệt bởi: <b>{vo.approvedBy}</b></span>
                    </>
                  )}
                </div>
              </div>

              {/* Approve Action */}
              <div className="shrink-0 flex items-center space-x-2">
                {vo.status !== "approved" && currentPersona.level >= 3 && (
                  <button
                    onClick={() => handleApproveVO(vo)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ký Duyệt & Cộng Ngân Sách</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Variation Order */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-4">
              Lập Phiếu Đề Xuất Phát Sinh Ngoài Hợp Đồng (VO)
            </h3>

            <form onSubmit={handleCreateVO} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề hạng mục phát sinh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bổ sung 2 nút mạng quang & bộ lưu điện UPS..."
                  value={voTitle}
                  onChange={(e) => setVoTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bên yêu cầu phát sinh *
                </label>
                <input
                  type="text"
                  required
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Giá trị phát sinh (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={costAdjustment}
                    onChange={(e) => setCostAdjustment(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Gia hạn thời gian (ngày)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={timeAdjustmentDays}
                    onChange={(e) => setTimeAdjustmentDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Căn cứ & Lý do phát sinh chi tiết *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Yêu cầu thay đổi công năng từ CĐT, biên bản khảo sát hiện trường phát sinh..."
                  value={voReason}
                  onChange={(e) => setVoReason(e.target.value)}
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
                  Tạo Đề Xuất VO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
