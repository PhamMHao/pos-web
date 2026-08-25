import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Barcode,
  QrCode,
  Sliders,
  Eye,
  Building2,
  Tag,
  DollarSign,
  Search,
  Trash2,
  Info,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Settings2,
  AlignLeft,
  AlignCenter,
  Type,
  Square,
  Grid,
  FileText,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  LABEL_SIZE_PRESETS,
  LabelSizePreset,
  generateBarcodeSVG,
  getQRCodeUrl,
} from '../../utils/barcodeGenerator';
import { formatVND } from '../../utils/vietqr';

export interface PrintLabelItem {
  id?: string;
  code: string;
  name: string;
  price?: number;
  brand?: string;
  location?: string;
  unit?: string;
  quantity?: number;
  extraText?: string;
}

export interface BarcodeLabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items: PrintLabelItem[];
  defaultPreset?: LabelSizePreset | 'custom';
  defaultCodeType?: 'barcode' | 'qrcode' | 'both';
  storeName?: string;
}

export const BarcodeLabelPreviewModal: React.FC<BarcodeLabelPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Bản Xem Trước & In Tem Mã Vạch (Print Preview)',
  items = [],
  defaultPreset = '50x30',
  defaultCodeType = 'barcode',
  storeName = 'GIA PHÚC COMPUTER',
}) => {
  // 1. Preset & Dimension State
  const [selectedPreset, setSelectedPreset] = useState<LabelSizePreset | 'custom'>(defaultPreset);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode' | 'both'>(defaultCodeType);
  
  // Custom Size Settings
  const [customWidthMm, setCustomWidthMm] = useState(50);
  const [customHeightMm, setCustomHeightMm] = useState(30);
  const [customColumns, setCustomColumns] = useState(1);
  const [customPaddingMm, setCustomPaddingMm] = useState(1.5);
  const [customGapMm, setCustomGapMm] = useState(2);

  // 2. View Mode & Zoom (60% to 250%)
  const [viewMode, setViewMode] = useState<'roll' | 'single'>('roll');
  const [zoomLevel, setZoomLevel] = useState(1.1);

  // 3. Quick Display Customizer Toggles
  const [showBrand, setShowBrand] = useState(true);
  const [brandText, setBrandText] = useState(storeName);
  const [showName, setShowName] = useState(true);
  const [nameClampLines, setNameClampLines] = useState<1 | 2>(2);
  const [showPrice, setShowPrice] = useState(true);
  const [showUnit, setShowUnit] = useState(true);
  const [showCodeText, setShowCodeText] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showBorder, setShowBorder] = useState(true);
  const [fontSizeScale, setFontSizeScale] = useState<'small' | 'normal' | 'large'>('normal');
  const [textAlign, setTextAlign] = useState<'center' | 'left'>('center');

  // 4. Print Item Quantities
  const [labelItems, setLabelItems] = useState<PrintLabelItem[]>(() => {
    return items.map((i) => ({ ...i, quantity: Math.max(1, i.quantity || 1) }));
  });

  React.useEffect(() => {
    setLabelItems(items.map((i) => ({ ...i, quantity: Math.max(1, i.quantity || 1) })));
  }, [items]);

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Compute active dimension config
  const currentConfig = useMemo(() => {
    if (selectedPreset === 'custom') {
      return {
        id: 'custom' as any,
        name: 'Tùy chỉnh (' + customWidthMm + 'x' + customHeightMm + 'mm)',
        widthMm: customWidthMm,
        heightMm: customHeightMm,
        columns: customColumns,
        gapMm: customGapMm,
        paddingMm: customPaddingMm,
        description: 'Khổ tem người dùng tự định nghĩa',
        defaultBarHeight: Math.max(18, Math.round(customHeightMm * 0.45)),
        fontSize: {
          brand: Math.max(6, Math.round(customHeightMm * 0.22)),
          title: Math.max(7, Math.round(customHeightMm * 0.26)),
          price: Math.max(8, Math.round(customHeightMm * 0.32)),
          code: Math.max(6, Math.round(customHeightMm * 0.22)),
        },
      };
    }
    const preset = LABEL_SIZE_PRESETS[selectedPreset] || LABEL_SIZE_PRESETS['50x30'];
    return {
      ...preset,
      paddingMm: 1.2,
    };
  }, [selectedPreset, customWidthMm, customHeightMm, customColumns, customGapMm, customPaddingMm]);

  // Font multiplier
  const fontMultiplier = fontSizeScale === 'small' ? 0.85 : fontSizeScale === 'large' ? 1.2 : 1;

  const handleUpdateQuantity = (idx: number, qty: number) => {
    const safeQty = Math.max(1, Math.min(999, qty || 1));
    setLabelItems((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity: safeQty } : item)));
  };

  const handleRemoveItem = (idx: number) => {
    setLabelItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSetAllQty = (qty: number) => {
    setLabelItems((prev) => prev.map((i) => ({ ...i, quantity: qty })));
  };

  const totalLabelsCount = labelItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  // Expanded list for printing and roll view
  const expandedLabels = useMemo(() => {
    const list: PrintLabelItem[] = [];
    labelItems.forEach((item) => {
      const count = item.quantity || 1;
      for (let i = 0; i < count; i++) {
        list.push(item);
      }
    });
    return list;
  }, [labelItems]);

  // Capped preview list for instant on-screen rendering (< 10ms)
  const previewLabels = useMemo(() => {
    return expandedLabels.slice(0, 48);
  }, [expandedLabels]);

  // Memoized Barcode & QR SVG Cache per code
  const codeSvgCache = useMemo(() => {
    const barCache = new Map<string, string>();
    const qrCache = new Map<string, string>();
    labelItems.forEach((item) => {
      const code = item.code || '893000000000';
      if (!barCache.has(code)) {
        barCache.set(
          code,
          generateBarcodeSVG(code, {
            height: currentConfig.defaultBarHeight,
            showText: false,
            barWidth: 1.5,
          })
        );
      }
      if (!qrCache.has(code)) {
        qrCache.set(code, getQRCodeUrl(code, 120));
      }
    });
    return { barCache, qrCache };
  }, [labelItems, currentConfig.defaultBarHeight]);

  // Browser Print Trigger
  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const labelWidth = currentConfig.widthMm;
    const labelHeight = currentConfig.heightMm;

    // Generate HTML for all labels directly
    let cardsHtml = '';
    expandedLabels.forEach((item) => {
      const codeVal = item.code || '893000000000';
      const barcodeSvg = codeSvgCache.barCache.get(codeVal) || '';
      const qrUrl = codeSvgCache.qrCache.get(codeVal) || '';

      const brandHtml = showBrand
        ? `<div class="brand-header" style="font-size:${currentConfig.fontSize.brand * fontMultiplier}pt;">${brandText || 'GIA PHÚC COMPUTER'}</div>`
        : '';
      const nameHtml = showName
        ? `<div class="prod-title" style="font-size:${currentConfig.fontSize.title * fontMultiplier}pt;">${item.name}</div>`
        : '';

      let codeBoxHtml = '';
      if (codeType === 'barcode') {
        codeBoxHtml = `<div class="code-box">${barcodeSvg}</div>`;
      } else if (codeType === 'qrcode') {
        codeBoxHtml = `<div class="code-box"><img src="${qrUrl}" alt="QR" /></div>`;
      } else {
        codeBoxHtml = `<div class="dual-box"><div style="flex:1;max-width:65%;">${barcodeSvg}</div><img src="${qrUrl}" alt="QR" style="max-height:100%;" /></div>`;
      }

      const codeTextHtml = showCodeText
        ? `<span class="code-text" style="font-size:${currentConfig.fontSize.code * fontMultiplier}pt;">${codeVal}</span>`
        : '';
      const priceHtml = showPrice && item.price !== undefined
        ? `<span class="price-tag" style="font-size:${currentConfig.fontSize.price * fontMultiplier}pt;">${formatVND(item.price)}${showUnit && item.unit ? ' / ' + item.unit : ''}</span>`
        : '';
      const locHtml = showLocation && item.location
        ? `<span class="location-tag" style="font-size:${(currentConfig.fontSize.code * fontMultiplier) - 0.5}pt;">${item.location}</span>`
        : '';

      cardsHtml += `<div class="label-card">${brandHtml}${nameHtml}${codeBoxHtml}<div class="footer-row">${codeTextHtml}${priceHtml}${locHtml}</div></div>`;
    });

    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8" /><title>' + title + '</title><style>@page { size: ' + labelWidth + 'mm ' + labelHeight + 'mm; margin: 0mm; } @media print { body { margin: 0; padding: 0; background: #fff; } .no-print { display: none !important; } } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: #fff; } .print-grid { display: flex; flex-wrap: wrap; width: 100%; } .label-card { width: ' + labelWidth + 'mm; height: ' + labelHeight + 'mm; box-sizing: border-box; padding: ' + (currentConfig.paddingMm || 1.2) + 'mm; display: flex; flex-direction: column; justify-content: space-between; align-items: ' + (textAlign === 'left' ? 'flex-start' : 'center') + '; text-align: ' + textAlign + '; overflow: hidden; page-break-inside: avoid; background: #fff; border: ' + (showBorder ? '1px dashed #bbb' : 'none') + '; } .brand-header { font-size: ' + (currentConfig.fontSize.brand * fontMultiplier) + 'pt; font-weight: 800; text-transform: uppercase; line-height: 1.1; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .prod-title { font-size: ' + (currentConfig.fontSize.title * fontMultiplier) + 'pt; font-weight: 700; line-height: 1.15; width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: ' + nameClampLines + '; -webkit-box-orient: vertical; margin: 0.4mm 0; } .code-box { width: 100%; display: flex; justify-content: center; align-items: center; flex: 1; max-height: ' + (labelHeight * 0.5) + 'mm; overflow: hidden; } .code-box svg { max-width: 100%; max-height: 100%; } .code-box img { height: 100%; object-fit: contain; } .dual-box { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 2mm; flex: 1; overflow: hidden; } .dual-box svg { max-width: 65%; max-height: 100%; } .dual-box img { max-height: 100%; object-fit: contain; } .footer-row { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.3mm; font-size: ' + (currentConfig.fontSize.code * fontMultiplier) + 'pt; } .price-tag { font-weight: 800; font-size: ' + (currentConfig.fontSize.price * fontMultiplier) + 'pt; } .code-text { font-family: monospace; font-weight: bold; } .location-tag { font-size: ' + ((currentConfig.fontSize.code * fontMultiplier) - 0.5) + 'pt; font-style: italic; color: #444; }</style></head><body><div class="print-grid">' + cardsHtml + '</div><script>window.onload = function() { window.focus(); window.print(); setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 500); };</script></body></html>');
    doc.close();
  };

  // Render single label item internal template
  const renderLabelCard = (item: PrintLabelItem, idx: number, isPreviewSingle = false) => {
    const codeVal = item.code || '893000000000';
    const barcodeSvg = codeSvgCache.barCache.get(codeVal) || generateBarcodeSVG(codeVal, {
      height: currentConfig.defaultBarHeight,
      showText: false,
      barWidth: 1.5,
    });
    const qrUrl = codeSvgCache.qrCache.get(codeVal) || getQRCodeUrl(codeVal, 120);

    return (
      <div
        key={idx}
        className={'label-card bg-white text-slate-900 select-none flex flex-col justify-between ' + (
          showBorder ? 'border border-dashed border-slate-400' : 'border border-transparent'
        ) + (textAlign === 'left' ? ' items-start text-left' : ' items-center text-center')}
        style={{
          width: (currentConfig.widthMm * 3.78) + 'px',
          height: (currentConfig.heightMm * 3.78) + 'px',
          padding: (currentConfig.paddingMm ? currentConfig.paddingMm * 3.78 : 5) + 'px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header / Brand */}
        {showBrand && (
          <div
            className="brand-header font-black uppercase tracking-tighter truncate w-full border-b border-slate-200 pb-0.5 text-slate-950"
            style={{ fontSize: (currentConfig.fontSize.brand * fontMultiplier) + 'pt' }}
          >
            {brandText || 'GIA PHÚC COMPUTER'}
          </div>
        )}

        {/* Product Title */}
        {showName && (
          <div
            className={'prod-title font-bold leading-tight w-full my-0.5 text-slate-900 ' + (
              nameClampLines === 1 ? 'truncate' : 'line-clamp-2'
            )}
            style={{ fontSize: (currentConfig.fontSize.title * fontMultiplier) + 'pt' }}
          >
            {item.name}
          </div>
        )}

        {/* Code Box: Barcode 1D | QR Code 2D | Dual Both */}
        <div className="code-box w-full flex-1 flex items-center justify-center overflow-hidden my-0.5">
          {codeType === 'barcode' && (
            <div
              className="w-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
          )}
          {codeType === 'qrcode' && (
            <img src={qrUrl} alt="QR" className="h-full object-contain" />
          )}
          {codeType === 'both' && (
            <div className="dual-box w-full h-full flex items-center justify-between gap-1 overflow-hidden">
              <div className="flex-1 h-full flex items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
              <img src={qrUrl} alt="QR" className="h-full object-contain shrink-0 max-w-[30%]" />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="footer-row w-full flex items-center justify-between text-[8px] pt-0.5 border-t border-slate-100">
          {showCodeText && (
            <span
              className="code-text font-mono font-bold text-slate-700 tracking-wider"
              style={{ fontSize: (currentConfig.fontSize.code * fontMultiplier) + 'pt' }}
            >
              {codeVal}
            </span>
          )}

          {showPrice && item.price !== undefined && (
            <span
              className="price-tag font-black text-slate-950"
              style={{ fontSize: (currentConfig.fontSize.price * fontMultiplier) + 'pt' }}
            >
              {formatVND(item.price)}
              {showUnit && item.unit ? ' / ' + item.unit : ''}
            </span>
          )}

          {showLocation && item.location && (
            <span
              className="location-tag italic text-slate-600 truncate max-w-[45%]"
              style={{ fontSize: ((currentConfig.fontSize.code * fontMultiplier) - 0.5) + 'pt' }}
            >
              {item.location}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 md:p-4 animate-in fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-6xl w-full h-[95vh] max-h-[950px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-4 px-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">{title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                  {totalLabelsCount} tem
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chuyển đổi kích thước 1-click (30x20, 35x22, 50x30, 60x40, Tùy chỉnh) & Xem trước độ nét cao
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handlePrint}
              disabled={expandedLabels.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 disabled:opacity-50 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay ({totalLabelsCount} Tem)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Preset Switcher, Display Customizer, Item Queue (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800/80 p-4 md:p-5 overflow-y-auto space-y-4 bg-slate-900/60">
            {/* 1. 1-Click Preset Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. Thanh Chuyển Đổi Mẫu Nhãn Nhanh (1-Click)</span>
                </span>
                <span className="text-[10px] text-sky-400 font-mono">{currentConfig.widthMm}×{currentConfig.heightMm}mm</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* 30x20mm Mini */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('30x20')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '30x20'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">30 x 20 mm (Mini)</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 font-mono text-slate-300">3 tem</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Phụ kiện nhỏ, cáp, kệ siêu thị</p>
                </button>

                {/* 35x22mm Xprinter */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('35x22')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '35x22'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">35 x 22 mm (Xprinter)</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 font-mono text-slate-300">3 tem</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Chuẩn XP-350B, XP-420B</p>
                </button>

                {/* 50x30mm Siêu Thị */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('50x30')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '50x30'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">50 x 30 mm (Siêu Thị)</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 font-mono text-slate-300">1 tem</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Tối ưu tên dài, giá bán, song song</p>
                </button>

                {/* 60x40mm Kho Vận */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('60x40')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '60x40'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">60 x 40 mm (Thùng/Kho)</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 font-mono text-slate-300">1 tem</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Dán thùng carton, linh kiện</p>
                </button>

                {/* 75x50mm Giao Nhận */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('75x50')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '75x50'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">75 x 50 mm (Giao Nhận)</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 font-mono text-slate-300">1 tem</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Đóng gói pallet, xuất nhập kho</p>
                </button>

                {/* Custom Size */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('custom')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === 'custom'
                      ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300">⚙️ Kích Thước Tự Nhập</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">Tùy biến</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Tự nhập Rộng, Cao, Lề, Khoảng cách</p>
                </button>
              </div>

              {/* Custom Size Detailed Panel */}
              {selectedPreset === 'custom' && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2.5 animate-in fade-in">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thiết Lập Kích Thước Tùy Chỉnh (Custom Size mm):</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Rộng (Width mm):</label>
                      <input
                        type="number"
                        value={customWidthMm}
                        onChange={(e) => setCustomWidthMm(parseInt(e.target.value, 10) || 50)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Cao (Height mm):</label>
                      <input
                        type="number"
                        value={customHeightMm}
                        onChange={(e) => setCustomHeightMm(parseInt(e.target.value, 10) || 30)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Số tem / hàng:</label>
                      <select
                        value={customColumns}
                        onChange={(e) => setCustomColumns(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value={1}>1 tem</option>
                        <option value={2}>2 tem</option>
                        <option value={3}>3 tem</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Lề trong (Padding mm):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={customPaddingMm}
                        onChange={(e) => setCustomPaddingMm(parseFloat(e.target.value) || 1.5)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Khoảng cách (Gap mm):</label>
                      <input
                        type="number"
                        step="0.5"
                        value={customGapMm}
                        onChange={(e) => setCustomGapMm(parseFloat(e.target.value) || 2)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Quick Display Customizer */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Bảng Tùy Chỉnh Hiển Thị Nhanh</span>
              </label>

              {/* Code Type: 1D | 2D | Both */} 
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCodeType('barcode')}
                  className={'py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ' + (
                    codeType === 'barcode'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Barcode 1D</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCodeType('qrcode')}
                  className={'py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ' + (
                    codeType === 'qrcode'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code 2D</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCodeType('both')}
                  className={'py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ' + (
                    codeType === 'both'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cả Hai (Song song)</span>
                </button>
              </div>

              {/* Display Controls Box */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                {/* Brand text */}
                <div className="space-y-1">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tiêu đề thương hiệu (Header):</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showBrand}
                      onChange={(e) => setShowBrand(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                    />
                  </label>
                  {showBrand && (
                    <input
                      type="text"
                      value={brandText}
                      onChange={(e) => setBrandText(e.target.value)}
                      className="w-full p-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white uppercase font-bold focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                {/* Toggles Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showName}
                      onChange={(e) => setShowName(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Tên sản phẩm</span>
                  </label>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setNameClampLines(1)}
                      className={'px-1.5 py-0.5 rounded text-[10px] font-bold ' + (nameClampLines === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400')}
                    >
                      1 Dòng
                    </button>
                    <button
                      type="button"
                      onClick={() => setNameClampLines(2)}
                      className={'px-1.5 py-0.5 rounded text-[10px] font-bold ' + (nameClampLines === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400')}
                    >
                      2 Dòng
                    </button>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Giá bán lẻ & ĐVT</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCodeText}
                      onChange={(e) => setShowCodeText(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Mã SKU / Barcode</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLocation}
                      onChange={(e) => setShowLocation(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Vị trí kệ lưu kho</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Đường viền cắt tem</span>
                  </label>
                </div>

                {/* Alignment & Font Size */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Cỡ chữ (Font Size):</span>
                    <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setFontSizeScale('small')}
                        className={'flex-1 py-1 rounded text-[10px] font-bold ' + (fontSizeScale === 'small' ? 'bg-blue-600 text-white' : 'text-slate-400')}
                      >
                        Nhỏ
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSizeScale('normal')}
                        className={'flex-1 py-1 rounded text-[10px] font-bold ' + (fontSizeScale === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400')}
                      >
                        Vừa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSizeScale('large')}
                        className={'flex-1 py-1 rounded text-[10px] font-bold ' + (fontSizeScale === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400')}
                      >
                        Lớn
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Căn lề (Alignment):</span>
                    <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setTextAlign('center')}
                        className={'flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center space-x-1 ' + (textAlign === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400')}
                      >
                        <AlignCenter className="w-3 h-3" />
                        <span>Giữa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('left')}
                        className={'flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center space-x-1 ' + (textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400')}
                      >
                        <AlignLeft className="w-3 h-3" />
                        <span>Trái</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Items Print List */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Danh sách tem in ({labelItems.length})</span>
                </label>

                <div className="flex items-center space-x-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSetAllQty(1)}
                    className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    Tất cả = 1
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleSetAllQty(10)}
                    className="text-slate-400 hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Tất cả = 10
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {labelItems.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
                    Không có mục nào để in
                  </div>
                ) : (
                  labelItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-slate-200 truncate">{item.name}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono text-sky-400">{item.code}</span>
                          {item.price !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">{formatVND(item.price)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                          <span className="text-[10px] text-slate-400 px-1">SL:</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity || 1}
                            onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value, 10))}
                            className="w-9 bg-transparent text-center text-white font-bold text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Preview Canvas (7 cols) */}
          <div className="lg:col-span-7 p-4 md:p-5 bg-slate-950 flex flex-col justify-between overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-3">
              {/* Mode Switcher: Single vs Roll */}
              <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('roll')}
                  className={'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ' + (
                    viewMode === 'roll' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Dàn Trang Cuộn ({expandedLabels.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('single')}
                  className={'px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ' + (
                    viewMode === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Đơn Tem Chi Tiết</span>
                </button>
              </div>

              {/* Zoom Slider Control (60% to 250%) */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.15))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <input
                  type="range"
                  min="0.6"
                  max="2.5"
                  step="0.05"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-20 accent-blue-500 cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-sky-400 font-bold cursor-pointer"
                  title="Đưa về 100% tỉ lệ chuẩn"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas Area */}
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-900/40 rounded-xl border border-slate-800 my-3 min-h-[300px]">
              <div style={{ transform: 'scale(' + zoomLevel + ')', transformOrigin: 'top center' }} className="transition-transform duration-75">
                {viewMode === 'roll' ? (
                  <div
                    ref={printAreaRef}
                    className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg shadow-2xl"
                    style={{
                      maxWidth: ((currentConfig.widthMm + (currentConfig.gapMm || 2)) * (currentConfig.columns || 1) * 3.78 + 30) + 'px',
                    }}
                  >
                    {expandedLabels.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">Chưa có sản phẩm nào trong danh sách</div>
                    ) : (
                      <>
                        {previewLabels.map((item, idx) => renderLabelCard(item, idx))}
                        {expandedLabels.length > previewLabels.length && (
                          <div className="w-full py-2 text-center text-[10px] text-slate-500 bg-slate-50 rounded border border-dashed border-slate-300 font-mono">
                            Đang hiển thị {previewLabels.length} / {expandedLabels.length} tem mẫu xem trước (Toàn bộ {expandedLabels.length} tem sẽ được in đầy đủ khi nhấn In Tem)
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  /* Single Label Mode with Dimensions Annotations */
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-3 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      <span>↔ Chiều rộng: <strong className="text-white">{currentConfig.widthMm} mm</strong></span>
                      <span>↕ Chiều cao: <strong className="text-white">{currentConfig.heightMm} mm</strong></span>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-2xl border border-blue-500/50">
                      {labelItems[0] ? renderLabelCard(labelItems[0], 0, true) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Canvas Status */}
            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Đang xem: <strong>{currentConfig.name}</strong> ({currentConfig.widthMm}×{currentConfig.heightMm}mm)</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">Vector 300 DPI Sharp Print</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
