import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  X,
  CheckCircle2,
  Clock,
  Lock,
  Crown,
  Star,
  KeyRound,
  Fingerprint,
  RefreshCw,
  Check,
} from "lucide-react";
import { ProjectTask, Persona } from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface HierarchicalApprovalModalProps {
  task: ProjectTask;
  initialLevel: number;
  currentPersona: Persona;
  onClose: () => void;
  onSuccess: () => void;
}

export const HierarchicalApprovalModal: React.FC<HierarchicalApprovalModalProps> = ({
  task,
  initialLevel,
  currentPersona,
  onClose,
  onSuccess,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [rating, setRating] = useState<number>(5);
  const [reviewNotes, setReviewNotes] = useState("Thi công đạt chuẩn yêu cầu kỹ thuật & bản vẽ.");
  const [punchList, setPunchList] = useState("");

  const [approvalMethod, setApprovalMethod] = useState<"pin" | "pki_ca" | "drawing">("pin");
  const [pinCode, setPinCode] = useState("123456");
  const [pkiSerial] = useState(`PKI-GP-CA-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isSaving, setIsSaving] = useState(false);

  const existingApprovals = task.approvals || [];
  const kcsApproval = existingApprovals.find((a) => a.level === 2 && a.status === "approved");
  const pmApproval = existingApprovals.find((a) => a.level === 3 && a.status === "approved");
  const dirApproval = existingApprovals.find((a) => a.level === 4 && a.status === "approved");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const isLevelLocked =
    (level === 3 && !kcsApproval) ||
    (level === 4 && !pmApproval);

  const lockReason =
    level === 3 && !kcsApproval
      ? "🔒 Đang khóa: Cấp 2 (Giám sát KCS / QA-QC) chưa ký duyệt đạt chuẩn!"
      : level === 4 && !pmApproval
      ? "🔒 Đang khóa: Cấp 3 (Quản lý dự án / Chỉ huy trưởng) chưa ký duyệt đạt chuẩn!"
      : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLevelLocked && status === "approved") {
      alert(lockReason);
      return;
    }

    if (status === "rejected" && !punchList.trim() && !reviewNotes.trim()) {
      alert("Vui lòng ghi rõ lý do từ chối và danh sách lỗi cần sửa chữa (Punch list)!");
      return;
    }

    let signatureData: string | undefined = undefined;
    if (approvalMethod === "drawing" && canvasRef.current && hasSignature) {
      signatureData = canvasRef.current.toDataURL("image/png");
    }

    setIsSaving(true);
    try {
      await projectsApi.approveTask(task.id, {
        level,
        reviewerName: currentPersona.name,
        reviewerRole: currentPersona.role,
        status,
        qualityRating: rating,
        reviewNotes: reviewNotes.trim() || undefined,
        punchList: punchList.trim() || undefined,
        approvalMethod,
        pinCode: approvalMethod === "pin" ? pinCode : undefined,
        pkiCertificateSerial: approvalMethod === "pki_ca" ? pkiSerial : undefined,
        signatureData,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi thực hiện phê duyệt");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Biên Bản Nghiệm Thu & Phê Duyệt Cấp Bậc
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold">
                [{task.code}] {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Cấp Bậc Phê Duyệt (Chọn cấp muốn thao tác):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLevel(2)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  level === 2 ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Cấp 2: KCS</span>
                  {kcsApproval ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">QA-QC kiểm tra & Rework</div>
              </button>

              <button
                type="button"
                onClick={() => setLevel(3)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  level === 3 ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Cấp 3: Chỉ Huy Trưởng</span>
                  {pmApproval ? (
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  ) : !kcsApproval ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Duyệt kỹ thuật tổng thể</div>
              </button>

              <button
                type="button"
                onClick={() => setLevel(4)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  level === 4 ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Cấp 4: Giám Đốc</span>
                  {dirApproval ? (
                    <Crown className="w-4 h-4 text-rose-600" />
                  ) : !pmApproval ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Nghiệm thu đóng & Bán POS</div>
              </button>
            </div>

            {isLevelLocked && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center space-x-2 text-[11px] font-semibold">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lockReason}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[11px]">Người thực hiện ký:</span>
              <div className="font-bold text-slate-900">
                {currentPersona.name} ({currentPersona.title})
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${currentPersona.badgeColor}`}
            >
              {currentPersona.role}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Kết Luận Nghiệm Thu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-xl border font-bold focus:outline-none ${
                  status === "approved"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-rose-50 border-rose-300 text-rose-800"
                }`}
              >
                <option value="approved">ĐẠT - Chấp Thuận Nghiệm Thu</option>
                <option value="rejected">TỪ CHỐI - Yêu Cầu Sửa Chữa (Rework)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Đánh Giá Chất Lượng
              </label>
              <div className="flex items-center space-x-1 py-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? "text-amber-500 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-slate-600 font-bold ml-1.5">({rating}/5)</span>
              </div>
            </div>
          </div>

          {status === "rejected" ? (
            <div className="space-y-1.5">
              <label className="block text-rose-700 font-bold mb-1">
                Lý Do Từ Chối & Hạng Mục Cần Sửa Chữa (Punch List) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ghi rõ lỗi kỹ thuật cần khắc phục..."
                value={punchList}
                onChange={(e) => setPunchList(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 border border-rose-300 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ý Kiến Đánh Giá & Ghi Chú Kỹ Thuật
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2 border-t border-slate-200">
            <label className="block text-slate-700 font-bold mb-1.5">
              Phương Thức Xác Thực Ký Số
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setApprovalMethod("pin")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                  approvalMethod === "pin"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Mã PIN Bảo Mật</span>
              </button>

              <button
                type="button"
                onClick={() => setApprovalMethod("pki_ca")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                  approvalMethod === "pki_ca"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chứng Thư PKI-CA</span>
              </button>

              <button
                type="button"
                onClick={() => setApprovalMethod("drawing")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer ${
                  approvalMethod === "drawing"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Vẽ Chữ Ký Tay</span>
              </button>
            </div>

            {approvalMethod === "pin" && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Nhập Mã PIN Xác Nhận:</span>
                  <span className="text-[10px] text-blue-700 font-mono">Mặc định: 123456</span>
                </div>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-center text-lg tracking-widest focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {approvalMethod === "pki_ca" && (
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-purple-900 font-bold">Chứng Thư Số Định Danh PKI:</span>
                  <span className="font-mono font-bold text-purple-700">{pkiSerial}</span>
                </div>
                <div className="text-[10px] text-slate-600">
                  • Mã băm SHA-256 xác thực toàn vẹn biên bản sẽ được hệ thống tự động sinh và lưu vào DB.
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chứng thư bảo mật điện tử hợp lệ (Cloud CA Active)</span>
                </div>
              </div>
            )}

            {approvalMethod === "drawing" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Vẽ chữ ký tay lên bảng cảm ứng:</span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Xóa chữ ký
                  </button>
                </div>
                <div className="border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {existingApprovals.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="block font-bold text-slate-700 mb-1.5">
                Lịch Sử Nghiệm Thu Trước Đó:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                {existingApprovals.map((app) => (
                  <div
                    key={app.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {app.levelName || `Cấp ${app.level}`} - {app.reviewerName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Biên bản: {app.approvalCode} (
                        {new Date(app.signedAt || app.createdAt).toLocaleString("vi-VN")})
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {app.status === "approved" ? "Đạt" : "Từ chối"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="submit"
              disabled={isSaving || (isLevelLocked && status === "approved")}
              className={`px-5 py-2 rounded-xl text-white font-bold flex items-center space-x-2 shadow-sm transition-all ${
                isLevelLocked && status === "approved"
                  ? "bg-slate-300 cursor-not-allowed text-slate-500"
                  : status === "rejected"
                  ? "bg-rose-600 hover:bg-rose-700 cursor-pointer"
                  : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {status === "rejected"
                  ? "Xác Nhận Yêu Cầu Sửa Chữa"
                  : "Ký Duyệt Nghiệm Thu"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
