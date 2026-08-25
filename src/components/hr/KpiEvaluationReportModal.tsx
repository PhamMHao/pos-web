import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileCheck,
  Award,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  Stamp,
  Calendar,
  Layers,
  Percent,
  DollarSign,
  Briefcase,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Employee, KpiEvaluation, StoreSettings, DigitalSignatureMetadata } from '../../types';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { formatVND } from '../../utils/vietqr';
import { GiaPhucLogo } from '../common/GiaPhucLogo';
import { DocumentSignerModal } from '../signatures/DocumentSignerModal';
import { SignatureVerificationBadge } from '../signatures/SignatureVerificationBadge';

export interface KpiEvaluationReportModalProps {
  evaluations: KpiEvaluation[];
  employees?: Employee[];
  settings?: StoreSettings;
  initialEvaluationId?: string;
  onClose: () => void;
  onApproveEvaluation?: (evalId: string) => void;
}

export const KpiEvaluationReportModal: React.FC<KpiEvaluationReportModalProps> = ({
  evaluations = [],
  employees = [],
  settings,
  initialEvaluationId,
  onClose,
  onApproveEvaluation,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'form01' | 'form02' | 'form03' | 'form04'>('form01');
  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    initialEvaluationId || evaluations[0]?.id || ''
  );
  const [showRedSeal, setShowRedSeal] = useState<boolean>(true);
  const [showCaSignModal, setShowCaSignModal] = useState<boolean>(false);
  const [kpiDecisionSignature, setKpiDecisionSignature] = useState<DigitalSignatureMetadata | null>(null);

  const currentEval = evaluations.find((e) => e.id === selectedEvalId) || evaluations[0];
  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
  const companyAddress = settings?.address || '123 Đường Công Nghệ, TP. Dĩ An, Bình Dương';
  const companyTaxCode = settings?.taxCode || '3702918234';
  const storeBrand = settings?.brandName || settings?.storeName || 'GIA PHÚC COMPUTER';
  const directorName = settings?.defaultCreatorName || 'NGUYỄN VĂN PHÚC';

  const totalBonusFund = evaluations.reduce((sum, e) => sum + e.performanceBonus, 0);
  const totalPayoutFund = evaluations.reduce((sum, e) => sum + e.totalGrossPayout, 0);
  const totalInitiativeFund = evaluations.reduce((sum, e) => sum + e.initiativeBonus, 0);
  const totalAttendanceFund = evaluations.reduce((sum, e) => sum + e.attendanceBonus, 0);
  const totalCommissionFund = evaluations.reduce((sum, e) => sum + e.commissionAmount, 0);

  const rankCounts = {
    'A+': evaluations.filter((e) => e.rank === 'A+').length,
    A: evaluations.filter((e) => e.rank === 'A').length,
    B: evaluations.filter((e) => e.rank === 'B').length,
    C: evaluations.filter((e) => e.rank === 'C' || e.rank === 'D').length,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let xmlWorksheet = '';
    const reportDate = new Date().toLocaleDateString('vi-VN');

    if (activeFormTab === 'form01' && currentEval) {
      xmlWorksheet = `
      <Row ss:Height="26"><Cell ss:MergeAcross="5" ss:StyleID="TitleHeader"><Data ss:Type="String">PHIẾU ĐÁNH GIÁ KPI CÁ NHÂN - ${currentEval.employeeName.toUpperCase()}</Data></Cell></Row>
      <Row><Cell ss:MergeAcross="5" ss:StyleID="SubHeader"><Data ss:Type="String">Mã NV: ${currentEval.employeeCode} | Chức danh: ${currentEval.role} | Kỳ: ${currentEval.period}</Data></Cell></Row>
      <Row ss:Height="10"/>
      <Row ss:Height="22">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">STT</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Nội Dung Tiêu Chí Đánh Giá</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tỷ Trọng (%)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chỉ Tiêu Giao</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thực Tế Đạt</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Điểm Duyệt (/100)</Data></Cell>
      </Row>
      ${currentEval.criteria
        .map(
          (c, idx) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell><Data ss:Type="String">${c.name}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${c.weight}</Data></Cell>
        <Cell><Data ss:Type="String">${c.targetValue}</Data></Cell>
        <Cell><Data ss:Type="String">${c.actualValue}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${c.managerScore}</Data></Cell>
      </Row>`
        )
        .join('')}
      <Row ss:Height="20">
        <Cell ss:MergeAcross="4" ss:StyleID="KpiLabel"><Data ss:Type="String">ĐIỂM KPI TỔNG HỢP &amp; XẾP LOẠI:</Data></Cell>
        <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${currentEval.finalScore} điểm (Loại ${currentEval.rank})</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="4" ss:StyleID="KpiLabel"><Data ss:Type="String">TIỀN THƯỞNG HIỆU SUẤT KPI (ĐIỀU 104 BLLĐ):</Data></Cell>
        <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(currentEval.performanceBonus)}</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="4" ss:StyleID="KpiLabel"><Data ss:Type="String">TỔNG THU NHẬP THỰC LĨNH TRƯỚC THUẾ:</Data></Cell>
        <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(currentEval.totalGrossPayout)}</Data></Cell>
      </Row>`;
    } else {
      xmlWorksheet = `
      <Row ss:Height="26"><Cell ss:MergeAcross="7" ss:StyleID="TitleHeader"><Data ss:Type="String">BẢNG TỔNG HỢP ĐÁNH GIÁ KPI VÀ PHÂN BỔ QUỸ THƯỞNG</Data></Cell></Row>
      <Row><Cell ss:MergeAcross="7" ss:StyleID="SubHeader"><Data ss:Type="String">Đơn vị: ${companyName} | Kỳ: Tháng 02/2026</Data></Cell></Row>
      <Row ss:Height="10"/>
      <Row ss:Height="22">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã NV</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Họ và Tên</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chức Danh / Phòng Ban</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Điểm KPI</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Xếp Loại</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lương Cơ Bản</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thưởng KPI</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tổng Thực Lĩnh</Data></Cell>
      </Row>
      ${evaluations
        .map(
          (e) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${e.employeeCode}</Data></Cell>
        <Cell><Data ss:Type="String">${e.employeeName}</Data></Cell>
        <Cell><Data ss:Type="String">${e.role}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${e.finalScore}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${e.rank}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.baseSalary}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.performanceBonus}</Data></Cell>
        <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.totalGrossPayout}</Data></Cell>
      </Row>`
        )
        .join('')}`;
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="TitleHeader">
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#0f766e"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#64748b"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="ColHeader">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
      <Interior ss:Color="#0f766e" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="KpiLabel">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1e293b"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="KpiValue">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#0f766e"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CurrencyCell">
      <NumberFormat ss:Format="#,##0"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="CenterCell">
      <Alignment ss:Horizontal="Center"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Bao_Cao_KPI_Khen_Thuong">
    <Table ss:DefaultColumnWidth="130">
      ${xmlWorksheet}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bieu_Mau_KPI_BLLD2019_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <span>Hồ Sơ Đánh Giá KPI &amp; Khen Thưởng Pháp Quy</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Điều 104 BLLĐ 2019
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Biểu mẫu chuẩn thể thức văn bản hành chính nhà nước &amp; Quyết định pháp quy doanh nghiệp
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Toggle Red Seal Stamp */}
            <button
              onClick={() => setShowRedSeal(!showRedSeal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                showRedSeal
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Bật/Tắt dấu mộc đỏ pháp nhân công ty"
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>{showRedSeal ? 'Đang bật Mộc Đỏ' : 'Tắt Mộc Đỏ'}</span>
            </button>

            {/* SmartCA Digital Signature Button for Mẫu 03 */}
            {activeFormTab === 'form03' && (
              <button
                onClick={() => setShowCaSignModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                title="Ký số từ xa Viettel/VNPT/FPT SmartCA phê duyệt ban hành Quyết định khen thưởng"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{kpiDecisionSignature ? 'Ký Lại QĐ (CA)' : 'Ký Số QĐ (SmartCA)'}</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Bản A4</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Form Selector Tabs & Employee Selector (Hidden on print) */}
        <div className="print:hidden px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFormTab('form01')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeFormTab === 'form01'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              Mẫu 01: Phiếu Đánh Giá Cá Nhân
            </button>
            <button
              onClick={() => setActiveFormTab('form02')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeFormTab === 'form02'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              Mẫu 02: Tờ Trình Đề Xuất Thưởng
            </button>
            <button
              onClick={() => setActiveFormTab('form03')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeFormTab === 'form03'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              Mẫu 03: Quyết Định Khen Thưởng (QĐ)
            </button>
            <button
              onClick={() => setActiveFormTab('form04')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeFormTab === 'form04'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
              }`}
            >
              Mẫu 04: Báo Cáo Phân Bổ Quỹ Thưởng
            </button>
          </div>

          {activeFormTab === 'form01' && (
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-slate-400 font-medium">Nhân sự:</span>
              <select
                value={selectedEvalId}
                onChange={(e) => setSelectedEvalId(e.target.value)}
                className="bg-slate-950 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
              >
                {evaluations.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.employeeCode} - {ev.employeeName} ({ev.finalScore}đ - {ev.rank})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Printable Document Paper Area (A4 Container) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center print:p-0 print:m-0 print:bg-white">
          <div className="w-full max-w-[850px] bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-300 font-serif relative print:p-6 print:border-none print:shadow-none print:max-w-none print:rounded-none">
            
            {/* ========================================================================= */}
            {/* MẪU 01: PHIẾU ĐÁNH GIÁ & TỰ ĐÁNH GIÁ KPI CÁ NHÂN                         */}
            {/* ========================================================================= */}
            {activeFormTab === 'form01' && currentEval && (
              <div className="space-y-6 text-[13px] leading-relaxed">
                {/* Header: Quốc hiệu & Tên Đơn Vị */}
                <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-900">
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wide">{companyName}</p>
                    <p className="text-[11px] text-slate-700">Mã Đơn Vị: GPERP-2026</p>
                    <p className="text-[11px] text-slate-700">Mã Phiếu: KPI-{currentEval.employeeCode}-022026</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs italic">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic mt-1">--------o0o--------</p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900">
                    PHIẾU ĐÁNH GIÁ VÀ TỰ ĐÁNH GIÁ KẾT QUẢ CÔNG VIỆC
                  </h1>
                  <p className="font-semibold italic text-xs text-slate-700">
                    (Kỳ đánh giá: {currentEval.period} - Căn cứ Điều 104 Bộ Luật Lao Động 2019)
                  </p>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold">Họ và tên nhân viên:</span> {currentEval.employeeName}
                  </div>
                  <div>
                    <span className="font-bold">Mã nhân viên:</span> {currentEval.employeeCode}
                  </div>
                  <div>
                    <span className="font-bold">Chức danh / Vị trí:</span> {currentEval.role}
                  </div>
                  <div>
                    <span className="font-bold">Phòng ban:</span> {currentEval.department}
                  </div>
                  <div>
                    <span className="font-bold">Lương cơ bản (HĐLĐ):</span> {formatVND(currentEval.baseSalary)}
                  </div>
                  <div>
                    <span className="font-bold">Doanh số thực đạt:</span> {formatVND(currentEval.salesRevenue)}
                  </div>
                </div>

                {/* Evaluation Criteria Table */}
                <div className="space-y-2">
                  <h3 className="font-bold uppercase text-xs tracking-wider">
                    I. BẢNG CHI TIẾT TIÊU CHÍ VÀ KẾT QUẢ ĐÁNH GIÁ KPI:
                  </h3>
                  <table className="w-full border-collapse border border-slate-400 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-center">
                        <th className="border border-slate-400 p-2 w-8">STT</th>
                        <th className="border border-slate-400 p-2 text-left">Nội dung Tiêu chí Đánh giá</th>
                        <th className="border border-slate-400 p-2 w-16">Tỷ trọng (%)</th>
                        <th className="border border-slate-400 p-2 text-left">Chỉ tiêu giao</th>
                        <th className="border border-slate-400 p-2 text-left">Thực tế đạt</th>
                        <th className="border border-slate-400 p-2 w-16">Tự chấm</th>
                        <th className="border border-slate-400 p-2 w-16">Quản lý duyệt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEval.criteria.map((c, idx) => (
                        <tr key={c.id}>
                          <td className="border border-slate-400 p-1.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-400 p-1.5">
                            <p className="font-bold">{c.name}</p>
                            <p className="text-[10px] text-slate-600 italic">{c.description}</p>
                          </td>
                          <td className="border border-slate-400 p-1.5 text-center font-bold">{c.weight}%</td>
                          <td className="border border-slate-400 p-1.5">{c.targetValue}</td>
                          <td className="border border-slate-400 p-1.5 font-semibold text-emerald-800">{c.actualValue}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-semibold">{c.selfScore}</td>
                          <td className="border border-slate-400 p-1.5 text-center font-bold text-blue-900 bg-blue-50/50">
                            {c.managerScore}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={2} className="border border-slate-400 p-2 text-right uppercase">
                          Tổng điểm đánh giá &amp; Xếp loại:
                        </td>
                        <td className="border border-slate-400 p-2 text-center">100%</td>
                        <td colSpan={2} className="border border-slate-400 p-2 text-center text-xs">
                          Xếp Loại: <span className="text-emerald-800 font-extrabold text-sm">{currentEval.rank}</span>
                        </td>
                        <td className="border border-slate-400 p-2 text-center">{currentEval.selfTotalScore}</td>
                        <td className="border border-slate-400 p-2 text-center text-blue-900 text-sm font-extrabold bg-blue-100">
                          {currentEval.finalScore}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-1 text-xs">
                  <h3 className="font-bold uppercase tracking-wider">II. Ý KIẾN NHẬN XÉT VÀ KẾ HOẠCH PHÁT TRIỂN:</h3>
                  <div className="p-2.5 rounded border border-slate-300 space-y-1">
                    <p>
                      <span className="font-bold">1. Điểm mạnh:</span> {currentEval.employeeStrengths}
                    </p>
                    <p>
                      <span className="font-bold">2. Điểm cần khắc phục:</span> {currentEval.employeeImprovements}
                    </p>
                    <p>
                      <span className="font-bold">3. Kế hoạch phát triển kỳ tới:</span> {currentEval.developmentPlan}
                    </p>
                  </div>
                </div>

                {/* Payroll & Bonus Summary */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider">
                    III. TỔNG HỢP TIỀN LƯƠNG &amp; THƯỞNG HIỆU SUẤT (ĐIỀU 104 BLLĐ 2019):
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-400 text-center">
                      <thead className="bg-slate-100 font-bold">
                        <tr>
                          <th className="border border-slate-400 p-1.5">Lương HĐLĐ</th>
                          <th className="border border-slate-400 p-1.5">Thưởng KPI ({currentEval.performanceBonusRate}%)</th>
                          <th className="border border-slate-400 p-1.5">Hoa Hồng Doanh Số</th>
                          <th className="border border-slate-400 p-1.5">Chuyên Cần</th>
                          <th className="border border-slate-400 p-1.5">Sáng Kiến</th>
                          <th className="border border-slate-400 p-1.5 bg-emerald-50 text-emerald-900">Tổng Thực Lĩnh</th>
                        </tr>
                      </thead>
                      <tbody className="font-semibold">
                        <tr>
                          <td className="border border-slate-400 p-1.5">{formatVND(currentEval.baseSalary)}</td>
                          <td className="border border-slate-400 p-1.5 text-blue-800">+{formatVND(currentEval.performanceBonus)}</td>
                          <td className="border border-slate-400 p-1.5 text-cyan-800">+{formatVND(currentEval.commissionAmount)}</td>
                          <td className="border border-slate-400 p-1.5">+{formatVND(currentEval.attendanceBonus)}</td>
                          <td className="border border-slate-400 p-1.5">+{formatVND(currentEval.initiativeBonus)}</td>
                          <td className="border border-slate-400 p-1.5 text-emerald-900 font-bold text-sm bg-emerald-50">
                            {formatVND(currentEval.totalGrossPayout)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="italic text-slate-700">
                    Bằng chữ: <span className="font-bold text-slate-900">{numberToVietnameseWords(currentEval.totalGrossPayout)}</span>
                  </p>
                </div>

                {/* Signatures Area with Optional Red Seal */}
                <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs relative min-h-[160px]">
                  <div>
                    <p className="font-bold uppercase">NGƯỜI LAO ĐỘNG</p>
                    <p className="text-[11px] italic">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                      {currentEval.employeeName}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold uppercase">QUẢN LÝ TRỰC TIẾP</p>
                    <p className="text-[11px] italic">(Ký và duyệt điểm)</p>
                    <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                      Trưởng Bộ Phận
                    </div>
                  </div>

                  <div className="relative">
                    <p className="font-bold uppercase">TỔNG GIÁM ĐỐC</p>
                    <p className="text-[11px] italic">(Ký duyệt &amp; đóng dấu)</p>
                    
                    {/* Red Seal Stamp Graphic */}
                    {showRedSeal && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-2 border-red-600/80 text-red-600 p-1 flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none opacity-85 select-none">
                        <div className="w-full h-full rounded-full border border-dashed border-red-600 flex flex-col items-center justify-center p-1 text-[9px] font-bold text-center leading-tight">
                          <span>{companyName}</span>
                          <span className="text-[7px] text-red-700">★ ĐÃ PHÊ DUYỆT ★</span>
                          <span className="text-[8px] font-black">GIÁM ĐỐC</span>
                        </div>
                      </div>
                    )}

                    <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                      {directorName}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MẪU 02: TỜ TRÌNH ĐỀ XUẤT KHEN THƯỞNG HIỆU SUẤT KPI                       */}
            {/* ========================================================================= */}
            {activeFormTab === 'form02' && (
              <div className="space-y-6 text-[13px] leading-relaxed">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-900">
                  <div>
                    <p className="font-bold text-xs uppercase">{companyName}</p>
                    <p className="text-[11px]">Số: TT-KT-2026/02-GPERP</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs italic">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic">Bình Dương, ngày 25 tháng 02 năm 2026</p>
                  </div>
                </div>

                <div className="text-center space-y-1 py-2">
                  <h1 className="text-lg sm:text-xl font-bold uppercase text-slate-900">
                    TỜ TRÌNH
                  </h1>
                  <p className="font-bold text-sm">
                    V/v: Đề xuất khen thưởng và chi trả quỹ thưởng hiệu suất KPI Tháng 02/2026
                  </p>
                  <p className="italic text-xs text-slate-600">Kính gửi: BAN TỔNG GIÁM ĐỐC CÔNG TY</p>
                </div>

                <div className="space-y-3 text-xs text-justify">
                  <p>
                    - Căn cứ Bộ Luật Lao Động số 45/2019/QH14 được Quốc hội ban hành ngày 20/11/2019;
                  </p>
                  <p>
                    - Căn cứ Quy chế Đánh giá Hiệu quả công việc (KPI) và Quy chế Khen thưởng của {companyName};
                  </p>
                  <p>
                    - Căn cứ kết quả thẩm định thực tế của các Trưởng bộ phận trong kỳ đánh giá Tháng 02/2026;
                  </p>
                  <p>
                    Phòng Nhân sự kính trình Ban Tổng Giám Đốc xem xét và phê duyệt kết quả đánh giá KPI cùng ngân sách khen thưởng toàn công ty như sau:
                  </p>

                  <div className="p-3 bg-slate-50 rounded border border-slate-300 space-y-1.5">
                    <p><span className="font-bold">1. Tổng số nhân sự tham gia đánh giá:</span> {evaluations.length} CBNV (100% đạt chuẩn)</p>
                    <p><span className="font-bold">2. Kết quả xếp loại hiệu suất:</span></p>
                    <ul className="list-disc pl-6 space-y-0.5">
                      <li>Loại A+ (Xuất sắc ≥ 95đ): <span className="font-bold text-emerald-800">{rankCounts['A+']} nhân sự</span></li>
                      <li>Loại A (Tốt 85 – 94.9đ): <span className="font-bold text-blue-800">{rankCounts['A']} nhân sự</span></li>
                      <li>Loại B (Khá 70 – 84.9đ): <span className="font-bold text-amber-800">{rankCounts['B']} nhân sự</span></li>
                      <li>Loại C/D (Cần cải thiện &lt; 70đ): <span className="font-bold text-rose-800">{rankCounts['C']} nhân sự</span></li>
                    </ul>
                    <p><span className="font-bold">3. Tổng kinh phí thưởng hiệu suất đề xuất:</span> <span className="font-bold text-emerald-800">{formatVND(totalBonusFund)}</span></p>
                    <p><span className="font-bold">4. Tổng ngân sách chi trả (Lương + Thưởng + Hoa hồng):</span> <span className="font-bold text-blue-900">{formatVND(totalPayoutFund)}</span></p>
                    <p className="italic text-slate-700">(Bằng chữ: {numberToVietnameseWords(totalPayoutFund)})</p>
                  </div>

                  <p>
                    Kính trình Ban Tổng Giám Đốc xem xét, phê duyệt ban hành Quyết định khen thưởng để Phòng Kế toán thực hiện chi trả lương thưởng đúng hạn.
                  </p>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs">
                  <div>
                    <p className="font-bold uppercase">TRƯỞNG PHÒNG NHÂN SỰ</p>
                    <p className="italic text-[11px]">(Ký và ghi rõ họ tên)</p>
                    <div className="h-20 flex items-end justify-center font-bold text-blue-900">
                      Bùi Thị Mỹ Dung
                    </div>
                  </div>
                  <div>
                    <p className="font-bold uppercase">PHÊ DUYỆT CỦA TỔNG GIÁM ĐỐC</p>
                    <p className="italic text-[11px]">(Ký, đóng dấu duyệt chi)</p>
                    <div className="h-20 flex items-end justify-center font-bold text-blue-900">
                      {directorName}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MẪU 03: QUYẾT ĐỊNH KHEN THƯỞNG PHÁP QUY (QĐ-KT-2026/02-GPERP)             */}
            {/* ========================================================================= */}
            {activeFormTab === 'form03' && (
              <div className="space-y-6 text-[13px] leading-relaxed">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-900">
                  <div>
                    <p className="font-bold text-xs uppercase">{companyName}</p>
                    <p className="text-[11px]">Số: QĐ-KT-2026/02-GPERP</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs italic">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] italic">Bình Dương, ngày 25 tháng 02 năm 2026</p>
                  </div>
                </div>

                <div className="text-center space-y-1 py-2">
                  <h1 className="text-lg sm:text-xl font-bold uppercase text-slate-900">
                    QUYẾT ĐỊNH
                  </h1>
                  <p className="font-bold text-sm">
                    V/v: Khen thưởng và chi trả tiền thưởng hiệu suất công việc (KPI) Tháng 02/2026
                  </p>
                  <p className="font-bold text-xs uppercase text-slate-700">TỔNG GIÁM ĐỐC {companyName}</p>
                </div>

                <div className="space-y-2.5 text-xs text-justify">
                  <p>- Căn cứ Luật Doanh nghiệp số 59/2020/QH14 được Quốc hội thông qua ngày 17/06/2020;</p>
                  <p>- Căn cứ Điều 104 Bộ Luật Lao Động số 45/2019/QH14 quy định về tiền thưởng của người lao động;</p>
                  <p>- Căn cứ Điều lệ tổ chức và Quy chế Khen thưởng của {companyName};</p>
                  <p>- Xét Tờ trình số TT-KT-2026/02-GPERP của Trưởng Phòng Nhân sự ngày 25/02/2026;</p>

                  <p className="text-center font-bold text-sm uppercase py-1 text-slate-900">QUYẾT ĐỊNH:</p>

                  <p>
                    <span className="font-bold">Điều 1:</span> Tuyên dương và khen thưởng thành tích hoàn thành xuất sắc và tốt chỉ tiêu KPI Tháng 02/2026 cho các Cán bộ Nhân viên có tên trong danh sách phụ lục đính kèm.
                  </p>
                  <p>
                    <span className="font-bold">Điều 2:</span> Phê duyệt tổng kinh phí chi trả thưởng hiệu suất là <span className="font-bold text-emerald-800">{formatVND(totalBonusFund)}</span> (Bằng chữ: {numberToVietnameseWords(totalBonusFund)}). Kinh phí được trích từ Quỹ Khen thưởng Doanh nghiệp.
                  </p>
                  <p>
                    <span className="font-bold">Điều 3:</span> Quyết định này có hiệu lực thi hành kể từ ngày ký. Phòng Kế toán - Tài chính, Phòng Nhân sự và các cá nhân có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.
                  </p>
                </div>

                {/* Signatures with Seal */}
                <div className="pt-6 grid grid-cols-2 gap-4 text-xs relative">
                  <div>
                    <p className="font-bold uppercase text-[11px]">Nơi nhận:</p>
                    <ul className="text-[11px] list-disc pl-5 space-y-0.5 text-slate-700">
                      <li>Như Điều 3;</li>
                      <li>Ban Lãnh Đạo Công ty;</li>
                      <li>Lưu: VT, HR.</li>
                    </ul>
                  </div>

                  <div className="text-center relative min-h-[140px]">
                    <p className="font-bold uppercase">TỔNG GIÁM ĐỐC</p>
                    <p className="italic text-[11px]">(Ký tên và đóng dấu)</p>

                    {/* Verified Digital Signature Stamp Badge */}
                    {kpiDecisionSignature && (
                      <div className="mb-2 flex justify-center">
                        <SignatureVerificationBadge signature={kpiDecisionSignature} size="sm" />
                      </div>
                    )}

                    {showRedSeal && !kpiDecisionSignature && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-2 border-red-600 text-red-600 p-1 flex flex-col items-center justify-center rotate-[-10deg] pointer-events-none opacity-90 select-none">
                        <div className="w-full h-full rounded-full border border-dashed border-red-600 flex flex-col items-center justify-center p-1 text-[9px] font-bold text-center leading-tight">
                          <span>{companyName}</span>
                          <span className="text-[7px] text-red-700">★ MST: {companyTaxCode} ★</span>
                          <span className="text-[9px] font-black">TỔNG GIÁM ĐỐC</span>
                        </div>
                      </div>
                    )}

                    <div className="h-20 flex items-end justify-center font-bold text-blue-900">
                      {directorName}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* MẪU 04: BÁO CÁO TỔNG HỢP KPI & PHÂN BỔ QUỸ THƯỞNG TOÀN DOANH NGHIỆP       */}
            {/* ========================================================================= */}
            {activeFormTab === 'form04' && (
              <div className="space-y-6 text-[13px] leading-relaxed">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-slate-900">
                  <div>
                    <p className="font-bold text-xs uppercase">{companyName}</p>
                    <p className="text-[11px]">Báo Cáo Quản Trị KPI - BLLĐ 2019</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-xs italic">Độc lập - Tự do - Hạnh phúc</p>
                  </div>
                </div>

                <div className="text-center space-y-1 py-1">
                  <h1 className="text-lg sm:text-xl font-bold uppercase text-slate-900">
                    BÁO CÁO TỔNG HỢP ĐÁNH GIÁ KPI &amp; PHÂN BỔ QUỸ THƯỞNG
                  </h1>
                  <p className="font-semibold italic text-xs text-slate-700">
                    Kỳ tổng hợp: Tháng 02/2026 | Áp dụng toàn bộ các phòng ban
                  </p>
                </div>

                <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                  <thead className="bg-slate-100 font-bold text-center">
                    <tr>
                      <th className="border border-slate-400 p-2">Mã NV</th>
                      <th className="border border-slate-400 p-2">Họ và Tên</th>
                      <th className="border border-slate-400 p-2">Phòng Ban / Vị Trí</th>
                      <th className="border border-slate-400 p-2">Điểm KPI</th>
                      <th className="border border-slate-400 p-2">Xếp Loại</th>
                      <th className="border border-slate-400 p-2 text-right">Lương Cơ Bản</th>
                      <th className="border border-slate-400 p-2 text-right">Thưởng KPI</th>
                      <th className="border border-slate-400 p-2 text-right">Tổng Thực Lĩnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((e) => (
                      <tr key={e.id}>
                        <td className="border border-slate-400 p-2 text-center font-bold">{e.employeeCode}</td>
                        <td className="border border-slate-400 p-2 font-bold">{e.employeeName}</td>
                        <td className="border border-slate-400 p-2">{e.role}</td>
                        <td className="border border-slate-400 p-2 text-center font-bold text-blue-900">{e.finalScore}</td>
                        <td className="border border-slate-400 p-2 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            e.rank === 'A+' ? 'bg-emerald-100 text-emerald-900' :
                            e.rank === 'A' ? 'bg-blue-100 text-blue-900' :
                            e.rank === 'B' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            Loại {e.rank}
                          </span>
                        </td>
                        <td className="border border-slate-400 p-2 text-right">{formatVND(e.baseSalary)}</td>
                        <td className="border border-slate-400 p-2 text-right font-bold text-emerald-800">
                          +{formatVND(e.performanceBonus)}
                        </td>
                        <td className="border border-slate-400 p-2 text-right font-extrabold text-blue-950 bg-slate-50">
                          {formatVND(e.totalGrossPayout)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-extrabold">
                      <td colSpan={5} className="border border-slate-400 p-2 text-right uppercase">
                        Tổng cộng toàn công ty:
                      </td>
                      <td className="border border-slate-400 p-2 text-right">
                        {formatVND(evaluations.reduce((sum, e) => sum + e.baseSalary, 0))}
                      </td>
                      <td className="border border-slate-400 p-2 text-right text-emerald-900 text-sm">
                        {formatVND(totalBonusFund)}
                      </td>
                      <td className="border border-slate-400 p-2 text-right text-blue-950 text-sm bg-blue-100/50">
                        {formatVND(totalPayoutFund)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="font-bold uppercase">NGƯỜI LẬP BÁO CÁO</p>
                    <p className="italic text-[11px]">(Ký, họ tên)</p>
                    <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                      Chuyên Viên HR
                    </div>
                  </div>
                  <div>
                    <p className="font-bold uppercase">KẾ TOÁN TRƯỞNG</p>
                    <p className="italic text-[11px]">(Ký, đối soát)</p>
                    <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                      Võ Thị Thơm
                    </div>
                  </div>
                  <div>
                    <p className="font-bold uppercase">TỔNG GIÁM ĐỐC</p>
                    <p className="italic text-[11px]">(Phê duyệt)</p>
                    <div className="h-16 flex items-end justify-center font-bold text-blue-900">
                      {directorName}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CA Digital Signer Modal for Mẫu 03 Decision */}
      {showCaSignModal && (
        <DocumentSignerModal
          document={{
            id: 'kpi-dec-2026-02',
            code: 'QĐ-KT-2026/02-GPERP',
            title: 'Quyết Định Khen Thưởng & Chi Trả Thưởng Hiệu Suất KPI Tháng 02/2026 (Điều 104 BLLĐ 2019)',
            type: 'kpi_decision',
            typeLabel: 'Quyết Định Khen Thưởng KPI',
            createdAt: '2026-02-25',
            totalAmount: totalBonusFund,
            creatorName: 'Phòng Nhân Sự & Ban Giám Đốc',
            recipientName: 'Toàn thể Cán bộ Nhân viên GP-ERP',
            status: 'pending',
            legalStandard: 'PAdES B-LT (ETSI EN 319 142)',
          }}
          settings={settings}
          onClose={() => setShowCaSignModal(false)}
          onSignSuccess={(sig) => {
            setKpiDecisionSignature(sig);
            setShowCaSignModal(false);
          }}
        />
      )}
    </div>
  );
};
