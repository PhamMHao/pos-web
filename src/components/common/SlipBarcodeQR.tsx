import React, { useMemo } from 'react';
import { generateBarcodeSVG, generateQRCodeSVG, getQRCodeUrl } from '../../utils/barcodeGenerator';
import { PaperSize } from '../../types';

export interface SlipBarcodeQRProps {
  docCode: string;
  orderCode?: string;
  docType?: string; // sales_invoice, stock_receipt, warranty, quote, po, einvoice, etc.
  date?: string;
  customerName?: string;
  totalAmount?: number;
  showBarcode?: boolean;
  showQr?: boolean;
  paperSize?: PaperSize;
  vietQrUrl?: string;
  qrPayloadMode?: 'erp_smart' | 'vietqr' | 'both';
  className?: string;
  align?: 'center' | 'left' | 'right' | 'between';
  renderMode?: 'both' | 'barcode_only' | 'qr_only';
  layout?: 'row' | 'column';
  variant?: 'standard' | 'warranty_footer';
  brandName?: string;
  customLookupTitle?: string;
  customLookupDesc?: string;
  qrLabel?: string;
}

export const SlipBarcodeQR: React.FC<SlipBarcodeQRProps> = ({
  docCode,
  orderCode,
  docType = 'erp_doc',
  date = new Date().toISOString(),
  customerName = '',
  totalAmount = 0,
  showBarcode = true,
  showQr = true,
  paperSize = 'A4',
  vietQrUrl,
  qrPayloadMode = 'erp_smart',
  className = '',
  align = 'center',
  renderMode = 'both',
  layout = 'row',
  variant = 'standard',
  brandName = 'GIA PHÚC',
  customLookupTitle,
  customLookupDesc,
  qrLabel,
}) => {
  const shouldShowBarcode = showBarcode && renderMode !== 'qr_only';
  const shouldShowQr = showQr && renderMode !== 'barcode_only';

  // Generate Pure Vector SVG Barcode
  const barcodeSvgHtml = useMemo(() => {
    if (!shouldShowBarcode || !docCode) return '';
    const isThermalSmall = paperSize === 'K58';
    const isThermalK80 = paperSize === 'K80';
    const height = isThermalSmall ? 28 : isThermalK80 ? 32 : paperSize === 'A5' ? 28 : 34;
    const fontSize = isThermalSmall ? 8 : isThermalK80 ? 9 : 8.5;
    const barWidth = isThermalSmall ? 1.4 : isThermalK80 ? 1.6 : 1.6;

    return generateBarcodeSVG(docCode, {
      height,
      fontSize,
      barWidth,
      showText: true,
    });
  }, [shouldShowBarcode, docCode, paperSize]);

  // ERP Smart QR Vector SVG for instant local 0ms rendering
  const erpQrSvgHtml = useMemo(() => {
    if (!shouldShowQr || !docCode) return '';
    const payload = `GP-ERP://doc?type=${encodeURIComponent(docType)}&code=${encodeURIComponent(
      docCode
    )}&cust=${encodeURIComponent(customerName)}&total=${totalAmount || 0}&date=${encodeURIComponent(date)}`;
    const size = paperSize === 'K58' ? 75 : paperSize === 'K80' ? 85 : paperSize === 'A5' ? 42 : 48;
    return generateQRCodeSVG(payload, { size, margin: 1 });
  }, [shouldShowQr, docCode, docType, customerName, totalAmount, date, paperSize]);

  const isThermal = paperSize === 'K58' || paperSize === 'K80';
  const showDocQrCode = shouldShowQr;
  const showPaymentQr = Boolean(vietQrUrl && (qrPayloadMode === 'vietqr' || qrPayloadMode === 'both'));

  if (!shouldShowBarcode && !showDocQrCode && !showPaymentQr) return null;

  if (isThermal) {
    return (
      <div className={`w-full flex flex-col items-center justify-center gap-2 text-center my-2 ${className}`}>
        {/* Barcode 1D */}
        {shouldShowBarcode && barcodeSvgHtml && (
          <div
            className={`w-full flex justify-center overflow-hidden ${
              paperSize === 'K58' ? 'max-w-[200px]' : 'max-w-[240px]'
            }`}
            dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
          />
        )}

        {/* QR Codes Section */}
        <div className="flex items-center justify-center gap-3">
          {/* ERP Smart QR Tra Cứu */}
          {showDocQrCode && erpQrSvgHtml && (
            <div className="p-1 bg-white border border-slate-300 rounded shadow-xs flex flex-col items-center">
              <div
                className={`${paperSize === 'K58' ? 'w-16 h-16' : 'w-20 h-20'} flex items-center justify-center`}
                dangerouslySetInnerHTML={{ __html: erpQrSvgHtml }}
              />
              <p className="text-[6.5pt] text-slate-800 font-sans mt-0.5 font-medium">
                {qrLabel || 'Quét mã tra cứu'}
              </p>
            </div>
          )}

          {/* VietQR Thanh Toán */}
          {showPaymentQr && vietQrUrl && (
            <div className="p-1 bg-white border border-slate-300 rounded shadow-xs flex flex-col items-center">
              <img
                src={vietQrUrl}
                loading="eager"
                alt={`VietQR ${docCode}`}
                className={`${paperSize === 'K58' ? 'w-16 h-16' : 'w-20 h-20'} object-contain`}
              />
              <p className="text-[6.5pt] font-bold text-slate-700 mt-0.5">VietQR Thanh Toán</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Warranty Footer Variant (Khối Tra Cứu Chân Trang theo đúng Ảnh 2)
  if (variant === 'warranty_footer') {
    return (
      <div className={`w-full pt-2 mt-1 border-t border-dashed border-gray-400 select-none ${className}`}>
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left Text Box */}
          <div className="flex-1 pr-2 text-left">
            <div className="text-[8pt] sm:text-[8.5pt] font-black uppercase text-gray-900 tracking-tight">
              {customLookupTitle || `TRA CỨU & KÍCH HOẠT BẢO HÀNH ĐIỆN TỬ ${brandName}`}
            </div>
            <div className="text-[7pt] sm:text-[7.5pt] text-gray-600 leading-snug mt-0.5">
              {customLookupDesc ||
                'Quét mã QR bằng Camera Zalo/Điện thoại hoặc súng quét mã vạch để xem chi tiết lịch sử, tình trạng chứng từ & vòng đời sản phẩm.'}
            </div>
            <div className="text-[7pt] sm:text-[7.5pt] text-gray-800 font-medium mt-1">
              <span>Mã tra cứu: </span>
              <strong className="font-mono text-black font-bold">{docCode}</strong>
              <span> | Đơn: </span>
              <span className="font-mono">{orderCode || docCode}</span>
            </div>
          </div>

          {/* Right: Barcode + QR Tra Cứu ERP */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            {/* Barcode 1D */}
            {shouldShowBarcode && barcodeSvgHtml && (
              <div className="flex flex-col items-center">
                <div
                  className="max-w-[180px] sm:max-w-[210px] max-h-[44px] overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
                />
              </div>
            )}

            {/* QR Code 2D Tra Cứu ERP */}
            {showDocQrCode && erpQrSvgHtml && (
              <div className="flex flex-col items-center justify-center pl-1">
                <div
                  className="flex items-center justify-center p-0.5 bg-white border border-gray-300 rounded shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: erpQrSvgHtml }}
                />
                <span className="text-[6pt] sm:text-[6.5pt] text-gray-800 font-sans font-bold mt-0.5 whitespace-nowrap">
                  {qrLabel || 'QR Tra Cứu ERP'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Header / Inline Office Layout (Giữ nguyên vị trí đầu trang)
  return (
    <div
      className={`flex ${layout === 'column' ? 'flex-col items-center' : 'items-center'} ${
        align === 'between'
          ? 'justify-between'
          : align === 'left'
          ? 'justify-start'
          : align === 'right'
          ? 'justify-end'
          : 'justify-center'
      } gap-2.5 sm:gap-3 my-0.5 select-none ${className}`}
    >
      {/* Left / Main Group: Barcode 1D + Mã QR Tra Cứu (Quét mã tra cứu) */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Barcode 1D */}
        {shouldShowBarcode && barcodeSvgHtml && (
          <div className="flex flex-col items-center justify-center">
            <div
              className="max-w-[190px] sm:max-w-[220px] max-h-[48px] overflow-hidden"
              dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
            />
          </div>
        )}

        {/* QR Code 2D Tra Cứu */}
        {showDocQrCode && erpQrSvgHtml && (
          <div className="flex flex-col items-center justify-center pl-1">
            <div
              className="flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: erpQrSvgHtml }}
            />
            <span className="text-[6.5pt] text-slate-800 font-sans mt-0.5 font-medium whitespace-nowrap">
              {qrLabel || 'Quét mã tra cứu'}
            </span>
          </div>
        )}
      </div>

      {/* Right / VietQR Payment Box (if enabled) */}
      {showPaymentQr && vietQrUrl && (
        <div className="flex items-center">
          <div className="p-1 bg-white border border-slate-300 rounded flex flex-col items-center shadow-xs">
            <img src={vietQrUrl} loading="eager" alt="VietQR" className="w-16 h-16 object-contain" />
            <span className="text-[6.5pt] font-bold text-slate-700">VietQR Thanh Toán</span>
          </div>
        </div>
      )}
    </div>
  );
};
