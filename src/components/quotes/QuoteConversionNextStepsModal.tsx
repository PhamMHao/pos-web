import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  FileText,
  ShoppingCart,
  Truck,
  FileCheck2,
  X,
  ArrowRight,
  ShieldCheck,
  Building2,
  Phone,
  Sparkles,
  QrCode,
  DollarSign,
} from 'lucide-react';
import { PriceQuote, StoreSettings, DigitalSignatureMetadata } from '../../types';
import { formatVND } from '../../utils/currency';
import { PriceQuoteDocumentTemplate } from './PriceQuoteDocumentTemplate';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

export interface QuoteConversionNextStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: PriceQuote | null;
  settings?: StoreSettings | null;
  signature?: DigitalSignatureMetadata | null;
  onNavigateTab?: (tab: string) => void;
}

export const QuoteConversionNextStepsModal: React.FC<QuoteConversionNextStepsModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
  signature,
  onNavigateTab,
}) => {
  const [showQuotePrintModal, setShowQuotePrintModal] = useState(false);
  const [showOrderInvoicePrintModal, setShowOrderInvoicePrintModal] = useState(false);
  const [orderPrintDocType, setOrderPrintDocType] = useState<'sales_invoice' | 'delivery_note' | 'einvoice_vat'>('sales_invoice');

  if (!isOpen || !quote) return null;

  const orderCode = quote.convertedOrderCode || quote.orderCode || `HD-BG-${quote.code.replace('BG-', '')}`;
  const effectiveSignature = signature || quote.digitalSignature;

  const handlePrintQuoteDoc = () => {
    setShowQuotePrintModal(true);
  };

  const handlePrintOrderDoc = (type: 'sales_invoice' | 'delivery_note' | 'einvoice_vat' = 'sales_invoice') => {
    setOrderPrintDocType(type);
    setShowOrderInvoicePrintModal(true);
  };

  const handleGoToPos = () => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab('pos');
    }
  };

  const handleGoToInventory = () => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab('inventory');
    }
  };

  const handleGoToEInvoice = () => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab('einvoice');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95">
          {/* Top Banner Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 flex items-start justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Chuyển Đổi Thành Công</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Đã Tạo Phiếu Bán Hàng POS Từ Báo Giá
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dữ liệu sản phẩm, đơn giá, chiết khấu và khách hàng đã được kế thừa trọn vẹn
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Summary Card */}
          <div className="p-5 bg-slate-950/60 border-b border-slate-800 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mã Báo Giá:</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{quote.code}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mã Đơn Hàng POS:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{orderCode}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Khách Hàng:</span>
                <span className="font-bold text-white truncate block" title={quote.customerCompany || quote.customerName}>
                  {quote.customerCompany || quote.customerName}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tổng Thanh Toán:</span>
                <span className="font-mono font-black text-amber-400 text-sm">{formatVND(quote.finalTotal)}</span>
              </div>
            </div>

            {effectiveSignature && (
              <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Chữ ký số hợp lệ:</strong> {effectiveSignature.signerName} ({effectiveSignature.providerName}) • TSA: {new Date(effectiveSignature.signedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  {effectiveSignature.signatureFormat}
                </span>
              </div>
            )}
          </div>

          {/* Next Steps Action Buttons Grid */}
          <div className="p-6 space-y-3 flex-1 overflow-y-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Lựa Chọn Các Bước Tiếp Theo (Next Steps):
            </div>

            {/* Action 1: In Báo Giá Thương Mại B2B (Đã Ký) */}
            <div
              onClick={handlePrintQuoteDoc}
              className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center space-x-1.5">
                    <span>1. In Báo Giá Thương Mại Đã Ký Duyệt (B2B)</span>
                    <span className="px-2 py-0.2 text-[10px] rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Chuẩn B2B
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mở mẫu biểu Báo Giá Thương Mại chi tiết pháp lý, con dấu điện tử CA, điều khoản và VietQR
                  </p>
                </div>
              </div>
              <Printer className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>

            {/* Action 2: In Hóa Đơn / Phiếu Bán Hàng POS */}
            <div
              onClick={() => handlePrintOrderDoc('sales_invoice')}
              className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center space-x-1.5">
                    <span>2. In Hóa Đơn / Phiếu Bán Hàng POS ({orderCode})</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mở mẫu in Hóa đơn bán hàng khổ A4/A5 hoặc bill nhiệt K80 để giao khách hàng
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>

            {/* Action 3: Chuyển Sang Màn Hình Bán Hàng POS */}
            <div
              onClick={handleGoToPos}
              className="p-3.5 bg-gradient-to-r from-blue-900/40 via-slate-800 to-indigo-900/40 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-500/40 hover:border-blue-400 rounded-2xl flex items-center justify-between cursor-pointer transition-all group shadow-md"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center space-x-1.5">
                    <span>3. Chuyển Sang Màn Hình Bán Hàng POS (F2)</span>
                    <span className="px-2 py-0.2 text-[10px] rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 font-mono">
                      Khuyên dùng
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Nạp giỏ hàng ngay lập tức để thu ngân quẹt Serial/IMEI, nhận thanh toán thẻ hoặc VietQR
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Action 4: Tạo Phiếu Xuất Kho Giao Hàng (PXK) */}
            <div
              onClick={handleGoToInventory}
              className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    4. Tạo Phiếu Xuất Kho Giao Hàng (PXK)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Chuyển sang phân hệ Quản Lý Kho Hàng để kiểm kê tồn kho và in Phiếu Xuất Kho (Mẫu 02-VT)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>

            {/* Action 5: Xuất Hóa Đơn Điện Tử VAT TT78 */}
            <div
              onClick={handleGoToEInvoice}
              className="p-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    5. Xuất Hóa Đơn Điện Tử VAT TT78
                  </h4>
                  <p className="text-xs text-slate-400">
                    Lập hóa đơn điện tử GTGT có mã của Cơ quan Thuế (Nghị định 123/2020/NĐ-CP)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>

          {/* Footer Close */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Modal In Báo Giá Thương Mại B2B */}
      {showQuotePrintModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[96vh] overflow-hidden flex flex-col shadow-2xl print:border-none print:shadow-none print:max-w-none print:w-full print:bg-white print:rounded-none">
            <div className="p-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white text-sm">
                  In Báo Giá Thương Mại Chuẩn B2B - {quote.code}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In (Ctrl+P)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuotePrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-950/80 print:bg-white print:p-0">
              <PriceQuoteDocumentTemplate
                quote={quote}
                settings={settings}
                signature={effectiveSignature}
                paperSize="A4"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal In Hóa Đơn Bán Hàng POS */}
      {showOrderInvoicePrintModal && (
        <PrintInvoiceModal
          isOpen={showOrderInvoicePrintModal}
          onClose={() => setShowOrderInvoicePrintModal(false)}
          initialDocType={orderPrintDocType}
          settings={settings as any}
          order={{
            id: quote.id,
            code: orderCode,
            items: quote.items.map((i) => ({
              productId: (i as any).productId || i.sku,
              productName: i.productName,
              sku: i.sku,
              barcode: i.sku,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.total,
              unit: i.unit,
            })),
            totalAmount: quote.totalAmount,
            taxAmount: 0,
            discountAmount: (quote.totalAmount * (quote.discountPercent || 0)) / 100,
            finalAmount: quote.finalTotal,
            paymentMethod: 'cash',
            createdAt: new Date().toISOString(),
            status: 'completed',
            customerName: quote.customerName,
            customerPhone: quote.customerPhone,
            customerCompany: quote.customerCompany,
            notes: quote.notes || `Chuyển từ Báo giá ${quote.code}`,
          } as any}
        />
      )}
    </>
  );
};
