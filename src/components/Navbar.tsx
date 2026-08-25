import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  LogOut,
  Barcode,
  UserCog,
  KeyRound,
} from 'lucide-react';
import { StoreSettings, CashShift, Product } from '../types';
import { useAuth } from '../core/contexts/AuthContext';
import { SYSTEM_ROLES, normalizeRoleKey } from '../config/rbac.config';

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
  onOpenUniversalSearch?: () => void;
  onOpenDigitalSignatureHub?: () => void;
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
  onOpenUniversalSearch,
  onOpenDigitalSignatureHub,
  isSyncingDb,
  lastSyncTime,
}) => {
  const { user, logout, hasModuleAccess, hasActionAccess } = useAuth();
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      navScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNavWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navScrollRef.current) {
      if (e.deltaY !== 0) {
        navScrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

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

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lowStockProducts = safeProducts.filter((p) => p && p.stock <= p.minStock);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // RBAC Permission checks for quick actions
  const canAccessPos = hasModuleAccess('pos');
  const canAccessScannerHub = hasActionAccess('scanner_printer_hub');
  const canAccessQuickStock = hasActionAccess('quick_stock');
  const canAccessAiCopilot = hasActionAccess('ai_copilot');
  const canAccessCashShift = hasActionAccess('cash_shift');
  const canAccessDocOcr = hasActionAccess('doc_ocr');
  const canAccessDigitalSignature = hasActionAccess('digital_signature');
  const isUserAdmin = normalizeRoleKey(user?.role) === 'admin';
  const roleMeta = SYSTEM_ROLES.find((r) => r.id === normalizeRoleKey(user?.role));

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md text-slate-100 px-3 md:px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0 sticky top-0 z-30 shadow-md select-none gap-2 md:gap-3 overflow-hidden">
      {/* LEFT: Brand & Store Identity */}
      <div
        className="flex items-center space-x-3 cursor-pointer group transition-transform active:scale-[0.99] shrink-0 z-10"
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

      {/* SCROLLABLE NAVIGATION & QUICK ACTIONS */}
      <div className="flex-1 flex items-center min-w-0 ml-1 md:ml-3 relative group/navbar">
        {/* Left Scroll Navigation Button */}
        <button
          type="button"
          onClick={() => scrollNav('left')}
          className="h-8 w-6 bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white rounded-l-lg border border-slate-700 flex items-center justify-center shrink-0 z-10 cursor-pointer shadow transition-colors mr-0.5"
          title="Cuộn sang trái"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={navScrollRef}
          onWheel={handleNavWheel}
          className="flex-1 flex items-center justify-start space-x-2.5 overflow-x-auto pos-toolbar-scroll py-1 shrink min-w-0 scroll-smooth px-1"
        >
          {/* Main Action: Bán Hàng POS (F2) */}
          {canAccessPos && (
            <button
              onClick={() => handleNavigate('pos')}
              className={`flex items-center space-x-2 px-3.5 h-9 rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-blue-600 text-white shadow-blue-600/30 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-800 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-blue-500/50'
              }`}
              title="Mở màn hình Bán Hàng Thu Ngân POS (F2)"
            >
              <ShoppingBag
                className={`w-4 h-4 ${activeTab === 'pos' ? 'text-white' : 'text-blue-400'}`}
              />
              <span>Bán Hàng (F2)</span>
            </button>
          )}

          {/* Scanner & Printer Hub (F3) */}
          {canAccessScannerHub && onOpenScannerPrinterHub && (
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
          {canAccessQuickStock && (
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80 shrink-0">
              <button
                onClick={() => {
                  if (onQuickStock) onQuickStock('import');
                  else handleNavigate('inventory');
                }}
                className="flex items-center space-x-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors whitespace-nowrap cursor-pointer"
                title="Tạo phiếu Nhập kho nhanh"
              >
                <PackagePlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nhập Kho</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-700" />

              <button
                onClick={() => {
                  if (onQuickStock) onQuickStock('export');
                  else handleNavigate('inventory');
                }}
                className="flex items-center space-x-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 transition-colors whitespace-nowrap cursor-pointer"
                title="Tạo phiếu Xuất kho nhanh"
              >
                <PackageMinus className="w-3.5 h-3.5 text-amber-400" />
                <span>Xuất Kho</span>
              </button>
            </div>
          )}

          {/* AI Copilot Assistant Trigger */}
          {canAccessAiCopilot && onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 h-9 rounded-xl text-xs font-bold bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 transition-all shadow-sm whitespace-nowrap cursor-pointer shrink-0"
              title="Mở Trợ Lý AI GP-Copilot (F1)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Trợ Lý AI (F1)</span>
            </button>
          )}

          {/* Active Cash Shift Pill */}
          {canAccessCashShift && (
            <button
              onClick={onOpenShiftModal}
              className="flex items-center space-x-2 px-3 h-9 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 transition-all shadow-sm whitespace-nowrap cursor-pointer shrink-0"
              title="Quản lý ca làm việc & tiền mặt két thu ngân"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-medium">
                Ca:{' '}
                <strong className="text-white font-bold">
                  {currentShift?.staffName?.split(' ').slice(-2).join(' ') ||
                    user?.fullName?.split(' ').slice(-2).join(' ') ||
                    'Thu Ngân'}
                </strong>
              </span>
              <span className="text-emerald-500 font-mono">|</span>
              <span className="font-mono font-bold text-emerald-400">
                {new Intl.NumberFormat('vi-VN').format(currentShift?.expectedEndingCash || 4273000)}đ
              </span>
            </button>
          )}

          {/* Universal Search & QR Barcode Hub (F7) */}
          {onOpenUniversalSearch && (
            <button
              type="button"
              onClick={onOpenUniversalSearch}
              className="flex items-center space-x-1.5 px-3 h-9 bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-300 hover:text-cyan-200 text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/30 border border-cyan-500/40 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
              title="Trung Tâm Tra Cứu, Quét Mã Vạch / QR & Dòng Đời Sản Phẩm (Phím F7)"
            >
              <Barcode className="w-4 h-4 text-cyan-400" />
              <span>Tra Cứu & QR (F7)</span>
            </button>
          )}

          {/* AI Document OCR Button */}
          {canAccessDocOcr && onOpenDocOcrScanner && (
            <button
              type="button"
              onClick={onOpenDocOcrScanner}
              className="flex items-center space-x-1.5 px-3 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/40 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
              title="Quét hóa đơn / báo giá bằng camera điện thoại & Import Excel (AI OCR)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Quét Phiếu / Excel (AI)</span>
            </button>
          )}

          {/* Digital Signature Hub Button */}
          {canAccessDigitalSignature && onOpenDigitalSignatureHub && (
            <button
              type="button"
              onClick={onOpenDigitalSignatureHub}
              className="flex items-center space-x-1.5 px-3 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 border border-emerald-400/40 transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
              title="Cổng quản lý & điều hành chữ ký số tập trung (Viettel, VNPT, FPT, SmartCA)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Ký Số CA</span>
            </button>
          )}

          {/* Digital Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-cyan-300 font-mono bg-slate-800/80 px-2.5 h-9 rounded-xl border border-slate-700/80 whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold tracking-wider">{time || '00:00:00'}</span>
          </div>

          {/* Keyboard Shortcuts */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="hidden xl:flex items-center space-x-1 px-2.5 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-700/80 transition-colors whitespace-nowrap cursor-pointer shrink-0"
              title="Xem bảng phím tắt POS (F2, F4, F9...)"
            >
              <Keyboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Phím Tắt</span>
            </button>
          )}

          {/* Low Stock Notifications */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80 flex items-center justify-center cursor-pointer"
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
                    className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
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
                        <div className="font-semibold text-slate-200 line-clamp-1">{p.name}</div>
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

                {lowStockProducts.length > 0 && hasModuleAccess('inventory') && (
                  <button
                    onClick={() => {
                      handleNavigate('inventory');
                      setShowNotifications(false);
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-950/70 rounded-xl border border-blue-800/50 transition-colors cursor-pointer"
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
              className="p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80 flex items-center justify-center cursor-pointer shrink-0"
              title={
                settings?.theme === 'light' ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'
              }
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
            className="hidden sm:flex p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/80 items-center justify-center cursor-pointer shrink-0"
            title="Toàn màn hình (F11)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Scroll Navigation Button */}
        <button
          type="button"
          onClick={() => scrollNav('right')}
          className="h-8 w-6 bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white rounded-r-lg border border-slate-700 flex items-center justify-center shrink-0 z-10 cursor-pointer shadow transition-colors ml-0.5"
          title="Cuộn sang phải"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* USER PROFILE DROPDOWN & SWITCHER (Always Pinned Right) */}
      <div className="flex items-center space-x-1.5 shrink-0" ref={userMenuRef}>
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 pl-2 pr-1.5 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-600 cursor-pointer transition-all shadow-sm"
            title="Bấm để mở menu tài khoản & phân quyền"
          >
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${
                roleMeta?.gradient || 'from-blue-600 to-indigo-600'
              } flex items-center justify-center font-bold text-white text-xs ring-1 ring-blue-400/50 shadow-sm shrink-0`}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[110px]">
                {user?.fullName?.split(' (')[0] || 'Quản Trị Viên'}
              </div>
              <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                {roleMeta?.label || user?.role || 'ADMIN'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header info */}
            <div className="p-2.5 pb-3 border-b border-slate-800">
              <div className="text-xs font-bold text-white">{user?.fullName}</div>
              <div className="text-[11px] text-slate-400 font-mono">@{user?.username}</div>
              <div className="mt-1.5">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta?.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {roleMeta?.nameVi || user?.role}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1.5 space-y-1">
              {isUserAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    handleNavigate('accounts');
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <UserCog className="w-4 h-4 text-blue-400" />
                  <span>Quản Lý Tài Khoản & RBAC</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Chuyển Đổi Vai Trò / Tài Khoản</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất Khỏi Hệ Thống</span>
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Direct Action Buttons on Navbar */}
        {onOpenAuthModal && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="p-2 h-9 w-9 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors border border-slate-700/80 hidden sm:flex items-center justify-center cursor-pointer"
            title="Chuyển đổi tài khoản / vai trò (1-Click Switch)"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
          </button>
        )}

        <button
          type="button"
          onClick={() => logout()}
          className="p-2 h-9 w-9 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-slate-700/80 flex items-center justify-center cursor-pointer"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
