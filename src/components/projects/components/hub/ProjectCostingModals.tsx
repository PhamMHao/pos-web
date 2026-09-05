import React, { useState } from "react";
import {
  EnterpriseProject,
  CostCategory,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface AddBudgetModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  projectId,
  onClose,
  onSuccess,
  showNotify,
}) => {
  const [newItemCategory, setNewItemCategory] = useState<CostCategory>("material");
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("Cái");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRate, setNewItemRate] = useState(0);
  const [newItemNotes, setNewItemNotes] = useState("");

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const handleCreateBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      showNotify("Vui lòng nhập tên khoản mục dự toán", "error");
      return;
    }
    try {
      await projectsApi.addBudgetItem(projectId, {
        category: newItemCategory,
        itemName: newItemName,
        unit: newItemUnit,
        estimatedQty: newItemQty,
        unitRate: newItemRate,
        totalEstimatedCost: newItemQty * newItemRate,
        notes: newItemNotes,
      });
      showNotify("Thêm khoản mục dự toán CBS thành công!");
      onSuccess();
    } catch (err: any) {
      showNotify(err.message || "Lỗi khi thêm dự toán", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 className="font-black text-base text-slate-900 mb-4">
          Thêm Khoản Mục Dự Toán Chi Phí (CBS)
        </h3>

        <form onSubmit={handleCreateBudgetItem} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nhóm yếu tố chi phí *
            </label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as CostCategory)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
            >
              <option value="material">📦 Vật tư & Thiết bị (BOM dự án)</option>
              <option value="labor">👷 Nhân công thi công / Lắp ráp</option>
              <option value="machinery">🚜 Máy thi công & Thuê thiết bị</option>
              <option value="subcontractor">🤝 Thầu phụ ngoài</option>
              <option value="overheads">💼 Chi phí chung / Quản lý công trình</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tên khoản mục dự toán *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Cáp mạng Commscope Cat6 UTP 305m..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ĐVT</label>
              <input
                type="text"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">SL dự toán</label>
              <input
                type="number"
                min={1}
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn giá (VNĐ)</label>
              <input
                type="number"
                min={0}
                value={newItemRate}
                onChange={(e) => setNewItemRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold flex justify-between">
            <span>Tổng định mức dự toán:</span>
            <span>{formatVnd(newItemQty * newItemRate)}</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú / Quy cách</label>
            <textarea
              rows={2}
              value={newItemNotes}
              onChange={(e) => setNewItemNotes(e.target.value)}
              placeholder="Tiêu chuẩn kỹ thuật, nhà cung ứng dự kiến..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              Lưu Vào Dự Toán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddExpenseModalProps {
  project: EnterpriseProject;
  onClose: () => void;
  onSuccess: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  project,
  onClose,
  onSuccess,
  showNotify,
}) => {
  const [expenseCategory, setExpenseCategory] = useState<CostCategory>("material");
  const [expenseBudgetItemId, setExpenseBudgetItemId] = useState<string>("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expensePayee, setExpensePayee] = useState("");
  const [expenseInvoiceRef, setExpenseInvoiceRef] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

  const budgetItems = project.budgetItems || [];

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) {
      showNotify("Số tiền chi phải lớn hơn 0", "error");
      return;
    }
    if (!expensePayee.trim() || !expenseDesc.trim()) {
      showNotify("Vui lòng điền người nhận và nội dung chi", "error");
      return;
    }
    try {
      await projectsApi.addActualExpense(project.id, {
        category: expenseCategory,
        budgetItemId: expenseBudgetItemId || undefined,
        amount: expenseAmount,
        payee: expensePayee,
        invoiceRef: expenseInvoiceRef || undefined,
        description: expenseDesc,
        recordedBy: "PM - Trần Quốc Bảo",
      });
      showNotify("Ghi nhận chi phí thực tế thành công!");
      onSuccess();
    } catch (err: any) {
      showNotify(err.message || "Lỗi khi ghi nhận chi phí", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 className="font-black text-base text-slate-900 mb-4">
          Ghi Nhận Chi Phí Thực Tế Công Trình
        </h3>

        <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nhóm chi phí *
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as CostCategory)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
            >
              <option value="material">📦 Mua vật tư / thiết bị</option>
              <option value="labor">👷 Chi trả công thợ / lương kỹ thuật</option>
              <option value="machinery">🚜 Thuê máy móc / thiết bị đo</option>
              <option value="subcontractor">🤝 Thanh toán thầu phụ</option>
              <option value="overheads">💼 Vận chuyển, ăn ở, tiếp khách...</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Gắn với khoản mục dự toán (CBS)
            </label>
            <select
              value={expenseBudgetItemId}
              onChange={(e) => setExpenseBudgetItemId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
            >
              <option value="">-- Khoản mục phát sinh chung --</option>
              {budgetItems.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.itemName} (Dự toán: {formatVnd(Number(b.totalEstimatedCost))})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số tiền chi (VNĐ) *</label>
              <input
                type="number"
                required
                min={1000}
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-black text-emerald-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Hóa Đơn / Phiếu Chi</label>
              <input
                type="text"
                placeholder="HD-VAT-123..."
                value={expenseInvoiceRef}
                onChange={(e) => setExpenseInvoiceRef(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Đơn vị nhận tiền / Người thụ hưởng *</label>
            <input
              type="text"
              required
              placeholder="Tên nhà cung cấp, đội thợ, tài xế..."
              value={expensePayee}
              onChange={(e) => setExpensePayee(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết diễn giải *</label>
            <textarea
              rows={2}
              required
              placeholder="Lý do chi, đợt thanh toán..."
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              Xác Nhận Chi Tiền
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
