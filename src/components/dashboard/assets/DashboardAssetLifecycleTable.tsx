import React from 'react';
import { Landmark, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { formatVND } from '../../../utils/vietqr';
import { AssetLifecycleItem } from '../dashboard.types';

export interface DashboardAssetLifecycleTableProps {
  assetsList: AssetLifecycleItem[];
  onNavigate?: (tab: string) => void;
}

export const DashboardAssetLifecycleTable: React.FC<DashboardAssetLifecycleTableProps> = ({
  assetsList,
  onNavigate,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Hoạt động tốt
          </span>
        );
      case 'maintenance_required':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" /> Cần bảo trì
          </span>
        );
      case 'broken':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> Đang hỏng hóc
          </span>
        );
      case 'liquidated':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
            <XCircle className="w-3 h-3" /> Đã thanh lý
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            Dòng Đời Vận Hành & Tiến Độ Khấu Hao Tài Sản Cố Định
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng chi tiết theo dõi nguyên giá, hao mòn trích trước, giá trị còn lại và người chịu trách nhiệm
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('assets')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Quản lý tài sản chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold bg-slate-50">
              <th className="py-3 px-4">Tài sản / Thiết bị</th>
              <th className="py-3 px-4">Phân loại & Người giữ</th>
              <th className="py-3 px-4 text-center">Ngày đưa vào SD</th>
              <th className="py-3 px-4 text-right">Nguyên giá</th>
              <th className="py-3 px-4 text-center">Tiến độ khấu hao</th>
              <th className="py-3 px-4 text-right">Giá trị còn lại</th>
              <th className="py-3 px-4 text-center">Trạng thái kỹ thuật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {assetsList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <Landmark className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Chưa có dữ liệu danh mục tài sản cố định
                </td>
              </tr>
            ) : (
              assetsList.map((asset) => {
                const progress = Math.min(100, Math.max(0, asset.depreciationProgress || 0));
                return (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{asset.name}</div>
                      <div className="text-xs text-slate-500 font-normal font-mono">
                        Mã: {asset.code}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-slate-800">{asset.category}</div>
                      <div className="text-xs text-slate-500">Người giữ: {asset.assignedTo || 'Chưa bàn giao'}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">
                      {asset.purchaseDate || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900 font-semibold text-xs">
                      {formatVND(asset.originalValue)}
                    </td>
                    <td className="py-3 px-4 text-center min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                        <span className="text-slate-500">{asset.monthsUsed || 0}/{asset.depreciationMonths} thg</span>
                        <span className="font-bold text-amber-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress >= 90 ? 'bg-rose-500' : progress >= 60 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 text-xs">
                      {formatVND(asset.remainingValue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(asset.status)}
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
