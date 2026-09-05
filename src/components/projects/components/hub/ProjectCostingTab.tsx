import React, { useState } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PieChart as PieIcon,
  Receipt,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectBudgetItem,
  ProjectActualExpense,
  CostCategory,
  Persona,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";
import { AddBudgetModal, AddExpenseModal } from "./ProjectCostingModals";

interface ProjectCostingTabProps {
  project: EnterpriseProject;
  currentPersona: Persona;
  onRefresh: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

const CATEGORY_MAP: Record<CostCategory, { label: string; color: string; badge: string }> = {
  material: { label: "Vật tư & Thiết bị", color: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  labor: { label: "Nhân công thi công", color: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  machinery: { label: "Máy & Thuê thiết bị", color: "text-indigo-600", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  subcontractor: { label: "Thầu phụ ngoài", color: "text-purple-600", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  overheads: { label: "Chi phí chung / Quản lý", color: "text-slate-600", badge: "bg-slate-100 text-slate-700 border-slate-200" },
};

export const ProjectCostingTab: React.FC<ProjectCostingTabProps> = ({
  project,
  currentPersona,
  onRefresh,
  showNotify,
}) => {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const budgetItems = project.budgetItems || [];
  const actualExpenses = project.actualExpenses || [];

  const totalEstimated = budgetItems.reduce(
    (sum, b) => sum + Number(b.totalEstimatedCost || 0),
    0
  );
  const totalActual = actualExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );
  const variance = totalEstimated - totalActual;
  const burnRate = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Tổng Dự Toán (CBS Baseline)
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatVnd(totalEstimated)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {budgetItems.length} hạng mục định mức
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Chi Phí Thực Tế Đã Chi
          </div>
          <div className="text-xl font-black text-blue-600">
            {formatVnd(totalActual)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {actualExpenses.length} chứng từ giải ngân
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Ngân Sách Còn Lại
          </div>
          <div
            className={`text-xl font-black ${
              variance >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatVnd(variance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {variance >= 0 ? "Trong hạn mức an toàn" : "Vượt ngân sách!"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Tỷ Lệ Giải Ngân (Burn Rate)
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-xl font-black ${
                burnRate <= 85
                  ? "text-emerald-600"
                  : burnRate <= 100
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {burnRate}%
            </span>
            <span className="text-[11px] text-slate-400">
              {burnRate > 100 ? "🚨 Overrun" : "✅ Tiêu chuẩn"}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                burnRate <= 85
                  ? "bg-emerald-500"
                  : burnRate <= 100
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, burnRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Bảng Dự Toán Chi Phí Đa Yếu Tố (Cost Breakdown Structure - CBS)
          </h3>
          <p className="text-xs text-slate-500">
            Kiểm soát chi tiết 5 nhóm chi phí: Vật tư, Nhân công, Máy thi công, Thầu phụ và Chi phí chung
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentPersona.level >= 3 && (
            <button
              onClick={() => setShowAddBudgetModal(true)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Khoản Mục Dự Toán</span>
            </button>
          )}

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ghi Nhận Chi Phí Thực Tế</span>
          </button>
        </div>
      </div>

      {/* 3-Column Comparison Table (Dự Toán vs Thực Tế vs Chênh Lệch) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Khoản Mục Chi Phí (CBS)</th>
                <th className="py-3 px-4">Nhóm Yếu Tố</th>
                <th className="py-3 px-4 text-center">ĐVT</th>
                <th className="py-3 px-4 text-right">Dự Toán Ban Đầu</th>
                <th className="py-3 px-4 text-right">Chi Phí Đã Phát Sinh</th>
                <th className="py-3 px-4 text-right">Chênh Lệch Còn Lại</th>
                <th className="py-3 px-4 text-center">Cảnh Báo</th>
                {currentPersona.level >= 3 && (
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {budgetItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Chưa có khoản mục dự toán nào. Bấm "Thêm Khoản Mục Dự Toán" để tạo mới.
                  </td>
                </tr>
              ) : (
                budgetItems.map((item) => {
                  const est = Number(item.totalEstimatedCost) || 0;
                  const spent = Number(item.actualSpent) || 0;
                  const rem = est - spent;
                  const pct = est > 0 ? (spent / est) * 100 : 0;
                  const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.material;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{item.itemName}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 font-normal">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cat.badge}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">
                        {item.unit} ({item.estimatedQty})
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatVnd(est)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-blue-600">
                        {formatVnd(spent)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          rem >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {formatVnd(rem)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {pct > 100 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            🚨 Vượt {(pct - 100).toFixed(0)}%
                          </span>
                        ) : pct >= 90 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                            ⚠️ Chạm ngưỡng ({pct.toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✅ An toàn ({pct.toFixed(0)}%)
                          </span>
                        )}
                      </td>
                      {currentPersona.level >= 3 && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={async () => {
                              if (confirm(`Xóa khoản mục dự toán "${item.itemName}"?`)) {
                                try {
                                  await projectsApi.deleteBudgetItem(project.id, item.id);
                                  showNotify("Đã xóa khoản mục dự toán thành công");
                                  onRefresh();
                                } catch (err: any) {
                                  showNotify(err.message || "Lỗi xóa khoản mục", "error");
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa khoản mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actual Expenses Log Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center space-x-2">
          <span>Nhật Ký Chứng Từ Giải Ngân & Chi Phí Thực Tế</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {actualExpenses.length} bản ghi
          </span>
        </h4>

        {actualExpenses.length === 0 ? (
          <p className="text-xs text-slate-400">
            Chưa có chứng từ chi phí thực tế nào được ghi nhận. Bấm "Ghi Nhận Chi Phí Thực Tế" để thêm.
          </p>
        ) : (
          <div className="space-y-2">
            {actualExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      {exp.expenseCode}
                    </span>
                    <span className="text-slate-500">• {exp.payee}</span>
                    {exp.invoiceRef && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px]">
                        Ref: {exp.invoiceRef}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {exp.description} (Ghi nhận bởi: <b>{exp.recordedBy}</b>)
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900">
                    {formatVnd(Number(exp.amount))}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(exp.spentDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Add Budget Item */}
      {showAddBudgetModal && (
        <AddBudgetModal
          projectId={project.id}
          onClose={() => setShowAddBudgetModal(false)}
          onSuccess={() => {
            setShowAddBudgetModal(false);
            onRefresh();
          }}
          showNotify={showNotify}
        />
      )}

      {/* Modal 2: Add Actual Expense */}
      {showAddExpenseModal && (
        <AddExpenseModal
          project={project}
          onClose={() => setShowAddExpenseModal(false)}
          onSuccess={() => {
            setShowAddExpenseModal(false);
            onRefresh();
          }}
          showNotify={showNotify}
        />
      )}
    </div>
  );
};
