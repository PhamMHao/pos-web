import React, { useRef, useState } from 'react';
import {
  Printer,
  X,
  FileCheck,
  Building2,
  Calendar,
  Layers,
  User,
  Barcode,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { StockGoodsIssue, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { PrinterSelectDropdown } from '../common/PrinterSelectDropdown';
import { SlipBarcodeQR } from '../common/SlipBarcodeQR';

interface StockGoodsIssuePrintModalProps {
  issue: StockGoodsIssue;
  settings?: StoreSettings;
  onClose: () => void;
}

export const StockGoodsIssuePrintModal: React.FC<StockGoodsIssuePrintModalProps> = ({
  issue,
  settings,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>('A4');

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `Ngày ${d.getDate().toString().padStart(2, '0')} tháng ${(d.getMonth() + 1).toString().padStart(2, '0')} năm ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 no-print flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Phiếu Xuất Kho: <span className="font-mono text-blue-700">{issue.code}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Phiếu Xuất Kho & Biên Bản Bàn Giao Thiết Bị • Đơn hàng {issue.orderCode}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <PrinterSelectDropdown />
            
            <div className="flex items-center bg-slate-200 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setPaperSize('A4')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  paperSize === 'A4' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Khổ A4
              </button>
              <button
                onClick={() => setPaperSize('A5')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  paperSize === 'A5' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Khổ A5
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu (Ctrl+P)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            className={`bg-white text-slate-900 p-8 sm:p-10 shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 ${
              paperSize === 'A4' ? 'w-[210mm] min-h-[297mm]' : 'w-[148mm] min-h-[210mm]'
            }`}
          >
            {/* Header with Company info & Barcode */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <GiaPhucLogo className="w-14 h-14" />
                <div>
                  <h1 className="text-sm sm:text-base font-extrabold uppercase text-slate-900 tracking-wider">
                    {settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC'}
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Địa chỉ: {settings?.address || 'Đường PA 087, Khu phố An Thuận, Phường Phú An, TP. HCM'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Điện thoại: {settings?.phone || '0985 862 609'} • MST: {settings?.taxCode || '0318999888'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <SlipBarcodeQR
                  docCode={issue.code}
                  docType="delivery_note"
                  customerName={issue.customerName}
                  showBarcode={true}
                  showQr={true}
                  paperSize={paperSize}
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-wide">
                PHIẾU XUẤT KHO & BIÊN BẢN BÀN GIAO
              </h2>
              <p className="text-xs text-slate-600 italic mt-0.5">
                {formatDate(issue.dispatchedAt)} • Số: <span className="font-mono font-bold text-slate-900">{issue.code}</span>
              </p>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Khách hàng nhận:</span>{' '}
                <span className="font-bold text-slate-900">{issue.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Theo đơn hàng số:</span>{' '}
                <span className="font-mono font-bold text-blue-700">{issue.orderCode}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Số điện thoại:</span>{' '}
                <span className="font-mono text-slate-800">{issue.customerPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Kho xuất hàng:</span>{' '}
                <span className="font-semibold text-slate-800">{issue.warehouseName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-medium">Địa chỉ giao:</span>{' '}
                <span className="text-slate-800">{issue.customerAddress || 'Giao tại quầy'}</span>
              </div>
              {issue.notes && (
                <div className="col-span-2">
                  <span className="text-slate-500 font-medium">Ghi chú:</span>{' '}
                  <span className="text-slate-800 italic">{issue.notes}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse border border-slate-300 mb-6">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold uppercase">
                  <th className="border border-slate-300 p-2 w-10 text-center">STT</th>
                  <th className="border border-slate-300 p-2 min-w-[200px]">Tên Sản Phẩm / Hàng Hóa</th>
                  <th className="border border-slate-300 p-2 w-20 text-center">Mã SKU</th>
                  <th className="border border-slate-300 p-2 w-16 text-center">ĐVT</th>
                  <th className="border border-slate-300 p-2 w-16 text-center">SL</th>
                  <th className="border border-slate-300 p-2">Số Serial / IMEI & Thời Hạn Bảo Hành</th>
                </tr>
              </thead>
              <tbody>
                {issue.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                      {item.productName}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono">{item.sku}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.unit || 'Cái'}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold">{item.quantity}</td>
                    <td className="border border-slate-300 p-2">
                      {item.serials && item.serials.length > 0 ? (
                        <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                          {item.serials.map((sn, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-800"
                            >
                              S/N: {sn}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Không có Serial</span>
                      )}
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        (BH tiêu chuẩn: {item.warrantyMonths || 24} tháng)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={4} className="border border-slate-300 p-2 text-right uppercase">
                    Tổng số lượng thiết bị xuất:
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-sm text-blue-700">
                    {issue.totalQuantity}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-600 text-[11px]">
                    Tổng {issue.items.length} mặt hàng
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Warranty note */}
            <div className="border border-slate-300 p-2.5 rounded text-[11px] text-slate-700 mb-8 bg-slate-50">
              <p className="font-bold">⚠️ Điều kiện bảo hành:</p>
              <p>
                Thiết bị được bảo hành chính hãng theo số Serial/IMEI ghi trên phiếu này. Tem bảo hành phải còn nguyên vẹn, không rách rời, chắp vá, không có dấu hiệu va đập, vô nước hay chập cháy điện áp.
              </p>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-4 gap-4 text-center text-xs mt-6 pt-4 mb-4">
              <div>
                <p className="font-bold text-slate-900">NGƯỜI LẬP PHIẾU</p>
                <p className="text-[11px] text-slate-500 italic mb-14">(Ký, ghi rõ họ tên)</p>
                <p className="font-semibold text-slate-800">{issue.dispatchedBy}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">THỦ KHO XUẤT</p>
                <p className="text-[11px] text-slate-500 italic mb-14">(Ký, ghi rõ họ tên)</p>
                <p className="font-semibold text-slate-800">{issue.dispatchedBy}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">NGƯỜI GIAO HÀNG</p>
                <p className="text-[11px] text-slate-500 italic mb-14">(Ký, ghi rõ họ tên)</p>
                <p className="font-semibold text-slate-800">............................</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">NGƯỜI NHẬN HÀNG</p>
                <p className="text-[11px] text-slate-500 italic mb-14">(Ký, ghi rõ họ tên)</p>
                <p className="font-semibold text-slate-800">{issue.customerName}</p>
              </div>
            </div>

            {/* Footer Barcode & Warranty Lookup Box (Ảnh 2) */}
            <SlipBarcodeQR
              docCode={issue.code}
              orderCode={issue.orderCode || issue.code}
              docType="goods_issue"
              date={(issue as any).date || (issue as any).createdAt || new Date().toISOString()}
              customerName={issue.customerName}
              totalAmount={0}
              paperSize={paperSize}
              variant="warranty_footer"
              brandName={settings?.brandName || 'GIA PHÚC'}
              align="between"
              layout="row"
              className="mt-3"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
