import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoveHorizontal,
  Package,
  Building2,
  MapPin,
  DollarSign,
  Boxes,
  Sliders,
} from 'lucide-react';

export interface ColumnMarker {
  label: string;
  leftOffset: number;
  icon?: React.ReactNode;
}

export interface InventoryHorizontalScrollToolbarProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeTab?: string;
  markers?: ColumnMarker[];
}

export const InventoryHorizontalScrollToolbar: React.FC<InventoryHorizontalScrollToolbarProps> = ({
  containerRef,
  activeTab = 'catalog',
  markers,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Default markers based on tab
  const activeMarkers: ColumnMarker[] =
    markers ||
    (activeTab === 'catalog'
      ? [
          { label: 'Sản Phẩm', leftOffset: 0, icon: <Package className="w-3 h-3 text-cyan-400" /> },
          { label: 'Danh Mục & Kho', leftOffset: 320, icon: <Building2 className="w-3 h-3 text-indigo-400" /> },
          { label: 'Vị Trí & HSD', leftOffset: 650, icon: <MapPin className="w-3 h-3 text-amber-400" /> },
          { label: 'Giá Vốn & Bán', leftOffset: 950, icon: <DollarSign className="w-3 h-3 text-emerald-400" /> },
          { label: 'Tồn Kho & Thao Tác', leftOffset: 1400, icon: <Boxes className="w-3 h-3 text-purple-400" /> },
        ]
      : activeTab === 'receipts'
      ? [
          { label: 'Mã Phiếu', leftOffset: 0 },
          { label: 'NCC & Nguồn', leftOffset: 300 },
          { label: 'Mặt Hàng & Tiền', leftOffset: 650 },
          { label: 'Thanh Toán & Thao Tác', leftOffset: 1100 },
        ]
      : activeTab === 'outbound'
      ? [
          { label: 'Đơn Hàng', leftOffset: 0 },
          { label: 'Khách Hàng', leftOffset: 300 },
          { label: 'Sản Phẩm & Tiền', leftOffset: 650 },
          { label: 'Trạng Thái & Thao Tác', leftOffset: 1100 },
        ]
      : activeTab === 'serial_devices'
      ? [
          { label: 'Số Serial', leftOffset: 0 },
          { label: 'Thiết Bị & SKU', leftOffset: 250 },
          { label: 'Trạng Thái', leftOffset: 550 },
          { label: 'Vị Trí & Hạn BH', leftOffset: 900 },
        ]
      : activeTab === 'logs'
      ? [
          { label: 'Thời Gian', leftOffset: 0 },
          { label: 'Sản Phẩm', leftOffset: 200 },
          { label: 'Thay Đổi & Tồn', leftOffset: 500 },
          { label: 'Lý Do & Nhân Sự', leftOffset: 800 },
        ]
      : [
          { label: 'Đầu Bảng', leftOffset: 0 },
          { label: 'Giữa Bảng', leftOffset: 500 },
          { label: 'Cuối Bảng', leftOffset: 1000 },
        ]);

  // Update scroll state from container
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const current = el.scrollLeft;
    const pct = Math.round((current / maxScroll) * 100);
    setScrollProgress(pct);
    setCanScrollLeft(current > 5);
    setCanScrollRight(current < maxScroll - 5);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [containerRef, updateScrollState]);

  const scrollBy = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollTo = (leftOffset: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: leftOffset, behavior: 'smooth' });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const val = Number(e.target.value);
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (val / 100) * maxScroll;
  };

  return (
    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none backdrop-blur-md shadow-sm">
      {/* Left: Quick Jump Navigation Pills */}
      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
          <MoveHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Xem Cột:</span>
        </span>

        {activeMarkers.map((m, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollTo(m.leftOffset)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center gap-1.5 text-[11px] active:scale-95 cursor-pointer"
            title={`Cuộn ngang nhanh tới ${m.label}`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Right: Left / Right Scroll Buttons & Position Slider */}
      <div className="flex items-center gap-2">
        {/* Scroll Left Buttons */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={() => scrollTo(0)}
            disabled={!canScrollLeft}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            title="Cuộn về đầu bảng (Bên trái cùng)"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(-350)}
            disabled={!canScrollLeft}
            className="px-2 py-1 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
            title="Cuộn sang trái 350px"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trái</span>
          </button>
        </div>

        {/* Mini Range Slider */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
          <input
            type="range"
            min={0}
            max={100}
            value={scrollProgress}
            onChange={handleSliderChange}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-cyan-400"
            title={`Vị trí cuộn ngang: ${scrollProgress}%`}
          />
          <span className="text-[10px] font-mono text-cyan-400 w-7 text-right">
            {scrollProgress}%
          </span>
        </div>

        {/* Scroll Right Buttons */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={() => scrollBy(350)}
            disabled={!canScrollRight}
            className="px-2 py-1 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
            title="Cuộn sang phải 350px"
          >
            <span>Phải</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const el = containerRef.current;
              if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
            }}
            disabled={!canScrollRight}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            title="Cuộn tới cuối bảng (Bên phải cùng)"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keyboard hint badge */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800">
          <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[9px] text-cyan-300">Shift</kbd>
          <span>+ Lăn chuột</span>
        </div>
      </div>
    </div>
  );
};
