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
  ArrowDownRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { StockGoodsReceipt, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

interface StockReceiptPrintModalProps {
  receipt: StockGoodsReceipt;
  settings: StoreSettings;
  onClose: () => void;
}

export const StockReceiptPrintModal: React.FC<StockReceiptPrintModalProps> = ({
  receipt,
  settings,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [paperSize, setPaperSize] = useState<'A4' | 'A5'>('A4');
  const [showGiaPhucModal, setShowGiaPhucModal] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
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

  // Convert receipt items for standard PrintInvoiceModal
  const convertedItems = receipt.items.map((it, idx) => ({
    id: `item-${idx}`,
    sku: it.sku || `VT-${idx + 1}`,
    productName: it.productName,
    unit: it.unit || 'PCS',
    quantity: it.quantity,
    actualQuantity: it.quantity,
    unitPrice: it.unitCost,
    total: it.totalAmount,
    serialNumber: 'E32131315F',
    note: it.storageLocation ? `Kệ: ${it.storageLocation}` : 'Nhập kho',
  }));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 no-print flex-wrap gap-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  Phiếu Nhập Kho: <span className="font-mono text-emerald-700">{receipt.code}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chứng từ nhập kho tự động hóa • Hỗ trợ in khổ A4 / A5 và mẫu Excel Gia Phúc
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Paper Size selector */}
              <div className="flex items-center bg-slate-200 rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    paperSize === 'A4' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Khổ A4
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('A5')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    paperSize === 'A5' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Khổ A5
                </button>
              </div>

              {/* Open Gia Phuc Excel Print Format */}
              <button
                type="button"
                onClick={() => setShowGiaPhucModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                title="Mở mẫu in Excel Gia Phúc Computer chuẩn ảnh thực tế"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Mẫu Gia Phúc Computer</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu ({paperSize})</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Paper A4/A5 View */}
          <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-100/50 print:bg-white print:p-0 print:overflow-visible flex justify-center">
            <div
              ref={printRef}
              className={`bg-white rounded-xl border border-slate-200 shadow-sm print:border-0 print:shadow-none font-sans text-slate-800 leading-relaxed ${
                paperSize === 'A5'
                  ? 'paper-size-A5-portrait text-[8pt] p-4 sm:p-6'
                  : 'paper-size-A4-portrait text-xs p-6 sm:p-10'
              }`}
            >
              {/* Header: Company Profile + Form Code */}
              <div className="flex items-start justify-between border-b border-slate-300 pb-3 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <GiaPhucLogo size={paperSize === 'A5' ? 'xs' : 'sm'} isPrint={true} />
                  <div className="space-y-0.5">
                    <h4 className={`font-black uppercase text-slate-900 ${paperSize === 'A5' ? 'text-xs' : 'text-sm'}`}>
                      {settings.companyLegalName || settings.brandName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC'}
                    </h4>
                    <p className={`${paperSize === 'A5' ? 'text-[9px]' : 'text-[11px]'} text-slate-600`}>
                      <span className="font-semibold text-slate-700">Địa chỉ:</span> {settings.address}
                    </p>
                    <p className={`${paperSize === 'A5' ? 'text-[9px]' : 'text-[11px]'} text-slate-600`}>
                      <span className="font-semibold text-slate-700">MST:</span> {settings.taxCode} |{' '}
                      <span className="font-semibold text-slate-700">Hotline:</span> {settings.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono shrink-0 pl-4">
                  <p className="font-bold text-slate-700">Mẫu số: 01 - VT</p>
                  <p>(Ban hành theo TT số 200/2014/TT-BTC)</p>
                  <p className="mt-1 text-emerald-700 font-semibold">Kho: {receipt.warehouseName}</p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-3 space-y-0.5">
                <h2 className={`font-black uppercase text-slate-950 tracking-wide ${paperSize === 'A5' ? 'text-base' : 'text-xl'}`}>
                  PHIẾU NHẬP KHO
                </h2>
                <p className="italic text-slate-600 text-[11px]">
                  {formatDate(receipt.date)}
                </p>
                <div className="flex items-center justify-center gap-3 text-xs font-mono font-bold text-slate-700">
                  <span>
                    Số: <span className="text-emerald-700">{receipt.code}</span>
                  </span>
                  {receipt.inboundInvoiceCode && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      Kèm HĐĐT: {receipt.inboundInvoiceCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Metadata Info */}
              <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 my-3 space-y-1 text-[11px] text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <p>
                    <span className="text-slate-500">Đơn vị cung cấp:</span>{' '}
                    <span className="font-bold text-slate-900">{receipt.supplierName}</span>
                  </p>
                  {receipt.supplierTaxCode && (
                    <p>
                      <span className="text-slate-500">MST Nhà Cung Cấp:</span>{' '}
                      <span className="font-mono font-semibold text-slate-800">{receipt.supplierTaxCode}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Nhập tại kho:</span>{' '}
                    <span className="font-semibold text-slate-800">{receipt.warehouseName}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Người thực hiện / Thủ kho:</span>{' '}
                    <span className="font-semibold text-slate-800">{receipt.receivedBy || receipt.creatorName}</span>
                  </p>
                </div>
              </div>

              {/* Goods Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden my-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                      <th className="p-1.5 border-r border-slate-300 w-8">STT</th>
                      <th className="p-1.5 border-r border-slate-300 text-left">Tên Hàng Hóa, Quy Cách</th>
                      <th className="p-1.5 border-r border-slate-300 w-20">Mã SKU</th>
                      <th className="p-1.5 border-r border-slate-300 w-24 text-left">Vị Trí Kệ</th>
                      <th className="p-1.5 border-r border-slate-300 w-12">ĐVT</th>
                      <th className="p-1.5 border-r border-slate-300 w-12">SL</th>
                      <th className="p-1.5 border-r border-slate-300 text-right w-20">Đơn Giá</th>
                      <th className="p-1.5 text-right w-24">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {receipt.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-1.5 text-center border-r border-slate-200 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-1.5 border-r border-slate-200">
                          <p className="font-bold text-slate-900">{it.productName}</p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-0.5">
                            {it.category && (
                              <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-700 font-medium">
                                {it.category}
                              </span>
                            )}
                            <span>
                              Tồn: {it.oldStock} ➔ <strong className="text-emerald-700">{it.newStock}</strong>
                            </span>
                          </div>
                        </td>
                        <td className="p-1.5 text-center font-mono border-r border-slate-200 text-slate-700 text-[10px]">
                          {it.sku}
                        </td>
                        <td className="p-1.5 border-r border-slate-200 text-slate-800">
                          {it.storageLocation ? (
                            <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 block text-[10px]">
                              📍 {it.storageLocation}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[9px]">Chờ xếp kệ</span>
                          )}
                        </td>
                        <td className="p-1.5 text-center border-r border-slate-200">{it.unit}</td>
                        <td className="p-1.5 text-center font-bold text-emerald-700 border-r border-slate-200">
                          {it.quantity}
                        </td>
                        <td className="p-1.5 text-right font-mono border-r border-slate-200 text-slate-700">
                          {formatVND(it.unitCost).replace(' ₫', '')}
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                          {formatVND(it.totalAmount).replace(' ₫', '')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td colSpan={5} className="p-1.5 text-right border-r border-slate-300">
                        Cộng tiền hàng:
                      </td>
                      <td className="p-1.5 text-center font-bold text-emerald-800 border-r border-slate-300">
                        {receipt.totalQuantity}
                      </td>
                      <td className="p-1.5 border-r border-slate-300"></td>
                      <td className="p-1.5 text-right font-mono font-bold text-slate-900">
                        {formatVND(receipt.totalCostAmount).replace(' ₫', '')}
                      </td>
                    </tr>
                    {receipt.totalTaxAmount > 0 && (
                      <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                        <td colSpan={7} className="p-1.5 text-right border-r border-slate-300 text-slate-600">
                          Tiền thuế GTGT (VAT):
                        </td>
                        <td className="p-1.5 text-right font-mono text-slate-800">
                          {formatVND(receipt.totalTaxAmount).replace(' ₫', '')}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50/80 font-black text-slate-950 border-t border-slate-300">
                      <td colSpan={7} className="p-2 text-right border-r border-slate-300 uppercase tracking-wide">
                        Tổng Cộng Tiền Thanh Toán:
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-800 font-extrabold">
                        {formatVND(receipt.grandTotal).replace(' ₫', '')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Total In Words */}
              <p className="italic text-[11px] text-slate-700 mb-4">
                <span className="font-semibold not-italic text-slate-900">Số tiền bằng chữ:</span>{' '}
                {numberToVietnameseWords(receipt.grandTotal)}
              </p>

              {/* Signatures 4 columns */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] mt-6 pt-3 border-t border-slate-200">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 uppercase">Người Lập Phiếu</p>
                  <p className="text-[9px] italic text-slate-500">(Ký, họ tên)</p>
                  <div className="h-12 flex items-end justify-center">
                    <p className="font-semibold text-slate-800">{receipt.creatorName}</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 uppercase">Người Giao Hàng</p>
                  <p className="text-[9px] italic text-slate-500">(Ký, họ tên)</p>
                  <div className="h-12 flex items-end justify-center">
                    <p className="font-semibold text-slate-800">
                      {receipt.supplierName.split(' ').slice(0, 3).join(' ')}
                    </p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 uppercase">Thủ Kho</p>
                  <p className="text-[9px] italic text-slate-500">(Ký, nhận hàng)</p>
                  <div className="h-12 flex items-end justify-center">
                    <p className="font-semibold text-slate-800">{receipt.receivedBy || 'Nguyễn Văn Minh'}</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 uppercase">Giám Đốc</p>
                  <p className="text-[9px] italic text-slate-500">(Ký, đóng dấu)</p>
                  <div className="h-12 flex items-end justify-center">
                    <p className="font-semibold text-slate-800">{settings.companyRepresentative || 'Phạm Gia Phúc'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative: Standard Gia Phúc Computer Excel Print Format */}
      {showGiaPhucModal && (
        <PrintInvoiceModal
          isOpen={showGiaPhucModal}
          initialDocType="goods_receipt"
          orderCode={receipt.code}
          orderDate={receipt.date}
          customer={{
            name: receipt.supplierName,
            phone: receipt.supplierTaxCode ? `MST: ${receipt.supplierTaxCode}` : '',
            address: settings.address || 'ĐẮK LẮK',
          }}
          items={convertedItems}
          taxRate={receipt.totalTaxAmount > 0 ? 8 : 0}
          creatorName={receipt.creatorName || 'Mr. Thơm'}
          warehouseName={receipt.warehouseName || 'Gia Phúc'}
          deliveryNote={`Nhập kho từ HĐĐT ${receipt.inboundInvoiceCode || ''}`}
          settings={settings}
          onClose={() => setShowGiaPhucModal(false)}
        />
      )}
    </>
  );
};
