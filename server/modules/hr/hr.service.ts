import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeQueryInput,
  CreateLaborContractInput,
  UpdateLaborContractInput,
  LaborContractQueryInput,
} from "./hr.schema";
import { Prisma } from "@prisma/client";

export class HrService {
  // --- EMPLOYEES ---
  static async getEmployees(query: EmployeeQueryInput) {
    const { search, role, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.EmployeeWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { name: { contains: term } },
        { phone: { contains: term } },
        { email: { contains: term } },
      ];
    }

    if (role && role !== "all") {
      where.role = role;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const allItems = await prisma.employee.findMany({ where });

    // In-memory sort by joinedDate desc
    allItems.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((e) => ({
      ...e,
      baseSalary: Number(e.baseSalary),
      salesKpiTarget: Number(e.salesKpiTarget),
      currentSales: Number(e.currentSales),
      commissionRate: Number(e.commissionRate),
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getEmployeeById(id: string) {
    const items = await prisma.employee.findMany({
      where: { id },
    });

    const employee = items[0];
    if (!employee) {
      throw new NotFoundError(`Không tìm thấy nhân viên ID: ${id}`);
    }

    return {
      ...employee,
      baseSalary: Number(employee.baseSalary),
      salesKpiTarget: Number(employee.salesKpiTarget),
      currentSales: Number(employee.currentSales),
      commissionRate: Number(employee.commissionRate),
    };
  }

  static async createEmployee(input: CreateEmployeeInput) {
    const existing = await prisma.employee.findMany({
      where: { code: input.code },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Mã nhân viên "${input.code}" đã tồn tại`);
    }

    const id = (input as any).id || `emp-${Date.now()}`;
    const jDate = input.joinedDate ? new Date(input.joinedDate) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [NhanVien] (id, code, name, role, phone, email, baseSalary, salesKpiTarget, currentSales, commissionRate, status, avatar, joinedDate, shiftSchedule)
      VALUES (${id}, ${input.code}, ${input.name}, ${input.role}, ${input.phone}, ${input.email}, ${input.baseSalary}, ${input.salesKpiTarget || 0}, ${input.currentSales || 0}, ${input.commissionRate || 0}, ${input.status || "active"}, ${input.avatar || null}, ${jDate}, ${input.shiftSchedule || null})
    `;

    return this.getEmployeeById(id);
  }

  static async updateEmployee(id: string, input: UpdateEmployeeInput) {
    await this.getEmployeeById(id);

    const updateData: any = { ...input };
    if (input.baseSalary !== undefined) updateData.baseSalary = new Prisma.Decimal(input.baseSalary);
    if (input.salesKpiTarget !== undefined) updateData.salesKpiTarget = new Prisma.Decimal(input.salesKpiTarget);
    if (input.currentSales !== undefined) updateData.currentSales = new Prisma.Decimal(input.currentSales);
    if (input.commissionRate !== undefined) updateData.commissionRate = new Prisma.Decimal(input.commissionRate);
    if (input.joinedDate) updateData.joinedDate = new Date(input.joinedDate);

    await prisma.employee.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getEmployeeById(id);
  }

  static async deleteEmployee(id: string) {
    await this.getEmployeeById(id);
    await prisma.employee.deleteMany({
      where: { id },
    });
    return { message: "Xóa nhân viên thành công" };
  }

  // --- LABOR CONTRACTS ---
  static async getLaborContracts(query: LaborContractQueryInput) {
    const { search, status, contractType, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.LaborContractWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { contractNumber: { contains: term } },
        { employeeName: { contains: term } },
        { employeeCode: { contains: term } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (contractType && contractType !== "all") {
      where.contractType = contractType;
    }

    const allItems = await prisma.laborContract.findMany({ where });

    // In-memory sort by signDate desc
    allItems.sort((a, b) => new Date(b.signDate).getTime() - new Date(a.signDate).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((c) => {
      let employer = {
        companyName: "CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC",
        representative: "Phạm Gia Phúc",
        position: "Giám Đốc",
        nationality: "Việt Nam",
        address: "Đường PA 087, Khu phố An Thuận, Phường Phú An, TP. HCM",
        phone: "0985 862 609 - 0914 665 994",
        taxCode: "0318999888",
      };
      if (c.employerData) {
        try {
          employer = { ...employer, ...JSON.parse(c.employerData) };
        } catch {}
      }

      let employeeInfo = {
        name: c.employeeName,
        dob: "1995-05-15",
        gender: "Nam",
        idCard: "079095001234",
        idCardDate: "2020-01-10",
        idCardPlace: "Cục Cảnh sát QLHC về TTXH",
        permanentAddress: "TP. Hồ Chí Minh",
        currentAddress: "TP. Hồ Chí Minh",
        phone: "0901234567",
        email: "employee@vitinhgiaphuc.com",
      };
      if (c.employeeInfo) {
        try {
          employeeInfo = { ...employeeInfo, ...JSON.parse(c.employeeInfo) };
        } catch {}
      }

      let terms = {
        jobTitle: c.employeeRole,
        department: "Kinh Doanh & Bán Hàng",
        workLocation: "Kho Chính Gia Phúc Computer",
        workingHours: "48 giờ/tuần (8h/ngày)",
        basicSalary: 8500000,
        allowance: 1000000,
        kpiBonus: "Theo quy chế thưởng doanh số kinh doanh",
        paymentDate: "Ngày 05 hàng tháng",
        paymentMethod: "Chuyển khoản qua ngân hàng",
        insurancePolicy: "Được đóng BHXH, BHYT, BHTN đầy đủ theo quy định",
      };
      if (c.termsData) {
        try {
          terms = { ...terms, ...JSON.parse(c.termsData) };
        } catch {}
      }

      let signatures = {
        employerSigned: c.status === "signed" || c.status === "active",
        employerSignDate: c.signDate ? new Date(c.signDate).toISOString().slice(0, 10) : "",
        employeeSigned: c.status === "signed" || c.status === "active",
        employeeSignDate: c.signDate ? new Date(c.signDate).toISOString().slice(0, 10) : "",
      };
      if (c.signaturesData) {
        try {
          signatures = { ...signatures, ...JSON.parse(c.signaturesData) };
        } catch {}
      }

      return {
        ...c,
        employer,
        employeeInfo,
        terms,
        signatures,
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getLaborContractById(id: string) {
    const items = await prisma.laborContract.findMany({
      where: { id },
    });

    const c = items[0];
    if (!c) {
      throw new NotFoundError(`Không tìm thấy hợp đồng lao động ID: ${id}`);
    }

    let employer = {
      companyName: "CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC",
      representative: "Phạm Gia Phúc",
      position: "Giám Đốc",
      nationality: "Việt Nam",
      address: "Đường PA 087, Khu phố An Thuận, Phường Phú An, TP. HCM",
      phone: "0985 862 609 - 0914 665 994",
      taxCode: "0318999888",
    };
    if (c.employerData) {
      try {
        employer = { ...employer, ...JSON.parse(c.employerData) };
      } catch {}
    }

    let employeeInfo = {
      name: c.employeeName,
      dob: "1995-05-15",
      gender: "Nam",
      idCard: "079095001234",
      idCardDate: "2020-01-10",
      idCardPlace: "Cục Cảnh sát QLHC về TTXH",
      permanentAddress: "TP. Hồ Chí Minh",
      currentAddress: "TP. Hồ Chí Minh",
      phone: "0901234567",
      email: "employee@vitinhgiaphuc.com",
    };
    if (c.employeeInfo) {
      try {
        employeeInfo = { ...employeeInfo, ...JSON.parse(c.employeeInfo) };
      } catch {}
    }

    let terms = {
      jobTitle: c.employeeRole,
      department: "Kinh Doanh & Bán Hàng",
      workLocation: "Kho Chính Gia Phúc Computer",
      workingHours: "48 giờ/tuần (8h/ngày)",
      basicSalary: 8500000,
      allowance: 1000000,
      kpiBonus: "Theo quy chế thưởng doanh số kinh doanh",
      paymentDate: "Ngày 05 hàng tháng",
      paymentMethod: "Chuyển khoản qua ngân hàng",
      insurancePolicy: "Được đóng BHXH, BHYT, BHTN đầy đủ theo quy định",
    };
    if (c.termsData) {
      try {
        terms = { ...terms, ...JSON.parse(c.termsData) };
      } catch {}
    }

    let signatures = {
      employerSigned: c.status === "signed" || c.status === "active",
      employerSignDate: c.signDate ? new Date(c.signDate).toISOString().slice(0, 10) : "",
      employeeSigned: c.status === "signed" || c.status === "active",
      employeeSignDate: c.signDate ? new Date(c.signDate).toISOString().slice(0, 10) : "",
    };
    if (c.signaturesData) {
      try {
        signatures = { ...signatures, ...JSON.parse(c.signaturesData) };
      } catch {}
    }

    return {
      ...c,
      employer,
      employeeInfo,
      terms,
      signatures,
    };
  }

  static async createLaborContract(input: CreateLaborContractInput) {
    const year = new Date().getFullYear();
    const count = (await prisma.laborContract.count()) + 1;
    const contractNumber =
      input.contractNumber ||
      `HĐLĐ-${year}/GP-${String(count).padStart(3, "0")}`;

    const employerDataStr =
      typeof input.employerData === "string"
        ? input.employerData
        : JSON.stringify(input.employerData);
    const employeeInfoStr =
      typeof input.employeeInfo === "string"
        ? input.employeeInfo
        : JSON.stringify(input.employeeInfo);
    const termsDataStr =
      typeof input.termsData === "string"
        ? input.termsData
        : JSON.stringify(input.termsData);
    const signaturesDataStr =
      typeof input.signaturesData === "string"
        ? input.signaturesData
        : JSON.stringify(input.signaturesData);

    const id = (input as any).id || `contract-${Date.now()}`;
    const sDate = new Date(input.startDate);
    const eDate = input.endDate ? new Date(input.endDate) : null;
    const signDt = input.signDate ? new Date(input.signDate) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [HopDongLaoDong] (id, contractNumber, employeeId, employeeCode, employeeName, employeeRole, contractType, startDate, endDate, signDate, status, employerData, employeeInfo, termsData, signaturesData, notes)
      VALUES (${id}, ${contractNumber}, ${input.employeeId}, ${input.employeeCode}, ${input.employeeName}, ${input.employeeRole}, ${input.contractType || "Xác định thời hạn (12 tháng)"}, ${sDate}, ${eDate}, ${signDt}, ${input.status || "active"}, ${employerDataStr}, ${employeeInfoStr}, ${termsDataStr}, ${signaturesDataStr}, ${input.notes || null})
    `;

    return this.getLaborContractById(id);
  }

  static async updateLaborContract(id: string, input: UpdateLaborContractInput) {
    await this.getLaborContractById(id);

    const updateData: any = { ...input };
    if (input.employerData) {
      updateData.employerData =
        typeof input.employerData === "string"
          ? input.employerData
          : JSON.stringify(input.employerData);
    }
    if (input.employeeInfo) {
      updateData.employeeInfo =
        typeof input.employeeInfo === "string"
          ? input.employeeInfo
          : JSON.stringify(input.employeeInfo);
    }
    if (input.termsData) {
      updateData.termsData =
        typeof input.termsData === "string"
          ? input.termsData
          : JSON.stringify(input.termsData);
    }
    if (input.signaturesData) {
      updateData.signaturesData =
        typeof input.signaturesData === "string"
          ? input.signaturesData
          : JSON.stringify(input.signaturesData);
    }
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);
    if (input.signDate) updateData.signDate = new Date(input.signDate);

    await prisma.laborContract.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getLaborContractById(id);
  }

  static async deleteLaborContract(id: string) {
    await this.getLaborContractById(id);
    await prisma.laborContract.deleteMany({
      where: { id },
    });
    return { message: "Xóa hợp đồng lao động thành công" };
  }
}
