import React, { useState } from 'react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { Shield, KeyRound, LogOut, CheckCircle2, AlertCircle, X, RefreshCw, Lock, UserCheck } from 'lucide-react';
import { SYSTEM_ROLES, normalizeRoleKey } from '../../../config/rbac.config';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAccounts?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onNavigateToAccounts,
}) => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await login(username.trim(), password);
      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRoleKey = normalizeRoleKey(user?.role);
  const roleMeta = SYSTEM_ROLES.find((r) => r.id === currentRoleKey);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Xác Thực Tài Khoản
              </h3>
              <p className="text-xs text-slate-400">
                Đăng nhập trực tiếp cơ sở dữ liệu SQL Server
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Current User Pill if logged in */}
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {user.fullName || user.username}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Vai trò: <span className="text-blue-300 font-medium">{roleMeta?.nameVi || user.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setSuccessMsg('Đã đăng xuất!');
                  }}
                  className="px-2.5 py-1 text-[11px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg font-medium transition flex items-center space-x-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tên đăng nhập / Mã nhân viên
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: admin / manager / ketoan"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực CSDL...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Manage Accounts shortcut */}
          {onNavigateToAccounts && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAccounts();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center justify-center space-x-1 mx-auto"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mở màn hình Quản trị Tài khoản & Ma trận RBAC</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
