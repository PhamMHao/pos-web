import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieIcon, Layers } from 'lucide-react';
import { AssetSummary } from '../dashboard.types';
import { formatVND } from '../../../utils/vietqr';

export interface DashboardAssetStatusChartProps {
  summary: AssetSummary;
}

export const DashboardAssetStatusChart: React.FC<DashboardAssetStatusChartProps> = ({ summary }) => {
  // Aggregate assets by category
  const categoryData = React.useMemo(() => {
    const map = new Map<string, { name: string; count: number; value: number }>();
    summary.assetsList.forEach((asset) => {
      const cat = asset.category || 'Khác';
      const existing = map.get(cat) || { name: cat, count: 0, value: 0 };
      existing.count += 1;
      existing.value += asset.remainingValue || 0;
      map.set(cat, existing);
    });
    return Array.from(map.values());
  }, [summary.assetsList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Donut Pie Chart: Trạng thái vận hành */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              Cơ Cấu Trạng Thái Vận Hành Tài Sản
            </h3>
            <p className="text-xs text-slate-500">Tỷ trọng tài sản hoạt động tốt vs cần bảo trì</p>
          </div>
        </div>

        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {summary.statusPieData.map((entry, index) => (
                  <Cell key={`status-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-lg text-xs">
                        <div className="font-bold text-slate-800">{data.name}</div>
                        <div className="text-slate-600 mt-1">
                          Số lượng: <span className="font-mono font-bold text-indigo-600">{data.value} tài sản</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bar Chart: Phân bổ tài sản theo nhóm ngành & chức năng */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Giá Trị Còn Lại Theo Phân Nhóm Chức Năng
            </h3>
            <p className="text-xs text-slate-500">Vốn tài sản hiện hữu phân bổ theo từng danh mục thiết bị</p>
          </div>
        </div>

        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke="#cbd5e1"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155' }}
                stroke="#cbd5e1"
                width={120}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-lg text-xs">
                        <div className="font-bold text-slate-800">{data.name}</div>
                        <div className="text-slate-600 mt-1">
                          Số lượng: <span className="font-semibold text-slate-800">{data.count} thiết bị</span>
                        </div>
                        <div className="text-emerald-600 font-mono font-bold mt-0.5">
                          Giá trị còn lại: {formatVND(data.value)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Giá trị còn lại" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
