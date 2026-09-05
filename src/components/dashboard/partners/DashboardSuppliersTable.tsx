import React from 'react';
import { Truck, ArrowUpRight, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { SupplierPerformanceItem } from '../dashboard.types';

export interface DashboardSuppliersTableProps {
  suppliers: SupplierPerformanceItem[];
  onNavigate?: (tab: string) => void;
}

export const DashboardSuppliersTable: React.FC<DashboardSuppliersTableProps> = ({
  suppliers,
  onNavigate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            Đánh Giá Nhà Cung Cấp & Tiến Độ Cung Ứng
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi quy mô đơn đặt hàng (PO), điểm tín nhiệm chuỗi cung ứng và công nợ phải trả
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('suppliers')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Quản lý nhà cung cấp <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold bg-slate-50">
              <th className="py-3 px-4">Nhà cung cấp</th>
              <th className="py-3 px-4">Phân loại & Hạng</th>
              <th className="py-3 px-4 text-center">Đơn đặt PO</th>
              <th className="py-3 px-4 text-right">Tổng giá trị PO</th>
              <th className="py-3 px-4 text-center">Giao đúng hẹn</th>
              <th className="py-3 px-4 text-center">Điểm tín nhiệm</th>
              <th className="py-3 px-4 text-right">Công nợ phải trả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Chưa có dữ liệu nhà cung cấp phát sinh giao dịch
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                const hasDebt = supplier.currentDebt > 0;
                return (
                  <tr key={supplier.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{supplier.name}</div>
                      <div className="text-xs text-slate-500 font-normal font-mono">
                        {supplier.code} • {supplier.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-slate-800">{supplier.category}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 text-[11px] rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                        {supplier.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {supplier.poCount} PO
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatVND(supplier.totalPOValue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        {supplier.onTimeRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {supplier.overallScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {hasDebt ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          {formatVND(supplier.currentDebt)}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">
                          0 đ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
