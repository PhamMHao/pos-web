import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { SYSTEM_MODULES, SYSTEM_ROLES, getDefaultModuleForRole, normalizeRoleKey } from '../../config/rbac.config';

interface AccessDeniedViewProps {
  moduleId: string;
  onNavigate: (tab: any) => void;
  onOpenAuthModal?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  moduleId,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const currentRoleKey = normalizeRoleKey(user?.role);
  const roleMeta = SYSTEM_ROLES.find((r) => r.id === currentRoleKey);
  const moduleMeta = SYSTEM_MODULES.find((m) => m.id === moduleId);
  const defaultTab = getDefaultModuleForRole(currentRoleKey);
  const defaultModuleMeta = SYSTEM_MODULES.find((m) => m.id === defaultTab);

  return (
    <div className="h-full w-full flex items-center justify-center p-6 bg-slate-950/60 overflow-y-auto">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-rose-600/20 to-amber-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            403 FORBIDDEN
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
            {roleMeta?.nameVi || user?.role || 'Khách'}
          </span>
        </div>

        {/* Title & Description */}
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
          Không Có Quyền Truy Cập
        </h2>

        <p className="text-xs md:text-sm text-slate-400 mb-6 leading-relaxed">
          Tài khoản của bạn ({user?.fullName || user?.username}) với vai trò{' '}
          <strong className="text-slate-200 font-semibold">{roleMeta?.label || user?.role}</strong>{' '}
          hiện không được cấp phép truy cập vào phân hệ{' '}
          <span className="text-rose-400 font-bold underline decoration-rose-500/40">
            {moduleMeta?.label || moduleId}
          </span>
          .
        </p>

        {/* Info Box */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-left text-xs space-y-1.5 mb-6 text-slate-300">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Người dùng:</span>
            <span className="text-white font-mono">{user?.username}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Module yêu cầu:</span>
            <span className="text-amber-400 font-semibold">{moduleMeta?.label || moduleId}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Chính sách phân quyền:</span>
            <span className="text-slate-400">Liên hệ Quản Trị Viên (Admin) để mở quyền</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(defaultTab)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại {defaultModuleMeta?.label || 'Trang Chính'}</span>
          </button>

          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Đổi Tài Khoản Khác</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
