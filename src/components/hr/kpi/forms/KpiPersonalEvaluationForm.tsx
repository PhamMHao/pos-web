import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { KpiEvaluation, StoreSettings, DigitalSignatureMetadata } from '../../../../types';
import { formatVND } from '../../../../utils/vietqr';
import { numberToVietnameseWords } from '../../../../utils/numberToWords';
import { SignatureVerificationBadge } from '../../../signatures/SignatureVerificationBadge';

export interface KpiPersonalEvaluationFormProps {
  evaluation: KpiEvaluation;
  settings?: StoreSettings;
  showRedSeal: boolean;
  signature?: DigitalSignatureMetadata | null;
}

export const KpiPersonalEvaluationForm: React.FC<KpiPersonalEvaluationFormProps> = ({
  evaluation,
  settings,
  showRedSeal,
  signature,
}) => {
  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
  const companyAddress = settings?.address || '123 Đường Công Nghệ, TP. Dĩ An, Bình Dương';
  const directorName = settings?.defaultCreatorName || 'NGUYỄN VĂN PHÚC';
  const isApproved = evaluation.directorApprovalStatus === 'approved';

  return (
    <div className="bg-white text-slate-900 p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto space-y-6 text-sm">
      {/* 1. Header Văn Bản Chuẩn Nghị Định 30/2020 */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4 text-xs">
        <div className="space-y-1">
          <div className="font-black text-slate-900 uppercase">{companyName}</div>
          <div className="text-slate-500 font-mono text-[11px]">{companyAddress}</div>
          <div className="text-slate-600 font-medium">Bộ phận: {evaluation.department}</div>
          <div className="text-slate-500 text-[11px]">Mã phiếu: ĐG-KPI-{evaluation.employeeCode}-{evaluation.period.replace(/[^a-zA-Z0-9]/g, '')}</div>
        </div>
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-semibold text-slate-700 underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
          <div className="text-slate-500 italic text-[11px] pt-1">
            Bình Dương, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* 2. Tiêu Đề Văn Bản */}
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200 inline-block">
          MẪU 01 - ĐIỀU 104 BỘ LUẬT LAO ĐỘNG 2019
        </span>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          PHIẾU ĐÁNH GIÁ &amp; TỰ ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN CÔNG VIỆC
        </h2>
        <p className="text-xs text-slate-500 italic">
          (Kỳ đánh giá: <b className="text-slate-800 font-semibold">{evaluation.period}</b> - Ngày lập:{' '}
          <b className="text-slate-800 font-semibold">{evaluation.evaluationDate}</b>)
        </p>
      </div>

      {/* 3. Thông Tin Cán Bộ Nhân Viên */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-500">Họ và tên người lao động:</span>{' '}
          <b className="text-slate-900 text-sm">{evaluation.employeeName}</b>
        </div>
        <div>
          <span className="text-slate-500">Mã nhân viên:</span>{' '}
          <b className="font-mono text-slate-900">{evaluation.employeeCode}</b>
        </div>
        <div>
          <span className="text-slate-500">Vị trí / Chức danh:</span>{' '}
          <b className="text-slate-900">{evaluation.role}</b>
        </div>
        <div>
          <span className="text-slate-500">Phòng ban công tác:</span>{' '}
          <b className="text-slate-900">{evaluation.department}</b>
        </div>
      </div>

      {/* 4. Bảng Kê Chi Tiết Tiêu Chí Đánh Giá 3 Cấp */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-center">
              <th className="border border-slate-300 py-2.5 px-2 w-10">STT</th>
              <th className="border border-slate-300 py-2.5 px-3 text-left">Nội dung tiêu chí KPI</th>
              <th className="border border-slate-300 py-2.5 px-2 w-16">Trọng số</th>
              <th className="border border-slate-300 py-2.5 px-3 text-left">Chỉ tiêu giao</th>
              <th className="border border-slate-300 py-2.5 px-3 text-left">Thực tế đạt được</th>
              <th className="border border-slate-300 py-2.5 px-2 w-16">Tự chấm</th>
              <th className="border border-slate-300 py-2.5 px-2 w-16">QL duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {evaluation.criteria.map((c, idx) => (
              <tr key={c.id || idx} className="hover:bg-slate-50">
                <td className="border border-slate-300 py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="border border-slate-300 py-2 px-3">
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.description}</div>
                </td>
                <td className="border border-slate-300 py-2 px-2 text-center font-mono font-bold text-blue-700">{c.weight}%</td>
                <td className="border border-slate-300 py-2 px-3 text-slate-600">{c.targetValue}</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900">{c.actualValue}</td>
                <td className="border border-slate-300 py-2 px-2 text-center font-mono font-bold text-slate-700">{c.selfScore}</td>
                <td className="border border-slate-300 py-2 px-2 text-center font-mono font-black text-emerald-700">{c.managerScore}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold text-slate-900">
              <td colSpan={2} className="border border-slate-300 py-2 px-3 text-right uppercase">
                Tổng điểm quy đổi trọng số:
              </td>
              <td className="border border-slate-300 py-2 px-2 text-center font-mono text-blue-700">100%</td>
              <td colSpan={2} className="border border-slate-300 py-2 px-3 text-slate-500 text-right">
                Điểm tự chấm vs Quản lý thẩm định:
              </td>
              <td className="border border-slate-300 py-2 px-2 text-center font-mono text-slate-700">{evaluation.selfTotalScore}đ</td>
              <td className="border border-slate-300 py-2 px-2 text-center font-mono font-black text-emerald-700 text-sm">{evaluation.finalScore}đ</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. Nhận Xét & Phản Hồi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
          <div className="font-bold text-slate-800">1. Điểm mạnh và thành tích nổi bật:</div>
          <p className="text-slate-600 italic leading-relaxed">{evaluation.employeeStrengths || 'Chủ động, tận tụy và hoàn thành tốt nhiệm vụ được giao.'}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
          <div className="font-bold text-slate-800">2. Điểm cần cải thiện &amp; Kế hoạch phát triển:</div>
          <p className="text-slate-600 italic leading-relaxed">{evaluation.employeeImprovements || 'Cần tối ưu thời gian thao tác và tăng cường trao đổi nghiệp vụ.'}</p>
        </div>
      </div>

      {/* 6. Bảng Cơ Chế Tính Thưởng Tự Động (Điều 104 BLLĐ 2019) */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
          <div className="font-black text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>KẾT QUẢ XẾP LOẠI HIỆU SUẤT &amp; QUYẾT TOÁN THU NHẬP</span>
          </div>
          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
            XẾP LOẠI: {evaluation.rank} ({evaluation.finalScore} ĐIỂM)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">Lương cơ bản:</div>
            <div className="font-mono font-bold text-slate-900 mt-0.5">{formatVND(evaluation.baseSalary)}</div>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">Thưởng KPI ({evaluation.performanceBonusRate}%):</div>
            <div className="font-mono font-bold text-emerald-700 mt-0.5">+{formatVND(evaluation.performanceBonus)}</div>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">Hoa hồng ({evaluation.commissionRate}%):</div>
            <div className="font-mono font-bold text-blue-700 mt-0.5">+{formatVND(evaluation.commissionAmount)}</div>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">Thưởng chuyên cần:</div>
            <div className="font-mono font-bold text-slate-800 mt-0.5">+{formatVND(evaluation.attendanceBonus)}</div>
          </div>
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <div className="text-[11px] text-slate-500">Thưởng sáng kiến:</div>
            <div className="font-mono font-bold text-amber-700 mt-0.5">+{formatVND(evaluation.initiativeBonus)}</div>
          </div>
          <div className="p-2 bg-emerald-100/70 rounded-lg border border-emerald-300">
            <div className="text-[11px] text-emerald-800 font-bold">Tổng thực lĩnh:</div>
            <div className="font-mono font-black text-emerald-900 text-sm mt-0.5">{formatVND(evaluation.totalGrossPayout)}</div>
          </div>
        </div>

        <div className="text-xs text-slate-600 italic">
          Bằng chữ:{' '}
          <b className="text-slate-900 font-semibold uppercase">
            {numberToVietnameseWords(evaluation.totalGrossPayout)} đồng
          </b>
        </div>
      </div>

      {/* 7. Chữ Ký 3 Bên & Mộc Đỏ Công Ty */}
      <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs relative min-h-[150px]">
        {/* Người lao động */}
        <div className="space-y-1">
          <div className="font-bold text-slate-900 uppercase">NGƯỜI LAO ĐỘNG</div>
          <div className="text-[11px] text-slate-500 italic">(Ký và ghi rõ họ tên)</div>
          <div className="h-16 flex items-center justify-center font-serif italic text-slate-700 text-sm">
            {evaluation.employeeName}
          </div>
          <div className="font-semibold text-slate-900">{evaluation.employeeName}</div>
        </div>

        {/* Quản lý trực tiếp */}
        <div className="space-y-1">
          <div className="font-bold text-slate-900 uppercase">QUẢN LÝ TRỰC TIẾP</div>
          <div className="text-[11px] text-slate-500 italic">(Ký và xác nhận)</div>
          <div className="h-16 flex items-center justify-center font-serif italic text-slate-700 text-sm">
            Trưởng Bộ Phận
          </div>
          <div className="font-semibold text-slate-900">Ban Thẩm Định</div>
        </div>

        {/* Tổng Giám Đốc */}
        <div className="space-y-1 relative">
          <div className="font-bold text-slate-900 uppercase">TỔNG GIÁM ĐỐC PHÊ DUYỆT</div>
          <div className="text-[11px] text-slate-500 italic">(Ký, đóng dấu &amp; duyệt chi)</div>
          <div className="h-16 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
            {isApproved ? directorName : <span className="text-slate-400 font-sans text-xs">Chờ phê duyệt</span>}
          </div>
          <div className="font-semibold text-slate-900">{directorName}</div>

          {/* Mộc Đỏ Công Ty */}
          {showRedSeal && isApproved && (
            <div className="absolute top-2 right-4 pointer-events-none select-none opacity-90 rotate-[-12deg]">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-rose-600 p-1 flex flex-col items-center justify-center text-rose-600 font-bold text-[9px] text-center leading-tight bg-rose-50/20 shadow-xs">
                <div className="uppercase font-black text-[8px]">{companyName}</div>
                <div className="text-[7px] text-rose-500 my-0.5">★ ĐÃ DUYỆT CHI ★</div>
                <div className="text-[8px] font-mono">{evaluation.period}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị Chữ Ký Số CA nếu có */}
      {signature && isApproved && (
        <div className="pt-2 border-t border-slate-200">
          <SignatureVerificationBadge metadata={signature} isVerified={true} />
        </div>
      )}
    </div>
  );
};
