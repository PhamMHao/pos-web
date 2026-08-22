import React, { useState } from 'react';
import { Printer, X, Check, QrCode, FileText } from 'lucide-react';
import { Order, StoreSettings, PaperSize } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { PrinterSelectDropdown } from '../common/PrinterSelectDropdown';
import { SlipBarcodeQR } from '../common/SlipBarcodeQR';

interface ReceiptModalProps {
  order: Order;
  settings: StoreSettings;
  onClose: () => void;
  onSwitchToA4?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings,
  onClose,
  onSwitchToA4,
}) => {
  const [paperSize, setPaperSize] = useState<'K80' | 'K58'>(
    settings.defaultPrintPaperSize === 'K58' ? 'K58' : 'K80'
  );
  const [codePlacement, setCodePlacement] = useState<'split' | 'footer' | 'header'>('split');

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const qrUrl = generateVietQRUrl({
    bankCode: settings.bankCode,
    accountNo: settings.bankAccount,
    accountName: settings.bankAccountName,
    amount: order.total,
    description: `TT ${order.code}`,
  });

  const dynamicPageStyle = `
    @page {
      size: ${paperSize === 'K58' ? '58mm auto' : '80mm auto'};
      margin: 0;
    }
  `;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: dynamicPageStyle }} />
      <div className={`bg-white text-slate-900 rounded-2xl ${paperSize === 'K58' ? 'max-w-sm' : 'max-w-md'} w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95`}>
        {/* Header Action Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-sm">Hóa Đơn Thanh Toán ({paperSize})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Paper Size selector (K80 / K58) */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPaperSize('K80')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  paperSize === 'K80' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                K80 (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('K58')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  paperSize === 'K58' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                K58 (58mm)
              </button>
            </div>
            
            {/* Code Placement toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setCodePlacement('split')}
                title="Mã vạch trên đầu, QR ở chân trang"
                className={`px-2 py-1 rounded-md font-bold text-[10px] transition-all ${
                  codePlacement === 'split' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mã trên/QR dưới
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('footer')}
                title="Toàn bộ mã ở chân trang"
                className={`px-2 py-1 rounded-md font-bold text-[10px] transition-all ${
                  codePlacement === 'footer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chân trang
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('header')}
                title="Toàn bộ mã ở đầu phiếu"
                className={`px-2 py-1 rounded-md font-bold text-[10px] transition-all ${
                  codePlacement === 'header' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Đầu phiếu
              </button>
            </div>

            <PrinterSelectDropdown
              onSelectPrinter={(p) => {
                if (p.defaultPaperSize === 'K58') setPaperSize('K58');
                else if (p.defaultPaperSize === 'K80') setPaperSize('K80');
                else if ((p.defaultPaperSize === 'A4' || p.defaultPaperSize === 'A5') && onSwitchToA4) {
                  onSwitchToA4();
                }
              }}
            />
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 text-xs font-sans receipt-print-area max-h-[80vh] overflow-y-auto">
          {/* Store Info */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
            <div className="flex justify-center pb-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  className="h-12 max-w-[120px] object-contain"
                />
              ) : (
                <GiaPhucLogo size="xs" isPrint={true} />
              )}
            </div>
            <h2 className="text-base font-black tracking-tight uppercase text-slate-950">
              {settings.brandName || settings.storeName}
            </h2>
            {settings.companyLegalName && (
              <p className="text-[10px] font-bold text-slate-700 uppercase">{settings.companyLegalName}</p>
            )}
            <p className="text-[11px] text-slate-600">{settings.address}</p>
            <p className="text-[11px] text-slate-600">Hotline: {settings.phone}</p>
            {settings.taxCode && (
              <p className="text-[10px] text-slate-500">MST: {settings.taxCode}</p>
            )}
            <div className="pt-2">
              <span className="inline-block px-3 py-0.5 text-xs font-bold uppercase tracking-wider bg-slate-100 rounded text-slate-800">
                Phiếu Thanh Toán (Retail Bill)
              </span>
            </div>
          </div>

          {/* Top Barcode 1D (when split or header) */}
          {(codePlacement === 'split' || codePlacement === 'header') && (
            <div className="py-2 border-b border-dashed border-slate-300 flex justify-center">
              <SlipBarcodeQR
                docCode={order.code}
                docType="retail_receipt"
                customerName={order.customer?.name}
                totalAmount={order.total}
                date={new Date(order.createdAt).toISOString()}
                paperSize={paperSize}
                vietQrUrl={qrUrl}
                qrPayloadMode="vietqr"
                showBarcode={true}
                showQr={codePlacement === 'header'}
                renderMode={codePlacement === 'split' ? 'barcode_only' : 'both'}
              />
            </div>
          )}

          {/* Bill Metadata */}
          <div className="py-3 space-y-1 text-[11px] border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-slate-900">{order.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian:</span>
              <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kênh bán:</span>
              <span className="font-medium text-slate-800">{order.channel}</span>
            </div>
            {order.customer && (
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-semibold text-slate-900">
                  {order.customer.name} ({order.customer.phone})
                </span>
              </div>
            )}
          </div>

          {/* Items Section: 2-Line Layout for K58 or 5-Col Table for K80 */}
          <div className="py-3 border-b border-dashed border-slate-300">
            {paperSize === 'K58' ? (
              <div className="space-y-1.5 text-[8pt]">
                <div className="text-[7pt] font-bold text-slate-500 uppercase border-b border-slate-300 pb-0.5 flex justify-between">
                  <span>Mặt hàng & SL</span>
                  <span>Thành tiền</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="border-b border-dotted border-slate-200 pb-1">
                    <div className="font-bold text-slate-900 leading-tight">
                      {idx + 1}. {item.productName}
                    </div>
                    <div className="flex justify-between items-center text-[7.5pt] text-slate-600 mt-0.5">
                      <span>{item.quantity} {item.unit || 'Cái'} x {item.unitPrice.toLocaleString('vi-VN')}</span>
                      <span className="font-bold font-mono text-slate-900">{item.total.toLocaleString('vi-VN')}</span>
                    </div>
                    {item.discountPercent > 0 && (
                      <div className="text-[7pt] text-rose-600 font-medium">Giảm {item.discountPercent}%</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 pb-1">
                    <th className="font-semibold pb-1">Sản phẩm</th>
                    <th className="font-semibold text-center pb-1">ĐVT</th>
                    <th className="font-semibold text-center pb-1">SL</th>
                    <th className="font-semibold text-right pb-1">Đơn giá</th>
                    <th className="font-semibold text-right pb-1">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1.5 pr-2">
                        <div className="font-medium text-slate-900 leading-tight">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.sku}
                        </div>
                        {item.discountPercent > 0 && (
                          <span className="text-[9px] text-rose-600 font-medium">
                            (Giảm {item.discountPercent}%)
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 text-center text-slate-600 font-medium">
                        {item.unit || 'Cái'}
                      </td>
                      <td className="py-1.5 text-center font-semibold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-1.5 text-right text-slate-600">
                        {item.unitPrice.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-1.5 text-right font-semibold text-slate-900">
                        {item.total.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Calculation Breakdown */}
          <div className="py-3 space-y-1.5 text-[11px] border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-medium">{formatVND(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Chiết khấu / Giảm giá ({order.discountCode || 'Trực tiếp'}):</span>
                <span>-{formatVND(order.discountAmount)}</span>
              </div>
            )}

            {order.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Thuế VAT ({order.taxRate}%):</span>
                <span>+{formatVND(order.taxAmount)}</span>
              </div>
            )}

            {order.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <span>+{formatVND(order.shippingFee)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-200">
              <span>TỔNG CỘNG THANH TOÁN:</span>
              <span className="text-emerald-700 font-mono text-base">
                {formatVND(order.total)}
              </span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Hình thức thanh toán:</span>
              <span className="font-semibold uppercase text-slate-800">
                {order.paymentMethod === 'cash' && 'Tiền mặt'}
                {order.paymentMethod === 'transfer' && 'Chuyển khoản (VietQR)'}
                {order.paymentMethod === 'card' && 'Thẻ POS'}
                {order.paymentMethod === 'momo' && 'Ví MoMo / ZaloPay'}
                {order.paymentMethod === 'debt' && 'Ghi nợ'}
              </span>
            </div>
            {order.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Tiền khách đưa:</span>
                  <span>{formatVND(order.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tiền thối lại:</span>
                  <span className="font-semibold text-emerald-700">
                    {formatVND(order.changeAmount)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Barcode Code128 & VietQR payment code */}
          {(codePlacement === 'footer' || codePlacement === 'split') && (
            <div className="py-3 text-center">
              <SlipBarcodeQR
                docCode={order.code}
                docType="retail_receipt"
                customerName={order.customer?.name}
                totalAmount={order.total}
                date={new Date(order.createdAt).toISOString()}
                paperSize={paperSize}
                vietQrUrl={qrUrl}
                qrPayloadMode="vietqr"
                showBarcode={codePlacement === 'footer'}
                showQr={true}
                renderMode={codePlacement === 'split' ? 'qr_only' : 'both'}
              />
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center pt-1 space-y-1 text-[10px] text-slate-500">
            <p className="font-semibold text-slate-700">{settings.receiptHeaderNote}</p>
            <p>{settings.receiptFooterNote}</p>
            <p className="text-[9px] text-slate-400 pt-1">
              Gia Phúc ERP • Tra cứu chứng từ nhanh phím tắt F7
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          {onSwitchToA4 ? (
            <button
              onClick={onSwitchToA4}
              className="px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu A4/A5</span>
            </button>
          ) : <div />}
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Bill {paperSize}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
