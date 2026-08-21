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
} from 'lucide-react';
import { EnterpriseAsset, StoreSettings } from '../../types';
import {
  LABEL_SIZE_PRESETS,
  LabelSizePreset,
  generateBarcodeSVG,
  getQRCodeUrl,
} from '../../utils/barcodeGenerator';
import { formatVND } from '../../utils/vietqr';

interface AssetLabelItem {
  asset: EnterpriseAsset;
  quantity: number;
}

interface AssetBarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: EnterpriseAsset[];
  initialSelectedAsset?: EnterpriseAsset | null;
  settings?: StoreSettings;
}

export const AssetBarcodeLabelModal: React.FC<AssetBarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  assets = [],
  initialSelectedAsset,
  settings,
}) => {
  const assetCfg = settings?.labelPrintSettings?.asset;
  const initialPreset: LabelSizePreset =
    assetCfg?.templateSize && assetCfg.templateSize !== 'custom'
      ? (assetCfg.templateSize as LabelSizePreset)
      : '50x30';

  const [selectedPreset, setSelectedPreset] = useState<LabelSizePreset>(initialPreset);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode'>(assetCfg?.codeType || 'qrcode');

  const [showBrand, setShowBrand] = useState(assetCfg ? assetCfg.showBrand : true);
  const [showName, setShowName] = useState(assetCfg ? assetCfg.showName : true);
  const [showCodeText, setShowCodeText] = useState(assetCfg ? assetCfg.showCodeText : true);
  const [showLocation, setShowLocation] = useState(assetCfg ? assetCfg.showLocation : true);
  const [showPrice, setShowPrice] = useState(assetCfg ? assetCfg.showPrice : false);
  const [brandText, setBrandText] = useState(
    assetCfg?.brandText || settings?.companyLegalName || settings?.brandName || 'CÔNG TY TNHH GIA PHÚC'
  );

  const [labelItems, setLabelItems] = useState<AssetLabelItem[]>(() => {
    if (initialSelectedAsset) {
      return [{ asset: initialSelectedAsset, quantity: 1 }];
    }
    return assets.slice(0, 3).map((a) => ({ asset: a, quantity: 1 }));
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.1);
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (initialSelectedAsset) {
      setLabelItems([{ asset: initialSelectedAsset, quantity: 1 }]);
    }
  }, [initialSelectedAsset]);

  if (!isOpen) return null;

  const currentConfig = LABEL_SIZE_PRESETS[selectedPreset];

  const searchResults = assets.filter((a) => {
    if (!searchTerm.trim()) return false;
    const q = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.assignedTo.toLowerCase().includes(q)
    );
  });

  const handleAddAsset = (ast: EnterpriseAsset) => {
    setLabelItems((prev) => {
      const exist = prev.find((item) => item.asset.id === ast.id);
      if (exist) {
        return prev.map((item) =>
          item.asset.id === ast.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { asset: ast, quantity: 1 }];
    });
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveItem = (id: string) => {
    setLabelItems((prev) => prev.filter((item) => item.asset.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    const safeQty = Math.max(1, Math.min(999, qty || 1));
    setLabelItems((prev) =>
      prev.map((item) => (item.asset.id === id ? { ...item, quantity: safeQty } : item))
    );
  };

  const totalLabelsCount = labelItems.reduce((sum, i) => sum + i.quantity, 0);

  const expandedLabels = useMemo(() => {
    const list: EnterpriseAsset[] = [];
    labelItems.forEach((i) => {
      for (let count = 0; count < i.quantity; count++) {
        list.push(i.asset);
      }
    });
    return list;
  }, [labelItems]);

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
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8" /><title>In Tem Tai San</title><style>@page { size: auto; margin: 0mm; } @media print { body { margin: 0; padding: 0; background: #fff; } .no-print { display: none !important; } } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; } .print-grid { display: flex; flex-wrap: wrap; width: 100%; } .label-card { width: ' + labelWidth + 'mm; height: ' + labelHeight + 'mm; box-sizing: border-box; padding: 1.2mm 1.5mm; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; overflow: hidden; page-break-inside: avoid; background: #fff; } .brand-header { font-size: ' + currentConfig.fontSize.brand + 'pt; font-weight: 800; text-transform: uppercase; line-height: 1.1; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .prod-title { font-size: ' + currentConfig.fontSize.title + 'pt; font-weight: 700; line-height: 1.15; width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin: 0.5mm 0; } .code-box { width: 100%; display: flex; justify-content: center; align-items: center; flex: 1; max-height: ' + (labelHeight * 0.55) + 'mm; overflow: hidden; } .code-box svg { max-width: 100%; max-height: 100%; } .code-box img { height: 100%; object-fit: contain; } .footer-row { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.3mm; font-size: ' + currentConfig.fontSize.code + 'pt; } .code-text { font-family: monospace; font-weight: bold; } .location-tag { font-size: ' + (currentConfig.fontSize.code - 0.5) + 'pt; font-style: italic; color: #333; }</style></head><body><div class="print-grid">' + printContent.innerHTML + '</div><script>window.onload = function() { window.focus(); window.print(); setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 500); };</script></body></html>');
    doc.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 md:p-4 animate-in fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-6xl w-full h-[94vh] max-h-[920px] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">In Tem Nhãn Tài Sản & Thiết Bị (Asset QR Tag)</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  {totalLabelsCount} tem
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dán tem QR định danh cho máy chủ, máy tính, thiết bị mạng, xe cộ, bàn ghế
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={expandedLabels.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
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
          {/* Left: Controls & Asset Selection */}
          <div className="lg:col-span-5 border-r border-slate-800/80 p-4 md:p-5 overflow-y-auto space-y-5 bg-slate-900/50">
            {/* Preset */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Kích thước tem tài sản</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(LABEL_SIZE_PRESETS) as LabelSizePreset[]).map((key) => {
                  const p = LABEL_SIZE_PRESETS[key];
                  const isSelected = selectedPreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPreset(key)}
                      className={'p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ' + (
                        isSelected
                          ? 'bg-amber-600/15 border-amber-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      )}
                    >
                      <div>
                        <p className={'text-xs font-bold ' + (isSelected ? 'text-amber-300' : 'text-slate-200')}>{p.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 shrink-0 ml-2">
                        {p.widthMm}×{p.heightMm}mm
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code type & options */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>2. Định dạng & Thông tin hiển thị</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodeType('qrcode')}
                  className={'py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                    codeType === 'qrcode'
                      ? 'bg-amber-600 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Mã QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCodeType('barcode')}
                  className={'py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                    codeType === 'barcode'
                      ? 'bg-amber-600 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  )}
                >
                  <Barcode className="w-4 h-4" />
                  <span>Mã Vạch Barcode</span>
                </button>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tên Đơn Vị Quản Lý (Header):</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showBrand}
                      onChange={(e) => setShowBrand(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-4 h-4"
                    />
                  </label>
                  {showBrand && (
                    <input
                      type="text"
                      value={brandText}
                      onChange={(e) => setBrandText(e.target.value)}
                      className="w-full p-2 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white uppercase font-bold focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showName}
                      onChange={(e) => setShowName(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Tên thiết bị</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCodeText}
                      onChange={(e) => setShowCodeText(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Mã số TS-xxx</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLocation}
                      onChange={(e) => setShowLocation(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Người/Phòng phụ trách</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded accent-amber-500 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="text-slate-300 font-medium">Nguyên giá tài sản</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Asset Selection List */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <span>3. Danh sách tài sản in ({labelItems.length})</span>
                </label>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="+ Tìm tài sản để thêm vào danh sách in..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-800/60">
                    {searchResults.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleAddAsset(a)}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-left hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-white truncate">{a.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Mã: <span className="font-mono text-amber-400">{a.code}</span> | Phụ trách: {a.assignedTo}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {labelItems.map((item) => (
                  <div
                    key={item.asset.id}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-bold text-slate-200 truncate">{item.asset.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono text-amber-400 mt-0.5">
                        {item.asset.code} • {item.asset.assignedTo}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                        <span className="text-[10px] text-slate-400 px-1">SL:</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.asset.id, parseInt(e.target.value, 10))}
                          className="w-10 bg-transparent text-center text-white font-bold text-xs focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.asset.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-7 p-4 md:p-6 bg-slate-950 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Xem trước bản in thực tế</span>
                <span className="text-[11px] text-slate-500">({currentConfig.name})</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Thu phóng:</span>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-20 accent-amber-500 cursor-pointer"
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
                  style={{ maxWidth: ((currentConfig.widthMm + currentConfig.gapMm) * currentConfig.columns * 3.78 + 30) + 'px' }}
                >
                  {expandedLabels.map((ast, idx) => {
                    const codeVal = ast.code;
                    const qrUrl = getQRCodeUrl(codeVal, 120);
                    const barcodeSvg = generateBarcodeSVG(codeVal, {
                      height: currentConfig.defaultBarHeight,
                      showText: false,
                      barWidth: 1.5,
                    });

                    return (
                      <div
                        key={ast.id + '-' + idx}
                        className="label-card border border-slate-300 rounded-xs flex flex-col justify-between items-center text-center bg-white text-slate-900 select-none"
                        style={{
                          width: (currentConfig.widthMm * 3.78) + 'px',
                          height: (currentConfig.heightMm * 3.78) + 'px',
                          padding: '4px 6px',
                        }}
                      >
                        {showBrand && (
                          <div className="brand-header font-black text-[9px] uppercase tracking-tighter truncate w-full border-b border-slate-200 pb-0.5">
                            {brandText}
                          </div>
                        )}

                        {showName && (
                          <div className="prod-title font-bold text-[9px] line-clamp-1 leading-tight w-full my-0.5 text-slate-900">
                            {ast.name}
                          </div>
                        )}

                        <div className="code-box w-full flex-1 flex items-center justify-center overflow-hidden my-0.5">
                          {codeType === 'qrcode' ? (
                            <img src={qrUrl} alt="QR" className="h-full object-contain" />
                          ) : (
                            <div className="w-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
                          )}
                        </div>

                        <div className="footer-row w-full flex items-center justify-between text-[8px] pt-0.5 border-t border-slate-100">
                          {showCodeText && (
                            <span className="code-text font-mono font-bold text-slate-700 tracking-wider">
                              {codeVal}
                            </span>
                          )}
                          {showLocation && (
                            <span className="location-tag text-[7.5px] italic text-slate-600 truncate max-w-[50%]">
                              {ast.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 shrink-0 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Đang in <strong>{expandedLabels.length}</strong> tem mã tài sản theo khổ <strong>{currentConfig.name}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Vector 300 DPI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
