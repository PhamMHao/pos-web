import React from 'react';
import { Crown, Users, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { TopVipCustomerItem } from '../dashboard.types';

export interface DashboardVipCustomersTableProps {
  vipCustomers: TopVipCustomerItem[];
  onNavigate?: (tab: string) => void;
}

export const DashboardVipCustomersTable: React.FC<DashboardVipCustomersTableProps> = ({
  vipCustomers,
  onNavigate,
}) => {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'diamond':
      case 'Kim Cương':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">💎 Kim Cương</span>;
      case 'gold':
      case 'Vàng':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">🥇 Vàng</span>;
      case 'silver':
      case 'Bạc':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">🥈 Bạc</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">🥉 Đồng</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Top Khách Hàng VIP & Đối Tác Doanh Số Cao
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Xếp hạng theo tổng giá trị chi tiêu, giá trị trung bình/đơn và tình trạng công nợ
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('customers')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Quản lý khách hàng <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold bg-slate-50">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Khách hàng</th>
              <th className="py-3 px-4">Hạng thành viên</th>
              <th className="py-3 px-4 text-center">Số đơn mua</th>
              <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
              <th className="py-3 px-4 text-right">AOV (TB/Đơn)</th>
              <th className="py-3 px-4 text-right">Dư nợ hiện tại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {vipCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Chưa có dữ liệu khách hàng giao dịch trong kỳ
                </td>
              </tr>
            ) : (
              vipCustomers.slice(0, 8).map((customer, index) => {
                const aov = customer.aov || (customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0);
                const hasDebt = (customer.debt || 0) > 0;

                return (
                  <tr key={customer.id || index} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{customer.name}</div>
                      <div className="text-xs text-slate-500 font-normal">{customer.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getTierBadge(customer.tier)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {customer.orderCount} đơn
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatVND(customer.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 text-xs">
                      {formatVND(aov)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {hasDebt ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          {formatVND(customer.debt || 0)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> 0 đ
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
