import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Sliders,
  FileText,
  Receipt,
  Building2,
  CheckCircle2,
  Download,
  CreditCard,
  QrCode,
  Sparkles,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreSettings } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GiaPhucLogo } from './GiaPhucLogo';
import { PrinterSelectDropdown } from './PrinterSelectDropdown';
import { PrinterProfile } from '../../utils/printerStorage';
import { PaperSize } from '../../types';

export type { PaperSize };
export type PaperOrientation = 'portrait' | 'landscape';

export interface DocumentSampleItem {
  stt?: number;
  code?: string;
  name: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  note?: string;
}

export interface DocumentSampleData {
  title?: string;
  docCode?: string;
  docDate?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCompany?: string;
  customerTaxCode?: string;
  items?: DocumentSampleItem[];
  subtotal?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  amountInWords?: string;
  note?: string;
  creatorName?: string;
}

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  initialPaperSize?: PaperSize;
  initialOrientation?: PaperOrientation;
  settings?: StoreSettings;
  sampleData?: DocumentSampleData;
  children?: React.ReactNode;
  onPrint?: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'Bản Xem Trước Tài Liệu In (Print Preview)',
  initialPaperSize = 'A4',
  initialOrientation = 'portrait',
  settings,
  sampleData,
  children,
  onPrint,
}) => {
  const [paperSize, setPaperSize] = useState<PaperSize>(initialPaperSize);
  const [orientation, setOrientation] = useState<PaperOrientation>(initialOrientation);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const printableRef = useRef<HTMLDivElement | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setPaperSize(initialPaperSize);
      setOrientation(initialOrientation);
      setZoomLevel(1);
    }
  }, [isOpen, initialPaperSize, initialOrientation]);

  // Keyboard shortcuts (Ctrl+P, Esc, Ctrl +, Ctrl -)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDirectPrint();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(2.0, prev + 0.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(0.5, prev - 0.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Determine active CSS class based on paper size and orientation
  const getPaperSizeClass = () => {
    if (paperSize === 'K58') return 'paper-size-K58';
    if (paperSize === 'K80') return 'paper-size-K80';
    if (paperSize === 'A5') {
      return orientation === 'landscape' ? 'paper-size-A5-landscape' : 'paper-size-A5-portrait';
    }
    return orientation === 'landscape' ? 'paper-size-A4-landscape' : 'paper-size-A4-portrait';
  };

  // Direct browser print function
  const handleDirectPrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  // Default Fallback Document Data
  const defaultDoc: DocumentSampleData = {
    title: sampleData?.title || 'HÓA ĐƠN BÁN HÀNG & PHIẾU GIAO NHẬN',
    docCode: sampleData?.docCode || 'HD-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
    docDate: sampleData?.docDate || new Date().toLocaleDateString('vi-VN'),
    customerName: sampleData?.customerName || 'Công Ty Cổ Phần Công Nghệ & Viễn Thông Hoàng Long',
    customerPhone: sampleData?.customerPhone || '0912 345 678',
    customerAddress: sampleData?.customerAddress || 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP. HCM',
    customerCompany: sampleData?.customerCompany || 'Công Ty CP Công Nghệ Hoàng Long',
    customerTaxCode: sampleData?.customerTaxCode || '0314897210',
    items: sampleData?.items || [
      { stt: 1, code: 'CAM-DS1T41', name: 'Camera IP Thân Trụ 4MP DS-2CD1T41G2-LIU Ban Đêm Có Màu', unit: 'Bộ', quantity: 4, unitPrice: 1250000, total: 5000000, note: 'BH 24 Tháng' },
      { stt: 2, code: 'NVR-DS7104', name: 'Đầu Ghi Hình NVR 4 Kênh Hikvision Chuẩn H.265+ 4K', unit: 'Cái', quantity: 1, unitPrice: 1650000, total: 1650000, note: 'Chính Hãng' },
      { stt: 3, code: 'HDD-2TB-WD', name: 'Ổ Cứng Chuyên Dụng Camera WD Purple 2TB SATA 3', unit: 'Cái', quantity: 1, unitPrice: 1450000, total: 1450000, note: 'BH 36 Tháng' },
      { stt: 4, code: 'SW-POE-4P', name: 'Switch PoE 4 Cổng 10/100Mbps + 2 Cổng Uplink 65W', unit: 'Cái', quantity: 1, unitPrice: 650000, total: 650000, note: 'Cấp Nguồn' },
      { stt: 5, code: 'VT-CAP-CAT6', name: 'Dây Cáp Mạng Cat6 UTP Đồng Nguyên Chất 305m (Cuộn)', unit: 'Cuộn', quantity: 1, unitPrice: 1850000, total: 1850000, note: 'Kho Kệ B3' },
    ],
    subtotal: sampleData?.subtotal || 10600000,
    discountAmount: sampleData?.discountAmount || 600000,
    taxRate: sampleData?.taxRate !== undefined ? sampleData.taxRate : 8,
    taxAmount: sampleData?.taxAmount || 800000,
    totalAmount: sampleData?.totalAmount || 10800000,
    amountInWords: sampleData?.amountInWords || numberToVietnameseWords(10800000),
    note: sampleData?.note || 'Hàng chính hãng mới 100%, bảo hành theo tiêu chuẩn nhà sản xuất. Quý khách vui lòng giữ phiếu khi bảo hành.',
    creatorName: sampleData?.creatorName || 'Phạm Gia Phúc (Quản lý)',
  };

  const companyLegalName = settings?.companyLegalName || settings?.storeName || 'CÔNG TY TNHH TIN HỌC & VIỄN THÔNG GIA PHÚC';
  const companyAddress = settings?.address || '123 Đường Số 7, Phường An Lạc A, Quận Bình Tân, TP. Hồ Chí Minh';
  const companyPhone = settings?.phone || '0909.123.456 - 028.3868.9999';
  const companyTaxCode = settings?.taxCode || '0316889977';
  const bankAccount = settings?.bankAccount || '1903668899001';
  const bankName = settings?.bankName || 'Techcombank';
  const bankCode = settings?.bankCode || 'TCB';

  const vietQrUrl = generateVietQRUrl({
    bankCode,
    accountNo: bankAccount,
    accountName: companyLegalName,
    amount: defaultDoc.totalAmount || 10800000,
    description: defaultDoc.docCode || 'HD-GP',
  });

  const dynamicPageStyle = `
    @page {
      size: ${
        paperSize === 'K58'
          ? '58mm auto'
          : paperSize === 'K80'
          ? '80mm auto'
          : `${paperSize} ${orientation}`
      };
      margin: ${paperSize === 'K58' ? '2mm' : paperSize === 'K80' ? '4mm' : orientation === 'landscape' ? '8mm' : '10mm'};
    }
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="print-preview-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 md:p-4 overflow-hidden"
        >
          {/* Dynamic Page Injected Style for Accurate Browser Print Output */}
          <style dangerouslySetInnerHTML={{ __html: dynamicPageStyle }} />

          <motion.div
            key="print-preview-dialog"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-7xl w-full h-[96vh] max-h-[980px] shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Top Control Toolbar (Slide-Down Animation) */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
              className="p-3.5 px-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print"
            >
          {/* Left: Title & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-white flex items-center space-x-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                  {paperSize} {paperSize !== 'K80' && paperSize !== 'K58' ? (orientation === 'landscape' ? 'Ngang' : 'Dọc') : 'Thermal'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Áp dụng chuẩn lớp CSS khổ giấy ({paperSize === 'K58' ? '.paper-size-K58' : paperSize === 'K80' ? '.paper-size-K80' : `.paper-size-${paperSize}-${orientation}`})
              </p>
            </div>
          </div>

          {/* Center: Paper Size & Orientation Toggler */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {/* A4 Button */}
            <button
              type="button"
              onClick={() => setPaperSize('A4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paperSize === 'A4' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Khổ A4 (210×297)
            </button>

            {/* A5 Button */}
            <button
              type="button"
              onClick={() => setPaperSize('A5')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paperSize === 'A5' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Khổ A5 (148×210)
            </button>

            {/* K80 Thermal Bill */}
            <button
              type="button"
              onClick={() => setPaperSize('K80')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                paperSize === 'K80' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>K80 (80mm)</span>
            </button>

            {/* K58 Thermal Bill */}
            <button
              type="button"
              onClick={() => setPaperSize('K58')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                paperSize === 'K58' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>K58 (58mm)</span>
            </button>

            {/* Orientation Toggler (For A4 & A5 only) */}
            {paperSize !== 'K80' && paperSize !== 'K58' && (
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    orientation === 'portrait' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'
                  }`}
                  title="Hướng giấy Dọc"
                >
                  Dọc
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    orientation === 'landscape' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'
                  }`}
                  title="Hướng giấy Ngang"
                >
                  Ngang
                </button>
              </div>
            )}
          </div>

          {/* Right: Zoom & Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Zoom Slider Control */}
            <div className="flex items-center space-x-1.5 bg-slate-900 p-1 px-2 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.1))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Thu nhỏ (Ctrl -)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-16 accent-blue-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(2.0, prev + 0.1))}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                title="Phóng to (Ctrl +)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-sky-400 font-bold hover:bg-slate-700 cursor-pointer"
                title="Đưa về 100% tỉ lệ chuẩn (Ctrl 0)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
            </div>

            {/* Printer Selection Dropdown */}
            <PrinterSelectDropdown
              onSelectPrinter={(p) => {
                if (p.defaultPaperSize && p.defaultPaperSize !== 'custom') {
                  setPaperSize(p.defaultPaperSize as any);
                }
                if (p.defaultOrientation) {
                  setOrientation(p.defaultOrientation);
                }
              }}
            />

            {/* Print Button (Ctrl + P) */}
            <button
              type="button"
              onClick={handleDirectPrint}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer transition-all"
              title="Kích hoạt lệnh in trực tiếp (Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay</span>
              <span className="hidden sm:inline text-[10px] opacity-75 font-mono">(Ctrl+P)</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Canvas Display Viewport (Scrollable container) */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-auto flex justify-center items-start print:p-0 print:overflow-visible print:bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-75 flex flex-col items-center"
          >
            {/* Printable Document Sheet Container (Uses Existing CSS Paper Sizes) */}
            <div
              id="printable-area"
              ref={printableRef}
              className={`printable-document shadow-2xl rounded-xs select-text ${getPaperSizeClass()}`}
            >
              {children ? (
                /* Render Custom Passed Content */
                children
              ) : (
                /* Standard Business Document Structure */
                <div className="w-full flex flex-col justify-between min-h-full font-sans text-slate-900">
                  {/* Document Header */}
                  <div className="border-b border-slate-300 pb-3 mb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <GiaPhucLogo className="w-12 h-12 shrink-0" />
                        <div>
                          <h1 className="text-sm md:text-base font-black text-slate-950 uppercase tracking-tight">
                            {companyLegalName}
                          </h1>
                          <p className="text-[10px] text-slate-600 mt-0.5">📍 {companyAddress}</p>
                          <p className="text-[10px] text-slate-600">
                            ☎️ {companyPhone} &nbsp;|&nbsp; MST: <strong>{companyTaxCode}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                          {defaultDoc.docCode}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Ngày lập: {defaultDoc.docDate}</p>
                      </div>
                    </div>

                    {/* Document Big Title */}
                    <div className="text-center mt-3 pt-2 border-t border-slate-100">
                      <h2 className="text-base md:text-lg font-black text-blue-900 uppercase tracking-wide">
                        {defaultDoc.title}
                      </h2>
                      <p className="text-[10px] italic text-slate-500">(Liên 1: Lưu nội bộ / Khách hàng giữ phiếu)</p>
                    </div>
                  </div>

                  {/* Customer / Recipient Info */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 text-[10px] md:text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p>Khách hàng: <strong className="text-slate-900">{defaultDoc.customerName}</strong></p>
                      <p className="text-slate-600 mt-0.5">Địa chỉ: {defaultDoc.customerAddress}</p>
                    </div>
                    <div className="sm:text-right">
                      <p>Điện thoại: <strong className="text-slate-900 font-mono">{defaultDoc.customerPhone}</strong></p>
                      <p className="text-slate-600 mt-0.5">Mã số thuế: {defaultDoc.customerTaxCode || 'Không có'}</p>
                    </div>
                  </div>

                  {/* Table with Excel Styling (.excel-grid-table, .excel-header-blue) */}
                  <div className="mb-3 overflow-hidden rounded border border-slate-300">
                    <table className="excel-grid-table w-full text-left text-[10px] md:text-[11px]">
                      <thead>
                        <tr className="bg-[#1e40af] text-white font-bold excel-header-blue">
                          <th className="py-1.5 px-2 text-center w-8">STT</th>
                          <th className="py-1.5 px-2 w-24">Mã Hàng</th>
                          <th className="py-1.5 px-2">Tên Hàng Hóa & Quy Cách</th>
                          <th className="py-1.5 px-2 text-center w-12">ĐVT</th>
                          <th className="py-1.5 px-2 text-center w-12">SL</th>
                          <th className="py-1.5 px-2 text-right w-24">Đơn Giá</th>
                          <th className="py-1.5 px-2 text-right w-28">Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {defaultDoc.items?.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                            <td className="py-1 px-2 text-center font-mono">{item.stt || idx + 1}</td>
                            <td className="py-1 px-2 font-mono font-semibold text-slate-700">{item.code || '-'}</td>
                            <td className="py-1 px-2">
                              <span className="font-bold text-slate-900 block">{item.name}</span>
                              {item.note && <span className="text-[9px] text-slate-500 italic">{item.note}</span>}
                            </td>
                            <td className="py-1 px-2 text-center">{item.unit || 'Cái'}</td>
                            <td className="py-1 px-2 text-center font-bold font-mono">{item.quantity}</td>
                            <td className="py-1 px-2 text-right font-mono">{formatVND(item.unitPrice)}</td>
                            <td className="py-1 px-2 text-right font-bold font-mono text-slate-950">
                              {formatVND(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Totals & VietQR Payment Box */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    {/* Left: VietQR & Bank Info */}
                    <div className="flex items-center space-x-3 p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 max-w-sm">
                      <img src={vietQrUrl} alt="VietQR" className="w-16 h-16 object-contain bg-white p-1 rounded border border-blue-200 shrink-0" />
                      <div className="text-[10px]">
                        <p className="font-bold text-blue-950 uppercase">Quét Mã VietQR Chuyển Khoản</p>
                        <p className="text-slate-700">TK: <strong className="font-mono text-blue-900">{bankAccount}</strong></p>
                        <p className="text-slate-600">Ngân hàng: {bankName}</p>
                        <p className="text-[9px] text-slate-500 italic mt-0.5">Cú pháp: {defaultDoc.docCode}</p>
                      </div>
                    </div>

                    {/* Right: Calculations */}
                    <div className="w-full sm:w-64 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Cộng tiền hàng:</span>
                        <span className="font-mono font-semibold text-slate-900">{formatVND(defaultDoc.subtotal || 0)}</span>
                      </div>
                      {defaultDoc.discountAmount ? (
                        <div className="flex justify-between text-slate-600">
                          <span>Chiết khấu / Giảm giá:</span>
                          <span className="font-mono text-rose-600">-{formatVND(defaultDoc.discountAmount)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-slate-600">
                        <span>Thuế GTGT ({defaultDoc.taxRate || 8}%):</span>
                        <span className="font-mono text-slate-900">{formatVND(defaultDoc.taxAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-blue-900 pt-1 border-t border-slate-300">
                        <span>TỔNG THANH TOÁN:</span>
                        <span className="font-mono text-sm">{formatVND(defaultDoc.totalAmount || 0)}</span>
                      </div>
                      <div className="text-[10px] italic text-slate-600 text-right mt-0.5">
                        (Bằng chữ: <strong>{defaultDoc.amountInWords}</strong>)
                      </div>
                    </div>
                  </div>

                  {/* Signatures Section */}
                  <div className="pt-3 border-t border-slate-200 mt-auto">
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] md:text-[11px]">
                      <div>
                        <p className="font-bold uppercase text-slate-900">Người Lập Phiếu</p>
                        <p className="text-[9px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
                        <div className="h-12"></div>
                        <p className="font-semibold text-slate-800">{defaultDoc.creatorName}</p>
                      </div>

                      <div>
                        <p className="font-bold uppercase text-slate-900">Thủ Kho / Giao Hàng</p>
                        <p className="text-[9px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
                        <div className="h-12"></div>
                        <p className="text-slate-400 italic text-[10px]">Đã xuất đủ hàng</p>
                      </div>

                      <div>
                        <p className="font-bold uppercase text-slate-900">Đại Diện Khách Hàng</p>
                        <p className="text-[9px] text-slate-500 italic">(Ký, đóng dấu nếu có)</p>
                        <div className="h-12"></div>
                        <p className="text-slate-400 italic text-[10px]">Đã nhận đủ hàng & hóa đơn</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer Status Elevation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
          className="p-2.5 px-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 no-print shrink-0"
        >
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Định dạng: <strong className="text-slate-200">{paperSize}</strong> ({orientation === 'landscape' ? 'Ngang' : 'Dọc'})</span>
            </span>
            <span>•</span>
            <span>Tỉ lệ hiển thị: <strong className="text-cyan-400 font-mono">{Math.round(zoomLevel * 100)}%</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="hidden sm:inline">Phím tắt: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-300">Ctrl+P</kbd> In • <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-300">Esc</kbd> Đóng</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
);
};
