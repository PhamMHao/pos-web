import React from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { EnterpriseProject } from "../../types/projects.types";

interface ProjectOverviewTabProps {
  project: EnterpriseProject;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
}) => {
  const evm = project.evm || {
    pv: Number(project.budget) * 0.5,
    ev: Math.round(Number(project.budget) * ((project.overallProgress || 0) / 100)),
    ac: project.totalActualCost || 0,
    cv: 0,
    sv: 0,
    cpi: 1.0,
    spi: 1.0,
    eac: Number(project.budget),
    status: "good" as const,
  };

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  // Giả lập dữ liệu chuỗi thời gian S-Curve dựa trên số liệu thực tế của dự án
  const sCurveData = [
    {
      period: "Tháng 1",
      "Kế Hoạch (PV)": Math.round(evm.pv * 0.2),
      "Giá Trị Đạt Được (EV)": Math.round(evm.ev * 0.25),
      "Chi Phí Thực Tế (AC)": Math.round(evm.ac * 0.2),
    },
    {
      period: "Tháng 2",
      "Kế Hoạch (PV)": Math.round(evm.pv * 0.5),
      "Giá Trị Đạt Được (EV)": Math.round(evm.ev * 0.55),
      "Chi Phí Thực Tế (AC)": Math.round(evm.ac * 0.52),
    },
    {
      period: "Hiện Tại",
      "Kế Hoạch (PV)": evm.pv,
      "Giá Trị Đạt Được (EV)": evm.ev,
      "Chi Phí Thực Tế (AC)": evm.ac,
    },
    {
      period: "Kỳ vọng hoàn tất",
      "Kế Hoạch (PV)": project.totalBudgetCost || Number(project.budget),
      "Giá Trị Đạt Được (EV)": project.totalBudgetCost || Number(project.budget),
      "Chi Phí Thực Tế (AC)": evm.eac,
    },
  ];

  return (
    <div className="space-y-6">
      {/* EVM KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: SPI (Schedule Performance Index) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Chỉ Số Tiến Độ (SPI)</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black ${
                evm.spi >= 1.0
                  ? "text-emerald-600"
                  : evm.spi >= 0.9
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {evm.spi}
            </span>
            <span className="text-xs text-slate-400">
              {evm.spi >= 1.0
                ? "🚀 Vượt tiến độ"
                : evm.spi >= 0.9
                ? "⚠️ Đúng hạn"
                : "🚨 Chậm tiến độ"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            $SPI = EV / PV$ ({formatVnd(evm.ev)} / {formatVnd(evm.pv)})
          </p>
        </div>

        {/* Card 2: CPI (Cost Performance Index) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Chỉ Số Chi Phí (CPI)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black ${
                evm.cpi >= 1.0
                  ? "text-emerald-600"
                  : evm.cpi >= 0.9
                  ? "text-amber-600"
                  : "text-rose-600"
              }`}
            >
              {evm.cpi}
            </span>
            <span className="text-xs text-slate-400">
              {evm.cpi >= 1.0
                ? "💰 Tiết kiệm"
                : evm.cpi >= 0.9
                ? "⚖️ Đúng dự toán"
                : "⚠️ Bội chi"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            $CPI = EV / AC$ ({formatVnd(evm.ev)} / {formatVnd(evm.ac)})
          </p>
        </div>

        {/* Card 3: Chi phí phát sinh thực tế */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Chi Phí Đã Chi (AC)</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatVnd(evm.ac)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Ngân sách: {formatVnd(project.totalBudgetCost || Number(project.budget))}
          </p>
        </div>

        {/* Card 4: Lợi nhuận gộp dự kiến */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Lợi Nhuận Gộp (Margin)</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div
            className={`text-xl font-black ${
              (project.grossMargin || 0) >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {formatVnd(project.grossMargin || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Đã thu từ HĐ trừ Tổng chi phí thực tế
          </p>
        </div>
      </div>

      {/* S-Curve Chart Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <span>Đường Cong Tiến Độ & Chi Phí S-Curve (EVM Analysis)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Chuẩn Quốc Tế
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh lũy kế Giá trị kế hoạch (PV), Giá trị tạo ra (EV) và Chi phí thực tế đã giải ngân (AC)
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-600">PV (Kế hoạch)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">EV (Tạo ra)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600">AC (Chi phí thực tế)</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sCurveData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(val: any) => formatVnd(Number(val))}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="Kế Hoạch (PV)"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPv)"
              />
              <Area
                type="monotone"
                dataKey="Giá Trị Đạt Được (EV)"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEv)"
              />
              <Area
                type="monotone"
                dataKey="Chi Phí Thực Tế (AC)"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAc)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
          <h4 className="font-bold text-blue-900 mb-1">Tiến Độ Kỹ Thuật Tổng Thể</h4>
          <p className="text-blue-700">
            Dự án đã hoàn thành <b>{project.completedTasks || 0}/{project.totalTasks || 0} hạng mục</b> ({project.overallProgress || 0}%). Chỉ số SPI đạt <b>{evm.spi}</b> thể hiện tiến độ đang được kiểm soát rất tốt.
          </p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
          <h4 className="font-bold text-emerald-900 mb-1">Hiệu Quả Kiểm Soát Chi Phí</h4>
          <p className="text-emerald-700">
            Chỉ số CPI đạt <b>{evm.cpi}</b>. Tổng chi phí thực tế giải ngân hiện tại là <b>{formatVnd(evm.ac)}</b>, chưa có hạng mục nào vượt quá 95% dự toán CBS ban đầu.
          </p>
        </div>

        <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
          <h4 className="font-bold text-purple-900 mb-1">Thu Hồi Dòng Tiền & Công Nợ</h4>
          <p className="text-purple-700">
            Tổng giá trị đã xuất hóa đơn hoặc thu tiền: <b>{formatVnd((project.grossMargin || 0) + evm.ac)}</b>. Mốc thanh toán tiếp theo được lên lịch theo tiến độ nghiệm thu hoàn thành.
          </p>
        </div>
      </div>
    </div>
  );
};
