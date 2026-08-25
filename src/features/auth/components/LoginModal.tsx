import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS_LIST } from '../../../core/contexts/AuthContext';
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
  const { user, login, logout, switchUserDirectly, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSwitch = async (accUsername: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      switchUserDirectly(accUsername);
      setSuccessMsg(`Đã chuyển sang tài khoản: ${accUsername}`);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đổi tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Xác Thực & Chuyển Vai Trò
              </h3>
              <p className="text-[11px] text-slate-400">
                GP-ERP Enterprise Role-Based Access Control
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

        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Current User Card */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${
                    roleMeta?.gradient || 'from-blue-600 to-indigo-600'
                  } flex items-center justify-center font-black text-white shadow-md text-base shrink-0`}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center space-x-2 truncate">
                    <span className="truncate">{user.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {roleMeta?.nameVi || user.role}
                    </span>
                    <span className="text-[11px] text-slate-500">@{user.username}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {currentRoleKey === 'admin' && onNavigateToAccounts && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToAccounts();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/20 transition-colors cursor-pointer"
                    title="Quản lý tài khoản & phân quyền"
                  >
                    RBAC
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setSuccessMsg('Đã đăng xuất');
                    setTimeout(() => onClose(), 400);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center space-x-1 border border-rose-500/20 transition-colors cursor-pointer"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Login Accounts 7 Roles */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>Chuyển nhanh tài khoản theo vai trò (1-Click):</span>
              <span className="text-[10px] text-slate-500">Pass: 123456</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS_LIST.map((acc) => {
                const isCurrent = user?.username.toLowerCase() === acc.username.toLowerCase();
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickSwitch(acc.username)}
                    disabled={isSubmitting}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      isCurrent
                        ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${acc.colorGradient} flex items-center justify-center font-bold text-white text-xs shrink-0`}
                    >
                      {acc.avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {acc.name.split(' (')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{acc.roleNameVi}</div>
                    </div>
                    {isCurrent && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 absolute">
              hoặc đăng nhập bằng tài khoản khác
            </span>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-semibold">
                Tên đăng nhập:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập..."
                className="w-full p-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-semibold">
                Mật khẩu:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Đăng Nhập Tài Khoản</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
