import React from 'react';
import { UserCheck, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { formatVND } from '../../../utils/vietqr';
import { HrPerformanceItem, PALETTE } from '../dashboard.types';

export interface DashboardHrChartsProps {
  hrPerformanceData: HrPerformanceItem[];
}

export const DashboardHrCharts: React.FC<DashboardHrChartsProps> = ({ hrPerformanceData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Doanh số vs Chỉ tiêu KPI */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Doanh Số vs Chỉ Tiêu KPI Từng Nhân Sự</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh doanh số thực tế đã tạo ra so với chỉ tiêu giao đầu kỳ của từng nhân viên.
          </p>
        </div>

        {hrPerformanceData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">Chưa có dữ liệu nhân sự</div>
        ) : (
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hrPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                    name === 'currentSales' ? 'Doanh Số Đạt Được' : 'Chỉ Tiêu KPI',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    value === 'currentSales' ? 'Doanh Số Đạt Được' : 'Chỉ Tiêu KPI'
                  }
                />
                <Bar
                  dataKey="currentSales"
                  fill={PALETTE.blue}
                  radius={[4, 4, 0, 0]}
                  name="currentSales"
                />
                <Bar
                  dataKey="salesKpiTarget"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  name="salesKpiTarget"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 2: Thời gian làm việc & Tỷ lệ chuyên cần */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-cyan-600" />
            <span>Thời Gian Làm Việc &amp; Tỷ Lệ Chuyên Cần</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tổng số giờ công lũy kế và mức độ kỷ luật lao động đi làm đúng giờ.
          </p>
        </div>

        {hrPerformanceData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">Chưa có dữ liệu chấm công</div>
        ) : (
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={hrPerformanceData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  unit="h"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#06b6d4"
                  fontSize={11}
                  unit="%"
                  domain={[80, 100]}
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
                    name === 'workHours' ? `${val} giờ` : `${val}%`,
                    name === 'workHours' ? 'Tổng Giờ Công' : 'Tỷ Lệ Chuyên Cần',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    value === 'workHours' ? 'Tổng Giờ Công (h)' : 'Chuyên Cần (%)'
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="workHours"
                  fill={PALETTE.emerald}
                  radius={[4, 4, 0, 0]}
                  name="workHours"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke={PALETTE.cyan}
                  strokeWidth={3}
                  dot={{ r: 4, fill: PALETTE.cyan }}
                  name="attendanceRate"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
