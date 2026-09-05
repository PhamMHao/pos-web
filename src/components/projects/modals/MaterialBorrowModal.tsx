import React, { useState } from "react";
import { X, Check, RefreshCw, Truck } from "lucide-react";
import {
  EnterpriseProject,
  ProjectTask,
  Product,
  Employee,
} from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface MaterialBorrowModalProps {
  projects: EnterpriseProject[];
  tasks: ProjectTask[];
  products: Product[];
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

export const MaterialBorrowModal: React.FC<MaterialBorrowModalProps> = ({
  projects,
  tasks,
  products,
  employees,
  onClose,
  onSuccess,
}) => {
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [taskId, setTaskId] = useState("");
  const [requesterName, setRequesterName] = useState(employees[0]?.name || "Trần Văn Hưng (Kỹ Thuật)");
  const [approverName, setApproverName] = useState("Nguyễn Văn Minh (Thủ Kho)");
  const [warehouseName, setWarehouseName] = useState("Kho Chính Gia Phúc Computer");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [notes, setNotes] = useState("Xuất mượn dây mạng, camera và phụ kiện thi công công trình.");

  // Items to borrow
  const [items, setItems] = useState<
    {
      productId: string;
      name: string;
      sku: string;
      unit: string;
      quantity: number;
      costPrice: number;
      salePrice: number;
      serials: string[];
    }[]
  >([]);
  const [selectedProdId, setSelectedProdId] = useState("");
  const [qty, setQty] = useState("1");
  const [serialsInput, setSerialsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;
    const serialList = serialsInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    setItems([
      ...items,
      {
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        quantity: Number(qty) || 1,
        costPrice: Number(prod.costPrice) || 0,
        salePrice: Number(prod.sellingPrice) || 0,
        serials: serialList,
      },
    ]);
    setSelectedProdId("");
    setQty("1");
    setSerialsInput("");
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.salePrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất 1 linh kiện/vật tư cần mượn!");
      return;
    }

    setIsSaving(true);
    try {
      await projectsApi.createMaterialTicket({
        projectId,
        taskId: taskId || undefined,
        ticketType: "borrow",
        warehouseName,
        requesterName,
        approverName,
        expectedReturnDate: expectedReturnDate || undefined,
        notes,
        totalCost: items.reduce((sum, it) => sum + it.quantity * it.costPrice, 0),
        totalAmount,
        items,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lập phiếu mượn vật tư");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Lập Phiếu Xuất Mượn Vật Tư Đi Công Trình</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Dự Án Đi Thi Công *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Công Việc (Task) Trực Thuộc</label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="">-- Dùng chung toàn dự án --</option>
                {tasks
                  .filter((t) => t.projectId === projectId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Người Nhận Mượn (Kỹ Thuật) *</label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Thủ Kho / Người Duyệt Xuất</label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Add item to borrow */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-slate-700 font-semibold mb-1">Chọn Vật Tư & Linh Kiện Cần Xuất</label>
            <div className="space-y-2 mb-2">
              <div className="flex gap-2">
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Chọn sản phẩm từ kho --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Tồn: {p.stock} {p.unit}) - {new Intl.NumberFormat("vi-VN").format(Number(p.sellingPrice))}đ
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="SL"
                  className="w-16 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-center font-mono"
                />

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Thêm
                </button>
              </div>

              <input
                type="text"
                placeholder="Serial/IMEI (Nếu có, cách nhau bằng dấu phẩy. VD: SN-1001, SN-1002)"
                value={serialsInput}
                onChange={(e) => setSerialsInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none text-[11px]"
              />
            </div>

            {items.length > 0 && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                    <div>
                      <div className="font-bold text-slate-900">• {it.name}</div>
                      {it.serials.length > 0 && (
                        <div className="text-[10px] text-blue-700 font-mono font-semibold">
                          SN: {it.serials.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-black text-amber-700">
                        {it.quantity} {it.unit}
                      </span>
                      <span className="text-slate-600 font-mono">
                        {new Intl.NumberFormat("vi-VN").format(it.quantity * it.salePrice)}đ
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-700 text-xs">
                  <span>Tổng giá trị vật tư mượn:</span>
                  <span className="text-emerald-700 font-black">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ghi Chú Xuất Mượn</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Xuất Kho & Tạo Phiếu Mượn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
