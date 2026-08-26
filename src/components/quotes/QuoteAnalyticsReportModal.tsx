import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  DollarSign,
  Target,
  Layers,
  Filter,
} from 'lucide-react';
import { PriceQuote, Customer, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface QuoteAnalyticsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: PriceQuote[];
  customers?: Customer[];
  settings?: StoreSettings;
}

export const QuoteAnalyticsReportModal: React.FC<QuoteAnalyticsReportModalProps> = ({
  isOpen,
  onClose,
  quotes = [],
  customers = [],
  settings,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  if (!isOpen) return null;

  const filteredQuotes = quotes.filter((q) => {
    if (selectedStatus !== 'all' && q.status !== selectedStatus) return false;
    return true;
  });

  const totalQuotesCount = quotes.length;
  const acceptedQuotes = quotes.filter((q) => q.status === 'approved' || q.status === 'converted_to_order');
  const pendingQuotes = quotes.filter((q) => q.status === 'sent' || q.status === 'draft');
  const rejectedQuotes = quotes.filter((q) => q.status === 'rejected');

  const totalPipelineValue = quotes.reduce((acc, q) => acc + (q.finalTotal || q.totalAmount || 0), 0);
  const totalWonValue = acceptedQuotes.reduce((acc, q) => acc + (q.finalTotal || q.totalAmount || 0), 0);
  const totalPendingValue = pendingQuotes.reduce((acc, q) => acc + (q.finalTotal || q.totalAmount || 0), 0);

  const winRate = totalQuotesCount > 0 ? Math.round((acceptedQuotes.length / totalQuotesCount) * 100) : 0;
  const averageDealSize = acceptedQuotes.length > 0 ? Math.round(totalWonValue / acceptedQuotes.length) : 0;
  const expectedWeightedValue = Math.round(totalWonValue + totalPendingValue * 0.45);

  const industries = React.useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    (quotes || []).forEach((q) => {
      const label = q.customerName || 'Dự án Doanh Nghiệp';
      const val = q.finalTotal || q.totalAmount || 0;
      const cur = map.get(label) || { count: 0, value: 0 };
      map.set(label, { count: cur.count + 1, value: cur.value + val });
    });

    const result = Array.from(map.entries()).map(([name, stat]) => ({
      name,
      count: stat.count,
      value: stat.value,
    }));

    return result.length > 0
      ? result.slice(0, 6)
      : [{ name: 'Báo Giá Dự Án Doanh Nghiệp', count: quotes.length, value: totalPipelineValue }];
  }, [quotes, totalPipelineValue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Báo Cáo Phân Tích Hiệu Suất Báo Giá & Tỷ Lệ Chốt Thầu</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                  B2B Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Thống kê đường ống doanh thu (Pipeline), tỷ lệ chuyển đổi đơn hàng và dự báo doanh thu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-300">Trạng Thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái ({totalQuotesCount})</option>
              <option value="accepted">Đã Chốt Thành Công ({acceptedQuotes.length})</option>
              <option value="sent">Đã Gửi Chờ Duyệt ({pendingQuotes.length})</option>
              <option value="rejected">Chưa Đạt / Hết Hạn ({rejectedQuotes.length})</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">Thời Gian:</span>
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              {(['7d', '30d', '90d', 'all'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTimeRange(t)}
                  className={'px-2.5 py-1 rounded text-xs font-semibold transition-all ' + (selectedTimeRange === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200')}
                >
                  {t === '7d' ? '7 Ngày' : t === '30d' ? '30 Ngày' : t === '90d' ? 'Quý' : 'Tất Cả'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900/60">
          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tổng Pipeline Chào Giá</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-lg font-mono font-black text-white mt-1">{formatVND(totalPipelineValue)}</p>
              <p className="text-[10px] text-slate-500 mt-1">{totalQuotesCount} bảng báo giá dự án</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Doanh Thu Đã Chốt (Won)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-lg font-mono font-black text-emerald-400 mt-1">{formatVND(totalWonValue)}</p>
              <p className="text-[10px] text-emerald-500 mt-1">{acceptedQuotes.length} hợp đồng thành công</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tỷ Lệ Thắng Thầu (Win Rate)</span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-lg font-mono font-black text-amber-400 mt-1">{winRate}%</p>
              <p className="text-[10px] text-slate-500 mt-1">Hợp đồng chốt / Tổng báo giá</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Dự Báo Doanh Thu Kỳ Vọng</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-lg font-mono font-black text-cyan-400 mt-1">{formatVND(expectedWeightedValue)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Tính theo xác suất chuyển đổi</p>
            </div>
          </div>

          {/* Industry Breakdown Table */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Phân Bổ Doanh Thu Theo Nhóm Ngành Dự Án</span>
            </h4>
            <div className="space-y-3">
              {industries.map((ind, idx) => {
                const percent = Math.round((ind.value / (totalPipelineValue || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{ind.name} ({ind.count} dự án)</span>
                      <span className="font-mono font-bold text-white">{formatVND(ind.value)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                        style={{ width: Math.min(100, percent) + '%' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
