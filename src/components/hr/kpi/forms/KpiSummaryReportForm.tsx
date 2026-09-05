import React from 'react';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { KpiEvaluation, StoreSettings } from '../../../../types';
import { formatVND } from '../../../../utils/vietqr';
import { numberToVietnameseWords } from '../../../../utils/numberToWords';

export interface KpiSummaryReportFormProps {
  evaluations: KpiEvaluation[];
  settings?: StoreSettings;
  period: string;
  showRedSeal: boolean;
}

export const KpiSummaryReportForm: React.FC<KpiSummaryReportFormProps> = ({
  evaluations,
  settings,
  period,
  showRedSeal,
}) => {
  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
  const companyAddress = settings?.address || '123 Đường Công Nghệ, TP. Dĩ An, Bình Dương';
  const directorName = settings?.defaultCreatorName || 'NGUYỄN VĂN PHÚC';

  const totalBase = evaluations.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalBonus = evaluations.reduce((sum, e) => sum + e.performanceBonus, 0);
  const totalCommission = evaluations.reduce((sum, e) => sum + e.commissionAmount, 0);
  const totalOther = evaluations.reduce((sum, e) => sum + e.attendanceBonus + e.initiativeBonus, 0);
  const totalPayout = evaluations.reduce((sum, e) => sum + e.totalGrossPayout, 0);
  const avgScore = evaluations.length > 0 ? (evaluations.reduce((sum, e) => sum + e.finalScore, 0) / evaluations.length).toFixed(1) : '0';

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'A+':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">A+ (Xuất sắc)</span>;
      case 'A':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">A (Tốt)</span>;
      case 'B':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">B (Khá)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">{rank} (PIP)</span>;
    }
  };

  return (
    <div className="bg-white text-slate-900 p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 max-w-5xl mx-auto space-y-6 text-sm">
      {/* 1. Header Văn Bản */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-4 text-xs">
        <div className="space-y-1">
          <div className="font-black text-slate-900 uppercase">{companyName}</div>
          <div className="text-slate-500 font-mono text-[11px]">{companyAddress}</div>
          <div className="text-slate-600 font-medium">Báo cáo kiểm soát chi phí &amp; phân bổ quỹ thưởng</div>
        </div>
        <div className="text-center space-y-1">
          <div className="font-bold text-slate-900 tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-semibold text-slate-700 underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
          <div className="text-slate-500 italic text-[11px] pt-1">
            Bình Dương, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* 2. Tiêu Đề Báo Cáo */}
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200 inline-block">
          MẪU 04 - BÁO CÁO TỔNG HỢP TOÀN DOANH NGHIỆP
        </span>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
          BÁO CÁO TỔNG HỢP ĐÁNH GIÁ KPI &amp; PHÂN BỔ QUỸ THƯỞNG
        </h2>
        <div className="text-xs text-slate-500 italic">
          (Kỳ đánh giá: <b className="text-slate-800 font-semibold">{period}</b> - Quy mô: <b className="text-slate-800 font-semibold">{evaluations.length} cán bộ nhân viên</b>)
        </div>
      </div>

      {/* 3. Bảng Kê Toàn Bộ Nhân Sự */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-center">
              <th className="border border-slate-300 py-2.5 px-2 w-10">STT</th>
              <th className="border border-slate-300 py-2.5 px-3 text-left">Nhân viên</th>
              <th className="border border-slate-300 py-2.5 px-3 text-left">Phòng ban</th>
              <th className="border border-slate-300 py-2.5 px-2 w-16">Điểm KPI</th>
              <th className="border border-slate-300 py-2.5 px-2">Xếp loại</th>
              <th className="border border-slate-300 py-2.5 px-3 text-right">Lương CB</th>
              <th className="border border-slate-300 py-2.5 px-3 text-right">Thưởng KPI</th>
              <th className="border border-slate-300 py-2.5 px-3 text-right">Hoa hồng</th>
              <th className="border border-slate-300 py-2.5 px-3 text-right">Chuyên cần &amp; SK</th>
              <th className="border border-slate-300 py-2.5 px-3 text-right">Tổng thực lĩnh</th>
              <th className="border border-slate-300 py-2.5 px-2 text-center">Duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {evaluations.map((e, idx) => (
              <tr key={e.id || idx} className="hover:bg-slate-50">
                <td className="border border-slate-300 py-2 px-2 text-center font-bold text-slate-400">{idx + 1}</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900">
                  <div>{e.employeeName}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-normal">{e.employeeCode} • {e.role}</div>
                </td>
                <td className="border border-slate-300 py-2 px-3 text-slate-600 text-[11px]">{e.department}</td>
                <td className="border border-slate-300 py-2 px-2 text-center font-mono font-black text-emerald-700">{e.finalScore}đ</td>
                <td className="border border-slate-300 py-2 px-2 text-center">{getRankBadge(e.rank)}</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono text-slate-700">{formatVND(e.baseSalary)}</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-bold text-emerald-700">+{formatVND(e.performanceBonus)}</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono text-blue-700">+{formatVND(e.commissionAmount)}</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono text-amber-700">+{formatVND(e.attendanceBonus + e.initiativeBonus)}</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-black text-slate-900">{formatVND(e.totalGrossPayout)}</td>
                <td className="border border-slate-300 py-2 px-2 text-center">
                  {e.directorApprovalStatus === 'approved' ? (
                    <span className="text-emerald-600 font-bold" title="Đã duyệt">✓</span>
                  ) : (
                    <span className="text-amber-500 font-bold" title="Chờ duyệt">⏳</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-black text-slate-900 text-xs">
              <td colSpan={3} className="border border-slate-300 py-2.5 px-3 uppercase">
                TỔNG CỘNG ({evaluations.length} NHÂN SỰ - ĐIỂM TB: {avgScore}đ):
              </td>
              <td className="border border-slate-300 py-2.5 px-2 text-center font-mono text-emerald-700">{avgScore}đ</td>
              <td className="border border-slate-300 py-2.5 px-2 text-center">-</td>
              <td className="border border-slate-300 py-2.5 px-3 text-right font-mono">{formatVND(totalBase)}</td>
              <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-emerald-800 font-bold">{formatVND(totalBonus)}</td>
              <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-blue-800">{formatVND(totalCommission)}</td>
              <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-amber-800">{formatVND(totalOther)}</td>
              <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-emerald-900 font-black text-sm">{formatVND(totalPayout)}</td>
              <td className="border border-slate-300 py-2.5 px-2 text-center">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-slate-800">
        Tổng ngân sách chi trả đợt này bằng chữ:{' '}
        <b className="font-bold text-slate-900 uppercase">
          {numberToVietnameseWords(totalPayout)} đồng
        </b>
      </div>

      {/* 4. Chữ Ký 3 Bên */}
      <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs relative min-h-[140px]">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 uppercase">KẾ TOÁN TRƯỞNG</div>
          <div className="text-[11px] text-slate-500 italic">(Đối soát &amp; lập bảng)</div>
          <div className="h-14 flex items-center justify-center font-serif italic text-slate-700 text-sm">
            Nguyễn Thu Trang
          </div>
          <div className="font-semibold text-slate-900">Ban Kế Toán Tài Chính</div>
        </div>

        <div className="space-y-1">
          <div className="font-bold text-slate-900 uppercase">TRƯỞNG PHÒNG NHÂN SỰ</div>
          <div className="text-[11px] text-slate-500 italic">(Thẩm định điểm &amp; xếp loại)</div>
          <div className="h-14 flex items-center justify-center font-serif italic text-slate-700 text-sm">
            Phan Thị Ngọc Hà
          </div>
          <div className="font-semibold text-slate-900">Ban Thẩm Định KPI</div>
        </div>

        <div className="space-y-1 relative">
          <div className="font-bold text-slate-900 uppercase">TỔNG GIÁM ĐỐC</div>
          <div className="text-[11px] text-slate-500 italic">(Ký duyệt chi &amp; ban hành)</div>
          <div className="h-14 flex items-center justify-center font-serif italic text-slate-800 font-bold text-sm">
            {directorName}
          </div>
          <div className="font-semibold text-slate-900">{directorName}</div>

          {showRedSeal && (
            <div className="absolute top-1 right-6 pointer-events-none select-none opacity-85 rotate-[-12deg]">
              <div className="w-22 h-22 rounded-full border-2 border-dashed border-rose-600 p-1 flex flex-col items-center justify-center text-rose-600 font-bold text-[8px] text-center leading-tight bg-rose-50/20">
                <div className="uppercase font-black text-[7px]">{companyName}</div>
                <div className="text-[7px] text-rose-500 my-0.5">★ DUYỆT CHI KPI ★</div>
                <div className="text-[7px] font-mono">{period}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
