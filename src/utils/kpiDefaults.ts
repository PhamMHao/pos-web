import { Employee, KpiCriterion, KpiEvaluation, KpiRank } from '../types';

export function getDefaultCriteriaForRole(role: string, employeeSales?: number, salesTarget?: number): KpiCriterion[] {
  const sales = employeeSales || 0;
  const target = salesTarget || 50000000;
  const salesPercent = target > 0 ? Math.round((sales / target) * 100) : 100;

  if (role === 'Nhân Viên Bán Hàng' || role === 'Thu Ngân') {
    return [
      {
        id: 'crit-1',
        name: 'Doanh số thực tế so với chỉ tiêu giao',
        description: 'Tỷ lệ hoàn thành chỉ tiêu doanh thu bán hàng POS / đa kênh trong kỳ',
        weight: 40,
        targetValue: `${(target / 1000000).toFixed(0)} triệu VNĐ`,
        actualValue: `${(sales / 1000000).toFixed(1)} triệu VNĐ (${salesPercent}%)`,
        selfScore: Math.min(100, Math.max(70, salesPercent)),
        managerScore: Math.min(100, Math.max(70, salesPercent - 2)),
      },
      {
        id: 'crit-2',
        name: 'Tỷ lệ chốt đơn & chăm sóc khách hàng',
        description: 'Tư vấn giải pháp, thái độ phục vụ khách hàng chuẩn mực 5S',
        weight: 20,
        targetValue: 'Tỷ lệ chốt ≥ 85%, 0 khiếu nại',
        actualValue: 'Đạt 92% chốt đơn, 100% hài lòng',
        selfScore: 95,
        managerScore: 92,
      },
      {
        id: 'crit-3',
        name: 'Phát triển khách hàng mới & Hội viên VIP',
        description: 'Thu thập thông tin, đăng ký hội viên tích điểm và mở rộng tệp khách',
        weight: 20,
        targetValue: 'Tối thiểu 30 hội viên mới/tháng',
        actualValue: '38 hội viên mới kích hoạt',
        selfScore: 95,
        managerScore: 90,
      },
      {
        id: 'crit-4',
        name: 'Độ chính xác ca thu tiền & kiểm quỹ',
        description: 'Khớp 100% tiền mặt, chuyển khoản VietQR, quẹt thẻ POS, không lệch quỹ',
        weight: 20,
        targetValue: 'Sai số quỹ = 0 VNĐ',
        actualValue: 'Khớp 100% tất cả ca trực',
        selfScore: 100,
        managerScore: 98,
      },
    ];
  }

  if (role === 'Thủ Kho') {
    return [
      {
        id: 'crit-1',
        name: 'Độ chính xác xuất nhập kho & Barcode',
        description: 'Kiểm đếm chính xác, quét mã vạch phân loại đúng lô và số serial/IMEI',
        weight: 35,
        targetValue: 'Độ chính xác ≥ 99.8%',
        actualValue: 'Đạt 99.9% không sai sót',
        selfScore: 96,
        managerScore: 94,
      },
      {
        id: 'crit-2',
        name: 'Tối ưu vị trí lưu kho & Sắp xếp kệ hàng A-Z',
        description: 'Tuân thủ sơ đồ vị trí kệ, dễ tìm, bảo quản hàng hóa khô ráo an toàn',
        weight: 25,
        targetValue: '100% hàng hóa có vị trí kệ rõ ràng',
        actualValue: 'Đã gắn nhãn định vị 100% kệ',
        selfScore: 95,
        managerScore: 92,
      },
      {
        id: 'crit-3',
        name: 'Kiểm soát tỷ lệ hao hụt & Thất thoát hàng',
        description: 'Tỷ lệ mất mát, hư hỏng trong quá trình lưu kho và kiểm kê định kỳ',
        weight: 20,
        targetValue: 'Hao hụt < 0.1% tổng giá trị',
        actualValue: '0% thất thoát trong kỳ',
        selfScore: 100,
        managerScore: 98,
      },
      {
        id: 'crit-4',
        name: 'Tốc độ đóng gói & Bàn giao vận chuyển',
        description: 'Thời gian soạn hàng và bàn giao cho bưu tá giao hàng nhanh chóng',
        weight: 20,
        targetValue: 'Thời gian xử lý < 15 phút/đơn',
        actualValue: 'Bình quân 11 phút/đơn',
        selfScore: 92,
        managerScore: 90,
      },
    ];
  }

  if (role === 'Kế Toán') {
    return [
      {
        id: 'crit-1',
        name: 'Đúng hạn báo cáo tài chính & Thuế',
        description: 'Lập báo cáo tài chính, tờ khai thuế VAT, TNCN, TNDN đúng hạn pháp luật',
        weight: 35,
        targetValue: '100% đúng hạn, không phát sinh phạt',
        actualValue: 'Hoàn thành trước hạn 3 ngày',
        selfScore: 98,
        managerScore: 96,
      },
      {
        id: 'crit-2',
        name: 'Kiểm soát công nợ & Thu hồi nợ đúng hạn',
        description: 'Đối soát công nợ khách hàng, nhà cung ứng và hạn chế nợ xấu quá hạn',
        weight: 25,
        targetValue: 'Tỷ lệ nợ quá hạn < 3%',
        actualValue: 'Thu hồi 98.5% nợ đến hạn',
        selfScore: 95,
        managerScore: 93,
      },
      {
        id: 'crit-3',
        name: 'Đối soát dòng tiền & Hóa đơn điện tử TT78',
        description: 'Xuất HĐĐT chuẩn quy định Tổng cục Thuế, khớp dòng tiền ngân hàng',
        weight: 20,
        targetValue: 'Khớp 100% sao kê ngân hàng',
        actualValue: 'Khớp 100% tài khoản ngân hàng',
        selfScore: 98,
        managerScore: 95,
      },
      {
        id: 'crit-4',
        name: 'Tuân thủ chuẩn mực kế toán & Lưu trữ',
        description: 'Sắp xếp, đóng tập chứng từ kế toán khoa học, đầy đủ chữ ký hợp lệ',
        weight: 20,
        targetValue: '100% chứng từ được lưu trữ số hóa',
        actualValue: 'Đã số hóa và lưu trữ chuẩn',
        selfScore: 95,
        managerScore: 94,
      },
    ];
  }

  // Quản Lý Cửa Hàng / Quản Trị Vận Hành
  return [
    {
      id: 'crit-1',
      name: 'Tăng trưởng doanh thu & Lợi nhuận chi nhánh',
      description: 'Mức độ hoàn thành kế hoạch doanh số và biên lợi nhuận gộp toàn cửa hàng',
      weight: 35,
      targetValue: 'Đạt 100% mục tiêu doanh số chi nhánh',
      actualValue: 'Đạt 108% kế hoạch doanh thu',
      selfScore: 98,
      managerScore: 96,
    },
    {
      id: 'crit-2',
      name: 'Tối ưu chi phí vận hành & Giảm lãng phí',
      description: 'Kiểm soát chi phí điện, nước, vật tư đóng gói và chi phí phát sinh',
      weight: 25,
      targetValue: 'Chi phí vận hành < 8% doanh thu',
      actualValue: 'Tối ưu đạt 6.9% doanh thu',
      selfScore: 96,
      managerScore: 94,
    },
    {
      id: 'crit-3',
      name: 'Đào tạo nhân sự & Duy trì kỷ luật lao động',
      description: 'Huấn luyện kỹ năng nhân viên, tỷ lệ chuyên cần và không vi phạm kỷ luật',
      weight: 20,
      targetValue: '100% nhân sự hoàn thành đào tạo',
      actualValue: '100% nhân sự đạt chuẩn nghiệp vụ',
      selfScore: 95,
      managerScore: 92,
    },
    {
      id: 'crit-4',
      name: 'Xây dựng & Cải tiến quy trình vận hành SOP',
      description: 'Chuẩn hóa quy trình giao dịch, an toàn PCCC, an ninh trật tự cửa hàng',
      weight: 20,
      targetValue: '0 sự cố an toàn, 100% tuân thủ SOP',
      actualValue: 'Đảm bảo an toàn tuyệt đối',
      selfScore: 98,
      managerScore: 95,
    },
  ];
}

export function calculateKpiScoresAndBonuses(
  criteria: KpiCriterion[],
  baseSalary: number,
  salesRevenue: number,
  commissionRate: number
): {
  selfTotalScore: number;
  managerTotalScore: number;
  finalScore: number;
  rank: KpiRank;
  performanceBonusRate: number;
  performanceBonus: number;
  commissionAmount: number;
  attendanceBonus: number;
  initiativeBonus: number;
  totalGrossPayout: number;
} {
  let selfTotal = 0;
  let managerTotal = 0;

  criteria.forEach((c) => {
    selfTotal += (c.selfScore * c.weight) / 100;
    managerTotal += (c.managerScore * c.weight) / 100;
  });

  const finalScore = Number(managerTotal.toFixed(1));

  let rank: KpiRank = 'B';
  let performanceBonusRate = 0;
  let attendanceBonus = 500000;
  let initiativeBonus = 0;

  if (finalScore >= 95.0) {
    rank = 'A+';
    performanceBonusRate = 25; // 25% Lương cơ bản
    initiativeBonus = 1000000;
  } else if (finalScore >= 85.0) {
    rank = 'A';
    performanceBonusRate = 15; // 15% Lương cơ bản
    initiativeBonus = 300000;
  } else if (finalScore >= 70.0) {
    rank = 'B';
    performanceBonusRate = 8; // 8% Lương cơ bản
    initiativeBonus = 0;
  } else {
    rank = finalScore >= 50.0 ? 'C' : 'D';
    performanceBonusRate = 0;
    attendanceBonus = 0;
    initiativeBonus = 0;
  }

  const performanceBonus = Math.round((baseSalary * performanceBonusRate) / 100);
  const commissionAmount = Math.round((salesRevenue * commissionRate) / 100);
  const totalGrossPayout = baseSalary + performanceBonus + commissionAmount + attendanceBonus + initiativeBonus;

  return {
    selfTotalScore: Number(selfTotal.toFixed(1)),
    managerTotalScore: Number(managerTotal.toFixed(1)),
    finalScore,
    rank,
    performanceBonusRate,
    performanceBonus,
    commissionAmount,
    attendanceBonus,
    initiativeBonus,
    totalGrossPayout,
  };
}

export function generateInitialKpiEvaluations(employees: Employee[]): KpiEvaluation[] {
  const currentPeriod = 'Tháng 02/2026';
  const currentDate = new Date().toISOString().slice(0, 10);

  return employees.map((emp, index) => {
    const criteria = getDefaultCriteriaForRole(emp.role, emp.currentSales, emp.salesKpiTarget);
    const scores = calculateKpiScoresAndBonuses(
      criteria,
      emp.baseSalary || 8000000,
      emp.currentSales || 0,
      emp.commissionRate || 1
    );

    const department =
      emp.role === 'Kế Toán'
        ? 'Phòng Kế Toán - Tài Chính'
        : emp.role === 'Thủ Kho'
        ? 'Bộ Phận Kho Vận & Hậu Cần'
        : emp.role === 'Quản Lý Cửa Hàng'
        ? 'Ban Điều Hành & Quản Lý Chi Nhánh'
        : 'Phòng Kinh Doanh & Bán Lẻ POS';

    return {
      id: `kpi-${emp.id}-${Date.now().toString().slice(-4)}`,
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.name,
      role: emp.role,
      department,
      period: currentPeriod,
      evaluationDate: currentDate,
      criteria,
      selfTotalScore: scores.selfTotalScore,
      managerTotalScore: scores.managerTotalScore,
      finalScore: scores.finalScore,
      rank: scores.rank,
      baseSalary: emp.baseSalary,
      salesRevenue: emp.currentSales,
      commissionRate: emp.commissionRate,
      commissionAmount: scores.commissionAmount,
      performanceBonusRate: scores.performanceBonusRate,
      performanceBonus: scores.performanceBonus,
      attendanceBonus: scores.attendanceBonus,
      initiativeBonus: scores.initiativeBonus,
      totalGrossPayout: scores.totalGrossPayout,
      employeeStrengths: 'Chủ động trong công việc, thái độ tận tâm, hoàn thành tốt các chỉ tiêu được giao.',
      employeeImprovements: 'Tiếp tục nâng cao kỹ năng xử lý tình huống phát sinh và tối ưu hóa thời gian thực hiện.',
      developmentPlan: 'Tham gia khóa đào tạo nâng cao năng lực chuyên môn và quản lý dự án trong quý tới.',
      directorApprovalStatus: index < 4 ? 'approved' : 'pending',
      approvedBy: index < 4 ? 'Tổng Giám Đốc' : undefined,
      approvedAt: index < 4 ? currentDate : undefined,
      signedDate: currentDate,
    };
  });
}
