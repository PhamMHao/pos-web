import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  KeyRound,
  RotateCcw,
  Save,
  Check,
  X,
  Layers,
  Lock,
  Unlock,
  Sliders,
  Eye,
  Info,
  Sparkles,
  RefreshCw,
  Building,
} from 'lucide-react';
import {
  SYSTEM_ROLES,
  SYSTEM_MODULES,
  SYSTEM_ACTIONS,
  RoleKey,
  DEFAULT_RBAC_MATRIX,
  normalizeRoleKey,
} from '../../config/rbac.config';
import { useAuth, UserProfile, DEMO_ACCOUNTS_LIST } from '../../core/contexts/AuthContext';
import { NewUserModal } from './NewUserModal';

export const AccountsManagerView: React.FC = () => {
  const {
    user: currentUser,
    permissionsMatrix,
    updatePermissionsMatrix,
    resetPermissionsToDefault,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'preview'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // User Accounts State (loaded from storage or seeded default demo accounts)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('gp_erp_accounts_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Convert DEMO_ACCOUNTS_LIST to UserProfile[]
    return DEMO_ACCOUNTS_LIST.map((acc) => ({
      id: acc.id,
      username: acc.username,
      fullName: acc.name,
      email: acc.email,
      phone: acc.phone,
      role: acc.role,
      status: 'active',
      isActive: true,
      avatar: null,
      createdAt: new Date().toISOString(),
    }));
  });

  const saveUsersToStorage = (updated: UserProfile[]) => {
    setUsers(updated);
    localStorage.setItem('gp_erp_accounts_list', JSON.stringify(updated));
  };

  // Matrix Editing State (copy from AuthContext)
  const [localMatrix, setLocalMatrix] = useState<Record<RoleKey, string[]>>(() => {
    return JSON.parse(JSON.stringify(permissionsMatrix || DEFAULT_RBAC_MATRIX));
  });

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [selectedPreviewRole, setSelectedPreviewRole] = useState<RoleKey>('cashier');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (permissionsMatrix) {
      setLocalMatrix(JSON.parse(JSON.stringify(permissionsMatrix)));
    }
  }, [permissionsMatrix]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Toggle permission for a role and permissionKey
  const handleTogglePermission = (role: RoleKey, permissionKey: string) => {
    if (role === 'admin') return; // Admin always full access

    setLocalMatrix((prev) => {
      const currentList = prev[role] || [];
      const hasPerm = currentList.includes(permissionKey);
      const nextList = hasPerm
        ? currentList.filter((k) => k !== permissionKey)
        : [...currentList, permissionKey];

      return {
        ...prev,
        [role]: nextList,
      };
    });
  };

  // Select all permissions for a role
  const handleSelectAllForRole = (role: RoleKey) => {
    if (role === 'admin') return;
    const allKeys = [
      ...SYSTEM_MODULES.map((m) => m.id),
      ...SYSTEM_ACTIONS.map((a) => a.id),
    ];
    setLocalMatrix((prev) => ({
      ...prev,
      [role]: allKeys,
    }));
  };

  // Deselect all permissions for a role
  const handleDeselectAllForRole = (role: RoleKey) => {
    if (role === 'admin') return;
    setLocalMatrix((prev) => ({
      ...prev,
      [role]: [],
    }));
  };

  // Save changes to AuthContext and localStorage
  const handleSaveMatrix = () => {
    updatePermissionsMatrix(localMatrix);
    setIsSavedToast(true);
    showToast('Đã lưu cấu hình ma trận phân quyền RBAC thành công! Các thay đổi đã được áp dụng ngay lập tức.');
    setTimeout(() => {
      setIsSavedToast(false);
    }, 2500);
  };

  // Reset to system defaults
  const handleResetMatrix = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục ma trận phân quyền về mặc định ban đầu của hệ thống?')) {
      resetPermissionsToDefault();
      setLocalMatrix(JSON.parse(JSON.stringify(DEFAULT_RBAC_MATRIX)));
      showToast('Đã khôi phục ma trận phân quyền về mặc định thành công.');
    }
  };

  // User CRUD Operations
  const handleSaveUser = (userData: UserProfile & { password?: string }) => {
    if (editingUser) {
      const updated = users.map((u) => (u.id === userData.id ? { ...u, ...userData } : u));
      saveUsersToStorage(updated);
      showToast(`Đã cập nhật thông tin tài khoản "${userData.fullName}"`);
    } else {
      const updated = [userData, ...users];
      saveUsersToStorage(updated);
      showToast(`Đã tạo tài khoản mới "${userData.fullName}" thành công`);
    }
    setEditingUser(null);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'inactive' ? 'active' : 'inactive';
        return { ...u, status: nextStatus, isActive: nextStatus === 'active' };
      }
      return u;
    });
    saveUsersToStorage(updated);
    showToast('Đã cập nhật trạng thái hoạt động của tài khoản');
  };

  const handleResetPassword = (u: UserProfile) => {
    if (window.confirm(`Bạn có muốn đặt lại mật khẩu cho tài khoản "${u.username}" về mật khẩu mặc định "123456"?`)) {
      showToast(`Đã đặt lại mật khẩu của @${u.username} thành: 123456`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete?.username === 'admin') {
      alert('Không thể xóa tài khoản Quản Trị Viên cao nhất (admin)!');
      return;
    }

    const updated = users.filter((u) => u.id !== userId);
    saveUsersToStorage(updated);
    setConfirmDeleteId(null);
    showToast(`Đã xóa tài khoản "${userToDelete?.fullName || userId}"`);
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery));

    const normRole = normalizeRoleKey(u.role);
    const matchRole = roleFilter === 'all' || normRole === roleFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.status !== 'inactive') ||
      (statusFilter === 'inactive' && u.status === 'inactive');

    return matchSearch && matchRole && matchStatus;
  });

  const activeCount = users.filter((u) => u.status !== 'inactive').length;
  const inactiveCount = users.filter((u) => u.status === 'inactive').length;

  return (
    <div className="h-full w-full flex flex-col bg-[#070b14] text-slate-100 overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-3.5 px-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-bold shadow-2xl flex items-center space-x-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="p-4 md:px-6 bg-slate-900/90 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                Quản Lý Tài Khoản & Ma Trận Phân Quyền RBAC
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                MODULE 18
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Quản trị nhân sự người dùng, phân quyền truy cập 18 modules và tác vụ nghiệp vụ theo từng vai trò
            </p>
          </div>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ma Trận Phân Quyền Động</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Danh Sách Tài Khoản ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Trước Quyền Role</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0 hover:scale-[1.02] active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm Tài Khoản</span>
            </button>
          )}

          {activeTab === 'matrix' && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetMatrix}
                className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                title="Khôi phục ma trận về mặc định của hệ thống"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Khôi Phục Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={handleSaveMatrix}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Cấu Hình Phân Quyền</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: DYNAMIC RBAC MATRIX (Trình chỉnh sửa ma trận phân quyền) */}
      {activeTab === 'matrix' && (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
          {/* Info Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start justify-between text-xs text-blue-200">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-bold">Hướng dẫn tùy chỉnh phân quyền:</strong>
                <p className="text-[11px] text-blue-300 mt-0.5 leading-relaxed">
                  Tích chọn hoặc bỏ chọn bất kỳ ô nào để bật/tắt quyền truy cập module hoặc tác vụ cho từng vai trò.
                  Sau khi điều chỉnh, hãy nhấn <strong>"Lưu Cấu Hình Phân Quyền"</strong> để hệ thống áp dụng tức thời cho toàn bộ nhân viên.
                  Tài khoản <strong>Quản Trị Viên (Admin)</strong> luôn được cố định toàn quyền để đảm bảo an toàn vận hành.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Matrix Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[900px]">
                {/* Table Header: Roles Columns */}
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-xs text-slate-300">
                    <th className="p-3.5 pl-5 font-bold uppercase tracking-wider sticky left-0 bg-slate-950 z-20 w-80">
                      Phân Hệ & Tác Vụ Nghiệp Vụ
                    </th>
                    {SYSTEM_ROLES.map((r) => (
                      <th
                        key={r.id}
                        className="p-3 text-center font-bold min-w-[110px]"
                      >
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.badgeColor}`}>
                            {r.label}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {localMatrix[r.id]?.length || 0} quyền
                          </div>
                          {r.id !== 'admin' && (
                            <div className="flex items-center space-x-1 mt-1 text-[9px]">
                              <button
                                type="button"
                                onClick={() => handleSelectAllForRole(r.id)}
                                className="text-blue-400 hover:underline cursor-pointer"
                              >
                                Tất cả
                              </button>
                              <span className="text-slate-600">|</span>
                              <button
                                type="button"
                                onClick={() => handleDeselectAllForRole(r.id)}
                                className="text-slate-400 hover:text-rose-400 cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {/* GROUP 1: 18 MODULES */}
                  <tr className="bg-slate-950/70">
                    <td
                      colSpan={SYSTEM_ROLES.length + 1}
                      className="p-2.5 pl-5 font-extrabold text-[11px] text-blue-400 uppercase tracking-wider flex items-center space-x-2"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>1. PHÂN QUYỀN TRUY CẬP 18 PHÂN HỆ MODULES CHÍNH</span>
                    </td>
                  </tr>

                  {SYSTEM_MODULES.map((m, idx) => {
                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/80'
                        }`}
                      >
                        {/* Module Name & Description */}
                        <td className="p-3 pl-5 sticky left-0 bg-inherit z-10 border-r border-slate-800/80">
                          <div className="font-bold text-white flex items-center space-x-2">
                            <span>{m.label}</span>
                            <span className="text-[10px] font-mono text-slate-500">({m.id})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{m.description}</p>
                        </td>

                        {/* Checkbox for each role */}
                        {SYSTEM_ROLES.map((r) => {
                          const isAllowed =
                            r.id === 'admin' || (localMatrix[r.id] || []).includes(m.id);

                          return (
                            <td key={r.id} className="p-3 text-center border-r border-slate-800/40">
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(r.id, m.id)}
                                disabled={r.id === 'admin'}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isAllowed
                                    ? r.id === 'admin'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-slate-950 text-slate-600 border border-slate-800 hover:border-slate-700 hover:text-slate-400'
                                }`}
                                title={
                                  r.id === 'admin'
                                    ? 'Quản trị viên luôn có toàn quyền'
                                    : `Bật/tắt quyền ${m.label} cho vai trò ${r.label}`
                                }
                              >
                                {isAllowed ? (
                                  r.id === 'admin' ? (
                                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                                  ) : (
                                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                                  )
                                ) : (
                                  <X className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* GROUP 2: QUICK ACTIONS & TOOLS */}
                  <tr className="bg-slate-950/70">
                    <td
                      colSpan={SYSTEM_ROLES.length + 1}
                      className="p-2.5 pl-5 font-extrabold text-[11px] text-amber-400 uppercase tracking-wider flex items-center space-x-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>2. PHÂN QUYỀN TÁC VỤ & CÔNG CỤ NHANH TRÊN THANH CÔNG CỤ (NAVBAR)</span>
                    </td>
                  </tr>

                  {SYSTEM_ACTIONS.map((a, idx) => {
                    return (
                      <tr
                        key={a.id}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/80'
                        }`}
                      >
                        {/* Action Name */}
                        <td className="p-3 pl-5 sticky left-0 bg-inherit z-10 border-r border-slate-800/80">
                          <div className="font-bold text-white flex items-center space-x-2">
                            <span>{a.label}</span>
                            <span className="text-[10px] font-mono text-slate-500">({a.id})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{a.description}</p>
                        </td>

                        {/* Checkbox for each role */}
                        {SYSTEM_ROLES.map((r) => {
                          const isAllowed =
                            r.id === 'admin' || (localMatrix[r.id] || []).includes(a.id);

                          return (
                            <td key={r.id} className="p-3 text-center border-r border-slate-800/40">
                              <button
                                type="button"
                                onClick={() => handleTogglePermission(r.id, a.id)}
                                disabled={r.id === 'admin'}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isAllowed
                                    ? r.id === 'admin'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-slate-950 text-slate-600 border border-slate-800 hover:border-slate-700 hover:text-slate-400'
                                }`}
                                title={`Bật/tắt tác vụ ${a.label} cho vai trò ${r.label}`}
                              >
                                {isAllowed ? (
                                  r.id === 'admin' ? (
                                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                                  ) : (
                                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                                  )
                                ) : (
                                  <X className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Action Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Tổng cộng: <strong className="text-white">18 Modules</strong> +{' '}
                <strong className="text-white">8 Tác Vụ Nhanh</strong> trên <strong>7 Vai Trò</strong>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleResetMatrix}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy / Khôi Phục
                </button>
                <button
                  type="button"
                  onClick={handleSaveMatrix}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Thay Đổi Phân Quyền</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS LIST (Danh sách tài khoản người dùng) */}
      {activeTab === 'users' && (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Tổng Tài Khoản</p>
                <p className="text-xl font-black text-white mt-0.5">{users.length}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Đang Hoạt Động</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{activeCount}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Đang Bị Khóa</p>
                <p className="text-xl font-black text-rose-400 mt-0.5">{inactiveCount}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Số Vai Trò RBAC</p>
                <p className="text-xl font-black text-purple-400 mt-0.5">7 Vai Trò</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo họ tên, username, email, phone..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả Vai trò</option>
                {SYSTEM_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} ({r.nameVi})
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả Trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đang bị khóa</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Người Dùng</th>
                    <th className="p-3.5">Liên Hệ</th>
                    <th className="p-3.5 text-center">Vai Trò (Role)</th>
                    <th className="p-3.5 text-center">Trạng Thái</th>
                    <th className="p-3.5 text-right pr-5">Thao Tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const normRole = normalizeRoleKey(u.role);
                      const roleMeta = SYSTEM_ROLES.find((r) => r.id === normRole);
                      const isInactive = u.status === 'inactive';

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          {/* User Avatar & Name */}
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                                  roleMeta?.gradient || 'from-blue-600 to-indigo-600'
                                } flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0`}
                              >
                                {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                                  <span>{u.fullName}</span>
                                  {u.username === currentUser?.username && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-mono">
                                      Bạn
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  @{u.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="p-3.5 text-slate-300">
                            <div>{u.email || 'Chưa cập nhật email'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {u.phone || 'Chưa cập nhật SĐT'}
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                roleMeta?.badgeColor || 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {roleMeta?.nameVi || u.role}
                            </span>
                          </td>

                          {/* Status Switch */}
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id)}
                              disabled={u.username === 'admin'}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                isInactive
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              }`}
                              title={
                                u.username === 'admin'
                                  ? 'Không thể khóa tài khoản Admin'
                                  : 'Bấm để đổi trạng thái khóa/mở'
                              }
                            >
                              {isInactive ? 'Đã Tạm Khóa' : 'Đang Hoạt Động'}
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3.5 text-right pr-5">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleResetPassword(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors cursor-pointer"
                                title="Đặt lại mật khẩu thành 123456"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  setIsUserModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-blue-950/40 transition-colors cursor-pointer"
                                title="Chỉnh sửa tài khoản"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {u.username !== 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Xóa tài khoản"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE PERMISSION PREVIEW (Xem trước quyền từng vai trò) */}
      {activeTab === 'preview' && (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Chọn Vai Trò Để Xem Trước Quyền Hạn:</h3>
              <p className="text-[11px] text-slate-400">
                Xem toàn bộ các module và tác vụ mà nhân viên thuộc vai trò này sẽ nhìn thấy khi đăng nhập
              </p>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto max-w-full py-1">
              {SYSTEM_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedPreviewRole(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    selectedPreviewRole === r.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Preview Card */}
          {(() => {
            const roleMeta = SYSTEM_ROLES.find((r) => r.id === selectedPreviewRole);
            const currentPerms = localMatrix[selectedPreviewRole] || [];
            const accessibleModules = SYSTEM_MODULES.filter(
              (m) => selectedPreviewRole === 'admin' || currentPerms.includes(m.id)
            );
            const inaccessibleModules = SYSTEM_MODULES.filter(
              (m) => selectedPreviewRole !== 'admin' && !currentPerms.includes(m.id)
            );
            const accessibleActions = SYSTEM_ACTIONS.filter(
              (a) => selectedPreviewRole === 'admin' || currentPerms.includes(a.id)
            );

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Role Info & Active Modules (8 cols) */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                        roleMeta?.gradient || 'from-blue-600 to-indigo-600'
                      } flex items-center justify-center font-bold text-white shadow-lg text-lg`}
                    >
                      {roleMeta?.label.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-black text-white">{roleMeta?.nameVi}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta?.badgeColor}`}>
                          {roleMeta?.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{roleMeta?.description}</p>
                    </div>
                  </div>

                  {/* Accessible Modules List */}
                  <div>
                    <h5 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Các Module Được Phép Truy Cập ({accessibleModules.length} Modules)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {accessibleModules.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start space-x-2"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{m.label}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">{m.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accessible Actions */}
                  <div>
                    <h5 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Các Tác Vụ Thanh Công Cụ Được Phép ({accessibleActions.length} Tác Vụ)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {accessibleActions.map((a) => (
                        <div
                          key={a.id}
                          className="p-2 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start space-x-2 text-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-slate-200 font-semibold">{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Restricted Modules (4 cols) */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                  <h5 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Module Bị Chặn / Ẩn ({inaccessibleModules.length})</span>
                  </h5>

                  {inaccessibleModules.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-400">
                      Vai trò này có quyền truy cập toàn bộ các module trong hệ thống.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                      {inaccessibleModules.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400"
                        >
                          <span>{m.label}</span>
                          <Lock className="w-3.5 h-3.5 text-rose-400/80" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* New / Edit User Modal */}
      <NewUserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        editingUser={editingUser}
      />
    </div>
  );
};
