import React from 'react';
import { ShoppingBag, Wallet } from 'lucide-react';
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
} from 'recharts';
import { formatVND } from '../../utils/vietqr';
import { ChannelDataItem, PaymentMethodDataItem, PALETTE } from './dashboard.types';

export interface DashboardChannelAndPaymentProps {
  channelData: ChannelDataItem[];
  paymentMethodData: PaymentMethodDataItem[];
}

export const DashboardChannelAndPayment: React.FC<DashboardChannelAndPaymentProps> = ({
  channelData,
  paymentMethodData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Doanh Thu Theo Kênh (6 Cột) */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <span>Phân Bổ Doanh Số Theo Kênh Bán Hàng</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            So sánh hiệu quả giữa bán tại quầy (POS), website và các sàn thương mại điện tử.
          </p>
        </div>

        {channelData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">Chưa có dữ liệu kênh bán</div>
        ) : (
          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(val: any, name: any, item: any) => [
                    `${formatVND(Number(val))} (${item.payload.count} đơn)`,
                    'Doanh Thu',
                  ]}
                />
                <Bar dataKey="value" fill={PALETTE.indigo} radius={[6, 6, 0, 0]} name="Doanh Thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Phương Thức Thanh Toán (6 Cột) */}
      <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-cyan-600" />
            <span>Cơ Cấu Phương Thức Thanh Toán</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tỷ lệ thanh toán không tiền mặt (VietQR, thẻ POS) so với tiền mặt và ghi nợ.
          </p>
        </div>

        {paymentMethodData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">Chưa có giao dịch thanh toán</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      color: '#0f172a',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${formatVND(Number(val))} (${item.payload.percentage}%)`,
                      item.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Phương Thức Thanh Toán */}
            <div className="space-y-2">
              {paymentMethodData.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-mono font-bold text-slate-900">{formatVND(item.value)}</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
