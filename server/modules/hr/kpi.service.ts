import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import { Prisma } from "@prisma/client";

export class KpiService {
  static async getEvaluations(query: {
    period?: string;
    department?: string;
    rank?: string;
    search?: string;
  }) {
    const { period, department, rank, search } = query;
    const where: Prisma.KpiEvaluationRecordWhereInput = {};

    if (period && period !== "all") {
      where.period = period;
    }
    if (department && department !== "all") {
      where.department = department;
    }
    if (rank && rank !== "all") {
      where.rank = rank;
    }
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { employeeName: { contains: term } },
        { employeeCode: { contains: term } },
        { role: { contains: term } },
      ];
    }

    let records = await prisma.kpiEvaluationRecord.findMany({
      where,
    });

    // Auto-seed if database is empty for the current default period
    if (records.length === 0 && (!period || period === "Tháng 02/2026")) {
      const employees = await prisma.employee.findMany({ where: { status: "active" } });
      if (employees.length > 0) {
        await this.seedEvaluationsForEmployees(employees, "Tháng 02/2026");
        records = await prisma.kpiEvaluationRecord.findMany({
          where,
        });
      }
    }

    records.sort((a, b) => Number(b.finalScore) - Number(a.finalScore));
    return records.map(this.formatRecord);
  }

  static async getEvaluationById(id: string) {
    const records = await prisma.kpiEvaluationRecord.findMany({
      where: { id },
    });
    const record = records[0];
    if (!record) {
      throw new NotFoundError("Không tìm thấy phiếu đánh giá KPI");
    }
    return this.formatRecord(record);
  }

  static async createEvaluation(data: any) {
    const id = data.id || `kpi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const evalDate = data.evaluationDate ? new Date(data.evaluationDate) : new Date();
    const criteriaStr = typeof data.criteria === "string" ? data.criteria : JSON.stringify(data.criteria || []);
    const sigStr = data.digitalSignature ? (typeof data.digitalSignature === "string" ? data.digitalSignature : JSON.stringify(data.digitalSignature)) : null;
    const approvedAt = data.approvedAt ? new Date(data.approvedAt) : null;
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO [DanhGiaKPI] (
        id, employeeId, employeeCode, employeeName, role, department, period, evaluationDate,
        criteriaJson, selfTotalScore, managerTotalScore, finalScore, [rank],
        baseSalary, salesRevenue, commissionRate, commissionAmount, performanceBonusRate,
        performanceBonus, attendanceBonus, initiativeBonus, totalGrossPayout,
        employeeStrengths, employeeImprovements, developmentPlan, directorApprovalStatus,
        approvedBy, approvedAt, digitalSignature, createdAt, updatedAt
      )
      VALUES (
        ${id}, ${data.employeeId}, ${data.employeeCode}, ${data.employeeName}, ${data.role}, ${data.department}, ${data.period || "Tháng 02/2026"}, ${evalDate},
        ${criteriaStr}, ${data.selfTotalScore || 0}, ${data.managerTotalScore || 0}, ${data.finalScore || 0}, ${data.rank || "B"},
        ${data.baseSalary || 0}, ${data.salesRevenue || 0}, ${data.commissionRate || 0}, ${data.commissionAmount || 0}, ${data.performanceBonusRate || 0},
        ${data.performanceBonus || 0}, ${data.attendanceBonus || 0}, ${data.initiativeBonus || 0}, ${data.totalGrossPayout || 0},
        ${data.employeeStrengths || ""}, ${data.employeeImprovements || ""}, ${data.developmentPlan || ""}, ${data.directorApprovalStatus || "pending"},
        ${data.approvedBy || null}, ${approvedAt}, ${sigStr}, ${now}, ${now}
      )
    `;

    return this.getEvaluationById(id);
  }

  static async updateEvaluation(id: string, data: any) {
    await this.getEvaluationById(id);

    const updateData: any = {};
    if (data.criteria !== undefined) {
      updateData.criteriaJson = typeof data.criteria === "string" ? data.criteria : JSON.stringify(data.criteria);
    }
    if (data.selfTotalScore !== undefined) updateData.selfTotalScore = new Prisma.Decimal(data.selfTotalScore);
    if (data.managerTotalScore !== undefined) updateData.managerTotalScore = new Prisma.Decimal(data.managerTotalScore);
    if (data.finalScore !== undefined) updateData.finalScore = new Prisma.Decimal(data.finalScore);
    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.performanceBonusRate !== undefined) updateData.performanceBonusRate = new Prisma.Decimal(data.performanceBonusRate);
    if (data.performanceBonus !== undefined) updateData.performanceBonus = new Prisma.Decimal(data.performanceBonus);
    if (data.commissionAmount !== undefined) updateData.commissionAmount = new Prisma.Decimal(data.commissionAmount);
    if (data.attendanceBonus !== undefined) updateData.attendanceBonus = new Prisma.Decimal(data.attendanceBonus);
    if (data.initiativeBonus !== undefined) updateData.initiativeBonus = new Prisma.Decimal(data.initiativeBonus);
    if (data.totalGrossPayout !== undefined) updateData.totalGrossPayout = new Prisma.Decimal(data.totalGrossPayout);
    if (data.employeeStrengths !== undefined) updateData.employeeStrengths = data.employeeStrengths;
    if (data.employeeImprovements !== undefined) updateData.employeeImprovements = data.employeeImprovements;
    if (data.developmentPlan !== undefined) updateData.developmentPlan = data.developmentPlan;
    if (data.directorApprovalStatus !== undefined) updateData.directorApprovalStatus = data.directorApprovalStatus;
    if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy;
    if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt ? new Date(data.approvedAt) : null;
    if (data.digitalSignature !== undefined) {
      updateData.digitalSignature = data.digitalSignature ? (typeof data.digitalSignature === "string" ? data.digitalSignature : JSON.stringify(data.digitalSignature)) : null;
    }

    await prisma.kpiEvaluationRecord.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getEvaluationById(id);
  }

  static async approveEvaluation(id: string, approvedBy: string = "Tổng Giám Đốc", digitalSignature?: any) {
    await this.getEvaluationById(id);

    const updateData: any = {
      directorApprovalStatus: "approved",
      approvedBy,
      approvedAt: new Date(),
    };
    if (digitalSignature) {
      updateData.digitalSignature = typeof digitalSignature === "string" ? digitalSignature : JSON.stringify(digitalSignature);
    }

    await prisma.kpiEvaluationRecord.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getEvaluationById(id);
  }

  static async batchApprove(period: string, approvedBy: string = "Tổng Giám Đốc", digitalSignature?: any) {
    const updateData: any = {
      directorApprovalStatus: "approved",
      approvedBy,
      approvedAt: new Date(),
    };
    if (digitalSignature) {
      updateData.digitalSignature = typeof digitalSignature === "string" ? digitalSignature : JSON.stringify(digitalSignature);
    }

    const updated = await prisma.kpiEvaluationRecord.updateMany({
      where: { period },
      data: updateData,
    });
    return { success: true, count: updated.count };
  }

  static async seedEvaluationsForEmployees(employees: any[], period: string = "Tháng 02/2026") {
    const now = new Date();

    for (let index = 0; index < employees.length; index++) {
      const emp = employees[index];
      const baseSalary = Number(emp.baseSalary) || 8500000;
      const salesTarget = Number(emp.salesKpiTarget) || 50000000;
      const currentSales = Number(emp.currentSales) || 45000000;
      const commissionRate = Number(emp.commissionRate) || 2;

      const department =
        emp.role === "Kế Toán"
          ? "Phòng Kế Toán - Tài Chính"
          : emp.role === "Thủ Kho"
          ? "Bộ Phận Kho Vận & Hậu Cần"
          : emp.role === "Quản Lý Cửa Hàng"
          ? "Ban Điều Hành & Quản Lý Chi Nhánh"
          : "Phòng Kinh Doanh & Bán Lẻ POS";

      const scoreScale = 85 + (index % 12);
      const finalScore = Math.min(98, scoreScale);
      let rank = "B";
      let performanceBonusRate = 8;
      let initiativeBonus = 0;
      let attendanceBonus = 500000;

      if (finalScore >= 95) {
        rank = "A+";
        performanceBonusRate = 25;
        initiativeBonus = 1000000;
      } else if (finalScore >= 85) {
        rank = "A";
        performanceBonusRate = 15;
        initiativeBonus = 300000;
      } else if (finalScore < 70) {
        rank = "C";
        performanceBonusRate = 0;
        attendanceBonus = 0;
      }

      const performanceBonus = Math.round((baseSalary * performanceBonusRate) / 100);
      const commissionAmount = Math.round((currentSales * commissionRate) / 100);
      const totalGrossPayout = baseSalary + performanceBonus + commissionAmount + attendanceBonus + initiativeBonus;

      const criteria = [
        {
          id: "crit-1",
          name: "Chỉ tiêu doanh số / Kết quả nghiệp vụ cốt lõi",
          description: "Mức độ hoàn thành chỉ tiêu doanh thu hoặc khối lượng công việc chuyên môn",
          weight: 40,
          targetValue: `${(salesTarget / 1000000).toFixed(0)} triệu VNĐ / 100% KPI`,
          actualValue: `${(currentSales / 1000000).toFixed(1)} triệu VNĐ (${Math.round((currentSales / salesTarget) * 100)}%)`,
          selfScore: Math.min(100, finalScore + 2),
          managerScore: finalScore,
        },
        {
          id: "crit-2",
          name: "Chất lượng dịch vụ, văn hóa phục vụ & chuẩn 5S",
          description: "Thái độ tận tâm với khách hàng và đồng nghiệp, tuân thủ nội quy lao động",
          weight: 20,
          targetValue: "100% hài lòng, 0 biên bản sự cố",
          actualValue: "Đạt chuẩn 5S xuất sắc",
          selfScore: 95,
          managerScore: finalScore - 1,
        },
        {
          id: "crit-3",
          name: "Phát triển khách hàng / Tối ưu hóa chi phí vận hành",
          description: "Đóng góp phát triển đối tác mới và tiết giảm lãng phí tài nguyên công ty",
          weight: 20,
          targetValue: "Tiết kiệm tối thiểu 5% ngân sách",
          actualValue: "Vượt 110% chỉ tiêu tăng trưởng",
          selfScore: 92,
          managerScore: finalScore,
        },
        {
          id: "crit-4",
          name: "Kỷ luật ca làm việc, kiểm soát quỹ & tài sản",
          description: "Chuyên cần, đúng giờ, khớp số liệu thu chi sổ sách, an toàn bảo mật tuyệt đối",
          weight: 20,
          targetValue: "0 lỗi quỹ, 100% đúng hạn",
          actualValue: "Khớp 100% chứng từ và tài sản",
          selfScore: 98,
          managerScore: finalScore + 1,
        },
      ];

      const id = `kpi-${emp.id}-${Date.now().toString().slice(-4)}`;
      const approvalStatus = index < 3 ? "approved" : "pending";
      const approvedBy = index < 3 ? "Tổng Giám Đốc" : null;
      const approvedAt = index < 3 ? now : null;
      const criteriaStr = JSON.stringify(criteria);

      await prisma.$executeRaw`
        INSERT INTO [DanhGiaKPI] (
          id, employeeId, employeeCode, employeeName, role, department, period, evaluationDate,
          criteriaJson, selfTotalScore, managerTotalScore, finalScore, [rank],
          baseSalary, salesRevenue, commissionRate, commissionAmount, performanceBonusRate,
          performanceBonus, attendanceBonus, initiativeBonus, totalGrossPayout,
          employeeStrengths, employeeImprovements, developmentPlan, directorApprovalStatus,
          approvedBy, approvedAt, digitalSignature, createdAt, updatedAt
        )
        VALUES (
          ${id}, ${emp.id}, ${emp.code}, ${emp.name}, ${emp.role}, ${department}, ${period}, ${now},
          ${criteriaStr}, ${finalScore + 1}, ${finalScore}, ${finalScore}, ${rank},
          ${baseSalary}, ${currentSales}, ${commissionRate}, ${commissionAmount}, ${performanceBonusRate},
          ${performanceBonus}, ${attendanceBonus}, ${initiativeBonus}, ${totalGrossPayout},
          ${"Chủ động trong công việc, tinh thần trách nhiệm cao, hoàn thành xuất sắc nhiệm vụ."},
          ${"Cần tăng cường chia sẻ kinh nghiệm và tham mưu các giải pháp tự động hóa quy trình."},
          ${"Tham gia khóa đào tạo nâng cao năng lực chuyên môn và quản lý dự án trong quý tới."},
          ${approvalStatus}, ${approvedBy}, ${approvedAt}, ${null}, ${now}, ${now}
        )
      `;
    }
  }

  private static formatRecord(rec: any) {
    let parsedCriteria = [];
    try {
      parsedCriteria = typeof rec.criteriaJson === "string" ? JSON.parse(rec.criteriaJson) : rec.criteriaJson;
    } catch {
      parsedCriteria = [];
    }

    let parsedSignature = null;
    if (rec.digitalSignature) {
      try {
        parsedSignature = typeof rec.digitalSignature === "string" ? JSON.parse(rec.digitalSignature) : rec.digitalSignature;
      } catch {
        parsedSignature = null;
      }
    }

    return {
      id: rec.id,
      employeeId: rec.employeeId,
      employeeCode: rec.employeeCode,
      employeeName: rec.employeeName,
      role: rec.role,
      department: rec.department,
      period: rec.period,
      evaluationDate: rec.evaluationDate ? rec.evaluationDate.toISOString().slice(0, 10) : "",
      criteria: parsedCriteria,
      selfTotalScore: Number(rec.selfTotalScore),
      managerTotalScore: Number(rec.managerTotalScore),
      finalScore: Number(rec.finalScore),
      rank: rec.rank,
      baseSalary: Number(rec.baseSalary),
      salesRevenue: Number(rec.salesRevenue),
      commissionRate: Number(rec.commissionRate),
      commissionAmount: Number(rec.commissionAmount),
      performanceBonusRate: Number(rec.performanceBonusRate),
      performanceBonus: Number(rec.performanceBonus),
      attendanceBonus: Number(rec.attendanceBonus),
      initiativeBonus: Number(rec.initiativeBonus),
      totalGrossPayout: Number(rec.totalGrossPayout),
      employeeStrengths: rec.employeeStrengths,
      employeeImprovements: rec.employeeImprovements,
      developmentPlan: rec.developmentPlan,
      directorApprovalStatus: rec.directorApprovalStatus,
      approvedBy: rec.approvedBy,
      approvedAt: rec.approvedAt ? rec.approvedAt.toISOString().slice(0, 10) : null,
      digitalSignature: parsedSignature,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    };
  }
}
