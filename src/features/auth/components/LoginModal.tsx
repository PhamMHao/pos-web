import React, { useState } from "react";
import { useAuth } from "../../../core/contexts/AuthContext";
import { UserCheck, Shield, KeyRound, LogOut, CheckCircle2, AlertCircle, X, RefreshCw, User } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_ACCOUNTS = [
  {
    username: "admin",
    name: "Vũ Gia Phúc",
    roleName: "Quản Trị Viên (Admin)",
    color: "from-blue-600 to-indigo-600",
    role: "admin",
  },
  {
    username: "thungan01",
    name: "Trần Thị Thảo",
    roleName: "Thu Ngân POS",
    color: "from-emerald-600 to-teal-600",
    role: "cashier",
  },
  {
    username: "thukho01",
    name: "Lê Hoàng Kho",
    roleName: "Thủ Kho Vật Tư",
    color: "from-amber-600 to-orange-600",
    role: "warehouse",
  },
  {
    username: "ketoan01",
    name: "Nguyễn Kim Ngân",
    roleName: "Kế Toán Trưởng",
    color: "from-purple-600 to-pink-600",
    role: "accountant",
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (accUsername: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await login(accUsername, "123456");
      setSuccessMsg(`Đã đăng nhập thành công với tài khoản: ${accUsername}`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi đăng nhập");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await login(username.trim(), password);
      setSuccessMsg("Đăng nhập thành công!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Xác Thực & Đổi Tài Khoản
              </h3>
              <p className="text-[11px] text-slate-400">
                GP-ERP Enterprise Authentication & RBAC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current User Card */}
          {user && (
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>{user.fullName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">@{user.username}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setSuccessMsg("Đã đăng xuất");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-1 border border-rose-500/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}

          {/* Quick Login Accounts */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Chuyển nhanh tài khoản mẫu (Mật khẩu mặc định 123456):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc.username)}
                  disabled={isSubmitting}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    user?.username === acc.username
                      ? "bg-blue-950/50 border-blue-500/60 ring-1 ring-blue-500/40"
                      : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200 truncate">{acc.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{acc.roleName}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 absolute">hoặc</span>
          </div>

          {/* Custom Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Tên đăng nhập:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập..."
                className="w-full p-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Mật khẩu:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <span>Đăng Nhập Hệ Thống</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
