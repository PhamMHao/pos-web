import React, { useState } from "react";
import { X, RefreshCw, Check } from "lucide-react";
import { EnterpriseProject, Customer, Employee } from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface ProjectModalProps {
  initialData?: EnterpriseProject | null;
  customers: Customer[];
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  initialData,
  customers,
  employees,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [customerName, setCustomerName] = useState(initialData?.customerName || "");
  const [customerId, setCustomerId] = useState(initialData?.customerId || "");
  const [managerName, setManagerName] = useState(initialData?.managerName || "");
  const [managerId, setManagerId] = useState(initialData?.managerId || "");
  const [budget, setBudget] = useState(initialData?.budget?.toString() || "0");
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [sector, setSector] = useState(
    initialData?.sector || "Công Nghệ Thông Tin & Mạng Doanh Nghiệp"
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<string>(initialData?.status || "in_progress");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !customerName.trim()) {
      alert("Vui lòng điền tên dự án và khách hàng!");
      return;
    }

    setIsSaving(true);
    try {
      if (initialData?.id) {
        await projectsApi.updateProject(initialData.id, {
          name,
          customerName,
          customerId,
          managerName,
          managerId,
          budget: Number(budget),
          startDate,
          endDate,
          sector,
          description,
          status: status as any,
        });
      } else {
        await projectsApi.createProject({
          code: code.trim() || undefined,
          name,
          customerName,
          customerId,
          managerName: managerName || "Chỉ huy trưởng",
          managerId,
          budget: Number(budget),
          startDate,
          endDate,
          sector,
          description,
          status: status as any,
        });
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu dự án");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-sm text-slate-900">
            {initialData ? "Cập Nhật Thông Tin Dự Án" : "Thêm Dự Án / Công Trình Mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tên Dự Án / Công Trình *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Thi công mạng & camera Nhà máy Dệt Long An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Khách Hàng / Chủ Đầu Tư *
              </label>
              <input
                type="text"
                required
                placeholder="Chọn hoặc nhập tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Chỉ Huy Trưởng / Phụ Trách
              </label>
              <input
                type="text"
                placeholder="Tên nhân sự chỉ huy trưởng"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ngân Sách Dự Toán (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Trạng Thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="in_progress">Đang thi công</option>
                <option value="planning">Lập kế hoạch</option>
                <option value="completed">Đã hoàn thành bàn giao</option>
                <option value="on_hold">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ngày Khởi Công
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Hạn Bàn Giao
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mô Tả Hạng Mục Thi Công
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú chi tiết về phạm vi công việc, yêu cầu kỹ thuật..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <span>Lưu Dự Án</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
