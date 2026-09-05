import { SequentialApprovalProcess } from './approvals.types';

export function exportApprovalsMultiSheetExcel(
  processes: SequentialApprovalProcess[],
  filename = 'Bao_Cao_Trinh_Ky_Phe_Duyet_Lien_Phong_Ban.xls'
) {
  const nowStr = new Date().toLocaleString('vi-VN');

  const escapeXml = (str: any) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const getModuleLabel = (mod: string) => {
    switch (mod) {
      case 'purchase_request':
        return '1. Đề xuất mua sắm (PR)';
      case 'purchase_order':
        return '2. Đơn mua hàng (PO)';
      case 'goods_receipt':
        return '3. Nhập kho & KCS (GRN)';
      case 'goods_issue':
        return '4. Xuất kho vật tư (PXK)';
      case 'work_order':
        return '5. Lệnh sản xuất (WO)';
      case 'delivery':
        return '6. Giao hàng (POD)';
      case 'accounting_audit':
        return '7. Kế toán thẩm tra';
      case 'cash_settlement':
        return '8. Thu / Chi Quỹ';
      default:
        return mod;
    }
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'approved':
        return 'Đã hoàn tất duyệt';
      case 'in_progress':
        return 'Đang xử lý tuần tự';
      case 'rework':
        return 'Yêu cầu làm lại';
      case 'rejected':
        return 'Bị từ chối';
      case 'cancelled':
        return 'Đã hủy';
      case 'waiting':
        return 'Đang chờ duyệt';
      case 'locked':
        return 'Bị khóa (Chờ cấp trước)';
      default:
        return st;
    }
  };

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
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#000000"/>
    </Style>
    <Style ss:ID="TitleHeader">
      <Font ss:FontName="Segoe UI" ss:Size="15" ss:Bold="1" ss:Color="#0284c7"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="SubHeader">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Italic="1" ss:Color="#64748b"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="ColHeader">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#ffffff"/>
      <Interior ss:Color="#0284c7" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="CellNormal">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
      </Borders>
    </Style>
    <Style ss:ID="CellCenter">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
      </Borders>
    </Style>
    <Style ss:ID="CellCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#f1f5f9"/>
      </Borders>
    </Style>
    <Style ss:ID="StatusApproved">
      <Font ss:Color="#15803d" ss:Bold="1"/>
      <Interior ss:Color="#dcfce7" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="StatusProgress">
      <Font ss:Color="#b45309" ss:Bold="1"/>
      <Interior ss:Color="#fef3c7" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="StatusRework">
      <Font ss:Color="#b91c1c" ss:Bold="1"/>
      <Interior ss:Color="#fee2e2" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
  </Styles>

  <!-- SHEET 1: DANH SÁCH PHIẾU TRÌNH KÝ -->
  <Worksheet ss:Name="1. Danh Sách Tờ Trình">
    <Table ss:DefaultRowHeight="22">
      <Column ss:Width="100"/>
      <Column ss:Width="140"/>
      <Column ss:Width="260"/>
      <Column ss:Width="110"/>
      <Column ss:Width="160"/>
      <Column ss:Width="130"/>
      <Column ss:Width="120"/>
      <Column ss:Width="80"/>
      <Column ss:Width="90"/>
      <Column ss:Width="130"/>
      <Column ss:Width="130"/>

      <Row ss:Height="30">
        <Cell ss:MergeAcross="10" ss:StyleID="TitleHeader">
          <Data ss:Type="String">BÁO CÁO TỔNG HỢP TRÌNH KÝ PHÊ DUYỆT LIÊN PHÒNG BAN</Data>
        </Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="10" ss:StyleID="SubHeader">
          <Data ss:Type="String">Thời điểm trích xuất dữ liệu: ${nowStr} | Hệ thống GP-ERP Enterprise</Data>
        </Cell>
      </Row>
      <Row ss:Height="10"/>

      <Row ss:Height="26">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã Tờ Trình</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Khâu Chuỗi Cung Ứng</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tiêu Đề Tờ Trình</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã Chứng Từ</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Phòng Ban Trình</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Người Đề Xuất</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tổng Giá Trị (VNĐ)</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Độ Ưu Tiên</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tiến Độ Bước</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Trạng Thái Quy Trình</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Ngày Khởi Tạo</Data></Cell>
      </Row>

      ${processes
        .map((p) => {
          const statusStyle =
            p.status === 'approved'
              ? 'StatusApproved'
              : p.status === 'rework' || p.status === 'rejected'
              ? 'StatusRework'
              : 'StatusProgress';

          return `
      <Row ss:Height="22">
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(p.processCode)}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(getModuleLabel(p.moduleType))}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(p.title)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(p.referenceDocCode)}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(p.departmentName)}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(p.requesterName)}</Data></Cell>
        <Cell ss:StyleID="CellCurrency"><Data ss:Type="Number">${p.totalAmount || 0}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(p.priority.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">Bước ${p.currentStepNumber}/${p.totalSteps}</Data></Cell>
        <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${escapeXml(getStatusLabel(p.status))}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${new Date(p.createdAt).toLocaleDateString('vi-VN')}</Data></Cell>
      </Row>`;
        })
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 2: CHI TIẾT CÁC BƯỚC DUYỆT TUẦN TỰ -->
  <Worksheet ss:Name="2. Tiến Độ Từng Bước Duyệt">
    <Table ss:DefaultRowHeight="22">
      <Column ss:Width="100"/>
      <Column ss:Width="60"/>
      <Column ss:Width="220"/>
      <Column ss:Width="110"/>
      <Column ss:Width="160"/>
      <Column ss:Width="130"/>
      <Column ss:Width="140"/>
      <Column ss:Width="130"/>
      <Column ss:Width="90"/>
      <Column ss:Width="250"/>

      <Row ss:Height="26">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã Tờ Trình</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Bước #</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Tên Bước Phê Duyệt</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Vai Trò Thẩm Quyền</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Người Chỉ Định Duyệt</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Trạng Thái Bước</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Người Ký Thực Tế</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thời Gian Ký</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Phương Thức Ký</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Ý Kiến / Lý Do Thẩm Định</Data></Cell>
      </Row>

      ${processes
        .flatMap((p) =>
          p.steps.map((s) => {
            const stepStatusStyle =
              s.status === 'approved'
                ? 'StatusApproved'
                : s.status === 'waiting'
                ? 'StatusProgress'
                : s.status === 'rework' || s.status === 'rejected'
                ? 'StatusRework'
                : 'CellCenter';

            return `
      <Row ss:Height="22">
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(p.processCode)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="Number">${s.stepOrder}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(s.stepName)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(s.requiredRole.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(s.assignedUserName)}</Data></Cell>
        <Cell ss:StyleID="${stepStatusStyle}"><Data ss:Type="String">${escapeXml(getStatusLabel(s.status))}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(s.actedBy || '-')}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${s.actedAt ? new Date(s.actedAt).toLocaleString('vi-VN') : '-'}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(s.signMethod ? s.signMethod.toUpperCase() : '-')}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(s.reworkRequirements || s.reviewNotes || '-')}</Data></Cell>
      </Row>`;
          })
        )
        .join('')}
    </Table>
  </Worksheet>

  <!-- SHEET 3: NHẬT KÝ VẾT KIỂM TOÁN (AUDIT TRAIL) -->
  <Worksheet ss:Name="3. Nhật Ký Kiểm Toán Vết">
    <Table ss:DefaultRowHeight="22">
      <Column ss:Width="100"/>
      <Column ss:Width="110"/>
      <Column ss:Width="60"/>
      <Column ss:Width="160"/>
      <Column ss:Width="110"/>
      <Column ss:Width="300"/>
      <Column ss:Width="100"/>
      <Column ss:Width="140"/>

      <Row ss:Height="26">
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Mã Tờ Trình</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Hành Động</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Bước #</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Người Thực Hiện</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Vai Trò</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Ghi Chú Nhật Ký</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Địa Chỉ IP</Data></Cell>
        <Cell ss:StyleID="ColHeader"><Data ss:Type="String">Thời Gian Ghi Vết</Data></Cell>
      </Row>

      ${processes
        .flatMap((p) =>
          p.auditLogs.map(
            (log) => `
      <Row ss:Height="22">
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(p.processCode)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(log.action.toUpperCase())}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${log.stepOrder ? String(log.stepOrder) : '-'}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(log.actorName)}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(log.actorRole || '-')}</Data></Cell>
        <Cell ss:StyleID="CellNormal"><Data ss:Type="String">${escapeXml(log.note || '-')}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${escapeXml(log.ipAddress || '127.0.0.1')}</Data></Cell>
        <Cell ss:StyleID="CellCenter"><Data ss:Type="String">${new Date(log.timestamp).toLocaleString('vi-VN')}</Data></Cell>
      </Row>`
          )
        )
        .join('')}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
