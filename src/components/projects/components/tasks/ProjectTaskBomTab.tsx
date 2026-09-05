import React, { useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Boxes,
} from "lucide-react";
import { ProjectTask, Product } from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectTaskBomTabProps {
  task: ProjectTask;
  products: Product[];
  onRefreshTask: () => void;
  onOpenReturnModal?: (ticket: any) => void;
  onOpenOrderModal?: (ticket: any) => void;
}

export const ProjectTaskBomTab: React.FC<ProjectTaskBomTabProps> = ({
  task,
  products,
  onRefreshTask,
  onOpenReturnModal,
  onOpenOrderModal,
}) => {
  const demands = task.materialDemands || [];
  const tickets = task.materialTickets || [];

  // Form add new demand
  const [isAddingDemand, setIsAddingDemand] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productSku, setProductSku] = useState("");
  const [unit, setUnit] = useState("Cái");
  const [estimatedQuantity, setEstimatedQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("0");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1-Click borrow loading state
  const [isBorrowing, setIsBorrowing] = useState(false);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setProductName(prod.name);
      setProductSku(prod.sku || "SKU-" + prod.id.slice(-4));
      setUnit(prod.unit || "Cái");
      setUnitPrice(prod.costPrice?.toString() || prod.sellingPrice?.toString() || "0");
    }
  };

  const handleAddDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || Number(estimatedQuantity) <= 0) return;

    setIsSubmitting(true);
    try {
      await projectsApi.addTaskMaterialDemand(task.id, {
        productId: selectedProductId || `prod-custom-${Date.now()}`,
        productSku: productSku || "SKU-CUSTOM",
        productName: productName.trim(),
        unit: unit.trim() || "Cái",
        estimatedQuantity: Number(estimatedQuantity),
        unitPrice: Number(unitPrice) || 0,
        note: note.trim() || undefined,
      });
      onRefreshTask();
      setIsAddingDemand(false);
      setProductName("");
      setProductSku("");
      setEstimatedQuantity("1");
      setUnitPrice("0");
      setNote("");
    } catch (err: any) {
      alert(err.message || "Lỗi khi thêm định mức vật tư");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDemand = async (demandId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục định mức này?")) return;
    try {
      await projectsApi.deleteTaskMaterialDemand(task.id, demandId);
      onRefreshTask();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa định mức");
    }
  };

  const handleBorrowFromBom = async () => {
    if (demands.length === 0) {
      alert("Công việc chưa có định mức vật tư (BOM) để lập phiếu mượn!");
      return;
    }

    if (
      !window.confirm(
        `Xác nhận 1-Click lập phiếu xuất mượn kho cho ${demands.length} loại vật tư định mức của công việc "${task.title}"?`
      )
    ) {
      return;
    }

    setIsBorrowing(true);
    try {
      await projectsApi.borrowMaterialsFromBom(task.id, {
        requesterName: task.assigneeName || "Kỹ thuật viên",
        warehouseName: "Kho Chính",
        notes: `Xuất mượn thi công theo BOM công việc: ${task.code} - ${task.title}`,
      });
      alert("Đã lập phiếu mượn kho thành công! Kỹ thuật viên có thể đến kho nhận vật tư.");
      onRefreshTask();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lập phiếu mượn kho từ BOM");
    } finally {
      setIsBorrowing(false);
    }
  };

  const totalBomCost = demands.reduce(
    (sum, d) => sum + Number(d.estimatedQuantity) * Number(d.unitPrice),
    0
  );

  return (
    <div className="space-y-5 text-xs">
      {/* 1. BOM Demands Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Định Mức Nguyên Vật Liệu Cần Cho Công Việc (Task BOM)
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddingDemand(!isAddingDemand)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold flex items-center space-x-1 cursor-pointer transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Vật Tư</span>
            </button>

            <button
              onClick={handleBorrowFromBom}
              disabled={isBorrowing || demands.length === 0}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs shadow-indigo-600/30 transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isBorrowing ? "Đang xử lý..." : "1-Click Mượn Kho Từ BOM"}</span>
            </button>
          </div>
        </div>

        {/* Add Demand Form */}
        {isAddingDemand && (
          <form
            onSubmit={handleAddDemand}
            className="p-3 bg-white rounded-xl border border-blue-200 space-y-2 shadow-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chọn Từ Danh Mục Hàng Hóa Hoặc Nhập Tên
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <option value="">-- Chọn sản phẩm từ kho --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name} (Tồn: {p.stock || 0} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã SKU
                </label>
                <input
                  type="text"
                  placeholder="SKU"
                  value={productSku}
                  onChange={(e) => setProductSku(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tên Vật Tư *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tên thiết bị / vật tư"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đơn Vị Tính
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Số Lượng Cần *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={estimatedQuantity}
                  onChange={(e) => setEstimatedQuantity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đơn Giá Dự Toán
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-right font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingDemand(false)}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                {isSubmitting ? "Đang lưu..." : "Thêm Định Mức"}
              </button>
            </div>
          </form>
        )}

        {/* Demands Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-2 font-semibold">Mã SKU</th>
                <th className="pb-2 font-semibold">Tên Vật Tư / Thiết Bị</th>
                <th className="pb-2 font-semibold text-center">ĐVT</th>
                <th className="pb-2 font-semibold text-center">Định Mức</th>
                <th className="pb-2 font-semibold text-right">Đơn Giá</th>
                <th className="pb-2 font-semibold text-right">Thành Tiền</th>
                <th className="pb-2 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    Chưa có định mức vật tư BOM. Bấm "Thêm Vật Tư" để khai báo.
                  </td>
                </tr>
              ) : (
                demands.map((d) => (
                  <tr key={d.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-2.5 font-mono text-[11px] text-slate-600">
                      {d.productSku}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900">
                      {d.productName}
                    </td>
                    <td className="py-2.5 text-center text-slate-600">{d.unit}</td>
                    <td className="py-2.5 text-center font-bold text-blue-700 font-mono">
                      {Number(d.estimatedQuantity).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-700">
                      {Number(d.unitPrice).toLocaleString()} đ
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                      {(
                        Number(d.estimatedQuantity) * Number(d.unitPrice)
                      ).toLocaleString()}{" "}
                      đ
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => handleDeleteDemand(d.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {demands.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-300 font-bold bg-slate-100/60">
                  <td colSpan={3} className="py-2 font-semibold text-slate-700">
                    Tổng Giá Trị Định Mức BOM:
                  </td>
                  <td className="py-2 text-center font-mono text-blue-700">
                    {demands.reduce(
                      (sum, d) => sum + Number(d.estimatedQuantity),
                      0
                    )}{" "}
                    mục
                  </td>
                  <td></td>
                  <td className="py-2 text-right font-mono text-indigo-700 text-sm">
                    {totalBomCost.toLocaleString()} đ
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 2. Linked Material Tickets Section */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
          <Package className="w-4 h-4 text-indigo-600" />
          <span>
            Phiếu Điều Động Vật Tư Công Trình Liên Kết ({tickets.length})
          </span>
        </h4>

        {tickets.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 italic">
            Chưa có phiếu mượn kho hoặc quyết toán vật tư nào được tạo cho công việc này.
          </div>
        ) : (
          <div className="space-y-2.5">
            {tickets.map((tk) => {
              const isBorrow = tk.ticketType === "borrow";
              const isReturn = tk.ticketType === "return";
              const isSale = tk.ticketType === "settle_sale";

              return (
                <div
                  key={tk.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                          isBorrow
                            ? "bg-blue-100 text-blue-800"
                            : isReturn
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isBorrow
                          ? "Phiếu Mượn Kho"
                          : isReturn
                          ? "Phiếu Trả Thừa"
                          : "Quyết Toán POS"}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {tk.code}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600">
                        Kho: {tk.warehouseName || "Kho Chính"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isBorrow && tk.status !== "returned" && (
                        <button
                          onClick={() => onOpenReturnModal && onOpenReturnModal(tk)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Trả Hàng Thừa</span>
                        </button>
                      )}

                      {isBorrow && !tk.linkedOrderCode && (
                        <button
                          onClick={() => onOpenOrderModal && onOpenOrderModal(tk)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-all"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Quyết Toán POS</span>
                        </button>
                      )}

                      {tk.linkedOrderCode && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-[10px]">
                          Đơn POS: {tk.linkedOrderCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {tk.items && tk.items.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-2 space-y-1">
                      {tk.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <span className="text-slate-800 font-medium">
                            • {it.name} ({it.sku})
                          </span>
                          <span className="font-mono text-slate-600">
                            SL: {Number(it.requestedQty || it.dispatchedQty)} {it.unit}
                            {Number(it.returnedQty) > 0 && (
                              <span className="text-amber-700 ml-1">
                                (Đã trả: {Number(it.returnedQty)})
                              </span>
                            )}
                            {Number(it.installedQty) > 0 && (
                              <span className="text-emerald-700 ml-1">
                                (Đã lắp: {Number(it.installedQty)})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
