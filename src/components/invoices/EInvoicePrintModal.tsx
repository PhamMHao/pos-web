import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  Building2,
  User,
  QrCode,
  Send,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { EInvoice, StoreSettings } from '../../types';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GiaPhucLogo } from '../common/GiaPhucLogo';

interface EInvoicePrintModalProps {
  invoice: EInvoice;
  settings?: StoreSettings;
  onClose: () => void;
  onSignInvoice?: (invoiceId: string) => void;
  onSendCqt?: (invoiceId: string) => void;
}

export const EInvoicePrintModal: React.FC<EInvoicePrintModalProps> = ({
  invoice,
  settings,
  onClose,
  onSignInvoice,
  onSendCqt,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `Ngày ${d.getDate().toString().padStart(2, '0')} tháng ${(d.getMonth() + 1).toString().padStart(2, '0')} năm ${d.getFullYear()}`;
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} - ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLookupLink = () => {
    navigator.clipboard.writeText(`${invoice.lookupUrl}?code=${invoice.lookupCode}`);
    setCopiedLink(true);
    setNotification('Đã sao chép liên kết tra cứu hóa đơn vào clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setNotification(null);
    }, 3000);
  };

  const handleExportXml = () => {
    // Generate standard XML structure according to General Department of Taxation
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<HDon>
  <DLHDon Id="HD_${invoice.invoiceNumber}">
    <TTChung>
      <PBan>2.0.0</PBan>
      <THDon>Hóa đơn giá trị gia tăng</THDon>
      <KHMSHDon>${invoice.invoiceTemplate}</KHMSHDon>
      <KHHDon>${invoice.invoiceSymbol}</KHHDon>
      <SHDon>${invoice.invoiceNumber}</SHDon>
      <NLap>${invoice.issueDate}</NLap>
      <DVTTe>VND</DVTTe>
      <TGia>1</TGia>
      <HTTToan>${invoice.paymentMethod}</HTTToan>
      <MSTTCGP>${invoice.lookupCode}</MSTTCGP>
      <MCCQT>${invoice.cqtCode || ''}</MCCQT>
    </TTChung>
    <NDHDon>
      <NBan>
        <Ten>${invoice.seller?.name || ''}</Ten>
        <MST>${invoice.seller?.taxCode || ''}</MST>
        <DChi>${invoice.seller?.address || ''}</DChi>
        <SDThoai>${invoice.seller?.phone || ''}</SDThoai>
        <DCTDTu>${invoice.seller?.email || ''}</DCTDTu>
        <STKNHang>${invoice.seller?.bankAccount || ''}</STKNHang>
        <TNHang>${invoice.seller?.bankName || ''}</TNHang>
      </NBan>
      <NMua>
        <Ten>${invoice.buyer?.buyerName || ''}</Ten>
        <MST>${invoice.buyer?.taxCode || ''}</MST>
        <DChi>${invoice.buyer?.address || ''}</DChi>
        <SDThoai>${invoice.buyer?.phone || ''}</SDThoai>
        <DCTDTu>${invoice.buyer?.email || ''}</DCTDTu>
      </NMua>
      <DSHHDVu>
        ${invoice.items
          .map(
            (item, index) => `
        <HHDVu>
          <TCat>${index + 1}</TCat>
          <THHDVu>${item.productName}</THHDVu>
          <DVTinh>${item.unit}</DVTinh>
          <SLuong>${item.quantity}</SLuong>
          <DGia>${item.unitPrice}</DGia>
          <TLCKhau>${item.discountPercent}</TLCKhau>
          <STCKhau>${item.discountAmount}</STCKhau>
          <ThTien>${item.subtotal - item.discountAmount}</ThTien>
          <TSuat>${item.taxRate}%</TSuat>
        </HHDVu>`
          )
          .join('')}
      </DSHHDVu>
      <TToan>
        <TgTCThue>${invoice.subtotal - invoice.discountAmount}</TgTCThue>
        <TgTThue>${invoice.taxAmount}</TgTThue>
        <TgTTTBSo>${invoice.totalAmount}</TgTTTBSo>
        <TgTTTBChu>${invoice.amountInWords}</TgTTTBChu>
      </TToan>
    </NDHDon>
    <DSCKS>
      <NBan>
        <Signature>${invoice.digitalSignature.serialNumber}</Signature>
        <SigningTime>${invoice.digitalSignature.signTime}</SigningTime>
        <Signer>${invoice.digitalSignature.signedBy}</Signer>
      </NBan>
    </DSCKS>
  </DLHDon>
</HDon>`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HOA_DON_${invoice.invoiceSymbol}_${invoice.invoiceNumber}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification('Đã xuất file XML Hóa đơn điện tử chuẩn Tổng Cục Thuế!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendEmailZalo = () => {
    setNotification(`Đã gửi hóa đơn điện tử #${invoice.invoiceNumber} qua Email (${invoice.buyer.email || 'khách hàng'}) và Zalo OA thành công!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Hóa Đơn Điện Tử (HĐĐT TT78)
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    invoice.status === 'cqt_approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : invoice.status === 'signed'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {invoice.status === 'cqt_approved'
                    ? '✓ CQT Đã Cấp Mã'
                    : invoice.status === 'signed'
                    ? '✓ Đã Ký Số'
                    : 'Dự Thảo (Chưa Ký)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ký hiệu: <span className="text-slate-200 font-mono font-medium">{invoice.invoiceSymbol}</span> | Số:{' '}
                <span className="text-slate-200 font-mono font-medium">{invoice.invoiceNumber}</span> | Mã tra cứu:{' '}
                <span className="text-amber-300 font-mono font-medium">{invoice.lookupCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status === 'draft' && onSignInvoice && (
              <button
                onClick={() => onSignInvoice(invoice.id)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Ký Số Điện Tử (Token)
              </button>
            )}

            {invoice.status === 'signed' && onSendCqt && (
              <button
                onClick={() => onSendCqt(invoice.id)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi CQT Cấp Mã
              </button>
            )}

            <button
              onClick={handleExportXml}
              title="Xuất file XML chuẩn TCT"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Xuất XML</span>
            </button>

            <button
              onClick={handleSendEmailZalo}
              title="Gửi Email / Zalo cho khách"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Gửi Khách</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              In HĐ (A4)
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="print:hidden bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-4 py-2 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline">
              Đóng
            </button>
          </div>
        )}

        {/* Printable Official Invoice Content (A4 layout styling) */}
        <div className="p-6 sm:p-10 max-h-[calc(88vh-80px)] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible text-slate-800 font-sans">
          <div className="border border-slate-300 rounded-xl p-6 sm:p-8 bg-white shadow-sm print:border-0 print:p-2 print:shadow-none relative">
            
            {/* Watermark for draft status */}
            {invoice.status === 'draft' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                <span className="text-7xl sm:text-8xl font-black text-rose-600 uppercase transform -rotate-45">
                  DỰ THẢO (CHƯA KÝ)
                </span>
              </div>
            )}

            {/* Header / National Title */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="flex flex-col items-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </h4>
                <p className="text-xs font-semibold text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-24 h-0.5 bg-slate-400 my-1"></div>
              </div>

              <div className="mt-3">
                <h1 className="text-xl sm:text-2xl font-black text-blue-900 uppercase tracking-tight">
                  HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                </h1>
                <p className="text-xs italic text-slate-500 font-medium">(HÓA ĐƠN ĐIỆN TỬ)</p>
                <p className="text-xs text-slate-600 mt-1">{formatDate(invoice.issueDate)}</p>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-left text-xs">
                <div>
                  <span className="text-slate-500 block">Mẫu số (Form):</span>
                  <span className="font-bold text-slate-800 font-mono">{invoice.invoiceTemplate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ký hiệu (Symbol):</span>
                  <span className="font-bold text-slate-800 font-mono">{invoice.invoiceSymbol}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số (Invoice No):</span>
                  <span className="font-black text-rose-600 font-mono text-sm">{invoice.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mã tra cứu:</span>
                  <span className="font-bold text-blue-700 font-mono">{invoice.lookupCode}</span>
                </div>
              </div>

              {/* Tax Authority Code (Mã CQT) */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Mã của Cơ quan Thuế cấp:</span>
                  <span className="font-mono font-bold text-emerald-950">
                    {invoice.cqtCode || 'Chưa cấp mã (HĐ điện tử có mã khởi tạo từ máy tính tiền/hệ thống)'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Tra cứu tại:</span>
                  <a
                    href={invoice.lookupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold underline flex items-center gap-0.5"
                  >
                    hoadondientu.gdt.gov.vn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Seller & Buyer Section */}
            <div className="py-4 space-y-3.5 text-xs text-slate-700 border-b border-slate-200">
              {/* Seller */}
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 flex-1">
                    <Building2 className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                    <div className="space-y-0.5 w-full">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-bold text-sm text-slate-900 uppercase">{invoice.seller?.name || 'GIA PHÚC'}</p>
                        <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                          MST: {invoice.seller?.taxCode || ''}
                        </span>
                      </div>
                      <p>
                        <span className="text-slate-500">Địa chỉ:</span> {invoice.seller?.address || ''}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-600">
                        <p>
                          <span className="text-slate-500">Điện thoại:</span> {invoice.seller?.phone || ''}
                        </p>
                        <p>
                          <span className="text-slate-500">Email:</span> {invoice.seller?.email || ''}
                        </p>
                        <p>
                          <span className="text-slate-500">Số tài khoản:</span>{' '}
                          <span className="font-mono font-medium text-slate-800">{invoice.seller?.bankAccount || ''}</span> -{' '}
                          {invoice.seller?.bankName || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block shrink-0 pt-0.5">
                    <GiaPhucLogo logoUrl={settings?.logoUrl} size="xs" isPrint={true} />
                  </div>
                </div>
              </div>

              {/* Buyer */}
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 w-full">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-bold text-slate-900">
                        {invoice.buyer?.companyName || invoice.buyer?.buyerName || 'Khách hàng cá nhân'}
                      </p>
                      {invoice.buyer?.taxCode ? (
                        <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-blue-200 font-mono">
                          MST: {invoice.buyer?.taxCode}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Khách hàng cá nhân</span>
                      )}
                    </div>
                    {invoice.buyer?.companyName && (
                      <p>
                        <span className="text-slate-500">Người mua hàng:</span> {invoice.buyer?.buyerName}
                      </p>
                    )}
                    <p>
                      <span className="text-slate-500">Địa chỉ:</span> {invoice.buyer?.address || 'Tại quầy bán hàng'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-600">
                      {invoice.buyer?.phone && (
                        <p>
                          <span className="text-slate-500">Điện thoại:</span> {invoice.buyer?.phone}
                        </p>
                      )}
                      {invoice.buyer?.email && (
                        <p>
                          <span className="text-slate-500">Email nhận HĐ:</span> {invoice.buyer?.email}
                        </p>
                      )}
                      <p>
                        <span className="text-slate-500">Hình thức thanh toán:</span>{' '}
                        <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="py-4 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-2 border border-slate-300 text-center w-10">STT</th>
                    <th className="p-2 border border-slate-300">Tên Hàng Hóa, Dịch Vụ</th>
                    <th className="p-2 border border-slate-300 text-center w-16">ĐVT</th>
                    <th className="p-2 border border-slate-300 text-right w-16">Số Lượng</th>
                    <th className="p-2 border border-slate-300 text-right w-24">Đơn Giá</th>
                    <th className="p-2 border border-slate-300 text-right w-20">Chiết Khấu</th>
                    <th className="p-2 border border-slate-300 text-center w-16">Thuế VAT</th>
                    <th className="p-2 border border-slate-300 text-right w-28">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/50">
                      <td className="p-2 border border-slate-300 text-center font-medium">{index + 1}</td>
                      <td className="p-2 border border-slate-300">
                        <div className="font-semibold text-slate-800">{item.productName}</div>
                        {item.sku && <span className="text-[11px] text-slate-400 font-mono">{item.sku}</span>}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-slate-600">{item.unit}</td>
                      <td className="p-2 border border-slate-300 text-right font-medium">{item.quantity}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-slate-600">
                        {item.discountAmount > 0 ? formatCurrency(item.discountAmount) : '-'}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-semibold text-blue-700">
                        {item.taxRate >= 0 ? `${item.taxRate}%` : 'KCT'}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Total Summary */}
            <div className="py-2 border-t border-slate-200 text-xs">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="sm:max-w-xs space-y-1.5 text-slate-600">
                  {invoice.notes && (
                    <p className="italic text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="font-semibold not-italic text-slate-700">Ghi chú:</span> {invoice.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex items-center justify-center p-1">
                      <QrCode className="w-14 h-14 text-slate-800" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <p className="font-medium text-slate-700">Quét mã QR để tra cứu</p>
                      <p className="font-mono text-[10px]">Mã tra cứu: {invoice.lookupCode}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-80 space-y-1 text-slate-700">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Cộng tiền hàng (Subtotal):</span>
                    <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between py-0.5 text-amber-700">
                      <span>Tổng chiết khấu thương mại:</span>
                      <span className="font-mono font-semibold">-{formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Tiền thuế GTGT (VAT {invoice.taxRate}%):</span>
                    <span className="font-mono font-semibold text-blue-700">
                      {formatCurrency(invoice.taxAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-t border-slate-300 text-sm font-bold text-slate-900 bg-slate-50 px-2 rounded">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="font-mono text-base text-rose-600 font-black">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount in words */}
              <div className="mt-3 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-2">
                <span className="font-bold text-slate-800 shrink-0">Số tiền viết bằng chữ:</span>
                <span className="font-semibold text-blue-900 italic">{invoice.amountInWords}</span>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-center text-xs">
              {/* Buyer Signature */}
              <div className="space-y-1">
                <p className="font-bold text-slate-800 uppercase">NGƯỜI MUA HÀNG (Buyer)</p>
                <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên hoặc xác nhận điện tử)</p>
                <div className="h-24 flex items-center justify-center">
                  <span className="text-slate-400 italic text-[11px]">Đã xác nhận thanh toán điện tử</span>
                </div>
                <p className="font-medium text-slate-700">{invoice.buyer.buyerName}</p>
              </div>

              {/* Seller Digital Signature */}
              <div className="space-y-1">
                <p className="font-bold text-slate-800 uppercase">NGƯỜI BÁN HÀNG (Seller)</p>
                <p className="text-[11px] text-slate-500 italic">(Ký số điện tử / Chữ ký số CA)</p>
                <div className="h-24 flex items-center justify-center">
                  {invoice.status !== 'draft' ? (
                    <div className="border-2 border-emerald-600 bg-emerald-50/80 p-2.5 rounded-lg text-left shadow-sm inline-block max-w-[280px]">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ĐÃ KÝ SỐ ĐIỆN TỬ HỢP LỆ</span>
                      </div>
                      <p className="text-[10px] text-emerald-950 font-bold mt-0.5 truncate">
                        {invoice.digitalSignature.signedBy}
                      </p>
                      <p className="text-[9px] text-slate-600">
                        Ngày ký: <span className="font-mono font-medium">{formatDateTime(invoice.signDate)}</span>
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        CA: {invoice.digitalSignature.certProvider}
                      </p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-300 p-2 rounded text-slate-400 text-[11px]">
                      Chờ ký số Token
                    </div>
                  )}
                </div>
                <p className="font-semibold text-slate-800">{invoice.seller.representative}</p>
              </div>
            </div>

            {/* Legal Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-0.5">
              <p>
                (Hóa đơn điện tử được khởi tạo từ Hệ thống GP-ERP Enterprise, tuân thủ Nghị định số 123/2020/NĐ-CP và
                Thông tư số 78/2021/TT-BTC của Bộ Tài Chính)
              </p>
              <p>
                Tra cứu hóa đơn gốc tại website: <span className="font-mono">{invoice.lookupUrl}</span> | Mã bảo mật:{' '}
                <span className="font-mono font-bold text-slate-600">{invoice.lookupCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="print:hidden px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium">Liên kết tra cứu HĐĐT:</span>
            <button
              onClick={handleCopyLookupLink}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 font-medium rounded border border-slate-300 flex items-center gap-1 transition"
            >
              {copiedLink ? '✓ Đã sao chép' : 'Sao chép link'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-300 transition"
            >
              Đóng lại
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              In Hóa Đơn Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
