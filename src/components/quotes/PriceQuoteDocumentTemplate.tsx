import React from 'react';
import {
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PriceQuote, StoreSettings, DigitalSignatureMetadata, PaperSize } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GIA_PHUC_LOGO_SVG_DATA_URI } from '../common/GiaPhucLogo';
import { SlipBarcodeQR } from '../common/SlipBarcodeQR';

export interface PriceQuoteDocumentTemplateProps {
  quote: PriceQuote;
  settings?: StoreSettings | null;
  signature?: DigitalSignatureMetadata | null;
  paperSize?: PaperSize;
  orientation?: 'portrait' | 'landscape';
  codePlacement?: 'header' | 'footer' | 'both';
  showVietQR?: boolean;
  showBarcode?: boolean;
  showDigitalSignature?: boolean;
  showLogo?: boolean;
  customCompany?: {
    name?: string;
    brand?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxCode?: string;
    representative?: string;
    website?: string;
  };
  customCustomer?: {
    company?: string;
    name?: string;
    phone?: string;
    address?: string;
    taxCode?: string;
  };
  customDates?: {
    createdDateStr?: string;
    validUntilStr?: string;
  };
  customTerms?: {
    term1?: string;
    term2?: string;
    term3?: string;
    term4?: string;
    notes?: string;
  };
  customBank?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
}

export const PriceQuoteDocumentTemplate: React.FC<PriceQuoteDocumentTemplateProps> = ({
  quote,
  settings,
  signature: propSignature,
  paperSize = 'A4',
  orientation = 'portrait',
  codePlacement = 'header',
  showVietQR = true,
  showBarcode = true,
  showDigitalSignature = true,
  showLogo = true,
  customCompany,
  customCustomer,
  customDates,
  customTerms,
  customBank,
}) => {
  const storeName = customCompany?.name || settings?.companyLegalName || settings?.storeName || 'CÔNG TY TNHH MTV TM & DV SỬA CHỮA GIA PHÚC';
  const brandName = customCompany?.brand || settings?.storeName || 'Gia Phúc Computer & Solutions';
  const storeAddress = customCompany?.address || settings?.address || 'Số 54, Đường Phú An 087, tổ 11, KP. An Thuận, P. Phú An, TP. HCM';
  const storePhone = customCompany?.phone || settings?.phone || '0985 862 609 - 0914 665 994';
  const storeTaxCode = customCompany?.taxCode || settings?.taxCode || '3701877838';
  const storeRepresentative = customCompany?.representative || settings?.representativeName || 'Phạm Ngọc Thơm';
  const storeEmail = customCompany?.email || settings?.email || 'giaphuc.pos@gmail.com';
  const storeWebsite = customCompany?.website || 'giaphuc.vn';

  const customerCompany = customCustomer?.company || quote.customerCompany || quote.customerName || 'Đơn vị Quý Khách';
  const customerName = customCustomer?.name || quote.customerName || 'Đại diện Quý Khách';
  const customerPhone = customCustomer?.phone || quote.customerPhone || '---';
  const customerTaxCode = customCustomer?.taxCode || quote.customerTaxCode || '---';
  const customerAddress = customCustomer?.address || quote.customerAddress || 'Tại văn phòng quý khách';

  const effectiveSignature = propSignature || quote.digitalSignature;

  // Formatting dates
  const createdDate = new Date(quote.createdAt);
  const validUntilDate = new Date(quote.validUntil);
  const day = String(createdDate.getDate()).padStart(2, '0');
  const month = String(createdDate.getMonth() + 1).padStart(2, '0');
  const year = createdDate.getFullYear();

  const effectiveCreatedDateStr = customDates?.createdDateStr || `${day}/${month}/${year}`;
  const effectiveValidUntilStr = customDates?.validUntilStr || validUntilDate.toLocaleDateString('vi-VN');

  const totalAmount = quote.totalAmount || 0;
  const discountPercent = quote.discountPercent || 0;
  const discountAmount = Math.round((totalAmount * discountPercent) / 100);
  const finalTotal = quote.finalTotal || (totalAmount - discountAmount);

  // Bank VietQR URL
  const bankConfig = customBank || settings?.bankAccounts?.[0] || {
    bankName: 'MBBANK',
    accountNumber: '0985862609',
    accountHolder: 'PHAM NGOC THOM',
  };

  const vietQrUrl = generateVietQRUrl({
    bankId: bankConfig.bankName || 'MBBANK',
    accountNo: bankConfig.accountNumber || '0985862609',
    accountName: bankConfig.accountHolder || 'PHAM NGOC THOM',
    amount: finalTotal,
    memo: `TT BAO GIA ${quote.code}`,
    template: 'compact',
  });

  const isLandscape = orientation === 'landscape';
  const isA5 = paperSize === 'A5';

  const sheetWidthClass = isA5
    ? isLandscape
      ? 'w-full max-w-[210mm] p-6 text-[11px]'
      : 'w-full max-w-[148mm] p-5 text-[10.5px] leading-snug'
    : isLandscape
      ? 'w-full max-w-[297mm] p-8 text-[12px]'
      : 'w-full max-w-[210mm] p-8 text-[12.5px] leading-relaxed';

  const showHeaderBarcode = showBarcode && (codePlacement === 'header' || codePlacement === 'both');
  const showFooterBarcode = showBarcode && (codePlacement === 'footer' || codePlacement === 'both');

  return (
    <div
      id={`quote-doc-${quote.id}`}
      className={`printable-document bg-white text-slate-900 mx-auto font-serif print:shadow-none print:m-0 print:p-6 shadow-2xl transition-all ${sheetWidthClass}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. HEADER: Bên Bán & Barcode */}
      <div className="flex items-start justify-between border-b-2 border-blue-900 pb-4 mb-4 gap-4">
        {/* Logo & Company info */}
        <div className="flex items-start gap-3.5 flex-1">
          {showLogo && (
            <img
              src={settings?.logoUrl || GIA_PHUC_LOGO_SVG_DATA_URI}
              alt="Logo Gia Phúc"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 mt-0.5"
            />
          )}
          <div className="space-y-0.5">
            <h1 className="text-sm sm:text-base font-extrabold uppercase text-blue-950 tracking-wide font-sans">
              {storeName}
            </h1>
            <div className="text-xs font-bold text-blue-700 uppercase font-sans">
              {brandName}
            </div>
            <div className="text-[11px] text-slate-600 flex items-start gap-1">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
              <span>{storeAddress}</span>
            </div>
            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span><strong>Hotline:</strong> {storePhone}</span>
              <span><strong>MST:</strong> {storeTaxCode}</span>
              <span><strong>Email:</strong> {storeEmail}</span>
              <span><strong>Web:</strong> {storeWebsite}</span>
            </div>
          </div>
        </div>

        {/* Barcode & Doc Meta */}
        <div className="text-right shrink-0">
          <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/80 shadow-xs">
            <div className="text-[11px] font-bold text-slate-800 font-sans">
              MÃ BÁO GIÁ: <span className="font-mono text-blue-700 text-xs font-black">{quote.code}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Ngày lập: {effectiveCreatedDateStr}
            </div>
            <div className="text-[10px] text-red-600 font-semibold mt-0.5">
              Hiệu lực: {effectiveValidUntilStr}
            </div>
          </div>

          {showHeaderBarcode && (
            <div className="mt-1 flex justify-end">
              <SlipBarcodeQR
                docCode={quote.code}
                docType="quote"
                paperSize={paperSize}
                renderMode="barcode_only"
                showBarcode={true}
                showQr={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. TITLE: BẢNG BÁO GIÁ THƯƠNG MẠI */}
      <div className="text-center my-4">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-sans">
          BẢNG BÁO GIÁ THƯƠNG MẠI & DỰ ÁN B2B
        </h2>
        <p className="text-xs italic text-slate-500 mt-0.5 font-sans">
          (COMMERCIAL PRICE QUOTE & TECHNICAL SPECIFICATIONS)
        </p>
      </div>

      {/* 3. KHỐI THÔNG TIN BÊN BÁN VÀ BÊN MUA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* Bên Bán */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="font-bold uppercase text-blue-900 border-b border-slate-200 pb-1 mb-1 font-sans flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>I. ĐƠN VỊ BÁO GIÁ (BÊN BÁN)</span>
          </div>
          <div><span className="font-semibold text-slate-700">Đơn vị:</span> {storeName}</div>
          <div><span className="font-semibold text-slate-700">Đại diện:</span> {storeRepresentative} (Giám Đốc)</div>
          <div><span className="font-semibold text-slate-700">Điện thoại / Zalo:</span> {storePhone}</div>
          <div><span className="font-semibold text-slate-700">Địa chỉ:</span> {storeAddress}</div>
        </div>

        {/* Bên Mua */}
        <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-200 text-xs space-y-1">
          <div className="font-bold uppercase text-blue-900 border-b border-blue-200 pb-1 mb-1 font-sans flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>II. KHÁCH HÀNG / ĐƠN VỊ NHẬN (BÊN MUA)</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Công ty / Đơn vị:</span>{' '}
            <strong className="text-blue-950 font-bold">{quote.customerCompany || quote.customerName}</strong>
          </div>
          <div><span className="font-semibold text-slate-700">Người liên hệ:</span> {quote.customerName}</div>
          <div><span className="font-semibold text-slate-700">Số điện thoại:</span> {quote.customerPhone}</div>
          <div><span className="font-semibold text-slate-700">Mã số thuế / CCCD:</span> {quote.customerTaxCode || '---'}</div>
          <div><span className="font-semibold text-slate-700">Địa chỉ công trình / VP:</span> {quote.customerAddress || 'Tại văn phòng quý khách'}</div>
        </div>
      </div>

      {/* Lời ngỏ */}
      <p className="text-xs italic text-slate-700 mb-3">
        Công Ty Gia Phúc trân trọng gửi tới Quý khách hàng bảng báo giá chi tiết trang thiết bị, linh kiện và giải pháp kỹ thuật theo yêu cầu như sau:
      </p>

      {/* 4. BẢNG CHI TIẾT HÀNG HÓA & LINH KIỆN */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold text-center font-sans">
              <th className="border border-slate-400 p-2 w-8">STT</th>
              <th className="border border-slate-400 p-2 text-left">Tên Hàng Hóa / Quy Cách Kỹ Thuật</th>
              <th className="border border-slate-400 p-2 w-24">Mã SKU / Model</th>
              <th className="border border-slate-400 p-2 w-12 text-center">ĐVT</th>
              <th className="border border-slate-400 p-2 w-12 text-center">SL</th>
              <th className="border border-slate-400 p-2 w-28 text-right">Đơn Giá (VND)</th>
              {discountPercent > 0 && <th className="border border-slate-400 p-2 w-16 text-center">CK (%)</th>}
              <th className="border border-slate-400 p-2 w-32 text-right">Thành Tiền (VND)</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                <td className="border border-slate-400 p-2">
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  {item.specifications && (
                    <div className="text-[11px] text-slate-600 italic mt-0.5">{item.specifications}</div>
                  )}
                  {item.warranty && (
                    <div className="text-[10px] text-blue-700 font-sans mt-0.5">
                      Bảo hành: {item.warranty}
                    </div>
                  )}
                </td>
                <td className="border border-slate-400 p-2 text-center font-mono text-[11px] text-slate-600">
                  {item.sku}
                </td>
                <td className="border border-slate-400 p-2 text-center">{item.unit || 'Cái'}</td>
                <td className="border border-slate-400 p-2 text-center font-bold text-slate-900 font-mono">
                  {item.quantity}
                </td>
                <td className="border border-slate-400 p-2 text-right font-mono">
                  {formatVND(item.unitPrice).replace(' ₫', '')}
                </td>
                {discountPercent > 0 && (
                  <td className="border border-slate-400 p-2 text-center font-mono text-rose-600">
                    {item.discountPercent || discountPercent}%
                  </td>
                )}
                <td className="border border-slate-400 p-2 text-right font-mono font-bold text-slate-900">
                  {formatVND(item.total).replace(' ₫', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. TỔNG HỢP GIÁ TRỊ VÀ ĐỌC SỐ TIỀN BẰNG CHỮ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 items-start">
        {/* VietQR & Thanh toán */}
        {showVietQR && (
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 flex items-center gap-3">
            <img
              src={vietQrUrl}
              alt="VietQR Thanh Toán"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-white p-1 rounded border border-slate-200 shrink-0"
            />
            <div className="text-[11px] space-y-0.5 text-slate-700">
              <div className="font-bold text-blue-900 uppercase font-sans">
                QUÉT VIETQR THANH TOÁN TỨC THÌ
              </div>
              <div>Ngân hàng: <strong>{bankConfig.bankName}</strong></div>
              <div>STK: <strong className="font-mono text-blue-700">{bankConfig.accountNumber}</strong></div>
              <div>Chủ TK: <strong>{bankConfig.accountHolder}</strong></div>
              <div className="text-[10px] text-slate-500 italic">Nội dung: TT BAO GIA {quote.code}</div>
            </div>
          </div>
        )}

        {/* Bảng Tổng Giá Trị */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-700">
            <span>Tổng cộng tiền hàng:</span>
            <span className="font-mono font-semibold">{formatVND(totalAmount)}</span>
          </div>

          {discountPercent > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>Chiết khấu dự án ({discountPercent}%):</span>
              <span className="font-mono">-{formatVND(discountAmount)}</span>
            </div>
          )}

          <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
            <span className="font-sans uppercase">TỔNG CỘNG THANH TOÁN:</span>
            <span className="font-mono text-base font-black text-blue-900">{formatVND(finalTotal)}</span>
          </div>

          <div className="text-[11px] italic text-slate-600 pt-0.5">
            <strong>Bằng chữ:</strong> {numberToVietnameseWords(finalTotal)} đồng chẵn./.
          </div>
        </div>
      </div>

      {/* 6. ĐIỀU KHOẢN THƯƠNG MẠI & KỸ THUẬT */}
      <div className="border border-slate-300 rounded-lg p-3.5 bg-slate-50/60 mb-6 text-xs space-y-1">
        <div className="font-bold text-slate-900 uppercase font-sans mb-1 text-[11px]">
          III. ĐIỀU KHOẢN THƯƠNG MẠI & CHÍNH SÁCH DỰ ÁN
        </div>
        <div className="text-slate-700 leading-relaxed space-y-0.5">
          <p>
            <strong>1. Thời hạn hiệu lực: </strong>
            {customTerms?.term1 || `Báo giá có giá trị đến hết ngày ${effectiveValidUntilStr}. Sau thời gian trên, đơn giá có thể thay đổi theo biến động thị trường.`}
          </p>
          <p>
            <strong>2. Điều kiện thanh toán: </strong>
            {customTerms?.term2 || 'Tạm ứng 30% - 50% khi ký hợp đồng/xác nhận đặt hàng, thanh toán 100% còn lại ngay khi giao nhận hàng hóa và nghiệm thu.'}
          </p>
          <p>
            <strong>3. Thời gian & Địa điểm giao hàng: </strong>
            {customTerms?.term3 || 'Trong vòng 24h - 48h kể từ khi nhận đủ tiền cọc hoặc xác nhận đơn hàng, giao hàng và lắp đặt tận nơi theo yêu cầu.'}
          </p>
          <p>
            <strong>4. Chính sách bảo hành: </strong>
            {customTerms?.term4 || 'Toàn bộ thiết bị mới 100%, bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất tại Gia Phúc Computer. Hỗ trợ kỹ thuật 24/7.'}
          </p>
          {(customTerms?.notes || quote.notes) && (
            <p className="text-blue-900 font-medium">
              <strong>5. Ghi chú bổ sung: </strong>
              {customTerms?.notes || quote.notes}
            </p>
          )}
        </div>
      </div>

      {/* 7. KHỐI CHỨNG THƯ SỐ ĐIỆN TỬ CA (NẾU ĐÃ KÝ) */}
      {showDigitalSignature && effectiveSignature && (
        <div className="border-2 border-emerald-500 bg-emerald-50/70 rounded-xl p-3.5 mb-6 text-xs flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-emerald-900 uppercase font-sans flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>VĂN BẢN ĐÃ KÝ SỐ ĐIỆN TỬ HỢP LỆ (DIGITAL SIGNATURE VERIFIED)</span>
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5 space-y-0.5">
                <div><strong>Đơn vị ký:</strong> {effectiveSignature.signerName} ({effectiveSignature.signerPosition})</div>
                <div><strong>Nhà cung cấp CA:</strong> {effectiveSignature.providerName} • Định dạng: {effectiveSignature.signatureFormat}</div>
                <div><strong>Thời gian ký (TSA):</strong> {new Date(effectiveSignature.signedAt).toLocaleString('vi-VN')}</div>
                <div className="font-mono text-[10px] text-emerald-700 truncate max-w-md">
                  Serial: {effectiveSignature.certificateSerial} • Hash: {effectiveSignature.sha256Hash.slice(0, 24)}...
                </div>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg font-sans shadow-sm">
              PAdES B-LT Valid
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BARCODE & TRA CỨU CODE (NẾU CHỌN VỊ TRÍ CUỐI HOẶC CẢ 2) */}
      {showFooterBarcode && (
        <div className="my-4 pt-3 border-t border-slate-300 flex flex-wrap justify-between items-center text-xs gap-2">
          <div className="text-[11px] text-slate-600">
            Mã vạch tra cứu báo giá online: <strong className="font-mono text-blue-900">{quote.code}</strong>
          </div>
          <SlipBarcodeQR
            docCode={quote.code}
            docType="quote"
            paperSize={paperSize}
            renderMode="barcode_only"
            showBarcode={true}
            showQr={false}
          />
        </div>
      )}

      {/* 8. KHỐI 2 CHỮ KÝ PHÁP LÝ */}
      <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-4 border-t border-slate-300">
        <div>
          <div className="font-bold uppercase text-slate-900 font-sans">ĐẠI DIỆN BÊN MUA (KHÁCH HÀNG)</div>
          <div className="text-[11px] text-slate-500 italic mb-16">(Ký tên, ghi rõ họ tên & đóng dấu)</div>
          <div className="font-bold text-slate-900">{customerName}</div>
        </div>

        <div>
          <div className="font-bold uppercase text-slate-900 font-sans">ĐẠI DIỆN BÊN BÁN (GIA PHÚC)</div>
          <div className="text-[11px] text-slate-500 italic mb-16">(Ký số điện tử & đóng dấu công ty)</div>
          <div className="font-bold text-slate-900">{storeRepresentative}</div>
        </div>
      </div>
    </div>
  );
};
