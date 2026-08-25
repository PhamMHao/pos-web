import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  Truck,
  FileText,
  QrCode,
} from 'lucide-react';
import { PurchaseOrder, StoreSettings } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { PrinterSelectDropdown } from '../common/PrinterSelectDropdown';
import { SlipBarcodeQR } from '../common/SlipBarcodeQR';

interface PurchaseOrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder;
  settings?: StoreSettings;
}

export const PurchaseOrderPrintModal: React.FC<PurchaseOrderPrintModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [codePlacement, setCodePlacement] = useState<'header' | 'footer' | 'both'>('header');

  if (!isOpen || !order) return null;

  const companyName = settings?.storeName || 'CÔNG TY TNHH CÔNG NGHỆ & TỰ ĐỘNG HÓA GIA PHÚC';
  const companyAddress = settings?.address || '123 Đại Lộ Doanh Nghiệp, TP. Hồ Chí Minh';
  const companyPhone = settings?.phone || '0901.888.999';
  const companyTaxCode = settings?.taxCode || '0318999888';

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const qrUrl = generateVietQRUrl({
    bankCode: 'MB',
    accountNo: '0901888999',
    accountName: companyName,
    amount: order.totalAmount,
    description: order.code,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[96vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="p-3.5 px-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-extrabold text-white flex items-center space-x-2">
                <span>In Phiếu Đơn Đặt Hàng Mua (Purchase Order)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {order.code}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Khổ giấy chuẩn A4 chuẩn nghiệp vụ mua sắm doanh nghiệp</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Code Placement toggle */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCodePlacement('header')}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  codePlacement === 'header' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Đầu trang
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('footer')}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  codePlacement === 'footer' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cuối trang
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('both')}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                  codePlacement === 'both' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cả 2
              </button>
            </div>

            <PrinterSelectDropdown />
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay (Ctrl+P)</span>
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

        {/* Sheet Preview Container */}
        <div className="flex-1 bg-slate-950 p-4 md:p-8 overflow-auto flex justify-center items-start print:p-0 print:bg-white">
          <div
            ref={printableRef}
            id="printable-area"
            className="printable-document bg-white text-slate-900 font-serif p-8 md:p-12 shadow-2xl rounded-sm max-w-4xl w-full select-text min-h-[1050px] flex flex-col justify-between text-xs"
            style={{ fontFamily: '"Tinos", "Noto Serif", "Times New Roman", Times, serif' }}
          >
            {/* Header */}
            <div>
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <GiaPhucLogo logoUrl={settings?.logoUrl} className="w-14 h-14 shrink-0" isPrint={true} size="sm" />
                  <div>
                    <h1 className="text-base font-bold text-slate-950 uppercase tracking-normal">{companyName}</h1>
                    <p className="text-[11px] text-slate-600 mt-0.5">📍 Địa chỉ: {companyAddress}</p>
                    <p className="text-[11px] text-slate-600">☎️ Hotline: <strong>{companyPhone}</strong> | MST: <strong>{companyTaxCode}</strong></p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono font-bold text-xs">
                    MÃ PO: {order.code}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">Ngày lập: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                  <p className="text-[10px] text-slate-500">Giao trước: {new Date(order.expectedDeliveryDate).toLocaleDateString('vi-VN')}</p>
                  {(codePlacement === 'header' || codePlacement === 'both') && (
                    <div className="pt-1">
                      <SlipBarcodeQR
                        docCode={order.code}
                        docType="sales_order"
                        date={order.orderDate}
                        customerName={order.supplierName}
                        totalAmount={order.totalAmount}
                        paperSize="A4"
                        showBarcode={true}
                        showQr={true}
                        renderMode="both"
                        align="right"
                        layout="row"
                        className="my-0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-4">
                <h2 className="text-xl font-bold uppercase text-slate-950 tracking-normal">
                  ĐƠN ĐẶT HÀNG MUA (PURCHASE ORDER)
                </h2>
                <p className="text-[11px] text-slate-500 italic mt-0.5">Kính gửi: Đại diện Nhà Cung Cấp / Đối Tác Phân Phối</p>
              </div>

              {/* Two Parties Box */}
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 my-4 text-[11px]">
                <div>
                  <p className="font-bold uppercase text-slate-950 mb-1">BÊN MUA HÀNG (BUYER):</p>
                  <p className="font-bold text-slate-800">{companyName}</p>
                  <p className="text-slate-600">📍 Kho nhận: <strong>{order.warehouseName}</strong></p>
                  <p className="text-slate-600">☎️ Điện thoại: {companyPhone}</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-slate-950 mb-1">BÊN BÁN / NHÀ CUNG CẤP (SELLER):</p>
                  <p className="font-bold text-slate-800">{order.supplierName}</p>
                  <p className="text-slate-600">📍 Trụ sở: {order.supplierAddress}</p>
                  <p className="text-slate-600">☎️ Hotline/Zalo: <strong>{order.supplierPhone}</strong> | MST: {order.supplierTaxCode || 'N/A'}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border border-slate-300 my-4 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 uppercase font-bold text-[10px]">
                    <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                    <th className="border border-slate-300 p-2">Tên Thiết Bị / Vật Tư / Linh Kiện</th>
                    <th className="border border-slate-300 p-2 text-center w-20">Mã SKU</th>
                    <th className="border border-slate-300 p-2 text-center w-14">ĐVT</th>
                    <th className="border border-slate-300 p-2 text-right w-16">Số Lượng</th>
                    <th className="border border-slate-300 p-2 text-right w-24">Đơn Giá</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Thành Tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-900">{it.productName}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-slate-600">{it.sku}</td>
                      <td className="border border-slate-300 p-2 text-center text-slate-600">{it.unit}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">{it.quantity}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">{formatVND(it.unitPrice)}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-950">{formatVND(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Calculation */}
              <div className="flex justify-end my-3">
                <div className="w-72 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-mono font-semibold">{formatVND(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Thuế VAT ({order.vatRate}%):</span>
                    <span className="font-mono">+{formatVND(order.vatAmount)}</span>
                  </div>
                  {order.shippingFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Cước vận chuyển:</span>
                      <span className="font-mono">+{formatVND(order.shippingFee)}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Chiết khấu đơn mua:</span>
                      <span className="font-mono text-rose-600">-{formatVND(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-400 flex justify-between font-bold text-sm text-slate-950">
                    <span>TỔNG THANH TOÁN:</span>
                    <span className="font-mono text-blue-900 font-bold">{formatVND(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] italic text-slate-700 mb-4">
                Số tiền bằng chữ: <strong>{numberToVietnameseWords(order.totalAmount)}</strong>
              </p>

              {/* Barcode Code128 & ERP QR */}
              {(codePlacement === 'footer' || codePlacement === 'both') && (
                <div className="py-2 border-t border-dotted border-slate-300">
                  <SlipBarcodeQR
                    docCode={order.code}
                    docType="sales_order"
                    date={order.orderDate}
                    customerName={order.supplierName}
                    totalAmount={order.totalAmount}
                    paperSize="A4"
                    showBarcode={true}
                    showQr={true}
                    renderMode="both"
                    align="between"
                    layout="row"
                  />
                </div>
              )}

              {/* Terms */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 space-y-1 mt-2">
                <p className="font-bold uppercase text-slate-900">ĐIỀU KHOẢN GIAO NHẬN & BẢO HÀNH:</p>
                <p>1. Hàng hóa cung cấp phải mới 100%, nguyên đai nguyên kiện, đúng thông số kỹ thuật và có đầy đủ CO/CQ từ nhà sản xuất.</p>
                <p>2. Thời hạn thanh toán: Áp dụng phương thức <strong>{order.paymentMethod === 'debt_30d' ? 'Công nợ gối đầu 30 ngày' : 'Chuyển khoản ngay sau khi nghiệm thu'}</strong>.</p>
                <p>3. Ghi chú đơn hàng: {order.notes || 'Giao hàng đầy đủ hóa đơn GTGT kèm phiếu xuất kho.'}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t border-slate-300 mt-8">
              <div className="grid grid-cols-3 gap-4 text-center text-[11px]">
                <div>
                  <p className="font-bold uppercase text-slate-900">NGƯỜI LẬP ĐƠN (PO)</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
                  <div className="h-14"></div>
                  <p className="font-semibold text-slate-800">Phòng Mua Hàng & Cung Ứng</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-slate-900">KẾ TOÁN TRƯỞNG</p>
                  <p className="text-[10px] text-slate-500 italic">(Duyệt ngân sách & công nợ)</p>
                  <div className="h-14"></div>
                  <p className="font-semibold text-slate-800">Phòng Tài Chính Kế Toán</p>
                </div>
                <div>
                  <p className="font-bold uppercase text-slate-900">ĐẠI DIỆN NHÀ CUNG CẤP</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký, đóng dấu xác nhận đơn)</p>
                  <div className="h-14"></div>
                  <p className="font-semibold text-slate-800">{order.supplierName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
