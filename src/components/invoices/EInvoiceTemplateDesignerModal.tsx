import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  ShieldCheck,
  QrCode,
  Globe2,
  Stamp,
  Layers,
  FileText,
} from 'lucide-react';
import { StoreSettings, EInvoiceDesignConfig, EInvoiceTemplateStyle } from '../../types';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { generateVietQRUrl, formatVND } from '../../utils/vietqr';

interface EInvoiceTemplateDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const EInvoiceTemplateDesignerModal: React.FC<EInvoiceTemplateDesignerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const initialConfig: EInvoiceDesignConfig = settings.eInvoiceDesignConfig || {
    templateStyle: 'standard_classic',
    primaryColor: '#1e3a8a',
    tableBorderColor: '#94a3b8',
    showBilingual: true,
    showWatermark: true,
    watermarkText: 'ĐÃ KÝ ĐIỆN TỬ / CQT CẤP MÃ',
    showVietQR: true,
    showElectronicSeal: true,
    invoiceTemplate: settings.eInvoiceTemplate || '1/001',
    invoiceSymbol: settings.eInvoiceSymbol || '1C26TGP',
    bankAccount: settings.bankAccount || '0985862609',
    bankName: settings.bankName || 'MBBANK',
    bankAccountHolder: settings.bankAccountName || 'PHAM NGOC THOM',
  };

  const [config, setConfig] = useState<EInvoiceDesignConfig>(initialConfig);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const COLOR_PRESETS = [
    { name: 'Xanh Navy (Chuẩn)', value: '#1e3a8a' },
    { name: 'Xanh Dương Hiện Đại', value: '#2563eb' },
    { name: 'Xanh Cẩm Thạch (Teal)', value: '#0f766e' },
    { name: 'Đỏ Rượu Sang Trọng', value: '#7c2d12' },
    { name: 'Tím Hoàng Gia', value: '#4c1d95' },
    { name: 'Đen Than Doanh Nghiệp', value: '#0f172a' },
  ];

  const TEMPLATE_STYLES: {
    id: EInvoiceTemplateStyle;
    title: string;
    desc: string;
    badge: string;
  }[] = [
    {
      id: 'standard_classic',
      title: 'Tiêu Chuẩn Doanh Nghiệp',
      desc: 'Mẫu truyền thống trang nghiêm, quốc hiệu chính giữa, viền kẻ đôi, chuẩn mực thuế.',
      badge: 'Phổ Biến Nhất',
    },
    {
      id: 'modern_minimalist',
      title: 'Hiện Đại Tinh Gọn',
      desc: 'Bố cục mở, tiêu đề phong cách hiện đại, thanh thoát cho doanh nghiệp công nghệ & số.',
      badge: 'Công Nghệ / Retail',
    },
    {
      id: 'premium_executive',
      title: 'Thanh Lịch Cao Cấp',
      desc: 'Đường nét thanh mảnh, phối màu thương hiệu tinh tế, phù hợp hợp đồng & dự án B2B lớn.',
      badge: 'Dự Án / B2B',
    },
  ];

  const handleSave = () => {
    const updatedSettings: StoreSettings = {
      ...settings,
      eInvoiceTemplate: config.invoiceTemplate,
      eInvoiceSymbol: config.invoiceSymbol,
      eInvoiceDesignConfig: config,
    };
    onSaveSettings(updatedSettings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setConfig({
      templateStyle: 'standard_classic',
      primaryColor: '#1e3a8a',
      tableBorderColor: '#94a3b8',
      showBilingual: true,
      showWatermark: true,
      watermarkText: 'ĐÃ KÝ ĐIỆN TỬ / CQT CẤP MÃ',
      showVietQR: true,
      showElectronicSeal: true,
      invoiceTemplate: '1/001',
      invoiceSymbol: '1C26TGP',
      bankAccount: '0985862609',
      bankName: 'MBBANK',
      bankAccountHolder: 'PHAM NGOC THOM',
    });
  };

  const vietQrDemoUrl = generateVietQRUrl({
    bankId: config.bankName || 'MBBANK',
    accountNo: config.bankAccount || '0985862609',
    accountName: config.bankAccountHolder || 'PHAM NGOC THOM',
    amount: 15600000,
    memo: `TT HOADON ${config.invoiceSymbol}-00000088`,
    template: 'compact',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 overflow-hidden select-text animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[94vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Thiết Kế Mẫu Hóa Đơn Điện Tử (Template Designer)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                  WYSIWYG TT78
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tùy biến nhận diện thương hiệu, 3 phong cách thiết kế chuẩn, watermark, con dấu & song ngữ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mặc Định</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaved ? 'Đã Lưu Thành Công!' : 'Lưu Cấu Hình Mẫu HĐĐT'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-[420px] bg-slate-900 border-r border-slate-800 p-5 overflow-y-auto space-y-6 text-xs shrink-0 select-none">
            {/* 1. Template Style */}
            <div>
              <label className="block font-bold text-slate-200 uppercase text-[11px] mb-2.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>1. Bộ Mẫu Thiết Kế Chuẩn Hóa</span>
              </label>
              <div className="space-y-2">
                {TEMPLATE_STYLES.map((st) => {
                  const isSelected = config.templateStyle === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setConfig({ ...config, templateStyle: st.id })}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{st.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Scheme */}
            <div>
              <label className="block font-bold text-slate-200 uppercase text-[11px] mb-2.5 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-blue-400" />
                <span>2. Màu Sắc Nhận Diện Thương Hiệu</span>
              </label>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setConfig({ ...config, primaryColor: p.value })}
                    className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      config.primaryColor === p.value
                        ? 'bg-slate-800 border-white text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-slate-600 shrink-0"
                      style={{ backgroundColor: p.value }}
                    />
                    <span className="truncate text-[11px]">{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block">Mã màu tùy chỉnh:</span>
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="bg-transparent font-mono text-xs text-white font-bold outline-none uppercase w-full"
                  />
                </div>
              </div>
            </div>

            {/* 3. Symbols & Numbering */}
            <div>
              <label className="block font-bold text-slate-200 uppercase text-[11px] mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>3. Cấu Hình Ký Hiệu & Mẫu Số</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mẫu số hóa đơn:</label>
                  <input
                    type="text"
                    value={config.invoiceTemplate}
                    onChange={(e) => setConfig({ ...config, invoiceTemplate: e.target.value })}
                    placeholder="1/001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Ký hiệu hóa đơn:</label>
                  <input
                    type="text"
                    value={config.invoiceSymbol}
                    onChange={(e) => setConfig({ ...config, invoiceSymbol: e.target.value })}
                    placeholder="1C26TGP"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Display Toggles & Watermark */}
            <div>
              <label className="block font-bold text-slate-200 uppercase text-[11px] mb-2.5 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>4. Nhận Diện & Tùy Chọn Hiển Thị</span>
              </label>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">Hiển thị song ngữ (Việt - Anh)</span>
                      <span className="text-[10px] text-slate-400">VAT INVOICE, Buyer, Quantity, Total...</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showBilingual}
                    onChange={(e) => setConfig({ ...config, showBilingual: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-rose-400" />
                    <div>
                      <span className="font-bold text-white block">Con Dấu Điện Tử Đỏ</span>
                      <span className="text-[10px] text-slate-400">Dấu mộc tròn & ký số điện tử của doanh nghiệp</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showElectronicSeal}
                    onChange={(e) => setConfig({ ...config, showElectronicSeal: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">Watermark Chống Làm Giả</span>
                      <span className="text-[10px] text-slate-400">Chữ chìm xoay nghiêng giữa trang hóa đơn</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showWatermark}
                    onChange={(e) => setConfig({ ...config, showWatermark: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {config.showWatermark && (
                  <div className="pl-6 pt-1">
                    <input
                      type="text"
                      value={config.watermarkText || ''}
                      onChange={(e) => setConfig({ ...config, watermarkText: e.target.value })}
                      placeholder="ĐÃ KÝ ĐIỆN TỬ / CQT CẤP MÃ"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs outline-none"
                    />
                  </div>
                )}

                <label className="flex items-center justify-between p-2.5 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white block">Mã VietQR Thanh Toán Tự Động</span>
                      <span className="text-[10px] text-slate-400">Quét thanh toán tức thì theo số tiền hóa đơn</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showVietQR}
                    onChange={(e) => setConfig({ ...config, showVietQR: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 5. Bank Account for VietQR */}
            <div>
              <label className="block font-bold text-slate-200 uppercase text-[11px] mb-2.5">
                5. Thông Tin Ngân Hàng VietQR
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={config.bankName || ''}
                  onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                  placeholder="MBBANK"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
                <input
                  type="text"
                  value={config.bankAccount || ''}
                  onChange={(e) => setConfig({ ...config, bankAccount: e.target.value })}
                  placeholder="Số tài khoản"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-cyan-400"
                />
              </div>
              <input
                type="text"
                value={config.bankAccountHolder || ''}
                onChange={(e) => setConfig({ ...config, bankAccountHolder: e.target.value })}
                placeholder="Chủ tài khoản (viết hoa không dấu)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold uppercase"
              />
            </div>
          </div>

          {/* Right Panel: WYSIWYG Real-time Preview Sheet */}
          <div className="flex-1 bg-slate-950 p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
            <div
              className={`bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-10 max-w-3xl w-full text-xs transition-all relative font-serif`}
              style={{
                fontFamily:
                  config.templateStyle === 'modern_minimalist'
                    ? 'Inter, system-ui, sans-serif'
                    : '"Tinos", "Noto Serif", "Times New Roman", Times, serif',
              }}
            >
              {/* Watermark */}
              {config.showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
                  <span
                    className="text-5xl sm:text-7xl font-black uppercase transform -rotate-45"
                    style={{ color: config.primaryColor }}
                  >
                    {config.watermarkText || 'ĐÃ KÝ ĐIỆN TỬ / CQT CẤP MÃ'}
                  </span>
                </div>
              )}

              {/* Template Header Variation */}
              {config.templateStyle === 'standard_classic' && (
                <div className="text-center pb-4 border-b-2" style={{ borderColor: config.primaryColor }}>
                  <h4 className="text-xs font-bold uppercase text-slate-600">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </h4>
                  <p className="text-xs font-semibold text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="w-20 h-0.5 bg-slate-400 mx-auto my-1"></div>

                  <h1
                    className="text-xl sm:text-2xl font-black uppercase mt-3 tracking-wide"
                    style={{ color: config.primaryColor }}
                  >
                    HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                  </h1>
                  {config.showBilingual && (
                    <p className="text-[11px] italic font-semibold text-slate-500">
                      (VAT INVOICE - HÓA ĐƠN ĐIỆN TỬ)
                    </p>
                  )}
                </div>
              )}

              {config.templateStyle === 'modern_minimalist' && (
                <div className="flex items-start justify-between pb-4 border-b-2" style={{ borderColor: config.primaryColor }}>
                  <div className="flex items-center gap-3">
                    <GiaPhucLogo logoUrl={settings.logoUrl} className="w-14 h-14" isPrint={true} />
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: config.primaryColor }}>
                        HÓA ĐƠN GTGT
                      </h1>
                      {config.showBilingual && (
                        <p className="text-[11px] font-bold text-slate-500">ELECTRONIC VAT INVOICE</p>
                      )}
                      <p className="text-[10.5px] text-slate-600">Phát hành theo TT 78/2021/TT-BTC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded text-white font-mono font-bold text-xs" style={{ backgroundColor: config.primaryColor }}>
                      {config.invoiceSymbol}
                    </span>
                  </div>
                </div>
              )}

              {config.templateStyle === 'premium_executive' && (
                <div className="pb-4 border-b" style={{ borderColor: config.primaryColor }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-extrabold uppercase tracking-wider" style={{ color: config.primaryColor }}>
                        HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                      </h1>
                      {config.showBilingual && (
                        <p className="text-xs italic text-slate-500 font-sans tracking-wide">
                          COMMERCIAL VALUE ADDED TAX INVOICE
                        </p>
                      )}
                    </div>
                    <div className="p-2 border rounded text-right text-[11px]" style={{ borderColor: config.primaryColor }}>
                      <div>Ký hiệu: <strong className="font-mono">{config.invoiceSymbol}</strong></div>
                      <div>Mẫu số: <strong className="font-mono">{config.invoiceTemplate}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">
                    Mẫu số {config.showBilingual && '(Form)'}:
                  </span>
                  <strong className="font-mono text-slate-900">{config.invoiceTemplate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    Ký hiệu {config.showBilingual && '(Symbol)'}:
                  </span>
                  <strong className="font-mono text-slate-900">{config.invoiceSymbol}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    Số {config.showBilingual && '(Invoice No)'}:
                  </span>
                  <strong className="font-mono text-rose-600 font-bold">00000088</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    Ngày {config.showBilingual && '(Date)'}:
                  </span>
                  <strong className="text-slate-800">
                    {new Date().toLocaleDateString('vi-VN')}
                  </strong>
                </div>
              </div>

              {/* Seller & Buyer Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-[11px] leading-relaxed">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="font-bold uppercase pb-1 border-b border-slate-200" style={{ color: config.primaryColor }}>
                    ĐƠN VỊ BÁN HÀNG {config.showBilingual && '(SELLER)'}
                  </div>
                  <div>Tên: <strong>{settings.companyLegalName || settings.storeName || 'CÔNG TY TNHH MTV TM & DV SỬA CHỮA GIA PHÚC'}</strong></div>
                  <div>MST: <strong className="font-mono text-blue-800">{settings.taxCode || '0318999888'}</strong></div>
                  <div>Địa chỉ: {settings.address || 'Đường NA 067, P. Phú An, TP. HCM'}</div>
                  <div>Hotline: {settings.phone || '0985 862 609'}</div>
                </div>

                <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-200 space-y-0.5">
                  <div className="font-bold uppercase pb-1 border-b border-blue-200" style={{ color: config.primaryColor }}>
                    NGƯỜI MUA HÀNG {config.showBilingual && '(BUYER)'}
                  </div>
                  <div>Tên: <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ B2B VIỆT NAM</strong></div>
                  <div>MST: <strong className="font-mono text-blue-800">0315888999</strong></div>
                  <div>Địa chỉ: Tòa nhà Bitexco, Q. 1, TP. Hồ Chí Minh</div>
                  <div>Thanh toán: <strong>Chuyển khoản (CK)</strong></div>
                </div>
              </div>

              {/* Demo Items Table */}
              <div className="my-4 overflow-x-auto">
                <table className="w-full border-collapse text-xs" style={{ border: `1px solid ${config.tableBorderColor}` }}>
                  <thead>
                    <tr className="text-slate-900 font-bold text-center" style={{ backgroundColor: '#f1f5f9' }}>
                      <th className="p-2 border" style={{ borderColor: config.tableBorderColor, width: '32px' }}>STT</th>
                      <th className="p-2 border text-left" style={{ borderColor: config.tableBorderColor }}>
                        Tên Hàng Hóa, Dịch Vụ {config.showBilingual && '/ Description'}
                      </th>
                      <th className="p-2 border text-center" style={{ borderColor: config.tableBorderColor, width: '48px' }}>ĐVT</th>
                      <th className="p-2 border text-center" style={{ borderColor: config.tableBorderColor, width: '48px' }}>SL</th>
                      <th className="p-2 border text-right" style={{ borderColor: config.tableBorderColor, width: '90px' }}>Đơn Giá</th>
                      <th className="p-2 border text-center" style={{ borderColor: config.tableBorderColor, width: '48px' }}>VAT</th>
                      <th className="p-2 border text-right" style={{ borderColor: config.tableBorderColor, width: '100px' }}>Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border text-center font-mono" style={{ borderColor: config.tableBorderColor }}>1</td>
                      <td className="p-2 border" style={{ borderColor: config.tableBorderColor }}>
                        <div className="font-bold">Thiết Bị Lưu Điện UPS Online 2KVA Gia Phúc</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: GP-UPS-2KVA</div>
                      </td>
                      <td className="p-2 border text-center" style={{ borderColor: config.tableBorderColor }}>Bộ</td>
                      <td className="p-2 border text-center font-mono font-bold" style={{ borderColor: config.tableBorderColor }}>2</td>
                      <td className="p-2 border text-right font-mono" style={{ borderColor: config.tableBorderColor }}>7,800,000</td>
                      <td className="p-2 border text-center font-mono text-blue-700 font-bold" style={{ borderColor: config.tableBorderColor }}>8%</td>
                      <td className="p-2 border text-right font-mono font-bold" style={{ borderColor: config.tableBorderColor }}>15,600,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total & VietQR Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-4">
                {config.showVietQR ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <img src={vietQrDemoUrl} alt="VietQR" className="w-20 h-20 bg-white p-1 rounded border border-slate-300 shrink-0" />
                    <div className="text-[10.5px] space-y-0.5">
                      <div className="font-bold uppercase" style={{ color: config.primaryColor }}>
                        QUÉT VIETQR THANH TOÁN
                      </div>
                      <div>NH: <strong>{config.bankName}</strong></div>
                      <div>STK: <strong className="font-mono text-blue-700">{config.bankAccount}</strong></div>
                      <div>Chủ TK: <strong>{config.bankAccountHolder}</strong></div>
                    </div>
                  </div>
                ) : <div />}

                <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Tiền hàng {config.showBilingual && '(Subtotal)'}:</span>
                    <span className="font-mono font-semibold">15,600,000 VND</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Thuế GTGT (8%):</span>
                    <span className="font-mono font-semibold">1,248,000 VND</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm" style={{ color: config.primaryColor }}>
                    <span>TỔNG CỘNG:</span>
                    <span className="font-mono text-base font-black">16,848,000 VND</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 gap-8 text-center mt-6 pt-4 border-t border-slate-300 text-xs">
                <div>
                  <div className="font-bold uppercase text-slate-800">
                    NGƯỜI MUA HÀNG {config.showBilingual && '(BUYER)'}
                  </div>
                  <div className="text-[10px] text-slate-500 italic mb-14">
                    (Ký, ghi rõ họ tên)
                  </div>
                  <div className="font-bold">Đại diện bên Mua</div>
                </div>

                <div className="relative">
                  <div className="font-bold uppercase text-slate-800">
                    NGƯỜI BÁN HÀNG {config.showBilingual && '(SELLER)'}
                  </div>
                  <div className="text-[10px] text-slate-500 italic mb-14">
                    (Ký số điện tử & đóng dấu)
                  </div>

                  {config.showElectronicSeal && (
                    <div className="absolute right-1/2 translate-x-1/2 top-7 w-24 h-24 rounded-full border-2 border-dashed border-rose-600 text-rose-600 flex flex-col items-center justify-center p-1 opacity-85 rotate-[-12deg] pointer-events-none select-none">
                      <span className="text-[8px] font-black uppercase text-center leading-tight">CÔNG TY GIA PHÚC</span>
                      <span className="text-[9px] font-bold my-0.5">★ ĐÃ KÝ ★</span>
                      <span className="text-[7.5px] font-mono">DIGITAL SIGNED</span>
                    </div>
                  )}

                  <div className="font-bold text-slate-900">Phạm Ngọc Thơm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
