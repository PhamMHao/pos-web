import React from 'react';
import { Crown, CreditCard, Truck, AlertTriangle } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { PartnersKpiSummary } from '../dashboard.types';

export interface DashboardPartnersKpiCardsProps {
  summary: PartnersKpiSummary;
}

export const DashboardPartnersKpiCards: React.FC<DashboardPartnersKpiCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Doanh số VIP */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500" />
          Doanh Số Khách VIP:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-amber-600">
          {formatVND(summary.vipTotalSpent)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Top đối tác chiến lược</span>
          <span className="text-amber-700 font-bold">VIP Leaderboard</span>
        </div>
      </div>

      {/* KPI 2: Công nợ khách hàng cần thu */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-blue-600" />
          Công Nợ Phải Thu Khách:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-blue-600">
          {formatVND(summary.customerTotalDebt)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Khách nợ quá hạn</span>
          <span className="text-blue-700 font-bold">Cần đôn đốc thu</span>
        </div>
      </div>

      {/* KPI 3: Quy mô PO nhập kho */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-indigo-600" />
          Quy Mô Đơn Hàng PO Nhập:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-indigo-600">
          {formatVND(summary.totalPOValue)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Tổng giá trị đơn đặt hàng</span>
          <span className="text-indigo-700 font-bold">Chuỗi cung ứng</span>
        </div>
      </div>

      {/* KPI 4: Công nợ phải trả NCC */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-rose-300 transition-all shadow-xs space-y-1">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Công Nợ Phải Trả Nhà Cung Cấp:
        </span>
        <div className="text-xl md:text-2xl font-black font-mono text-rose-600">
          {formatVND(summary.supplierTotalDebt)}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Số dư nợ NCC hiện tại</span>
          <span className="text-rose-700 font-bold">Theo dõi thanh toán</span>
        </div>
      </div>
    </div>
  );
};
