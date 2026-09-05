import React from "react";
import { Truck, Plus, ShoppingBag, Check } from "lucide-react";
import { ProjectMaterialTicket } from "../../types/projects.types";

interface ProjectMaterialsTabProps {
  materialTickets: ProjectMaterialTicket[];
  onOpenBorrowModal: () => void;
  onOpenReturnModal: (ticket: ProjectMaterialTicket) => void;
  onOpenSettleModal: (ticket: ProjectMaterialTicket) => void;
}

export const ProjectMaterialsTab: React.FC<ProjectMaterialsTabProps> = ({
  materialTickets,
  onOpenBorrowModal,
  onOpenReturnModal,
  onOpenSettleModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-600" />
            <span>Sổ Quản Lý Vật Tư Thi Công Ngoài Công Trình</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm soát vật tư xuất kho mượn đi công trường, thu hồi hoàn kho vật tư thừa và quyết toán 1-Click sang Đơn bán hàng POS
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenBorrowModal}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm shadow-amber-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập Phiếu Mượn Vật Tư</span>
          </button>
        </div>
      </div>

      {/* Material Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã Phiếu</th>
                <th className="py-3 px-4">Dự Án / Công Việc</th>
                <th className="py-3 px-4">Kho Xuất & Người Nhận</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Số Lượng Vật Tư</th>
                <th className="py-3 px-4 text-right">Giá Trị Quyết Toán</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {materialTickets.map((tk) => (
                <tr key={tk.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-blue-600">
                    {tk.code}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {new Date(tk.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{tk.project?.name || "Chưa gắn dự án"}</div>
                    <div className="text-[11px] text-slate-500">
                      {tk.task?.title ? `Task: ${tk.task.title}` : "Vật tư chung toàn dự án"}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 font-medium">{tk.requesterName}</div>
                    <div className="text-[10px] text-cyan-700 font-semibold">{tk.warehouseName}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        tk.status === "converted_order"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : tk.status === "returned"
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {tk.status === "converted_order"
                        ? `Đã Bán (Đơn: ${tk.linkedOrderCode})`
                        : tk.status === "returned"
                        ? "Đã Hoàn Kho"
                        : "Đang Thi Công Ngoài Kho"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{tk.totalItems} loại mặt hàng</div>
                    <div className="text-[10px] text-slate-500">
                      {tk.items?.map((it) => `${it.name} (${it.dispatchedQty} ${it.unit})`).join(", ") || ""}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      Number(tk.totalAmount) || 0
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {tk.status !== "converted_order" && (
                        <>
                          <button
                            onClick={() => onOpenReturnModal(tk)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold cursor-pointer"
                            title="Nhập hoàn trả vật tư thừa về kho"
                          >
                            Hoàn Kho
                          </button>

                          <button
                            onClick={() => onOpenSettleModal(tk)}
                            className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                            title="1-Click chuyển đổi vật tư đã lắp đặt thành Đơn hàng POS"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Bán Hàng POS</span>
                          </button>
                        </>
                      )}
                      {tk.status === "converted_order" && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã Quyết Toán</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
