import {
  DailyTimelineItem,
  TopProductItem,
  CategoryInventoryItem,
  InventoryMetrics,
  HrPerformanceItem,
  AssetLifecycleItem,
} from './dashboard.types';

export interface ExportExcel5SheetsParams {
  storeTitle: string;
  reportDate: string;
  totalRevenue: number;
  completedOrdersCount: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: string;
  inventoryMetrics: InventoryMetrics;
  averageOrderValue: number;
  avgItemsPerOrder: string;
  dailyTimelineData: DailyTimelineItem[];
  topProducts: TopProductItem[];
  categoryInventory: CategoryInventoryItem[];
  hrPerformanceData: HrPerformanceItem[];
  assetsList: AssetLifecycleItem[];
}

export function exportDashboard5SheetExcel(params: ExportExcel5SheetsParams) {
  const {
    storeTitle,
    reportDate,
    totalRevenue,
    completedOrdersCount,
    totalCost,
    grossProfit,
    profitMargin,
    inventoryMetrics,
    averageOrderValue,
    avgItemsPerOrder,
    dailyTimelineData,
    topProducts,
    categoryInventory,
    hrPerformanceData,
    assetsList,
  } = params;

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
      <Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#0284c7"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Italic="1" ss:Color="#64748b"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="TableHeader">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
      <Interior ss:Color="#0284c7" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="DataCell">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
      </Borders>
    </Style>
    <Style ss:ID="DataNumber">
      <NumberFormat ss:Format="#,##0"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
      </Borders>
    </Style>
    <Style ss:ID="DataPercent">
      <NumberFormat ss:Format="0.0%"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
      </Borders>
    </Style>
  </Styles>

  <!-- SHEET 1: KPI TỔNG QUAN -->
  <Worksheet ss:Name="1. KPI_Tong_Quan">
    <Table ss:DefaultColumnWidth="140">
      <Column ss:Width="240"/>
      <Column ss:Width="160"/>
      <Column ss:Width="220"/>
      <Row ss:Height="28">
        <Cell ss:MergeAcross="2" ss:StyleID="TitleHeader">
          <Data ss:Type="String">BÁO CÁO CHỈ SỐ ĐIỀU HÀNH DOANH NGHIỆP TOÀN DIỆN</Data>
        </Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="2" ss:StyleID="SubHeader">
          <Data ss:Type="String">${storeTitle} - Ngày xuất: ${reportDate}</Data>
        </Cell>
      </Row>
      <Row ss:Height="8"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chỉ Số Quản Trị (KPI)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Giá Trị Thực Tế</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ghi Chú Kỹ Thuật</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Doanh Thu Thuần (Net Revenue)</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${totalRevenue}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${completedOrdersCount} đơn hàng hoàn tất</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Giá Vốn Xuất Kho (COGS)</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${totalCost}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Giá vốn theo từng đơn xuất kho</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Lợi Nhuận Gộp (Gross Profit)</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${grossProfit}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Biên lợi nhuận gộp: ${profitMargin}%</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Tổng Vốn Tồn Kho (Cost Value)</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${inventoryMetrics.totalStockCapital}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${inventoryMetrics.totalStockUnits} sản phẩm lưu kho</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Quy Mô Mã Hàng (Total SKUs)</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${inventoryMetrics.totalSku}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${inventoryMetrics.safePercent}% tồn kho an toàn</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Giá Trị Đơn Trung Bình (AOV)</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${averageOrderValue}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">Bình quân ${avgItemsPerOrder} món / đơn</Data></Cell>
      </Row>
    </Table>
  </Worksheet>

  <!-- SHEET 2: DOANH THU THEO NGÀY -->
  <Worksheet ss:Name="2. DoanhThu_Theo_Ngay">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="100"/>
      <Column ss:Width="90"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="100"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ngày Giao Dịch</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Số Đơn Hàng</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Doanh Thu (VNĐ)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Giá Vốn (VNĐ)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Lợi Nhuận Gộp</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Biên Lợi Nhuận</Data></Cell>
      </Row>
      ${dailyTimelineData
        .map(
          (d) => `
      <Row ss:Height="19">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${d.fullDate}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${d.OrderCount}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${d.DoanhThu}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${d.GiaVon}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${d.LoiNhuan}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${d.margin}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 3: HIỆU SUẤT NHÂN SỰ HR -->
  <Worksheet ss:Name="3. HieuSuat_NhanSu_HR">
    <Table ss:DefaultColumnWidth="130">
      <Column ss:Width="80"/>
      <Column ss:Width="150"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>
      <Column ss:Width="90"/>
      <Column ss:Width="120"/>
      <Column ss:Width="90"/>
      <Column ss:Width="100"/>
      <Column ss:Width="130"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Mã NV</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Họ Tên</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chức Danh</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Doanh Số</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chỉ Tiêu KPI</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">% Đạt KPI</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Hoa Hồng (VNĐ)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Giờ Công</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chuyên Cần</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">HĐ Lao Động</Data></Cell>
      </Row>
      ${hrPerformanceData
        .map(
          (emp) => `
      <Row ss:Height="19">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${emp.code}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${emp.name}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${emp.role}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${emp.currentSales}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${emp.salesKpiTarget}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${emp.kpiCompletion}%</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${emp.commission}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${emp.workHours}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${emp.attendanceRate}%</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${emp.contractCode}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 4: TOP SẢN PHẨM & KHO -->
  <Worksheet ss:Name="4. Top_SanPham_Kho">
    <Table ss:DefaultColumnWidth="130">
      <Column ss:Width="50"/>
      <Column ss:Width="100"/>
      <Column ss:Width="240"/>
      <Column ss:Width="130"/>
      <Column ss:Width="90"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="80"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Hạng</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Mã SKU</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tên Sản Phẩm</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Ngành Hàng</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Số Lượng Bán</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Doanh Thu (VNĐ)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Lợi Nhuận Gộp</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tồn Kho</Data></Cell>
      </Row>
      ${topProducts
        .slice(0, 50)
        .map(
          (p, idx) => `
      <Row ss:Height="19">
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${idx + 1}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${p.sku || '---'}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${p.name}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${p.category}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${p.quantity}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${p.revenue}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${p.profit}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${p.currentStock}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 5: QUẢN TRỊ TÀI SẢN CỐ ĐỊNH -->
  <Worksheet ss:Name="5. QuanTri_TaiSan_TSCD">
    <Table ss:DefaultColumnWidth="140">
      <Column ss:Width="90"/>
      <Column ss:Width="200"/>
      <Column ss:Width="150"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="90"/>
      <Column ss:Width="110"/>
      <Column ss:Width="140"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Mã TS</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Tên Tài Sản</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Chức Năng</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Nguyên Giá (VNĐ)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Khấu Hao (VNĐ)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Giá Trị Còn Lại</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Đã Dùng</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Hao Mòn (%)</Data></Cell>
        <Cell ss:StyleID="TableHeader"><Data ss:Type="String">Trạng Thái</Data></Cell>
      </Row>
      ${assetsList
        .map(
          (a) => `
      <Row ss:Height="19">
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${a.code}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${a.name}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${a.category}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${a.originalValue}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${a.depreciationValue}</Data></Cell>
        <Cell ss:StyleID="DataNumber"><Data ss:Type="Number">${a.remainingValue}</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${a.monthsUsed} tháng</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${a.depreciationProgress}%</Data></Cell>
        <Cell ss:StyleID="DataCell"><Data ss:Type="String">${a.status === 'good' ? 'Hoạt động tốt' : a.status === 'maintenance_required' ? 'Cần bảo trì' : 'Hỏng hóc'}</Data></Cell>
      </Row>`
        )
        .join('')}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GP_ERP_Executive_5Sheets_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
