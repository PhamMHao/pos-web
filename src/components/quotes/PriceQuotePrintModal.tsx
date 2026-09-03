import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  Sliders,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { PriceQuote, StoreSettings, PaperSize, DigitalSignatureMetadata } from '../../types';
import { PrinterSelectDropdown } from '../common/PrinterSelectDropdown';
import { PriceQuoteDocumentTemplate } from './PriceQuoteDocumentTemplate';

export interface PriceQuotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: PriceQuote;
  settings?: StoreSettings | null;
  signature?: DigitalSignatureMetadata | null;
  onSaveSettings?: (settings: StoreSettings) => void;
}

export const PriceQuotePrintModal: React.FC<PriceQuotePrintModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
  signature,
  onSaveSettings,
}) => {
  // 1. Print configuration state
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [codePlacement, setCodePlacement] = useState<'header' | 'footer' | 'both'>('header');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [savedDefaultToast, setSavedDefaultToast] = useState<boolean>(false);

  // 2. Display toggles
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [showVietQR, setShowVietQR] = useState<boolean>(true);
  const [showDigitalSignature, setShowDigitalSignature] = useState<boolean>(true);

  // 3. Company information (Seller)
  const [companyName, setCompanyName] = useState<string>('');
  const [brandTitle, setBrandTitle] = useState<string>('');
  const [companyAddress, setCompanyAddress] = useState<string>('');
  const [companyPhone, setCompanyPhone] = useState<string>('');
  const [companyEmail, setCompanyEmail] = useState<string>('');
  const [companyTaxCode, setCompanyTaxCode] = useState<string>('');
  const [representativeName, setRepresentativeName] = useState<string>('');
  const [companyWebsite, setCompanyWebsite] = useState<string>('giaphuc.vn');

  // 4. Customer information (Buyer)
  const [customerCompany, setCustomerCompany] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [customerTaxCode, setCustomerTaxCode] = useState<string>('');

  // 5. Document & Dates
  const [docDateStr, setDocDateStr] = useState<string>('');
  const [validUntilStr, setValidUntilStr] = useState<string>('');

  // 6. Commercial Terms & Notes
  const [term1, setTerm1] = useState<string>('');
  const [term2, setTerm2] = useState<string>('');
  const [term3, setTerm3] = useState<string>('');
  const [term4, setTerm4] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // 7. VietQR Bank info
  const [bankName, setBankName] = useState<string>('MBBANK');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('0985862609');
  const [bankAccountHolder, setBankAccountHolder] = useState<string>('PHAM NGOC THOM');

  // Initialize and sync states from quote and settings
  useEffect(() => {
    if (!quote) return;

    // Load custom settings for 'quote' doc type if saved previously
    const savedConfig = settings?.printDocConfigs?.['quote'];
    if (savedConfig?.paperSize) setPaperSize(savedConfig.paperSize);
    if (savedConfig?.orientation) setOrientation(savedConfig.orientation);
    if (savedConfig?.codePlacement) setCodePlacement(savedConfig.codePlacement);
    if (savedConfig?.showLogo !== undefined) setShowLogo(savedConfig.showLogo);
    if (savedConfig?.showBarcode !== undefined) setShowBarcode(savedConfig.showBarcode);
    if (savedConfig?.showVietQR !== undefined) setShowVietQR(savedConfig.showVietQR);

    // Company info
    setCompanyName(settings?.companyLegalName || settings?.storeName || 'CÔNG TY TNHH MTV TM & DV SỬA CHỮA GIA PHÚC');
    setBrandTitle(settings?.storeName || 'Gia Phúc Computer & Solutions');
    setCompanyAddress(settings?.address || 'Số 54, Đường Phú An 087, tổ 11, KP. An Thuận, P. Phú An, TP. HCM');
    setCompanyPhone(settings?.phone || '0985 862 609 - 0914 665 994');
    setCompanyEmail(settings?.email || 'giaphuc.pos@gmail.com');
    setCompanyTaxCode(settings?.taxCode || '3701877838');
    setRepresentativeName(settings?.representativeName || 'Phạm Ngọc Thơm');
    setCompanyWebsite(settings?.website || 'giaphuc.vn');

    // Customer info
    setCustomerCompany(quote.customerCompany || quote.customerName || 'Công ty Quý Khách');
    setCustomerName(quote.customerName || 'Đại diện Quý Khách');
    setCustomerPhone(quote.customerPhone || '');
    setCustomerAddress(quote.customerAddress || 'Tại văn phòng quý khách');
    setCustomerTaxCode(quote.customerTaxCode || '');

    // Dates
    const cDate = new Date(quote.createdAt);
    const vDate = new Date(quote.validUntil);
    setDocDateStr(
      `Ngày ${String(cDate.getDate()).padStart(2, '0')} Tháng ${String(cDate.getMonth() + 1).padStart(2, '0')} Năm ${cDate.getFullYear()}`
    );
    setValidUntilStr(
      isNaN(vDate.getTime())
        ? new Date(Date.now() + 15 * 86400000).toLocaleDateString('vi-VN')
        : vDate.toLocaleDateString('vi-VN')
    );

    // Terms
    setTerm1(
      `Báo giá có giá trị đến hết ngày ${
        isNaN(vDate.getTime())
          ? new Date(Date.now() + 15 * 86400000).toLocaleDateString('vi-VN')
          : vDate.toLocaleDateString('vi-VN')
      }. Sau thời gian trên, đơn giá có thể thay đổi theo biến động thị trường.`
    );
    setTerm2('Tạm ứng 30% - 50% khi ký hợp đồng/xác nhận đặt hàng, thanh toán 100% còn lại ngay khi giao nhận hàng hóa và nghiệm thu.');
    setTerm3('Trong vòng 24h - 48h kể từ khi nhận đủ tiền cọc hoặc xác nhận đơn hàng, giao hàng và lắp đặt tận nơi theo yêu cầu.');
    setTerm4('Toàn bộ thiết bị mới 100%, bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất tại Gia Phúc Computer. Hỗ trợ kỹ thuật 24/7.');
    setNotes(quote.notes || '');

    // Bank
    const bankConfig = settings?.bankAccounts?.[0];
    if (bankConfig) {
      setBankName(bankConfig.bankName || 'MBBANK');
      setBankAccountNumber(bankConfig.accountNumber || '0985862609');
      setBankAccountHolder(bankConfig.accountHolder || 'PHAM NGOC THOM');
    }
  }, [quote, settings, isOpen]);

  // Execute print
  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  // Save current preferences as default
  const handleSaveAsDefault = () => {
    if (!onSaveSettings || !settings) return;
    const existing = settings.printDocConfigs?.['quote'] || {};
    const updated: StoreSettings = {
      ...settings,
      printDocConfigs: {
        ...(settings.printDocConfigs || {}),
        quote: {
          ...existing,
          paperSize,
          orientation,
          codePlacement,
          showLogo,
          showBarcode,
          showVietQR,
        },
      },
    };
    onSaveSettings(updated);
    setSavedDefaultToast(true);
    setTimeout(() => setSavedDefaultToast(false), 2500);
  };

  // Keyboard shortcuts (Ctrl+P to print, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in select-text">
      {/* Dynamic Print Page Size CSS injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: ${paperSize.toLowerCase()} ${orientation};
              margin: 8mm;
            }
          `,
        }}
      />

      <div
        id="print-quote-modal-container"
        className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[96vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Top Header Controls Bar (Hidden during window.print) */}
        <div className="no-print bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left: Document Title & Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  In Phiếu Báo Giá Chuẩn A4 / A5
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Khổ {paperSize} • {orientation === 'portrait' ? 'Dọc' : 'Ngang'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Form mẫu chuẩn Báo Giá Gia Phúc & Ký số điện tử • Tích hợp Barcode 1D & QR Code Tra cứu F7.
              </p>
            </div>
          </div>

          {/* Middle: Format & Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Size Picker (A4, A5) */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              {(['A4', 'A5'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  id={`btn-quote-paper-size-${sz}`}
                  onClick={() => setPaperSize(sz)}
                  className={`px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
                    paperSize === sz
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Orientation (Portrait / Landscape) */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                id="btn-quote-orientation-portrait"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  orientation === 'portrait'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dọc
              </button>
              <button
                type="button"
                id="btn-quote-orientation-landscape"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ngang
              </button>
            </div>

            {/* Code Placement Selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-2">Vị trí mã:</span>
              <button
                type="button"
                onClick={() => setCodePlacement('header')}
                title="Mã vạch & Mã QR ở đầu trang"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  codePlacement === 'header'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Đầu trang (Cân phiếu)
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('footer')}
                title="Mã vạch & Mã QR ở chân trang"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  codePlacement === 'footer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cuối trang (Đẹp)
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('both')}
                title="Hiển thị cả ở đầu trang và chân trang"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  codePlacement === 'both'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cả 2
              </button>
            </div>

            {/* Toggle Editor Drawer */}
            <button
              type="button"
              id="btn-toggle-quote-editor"
              onClick={() => setShowEditor(!showEditor)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                showEditor
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Chỉnh Sửa Thông Tin</span>
            </button>

            {/* Save as default config */}
            {onSaveSettings && (
              <button
                type="button"
                onClick={handleSaveAsDefault}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 transition-all active:scale-95 cursor-pointer"
                title="Lưu khổ giấy, chiều in và bố cục này làm mặc định cho phiếu báo giá"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Lưu Mặc Định Mẫu ({paperSize})</span>
              </button>
            )}
          </div>

          {/* Right: Printer Selection, Print & Close */}
          <div className="flex items-center space-x-2">
            {savedDefaultToast && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-lg animate-pulse">
                ✓ Đã lưu mặc định!
              </span>
            )}

            <PrinterSelectDropdown
              onSelectPrinter={(p) => {
                if (p.defaultPaperSize === 'A4' || p.defaultPaperSize === 'A5') {
                  setPaperSize(p.defaultPaperSize);
                }
                if (p.defaultOrientation) {
                  setOrientation(p.defaultOrientation);
                }
              }}
            />

            <button
              type="button"
              id="btn-execute-print-quote"
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay (Ctrl+P)</span>
            </button>

            <button
              type="button"
              id="btn-close-quote-print-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: Preview & Live Editor */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950/70">
          {/* Side Drawer: Live Customization Editor (no-print) */}
          {showEditor && (
            <div className="no-print w-full md:w-84 lg:w-96 bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 space-y-4 text-xs shrink-0 select-none">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center space-x-1.5 text-sm">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Tùy Chỉnh Bản In Trực Tiếp</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Toggle Elements */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">
                  Bật / Tắt Bố Cục
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Logo Gia Phúc</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Mã Vạch Barcode</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showVietQR}
                      onChange={(e) => setShowVietQR(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">VietQR Thanh Toán</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDigitalSignature}
                      onChange={(e) => setShowDigitalSignature(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-300">Ký Số Điện Tử CA</span>
                  </label>
                </div>
              </div>

              {/* 2. Company Information */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <h4 className="font-bold text-blue-400 uppercase text-[10px] tracking-wider">
                  I. Đơn Vị Báo Giá (Bên Bán)
                </h4>
                <div>
                  <label className="block text-slate-400 mb-1">Tên Công Ty Pháp Lý:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tên Thương Hiệu:</label>
                  <input
                    type="text"
                    value={brandTitle}
                    onChange={(e) => setBrandTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Địa chỉ:</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Hotline / Zalo:</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Mã Số Thuế:</label>
                    <input
                      type="text"
                      value={companyTaxCode}
                      onChange={(e) => setCompanyTaxCode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Người Đại Diện:</label>
                    <input
                      type="text"
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Email:</label>
                    <input
                      type="text"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Customer Information */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">
                  II. Khách Hàng (Bên Mua)
                </h4>
                <div>
                  <label className="block text-slate-400 mb-1">Tên Công Ty / Đơn Vị:</label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Người Liên Hệ:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Số Điện Thoại:</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Địa Chỉ VP / Công Trình:</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mã Số Thuế / CCCD:</label>
                  <input
                    type="text"
                    value={customerTaxCode}
                    onChange={(e) => setCustomerTaxCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* 4. Dates & Validity */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                  III. Ngày Lập & Thời Hạn Báo Giá
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Ngày lập:</label>
                    <input
                      type="text"
                      value={docDateStr}
                      onChange={(e) => setDocDateStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Hết hạn hiệu lực:</label>
                    <input
                      type="text"
                      value={validUntilStr}
                      onChange={(e) => setValidUntilStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-bold text-rose-400"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Terms & Conditions */}
              <div className="space-y-2 border-b border-slate-800 pb-3">
                <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">
                  IV. Điều Khoản Thương Mại & Kỹ Thuật
                </h4>
                <div>
                  <label className="block text-slate-400 mb-0.5">1. Hiệu lực:</label>
                  <textarea
                    rows={2}
                    value={term1}
                    onChange={(e) => setTerm1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">2. Thanh toán:</label>
                  <textarea
                    rows={2}
                    value={term2}
                    onChange={(e) => setTerm2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">3. Giao hàng:</label>
                  <textarea
                    rows={2}
                    value={term3}
                    onChange={(e) => setTerm3(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">4. Bảo hành & Hỗ trợ:</label>
                  <textarea
                    rows={2}
                    value={term4}
                    onChange={(e) => setTerm4(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-0.5">Ghi chú bổ sung:</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú thêm cho khách hàng..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* 6. Bank VietQR */}
              <div className="space-y-2">
                <h4 className="font-bold text-teal-400 uppercase text-[10px] tracking-wider">
                  V. Tài Khoản VietQR Thanh Toán
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Ngân hàng:</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Số tài khoản:</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-mono font-bold text-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Chủ tài khoản:</label>
                  <input
                    type="text"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none uppercase font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Document Sheet Preview Container */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center items-start bg-slate-950/80 print:p-0 print:bg-white print:overflow-visible">
            <div className="printable-document w-full flex justify-center">
              <PriceQuoteDocumentTemplate
                quote={quote}
                settings={settings}
                signature={signature || quote.digitalSignature}
                paperSize={paperSize}
                orientation={orientation}
                codePlacement={codePlacement}
                showLogo={showLogo}
                showBarcode={showBarcode}
                showVietQR={showVietQR}
                showDigitalSignature={showDigitalSignature}
                customCompany={{
                  name: companyName,
                  brand: brandTitle,
                  address: companyAddress,
                  phone: companyPhone,
                  email: companyEmail,
                  taxCode: companyTaxCode,
                  representative: representativeName,
                  website: companyWebsite,
                }}
                customCustomer={{
                  company: customerCompany,
                  name: customerName,
                  phone: customerPhone,
                  address: customerAddress,
                  taxCode: customerTaxCode,
                }}
                customDates={{
                  createdDateStr: docDateStr,
                  validUntilStr: validUntilStr,
                }}
                customTerms={{
                  term1,
                  term2,
                  term3,
                  term4,
                  notes,
                }}
                customBank={{
                  bankName,
                  accountNumber: bankAccountNumber,
                  accountHolder: bankAccountHolder,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Quick Status Bar */}
        <div className="no-print bg-slate-950 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <Check className="w-4 h-4" />
              <span>
                Sẵn sàng in chuẩn Khổ {paperSize} {orientation === 'portrait' ? 'Dọc' : 'Ngang'}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Mã Báo Giá: <strong className="text-white font-mono">{quote.code}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Khách hàng: <strong className="text-white">{customerName || quote.customerName}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Sản phẩm: <strong className="text-white">{quote.items.length} món</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-slate-500 italic">
              Ctrl+P: In ngay • Esc: Đóng cửa sổ
            </span>
            <button
              type="button"
              onClick={handlePrint}
              className="font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay (Ctrl+P)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
