import React from 'react';
import {
  ShoppingBag,
  Package,
  Layers,
  Users,
  BarChart3,
  Sparkles,
  TicketPercent,
  Settings,
  CreditCard,
  UserCheck,
  FileSpreadsheet,
  Calculator,
  Building2,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Flame,
  Wrench,
  Receipt,
  FileSignature,
  Truck,
  UserCog,
  LogOut,
  Database,
} from 'lucide-react';
import { Order, Product } from '../types';
import { useAuth } from '../core/contexts/AuthContext';
import { SYSTEM_ROLES, normalizeRoleKey } from '../config/rbac.config';

interface SidebarProps {
  activeTab: string;
  onSelectTab?: (tab: any) => void;
  setActiveTab?: (tab: any) => void;
  orders?: Order[];
  products?: Product[];
  pendingOrdersCount?: number;
  lowStockCount?: number;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onOpenFraudAlert?: () => void;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  orders = [],
  products = [],
  pendingOrdersCount: propPendingOrders,
  lowStockCount: propLowStock,
  isCollapsed = false,
  setIsCollapsed,
  onOpenFraudAlert,
  onOpenAuthModal,
}) => {
  const { user, logout, hasModuleAccess, hasActionAccess } = useAuth();
  const handleSelect = onSelectTab || setActiveTab || (() => {});
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const pendingOrdersCount =
    propPendingOrders !== undefined
      ? propPendingOrders
      : safeOrders.filter((o) => o?.status === 'pending').length;

  const lowStockCount =
    propLowStock !== undefined
      ? propLowStock
      : safeProducts.filter((p) => p && p.stock <= p.minStock).length;

  const allNavItems = [
    {
      id: 'pos',
      label: 'Quản Lý Bán Hàng',
      icon: ShoppingBag,
    },
    {
      id: 'quotes',
      label: 'Quản Lý Báo Giá',
      icon: FileSpreadsheet,
    },
    {
      id: 'suppliers',
      label: 'Nhà Cung Ứng & Mua Hàng',
      icon: Truck,
    },
    {
      id: 'costing',
      label: 'Tính Giá Thành & BOM',
      icon: Calculator,
    },
    {
      id: 'inventory',
      label: 'Quản Lý Kho Hàng',
      icon: Layers,
    },
    {
      id: 'assets',
      label: 'Tài Sản & Thiết Bị',
      icon: Building2,
    },
    {
      id: 'warranties',
      label: 'Bảo Hành & Bảo Trì',
      icon: Wrench,
    },
    {
      id: 'accounting',
      label: 'Kế Toán & Công Nợ',
      icon: CreditCard,
    },
    {
      id: 'einvoices',
      label: 'Hóa Đơn Điện Tử (TT78)',
      icon: Receipt,
    },
    {
      id: 'contracts',
      label: 'Hợp Đồng Lao Động Online',
      icon: FileSignature,
    },
    {
      id: 'orders',
      label: 'Quản Lý Đơn Hàng & Vận Chuyển',
      icon: TrendingUp,
    },
    {
      id: 'hr',
      label: 'Chấm Công & HR & Lương',
      icon: UserCheck,
    },
    {
      id: 'ai',
      label: 'Dashboard AI Phân Tích',
      icon: Sparkles,
    },
    {
      id: 'customers',
      label: 'Khách Hàng & CRM',
      icon: Users,
    },
    {
      id: 'promotions',
      label: 'Khuyến Mãi & Voucher',
      icon: TicketPercent,
    },
    {
      id: 'analytics',
      label: 'Báo Cáo & Doanh Thu',
      icon: BarChart3,
    },
    {
      id: 'accounts',
      label: 'Quản Lý Tài Khoản & RBAC',
      icon: UserCog,
    },
    {
      id: 'masterdata',
      label: 'Dữ Liệu Cơ Bản & MDM',
      icon: Database,
    },
    {
      id: 'settings',
      label: 'Cài Đặt & Cấu Hình',
      icon: Settings,
    },
  ];

  // Filter modules based on current user's permissions
  const navItems = allNavItems.filter((item) => hasModuleAccess(item.id));
  const currentRoleKey = normalizeRoleKey(user?.role);
  const roleMeta = SYSTEM_ROLES.find((r) => r.id === currentRoleKey);
  const canViewFraud = hasActionAccess('fraud_alerts');

  return (
    <aside className="w-16 md:w-64 bg-[#090d16] border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-200 h-full overflow-hidden select-none">
      <div className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {/* Role Badge & Module Count in Sidebar Header */}
        <div className="hidden md:flex items-center justify-between px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-2">
          <span>DANH SÁCH MODULES ({navItems.length} ĐƯỢC PHÂN QUYỀN)</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? item.id === 'pos'
                    ? 'bg-[#0080ff] text-white shadow-lg shadow-blue-500/20 font-bold'
                    : 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
              title={item.label}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? item.id === 'pos'
                        ? 'text-white'
                        : 'text-cyan-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="hidden md:inline truncate text-left">{item.label}</span>
              </div>

              {isActive && (
                <div className="hidden md:flex items-center">
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      item.id === 'pos' ? 'text-white/80' : 'text-blue-400'
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Fraud Detection Card in bottom sidebar (Only if role has permission) */}
      {canViewFraud && (
        <div className="p-3 border-t border-slate-800/90 hidden md:block shrink-0 bg-[#070b12]">
          <button
            onClick={onOpenFraudAlert}
            className="w-full text-left p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 transition-all group shadow-md cursor-pointer"
            id="sidebar-fraud-btn"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Cảnh Báo AI Fraud</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow">
                1
              </span>
            </div>
            <p className="text-[11px] text-slate-300 group-hover:text-amber-200 transition-colors line-clamp-1">
              Phát hiện bất thường chiết khấu & lệch tiền ca
            </p>
          </button>
        </div>
      )}

      {/* User Account & Direct Logout Bar in Sidebar Bottom */}
      {user && (
        <div className="p-3 border-t border-slate-800/90 bg-slate-900/90 hidden md:block shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                  roleMeta?.gradient || 'from-blue-600 to-indigo-600'
                } flex items-center justify-center font-black text-white text-xs shadow-md shrink-0`}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">
                  {user.fullName?.split(' (')[0] || user.username}
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${roleMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {roleMeta?.nameVi || user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đổi tài khoản / vai trò"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
