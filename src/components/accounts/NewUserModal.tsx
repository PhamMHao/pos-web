import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, Phone, Shield, Check, AlertCircle } from 'lucide-react';
import { SYSTEM_ROLES, RoleKey } from '../../config/rbac.config';
import { UserProfile } from '../../core/contexts/AuthContext';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProfile & { password?: string }) => void;
  editingUser?: UserProfile | null;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingUser,
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleKey>('cashier');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingUser) {
      setFullName(editingUser.fullName || '');
      setUsername(editingUser.username || '');
      setPassword('');
      setEmail(editingUser.email || '');
      setPhone(editingUser.phone || '');
      setRole((editingUser.role as RoleKey) || 'cashier');
      setStatus(editingUser.status === 'inactive' ? 'inactive' : 'active');
    } else {
      setFullName('');
      setUsername('');
      setPassword('123456');
      setEmail('');
      setPhone('');
      setRole('cashier');
      setStatus('active');
    }
    setErrorMsg(null);
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và Tên');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập');
      return;
    }
    if (!editingUser && !password.trim()) {
      setErrorMsg('Vui lòng nhập Mật khẩu cho tài khoản mới');
      return;
    }

    const userData: UserProfile & { password?: string } = {
      id: editingUser?.id || `usr-${Date.now()}`,
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      role,
      status,
      isActive: status === 'active',
      avatar: editingUser?.avatar || null,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    onSave(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Người Dùng Mới'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Gán vai trò và quyền truy cập module trong hệ thống GP-ERP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Họ và Tên <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên đăng nhập <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: nguyen_van_a"
                disabled={!!editingUser}
                className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Mật khẩu {editingUser && '(để trống nếu không đổi)'}:</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? '••••••••' : 'Mật khẩu khởi tạo...'}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số điện thoại:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0985 xxx xxx"
                className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email công việc:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhanvien@vitinhgiaphuc.com"
              className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Phân quyền Vai Trò (Role RBAC) <span className="text-rose-400">*</span>:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYSTEM_ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{r.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{r.nameVi}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300">
              Trạng thái tài khoản:
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Đang Hoạt Động
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  status === 'inactive'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Tạm Khóa
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
            >
              {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
