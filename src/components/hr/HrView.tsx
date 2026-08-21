import React, { useState } from 'react';
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
} from 'lucide-react';
import { Employee, LaborContract, StoreSettings } from '../../types';
import { LaborContractManagerView } from '../contracts/LaborContractManagerView';
import { NewEmployeeModal } from './NewEmployeeModal';

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
  const [activeTab, setActiveTab] = useState<'staff' | 'contracts'>('staff');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const formatVND = (amt: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
  };

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
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Quản Trị Nhân Sự HR & Hợp Đồng Lao Động</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ERP HR & eContract 2026
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý ca trực, KPI hoa hồng, bảng lương tự động và ký Hợp đồng lao động điện tử
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhân Sự & Lương ({safeEmployees.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
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

      {activeTab === 'contracts' ? (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/30">
          <LaborContractManagerView
            laborContracts={safeContracts}
            setLaborContracts={setLaborContracts}
            employees={safeEmployees}
            settings={settings as StoreSettings}
          />
        </div>
      ) : (
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
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Nhân Sự Mới</span>
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
                            className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition"
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
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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
    </div>
  );
};
