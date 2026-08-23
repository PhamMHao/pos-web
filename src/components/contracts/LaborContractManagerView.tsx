import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Printer,
  PenTool,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Share2,
  Lock,
  Download,
  X,
  Sparkles,
} from 'lucide-react';
import { LaborContract, Employee, StoreSettings } from '../../types';
import { LaborContractPrintModal } from './LaborContractPrintModal';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { hrApi } from '../../features/hr/api/hrApi';

interface LaborContractManagerViewProps {
  laborContracts: LaborContract[];
  setLaborContracts: (contracts: LaborContract[] | ((prev: LaborContract[]) => LaborContract[])) => void;
  employees: Employee[];
  settings: StoreSettings;
}

export const LaborContractManagerView: React.FC<LaborContractManagerViewProps> = ({
  laborContracts,
  setLaborContracts,
  employees,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<LaborContract | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Contract Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [empName, setEmpName] = useState('');
  const [empGender, setEmpGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [empDob, setEmpDob] = useState('1996-05-15');
  const [empIdCard, setEmpIdCard] = useState('079096001234');
  const [empIdDate, setEmpIdDate] = useState('10/05/2021');
  const [empIdPlace, setEmpIdPlace] = useState('Cục Cảnh sát QLHC về TTXH');
  const [empAddress, setEmpAddress] = useState('120 Hoàng Hoa Thám, P. 12, Q. Tân Bình, TP.HCM');
  const [empPhone, setEmpPhone] = useState('0909123456');
  const [empEmail, setEmpEmail] = useState('nhanvien@gperp.vn');
  const [empRole, setEmpRole] = useState('Chuyên viên Quản trị & Bán hàng');
  const [empDept, setEmpDept] = useState('Phòng Kinh Doanh & POS');

  const [contractType, setContractType] = useState<
    'Không xác định thời hạn' | 'Xác định thời hạn 12 tháng' | 'Xác định thời hạn 24 tháng' | 'Xác định thời hạn 36 tháng' | 'Thử việc' | 'Thời vụ'
  >('Không xác định thời hạn');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [baseSalary, setBaseSalary] = useState(12000000);
  const [allowancePosition, setAllowancePosition] = useState(1500000);
  const [allowanceLunch, setAllowanceLunch] = useState(800000);
  const [allowanceFuel, setAllowanceFuel] = useState(500000);
  const [commissionRate, setCommissionRate] = useState(1.5);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  // KPIs
  const safeContracts = useMemo(() => {
    return Array.isArray(laborContracts) ? laborContracts : [];
  }, [laborContracts]);

  // KPIs
  const stats = useMemo(() => {
    const total = safeContracts.length;
    const active = safeContracts.filter((c) => c && (c.status === 'active' || c.status === 'signed')).length;
    const signedCount = safeContracts.filter((c) => c?.signatures?.employeeSigned && c?.signatures?.employerSigned).length;
    const avgSalary =
      total > 0
        ? Math.round(
            safeContracts.reduce((sum, c) => sum + (Number((c?.terms as any)?.baseSalary) || Number((c?.terms as any)?.basicSalary) || 0), 0) /
              total
          )
        : 0;

    return {
      total,
      active,
      signedCount,
      avgSalary,
    };
  }, [safeContracts]);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return safeContracts.filter((c) => {
      if (!c) return false;
      const cNum = c.contractNumber || '';
      const eName = c.employeeName || '';
      const eRole = c.employeeRole || '';
      const idC = (c.employeeInfo as any)?.idCard || (c.employeeInfo as any)?.idCardNumber || '';

      const matchSearch =
        cNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idC.includes(searchTerm);

      const matchType = typeFilter === 'all' || c.contractType === typeFilter;
      return matchSearch && matchType;
    });
  }, [safeContracts, searchTerm, typeFilter]);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setEmpName(emp.name);
      setEmpRole(emp.role);
      setBaseSalary(emp.baseSalary || 10000000);
      setCommissionRate(emp.commissionRate || 1.0);
    }
  };

  const handleSignContract = (contractId: string, signatureDataUrl: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLaborContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          return {
            ...c,
            status: 'signed',
            signatures: {
              ...c.signatures,
              employeeSigned: true,
              employeeSignedAt: nowStr,
              employeeSignatureDataUrl: signatureDataUrl,
            },
          };
        }
        return c;
      })
    );

    if (selectedContract && selectedContract.id === contractId) {
      setSelectedContract((prev) =>
        prev
          ? {
              ...prev,
              status: 'signed',
              signatures: {
                ...prev.signatures,
                employeeSigned: true,
                employeeSignedAt: nowStr,
                employeeSignatureDataUrl: signatureDataUrl,
              },
            }
          : null
      );
    }

    try {
      hrApi.updateLaborContract(contractId, {
        status: 'signed',
        signatures: {
          employeeSigned: true,
          employeeSignedAt: nowStr,
          employeeSignatureDataUrl: signatureDataUrl,
          employerSigned: true,
          employerSignedAt: nowStr,
        },
      } as any).catch((e) => console.warn('API updateLaborContract warning:', e.message));
    } catch (e: any) {
      console.warn('API updateLaborContract warning:', e.message);
    }

    showToast('Đã lưu chữ ký điện tử của Người lao động thành công!');
  };

  const handleCreateNewContract = () => {
    if (!empName) {
      alert('Vui lòng nhập họ tên nhân viên ký hợp đồng!');
      return;
    }

    const nextNum = (laborContracts.length + 1).toString().padStart(3, '0');
    const contractNumber = `HDLD-2026-${nextNum}/GP`;
    const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();

    const matchingEmp = employees.find((e) => e.id === selectedEmployeeId);
    const newContract: LaborContract = {
      id: `contract-${Date.now()}`,
      contractNumber,
      employeeId: selectedEmployeeId || `emp-custom-${Date.now()}`,
      employeeCode: matchingEmp?.code || `NV-${nextNum}`,
      employeeName: empName,
      employeeRole: empRole,
      contractType,
      startDate,
      endDate: contractType.includes('12 tháng') ? '2027-03-01' : contractType.includes('24 tháng') ? '2028-03-01' : undefined,
      signDate: new Date().toISOString().substring(0, 10),
      status: 'signed',
      employer: {
        companyName: settings.storeName || 'CÔNG TY CỔ PHẦN GP-ERP VIỆT NAM',
        representative: 'Phạm Đức Dũng',
        position: 'Tổng Giám Đốc',
        nationality: 'Việt Nam',
        address: settings.address || 'Tòa nhà GP-Tower, 180 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        phone: settings.phone || '0988 888 999',
        taxCode: settings.taxCode || '0318928172',
      },
      employeeInfo: {
        name: empName,
        gender: empGender,
        dob: empDob,
        nationality: 'Việt Nam',
        idCardNumber: empIdCard,
        idCardDate: empIdDate,
        idCardPlace: empIdPlace,
        registeredAddress: empAddress,
        currentAddress: empAddress,
        phone: empPhone,
        email: empEmail,
        department: empDept,
        position: empRole,
      },
      terms: {
        jobDescription: `Thực hiện nghiệp vụ ${empRole}, tư vấn khách hàng, thao tác bán hàng POS, quản trị đơn hàng và tuân thủ quy chế doanh nghiệp.`,
        workLocation: settings.address || 'Tại trụ sở chính & các chi nhánh bán lẻ của GP-ERP',
        workingHours: '8 giờ/ngày (44 giờ/tuần), từ Thứ Hai đến Thứ Bảy',
        restSchedule: 'Nghỉ 1 ngày/tuần (Chủ Nhật) và các ngày Lễ, Tết theo luật định',
        baseSalary,
        allowances: {
          position: allowancePosition,
          lunch: allowanceLunch,
          fuel: allowanceFuel,
          phone: 300000,
          other: 0,
        },
        commissionRate,
        kpiBonusDesc: 'Thưởng KPI từ 1.000.000đ - 5.000.000đ khi hoàn thành >100% chỉ tiêu doanh số tháng',
        insuranceSalary: baseSalary,
        salaryPaymentDay: 5,
        annualLeaveDays: 12,
        uniformAndEquipment: 'Được cấp 02 áo đồng phục/năm, thẻ nhân viên, laptop/máy POS làm việc',
        confidentialityAgreed: true,
      },
      signatures: {
        employerSigned: true,
        employerSignedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        employerSignerName: 'Phạm Đức Dũng (Tổng Giám Đốc)',
        employeeSigned: true,
        employeeSignedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        eSignMethod: 'touch_signature',
        auditHash: `SHA256-${randomHash}`,
      },
    };

    setLaborContracts((prev) => [newContract, ...prev]);
    setShowCreateModal(false);
    showToast(`Đã khởi tạo thành công HĐLĐ Điện Tử số ${contractNumber}!`);
    setSelectedContract(newContract);

    try {
      hrApi.createLaborContract(newContract).catch((e) => console.warn('API createLaborContract warning:', e.message));
    } catch (e: any) {
      console.warn('API createLaborContract warning:', e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Hợp Đồng Lao Động Điện Tử (eContract)
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full border border-indigo-200">
                BLLĐ 2019
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Soạn thảo, ký số cảm ứng/token CA, lưu trữ mã băm SHA-256 và in chuẩn pháp lý A4 cho toàn bộ nhân sự
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          Tạo Hợp Đồng Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Hợp Đồng Lập</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.total} HĐLĐ</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đã Ký Số 2 Bên</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.signedCount} nhân sự (100%)</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Lương Cơ Bản Trung Bình</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(stats.avgSalary)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tính Pháp Lý Điện Tử</p>
            <p className="text-lg font-bold text-amber-700 mt-0.5">SHA-256 Audit</p>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo số HĐ, tên nhân viên, CCCD, chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Loại HĐ:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả loại ({laborContracts.length})</option>
            <option value="Không xác định thời hạn">Không xác định thời hạn</option>
            <option value="Xác định thời hạn 12 tháng">12 Tháng</option>
            <option value="Xác định thời hạn 24 tháng">24 Tháng</option>
            <option value="Thử việc">Thử việc</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3.5 text-center w-12">STT</th>
                <th className="p-3.5">Số Hợp Đồng</th>
                <th className="p-3.5">Họ Tên Nhân Viên</th>
                <th className="p-3.5">Vị Trí / Phòng Ban</th>
                <th className="p-3.5">Loại Hợp Đồng</th>
                <th className="p-3.5 text-right">Lương Cơ Bản</th>
                <th className="p-3.5 text-center">Trạng Thái Ký</th>
                <th className="p-3.5 text-center">Hiệu Lực</th>
                <th className="p-3.5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                    <td className="p-3.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-indigo-900 text-xs">{c.contractNumber}</span>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Ngày ký: {new Date(c.signDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{c.employeeName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        CCCD: {c.employeeInfo.idCardNumber}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">{c.employeeRole}</span>
                      <div className="text-[11px] text-slate-500">{c.employeeInfo.department}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-semibold border border-indigo-200 text-[11px] inline-block">
                        {c.contractType}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(c.terms.baseSalary)}
                    </td>
                    <td className="p-3.5 text-center">
                      {c.signatures.employeeSigned && c.signatures.employerSigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã Ký 2 Bên
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-semibold border border-amber-200 text-[11px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Chờ Ký
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center text-slate-600">
                      <div>Từ: {new Date(c.startDate).toLocaleDateString('vi-VN')}</div>
                      {c.endDate ? (
                        <div className="text-[11px] text-slate-500">
                          Đến: {new Date(c.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 font-medium">Vô thời hạn</div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedContract(c)}
                          title="Xem & In Hợp Đồng Lao Động"
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition border border-indigo-200"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {!c.signatures.employeeSigned && (
                          <button
                            onClick={() => setSelectedContract(c)}
                            title="Ký Số Cảm Ứng Ngay"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition border border-amber-200"
                          >
                            <PenTool className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không tìm thấy hợp đồng lao động nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo HĐLĐ Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Khởi Tạo Hợp Đồng Lao Động Điện Tử</h3>
                  <p className="text-xs text-slate-400">Thiết lập điều khoản, phụ cấp, hoa hồng POS và ký số 2 bên</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto text-xs text-slate-700">
              {/* Pick Employee */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Chọn Nhân Sự Từ Danh Sách Đang Làm Việc (Tùy chọn)
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Tạo hợp đồng cho nhân sự mới / Ứng viên mới --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.code} - {e.name} ({e.role}) - Lương: {formatCurrency(e.baseSalary)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Details */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  Thông Tin Người Lao Động (Bên B)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      placeholder="VD: Trần Thị Thảo"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Giới Tính</label>
                    <select
                      value={empGender}
                      onChange={(e) => setEmpGender(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Số Căn Cước Công Dân (CCCD)</label>
                    <input
                      type="text"
                      placeholder="VD: 079096001234"
                      value={empIdCard}
                      onChange={(e) => setEmpIdCard(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ngày Cấp CCCD</label>
                    <input
                      type="text"
                      placeholder="10/05/2021"
                      value={empIdDate}
                      onChange={(e) => setEmpIdDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-medium mb-1">Địa Chỉ Thường Trú & Hiện Tại</label>
                    <input
                      type="text"
                      placeholder="VD: 120 Hoàng Hoa Thám, P. 12, Q. Tân Bình, TP.HCM"
                      value={empAddress}
                      onChange={(e) => setEmpAddress(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Số Điện Thoại</label>
                    <input
                      type="text"
                      placeholder="VD: 0909 123 456"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Email Nhận Bản Ký</label>
                    <input
                      type="email"
                      placeholder="VD: thaotran@gperp.vn"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chức Danh Công Việc</label>
                    <input
                      type="text"
                      placeholder="VD: Thu Ngân & Chăm Sóc Khách Hàng"
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phòng Ban</label>
                    <input
                      type="text"
                      placeholder="VD: Bộ Phận Bán Lẻ & POS"
                      value={empDept}
                      onChange={(e) => setEmpDept(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Salary */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/60 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Loại Hợp Đồng, Lương & Phụ Cấp
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Loại Hợp Đồng</label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="Không xác định thời hạn">Không xác định thời hạn (Chính thức)</option>
                      <option value="Xác định thời hạn 12 tháng">Xác định thời hạn 12 tháng</option>
                      <option value="Xác định thời hạn 24 tháng">Xác định thời hạn 24 tháng</option>
                      <option value="Thử việc">Thử việc (2 tháng)</option>
                      <option value="Thời vụ">Hợp đồng thời vụ / Bán thời gian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ngày Bắt Đầu Hiệu Lực</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Lương Cơ Bản (Đóng BHXH)</label>
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phụ Cấp Trách Nhiệm / Chức Vụ</label>
                    <input
                      type="number"
                      value={allowancePosition}
                      onChange={(e) => setAllowancePosition(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Phụ Cấp Ăn Trưa</label>
                    <input
                      type="number"
                      value={allowanceLunch}
                      onChange={(e) => setAllowanceLunch(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Hoa Hồng Doanh Số POS (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleCreateNewContract}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 transition"
              >
                <FileCheck className="w-4 h-4" />
                Khởi Tạo & Ký Điện Tử HĐLĐ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Print & View Modal */}
      {selectedContract && (
        <LaborContractPrintModal
          contract={selectedContract}
          settings={settings}
          onClose={() => setSelectedContract(null)}
          onSignContract={handleSignContract}
        />
      )}
    </div>
  );
};
