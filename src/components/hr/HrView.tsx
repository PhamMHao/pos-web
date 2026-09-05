import React, { useState } from 'react';
import {
  Users,
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { Employee, LaborContract, StoreSettings } from '../../types';
import { LaborContractManagerView } from '../contracts/LaborContractManagerView';
import { NewEmployeeModal } from './NewEmployeeModal';
import { KpiManagementView } from './kpi/KpiManagementView';
import { formatVND } from '../../utils/currency';

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Bar Header */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Quản Trị Nhân Sự &amp; Đánh Giá KPI Hiệu Suất
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Hồ sơ nhân viên, hợp đồng lao động điện tử &amp; quy chế khen thưởng Điều 104 BLLĐ 2019
            </p>
          </div>
        </div>

        {/* 3 Tabs switch */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            1. Nhân Sự &amp; Bảng Lương ({safeEmployees.length})
          </button>
          <button
            onClick={() => setActiveTab('kpi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'kpi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>2. Đánh Giá KPI &amp; Khen Thưởng (BLLĐ 2019)</span>
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'contracts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>3. Hợp Đồng Lao Động Điện Tử ({safeContracts.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NHÂN SỰ & BẢNG LƯƠNG                                               */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <>
          {/* Overview stats */}
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 bg-white border-b border-slate-200">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-xs font-medium">Tổng Số Nhân Sự</div>
              <div className="text-xl font-black text-slate-900 font-mono">{safeEmployees.length} Nhân Viên</div>
              <p className="text-[11px] text-emerald-600 font-bold">100% Đang Hoạt Động</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-xs font-medium">Thu Ngân Đạt KPI Cao Nhất</div>
              <div className="text-xl font-black text-amber-600 font-mono">Trần Thị Thảo</div>
              <p className="text-[11px] text-slate-500">Đạt 80.25% chỉ tiêu tháng</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-xs font-medium">Tỷ Lệ Điểm Danh Đúng Giờ</div>
              <div className="text-xl font-black text-blue-600 font-mono">98.5%</div>
              <p className="text-[11px] text-slate-500">Chấm công ca trực chuẩn</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-xs font-medium">Hoa Hồng Bán Hàng (POS)</div>
              <div className="text-xl font-black text-indigo-600 font-mono">
                {formatVND(safeEmployees.reduce((sum, e) => sum + (e.currentSales * e.commissionRate) / 100, 0))}
              </div>
              <p className="text-[11px] text-slate-500">Tự động cộng vào lương</p>
            </div>
          </div>

          {/* Staff List & Payroll Table */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên nhân viên, chức vụ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-500 mr-2">Tổng chi lương:</span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">{formatVND(totalPayroll)}</span>
                </div>

                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setShowNewModal(true);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
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
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
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
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                            <div className="text-xs text-blue-600 font-semibold">{emp.role}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Mã: {emp.code}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setShowNewModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
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
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Xóa nhân sự"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl mb-3 border border-slate-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Ca làm việc:</span>
                          <span className="font-semibold text-slate-800">{emp.shiftSchedule}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Lương cơ bản:</span>
                          <span className="font-mono font-bold text-slate-900">{formatVND(emp.baseSalary)}</span>
                        </div>
                        {emp.salesKpiTarget > 0 && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-500">KPI Doanh Số:</span>
                              <span className="text-amber-700 font-bold">{kpiPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${Math.min(100, kpiPercent || 0)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                              <span>Đạt: {formatVND(emp.currentSales)}</span>
                              <span className="text-emerald-700 font-semibold">+{formatVND(commission)} hoa hồng</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Thực Lĩnh (Ước tính)</div>
                        <div className="text-sm font-black text-emerald-700 font-mono">{formatVND(totalSalary)}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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

      {/* ========================================================================= */}
      {/* TAB 2: ĐÁNH GIÁ KPI & KHEN THƯỞNG (ĐIỀU 104 BLLĐ 2019)                   */}
      {/* ========================================================================= */}
      {activeTab === 'kpi' && (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <KpiManagementView
            employees={safeEmployees}
            settings={settings as StoreSettings}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HỢP ĐỒNG LAO ĐỘNG ĐIỆN TỬ                                          */}
      {/* ========================================================================= */}
      {activeTab === 'contracts' && (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50">
          <LaborContractManagerView
            laborContracts={safeContracts}
            setLaborContracts={setLaborContracts}
            employees={safeEmployees}
            settings={settings as StoreSettings}
          />
        </div>
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
    </div>
  );
};

export default HrView;
