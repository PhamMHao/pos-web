import React, { useRef } from 'react';
import { X, Printer, ShieldCheck, Download, Award } from 'lucide-react';
import { CustomerContract } from '../contracts.types';
import { formatVND } from '../../../utils/currency';

export interface CustomerContractPrintModalProps {
  contract: CustomerContract | null;
  onClose: () => void;
}

export const CustomerContractPrintModal: React.FC<CustomerContractPrintModalProps> = ({
  contract,
  onClose,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  let signatureBObj: any = null;
  try {
    if (contract.signatureBDetails) {
      signatureBObj = JSON.parse(contract.signatureBDetails);
    }
  } catch (e) {
    signatureBObj = null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Controls Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Mẫu In Hợp Đồng Kinh Tế Pháp Lý</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
              {contract.contractNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <Printer className="w-4 h-4" />
              <span>In Hợp Đồng (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legal Paper Layout (A4 White Print Style) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 bg-slate-200">
          <div
            ref={printContentRef}
            className="max-w-[210mm] mx-auto bg-white text-black p-10 sm:p-14 shadow-2xl rounded-sm font-serif text-[13px] leading-relaxed select-text"
          >
            {/* National Header */}
            <div className="text-center space-y-1 mb-6">
              <div className="font-bold uppercase text-[13px] tracking-wide">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="font-bold text-[13px]">Độc lập – Tự do – Hạnh phúc</div>
              <div className="text-xs">---------------------------</div>
            </div>

            {/* Contract Title */}
            <div className="text-center my-6 space-y-1">
              <h1 className="text-lg font-bold uppercase tracking-wide">HỢP ĐỒNG KINH TẾ</h1>
              <div className="text-xs italic font-sans font-medium text-gray-700">
                (Số: {contract.contractNumber})
              </div>
              <div className="text-xs italic">
                (V/v: {contract.title})
              </div>
            </div>

            {/* Legal Basis */}
            <div className="text-[12px] italic text-gray-700 space-y-0.5 mb-6">
              <p>• Căn cứ Bộ luật Dân sự số 91/2015/QH13 của Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam;</p>
              <p>• Căn cứ Luật Thương mại số 36/2005/QH11 của Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam;</p>
              <p>• Căn cứ nhu cầu và năng lực thực tế của hai bên ký kết hợp đồng.</p>
            </div>

            <p className="mb-4">
              Hôm nay, ngày {new Date(contract.signedDate || contract.createdAt).getDate()} tháng{' '}
              {new Date(contract.signedDate || contract.createdAt).getMonth() + 1} năm{' '}
              {new Date(contract.signedDate || contract.createdAt).getFullYear()}, tại Văn phòng Công ty GP-ERP, chúng tôi gồm có:
            </p>

            {/* Party A */}
            <div className="mb-4 space-y-1">
              <div className="font-bold uppercase text-[13px]">BÊN A (BÊN MUA): {contract.customerName}</div>
              <div>Địa chỉ: {contract.customerAddress || 'Theo đăng ký kinh doanh'}</div>
              <div>Mã số thuế: <strong>{contract.customerTaxCode || 'N/A'}</strong></div>
              <div>Người đại diện: <strong>{contract.customerRepresentative || 'N/A'}</strong> - Chức vụ: {contract.customerPosition || 'Đại diện hợp pháp'}</div>
              <div>Điện thoại: {contract.customerPhone || 'N/A'} - Email: {contract.customerEmail || 'N/A'}</div>
              {contract.customerBankName && (
                <div>Tài khoản ngân hàng: {contract.customerBankAccount} tại {contract.customerBankName}</div>
              )}
            </div>

            {/* Party B */}
            <div className="mb-6 space-y-1">
              <div className="font-bold uppercase text-[13px]">BÊN B (BÊN BÁN): CÔNG TY CỔ PHẦN GP-ERP VIỆT NAM</div>
              <div>Địa chỉ: Tòa nhà GP-Tower, 180 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh</div>
              <div>Mã số thuế: <strong>0318928172</strong></div>
              <div>Người đại diện: <strong>{contract.companyRepresentative || 'Phạm Ngọc Thơm'}</strong> - Chức vụ: {contract.companyPosition || 'Tổng Giám Đốc'}</div>
              <div>Điện thoại: 1900 888 999 - Email: contact@gperp.vn</div>
              <div>Tài khoản ngân hàng: 0071009998888 tại Ngân hàng Ngoại Thương Việt Nam (Vietcombank) – CN Tân Định</div>
            </div>

            <p className="mb-4 font-semibold italic">
              Sau khi bàn bạc, thảo luận, hai bên cùng thống nhất ký kết Hợp đồng kinh tế với các điều khoản sau:
            </p>

            {/* Điều 1: Đối Tượng Hợp Đồng */}
            <div className="mb-5 space-y-2">
              <div className="font-bold uppercase">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG & DANH MỤC THIẾT BỊ / DỊCH VỤ</div>
              <p>Bên B đồng ý cung cấp, lắp đặt và chuyển giao cho Bên A danh mục hàng hóa theo bảng chi tiết sau:</p>
              
              <table className="w-full border-collapse border border-gray-400 text-[12px] my-2">
                <thead>
                  <tr className="bg-gray-100 text-center font-bold">
                    <th className="border border-gray-400 py-1.5 px-2 w-8">STT</th>
                    <th className="border border-gray-400 py-1.5 px-2">Tên thiết bị / Hàng hóa</th>
                    <th className="border border-gray-400 py-1.5 px-2 w-14">ĐVT</th>
                    <th className="border border-gray-400 py-1.5 px-2 w-12">SL</th>
                    <th className="border border-gray-400 py-1.5 px-2 text-right">Đơn giá (VNĐ)</th>
                    <th className="border border-gray-400 py-1.5 px-2 text-right">Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.items && contract.items.length > 0 ? (
                    contract.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="border border-gray-400 py-1 px-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-400 py-1 px-2">
                          <div className="font-bold">{item.productName}</div>
                          <div className="text-[11px] text-gray-600 font-mono">{item.productCode}</div>
                        </td>
                        <td className="border border-gray-400 py-1 px-2 text-center">{item.unit || 'Bộ'}</td>
                        <td className="border border-gray-400 py-1 px-2 text-center font-bold">{item.quantity}</td>
                        <td className="border border-gray-400 py-1 px-2 text-right">{formatVND(item.unitPrice)}</td>
                        <td className="border border-gray-400 py-1 px-2 text-right font-bold">{formatVND(item.totalAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="border border-gray-400 py-3 text-center italic text-gray-500">
                        Hàng hóa theo bảng kê thỏa thuận chi tiết đính kèm
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold bg-gray-50">
                    <td colSpan={5} className="border border-gray-400 py-1.5 px-2 text-right">Tổng tiền trước thuế:</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-right">{formatVND(contract.totalAmount)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-50">
                    <td colSpan={5} className="border border-gray-400 py-1.5 px-2 text-right">Thuế GTGT ({contract.taxRate}%):</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-right">{formatVND(contract.taxAmount)}</td>
                  </tr>
                  <tr className="font-bold bg-gray-100 text-[13px]">
                    <td colSpan={5} className="border border-gray-400 py-1.5 px-2 text-right uppercase">TỔNG GIÁ TRỊ HỢP ĐỒNG:</td>
                    <td className="border border-gray-400 py-1.5 px-2 text-right text-black">{formatVND(contract.finalTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Điều 2: Phương Thức Thanh Toán */}
            <div className="mb-5 space-y-1">
              <div className="font-bold uppercase">ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN</div>
              <p>2.1. Hình thức thanh toán: Chuyển khoản qua tài khoản ngân hàng của Bên B.</p>
              <p>2.2. Tiến độ thanh toán:</p>
              <div className="pl-4 space-y-1 text-[12px]">
                {contract.milestones && contract.milestones.length > 0 ? (
                  contract.milestones.map((m, idx) => (
                    <p key={m.id || idx}>
                      • <strong>{m.milestoneName}</strong>: {m.percentage}% giá trị hợp đồng tương đương <strong>{formatVND(m.amount)}</strong>. {m.conditions}
                    </p>
                  ))
                ) : (
                  <p>• Thanh toán làm 02 đợt: Tạm ứng 50% khi ký kết, 50% khi nghiệm thu bàn giao và xuất hóa đơn VAT.</p>
                )}
              </div>
            </div>

            {/* Điều 3: Thời Gian & Địa Điểm Bàn Giao */}
            <div className="mb-5 space-y-1">
              <div className="font-bold uppercase">ĐIỀU 3: THỜI GIAN, ĐỊA ĐIỂM GIAO NHẬN VÀ BÀN GIAO</div>
              <p>3.1. Địa điểm giao nhận: {contract.customerAddress || 'Tại địa chỉ của Bên A'}.</p>
              <p>3.2. Khi bàn giao, hai bên cùng tiến hành kiểm tra tình trạng hàng hóa và ký xác nhận vào <strong>Biên bản bàn giao thiết bị</strong>.</p>
            </div>

            {/* Điều 4: Cam Kết Bảo Hành */}
            <div className="mb-5 space-y-1">
              <div className="font-bold uppercase">ĐIỀU 4: BẢO HÀNH VÀ HỖ TRỢ KỸ THUẬT</div>
              <p>4.1. Bên B cam kết bảo hành chính hãng đối với thiết bị cung cấp trong thời hạn <strong>{contract.warrantyMonths} tháng</strong>.</p>
              <p>4.2. Thời gian phản hồi và xử lý sự cố kỹ thuật trong vòng 04 giờ làm việc kể từ khi nhận được thông báo của Bên A.</p>
            </div>

            {/* Điều 5: Điều Khoản Chung */}
            <div className="mb-8 space-y-1">
              <div className="font-bold uppercase">ĐIỀU 5: ĐIỀU KHOẢN CHUNG</div>
              <p>5.1. Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận trong hợp đồng này.</p>
              <p>5.2. Hợp đồng có hiệu lực kể từ ngày ký và được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 text-center gap-8 pt-4">
              <div>
                <div className="font-bold uppercase text-[13px]">ĐẠI DIỆN BÊN A</div>
                <div className="text-xs italic mb-16">(Ký, ghi rõ họ tên và đóng dấu)</div>
                {contract.digitalSignatureA ? (
                  <div className="p-3 border-2 border-emerald-600 rounded text-emerald-700 bg-emerald-50 text-xs font-mono font-bold">
                    ✓ ĐÃ KÝ SỐ XÁC THỰC
                    <div className="text-[11px] text-gray-800 font-sans mt-0.5">{contract.digitalSignatureA}</div>
                  </div>
                ) : (
                  <div className="font-bold">{contract.customerRepresentative || 'Đại diện Bên A'}</div>
                )}
              </div>

              <div>
                <div className="font-bold uppercase text-[13px]">ĐẠI DIỆN BÊN B</div>
                <div className="text-xs italic mb-4">(Ký, ghi rõ họ tên và đóng dấu)</div>
                {contract.digitalSignatureB ? (
                  <div className="p-3 border-2 border-blue-600 rounded bg-blue-50 text-blue-800 text-xs font-mono text-left space-y-0.5">
                    <div className="font-bold text-blue-900 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      CHỨNG THƯ SỐ DOANH NGHIỆP GP-ERP
                    </div>
                    <div>Người ký: <strong>{contract.digitalSignatureB}</strong></div>
                    <div>Nhà cấp CA: {signatureBObj?.provider || 'Viettel SmartCA'}</div>
                    <div className="text-[10px] text-gray-600">TSA: RFC 3161 Certified</div>
                  </div>
                ) : (
                  <div className="pt-12 font-bold">{contract.companyRepresentative || 'Phạm Ngọc Thơm'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
