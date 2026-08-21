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
  Eye,
  Sliders,
  Layers,
  RotateCcw,
  Sparkles,
  Info,
  Building2,
  Tag,
  DollarSign,
  Maximize2,
} from 'lucide-react';
import { Product, StoreSettings } from '../../types';
import {
  LABEL_SIZE_PRESETS,
  LabelSizePreset,
  generateBarcodeSVG,
  getQRCodeUrl,
} from '../../utils/barcodeGenerator';
import { formatVND } from '../../utils/vietqr';

interface ProductLabelItem {
  product: Product;
  quantity: number;
}

interface ProductBarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialSelectedProduct?: Product | null;
  settings?: StoreSettings;
}

export const ProductBarcodeLabelModal: React.FC<ProductBarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  products = [],
  initialSelectedProduct,
  settings,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<LabelSizePreset>('35x22');
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode'>('barcode');
  
  // Custom display toggles
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showCodeText, setShowCodeText] = useState(true);
  const [storeNameText, setStoreNameText] = useState(
    settings?.brandName || settings?.storeName || 'GIA PHUC COMPUTER'
  );

  // Selected products for label printing
  const [labelItems, setLabelItems] = useState<ProductLabelItem[]>(() => {
    if (initialSelectedProduct) {
      return [{ product: initialSelectedProduct, quantity: Math.max(1, initialSelectedProduct.stock || 1) }];
    }
    return products.slice(0, 3).map((p) => ({
      product: p,
      quantity: Math.max(1, p.stock || 1),
    }));
  });

  // Search product dropdown inside modal
  const [productSearch, setProductSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  // When initialSelectedProduct changes
  React.useEffect(() => {
    if (initialSelectedProduct) {
      setLabelItems([
        {
          product: initialSelectedProduct,
          quantity: Math.max(1, initialSelectedProduct.stock || 1),
        },
      ]);
    }
  }, [initialSelectedProduct]);

  if (!isOpen) return null;

  const currentConfig = LABEL_SIZE_PRESETS[selectedPreset];

  // Filtered search results for adding more products
  const searchResults = products.filter((p) => {
    if (!productSearch.trim()) return false;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  const handleAddProduct = (prod: Product) => {
    setLabelItems((prev) => {
      const exist = prev.find((item) => item.product.id === prod.id);
      if (exist) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: prod, quantity: Math.max(1, prod.stock || 1) }];
    });
    setProductSearch('');
    setShowSearchDropdown(false);
  };

  const handleRemoveItem = (productId: string) => {
    setLabelItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    const safeQty = Math.max(1, Math.min(9999, qty || 1));
    setLabelItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: safeQty } : item))
    );
  };

  const handleSetAllQty = (qtyType: 'stock' | 'one' | 'custom', customVal = 10) => {
    setLabelItems((prev) =>
      prev.map((item) => ({
        ...item,
        quantity:
          qtyType === 'stock'
            ? Math.max(1, item.product.stock || 1)
            : qtyType === 'one'
            ? 1
            : customVal,
      }))
    );
  };

  const totalLabelsCount = labelItems.reduce((acc, item) => acc + item.quantity, 0);

  // Flatten array of individual labels for printing
  const expandedLabels = useMemo(() => {
    const list: Product[] = [];
    labelItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        list.push(item.product);
      }
    });
    return list;
  }, [labelItems]);

  // Execute Browser Print
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

    // Build print HTML document
    const labelWidth = currentConfig.widthMm;
    const labelHeight = currentConfig.heightMm;

    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8" /><title>In Tem Ma Vach - GP ERP</title><style>@page { size: auto; margin: 0mm; } @media print { body, html { margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; background: #ffffff; color: #000000; } .print-grid { display: flex; flex-wrap: wrap; padding: 0; margin: 0; width: 100%; } .label-card { width: ' + labelWidth + 'mm; height: ' + labelHeight + 'mm; box-sizing: border-box; padding: 1.2mm 1.5mm; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; page-break-inside: avoid; break-inside: avoid; overflow: hidden; background: #ffffff; } .brand-header { font-size: ' + currentConfig.fontSize.brand + 'pt; font-weight: 800; text-transform: uppercase; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; letter-spacing: -0.2px; } .prod-title { font-size: ' + currentConfig.fontSize.title + 'pt; font-weight: 600; line-height: 1.15; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; width: 100%; margin: 0.5mm 0; } .barcode-box { width: 100%; display: flex; justify-content: center; align-items: center; flex: 1; max-height: ' + (labelHeight * 0.45) + 'mm; overflow: hidden; } .barcode-box svg { max-width: 100%; max-height: 100%; } .qr-box { display: flex; justify-content: center; align-items: center; height: ' + (labelHeight * 0.55) + 'mm; } .qr-box img { height: 100%; width: auto; object-fit: contain; } .footer-row { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.3mm; } .price-tag { font-size: ' + currentConfig.fontSize.price + 'pt; font-weight: 800; letter-spacing: -0.3px; } .code-text { font-size: ' + currentConfig.fontSize.code + 'pt; font-family: monospace; font-weight: bold; }</style></head><body><div class="print-grid">' + printContent.innerHTML + '</div><script>window.onload = function() { window.focus(); window.print(); setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 500); };</script></body></html>');
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
                <h3 className="text-base font-extrabold text-white">In Tem Nhãn Mã Vạch & QR Code</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                  {totalLabelsCount} tem cần in
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết kế mẫu in tem cuộn nhiệt cho máy Xprinter, Bixolon, Godex, HPRT
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

        {/* Modal Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Settings & Product Selection (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-800/80 p-4 md:p-5 overflow-y-auto space-y-5 bg-slate-900/50">
            {/* 1. Template Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>1. Chọn kích thước tem nhãn máy in</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(LABEL_SIZE_PRESETS) as LabelSizePreset[]).map((key) => {
                  const cfg = LABEL_SIZE_PRESETS[key];
                  const isSelected = selectedPreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPreset(key)}
                      className={'p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ' + (
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={'text-xs font-bold ' + (isSelected ? 'text-blue-300' : 'text-slate-200')}>
                            {cfg.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{cfg.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300 shrink-0 ml-2">
                        {cfg.widthMm}×{cfg.heightMm}mm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Format & Display Options */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Định dạng mã & Thông tin hiển thị</span>
              </label>

              {/* Code Format Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodeType('barcode')}
                  className={'py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                    codeType === 'barcode'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
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
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Mã Vuông QR Code</span>
                </button>
              </div>

              {/* Toggles */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-2.5 text-xs">
                {/* Store Name Toggle & Input */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tên cửa hàng / Thương hiệu:</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showStoreName}
                      onChange={(e) => setShowStoreName(e.target.checked)}
                      className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                    />
                  </label>
                  {showStoreName && (
                    <input
                      type="text"
                      value={storeNameText}
                      onChange={(e) => setStoreNameText(e.target.value)}
                      placeholder="VD: GIA PHÚC COMPUTER"
                      className="w-full p-2 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-bold uppercase"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showProductName}
                      onChange={(e) => setShowProductName(e.target.checked)}
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
                </div>
              </div>
            </div>

            {/* 3. Product Selection & Quantities */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. Danh sách sản phẩm in ({labelItems.length})</span>
                </label>

                <div className="flex items-center space-x-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSetAllQty('stock')}
                    className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    Theo tồn kho
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleSetAllQty('one')}
                    className="text-slate-400 hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Tất cả = 1
                  </button>
                </div>
              </div>

              {/* Add Product Search Input */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                    placeholder="+ Tìm kiếm sản phẩm để thêm vào tem in..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Dropdown search results */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-800/60">
                    {searchResults.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleAddProduct(prod)}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-left hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-white truncate">{prod.name}</p>
                          <p className="text-[11px] text-slate-400">
                            SKU: <span className="font-mono text-sky-400">{prod.sku}</span> | Tồn: {prod.stock}
                          </p>
                        </div>
                        <span className="font-bold text-emerald-400 shrink-0">{formatVND(prod.sellingPrice)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected List Table */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {labelItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl">
                    Chưa chọn sản phẩm nào để in tem
                  </div>
                ) : (
                  labelItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-bold text-slate-200 truncate">{item.product.name}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono text-sky-400">{item.product.barcode || item.product.sku}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{formatVND(item.product.sellingPrice)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
                          <span className="text-[10px] text-slate-400 px-1 font-medium">SL:</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(item.product.id, parseInt(e.target.value, 10))
                            }
                            className="w-12 bg-transparent text-center text-white font-bold text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
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

          {/* Right Column: Live Sheet Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 md:p-6 bg-slate-950 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Xem trước bản in thực tế (Trực quan)</span>
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

            {/* Preview Sheet Container */}
            <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-900/60 rounded-xl border border-slate-800/60 my-3">
              <div
                style={{ transform: 'scale(' + zoomLevel + ')', transformOrigin: 'top center' }}
                className="transition-transform duration-100"
              >
                {/* Visual Label Cards Container */}
                <div
                  ref={printAreaRef}
                  className="flex flex-wrap gap-2 justify-center bg-white p-3 rounded-lg shadow-xl"
                  style={{
                    maxWidth: ((currentConfig.widthMm + currentConfig.gapMm) * currentConfig.columns * 3.78 + 30) + 'px',
                  }}
                >
                  {expandedLabels.map((prod, idx) => {
                    const codeVal = prod.barcode || prod.sku || '893000000000';
                    const barcodeSvg = generateBarcodeSVG(codeVal, {
                      height: currentConfig.defaultBarHeight,
                      showText: false,
                      barWidth: 1.5,
                    });
                    const qrUrl = getQRCodeUrl(codeVal, 120);

                    return (
                      <div
                        key={prod.id + '-' + idx}
                        className="label-card border border-slate-300 rounded-xs flex flex-col justify-between items-center text-center bg-white text-slate-900 select-none"
                        style={{
                          width: (currentConfig.widthMm * 3.78) + 'px',
                          height: (currentConfig.heightMm * 3.78) + 'px',
                          padding: '4px 6px',
                        }}
                      >
                        {/* 1. Brand Name */}
                        {showStoreName && (
                          <div className="brand-header font-black text-[9px] uppercase tracking-tighter truncate w-full border-b border-slate-200 pb-0.5">
                            {storeNameText}
                          </div>
                        )}

                        {/* 2. Product Name */}
                        {showProductName && (
                          <div className="prod-title font-bold text-[9px] line-clamp-1 leading-tight w-full my-0.5 text-slate-900">
                            {prod.name}
                          </div>
                        )}

                        {/* 3. Barcode or QR Code Box */}
                        <div className="barcode-box w-full flex-1 flex items-center justify-center overflow-hidden my-0.5">
                          {codeType === 'barcode' ? (
                            <div
                              className="w-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                            />
                          ) : (
                            <div className="qr-box h-full flex items-center justify-center">
                              <img src={qrUrl} alt="QR" className="h-full object-contain" />
                            </div>
                          )}
                        </div>

                        {/* 4. Footer: Code Number & Price */}
                        <div className="footer-row w-full flex items-center justify-between text-[8px] pt-0.5 border-t border-slate-100">
                          {showCodeText && (
                            <span className="code-text font-mono font-bold text-slate-700 tracking-wider">
                              {codeVal}
                            </span>
                          )}
                          {showPrice && (
                            <span className="price-tag font-black text-slate-950 text-[10px]">
                              {formatVND(prod.sellingPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Status / Hints */}
            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Đang hiển thị <strong>{expandedLabels.length}</strong> tem theo khổ{' '}
                  <strong className="text-white">{currentConfig.name}</strong>. Khi in, chọn máy in mã vạch và tắt lề (Margins: None).
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                Vector 300 DPI Crisp Output
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
