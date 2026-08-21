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

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items: PrintLabelItem[];
  defaultPreset?: '30x20' | '35x22' | '40x30' | '50x30' | '100x70' | 'custom';
  defaultCodeType?: 'barcode' | 'qrcode';
  storeName?: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Bản Xem Trước & In Tem Mã Vạch (Print Preview)',
  items = [],
  defaultPreset = '50x30',
  defaultCodeType = 'barcode',
  storeName = 'GIA PHÚC COMPUTER',
}) => {
  const [selectedPreset, setSelectedPreset] = useState<LabelSizePreset | 'custom'>(defaultPreset);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode'>(defaultCodeType);
  
  // Custom size configuration
  const [customWidthMm, setCustomWidthMm] = useState(40);
  const [customHeightMm, setCustomHeightMm] = useState(30);
  const [customColumns, setCustomColumns] = useState(1);
  const [customGapMm, setCustomGapMm] = useState(2);

  // Display toggles
  const [showBrand, setShowBrand] = useState(true);
  const [brandText, setBrandText] = useState(storeName);
  const [showName, setShowName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCodeText, setShowCodeText] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

  // Editable item list with quantities
  const [labelItems, setLabelItems] = useState<PrintLabelItem[]>(() => {
    return items.map((i) => ({ ...i, quantity: Math.max(1, i.quantity || 1) }));
  });

  // Sync when input items change
  React.useEffect(() => {
    setLabelItems(items.map((i) => ({ ...i, quantity: Math.max(1, i.quantity || 1) })));
  }, [items]);

  const [zoomLevel, setZoomLevel] = useState(1.1);
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
        description: 'Khổ tem người dùng tự định nghĩa',
        defaultBarHeight: Math.max(20, Math.round(customHeightMm * 0.45)),
        fontSize: {
          brand: Math.max(6, Math.round(customHeightMm * 0.22)),
          title: Math.max(7, Math.round(customHeightMm * 0.26)),
          price: Math.max(8, Math.round(customHeightMm * 0.32)),
          code: Math.max(6, Math.round(customHeightMm * 0.22)),
        },
      };
    }
    return LABEL_SIZE_PRESETS[selectedPreset] || LABEL_SIZE_PRESETS['50x30'];
  }, [selectedPreset, customWidthMm, customHeightMm, customColumns, customGapMm]);

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

  // Expand for rendering individual labels
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

  // Browser Print Trigger
  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

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

    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8" /><title>' + title + '</title><style>@page { size: auto; margin: 0mm; } @media print { body { margin: 0; padding: 0; background: #fff; } .no-print { display: none !important; } } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background: #fff; } .print-grid { display: flex; flex-wrap: wrap; width: 100%; } .label-card { width: ' + labelWidth + 'mm; height: ' + labelHeight + 'mm; box-sizing: border-box; padding: 1.2mm 1.5mm; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; overflow: hidden; page-break-inside: avoid; background: #fff; } .brand-header { font-size: ' + currentConfig.fontSize.brand + 'pt; font-weight: 800; text-transform: uppercase; line-height: 1.1; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .prod-title { font-size: ' + currentConfig.fontSize.title + 'pt; font-weight: 700; line-height: 1.15; width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin: 0.5mm 0; } .code-box { width: 100%; display: flex; justify-content: center; align-items: center; flex: 1; max-height: ' + (labelHeight * 0.52) + 'mm; overflow: hidden; } .code-box svg { max-width: 100%; max-height: 100%; } .code-box img { height: 100%; object-fit: contain; } .footer-row { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.3mm; font-size: ' + currentConfig.fontSize.code + 'pt; } .price-tag { font-weight: 800; font-size: ' + currentConfig.fontSize.price + 'pt; } .code-text { font-family: monospace; font-weight: bold; } .location-tag { font-size: ' + (currentConfig.fontSize.code - 0.5) + 'pt; font-style: italic; color: #444; }</style></head><body><div class="print-grid">' + printContent.innerHTML + '</div><script>window.onload = function() { window.focus(); window.print(); setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 500); };</script></body></html>');
    doc.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 md:p-4 animate-in fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-6xl w-full h-[94vh] max-h-[920px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-4 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">{title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                  {totalLabelsCount} tem cần in
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem trước trực quan theo kích thước thực tế và in trực tiếp từ trình duyệt
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={expandedLabels.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
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

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Size Presets & Content Controls */}
          <div className="lg:col-span-5 border-r border-slate-800/80 p-4 md:p-5 overflow-y-auto space-y-5 bg-slate-900/50">
            {/* 1. Size Switcher (30x20mm, 50x30mm, Custom...) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Chọn khổ tem in (Preset Dimensions)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* Quick 30x20mm Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('30x20')}
                  className={'p-3 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '30x20'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">30 x 20 mm</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono">3 tem/hàng</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Tem nhỏ / Phụ kiện PC</p>
                </button>

                {/* Quick 50x30mm Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('50x30')}
                  className={'p-3 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '50x30'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">50 x 30 mm</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono">1 tem/hàng</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Tem vừa / Rõ chữ & Giá</p>
                </button>

                {/* 35x22mm */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('35x22')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === '35x22'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">35 x 22 mm</span>
                    <span className="text-[10px] text-slate-500 font-mono">3 tem</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Chuẩn Xprinter, Godex</p>
                </button>

                {/* Custom Size */}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('custom')}
                  className={'p-2.5 rounded-xl border text-left transition-all cursor-pointer ' + (
                    selectedPreset === 'custom'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Kích Thước Tự Nhập</span>
                    <span className="text-[10px] text-amber-400 font-bold">Tùy biến</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Nhập Rộng x Cao (mm)</p>
                </button>
              </div>

              {/* Custom Size Inputs */}
              {selectedPreset === 'custom' && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-2.5 pt-2.5 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Rộng (mm):</label>
                    <input
                      type="number"
                      value={customWidthMm}
                      onChange={(e) => setCustomWidthMm(parseInt(e.target.value, 10) || 40)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Cao (mm):</label>
                    <input
                      type="number"
                      value={customHeightMm}
                      onChange={(e) => setCustomHeightMm(parseInt(e.target.value, 10) || 30)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">Số tem / hàng:</label>
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
                </div>
              )}
            </div>

            {/* 2. Format & Display Info */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Định dạng mã & Nội dung nhãn</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodeType('barcode')}
                  className={'py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                    codeType === 'barcode'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <Barcode className="w-4 h-4" />
                  <span>Mã Vạch Barcode (128)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCodeType('qrcode')}
                  className={'py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                    codeType === 'qrcode'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Mã Vuông QR Code</span>
                </button>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tên Thương Hiệu (Header):</span>
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
                      className="w-full p-2 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white uppercase font-bold focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showName}
                      onChange={(e) => setShowName(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Tên sản phẩm</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Giá bán niêm yết</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCodeText}
                      onChange={(e) => setShowCodeText(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Mã số Barcode / SKU</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLocation}
                      onChange={(e) => setShowLocation(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Vị trí / Đơn vị</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Items Print List */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
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

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {labelItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
                    Không có mục nào để in
                  </div>
                ) : (
                  labelItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-3">
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

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                          <span className="text-[10px] text-slate-400 px-1">SL:</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity || 1}
                            onChange={(e) => handleUpdateQuantity(idx, parseInt(e.target.value, 10))}
                            className="w-10 bg-transparent text-center text-white font-bold text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
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

          {/* Right Column: Interactive Live Preview */}
          <div className="lg:col-span-7 p-4 md:p-6 bg-slate-950 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Bản Xem Trước Thực Tế (Live Sheet Preview)</span>
                <span className="text-[11px] text-slate-500">({currentConfig.name})</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Thu phóng:</span>
                <input
                  type="range"
                  min="0.75"
                  max="1.75"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-20 accent-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-400 w-8">{Math.round(zoomLevel * 100)}%</span>
              </div>
            </div>

            {/* Preview Sheet */}
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-900/60 rounded-xl border border-slate-800 my-3">
              <div style={{ transform: 'scale(' + zoomLevel + ')', transformOrigin: 'top center' }}>
                <div
                  ref={printAreaRef}
                  className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg shadow-xl"
                  style={{
                    maxWidth: ((currentConfig.widthMm + currentConfig.gapMm) * currentConfig.columns * 3.78 + 30) + 'px',
                  }}
                >
                  {expandedLabels.map((item, idx) => {
                    const codeVal = item.code || '893000000000';
                    const barcodeSvg = generateBarcodeSVG(codeVal, {
                      height: currentConfig.defaultBarHeight,
                      showText: false,
                      barWidth: 1.5,
                    });
                    const qrUrl = getQRCodeUrl(codeVal, 120);

                    return (
                      <div
                        key={idx}
                        className="label-card border border-slate-300 rounded-xs flex flex-col justify-between items-center text-center bg-white text-slate-900 select-none"
                        style={{
                          width: (currentConfig.widthMm * 3.78) + 'px',
                          height: (currentConfig.heightMm * 3.78) + 'px',
                          padding: '4px 6px',
                        }}
                      >
                        {/* Brand */}
                        {showBrand && (
                          <div className="brand-header font-black text-[9px] uppercase tracking-tighter truncate w-full border-b border-slate-200 pb-0.5">
                            {brandText}
                          </div>
                        )}

                        {/* Name */}
                        {showName && (
                          <div className="prod-title font-bold text-[9px] line-clamp-1 leading-tight w-full my-0.5 text-slate-900">
                            {item.name}
                          </div>
                        )}

                        {/* Code box */}
                        <div className="code-box w-full flex-1 flex items-center justify-center overflow-hidden my-0.5">
                          {codeType === 'barcode' ? (
                            <div
                              className="w-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                            />
                          ) : (
                            <img src={qrUrl} alt="QR" className="h-full object-contain" />
                          )}
                        </div>

                        {/* Footer */}
                        <div className="footer-row w-full flex items-center justify-between text-[8px] pt-0.5 border-t border-slate-100">
                          {showCodeText && (
                            <span className="code-text font-mono font-bold text-slate-700 tracking-wider">
                              {codeVal}
                            </span>
                          )}
                          {showPrice && item.price !== undefined && (
                            <span className="price-tag font-black text-slate-950 text-[10px]">
                              {formatVND(item.price)}
                            </span>
                          )}
                          {showLocation && item.location && (
                            <span className="location-tag text-[7.5px] italic text-slate-600 truncate max-w-[50%]">
                              {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Đang hiển thị <strong>{expandedLabels.length}</strong> tem theo mẫu <strong>{currentConfig.name}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Vector 300 DPI Sharp Print</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
