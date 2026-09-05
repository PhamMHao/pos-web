import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Award,
} from 'lucide-react';
import { ApprovalAnalyticsData } from './approvals.types';

interface ApprovalAnalyticsTabProps {
  analytics: ApprovalAnalyticsData | null;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ApprovalAnalyticsTab: React.FC<ApprovalAnalyticsTabProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
        Đang tải dữ liệu phân tích KPI quy trình...
      </div>
    );
  }

  const { kpis, stageAnalytics } = analytics;

  const pieData = [
    { name: 'Đã hoàn tất', value: kpis.approved, color: '#10b981' },
    { name: 'Đang xử lý', value: kpis.inProgress, color: '#3b82f6' },
    { name: 'Yêu cầu sửa (Rework)', value: kpis.rework, color: '#f59e0b' },
    { name: 'Bị từ chối', value: kpis.rejected, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-5 select-none">
      {/* 3 Thẻ Chỉ Số KPI Hiệu Suất Cao Cấp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Tỷ Lệ Tuân Thủ Hạn Mức SLA
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {kpis.complianceRate}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hồ sơ được duyệt đúng thời gian cam kết
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Thời Gian Duyệt Trung Bình
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {kpis.avgApprovalHours} giờ
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Từ khi tạo đến khi có chữ ký cấp cuối
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Cảnh Báo Điểm Nghẽn Quy Trình
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {kpis.overdueCount > 0 ? `${kpis.overdueCount} Hồ sơ trễ` : 'Không có'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Cần lãnh đạo đôn đốc xử lý
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Biểu Đồ Trực Quan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Biểu đồ cột: Tiến độ qua 8 khâu chuỗi cung ứng */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hiệu Suất Phê Duyệt Theo Từng Khâu Chuỗi Cung Ứng
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Số lượng hồ sơ đã duyệt vs đang chờ trên 8 phân hệ vận hành
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Realtime MSSQL
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="approved" name="Đã duyệt" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Đang chờ" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn: Cơ cấu trạng thái */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Cơ Cấu Trạng Thái Hồ Sơ
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Phân bổ tỷ trọng các phiếu trình ký</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng Đánh Giá Điểm Nghẽn Từng Khâu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bảng Kiểm Soát Điểm Nghẽn &amp; Tỷ Lệ Hoàn Tất 8 Khâu Doanh Nghiệp
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <th className="py-2.5 px-4">Khâu Chuỗi Cung Ứng</th>
              <th className="py-2.5 px-4 text-center">Tổng Hồ Sơ</th>
              <th className="py-2.5 px-4 text-center">Đã Ký Duyệt</th>
              <th className="py-2.5 px-4 text-center">Đang Chờ Xử Lý</th>
              <th className="py-2.5 px-4 text-center">Tỷ Lệ Hoàn Thành</th>
              <th className="py-2.5 px-4 text-center">Đánh Giá Tiến Độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {stageAnalytics.map((s) => (
              <tr key={s.moduleType} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                <td className="py-2.5 px-4 text-center font-bold">{s.total}</td>
                <td className="py-2.5 px-4 text-center text-emerald-600 font-bold">{s.approved}</td>
                <td className="py-2.5 px-4 text-center text-blue-600 font-bold">{s.pending}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className="font-bold">{s.complianceRate}%</span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  {s.complianceRate >= 75 ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Rất Tốt
                    </span>
                  ) : s.complianceRate >= 50 ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Bình Thường
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Cần Đẩy Nhanh
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
