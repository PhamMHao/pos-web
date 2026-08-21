import React, { useState } from 'react';
import {
  X,
  UserCheck,
  User,
  Phone,
  Mail,
  DollarSign,
  Award,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  Image,
} from 'lucide-react';
import { Employee } from '../../types';
import { formatVND } from '../../utils/vietqr';

interface NewEmployeeModalProps {
  employeeToEdit?: Employee | null;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

const ROLES: Employee['role'][] = [
  'Thu Ngân',
  'Thủ Kho',
  'Kế Toán',
  'Quản Lý Cửa Hàng',
  'Nhân Viên Bán Hàng',
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
];

export const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({
  employeeToEdit,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState(
    employeeToEdit?.code || `NV-${Date.now().toString().slice(-3)}`
  );
  const [name, setName] = useState(employeeToEdit?.name || '');
  const [role, setRole] = useState<Employee['role']>(
    employeeToEdit?.role || 'Thu Ngân'
  );
  const [phone, setPhone] = useState(employeeToEdit?.phone || '');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [baseSalary, setBaseSalary] = useState<number>(
    employeeToEdit?.baseSalary || 9000000
  );
  const [salesKpiTarget, setSalesKpiTarget] = useState<number>(
    employeeToEdit?.salesKpiTarget || 100000000
  );
  const [commissionRate, setCommissionRate] = useState<number>(
    employeeToEdit?.commissionRate || 1.5
  );
  const [status, setStatus] = useState<Employee['status']>(
    employeeToEdit?.status || 'active'
  );
  const [shiftSchedule, setShiftSchedule] = useState(
    employeeToEdit?.shiftSchedule || 'Ca Sáng (07:00 - 15:00)'
  );
  const [joinedDate, setJoinedDate] = useState(
    employeeToEdit?.joinedDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  );
  const [avatar, setAvatar] = useState(
    employeeToEdit?.avatar || DEFAULT_AVATARS[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập họ và tên nhân viên!');
      return;
    }

    const savedEmp: Employee = {
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      role,
      phone: phone.trim() || '0900 000 000',
      email: email.trim() || `${code.toLowerCase()}@gperp.vn`,
      baseSalary: Number(baseSalary) || 0,
      salesKpiTarget: Number(salesKpiTarget) || 0,
      currentSales: employeeToEdit ? employeeToEdit.currentSales : 0,
      commissionRate: Number(commissionRate) || 0,
      status,
      avatar,
      joinedDate,
      shiftSchedule,
    };

    onSave(savedEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{employeeToEdit ? 'Chỉnh Sửa Hồ Sơ Nhân Sự' : 'Thêm Nhân Sự Mới'}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ERP HR
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Phân quyền ca làm việc, mức lương cứng, hoa hồng POS & KPI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Avatar selector & Basic info */}
          <div className="flex items-center space-x-4 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
            <img
              src={avatar}
              alt="Avatar preview"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <label className="block text-[11px] text-slate-400 font-medium">Chọn ảnh đại diện</label>
              <div className="flex items-center space-x-2">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border transition ${
                      avatar === av ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={av} alt="option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Mã Nhân Viên *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="NV-005"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-300 uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1 font-medium">Họ Và Tên *</label>
              <input
                type="text"
                required
                placeholder="VD: Trần Thị Mai..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Vị Trí / Chức Vụ</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Employee['role'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Trạng Thái Công Tác</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Employee['status'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="active">Đang làm việc (Active)</option>
                <option value="leave">Nghỉ phép / Nghỉ tạm thời</option>
                <option value="inactive">Đã thôi việc</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Số Điện Thoại</label>
              <input
                type="text"
                placeholder="VD: 0988 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Email</label>
              <input
                type="email"
                placeholder="VD: mai.tran@gperp.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Salary & KPI */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Lương Cơ Bản (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="500000"
                required
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="text-[10px] text-slate-400 mt-0.5">{formatVND(baseSalary)}</div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Target KPI (VNĐ)</label>
              <input
                type="number"
                min="0"
                step="5000000"
                value={salesKpiTarget}
                onChange={(e) => setSalesKpiTarget(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Hoa Hồng POS (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Schedule & Joined Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Lịch Phân Ca Làm Việc</label>
              <select
                value={shiftSchedule}
                onChange={(e) => setShiftSchedule(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Ca Sáng (07:00 - 15:00)">Ca Sáng (07:00 - 15:00)</option>
                <option value="Ca Chiều (14:30 - 22:30)">Ca Chiều (14:30 - 22:30)</option>
                <option value="Hành chính (08:00 - 17:00)">Hành chính (08:00 - 17:00)</option>
                <option value="Toàn thời gian (08:00 - 17:00)">Toàn thời gian (08:00 - 17:00)</option>
                <option value="Linh hoạt">Linh hoạt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Ngày Vào Làm</label>
              <input
                type="date"
                required
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{employeeToEdit ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
