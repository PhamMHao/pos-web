import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { KpiEvaluation, StoreSettings, DigitalSignatureMetadata } from '../../../../types';
import { formatVND } from '../../../../utils/vietqr';
import { numberToVietnameseWords } from '../../../../utils/numberToWords';
import { SignatureVerificationBadge } from '../../../signatures/SignatureVerificationBadge';

export interface KpiAwardDecisionFormProps {
  evaluations: KpiEvaluation[];
  settings?: StoreSettings;
  period: string;
  showRedSeal: boolean;
  signature?: DigitalSignatureMetadata | null;
  onOpenCaSignModal?: () => void;
}

export const KpiAwardDecisionForm: React.FC<KpiAwardDecisionFormProps> = ({
  evaluations,
  settings,
  period,
  showRedSeal,
  signature,
  onOpenCaSignModal,
}) => {
  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
  const companyAddress = settings?.address || '123 Đường Công Nghệ, TP. Dĩ An, Bình Dương';
  const directorName = settings?.defaultCreatorName || 'NGUYỄN VĂN PHÚC';

  const totalBonus = evaluations.reduce((sum, e) => sum + e.performanceBonus, 0);
  const totalCommission = evaluations.reduce((sum, e) => sum + e.commissionAmount, 0);
  const totalOtherBonuses = evaluations.reduce((sum, e) => sum + e.attendanceBonus + e.initiativeBonus, 0);
  const totalPayout = totalBonus + totalCommission + totalOtherBonuses;

  return (
    <div className="bg-white text-slate-900 p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto space-y-6 text-sm">
      {/* 1. Header Văn Bản Pháp Quy */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4 text-xs">
        <div className="space-y-1">
          <div className="font-black text-slate-900 uppercase">{companyName}</div>
          <div className="font-mono text-slate-700 font-bold text-xs">Số: 26/QĐ-KT-2026/GPERP</div>
          <div className="text-slate-500 font-mono text-[11px]">{companyAddress}</div>
        </div>
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-semibold text-slate-700 underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
          <div className="text-slate-500 italic text-[11px] pt-1">
            Bình Dương, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* 2. Tiêu Đề Quyết Định */}
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-200 inline-block">
          MẪU 03 - VĂN BẢN PHÁP QUY DOANH NGHIỆP
        </span>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
          QUYẾT ĐỊNH
        </h2>
        <div className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-wide">
          Về việc Khen thưởng và Chi trả tiền thưởng hiệu suất đánh giá KPI kỳ {period}
        </div>
        <div className="text-xs font-semibold text-slate-600 italic">
          TỔNG GIÁM ĐỐC {companyName.toUpperCase()}
        </div>
      </div>

      {/* 3. Căn Cứ Pháp Lý */}
      <div className="space-y-1.5 text-xs italic text-slate-600 leading-relaxed border-l-2 border-blue-500 pl-3">
        <p>- Căn cứ Luật Doanh nghiệp số 59/2020/QH14 được Quốc hội thông qua ngày 17/06/2020;</p>
        <p>- Căn cứ Bộ Luật Lao Động số 45/2019/QH14 và Điều 104 về Quy chế tiền thưởng của doanh nghiệp;</p>
        <p>- Căn cứ Điều lệ tổ chức và hoạt động của {companyName};</p>
        <p>- Căn cứ Quy chế Đánh giá KPI, Thi đua khen thưởng và Chi trả hoa hồng của Công ty;</p>
        <p>- Xét Tờ trình số 08/TTr-HR ngày {new Date().getDate()}/{new Date().getMonth() + 1}/{new Date().getFullYear()} của Trưởng bộ phận Nhân sự và Kế toán.</p>
      </div>

      {/* 4. Các Điều Khoản Thi Hành */}
      <div className="space-y-3 text-xs leading-relaxed text-slate-800">
        <div className="text-center font-black text-slate-900 text-sm tracking-wider uppercase">QUYẾT ĐỊNH:</div>

        <div className="space-y-1">
          <p>
            <b className="text-slate-900">Điều 1:</b> Ban hành kết quả xếp loại và quyết định khen thưởng hiệu suất làm việc kỳ <b>{period}</b> cho <b>{evaluations.length} cán bộ nhân viên</b> có tên trong danh sách phụ lục đính kèm Quyết định này.
          </p>
        </div>

        <div className="space-y-1">
          <p>
            <b className="text-slate-900">Điều 2:</b> Tổng ngân sách chi trả khen thưởng là:{' '}
            <span className="font-mono font-bold text-emerald-800 text-sm">{formatVND(totalPayout)}</span>.
          </p>
          <p className="italic text-slate-600">
            (Bằng chữ: <b className="text-slate-900 font-semibold uppercase">{numberToVietnameseWords(totalPayout)} đồng</b>).
          </p>
          <p className="text-slate-600">
            Nguồn kinh phí được trích từ <b>Quỹ Khen Thưởng &amp; Phúc Lợi</b> của Doanh nghiệp theo đúng quy định tài chính hiện hành.
          </p>
        </div>

        <div className="space-y-1">
          <p>
            <b className="text-slate-900">Điều 3:</b> Quyết định này có hiệu lực thi hành kể từ ngày ký. Bộ phận Kế toán - Tài chính, Phòng Hành chính - Nhân sự và các cán bộ nhân viên có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.
          </p>
        </div>
      </div>

      {/* 5. Nơi Nhận & Chữ Ký Ban Giám Đốc */}
      <div className="pt-4 flex justify-between items-start text-xs border-t border-slate-200 relative min-h-[160px]">
        <div className="space-y-1">
          <div className="font-bold text-slate-700 italic">Nơi nhận:</div>
          <div className="text-[11px] text-slate-500 space-y-0.5">
            <div>- Như Điều 3;</div>
            <div>- Ban Giám Đốc;</div>
            <div>- Lưu: VT, HR.</div>
          </div>
        </div>

        <div className="text-center space-y-1 relative pr-4">
          <div className="font-bold text-slate-900 uppercase">TỔNG GIÁM ĐỐC</div>
          <div className="text-[11px] text-slate-500 italic">(Ký, đóng dấu và ghi rõ họ tên)</div>
          <div className="h-16 flex items-center justify-center font-serif italic text-slate-900 font-black text-base">
            {directorName}
          </div>
          <div className="font-bold text-slate-900 text-sm">{directorName}</div>

          {/* Mộc Đỏ Công Ty */}
          {showRedSeal && (
            <div className="absolute top-2 right-12 pointer-events-none select-none opacity-90 rotate-[-12deg]">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-rose-600 p-1 flex flex-col items-center justify-center text-rose-600 font-bold text-[9px] text-center leading-tight bg-rose-50/20 shadow-xs">
                <div className="uppercase font-black text-[8px]">{companyName}</div>
                <div className="text-[7px] text-rose-500 my-0.5">★ PHÁP QUY DOANH NGHIỆP ★</div>
                <div className="text-[8px] font-mono">QĐ-KT-2026/02</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Chữ Ký Số CA nếu có & Nút Ký Số */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        {signature ? (
          <SignatureVerificationBadge metadata={signature} isVerified={true} />
        ) : (
          <span className="text-slate-500 italic">Chưa ký số điện tử CA (Có thể ký qua Viettel/VNPT SmartCA)</span>
        )}

        {onOpenCaSignModal && !signature && (
          <button
            onClick={onOpenCaSignModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ký Số CA Quyết Định (Viettel / VNPT / FPT)</span>
          </button>
        )}
      </div>
    </div>
  );
};
