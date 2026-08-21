import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Order, Product } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface AnalyticsViewProps {
  orders: Order[];
  products: Product[];
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders = [],
  products = [],
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'all'>('all');

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // KPI Calculations
  const completedOrders = useMemo(() => {
    return safeOrders.filter((o) => o && (o.status === 'completed' || o.paymentStatus === 'paid'));
  }, [safeOrders]);

  const totalRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + o.total, 0);
  }, [completedOrders]);

  const totalCost = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + o.totalCost, 0);
  }, [completedOrders]);

  const grossProfit = useMemo(() => {
    return totalRevenue - totalCost;
  }, [totalRevenue, totalCost]);

  const profitMargin = useMemo(() => {
    return totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
  }, [totalRevenue, grossProfit]);

  const averageOrderValue = useMemo(() => {
    return completedOrders.length > 0
      ? Math.round(totalRevenue / completedOrders.length)
      : 0;
  }, [completedOrders, totalRevenue]);

  // Channel Breakdown
  const channelData = useMemo(() => {
    const map: Record<string, { name: string; value: number; count: number }> = {};
    completedOrders.forEach((o) => {
      if (!map[o.channel]) {
        map[o.channel] = { name: o.channel, value: 0, count: 0 };
      }
      map[o.channel].value += o.total;
      map[o.channel].count += 1;
    });
    return Object.values(map);
  }, [completedOrders]);

  // Top Selling Products
  const topProductsData = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    completedOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.productName.length > 20 ? item.productName.slice(0, 20) + '...' : item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.total;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [completedOrders]);

  // Daily Timeline Mock Chart
  const timelineData = useMemo(() => {
    return [
      { date: '08/02', DoanhThu: 4200000, LoiNhuan: 2100000 },
      { date: '09/02', DoanhThu: 5800000, LoiNhuan: 2900000 },
      { date: '10/02', DoanhThu: 3900000, LoiNhuan: 1850000 },
      { date: '11/02', DoanhThu: 7400000, LoiNhuan: 3900000 },
      { date: '12/02', DoanhThu: 6200000, LoiNhuan: 3100000 },
      { date: '13/02 (Hôm nay)', DoanhThu: totalRevenue, LoiNhuan: grossProfit },
    ];
  }, [totalRevenue, grossProfit]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>Báo Cáo Tài Chính & Hiệu Suất Bán Hàng</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Phân tích chuyên sâu doanh thu thuần, lợi nhuận gộp, tỷ trọng đa kênh và sản phẩm chủ lực.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'today'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === '7days'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 ngày qua
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'month'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toàn bộ
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Doanh thu thuần:</span>
          <div className="text-xl font-extrabold font-mono text-emerald-400">
            {formatVND(totalRevenue)}
          </div>
          <div className="text-[10px] text-emerald-300/80 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Tăng 18.5% so với kỳ trước</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Giá vốn hàng bán (COGS):</span>
          <div className="text-xl font-extrabold font-mono text-slate-300">
            {formatVND(totalCost)}
          </div>
          <div className="text-[10px] text-slate-500">Giá nhập xuất kho</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Lợi nhuận gộp:</span>
          <div className="text-xl font-extrabold font-mono text-cyan-400">
            +{formatVND(grossProfit)}
          </div>
          <div className="text-[10px] text-cyan-300/80 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Biên lợi nhuận: {profitMargin}%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Đơn hàng hoàn tất:</span>
          <div className="text-xl font-extrabold font-mono text-amber-400">
            {completedOrders.length}{' '}
            <span className="text-xs text-slate-400 font-sans">đơn</span>
          </div>
          <div className="text-[10px] text-slate-500">Tỷ lệ hủy: &lt; 2%</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-400 font-medium">Giá trị trung bình đơn (AOV):</span>
          <div className="text-xl font-extrabold font-mono text-indigo-300">
            {formatVND(averageOrderValue)}
          </div>
          <div className="text-[10px] text-indigo-400/80">Trung bình mỗi khách</div>
        </div>
      </div>

      {/* Revenue & Profit Area Chart */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Xu Hướng Tăng Trưởng Doanh Thu & Lợi Nhuận Gộp</span>
          </h3>
          <span className="text-xs text-slate-400">Đơn vị: VNĐ</span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(val: any) => formatVND(Number(val))}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="DoanhThu"
                name="Doanh Thu"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="LoiNhuan"
                name="Lợi Nhuận Gộp"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorProf)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts: Channel Distribution & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Channel Breakdown */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Cơ Cấu Doanh Thu Theo Kênh Bán</span>
            </h3>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {channelData.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có dữ liệu kênh</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => formatVND(Number(val))}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Best Sellers */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Top Sản Phẩm Mang Lại Doanh Thu Cao Nhất</span>
            </h3>
          </div>

          <div className="h-60 w-full">
            {topProductsData.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-20">
                Chưa có dữ liệu sản phẩm bán ra
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={10}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => formatVND(Number(val))}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Doanh Thu (VNĐ)"
                    fill="#10b981"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
