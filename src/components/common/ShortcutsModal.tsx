import React from 'react';
import { X, Keyboard, Sparkles, ShoppingBag, Layers, Printer, Monitor } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
  category: 'pos' | 'nav' | 'system';
}

const SHORTCUTS: { category: string; icon: any; items: ShortcutItem[] }[] = [
  {
    category: 'Thao Tác Bán Hàng POS (Quầy Thu Ngân)',
    icon: ShoppingBag,
    items: [
      { key: 'F2', description: 'Tìm kiếm sản phẩm & Quét mã vạch (Focus ô tìm kiếm)', category: 'pos' },
      { key: 'F4', description: 'Tìm & Chọn khách hàng thân thiết / B2B', category: 'pos' },
      { key: 'F6', description: 'Nhập mã giảm giá & Áp dụng khuyến mãi', category: 'pos' },
      { key: 'F9 / Enter', description: 'Mở cửa sổ Thanh toán đơn hàng (Checkout)', category: 'pos' },
      { key: 'ESC', description: 'Đóng Modal hiện tại / Hủy đơn trắng giỏ hàng', category: 'pos' },
      { key: 'Ctrl + P', description: 'In hóa đơn nhiệt K80 / Hóa đơn A4', category: 'pos' },
    ],
  },
  {
    category: 'Hệ Thống & Trợ Lý Thông Minh',
    icon: Sparkles,
    items: [
      { key: 'F1', description: 'Mở Trợ Lý AI GP-Copilot (Tư vấn doanh thu & gợi ý tồn kho)', category: 'system' },
      { key: 'F11', description: 'Bật / Tắt chế độ Toàn màn hình bán hàng chuyên nghiệp', category: 'system' },
      { key: 'Space', description: 'Tạm dừng hoặc kích hoạt quét mã vạch Barcode Scanner', category: 'system' },
    ],
  },
  {
    category: 'Chuyển Đổi Phân Hệ Nhanh',
    icon: Layers,
    items: [
      { key: 'Alt + 1', description: 'Màn hình Bán Hàng Thu Ngân (POS)', category: 'nav' },
      { key: 'Alt + 2', description: 'Quản Lý Đơn Hàng & Lịch Sử Hóa Đơn', category: 'nav' },
      { key: 'Alt + 3', description: 'Quản Lý Kho Hàng, Tồn Kho & Nhập Xuất', category: 'nav' },
      { key: 'Alt + 4', description: 'Sổ Quỹ Thu Chi & Công Nợ Khách Hàng', category: 'nav' },
      { key: 'Alt + 5', description: 'Quản Trị Nhân Sự HR & Ca Trực', category: 'nav' },
    ],
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Bảng Phím Tắt Thao Tác Nhanh ERP & POS</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Speed Up
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sử dụng bàn phím để tăng tốc độ thu ngân và chuyển đổi phân hệ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {SHORTCUTS.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{sec.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sec.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-colors"
                    >
                      <span className="text-xs text-slate-300 pr-2 leading-tight">
                        {item.description}
                      </span>
                      <kbd className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold text-xs rounded-lg shadow-sm shrink-0">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Mẹo: Nhấn phím <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono text-[11px]">ESC</kbd> bất kỳ lúc nào để đóng cửa sổ
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-600/20 ml-auto"
          >
            Đã Hiểu (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
