import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Truck,
} from 'lucide-react';
import { Product } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { RestockUrgentItem, TopVipCustomerItem } from './dashboard.types';

export interface DashboardActionableIntelligenceProps {
  restockUrgentList: RestockUrgentItem[];
  topVipCustomers: TopVipCustomerItem[];
  onNavigate?: (tab: string) => void;
  onOpenPO?: (product?: Product) => void;
}

export const DashboardActionableIntelligence: React.FC<DashboardActionableIntelligenceProps> = ({
  restockUrgentList,
  topVipCustomers,
  onNavigate,
  onOpenPO,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cảnh Báo Nhập Hàng Cấp Bách (6 Cột) */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Cảnh Báo Nhập Hàng Cấp Bách (Restock)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các sản phẩm bán chạy nhưng tồn kho dưới ngưỡng an toàn (minStock).
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('suppliers')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>QL Nhập Hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {restockUrgentList.length === 0 ? (
          <div className="text-center py-6 text-emerald-600 text-xs font-semibold flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tất cả mặt hàng bán chạy đang ở mức tồn kho an toàn!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {restockUrgentList.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center space-x-2 mt-0.5">
                    <span>SKU: {item.sku || '---'}</span>
                    <span>•</span>
                    <span className="text-amber-600 font-bold">Đã bán: {item.soldCount} món</span>
                    <span>•</span>
                    <span className="text-rose-600 font-bold">
                      Tồn: {item.stock} / Định mức: {item.minStock}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                    + Đề xuất {item.suggestedReorder}
                  </span>
                  <button
                    onClick={() => {
                      if (onOpenPO) {
                        onOpenPO(item.product);
                      } else if (onNavigate) {
                        onNavigate('suppliers');
                      }
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <Truck className="w-3 h-3" />
                    <span>Đặt PO</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Khách Hàng VIP (6 Cột) */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Top Khách Hàng Thân Thiết (VIP Leaderboard)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vinh danh các đối tác và khách hàng có đóng góp doanh số cao nhất.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>Xem CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {topVipCustomers.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">Chưa có giao dịch khách hàng</div>
        ) : (
          <div className="space-y-2">
            {topVipCustomers.map((cust, idx) => (
              <div
                key={cust.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 shadow-2xs">
                    {idx === 0 ? '👑' : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate flex items-center space-x-1.5">
                      <span>{cust.name}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                          cust.tier === 'Kim Cương'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : cust.tier === 'Vàng'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cust.tier}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      <span>SĐT: {cust.phone}</span>
                      <span className="mx-1">•</span>
                      <span>{cust.orderCount} đơn hàng thành công</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-blue-600">{formatVND(cust.totalSpent)}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Tổng chi tiêu</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
