import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { SequentialApprovalProcess, APPROVAL_MODULE_CONFIG } from './approvals.types';
import { formatVND } from '../../utils/currency';

interface ApprovalPrintA4ModalProps {
  process: SequentialApprovalProcess | null;
  onClose: () => void;
}

export const ApprovalPrintA4Modal: React.FC<ApprovalPrintA4ModalProps> = ({
  process,
  onClose,
}) => {
  if (!process) return null;

  const handlePrint = () => {
    window.print();
  };

  const modConfig =
    APPROVAL_MODULE_CONFIG[process.moduleType] || {
      label: process.moduleType,
      text: 'DOC',
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs select-none overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800 text-xs">
              Xem Trước Phiếu Trình Ký Khổ A4 (Nghị định 30/2020/NĐ-CP)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay (Print A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khung tài liệu A4 chuẩn */}
        <div
          id="approval-a4-document"
          className="p-8 sm:p-12 text-slate-900 bg-white font-serif leading-normal"
          style={{ minHeight: '297mm' }}
        >
          {/* Header 2 bên chuẩn hành chính */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
            <div className="text-center w-64">
              <span className="font-bold text-xs uppercase block font-sans tracking-wide">
                CÔNG TY CP CÔNG NGHỆ GIA PHÚC
              </span>
              <span className="text-[11px] font-medium block uppercase text-slate-600 font-sans">
                {process.departmentName}
              </span>
              <div className="w-20 h-0.5 bg-slate-800 mx-auto my-1" />
              <span className="text-[10px] text-slate-500 font-mono block">
                Số: {process.processCode}/TTr-GP
              </span>
            </div>

            <div className="text-center w-72">
              <span className="font-bold text-xs uppercase block font-sans tracking-wide">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </span>
              <span className="text-xs font-bold block font-sans">
                Độc lập - Tự do - Hạnh phúc
              </span>
              <div className="w-28 h-0.5 bg-slate-800 mx-auto my-1" />
              <span className="text-[11px] italic text-slate-500 block">
                TP. Hồ Chí Minh, ngày {new Date(process.createdAt).getDate()} tháng{' '}
                {new Date(process.createdAt).getMonth() + 1} năm {new Date(process.createdAt).getFullYear()}
              </span>
            </div>
          </div>

          {/* Tiêu đề tờ trình */}
          <div className="text-center mb-6">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider font-sans text-slate-900">
              PHIẾU TRÌNH KÝ &amp; PHÊ DUYỆT LIÊN PHÒNG BAN
            </h1>
            <p className="text-xs italic text-slate-600 font-sans mt-1">
              (V/v: {process.title})
            </p>
          </div>

          {/* Kính gửi */}
          <div className="text-xs mb-4 font-sans space-y-1">
            <p>
              <strong className="font-bold">Kính gửi:</strong> - Ban Tổng Giám Đốc Công Ty
            </p>
            <p className="pl-14">- Trưởng các Phòng Ban có liên quan trong quy trình</p>
          </div>

          {/* Bảng thông tin chứng từ */}
          <table className="w-full text-xs font-sans border-collapse border border-slate-300 mb-5">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 w-36 border-r border-slate-300">Khâu Chuỗi Cung Ứng:</td>
                <td className="p-2 font-bold text-blue-700 border-r border-slate-300">{modConfig.label}</td>
                <td className="p-2 font-bold bg-slate-50 w-32 border-r border-slate-300">Mã Chứng Từ Gốc:</td>
                <td className="p-2 font-mono font-bold">{process.referenceDocCode}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Người Đề Xuất:</td>
                <td className="p-2 border-r border-slate-300">{process.requesterName}</td>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Phòng Ban:</td>
                <td className="p-2">{process.departmentName}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Tổng Kinh Phí (VNĐ):</td>
                <td className="p-2 font-black text-slate-900 border-r border-slate-300">
                  {process.totalAmount > 0 ? formatVND(process.totalAmount) : 'Không áp dụng'}
                </td>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Mức Độ Ưu Tiên:</td>
                <td className="p-2 uppercase font-bold">{process.priority}</td>
              </tr>
              <tr>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Trạng Thái Hồ Sơ:</td>
                <td className="p-2 font-bold text-emerald-700 border-r border-slate-300 uppercase">
                  {process.status === 'approved' ? 'Đã Ký Duyệt Hoàn Tất' : 'Đang Thực Hiện'}
                </td>
                <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">Thời Hạn SLA:</td>
                <td className="p-2 font-mono">
                  {process.slaDeadline ? new Date(process.slaDeadline).toLocaleDateString('vi-VN') : '48 giờ'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Nội dung giải trình */}
          <div className="text-xs font-sans mb-6 space-y-2">
            <h4 className="font-bold uppercase text-[11px] text-slate-800">
              I. NỘI DUNG TỜ TRÌNH &amp; SỰ CẦN THIẾT
            </h4>
            <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-800 leading-relaxed italic">
              "{process.summaryNotes || 'Kính trình Lãnh đạo xem xét và phê duyệt hồ sơ theo đúng chức năng nhiệm vụ quy định.'}"
            </div>
          </div>

          {/* Bảng Ký Duyệt Đa Cấp Liên Phòng Ban */}
          <div className="text-xs font-sans mb-6">
            <h4 className="font-bold uppercase text-[11px] text-slate-800 mb-2">
              II. Ý KIẾN THẨM TRA &amp; KÝ PHÊ DUYỆT TUẦN TỰ (CÁC CẤP THẨM QUYỀN)
            </h4>

            <table className="w-full border-collapse border border-slate-400 text-center">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-400 text-[11px]">
                  <th className="p-2 border-r border-slate-400 w-12">Bước</th>
                  <th className="p-2 border-r border-slate-400">Tên Bước Phê Duyệt</th>
                  <th className="p-2 border-r border-slate-400 w-36">Người Thẩm Quyền</th>
                  <th className="p-2 border-r border-slate-400 w-28">Trạng Thái</th>
                  <th className="p-2 border-r border-slate-400">Ý Kiến Phê Duyệt</th>
                  <th className="p-2 w-36">Chữ Ký Điện Tử / CA</th>
                </tr>
              </thead>
              <tbody>
                {process.steps.map((s) => (
                  <tr key={s.id} className="border-b border-slate-300 text-[11px]">
                    <td className="p-2 font-bold border-r border-slate-300">{s.stepOrder}</td>
                    <td className="p-2 text-left border-r border-slate-300">{s.stepName}</td>
                    <td className="p-2 border-r border-slate-300 font-semibold">{s.assignedUserName}</td>
                    <td className="p-2 border-r border-slate-300">
                      {s.status === 'approved' ? (
                        <span className="font-bold text-emerald-700">ĐÃ KÝ DUYỆT</span>
                      ) : s.status === 'waiting' ? (
                        <span className="font-bold text-blue-600">ĐANG CHỜ</span>
                      ) : (
                        <span className="text-slate-400">CHƯA TỚI LƯỢT</span>
                      )}
                    </td>
                    <td className="p-2 text-left italic border-r border-slate-300 text-slate-700">
                      {s.reviewNotes || s.reworkRequirements || '—'}
                    </td>
                    <td className="p-2 text-center align-middle">
                      {s.status === 'approved' ? (
                        <div className="p-1 rounded bg-emerald-50 border border-emerald-300 text-[9px] text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                          <span className="font-bold block uppercase">{s.actedBy}</span>
                          <span className="font-mono text-[8px] text-slate-500 block">
                            {s.actedAt ? new Date(s.actedAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Chưa ký</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer chữ ký các bên chính */}
          <div className="grid grid-cols-3 gap-4 text-center font-sans text-xs pt-4 mt-6 border-t border-slate-200">
            <div>
              <span className="font-bold block uppercase">NGƯỜI LẬP TỜ TRÌNH</span>
              <span className="text-[10px] italic text-slate-500">(Ký, ghi rõ họ tên)</span>
              <div className="h-16 flex items-center justify-center">
                <span className="font-bold text-slate-700 text-sm">{process.requesterName}</span>
              </div>
            </div>

            <div>
              <span className="font-bold block uppercase">TRƯỞNG BỘ PHẬN</span>
              <span className="text-[10px] italic text-slate-500">(Ký, xác nhận)</span>
              <div className="h-16 flex items-center justify-center">
                <span className="font-bold text-slate-700 text-sm">
                  {process.steps[0]?.assignedUserName || 'Trưởng Phòng'}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold block uppercase">BAN TỔNG GIÁM ĐỐC</span>
              <span className="text-[10px] italic text-slate-500">(Phê duyệt cuối cùng)</span>
              <div className="h-16 flex items-center justify-center">
                {process.status === 'approved' ? (
                  <div className="border-2 border-red-600 text-red-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider rotate-[-5deg]">
                    ĐÃ DUYỆT CA
                    <br />
                    TỔNG GIÁM ĐỐC
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">Đang chờ ký</span>
                )}
              </div>
            </div>
          </div>

          {/* Mã QR tra cứu & Dấu xác thực pháp lý */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chứng từ điện tử ký số hợp lệ theo Luật Giao Dịch Điện Tử 2023</span>
            </div>
            <div className="font-mono">
              SHA256: {process.steps[0]?.pkiSignatureHash ? process.steps[0].pkiSignatureHash.substring(0, 24) + '...' : 'SECURE_HASH_OK'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
