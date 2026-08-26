import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Send,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { useMasterData } from '../../../core/contexts/MasterDataContext';
import { GIA_PHUC_LOGO_SVG_DATA_URI } from '../../../components/common/GiaPhucLogo';
import { StoreSettings } from '../../../types';
import { SYSTEM_ROLES } from '../../../config/rbac.config';

interface LoginViewProps {
  settings?: StoreSettings;
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onLoginSuccess }) => {
  const { login, isLoading } = useAuth();
  const { requestPasswordReset, emailConfig } = useMasterData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotReason, setForgotReason] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [isRequestingReset, setIsRequestingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await login(username.trim(), password);
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername.trim()) {
      alert('Vui lòng nhập Tên đăng nhập cần khôi phục!');
      return;
    }

    setIsRequestingReset(true);
    try {
      const res = await requestPasswordReset(
        forgotUsername.trim(),
        forgotEmail.trim(),
        forgotReason.trim() || 'Người dùng yêu cầu cấp lại mật khẩu từ màn hình Đăng nhập'
      );

      if (res.success) {
        setForgotSuccessMsg(
          `Yêu cầu cấp lại mật khẩu cho tài khoản "${forgotUsername}" đã được gửi tới Quản Trị Viên (Admin) và Cổng Email hệ thống thành công!`
        );
        setTimeout(() => {
          setForgotSuccessMsg(null);
          setShowForgotPasswordModal(false);
          setForgotUsername('');
          setForgotEmail('');
          setForgotReason('');
        }, 3500);
      } else {
        alert(res.message || 'Không thể gửi yêu cầu cấp lại mật khẩu.');
      }
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể kết nối máy chủ'));
    } finally {
      setIsRequestingReset(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Brand */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <img
            src={GIA_PHUC_LOGO_SVG_DATA_URI}
            alt="GP-ERP Logo"
            className="w-9 h-9 rounded-xl shadow-lg border border-slate-800"
          />
          <div>
            <div className="text-sm font-black tracking-tight text-white flex items-center space-x-1.5">
              <span>{settings?.storeName || 'GIA PHÚC COMPUTER'}</span>
              <span className="px-1.5 py-0.2 bg-blue-600/30 border border-blue-500/40 text-blue-400 text-[10px] font-bold rounded-md">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hệ Thống Quản Trị ERP & Phân Quyền Đa Chi Nhánh</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Hotline: <strong className="text-slate-200">{settings?.phone || '0985.862.609'}</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Direct Database Login Form */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Bảo Mật Cơ Sở Dữ Liệu SQL Server</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Đăng Nhập Hệ Thống
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Nhập tài khoản nhân viên được cấp để truy cập phân hệ
              </p>
            </div>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tên Đăng Nhập / Mã Nhân Viên *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: admin / manager / ketoan"
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    disabled={isSubmitting || isLoading}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Mật Khẩu *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer transition hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-blue-500 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition"
                    disabled={isSubmitting || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span>Ghi nhớ phiên đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực CSDL...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Đăng Nhập Vào Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: 7 System Roles & Security Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 md:p-7 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white leading-tight">
                      Cơ Chế Phân Quyền 7 Vai Trò Hệ Thống (RBAC Matrix)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Hệ thống tự động điều hướng giao diện phù hợp dựa trên vai trò trong cơ sở dữ liệu
                    </p>
                  </div>
                </div>
              </div>

              {/* System Roles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYSTEM_ROLES.map((role) => (
                  <div
                    key={role.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{role.nameVi}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${role.badgeColor}`}>
                        {role.id.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Security Standards Footer */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-bold text-slate-300 flex items-center space-x-1.5 text-[11px]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tiêu Chuẩn Bảo Mật Doanh Nghiệp:</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className="flex items-start space-x-1.5">
                    <span className="text-blue-400 font-bold">• SQL Server:</span>
                    <span>Xác thực mật khẩu mã hóa BCrypt / SHA-256 an toàn.</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">• Token JWT:</span>
                    <span>Phiên làm việc bảo mật với cơ chế tự động gia hạn token.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Yêu Cầu Cấp Lại Mật Khẩu</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Đã gửi yêu cầu thành công!</span>
                </div>
                <p className="leading-relaxed">{forgotSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3.5 text-xs">
                <p className="text-slate-400 leading-relaxed">
                  Vui lòng cung cấp tên đăng nhập hoặc mã nhân viên. Yêu cầu sẽ được chuyển tới Quản Trị Viên (Admin) và Cổng Email của cửa hàng.
                </p>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Tên Đăng Nhập / Mã Nhân Viên *
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="VD: admin / manager / nv01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Email Nhận Thông Báo (Tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="VD: user@vitinhgiaphuc.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Lý Do / Ghi Chú Cần Cấp Lại
                  </label>
                  <textarea
                    rows={2}
                    value={forgotReason}
                    onChange={(e) => setForgotReason(e.target.value)}
                    placeholder="VD: Quên mật khẩu đăng nhập ca làm việc..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isRequestingReset}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRequestingReset ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Yêu Cầu Cho Admin</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-slate-900 bg-slate-950/60 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <div>
          © {new Date().getFullYear()} {settings?.storeName || 'Gia Phúc Computer'}. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <span>Phiên bản Enterprise v2.6.0</span>
          <span>•</span>
          <span>SQL Server Database Live Connected</span>
        </div>
      </footer>
    </div>
  );
};
