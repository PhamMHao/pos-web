import React from 'react';
import { KpiEvaluation, StoreSettings } from '../../../../types';
import { formatVND } from '../../../../utils/vietqr';
import { numberToVietnameseWords } from '../../../../utils/numberToWords';

export interface KpiProposalStatementFormProps {
  evaluations: KpiEvaluation[];
  settings?: StoreSettings;
  period: string;
  showRedSeal: boolean;
}

export const KpiProposalStatementForm: React.FC<KpiProposalStatementFormProps> = ({
  evaluations,
  settings,
  period,
  showRedSeal,
}) => {
  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
  const companyAddress = settings?.address || '123 Đường Công Nghệ, TP. Dĩ An, Bình Dương';
  const directorName = settings?.defaultCreatorName || 'NGUYỄN VĂN PHÚC';

  const totalBonus = evaluations.reduce((sum, e) => sum + e.performanceBonus, 0);
  const totalCommission = evaluations.reduce((sum, e) => sum + e.commissionAmount, 0);
  const totalOtherBonuses = evaluations.reduce((sum, e) => sum + e.attendanceBonus + e.initiativeBonus, 0);
  const totalPayout = totalBonus + totalCommission + totalOtherBonuses;

  const countA = evaluations.filter((e) => e.rank === 'A+' || e.rank === 'A').length;
  const countB = evaluations.filter((e) => e.rank === 'B').length;
  const countC = evaluations.filter((e) => e.rank === 'C' || e.rank === 'D').length;

  return (
    <div className="bg-white text-slate-900 p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-4xl mx-auto space-y-6 text-sm">
      {/* 1. Header Văn Bản */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4 text-xs">
        <div className="space-y-1">
          <div className="font-black text-slate-900 uppercase">{companyName}</div>
          <div className="text-slate-500 font-mono text-[11px]">Số: 08/TTr-HR/2026/GPERP</div>
          <div className="text-slate-600 font-medium">V/v: Phê duyệt kết quả đánh giá KPI &amp; chi trả thưởng {period}</div>
        </div>
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-semibold text-slate-700 underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
          <div className="text-slate-500 italic text-[11px] pt-1">
            Bình Dương, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* 2. Tiêu Đề */}
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-0.5 rounded-full border border-indigo-200 inline-block">
          MẪU 02 - TỜ TRÌNH ĐỀ XUẤT BAN GIÁM ĐỐC
        </span>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
          TỜ TRÌNH ĐỀ XUẤT KHEN THƯỞNG VÀ CHI TRẢ THƯỞNG HIỆU SUẤT KPI
        </h2>
        <div className="text-sm font-semibold text-slate-700">Kỳ đánh giá: {period}</div>
      </div>

      {/* 3. Kính Gửi & Căn Cứ */}
      <div className="space-y-2 text-xs leading-relaxed text-slate-700">
        <div className="font-bold text-slate-900 text-sm">Kính gửi: BAN GIÁM ĐỐC {companyName.toUpperCase()}</div>
        <ul className="list-disc pl-5 space-y-1 italic text-slate-600">
          <li>Căn cứ Bộ Luật Lao Động số 45/2019/QH14 được Quốc hội thông qua ngày 20/11/2019;</li>
          <li>Căn cứ Điều 104 Bộ Luật Lao Động 2019 về Quy chế thưởng của người sử dụng lao động;</li>
          <li>Căn cứ Quy chế Đánh giá Hiệu suất và Khen thưởng nội bộ của Công ty;</li>
          <li>Căn cứ kết quả thẩm định thực tế của Hội đồng Đánh giá KPI kỳ {period}.</li>
        </ul>
        <p className="pt-2">
          Bộ phận Nhân sự &amp; Kế toán trân trọng báo cáo Ban Giám Đốc kết quả thẩm định và đề xuất phân bổ ngân sách khen thưởng như sau:
        </p>
      </div>

      {/* 4. Tổng Hợp Số Liệu */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-center">
              <th className="border border-slate-300 py-2.5 px-3">Nội Dung Chỉ Tiêu Đánh Giá</th>
              <th className="border border-slate-300 py-2.5 px-3">Số Lượng Nhân Sự</th>
              <th className="border border-slate-300 py-2.5 px-3">Tỷ Lệ / Tổng Số</th>
              <th className="border border-slate-300 py-2.5 px-3 text-right">Dự Toán Kinh Phí Thưởng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            <tr>
              <td className="border border-slate-300 py-2 px-3 font-semibold text-emerald-800">
                1. Xếp loại Xuất sắc &amp; Tốt (Hạng A+ &amp; A - ≥ 85đ)
              </td>
              <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold">{countA} người</td>
              <td className="border border-slate-300 py-2 px-3 text-center font-mono font-semibold">
                {evaluations.length > 0 ? Math.round((countA / evaluations.length) * 100) : 0}%
              </td>
              <td className="border border-slate-300 py-2 px-3 text-right font-mono font-bold text-emerald-700">
                {formatVND(evaluations.filter(e => e.rank === 'A+' || e.rank === 'A').reduce((s, e) => s + e.performanceBonus, 0))}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 py-2 px-3 font-semibold text-blue-800">
                2. Xếp loại Khá (Hạng B - Từ 70 đến 84.9đ)
              </td>
              <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold">{countB} người</td>
              <td className="border border-slate-300 py-2 px-3 text-center font-mono font-semibold">
                {evaluations.length > 0 ? Math.round((countB / evaluations.length) * 100) : 0}%
              </td>
              <td className="border border-slate-300 py-2 px-3 text-right font-mono font-bold text-blue-700">
                {formatVND(evaluations.filter(e => e.rank === 'B').reduce((s, e) => s + e.performanceBonus, 0))}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 py-2 px-3 font-semibold text-rose-800">
                3. Xếp loại Cần cải thiện (Hạng C/D - Dưới 70đ)
              </td>
              <td className="border border-slate-300 py-2 px-3 text-center font-mono font-bold">{countC} người</td>
              <td className="border border-slate-300 py-2 px-3 text-center font-mono font-semibold">
                {evaluations.length > 0 ? Math.round((countC / evaluations.length) * 100) : 0}%
              </td>
              <td className="border border-slate-300 py-2 px-3 text-right font-mono text-slate-400">0 đ (Lập PIP)</td>
            </tr>
            <tr className="bg-slate-50 font-semibold">
              <td colSpan={3} className="border border-slate-300 py-2 px-3 text-right">Hoa hồng doanh số phát sinh:</td>
              <td className="border border-slate-300 py-2 px-3 text-right font-mono text-indigo-700 font-bold">{formatVND(totalCommission)}</td>
            </tr>
            <tr className="bg-slate-50 font-semibold">
              <td colSpan={3} className="border border-slate-300 py-2 px-3 text-right">Thưởng chuyên cần &amp; Sáng kiến cải tiến:</td>
              <td className="border border-slate-300 py-2 px-3 text-right font-mono text-amber-700 font-bold">{formatVND(totalOtherBonuses)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-black text-slate-900 text-sm">
              <td className="border border-slate-300 py-2.5 px-3 uppercase">Tổng Ngân Sách Đề Xuất Chi Trả:</td>
              <td className="border border-slate-300 py-2.5 px-3 text-center font-mono">{evaluations.length} CBNV</td>
              <td className="border border-slate-300 py-2.5 px-3 text-center font-mono">100%</td>
              <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-emerald-800 text-base">
                {formatVND(totalPayout)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
        Tổng số tiền bằng chữ:{' '}
        <b className="font-bold text-slate-900 uppercase">
          {numberToVietnameseWords(totalPayout)} đồng
        </b>
      </div>

      {/* 5. Chữ Ký */}
      <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs relative min-h-[140px]">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 uppercase">NGƯỜI LẬP TỜ TRÌNH</div>
          <div className="text-[11px] text-slate-500 italic">(Trưởng phòng Hành chính - Nhân sự)</div>
          <div className="h-14 flex items-center justify-center font-serif italic text-slate-700 text-sm">
            Phan Thị Ngọc Hà
          </div>
          <div className="font-semibold text-slate-900">Ban Thẩm Định Nhân Sự</div>
        </div>

        <div className="space-y-1 relative">
          <div className="font-bold text-slate-900 uppercase">BAN GIÁM ĐỐC DUYỆT</div>
          <div className="text-[11px] text-slate-500 italic">(Ký duyệt, chấp thuận tờ trình)</div>
          <div className="h-14 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
            {directorName}
          </div>
          <div className="font-semibold text-slate-900">{directorName}</div>

          {showRedSeal && (
            <div className="absolute top-1 right-8 pointer-events-none select-none opacity-85 rotate-[-10deg]">
              <div className="w-22 h-22 rounded-full border-2 border-dashed border-rose-600 p-1 flex flex-col items-center justify-center text-rose-600 font-bold text-[8px] text-center leading-tight bg-rose-50/20">
                <div className="uppercase font-black text-[7px]">{companyName}</div>
                <div className="text-[7px] text-rose-500 my-0.5">★ PHÊ DUYỆT ★</div>
                <div className="text-[7px] font-mono">{period}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
