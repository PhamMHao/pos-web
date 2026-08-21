import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag,
  PackagePlus,
  PackageMinus,
  Sparkles,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Keyboard,
  Moon,
  Sun,
  ChevronDown,
  Layers,
  ShieldCheck,
  User,
  LogOut,
  Barcode,
} from 'lucide-react';
import { StoreSettings, CashShift, Product } from '../types';
import { useAuth } from '../core/contexts/AuthContext';

interface NavbarProps {
  settings: StoreSettings;
  currentShift: CashShift | null;
  onOpenShiftModal: () => void;
  products?: Product[];
  onNavigate?: (tab: any) => void;
  setActiveTab?: (tab: any) => void;
  activeTab: string;
  pendingOrdersCount?: number;
  lowStockCount?: number;
  onOpenShortcuts?: () => void;
  onOpenFraudAlert?: () => void;
  onToggleTheme?: () => void;
  onQuickStock?: (type: 'import' | 'export' | 'audit_adjustment') => void;
  onOpenDevices?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenDbConfig?: () => void;
  onOpenAuthModal?: () => void;
  onRefreshDb?: () => void;
  onOpenScannerPrinterHub?: () => void;
  onOpenDocOcrScanner?: () => void;
  isSyncingDb?: boolean;
  lastSyncTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentShift,
  onOpenShiftModal,
  products = [],
  onNavigate,
  setActiveTab,
  activeTab,
  pendingOrdersCount,
  lowStockCount: propLowStock,
  onOpenShortcuts,
  onOpenFraudAlert,
  onToggleTheme,
  onQuickStock,
  onOpenDevices,
  onOpenAiAssistant,
  onOpenDbConfig,
  onOpenAuthModal,
  onRefreshDb,
  onOpenScannerPrinterHub,
  onOpenDocOcrScanner,
  isSyncingDb,
  lastSyncTime,
}) => {
  const { user, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavigate = onNavigate || setActiveTab || (() => {});
  const safeProducts = Array.isArray(products) ? products : [];

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockProducts = safeProducts.filter((p) => p && p.stock <= p.minStock);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md text-slate-100 px-4 md:px-6 flex items-center justify-between border-b border-slate-800/80 shrink-0 sticky top-0 z-30 shadow-md select-none">
      {/* LEFT: Brand & Store Identity */}
      <div 
        className="flex items-center space-x-3 cursor-pointer group transition-transform active:scale-[0.99] shrink-0" 
        onClick={() => handleNavigate('pos')}
      >
        <div className="h-10 px-2 rounded-xl bg-white flex items-center justify-center shadow-md shadow-blue-500/10 border border-slate-700 shrink-0">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              referrerPolicy="no-referrer"
              className="h-7 max-w-[110px] object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
              GP
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-sm md:text-base tracking-tight text-white whitespace-nowrap group-hover:text-blue-400 transition-colors">
              {settings?.brandName || settings?.storeName || 'GIA PHÚC Computer'}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap">
              ERP 2026
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden lg:block truncate max-w-xs md:max-w-sm">
            {settings?.companyLegalName || settings?.tagline || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC'}
          </p>
        </div>
      </div>

      {/* CENTER: Essential POS & Quick Actions (Clean, Balanced & Modern) */}
      <div className="hidden md:flex items-center space-x-2 shrink-0">
        {/* Main Action: Bán Hàng POS (F2) */}
        <button
          onClick={() => handleNavigate('pos')}
          className={`flex items-center space-x-2 px-3.5 h-9 rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap ${
            activeTab === 'pos'
              ? 'bg-blue-600 text-white shadow-blue-600/30 shadow-md ring-2 ring-blue-400/40'
              : 'bg-slate-800 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-blue-500/50'
          }`}
          title="Mở màn hình Bán Hàng Thu Ngân POS (F2)"
        >
          <ShoppingBag className={`w-4 h-4 ${activeTab === 'pos' ? 'text-white' : 'text-blue-400'}`} />
          <span>Bán Hàng (F2)</span>
        </button>

        {/* Scanner & Printer Hub (F3) */}
        {onOpenScannerPrinterHub && (
          <button
            onClick={onOpenScannerPrinterHub}
            className="flex items-center space-x-1.5 px-3 h-9 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white transition-all shadow-md shadow-amber-600/25 whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-98"
            title="Mở Trung Tâm Máy Quét Mã Vạch & Máy In (F3)"
          >
            <Barcode className="w-4 h-4 text-amber-200" />
            <span>Quét & In (F3)</span>
          </button>
        )}

        {/* Quick Inventory Stock In/Out */}
        <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80">
          <button
            onClick={() => {
              if (onQuickStock) onQuickStock('import');
              else handleNavigate('inventory');
            }}
            className="flex items-center space-x-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors whitespace-nowrap"
            title="Tạo phiếu Nhập kho nhanh"
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nhập Kho</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700"></div>

          <button
            onClick={() => {
              if (onQuickStock) onQuickStock('export');
              else handleNavigate('inventory');
            }}
            className="flex items-center space-x-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors whitespace-nowrap"
            title="Tạo phiếu Xuất kho nhanh"
          >
            <PackageMinus className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất Kho</span>
          </button>
        </div>

        {/* AI Copilot Assistant Trigger */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center space-x-1.5 px-3 h-9 rounded-xl text-xs font-bold bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 transition-all shadow-sm whitespace-nowrap"
            title="Mở Trợ Lý AI GP-Copilot (F1)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Trợ Lý AI (F1)</span>
          </button>
        )}
      </div>

      {/* RIGHT: Shift Status, Database Health, Tools & Profile */}
      <div className="flex items-center space-x-2 md:space-x-2.5 shrink-0">
        {/* Active Cash Shift Pill */}
        <button
          onClick={onOpenShiftModal}
          className="flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 transition-all shadow-sm whitespace-nowrap"
          title="Quản lý ca làm việc & tiền mặt két thu ngân"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-medium">
            Ca: <strong className="text-white font-bold">{currentShift?.staffName?.split(' ').slice(-2).join(' ') || 'Thu Ngân'}</strong>
          </span>
          <span className="text-emerald-500 font-mono">|</span>
          <span className="font-mono font-bold text-emerald-400">
            {new Intl.NumberFormat('vi-VN').format(currentShift?.expectedEndingCash || 4273000)}đ
          </span>
        </button>





        {/* AI Document OCR & Excel Button */}
        <button
          type="button"
          onClick={onOpenDocOcrScanner}
          className="flex items-center space-x-1.5 px-3 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/40 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          title="Quét hóa đơn / báo giá bằng camera điện thoại & Import Excel (AI OCR)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Quét Phiếu / Excel (AI)</span>
        </button>

        {/* Digital Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-cyan-300 font-mono bg-slate-800/80 px-2.5 h-9 rounded-xl border border-slate-700/80 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold tracking-wider">{time || '00:00:00'}</span>
        </div>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="hidden xl:flex items-center space-x-1 px-2.5 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors whitespace-nowrap"
          title="Xem bảng phím tắt POS (F2, F4, F9...)"
        >
          <Keyboard className="w-3.5 h-3.5 text-blue-400" />
          <span>Phím Tắt</span>
        </button>

        {/* Low Stock Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80 flex items-center justify-center"
            title="Cảnh báo tồn kho & thông báo"
          >
            <Bell className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cảnh Báo Tồn Kho ({lowStockProducts.length})</span>
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Đóng
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/80 my-2">
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    Tồn kho đầy đủ, không có sản phẩm nào sắp hết.
                  </div>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleNavigate('inventory');
                        setShowNotifications(false);
                      }}
                      className="py-2 px-1 text-xs hover:bg-slate-800/60 rounded cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-slate-200 line-clamp-1">
                        {p.name}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>SKU: {p.sku}</span>
                        <span className="text-rose-400 font-bold">
                          Còn lại: {p.stock} {p.unit} (Tối thiểu: {p.minStock})
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {lowStockProducts.length > 0 && (
                <button
                  onClick={() => {
                    handleNavigate('inventory');
                    setShowNotifications(false);
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-950/70 rounded-xl border border-blue-800/50 transition-colors"
                >
                  Xem chi tiết kho hàng →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80 flex items-center justify-center"
            title={settings?.theme === 'light' ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
          >
            {settings?.theme === 'light' ? (
              <Moon className="w-4 h-4 text-blue-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        )}

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80 items-center justify-center"
          title="Toàn màn hình (F11)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <div
            onClick={() => {
              if (onOpenAuthModal) onOpenAuthModal();
              else setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center space-x-2 pl-2 pr-1 h-9 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 cursor-pointer transition-all"
            title="Tài khoản đăng nhập"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-7 h-7 rounded-lg object-cover ring-2 ring-blue-500/40 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs ring-1 ring-blue-400/50 shadow-sm shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="hidden xl:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                {user?.fullName || currentShift?.staffName || 'Quản Trị Viên'}
              </div>
              <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                {user?.role || 'ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};
