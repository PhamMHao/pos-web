import React, { useState } from 'react';
import { Printer, X, Check, QrCode, FileText } from 'lucide-react';
import { Order, StoreSettings, PaperSize } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { PrinterSelectDropdown } from '../common/PrinterSelectDropdown';
import { SlipBarcodeQR } from '../common/SlipBarcodeQR';
import { getEffectivePrintConfig } from '../../utils/printTemplates';

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
  const effectiveConfig = getEffectivePrintConfig(settings, 'sales_invoice');
  const [paperSize, setPaperSize] = useState<'K80' | 'K58'>(
    settings.defaultPrintPaperSize === 'K58' ? 'K58' : 'K80'
  );
  const [codePlacement, setCodePlacement] = useState<'header' | 'footer' | 'both' | 'none'>(
    effectiveConfig.codePlacement || 'header'
  );

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
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
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400 font-medium">Khổ:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as 'K80' | 'K58')}
                className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
              >
                <option value="K80">K80 (80mm)</option>
                <option value="K58">K58 (58mm)</option>
              </select>
            </div>

            {/* Code Placement selector */}
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400 font-medium">Mã:</span>
              <select
                value={codePlacement}
                onChange={(e) => setCodePlacement(e.target.value as 'header' | 'footer' | 'both' | 'none')}
                className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
              >
                <option value="header">Đầu trang</option>
                <option value="footer">Cuối trang</option>
                <option value="both">Cả 2 vị trí</option>
                <option value="none">Không in mã</option>
              </select>
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
                {effectiveConfig.customTitle || 'Phiếu Thanh Toán (Retail Bill)'}
              </span>
            </div>
          </div>

          {/* Top Barcode 1D & QR (when header or both) */}
          {(codePlacement === 'header' || codePlacement === 'both') && (
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
                showQr={true}
                renderMode="both"
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
                      <span>{item.quantity} {item.unit || 'Cái'} x {formatVND(item.unitPrice)}</span>
                      <span className="font-bold font-mono text-slate-900">{formatVND(item.total)}</span>
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
                        {item.serials && item.serials.length > 0 && (
                          <div className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded mt-0.5 block">
                            S/N: {item.serials.join(', ')}
                          </div>
                        )}
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
                      <td className="py-1.5 text-right text-slate-600 font-mono">
                        {formatVND(item.unitPrice)}
                      </td>
                      <td className="py-1.5 text-right font-semibold text-slate-900 font-mono">
                        {formatVND(item.total)}
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
          {(codePlacement === 'footer' || codePlacement === 'both') && (
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
                showBarcode={true}
                showQr={true}
                renderMode="both"
              />
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center pt-1 space-y-1 text-[10px] text-slate-500">
            {effectiveConfig.notes && effectiveConfig.notes.length > 0 ? (
              <div className="space-y-0.5 text-left text-[9px] text-slate-600 border-t border-dotted border-slate-300 pt-1.5 px-1">
                {effectiveConfig.notes.map((n, i) => (
                  <p key={i}>{n}</p>
                ))}
              </div>
            ) : (
              <>
                <p className="font-semibold text-slate-700">{settings.receiptHeaderNote}</p>
                <p>{settings.receiptFooterNote}</p>
              </>
            )}
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
