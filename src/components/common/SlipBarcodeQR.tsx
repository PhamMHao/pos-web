import React, { useMemo } from 'react';
import { generateBarcodeSVG, getQRCodeUrl } from '../../utils/barcodeGenerator';
import { PaperSize } from '../../types';

export interface SlipBarcodeQRProps {
  docCode: string;
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
}

export const SlipBarcodeQR: React.FC<SlipBarcodeQRProps> = ({
  docCode,
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
}) => {
  const shouldShowBarcode = showBarcode && renderMode !== 'qr_only';
  const shouldShowQr = showQr && renderMode !== 'barcode_only';
  // Generate Pure Vector SVG Barcode
  const barcodeSvgHtml = useMemo(() => {
    if (!shouldShowBarcode || !docCode) return '';
    const isThermalSmall = paperSize === 'K58';
    const isThermalK80 = paperSize === 'K80';
    const height = isThermalSmall ? 28 : isThermalK80 ? 32 : paperSize === 'A5' ? 34 : 40;
    const fontSize = isThermalSmall ? 8 : isThermalK80 ? 9 : 10;
    const barWidth = isThermalSmall ? 1.4 : isThermalK80 ? 1.6 : 2;

    return generateBarcodeSVG(docCode, {
      height,
      fontSize,
      barWidth,
      showText: true,
    });
  }, [shouldShowBarcode, docCode, paperSize]);

  // ERP Smart QR Payload for instant lookup in F7 center
  const erpQrUrl = useMemo(() => {
    if (!shouldShowQr || !docCode) return '';
    const payload = `GP-ERP://doc?type=${encodeURIComponent(docType)}&code=${encodeURIComponent(
      docCode
    )}&cust=${encodeURIComponent(customerName)}&total=${totalAmount || 0}&date=${encodeURIComponent(date)}`;
    const size = paperSize === 'K58' ? 90 : paperSize === 'K80' ? 110 : 130;
    return getQRCodeUrl(payload, size);
  }, [shouldShowQr, docCode, docType, customerName, totalAmount, date, paperSize]);

  if (!shouldShowBarcode && !shouldShowQr) return null;

  const isThermal = paperSize === 'K58' || paperSize === 'K80';

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

        {/* QR Code 2D */}
        {shouldShowQr && (
          <div className="flex flex-col items-center justify-center">
            {qrPayloadMode === 'vietqr' && vietQrUrl ? (
              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                <img
                  src={vietQrUrl}
                  alt={`VietQR ${docCode}`}
                  className={`${paperSize === 'K58' ? 'w-24 h-24' : 'w-28 h-28'} object-contain`}
                />
                <p className="text-[7pt] font-bold text-slate-700 mt-0.5">Quét thanh toán VietQR</p>
              </div>
            ) : (
              <div className="p-1 bg-white border border-slate-300 rounded shadow-xs">
                <img
                  src={erpQrUrl}
                  alt={`QR ERP ${docCode}`}
                  className={`${paperSize === 'K58' ? 'w-20 h-20' : 'w-24 h-24'} object-contain`}
                />
                <p className="text-[7pt] font-mono text-slate-600 mt-0.5">Quét tra cứu phiếu (F7)</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // A4 / A5 Office Layout
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
      } gap-4 my-2 select-none ${className}`}
    >
      {/* Barcode 1D */}
      {shouldShowBarcode && barcodeSvgHtml && (
        <div className="flex flex-col items-center">
          <div
            className="max-w-[220px] max-h-[50px] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: barcodeSvgHtml }}
          />
        </div>
      )}

      {/* QR Code 2D */}
      {shouldShowQr && (
        <div className="flex items-center gap-2">
          {qrPayloadMode === 'vietqr' && vietQrUrl ? (
            <div className="p-1 bg-white border border-slate-300 rounded flex flex-col items-center">
              <img src={vietQrUrl} alt="VietQR" className="w-20 h-20 object-contain" />
              <span className="text-[7pt] font-bold text-slate-700">VietQR Thanh Toán</span>
            </div>
          ) : (
            <div className="p-1 bg-white border border-slate-300 rounded flex flex-col items-center">
              <img src={erpQrUrl} alt="QR Tra Cứu" className="w-18 h-18 object-contain" />
              <span className="text-[7pt] text-slate-600 font-mono">Quét Tra Cứu (F7)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
