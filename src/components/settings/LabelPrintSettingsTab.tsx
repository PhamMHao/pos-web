import React, { useState } from 'react';
import {
  Barcode,
  QrCode,
  Sliders,
  Printer,
  CheckCircle2,
  Building2,
  Package,
  Wrench,
  Layers,
  Eye,
  Sparkles,
  Info,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  Save,
  RotateCcw,
} from 'lucide-react';
import { StoreSettings, LabelTargetConfig, LabelPrintSettings } from '../../types';
import {
  LABEL_SIZE_PRESETS,
  LabelSizePreset,
  generateBarcodeSVG,
  getQRCodeUrl,
} from '../../utils/barcodeGenerator';
import { formatVND } from '../../utils/vietqr';

interface LabelPrintSettingsTabProps {
  formData: StoreSettings;
  setFormData: React.Dispatch<React.SetStateAction<StoreSettings>>;
  onSave: () => void;
  savedSuccess: boolean;
}

type TargetType = 'product' | 'asset' | 'material';

export const LabelPrintSettingsTab: React.FC<LabelPrintSettingsTabProps> = ({
  formData,
  setFormData,
  onSave,
  savedSuccess,
}) => {
  const [activeTarget, setActiveTarget] = useState<TargetType>('product');
  const [zoomLevel, setZoomLevel] = useState(1.1);

  // Default fallback configs
  const defaultConfigs: LabelPrintSettings = {
    product: {
      templateSize: '35x22',
      columns: 3,
      gapMm: 2,
      codeType: 'barcode',
      showBrand: true,
      brandText: formData.brandName || formData.storeName || 'GIA PHÚC COMPUTER',
      showName: true,
      showPrice: true,
      showCodeText: true,
      showUnit: false,
      fontSizeBrand: 7,
      fontSizeTitle: 7.5,
      fontSizePrice: 9,
      fontSizeCode: 7,
      barcodeHeight: 26,
    },
    asset: {
      templateSize: '50x30',
      columns: 1,
      gapMm: 3,
      codeType: 'qrcode',
      showBrand: true,
      brandText: formData.brandName || 'CÔNG TY TNHH GIA PHÚC',
      showName: true,
      showPrice: false,
      showCodeText: true,
      showLocation: true,
      showDate: true,
      fontSizeBrand: 8.5,
      fontSizeTitle: 9.5,
      fontSizePrice: 10,
      fontSizeCode: 8.5,
      barcodeHeight: 38,
    },
    material: {
      templateSize: '40x30',
      columns: 2,
      gapMm: 2,
      codeType: 'barcode',
      showBrand: true,
      brandText: 'GIA PHÚC KHO VẬT TƯ',
      showName: true,
      showPrice: false,
      showCodeText: true,
      showUnit: true,
      showLocation: true,
      fontSizeBrand: 7.5,
      fontSizeTitle: 8.5,
      fontSizePrice: 10,
      fontSizeCode: 7.5,
      barcodeHeight: 34,
    },
  };

  const currentLabelSettings: LabelPrintSettings = {
    product: { ...defaultConfigs.product, ...(formData.labelPrintSettings?.product || {}) },
    asset: { ...defaultConfigs.asset, ...(formData.labelPrintSettings?.asset || {}) },
    material: { ...defaultConfigs.material, ...(formData.labelPrintSettings?.material || {}) },
  };

  const config: LabelTargetConfig = currentLabelSettings[activeTarget];

  const updateConfig = (updates: Partial<LabelTargetConfig>) => {
    setFormData((prev) => ({
      ...prev,
      labelPrintSettings: {
        ...currentLabelSettings,
        [activeTarget]: {
          ...config,
          ...updates,
        },
      },
    }));
  };

  const currentPreset =
    config.templateSize !== 'custom'
      ? LABEL_SIZE_PRESETS[config.templateSize]
      : {
          id: '40x30' as LabelSizePreset,
          name: 'Khổ tự nhập (' + (config.customWidthMm || 40) + 'x' + (config.customHeightMm || 30) + 'mm)',
          widthMm: config.customWidthMm || 40,
          heightMm: config.customHeightMm || 30,
          columns: config.columns || 1,
          gapMm: config.gapMm || 2,
          description: 'Kích thước tem tùy chỉnh người dùng tự định nghĩa',
          defaultBarHeight: config.barcodeHeight || 34,
          fontSize: {
            brand: config.fontSizeBrand || 7.5,
            title: config.fontSizeTitle || 8.5,
            price: config.fontSizePrice || 10.5,
            code: config.fontSizeCode || 7.5,
          },
        };

  // Mock Samples
  const mockData = {
    product: {
      name: 'Camera Thân Trụ IP DS-2CD1T41G2-LIU 4MP Cảnh Báo',
      code: '893800412002',
      price: 1214000,
      unit: 'Cái',
      location: 'Kệ A1-02',
      date: '2026-02-15',
    },
    asset: {
      name: 'Máy Hàn Cáp Quang Cao Cấp Fujikura 90S+',
      code: 'TS-2026-0042',
      price: 45000000,
      unit: 'Bộ',
      location: 'Phòng Kỹ Thuật (Anh Minh)',
      date: '15/01/2026',
    },
    material: {
      name: 'Cáp Mạng Cat6 UTP Đồng Nguyên Chất 305m',
      code: 'VT-CAP-CAT6',
      price: 1850000,
      unit: 'Cuộn',
      location: 'Kho Vật Tư Kệ B3',
      date: '20/02/2026',
    },
  };

  const currentMock = mockData[activeTarget];

  // Test Print function
  const handleTestPrint = () => {
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

    const labelWidth = currentPreset.widthMm;
    const labelHeight = currentPreset.heightMm;
    const codeVal = currentMock.code;
    const barcodeSvg = generateBarcodeSVG(codeVal, {
      height: config.barcodeHeight || currentPreset.defaultBarHeight,
      showText: false,
      barWidth: 1.5,
    });
    const qrUrl = getQRCodeUrl(codeVal, 120);

    const brandHtml = config.showBrand ? '<div class="brand-header">' + (config.brandText || 'GIA PHÚC') + '</div>' : '';
    const nameHtml = config.showName ? '<div class="prod-title">' + currentMock.name + '</div>' : '';
    const codeBoxHtml = '<div class="code-box">' + (config.codeType === 'barcode' ? barcodeSvg : '<img src="' + qrUrl + '" style="height:100%; object-fit:contain;" />') + '</div>';
    const footerHtml = '<div class="footer-row">' +
      (config.showCodeText ? '<span class="code-text">' + codeVal + '</span>' : '') +
      (config.showPrice ? '<span class="price-tag">' + formatVND(currentMock.price) + '</span>' : '') +
      (config.showLocation ? '<span class="location-tag">' + currentMock.location + '</span>' : '') +
      '</div>';

    const labelHtml = '<div class="label-card">' + brandHtml + nameHtml + codeBoxHtml + footerHtml + '</div>';

    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8" /><title>In Thu Tem Nhan</title><style>@page { size: auto; margin: 0mm; } @media print { body { margin: 0; padding: 0; background: #fff; } } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; } .label-card { width: ' + labelWidth + 'mm; height: ' + labelHeight + 'mm; box-sizing: border-box; padding: 1.2mm 1.5mm; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; overflow: hidden; page-break-inside: avoid; } .brand-header { font-size: ' + (config.fontSizeBrand || 7) + 'pt; font-weight: 800; text-transform: uppercase; line-height: 1.1; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .prod-title { font-size: ' + (config.fontSizeTitle || 7.5) + 'pt; font-weight: 600; line-height: 1.15; width: 100%; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin: 0.5mm 0; } .code-box { width: 100%; display: flex; justify-content: center; align-items: center; flex: 1; max-height: ' + (labelHeight * 0.5) + 'mm; overflow: hidden; } .code-box svg { max-width: 100%; max-height: 100%; } .footer-row { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 0.3mm; font-size: ' + (config.fontSizeCode || 7) + 'pt; } .price-tag { font-weight: 800; font-size: ' + (config.fontSizePrice || 9) + 'pt; } .code-text { font-family: monospace; font-weight: bold; } .location-tag { font-size: ' + ((config.fontSizeCode || 7) - 1) + 'pt; font-style: italic; color: #444; }</style></head><body><div style="display:flex; flex-wrap:wrap;">' + labelHtml + labelHtml + labelHtml + '</div><script>window.onload = function() { window.focus(); window.print(); setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 500); };</script></body></html>');
    doc.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white flex items-center space-x-2">
            <Barcode className="w-5 h-5 text-amber-400" />
            <span>Cấu Hình Mẫu In Tem Nhãn & Mã Vạch / QR Code</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tùy biến kích thước khổ tem (mm), loại mã (Barcode 128 / QR Code), thông tin hiển thị và cỡ chữ cho từng nhóm hàng hóa.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTestPrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>In Thử Mẫu Này</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Cấu Hình Mẫu Tem</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Đã lưu thành công cấu hình mẫu tem nhãn vào CSDL hệ thống!</span>
        </div>
      )}

      {/* Target Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTarget('product')}
          className={'p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ' + (
            activeTarget === 'product'
              ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          )}
        >
          <div className={'p-2.5 rounded-xl ' + (activeTarget === 'product' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400')}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">1. Tem Sản Phẩm Bán Hàng</p>
            <p className="text-[11px] text-slate-400">Tên sản phẩm, Giá niêm yết, Barcode 1D</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTarget('asset')}
          className={'p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ' + (
            activeTarget === 'asset'
              ? 'bg-amber-600/20 border-amber-500 text-white shadow-md'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          )}
        >
          <div className={'p-2.5 rounded-xl ' + (activeTarget === 'asset' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400')}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">2. Tem Tài Sản & Thiết Bị</p>
            <p className="text-[11px] text-slate-400">Mã định danh TS-xxx, QR Code tra cứu</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTarget('material')}
          className={'p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ' + (
            activeTarget === 'material'
              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          )}
        >
          <div className={'p-2.5 rounded-xl ' + (activeTarget === 'material' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400')}>
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs text-white">3. Tem Vật Tư Linh Kiện / BOM</p>
            <p className="text-[11px] text-slate-400">Mã linh kiện, Kệ kho, ĐVT chuẩn</p>
          </div>
        </button>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Size Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Template Preset Selection */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>1. Kích Thước Khổ Tem Máy In Nhiệt (Label Size Preset)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(LABEL_SIZE_PRESETS) as LabelSizePreset[]).map((key) => {
                const p = LABEL_SIZE_PRESETS[key];
                const isSelected = config.templateSize === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      updateConfig({
                        templateSize: key,
                        columns: p.columns,
                        gapMm: p.gapMm,
                        fontSizeBrand: p.fontSize.brand,
                        fontSizeTitle: p.fontSize.title,
                        fontSizePrice: p.fontSize.price,
                        fontSizeCode: p.fontSize.code,
                        barcodeHeight: p.defaultBarHeight,
                      })
                    }
                    className={'p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ' + (
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={'text-xs font-bold ' + (isSelected ? 'text-blue-300' : 'text-slate-200')}>
                        {p.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                        {p.widthMm}×{p.heightMm}mm
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                  </button>
                );
              })}

              {/* Custom Size Option */}
              <button
                type="button"
                onClick={() => updateConfig({ templateSize: 'custom' })}
                className={'p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ' + (
                  config.templateSize === 'custom'
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={'text-xs font-bold ' + (config.templateSize === 'custom' ? 'text-blue-300' : 'text-slate-200')}>
                    Tự Nhập Kích Thước (Custom Size)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                    Tùy biến
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Tự nhập chiều rộng x chiều cao (mm)</p>
              </button>
            </div>

            {/* Custom Dimension Inputs if selected */}
            {config.templateSize === 'custom' && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-3 gap-3 pt-3 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Rộng (Width mm):</label>
                  <input
                    type="number"
                    value={config.customWidthMm || 40}
                    onChange={(e) => updateConfig({ customWidthMm: parseInt(e.target.value, 10) || 40 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Cao (Height mm):</label>
                  <input
                    type="number"
                    value={config.customHeightMm || 30}
                    onChange={(e) => updateConfig({ customHeightMm: parseInt(e.target.value, 10) || 30 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Số tem / hàng:</label>
                  <select
                    value={config.columns || 1}
                    onChange={(e) => updateConfig({ columns: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value={1}>1 tem / hàng</option>
                    <option value={2}>2 tem / hàng</option>
                    <option value={3}>3 tem / hàng</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. Code Format & Displayed Fields */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>2. Định Dạng Mã & Trường Thông Tin Hiển Thị</span>
            </label>

            {/* Code Format Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateConfig({ codeType: 'barcode' })}
                className={'py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                  config.codeType === 'barcode'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                )}
              >
                <Barcode className="w-4 h-4" />
                <span>Mã Vạch Barcode (Code-128 / EAN)</span>
              </button>

              <button
                type="button"
                onClick={() => updateConfig({ codeType: 'qrcode' })}
                className={'py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ' + (
                  config.codeType === 'qrcode'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                )}
              >
                <QrCode className="w-4 h-4" />
                <span>Mã Vuông QR Code</span>
              </button>
            </div>

            {/* Form Fields Toggles */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tiêu đề / Tên cửa hàng (Header):</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showBrand}
                    onChange={(e) => updateConfig({ showBrand: e.target.checked })}
                    className="rounded accent-blue-600 w-4 h-4 cursor-pointer"
                  />
                </label>
                {config.showBrand && (
                  <input
                    type="text"
                    value={config.brandText || ''}
                    onChange={(e) => updateConfig({ brandText: e.target.value })}
                    placeholder="VD: GIA PHÚC COMPUTER"
                    className="w-full p-2 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold uppercase focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Other checkables */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showName}
                    onChange={(e) => updateConfig({ showName: e.target.checked })}
                    className="rounded accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium">Tên mặt hàng / Tài sản</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPrice}
                    onChange={(e) => updateConfig({ showPrice: e.target.checked })}
                    className="rounded accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium">Giá bán niêm yết (VNĐ)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showCodeText}
                    onChange={(e) => updateConfig({ showCodeText: e.target.checked })}
                    className="rounded accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium">Mã số Barcode / SKU / Mã TS</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showLocation}
                    onChange={(e) => updateConfig({ showLocation: e.target.checked })}
                    className="rounded accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium">Vị trí kệ / Phòng ban</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Fine-tuning Font Size & Bar Height */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>3. Tinh Chỉnh Cỡ Chữ (Font Size) & Độ Cao Mã Vạch</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Cỡ chữ Tiêu đề:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="16"
                    value={config.fontSizeBrand || 7}
                    onChange={(e) => updateConfig({ fontSizeBrand: parseFloat(e.target.value) || 7 })}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-bold"
                  />
                  <span className="text-slate-500 font-mono">pt</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Cỡ chữ Tên hàng:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="18"
                    value={config.fontSizeTitle || 7.5}
                    onChange={(e) => updateConfig({ fontSizeTitle: parseFloat(e.target.value) || 7.5 })}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-bold"
                  />
                  <span className="text-slate-500 font-mono">pt</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Cỡ chữ Giá tiền:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="6"
                    max="22"
                    value={config.fontSizePrice || 9}
                    onChange={(e) => updateConfig({ fontSizePrice: parseFloat(e.target.value) || 9 })}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-bold"
                  />
                  <span className="text-slate-500 font-mono">pt</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Độ cao vạch:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="15"
                    max="80"
                    value={config.barcodeHeight || 26}
                    onChange={(e) => updateConfig({ barcodeHeight: parseInt(e.target.value, 10) || 26 })}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-white font-bold"
                  />
                  <span className="text-slate-500 font-mono">px</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Visual Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Xem Trước Trực Quan Mẫu Tem</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-400">Zoom:</span>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-16 accent-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-400 w-7">{Math.round(zoomLevel * 100)}%</span>
              </div>
            </div>

            {/* Live Render Container */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800/80 my-4 overflow-hidden min-h-[300px]">
              <div style={{ transform: 'scale(' + zoomLevel + ')', transformOrigin: 'center center' }} className="transition-transform duration-75">
                {/* Visual Label Card */}
                <div
                  className="border border-slate-300 rounded-xs flex flex-col justify-between items-center text-center bg-white text-slate-900 select-none shadow-2xl"
                  style={{
                    width: (currentPreset.widthMm * 3.78) + 'px',
                    height: (currentPreset.heightMm * 3.78) + 'px',
                    padding: '4px 6px',
                  }}
                >
                  {/* Brand Header */}
                  {config.showBrand && (
                    <div
                      className="font-black uppercase tracking-tighter truncate w-full border-b border-slate-200 pb-0.5"
                      style={{ fontSize: (config.fontSizeBrand || 7) + 'pt' }}
                    >
                      {config.brandText || 'GIA PHÚC COMPUTER'}
                    </div>
                  )}

                  {/* Name */}
                  {config.showName && (
                    <div
                      className="font-bold line-clamp-1 leading-tight w-full my-0.5 text-slate-900"
                      style={{ fontSize: (config.fontSizeTitle || 7.5) + 'pt' }}
                    >
                      {currentMock.name}
                    </div>
                  )}

                  {/* Code box */}
                  <div className="w-full flex-1 flex items-center justify-center overflow-hidden my-0.5">
                    {config.codeType === 'barcode' ? (
                      <div
                        className="w-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{
                          __html: generateBarcodeSVG(currentMock.code, {
                            height: config.barcodeHeight || currentPreset.defaultBarHeight,
                            showText: false,
                            barWidth: 1.5,
                          }),
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <img src={getQRCodeUrl(currentMock.code, 120)} alt="QR" className="h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="w-full flex items-center justify-between text-[8px] pt-0.5 border-t border-slate-100">
                    {config.showCodeText && (
                      <span
                        className="font-mono font-bold text-slate-700 tracking-wider"
                        style={{ fontSize: (config.fontSizeCode || 7) + 'pt' }}
                      >
                        {currentMock.code}
                      </span>
                    )}
                    {config.showPrice && (
                      <span
                        className="font-black text-slate-950"
                        style={{ fontSize: (config.fontSizePrice || 9) + 'pt' }}
                      >
                        {formatVND(currentMock.price)}
                      </span>
                    )}
                    {config.showLocation && (
                      <span className="text-[7.5px] italic text-slate-600 truncate max-w-[50%]">
                        {currentMock.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status / Specs */}
            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span>Khổ tem:</span>
                <strong className="text-white font-mono">{currentPreset.widthMm} x {currentPreset.heightMm} mm</strong>
              </div>
              <div className="flex justify-between">
                <span>Bố cục:</span>
                <span className="text-slate-300 font-semibold">{currentPreset.columns} tem / hàng</span>
              </div>
              <div className="flex justify-between">
                <span>Định dạng mã:</span>
                <span className="text-sky-400 font-bold uppercase">{config.codeType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
