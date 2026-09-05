import { KpiEvaluation } from '../../../types';
import { formatVND } from '../../../utils/vietqr';

export interface ExportKpiExcelOptions {
  companyName: string;
  reportPeriod: string;
  activeFormTab: 'form01' | 'form02' | 'form03' | 'form04' | 'all';
  currentEval?: KpiEvaluation;
  evaluations: KpiEvaluation[];
}

export function exportKpiExcelFile({
  companyName,
  reportPeriod,
  activeFormTab,
  currentEval,
  evaluations,
}: ExportKpiExcelOptions) {
  let xmlWorksheets = '';

  // Sheet 1: Mẫu 01 - Phiếu đánh giá cá nhân (nếu có currentEval)
  if ((activeFormTab === 'form01' || activeFormTab === 'all') && currentEval) {
    xmlWorksheets += `
    <Worksheet ss:Name="Mau01_Phieu_KPI_Ca_Nhan">
      <Table ss:DefaultColumnWidth="120">
        <Column ss:Width="40"/>
        <Column ss:Width="250"/>
        <Column ss:Width="70"/>
        <Column ss:Width="160"/>
        <Column ss:Width="160"/>
        <Column ss:Width="90"/>
        <Row ss:Height="24"><Cell ss:MergeAcross="5" ss:StyleID="TitleHeader"><Data ss:Type="String">PHIẾU ĐÁNH GIÁ &amp; TỰ ĐÁNH GIÁ KẾT QUẢ CÔNG VIỆC (MẪU 01)</Data></Cell></Row>
        <Row><Cell ss:MergeAcross="5" ss:StyleID="SubHeader"><Data ss:Type="String">Căn cứ Điều 104 Bộ Luật Lao Động 2019 | Đơn vị: ${companyName}</Data></Cell></Row>
        <Row><Cell ss:MergeAcross="5" ss:StyleID="SubHeader"><Data ss:Type="String">Họ tên: ${currentEval.employeeName.toUpperCase()} | Mã NV: ${currentEval.employeeCode} | Chức vụ: ${currentEval.role} | Kỳ: ${currentEval.period}</Data></Cell></Row>
        <Row ss:Height="10"/>
        <Row ss:Height="22">
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">STT</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tiêu Chí Đánh Giá Nghiệp Vụ</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Trọng Số (%)</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chỉ Tiêu Giao</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thực Tế Đạt Được</Data></Cell>
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
          <Cell ss:MergeAcross="4" ss:StyleID="KpiLabel"><Data ss:Type="String">ĐIỂM KPI TỔNG HỢP &amp; XẾP LOẠI HIỆU SUẤT:</Data></Cell>
          <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${currentEval.finalScore} điểm (Loại ${currentEval.rank})</Data></Cell>
        </Row>
        <Row ss:Height="20">
          <Cell ss:MergeAcross="4" ss:StyleID="KpiLabel"><Data ss:Type="String">TIỀN THƯỞNG HIỆU SUẤT KPI (ĐIỀU 104 BLLĐ):</Data></Cell>
          <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(currentEval.performanceBonus)}</Data></Cell>
        </Row>
        <Row ss:Height="20">
          <Cell ss:MergeAcross="4" ss:StyleID="KpiLabel"><Data ss:Type="String">TỔNG THU NHẬP THỰC LĨNH TRƯỚC THUẾ:</Data></Cell>
          <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${formatVND(currentEval.totalGrossPayout)}</Data></Cell>
        </Row>
      </Table>
    </Worksheet>`;
  }

  // Sheet 2: Mẫu 04 - Báo cáo tổng hợp toàn doanh nghiệp & Danh sách
  if (activeFormTab === 'form04' || activeFormTab === 'form02' || activeFormTab === 'form03' || activeFormTab === 'all') {
    xmlWorksheets += `
    <Worksheet ss:Name="Mau04_Tong_Hop_Quy_Thuong">
      <Table ss:DefaultColumnWidth="120">
        <Column ss:Width="60"/>
        <Column ss:Width="160"/>
        <Column ss:Width="180"/>
        <Column ss:Width="70"/>
        <Column ss:Width="70"/>
        <Column ss:Width="110"/>
        <Column ss:Width="110"/>
        <Column ss:Width="100"/>
        <Column ss:Width="100"/>
        <Column ss:Width="120"/>
        <Row ss:Height="24"><Cell ss:MergeAcross="9" ss:StyleID="TitleHeader"><Data ss:Type="String">BẢNG TỔNG HỢP ĐÁNH GIÁ KPI &amp; PHÂN BỔ QUỸ THƯỞNG DOANH NGHIỆP</Data></Cell></Row>
        <Row><Cell ss:MergeAcross="9" ss:StyleID="SubHeader"><Data ss:Type="String">Căn cứ Điều 104 BLLĐ 2019 | Đơn vị: ${companyName} | Kỳ: ${reportPeriod}</Data></Cell></Row>
        <Row ss:Height="10"/>
        <Row ss:Height="22">
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã NV</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Họ và Tên</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chức Danh / Phòng Ban</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Điểm KPI</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Xếp Loại</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Lương Cơ Bản</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thưởng KPI</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Hoa Hồng</Data></Cell>
          <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Chuyên Cần &amp; SK</Data></Cell>
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
          <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.commissionAmount}</Data></Cell>
          <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.attendanceBonus + e.initiativeBonus}</Data></Cell>
          <Cell ss:StyleID="CurrencyCell"><Data ss:Type="Number">${e.totalGrossPayout}</Data></Cell>
        </Row>`
          )
          .join('')}
      </Table>
    </Worksheet>`;
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
  ${xmlWorksheets}
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Danh_Gia_KPI_Khen_Thuong_${reportPeriod.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
