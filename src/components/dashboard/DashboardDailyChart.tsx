import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Table as TableIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { formatVND } from '../../utils/vietqr';
import { DailyTimelineItem, DailyChartType, PALETTE } from './dashboard.types';

export interface DashboardDailyChartProps {
  dailyTimelineData: DailyTimelineItem[];
  dailyChartType: DailyChartType;
  setDailyChartType: (t: DailyChartType) => void;
}

export const DashboardDailyChart: React.FC<DashboardDailyChartProps> = ({
  dailyTimelineData,
  dailyChartType,
  setDailyChartType,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Diễn Biến Doanh Thu &amp; Lợi Nhuận Theo Ngày</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xu hướng tăng trưởng tài chính thực tế, so sánh doanh thu và lợi nhuận gộp từng ngày.
          </p>
        </div>

        {/* Toggle View: Area vs Bar vs Data Table */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setDailyChartType('area')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dailyChartType === 'area'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vùng (Area)
          </button>
          <button
            onClick={() => setDailyChartType('bar')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dailyChartType === 'bar'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cột Kép (Bar)
          </button>
          <button
            onClick={() => setDailyChartType('table')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              dailyChartType === 'table'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Bảng Số Liệu</span>
          </button>
        </div>
      </div>

      {dailyTimelineData.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <span>Chưa có dữ liệu đơn hàng trong khoảng thời gian này</span>
        </div>
      ) : dailyChartType === 'table' ? (
        /* Bảng dữ liệu chi tiết từng ngày */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ngày</th>
                <th className="py-2.5 px-3 text-center">Số Đơn</th>
                <th className="py-2.5 px-3 text-right">Doanh Thu Thuần</th>
                <th className="py-2.5 px-3 text-right">Giá Vốn Xuất Kho</th>
                <th className="py-2.5 px-3 text-right">Lợi Nhuận Gộp</th>
                <th className="py-2.5 px-3 text-right">Biên Lợi Nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyTimelineData.map((row) => (
                <tr key={row.fullDate} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.fullDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono">
                      {row.OrderCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-600">
                    {formatVND(row.DoanhThu)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                    {formatVND(row.GiaVon)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                    +{formatVND(row.LoiNhuan)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                    {row.margin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Biểu đồ Recharts AreaChart hoặc BarChart */
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {dailyChartType === 'area' ? (
              <AreaChart data={dailyTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLoiNhuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) =>
                    val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : val.toLocaleString('vi-VN')
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: '#0f172a',
                  }}
                  formatter={(val: any, name: any) => [
                    formatVND(Number(val)),
                    name === 'DoanhThu' ? 'Doanh Thu' : 'Lợi Nhuận Gộp',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (value === 'DoanhThu' ? 'Doanh Thu' : 'Lợi Nhuận Gộp')}
                />
                <Area
                  type="monotone"
                  dataKey="DoanhThu"
                  stroke={PALETTE.blue}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDoanhThu)"
                  name="DoanhThu"
                />
                <Area
                  type="monotone"
                  dataKey="LoiNhuan"
                  stroke={PALETTE.emerald}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLoiNhuan)"
                  name="LoiNhuan"
                />
              </AreaChart>
            ) : (
              <BarChart data={dailyTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) =>
                    val >= 1000000 ? `${(val / 1000000).toFixed(0)}tr` : val.toLocaleString('vi-VN')
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: '#0f172a',
                  }}
                  formatter={(val: any, name: any) => [
                    formatVND(Number(val)),
                    name === 'DoanhThu' ? 'Doanh Thu' : 'Lợi Nhuận Gộp',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (value === 'DoanhThu' ? 'Doanh Thu' : 'Lợi Nhuận Gộp')}
                />
                <Bar dataKey="DoanhThu" fill={PALETTE.blue} radius={[4, 4, 0, 0]} name="DoanhThu" />
                <Bar dataKey="LoiNhuan" fill={PALETTE.emerald} radius={[4, 4, 0, 0]} name="LoiNhuan" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
