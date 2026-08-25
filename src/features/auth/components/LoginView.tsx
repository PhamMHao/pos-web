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
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS_LIST, DemoUserAccount } from '../../../core/contexts/AuthContext';
import { GIA_PHUC_LOGO_SVG_DATA_URI } from '../../../components/common/GiaPhucLogo';
import { StoreSettings } from '../../../types';
import { SYSTEM_ROLES } from '../../../config/rbac.config';

interface LoginViewProps {
  settings?: StoreSettings;
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onLoginSuccess }) => {
  const { login, switchUserDirectly, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDemoUser, setSelectedDemoUser] = useState<DemoUserAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (acc: DemoUserAccount) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedDemoUser(acc);

    try {
      switchUserDirectly(acc.username);
      setSuccessMessage(`Đã đăng nhập thành công với vai trò: ${acc.roleNameVi}`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMessage('Lỗi đăng nhập nhanh');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#070b14] text-slate-100 flex flex-col justify-between relative overflow-x-hidden select-none font-sans">
      {/* Background Decorative Gradients & Grid Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,128,255,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_50%_50%_at_85%_80%,rgba(139,92,246,0.1),rgba(255,255,255,0))] pointer-events-none" />
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #070b14 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Banner Header */}
      <header className="p-4 md:px-8 flex items-center justify-between z-10 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="h-10 px-2.5 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/10 border border-slate-700">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-7 max-w-[120px] object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                GP
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-sm md:text-base tracking-tight text-white">
                {settings?.brandName || settings?.storeName || 'GIA PHÚC Computer'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ERP 2026 RBAC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Hệ Thống Quản Trị Doanh Nghiệp Toàn Diện & Phân Quyền Vai Trò
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bảo Mật RBAC 7 Vai Trò</span>
          </div>
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>18 Modules Nghiệp Vụ</span>
          </div>
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* LEFT: Login Form (5 columns) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Đăng Nhập Hệ Thống
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Nhập thông tin tài khoản hoặc chọn vai trò trải nghiệm nhanh
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Tên đăng nhập:</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (admin, thungan01, thukho01, ...)
                    </span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập..."
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Mật khẩu:</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Mặc định: 123456)
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-400 cursor-pointer hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>

                  <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                    Quên mật khẩu?
                  </span>
                </div>

                {/* Alerts */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer hover:scale-[1.01] active:scale-99"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Hệ Thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
              GP-ERP Enterprise © 2026 • Bảo mật theo tiêu chuẩn TT78 & ISO
            </div>
          </div>

          {/* RIGHT: Fast 1-Click Role Switcher & Feature Highlight (7 columns) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white leading-tight">
                      Chuyển Nhanh 7 Vai Trò Nghiệp Vụ (1-Click Demo)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Bấm vào tài khoản bất kỳ để trải nghiệm giao diện phân quyền tức thì
                    </p>
                  </div>
                </div>
              </div>

              {/* Demo Accounts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {DEMO_ACCOUNTS_LIST.map((acc) => {
                  const isSelected = selectedDemoUser?.username === acc.username;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      disabled={isSubmitting || isLoading}
                      className={`p-3 rounded-2xl border text-left transition-all group relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20'
                          : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${acc.colorGradient} flex items-center justify-center font-black text-white shadow-md shrink-0 text-sm`}
                        >
                          {acc.avatarLetter}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 mb-0.5">
                            <span className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                              {acc.name.split(' (')[0]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${acc.badgeBg}`}>
                              {acc.roleNameVi}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Role Explanations */}
              <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                <div className="font-bold text-slate-300 flex items-center space-x-1.5 text-[11px]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cơ Chế Phân Quyền Động (Dynamic RBAC Matrix):</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className="flex items-start space-x-1.5">
                    <span className="text-rose-400 font-bold">• Admin:</span>
                    <span>18/18 Modules, Cấu hình DB, Quản lý tài khoản & RBAC.</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">• Thu Ngân:</span>
                    <span>POS, Két tiền ca, Đơn hàng, Khách hàng, Tiếp nhận BH.</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-amber-400 font-bold">• Thủ Kho:</span>
                    <span>Kho hàng, Nhà cung cấp, Mua hàng PO, BOM, Nhập xuất kho.</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <span className="text-purple-400 font-bold">• Kế Toán:</span>
                    <span>Sổ quỹ, HĐĐT TT78, HĐLĐ, Lương KPI, Ký số CA, Báo cáo.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SQL Server 2008 - 2025 Ready</span>
              </span>
              <span className="font-mono text-slate-500">Mật khẩu mẫu chung: 123456</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950/40 z-10">
        Phần Mềm Quản Trị Doanh Nghiệp GP-ERP Enterprise v2026 • Thiết kế tối ưu cho Cửa Hàng Tin Học, Thiết Bị Số & Dịch Vụ Sửa Chữa
      </footer>
    </div>
  );
};
