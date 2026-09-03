import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Users,
  Award,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Search,
  Plus,
  Phone,
  Mail,
  Briefcase,
  FileCheck,
  ShieldCheck,
  Edit2,
  Trash2,
  Sliders,
  Printer,
  Download,
  FileText,
  Percent,
} from 'lucide-react';
import { Employee, LaborContract, StoreSettings, KpiEvaluation } from '../../types';
import { LaborContractManagerView } from '../contracts/LaborContractManagerView';
import { NewEmployeeModal } from './NewEmployeeModal';
import { KpiScoringModal } from './KpiScoringModal';
import { KpiEvaluationReportModal } from './KpiEvaluationReportModal';
import { formatVND } from '../../utils/currency';
import { generateInitialKpiEvaluations } from '../../utils/kpiDefaults';

interface HrViewProps {
  employees?: Employee[];
  laborContracts?: LaborContract[];
  setLaborContracts?: (contracts: LaborContract[] | ((prev: LaborContract[]) => LaborContract[])) => void;
  settings?: Partial<StoreSettings>;
  onSaveEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

export const HrView: React.FC<HrViewProps> = ({
  employees = [],
  laborContracts = [],
  setLaborContracts = () => {},
  settings = {},
  onSaveEmployee,
  onDeleteEmployee,
}) => {
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeContracts = Array.isArray(laborContracts) ? laborContracts : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'contracts' | 'kpi'>('staff');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // KPI Evaluations State
  const [kpiEvaluations, setKpiEvaluations] = useState<KpiEvaluation[]>(() => {
    return generateInitialKpiEvaluations(safeEmployees);
  });
  const [scoringEval, setScoringEval] = useState<KpiEvaluation | null>(null);
  const [reportModalEvalId, setReportModalEvalId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [kpiRankFilter, setKpiRankFilter] = useState<string>('all');
  const [kpiRoleFilter, setKpiRoleFilter] = useState<string>('all');

  const filteredEmployees = safeEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayroll = safeEmployees.reduce((sum, e) => {
    const commission = (e.currentSales * e.commissionRate) / 100;
    return sum + e.baseSalary + commission;
  }, 0);

  // Filtered KPI Evaluations
  const filteredKpiEvaluations = useMemo(() => {
    return kpiEvaluations.filter((ev) => {
      if (kpiRankFilter !== 'all' && ev.rank !== kpiRankFilter) return false;
      if (kpiRoleFilter !== 'all' && ev.role !== kpiRoleFilter) return false;
      if (searchTerm.trim()) {
        const kw = searchTerm.toLowerCase();
        const matchName = ev.employeeName.toLowerCase().includes(kw);
        const matchCode = ev.employeeCode.toLowerCase().includes(kw);
        const matchRole = ev.role.toLowerCase().includes(kw);
        if (!matchName && !matchCode && !matchRole) return false;
      }
      return true;
    });
  }, [kpiEvaluations, kpiRankFilter, kpiRoleFilter, searchTerm]);

  // KPI Summary Statistics
  const totalKpiBonus = kpiEvaluations.reduce((sum, e) => sum + e.performanceBonus, 0);
  const totalGrossKpiPayroll = kpiEvaluations.reduce((sum, e) => sum + e.totalGrossPayout, 0);
  const avgKpiScore =
    kpiEvaluations.length > 0
      ? (kpiEvaluations.reduce((sum, e) => sum + e.finalScore, 0) / kpiEvaluations.length).toFixed(1)
      : '0';

  const rankACount = kpiEvaluations.filter((e) => e.rank === 'A+' || e.rank === 'A').length;

  const handleSaveKpiEvaluation = (updated: KpiEvaluation) => {
    setKpiEvaluations((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setScoringEval(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Quản Trị Nhân Sự HR, KPI &amp; Hợp Đồng Lao Động</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ERP HR &amp; KPI 2026
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Chấm điểm KPI 3 cấp, tính thưởng hiệu suất tự động (Điều 104 BLLĐ 2019) và ký HĐLĐ điện tử
            </p>
          </div>
        </div>

        {/* 3 Tabs switch */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhân Sự &amp; Lương ({safeEmployees.length})
          </button>
          <button
            onClick={() => setActiveTab('kpi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'kpi'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Đánh Giá KPI &amp; Khen Thưởng (BLLĐ 2019)</span>
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'contracts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Hợp Đồng Lao Động Điện Tử ({safeContracts.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 2: HỢP ĐỒNG LAO ĐỘNG ĐIỆN TỬ                                          */}
      {/* ========================================================================= */}
      {activeTab === 'contracts' && (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/30">
          <LaborContractManagerView
            laborContracts={safeContracts}
            setLaborContracts={setLaborContracts}
            employees={safeEmployees}
            settings={settings as StoreSettings}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ĐÁNH GIÁ KPI & KHEN THƯỞNG (ĐIỀU 104 BLLĐ 2019)                   */}
      {/* ========================================================================= */}
      {activeTab === 'kpi' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* KPI Summary Stats */}
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 bg-slate-900/40 border-b border-slate-800/60">
            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 shadow-sm space-y-1">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Điểm KPI Trung Bình Toàn Công Ty
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{avgKpiScore}đ</div>
              <p className="text-[11px] text-slate-400">
                {rankACount} / {kpiEvaluations.length} nhân sự xếp loại Xuất sắc &amp; Tốt (A+/A)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/20 shadow-sm space-y-1">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-400" />
                Quỹ Thưởng Hiệu Suất (Điều 104)
              </div>
              <div className="text-xl font-black text-blue-300 font-mono">{formatVND(totalKpiBonus)}</div>
              <p className="text-[11px] text-blue-400/80">Trích từ Quỹ Khen Thưởng Doanh Nghiệp</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/20 shadow-sm space-y-1">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Tổng Thu Nhập Thực Lĩnh Sau KPI
              </div>
              <div className="text-xl font-black text-purple-300 font-mono">{formatVND(totalGrossKpiPayroll)}</div>
              <p className="text-[11px] text-slate-400">Lương HĐLĐ + Thưởng KPI + Hoa hồng + Chuyên cần</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-slate-400 text-xs font-medium mb-1">Bộ Biểu Mẫu Pháp Quy</div>
                <div className="text-sm font-bold text-cyan-300">4 Mẫu Chuẩn Thể Thức</div>
                <p className="text-[10px] text-slate-400">Phiếu ĐG, Tờ Trình, QĐ Khen Thưởng, Báo Cáo</p>
              </div>
              <button
                onClick={() => {
                  setReportModalEvalId(kpiEvaluations[0]?.id || '');
                  setShowReportModal(true);
                }}
                className="mt-2 w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Mở Biểu Mẫu &amp; Quyết Định</span>
              </button>
            </div>
          </div>

          {/* Filter and KPI List Table */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center flex-wrap gap-2.5">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên nhân viên, chức danh..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filter by Rank */}
                <select
                  value={kpiRankFilter}
                  onChange={(e) => setKpiRankFilter(e.target.value)}
                  className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất Cả Xếp Loại</option>
                  <option value="A+">Loại A+ (Xuất sắc ≥ 95đ)</option>
                  <option value="A">Loại A (Tốt 85 - 94.9đ)</option>
                  <option value="B">Loại B (Khá 70 - 84.9đ)</option>
                  <option value="C">Loại C/D (Cần cải thiện &lt; 70đ)</option>
                </select>

                {/* Filter by Role */}
                <select
                  value={kpiRoleFilter}
                  onChange={(e) => setKpiRoleFilter(e.target.value)}
                  className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất Cả Vị Trí</option>
                  <option value="Thu Ngân">Thu Ngân</option>
                  <option value="Nhân Viên Bán Hàng">Nhân Viên Bán Hàng</option>
                  <option value="Thủ Kho">Thủ Kho</option>
                  <option value="Kế Toán">Kế Toán</option>
                  <option value="Quản Lý Cửa Hàng">Quản Lý Cửa Hàng</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setReportModalEvalId(kpiEvaluations[0]?.id || '');
                    setShowReportModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>In Hồ Sơ Khen Thưởng</span>
                </button>
              </div>
            </div>

            {/* KPI Evaluations Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Mã NV</th>
                      <th className="py-3.5 px-4">Họ và Tên</th>
                      <th className="py-3.5 px-4">Chức Danh / Phòng Ban</th>
                      <th className="py-3.5 px-4 text-center">Tự Chấm</th>
                      <th className="py-3.5 px-4 text-center">Quản Lý Duyệt</th>
                      <th className="py-3.5 px-4 text-center">Xếp Loại</th>
                      <th className="py-3.5 px-4 text-right">Lương HĐLĐ</th>
                      <th className="py-3.5 px-4 text-right">Thưởng KPI</th>
                      <th className="py-3.5 px-4 text-right">Tổng Thực Lĩnh</th>
                      <th className="py-3.5 px-4 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredKpiEvaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-sans font-bold text-slate-400">{ev.employeeCode}</td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-white text-sm">{ev.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Kỳ: {ev.period}</div>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300">
                          <div className="font-semibold text-slate-200">{ev.role}</div>
                          <div className="text-[10px] text-slate-500">{ev.department}</div>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">{ev.selfTotalScore}đ</td>
                        <td className="py-3 px-4 text-center font-bold text-cyan-400 text-sm">
                          {ev.finalScore}đ
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                              ev.rank === 'A+'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : ev.rank === 'A'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : ev.rank === 'B'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            Loại {ev.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">{formatVND(ev.baseSalary)}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          +{formatVND(ev.performanceBonus)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-purple-300 text-sm">
                          {formatVND(ev.totalGrossPayout)}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setScoringEval(ev)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="Chấm điểm KPI 3 cấp"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Chấm Điểm</span>
                            </button>
                            <button
                              onClick={() => {
                                setReportModalEvalId(ev.id);
                                setShowReportModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                              title="In phiếu đánh giá cá nhân Mẫu 01"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: NHÂN SỰ & BẢNG LƯƠNG                                               */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <>
          {/* Overview stats */}
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 bg-slate-900/40 border-b border-slate-800/60">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-medium mb-1">Tổng Số Nhân Sự</div>
              <div className="text-xl font-black text-white font-mono">{safeEmployees.length} Nhân Viên</div>
              <p className="text-[11px] text-emerald-400 mt-1">100% Đang Hoạt Động</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-medium mb-1">Thu Ngân Đạt KPI Cao Nhất</div>
              <div className="text-xl font-black text-amber-300 font-mono">Trần Thị Thảo</div>
              <p className="text-[11px] text-slate-400 mt-1">Đạt 80.25% chỉ tiêu tháng</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-medium mb-1">Tỷ Lệ Điểm Danh Đúng Giờ</div>
              <div className="text-xl font-black text-blue-400 font-mono">98.5%</div>
              <p className="text-[11px] text-slate-400 mt-1">Chấm công FaceID / GPS</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="text-slate-400 text-xs font-medium mb-1">Hoa Hồng Bán Hàng (POS)</div>
              <div className="text-xl font-black text-cyan-400 font-mono">
                {formatVND(safeEmployees.reduce((sum, e) => sum + (e.currentSales * e.commissionRate) / 100, 0))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tự động cộng vào lương</p>
            </div>
          </div>

          {/* Staff List & Payroll Table */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên nhân viên, chức vụ..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-400 mr-2">Tổng chi lương:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{formatVND(totalPayroll)}</span>
                </div>

                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setShowNewModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Nhân Sự Mới</span>
                </button>
              </div>
            </div>

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((emp) => {
                const commission = (emp.currentSales * emp.commissionRate) / 100;
                const totalSalary = emp.baseSalary + commission;
                const kpiPercent =
                  emp.salesKpiTarget > 0 ? Math.round((emp.currentSales / emp.salesKpiTarget) * 100) : null;

                return (
                  <div
                    key={emp.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              emp.avatar ||
                              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
                            }
                            alt={emp.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white">{emp.name}</h4>
                            <div className="text-xs text-blue-400 font-semibold">{emp.role}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Mã: {emp.code}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setShowNewModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa nhân sự "${emp.name}" không?`)) {
                                if (onDeleteEmployee) onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                            title="Xóa nhân sự"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl mb-3 border border-slate-700/50">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Ca làm việc:</span>
                          <span className="font-semibold text-slate-200">{emp.shiftSchedule}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Lương cơ bản:</span>
                          <span className="font-mono font-bold text-slate-200">{formatVND(emp.baseSalary)}</span>
                        </div>
                        {emp.salesKpiTarget > 0 && (
                          <div className="pt-1.5 border-t border-slate-700/80">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-400">KPI Doanh Số:</span>
                              <span className="text-amber-300 font-bold">{kpiPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-400 h-full rounded-full"
                                style={{ width: `${Math.min(100, kpiPercent || 0)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                              <span>Đạt: {formatVND(emp.currentSales)}</span>
                              <span className="text-emerald-400">+{formatVND(commission)} hoa hồng</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Thực Lĩnh (Ước tính)</div>
                        <div className="text-sm font-black text-emerald-400 font-mono">{formatVND(totalSalary)}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {emp.status === 'active' ? 'Đang trực ca' : emp.status === 'leave' ? 'Nghỉ phép' : 'Đã nghỉ'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* New / Edit Employee Modal */}
      {showNewModal && (
        <NewEmployeeModal
          employeeToEdit={editingEmployee}
          onClose={() => {
            setShowNewModal(false);
            setEditingEmployee(null);
          }}
          onSave={(emp) => {
            if (onSaveEmployee) onSaveEmployee(emp);
          }}
        />
      )}

      {/* KPI Interactive Scoring Modal */}
      {scoringEval && (
        <KpiScoringModal
          evaluation={scoringEval}
          onSave={handleSaveKpiEvaluation}
          onClose={() => setScoringEval(null)}
          onOpenReport={(id) => {
            setReportModalEvalId(id);
            setShowReportModal(true);
          }}
        />
      )}

      {/* Legal KPI Forms Modal (Bộ 4 Biểu Mẫu Chuẩn BLLĐ 2019) */}
      {showReportModal && (
        <KpiEvaluationReportModal
          evaluations={kpiEvaluations}
          employees={safeEmployees}
          settings={settings as StoreSettings}
          initialEvaluationId={reportModalEvalId || undefined}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
