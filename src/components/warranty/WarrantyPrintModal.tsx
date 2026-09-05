import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  Wrench,
  Package,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { WarrantyTicket, StoreSettings, PaperSize } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { SlipBarcodeQR } from '../common/SlipBarcodeQR';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { getEffectivePrintConfig } from '../../utils/printTemplates';

interface WarrantyPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: WarrantyTicket | null;
  settings?: StoreSettings;
  printMode?: 'receipt' | 'handover'; // 'receipt' = Phiếu tiếp nhận, 'handover' = Biên bản bàn giao trả hàng
}

export const WarrantyPrintModal: React.FC<WarrantyPrintModalProps> = ({
  isOpen,
  onClose,
  ticket,
  settings,
  printMode = 'receipt',
}) => {
  const isHandover = printMode === 'handover' || ticket?.status === 'returned' || ticket?.status === 'ready_to_return';
  const docType = isHandover ? ('warranty_return' as const) : ('warranty_intake' as const);
  const effectiveConfig = getEffectivePrintConfig(settings, docType);

  const [paperSize, setPaperSize] = useState<PaperSize>(
    effectiveConfig.paperSize || settings?.defaultPrintPaperSize || 'A4'
  );
  const [codePlacement, setCodePlacement] = useState<'header' | 'footer' | 'both' | 'none'>(
    effectiveConfig.codePlacement || settings?.defaultPrintCodePlacement || 'header'
  );

  React.useEffect(() => {
    if (isOpen) {
      const cfg = getEffectivePrintConfig(settings, docType);
      if (cfg.paperSize) setPaperSize(cfg.paperSize);
      if (cfg.codePlacement) setCodePlacement(cfg.codePlacement);
    }
  }, [isOpen, settings, docType]);

  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white text-slate-900 rounded-2xl ${paperSize === 'A5' ? 'max-w-xl' : 'max-w-3xl'} w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            <Printer className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm">
                {isHandover ? 'In Biên Bản Nghiệm Thu & Bàn Giao Trả Hàng' : 'In Phiếu Tiếp Nhận Bảo Hành / Bảo Trì'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Số phiếu: {ticket.code} | Serial: {ticket.serialNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Paper Size Dropdown */}
            <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700 text-xs">
              <span className="text-[10px] text-slate-400 font-bold mr-1.5 whitespace-nowrap">Khổ giấy:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as any)}
                className="bg-transparent text-cyan-400 font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="A4" className="bg-slate-900 text-white">Khổ A4</option>
                <option value="A5" className="bg-slate-900 text-white">Khổ A5</option>
                <option value="K80" className="bg-slate-900 text-white">K80 (80mm)</option>
                <option value="K58" className="bg-slate-900 text-white">K58 (58mm)</option>
              </select>
            </div>

            {/* Code Placement Dropdown */}
            <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1 border border-slate-700 text-xs">
              <span className="text-[10px] text-slate-400 font-bold mr-1.5 whitespace-nowrap">Vị trí mã:</span>
              <select
                value={codePlacement}
                onChange={(e) => setCodePlacement(e.target.value as any)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="header" className="bg-slate-900 text-white">Đầu trang (Header)</option>
                <option value="footer" className="bg-slate-900 text-white">Cuối trang (Footer)</option>
                <option value="both" className="bg-slate-900 text-white">Cả 2 vị trí</option>
                <option value="none" className="bg-slate-900 text-white">Không in mã</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div
          className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-serif text-xs space-y-6 print:p-0 print:space-y-4"
          style={{ fontFamily: '"Tinos", "Noto Serif", "Times New Roman", Times, serif' }}
        >
          {/* Header of Document */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-start space-x-3">
              <GiaPhucLogo logoUrl={settings?.logoUrl} size="sm" isPrint={true} />
              <div className="space-y-1">
                <h2 className="text-base font-bold uppercase text-slate-900 tracking-normal">
                  {settings?.storeName || 'TRUNG TÂM BẢO HÀNH & KỸ THUẬT GP-ERP'}
                </h2>
                <p className="text-[11px] text-slate-600">
                  Địa chỉ: {settings?.address || 'Số 123 Đường Điện Biên Phủ, Quận 1, TP. Hồ Chí Minh'}
                </p>
                <p className="text-[11px] text-slate-600">
                  Hotline kỹ thuật: <strong className="text-slate-900">{settings?.phone || '1900 6868 - 0988 888 888'}</strong> | Website: {settings?.website || 'www.vitinhgiaphuc.com'}
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              {(codePlacement === 'header' || codePlacement === 'both') && (
                <SlipBarcodeQR
                  docCode={ticket.code}
                  docType="warranty_intake"
                  date={ticket.receivedDate}
                  customerName={ticket.customerName}
                  totalAmount={ticket.totalFee || 0}
                  paperSize={paperSize}
                  showBarcode={true}
                  showQr={true}
                  renderMode="both"
                  align="right"
                  layout="row"
                  className="my-0"
                />
              )}
            </div>
          </div>

          {/* Title of Document */}
          <div className="text-center space-y-1 py-1">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-normal text-slate-950">
              {isHandover ? 'BIÊN BẢN NGHIỆM THU & BÀN GIAO TRẢ HÀNG' : 'PHIẾU TIẾP NHẬN BẢO HÀNH / BẢO TRÌ'}
            </h1>
            <div className="flex items-center justify-center space-x-3 text-slate-600 text-[11px]">
              <span>Mã phiếu: <strong className="font-mono text-slate-900">{ticket.code}</strong></span>
              <span>•</span>
              <span>Ngày lập: <strong>{ticket.receivedDate}</strong></span>
              {isHandover && ticket.actualReturnDate && (
                <>
                  <span>•</span>
                  <span>Ngày bàn giao: <strong>{ticket.actualReturnDate}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Info Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Customer Info */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600" />
                <span>THÔNG TIN KHÁCH HÀNG</span>
              </h4>
              <div className="space-y-1 text-[11px]">
                <p>Khách hàng: <strong className="text-slate-900">{ticket.customerName}</strong></p>
                <p>Số điện thoại: <strong className="text-slate-900 font-mono">{ticket.customerPhone}</strong></p>
                {ticket.customerAddress && <p>Địa chỉ: <span className="text-slate-700">{ticket.customerAddress}</span></p>}
                {ticket.orderCode && (
                  <p>Hóa đơn gốc: <span className="font-mono font-bold text-cyan-700">{ticket.orderCode}</span></p>
                )}
              </div>
            </div>

            {/* Device & Serial Info */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>THÔNG TIN THIẾT BỊ & SERIAL</span>
              </h4>
              <div className="space-y-1 text-[11px]">
                <p>Sản phẩm: <strong className="text-slate-900">{ticket.productName}</strong></p>
                {ticket.model && <p>Model / Mã: <span className="font-mono text-slate-800">{ticket.model}</span></p>}
                <p>
                  Số Serial / IMEI: <strong className="font-mono text-xs px-2 py-0.5 bg-slate-200 rounded text-slate-950 font-black">{ticket.serialNumber}</strong>
                </p>
                <p>
                  Loại dịch vụ:{' '}
                  <span className="font-bold text-cyan-800 uppercase">
                    {ticket.type === 'warranty' ? 'Bảo hành miễn phí' : ticket.type === 'maintenance' ? 'Bảo trì định kỳ' : 'Sửa chữa dịch vụ'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Condition & Diagnosis */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 font-medium">Tình trạng ngoại quan & Phụ kiện:</span>
                <p className="text-slate-900 font-medium mt-0.5">{ticket.cosmeticCondition} ({ticket.accessoriesIncluded || 'Không có phụ kiện kèm'})</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Hiện tượng lỗi / Yêu cầu xử lý:</span>
                <p className="text-rose-700 font-medium mt-0.5">{ticket.issueDescription}</p>
              </div>
            </div>

            {ticket.technicianDiagnosis && (
              <div className="pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-medium">Chẩn đoán kỹ thuật:</span>
                <p className="text-slate-900 font-medium mt-0.5">{ticket.technicianDiagnosis}</p>
              </div>
            )}

            {ticket.resolution && (
              <div className="pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-medium">Biện pháp xử lý & Linh kiện:</span>
                <p className="text-emerald-800 font-medium mt-0.5">{ticket.resolution}</p>
              </div>
            )}
          </div>

          {/* Parts & Replacement Table (If Any) */}
          {ticket.parts && ticket.parts.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-600" />
                <span>DANH SÁCH LINH KIỆN & PHỤ TÙNG THAY THẾ</span>
              </h4>
              <table className="w-full border border-slate-300 rounded-lg overflow-hidden text-left text-[11px]">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <tr>
                    <th className="p-2">STT</th>
                    <th className="p-2">Tên Linh Kiện</th>
                    <th className="p-2 text-center">SL</th>
                    <th className="p-2 text-right">Đơn Giá</th>
                    <th className="p-2 text-center">Bảo Hành</th>
                    <th className="p-2 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ticket.parts.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="p-2 text-center">{idx + 1}</td>
                      <td className="p-2 font-medium">{p.partName}</td>
                      <td className="p-2 text-center font-mono">{p.quantity} {p.unit}</td>
                      <td className="p-2 text-right font-mono">{formatVND(p.unitPrice)}</td>
                      <td className="p-2 text-center font-medium text-emerald-700">
                        {p.isUnderWarranty ? 'Miễn phí BH' : `${p.warrantyMonths} tháng`}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        {p.isUnderWarranty ? '0 đ' : formatVND(p.quantity * p.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cost Summary */}
          <div className="flex justify-end pt-1">
            <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Tiền linh kiện:</span>
                <span className="font-mono font-medium">{formatVND(ticket.partsCost || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tiền công dịch vụ:</span>
                <span className="font-mono font-medium">{formatVND(ticket.laborCost || 0)}</span>
              </div>
              {ticket.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá / Ưu đãi:</span>
                  <span className="font-mono font-medium">-{formatVND(ticket.discountAmount)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-950">
                <span>TỔNG THANH TOÁN:</span>
                <span className="font-mono font-black text-sm text-emerald-700">{formatVND(ticket.totalFee)}</span>
              </div>
            </div>
          </div>

          {/* Warranty Terms & Extension */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[10px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <BadgeCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>ĐIỀU KHOẢN & BẢO HÀNH SAU XỬ LÝ:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>Linh kiện thay thế được bảo hành {ticket.warrantyExtensionMonths || 6} tháng kể từ ngày bàn giao.</li>
              <li>Không bảo hành trong các trường hợp: Rơi vỡ, vô nước, chập cháy do sét đánh, rách tem niêm phong.</li>
              <li>Quý khách vui lòng kiểm tra tình trạng máy và ký nhận đầy đủ trước khi rời khỏi quầy kỹ thuật.</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center pt-4 pb-2 text-[11px]">
            <div className="space-y-10">
              <p className="font-bold text-slate-900">KHÁCH HÀNG</p>
              <p className="text-slate-500 italic text-[10px]">(Ký & ghi rõ họ tên)</p>
              <p className="font-bold text-slate-800">{ticket.customerName}</p>
            </div>

            <div className="space-y-10">
              <p className="font-bold text-slate-900">KỸ THUẬT VIÊN</p>
              <p className="text-slate-500 italic text-[10px]">(Ký & ghi rõ họ tên)</p>
              <p className="font-bold text-slate-800">{ticket.technicianName}</p>
            </div>

            <div className="space-y-10">
              <p className="font-bold text-slate-900">ĐẠI DIỆN TRUNG TÂM</p>
              <p className="text-slate-500 italic text-[10px]">(Ký & đóng dấu)</p>
              <p className="font-bold text-slate-800">{settings?.storeName || 'GP-ERP Store'}</p>
            </div>
          </div>

          {/* Barcode & ERP QR Chân Trang (Ảnh 2) */}
          {(codePlacement === 'footer' || codePlacement === 'both') && (
            <SlipBarcodeQR
              docCode={ticket.code}
              orderCode={ticket.orderCode || ticket.code}
              docType="warranty_intake"
              date={ticket.receivedDate}
              customerName={ticket.customerName}
              totalAmount={ticket.totalFee || 0}
              paperSize={paperSize}
              showBarcode={true}
              showQr={true}
              qrPayloadMode="erp_smart"
              renderMode="both"
              variant="warranty_footer"
              brandName={settings?.brandName || 'GIA PHÚC'}
              align="between"
              layout="row"
              className="mt-3"
            />
          )}
        </div>
      </div>
    </div>
  );
};
