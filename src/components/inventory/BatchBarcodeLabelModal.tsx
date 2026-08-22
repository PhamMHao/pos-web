import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Barcode,
  QrCode,
  Check,
  Search,
  Plus,
  Trash2,
  Settings2,
  Sliders,
  Boxes,
  Building2,
  Tag,
  DollarSign,
  Maximize2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StoreSettings, Product } from '../../types';
import {
  LABEL_SIZE_PRESETS,
  LabelSizePreset,
  generateBarcodeSVG,
  getQRCodeUrl,
} from '../../utils/barcodeGenerator';
import { formatVND } from '../../utils/vietqr';

export interface BatchPrintItem {
  productId?: string;
  sku: string;
  barcode?: string;
  productName: string;
  unit: string;
  sellingPrice: number;
  quantity: number;
}

interface BatchBarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sourceDocCode?: string;
  items: BatchPrintItem[];
  settings?: StoreSettings;
}

export const BatchBarcodeLabelModal: React.FC<BatchBarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  title = 'In Tem Mã Vạch Hàng Loạt Theo Phiếu Nhập Kho',
  sourceDocCode,
  items = [],
  settings,
}) => {
  const prodCfg = settings?.labelPrintSettings?.product;
  const initialPreset: LabelSizePreset =
    prodCfg?.templateSize && prodCfg.templateSize !== 'custom'
      ? (prodCfg.templateSize as LabelSizePreset)
      : '35x22';

  const [selectedPreset, setSelectedPreset] = useState<LabelSizePreset>(initialPreset);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode' | 'both'>('barcode');

  // Display toggles
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCodeText, setShowCodeText] = useState(true);
  const [storeNameText, setStoreNameText] = useState(
    settings?.storeName || 'GIA PHUC COMPUTER'
  );

  // Editable print list
  const [printItems, setPrintItems] = useState<BatchPrintItem[]>(() => {
    return items.map((it) => ({
      ...it,
      quantity: Math.max(1, it.quantity || 1),
    }));
  });

  // Keep printItems updated if props change
  React.useEffect(() => {
    if (items.length > 0) {
      setPrintItems(
        items.map((it) => ({
          ...it,
          quantity: Math.max(1, it.quantity || 1),
        }))
      );
    }
  }, [items]);

  const presetConfig = LABEL_SIZE_PRESETS[selectedPreset];

  const handleQuantityChange = (idx: number, qty: number) => {
    setPrintItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: Math.max(0, qty) } : item))
    );
  };

  const handleRemoveItem = (idx: number) => {
    setPrintItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Flatten items by quantity to render all label tiles
  const flattenedLabels = useMemo(() => {
    const list: BatchPrintItem[] = [];
    printItems.forEach((item) => {
      const count = Number(item.quantity) || 0;
      for (let i = 0; i < count; i++) {
        list.push(item);
      }
    });
    return list;
  }, [printItems]);

  const totalLabelsCount = flattenedLabels.length;

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {title}
              </h2>
              <p className="text-xs text-slate-400">
                {sourceDocCode ? `Chứng từ: ${sourceDocCode} • ` : ''}
                Tự động sinh {totalLabelsCount} tem dán theo số lượng hàng nhập
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={totalLabelsCount === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In {totalLabelsCount} Tem (Ctrl + P)
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Panel: Configuration & Items List (no-print) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-950/60 p-5 overflow-y-auto space-y-5 no-print">
            {/* Template Size Preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                1. Khổ Giấy In Tem Mã Vạch
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    '35x22',
                    '50x30',
                    '100x75',
                    'a4_tomy145',
                    'a4_tomy146',
                  ] as LabelSizePreset[]
                ).map((key) => {
                  const p = LABEL_SIZE_PRESETS[key];
                  const isSelected = selectedPreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPreset(key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/40 text-white ring-1 ring-cyan-500/50'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{p.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-amber-400" />
                2. Tùy Chọn Hiển Thị Trên Tem
              </label>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tên cửa hàng / Brand</label>
                  <input
                    type="text"
                    value={storeNameText}
                    onChange={(e) => setStoreNameText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Tên sản phẩm</span>
                    <input
                      type="checkbox"
                      checked={showProductName}
                      onChange={(e) => setShowProductName(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Giá bán lẻ niêm yết</span>
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Mã SKU / Barcode text</span>
                    <input
                      type="checkbox"
                      checked={showCodeText}
                      onChange={(e) => setShowCodeText(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Print Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  3. Số Lượng Tem Từng Món
                </label>
                <span className="text-xs text-cyan-400 font-bold font-mono">
                  {totalLabelsCount} tem
                </span>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 divide-y divide-slate-800 max-h-56 overflow-y-auto">
                {printItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        SKU: {item.sku} • Giá: {formatVND(item.sellingPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-white text-xs focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Live Printable Paper Sheet */}
          <div className="flex-1 bg-slate-950 p-6 overflow-y-auto flex flex-col items-center print-container">
            <div className="text-xs text-slate-400 mb-3 no-print flex items-center gap-2">
              <span>Xem trước bản in: {presetConfig.name} ({presetConfig.widthMm}mm x {presetConfig.heightMm}mm)</span>
              <span>• Khổ giấy: {presetConfig.columns} tem / hàng</span>
            </div>

            {/* The Print Sheet */}
            <div
              id="batch-barcode-print-sheet"
              className="bg-white text-slate-900 p-4 rounded-xl shadow-2xl transition-all"
              style={{
                width: '100%',
                maxWidth: selectedPreset.startsWith('a4') ? '210mm' : '105mm',
                minHeight: '140mm',
              }}
            >
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${presetConfig.columns}, minmax(0, 1fr))`,
                }}
              >
                {flattenedLabels.map((item, idx) => {
                  const codeToRender = item.barcode || item.sku;
                  const svgString = generateBarcodeSVG(codeToRender, {
                    height: 28,
                    showText: false,
                  });

                  return (
                    <div
                      key={idx}
                      className="border border-dashed border-slate-300 rounded p-1.5 flex flex-col items-center justify-between text-center overflow-hidden bg-white label-tile"
                      style={{
                        minHeight: `${Math.max(22, presetConfig.heightMm * 3.2)}px`,
                        pageBreakInside: 'avoid',
                      }}
                    >
                      {/* Brand name */}
                      {showStoreName && (
                        <div className="text-[9px] font-black tracking-wider uppercase truncate w-full text-slate-800 border-b border-slate-200 pb-0.5 mb-0.5">
                          {storeNameText}
                        </div>
                      )}

                      {/* Product name */}
                      {showProductName && (
                        <div className="text-[9.5px] font-bold leading-tight line-clamp-2 w-full text-slate-900 px-0.5">
                          {item.productName}
                        </div>
                      )}

                      {/* Barcode Vector */}
                      <div
                        className="my-0.5 w-full flex justify-center barcode-svg-container"
                        dangerouslySetInnerHTML={{ __html: svgString }}
                      />

                      {/* Barcode text */}
                      {showCodeText && (
                        <div className="text-[8.5px] font-mono tracking-widest text-slate-700 font-semibold -mt-0.5">
                          {codeToRender}
                        </div>
                      )}

                      {/* Selling Price */}
                      {showPrice && item.sellingPrice > 0 && (
                        <div className="text-[10px] font-black text-slate-950 font-mono mt-0.5 pt-0.5 border-t border-slate-200 w-full">
                          {formatVND(item.sellingPrice)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Global Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            .print-container,
            #batch-barcode-print-sheet,
            #batch-barcode-print-sheet * {
              visibility: visible !important;
            }
            #batch-barcode-print-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .label-tile {
              border: 1px dashed #e2e8f0 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
