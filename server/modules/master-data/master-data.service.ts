import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";

export class MasterDataService {
  // 1. GET ALL MASTER DATA
  static async getAllMasterData() {
    const [
      departments,
      jobPositions,
      warehouseLocations,
      unitsOfMeasure,
      productCategories,
      customerGroups,
      customerTiers,
      supplierCategories,
      projects,
      customers,
      suppliers,
    ] = await Promise.all([
      prisma.department.findMany({}),
      prisma.jobPosition.findMany({}),
      prisma.warehouseLocation.findMany({}),
      prisma.masterUnitOfMeasure.findMany({}),
      prisma.masterProductCategory.findMany({}),
      prisma.customerGroup.findMany({}),
      prisma.masterCustomerTier.findMany({}),
      prisma.masterSupplierCategory.findMany({}),
      prisma.enterpriseProject.findMany({}),
      prisma.customer.findMany({}),
      prisma.supplier.findMany({}),
    ]);

    departments.sort((a, b) => a.code.localeCompare(b.code));
    jobPositions.sort((a, b) => a.code.localeCompare(b.code));
    warehouseLocations.sort((a, b) => a.code.localeCompare(b.code));
    unitsOfMeasure.sort((a, b) => a.code.localeCompare(b.code));
    productCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    customerGroups.sort((a, b) => a.code.localeCompare(b.code));
    customerTiers.sort((a, b) => Number(a.minSpend || 0) - Number(b.minSpend || 0));
    supplierCategories.sort((a, b) => a.code.localeCompare(b.code));
    projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    customers.sort((a, b) => a.name.localeCompare(b.name));
    suppliers.sort((a, b) => a.name.localeCompare(b.name));

    return {
      departments: departments.map((d) => ({ ...d, budget: Number(d.budget) })),
      jobPositions: jobPositions.map((p) => ({
        ...p,
        baseSalary: Number(p.baseSalary),
        responsibilityAllowance: Number(p.responsibilityAllowance),
      })),
      warehouseLocations,
      unitsOfMeasure: unitsOfMeasure.map((u) => ({
        ...u,
        conversionFactor: u.conversionFactor ? Number(u.conversionFactor) : null,
      })),
      productCategories,
      customerGroups: customerGroups.map((g) => ({
        ...g,
        discountPercent: Number(g.discountPercent),
        creditLimit: Number(g.creditLimit),
      })),
      customerTiers: customerTiers.map((t) => ({
        ...t,
        minSpend: Number(t.minSpend),
        discountPercent: Number(t.discountPercent),
        pointMultiplier: Number(t.pointMultiplier),
      })),
      supplierCategories,
      projects: projects.map((pr) => ({ ...pr, budget: Number(pr.budget) })),
      customers: customers.map((c) => ({
        ...c,
        points: Number(c.points),
        totalSpent: Number(c.totalSpent),
        debt: Number(c.debt),
      })),
      suppliers: suppliers.map((s) => ({
        ...s,
        creditLimit: Number(s.creditLimit),
        currentDebt: Number(s.currentDebt),
        ratingQuality: Number(s.ratingQuality),
        ratingPrice: Number(s.ratingPrice),
        ratingOnTime: Number(s.ratingOnTime),
        ratingWarranty: Number(s.ratingWarranty),
      })),
    };
  }

  // 2. DEPARTMENTS
  static async getDepartments() {
    const items = await prisma.department.findMany({});
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items.map((d) => ({ ...d, budget: Number(d.budget) }));
  }

  static async createDepartment(data: any) {
    const existing = await prisma.department.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã phòng ban đã tồn tại trên hệ thống");
    const id = data.id || `dept-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [PhongBan] (id, code, name, managerName, budget, memberCount, status, description, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.managerName || null}, ${Number(data.budget) || 0}, ${Number(data.memberCount) || 0}, ${data.status || 'active'}, ${data.description || null}, ${now}, ${now})
    `;
    const created = await prisma.department.findMany({ where: { id } });
    return created[0] ? { ...created[0], budget: Number(created[0].budget) } : null;
  }

  static async updateDepartment(id: string, data: any) {
    const existing = await prisma.department.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy phòng ban");
    await prisma.department.updateMany({ where: { id }, data });
    const updated = await prisma.department.findMany({ where: { id } });
    return updated[0] ? { ...updated[0], budget: Number(updated[0].budget) } : null;
  }

  static async deleteDepartment(id: string) {
    const existing = await prisma.department.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy phòng ban");
    await prisma.department.deleteMany({ where: { id } });
    return { success: true };
  }

  // 3. JOB POSITIONS
  static async getJobPositions() {
    const items = await prisma.jobPosition.findMany({});
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items.map((p) => ({
      ...p,
      baseSalary: Number(p.baseSalary),
      responsibilityAllowance: Number(p.responsibilityAllowance),
    }));
  }

  static async createJobPosition(data: any) {
    const existing = await prisma.jobPosition.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã chức vụ đã tồn tại trên hệ thống");
    const id = data.id || `pos-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [ChucVu] (id, code, title, departmentId, departmentName, baseSalary, responsibilityAllowance, status, description, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.title}, ${data.departmentId || null}, ${data.departmentName || null}, ${Number(data.baseSalary) || 0}, ${Number(data.responsibilityAllowance) || 0}, ${data.status || 'active'}, ${data.description || null}, ${now}, ${now})
    `;
    const created = await prisma.jobPosition.findMany({ where: { id } });
    return created[0]
      ? {
          ...created[0],
          baseSalary: Number(created[0].baseSalary),
          responsibilityAllowance: Number(created[0].responsibilityAllowance),
        }
      : null;
  }

  static async updateJobPosition(id: string, data: any) {
    const existing = await prisma.jobPosition.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy chức vụ");
    await prisma.jobPosition.updateMany({ where: { id }, data });
    const updated = await prisma.jobPosition.findMany({ where: { id } });
    return updated[0]
      ? {
          ...updated[0],
          baseSalary: Number(updated[0].baseSalary),
          responsibilityAllowance: Number(updated[0].responsibilityAllowance),
        }
      : null;
  }

  static async deleteJobPosition(id: string) {
    const existing = await prisma.jobPosition.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy chức vụ");
    await prisma.jobPosition.deleteMany({ where: { id } });
    return { success: true };
  }

  // 4. WAREHOUSE LOCATIONS
  static async getWarehouseLocations() {
    const items = await prisma.warehouseLocation.findMany({});
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items;
  }

  static async createWarehouseLocation(data: any) {
    const existing = await prisma.warehouseLocation.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã vị trí kho đã tồn tại");
    const id = data.id || `loc-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [ViTriLuuKho] (id, code, name, warehouseName, zone, shelf, tier, bin, capacity, currentUsage, status, notes, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.warehouseName || 'Kho Tổng'}, ${data.zone || null}, ${data.shelf || null}, ${data.tier || null}, ${data.bin || null}, ${Number(data.capacity) || 100}, ${Number(data.currentUsage) || 0}, ${data.status || 'active'}, ${data.notes || null}, ${now}, ${now})
    `;
    const created = await prisma.warehouseLocation.findMany({ where: { id } });
    return created[0] || null;
  }

  static async updateWarehouseLocation(id: string, data: any) {
    const existing = await prisma.warehouseLocation.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy vị trí kho");
    await prisma.warehouseLocation.updateMany({ where: { id }, data });
    const updated = await prisma.warehouseLocation.findMany({ where: { id } });
    return updated[0] || null;
  }

  static async deleteWarehouseLocation(id: string) {
    const existing = await prisma.warehouseLocation.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy vị trí kho");
    await prisma.warehouseLocation.deleteMany({ where: { id } });
    return { success: true };
  }

  // 5. UNITS OF MEASURE
  static async getUnitsOfMeasure() {
    const items = await prisma.masterUnitOfMeasure.findMany({});
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items.map((u) => ({
      ...u,
      conversionFactor: u.conversionFactor ? Number(u.conversionFactor) : null,
    }));
  }

  static async createUnitOfMeasure(data: any) {
    const existing = await prisma.masterUnitOfMeasure.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã đơn vị tính đã tồn tại");
    const id = data.id || `uom-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [DanhMucDonViTinh] (id, code, name, symbol, isBaseUnit, referenceUnit, conversionFactor, status, description, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.symbol || null}, ${data.isBaseUnit ? 1 : 0}, ${data.referenceUnit || null}, ${data.conversionFactor || null}, ${data.status || 'active'}, ${data.description || null}, ${now}, ${now})
    `;
    const created = await prisma.masterUnitOfMeasure.findMany({ where: { id } });
    return created[0]
      ? { ...created[0], conversionFactor: created[0].conversionFactor ? Number(created[0].conversionFactor) : null }
      : null;
  }

  static async updateUnitOfMeasure(id: string, data: any) {
    const existing = await prisma.masterUnitOfMeasure.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy đơn vị tính");
    await prisma.masterUnitOfMeasure.updateMany({ where: { id }, data });
    const updated = await prisma.masterUnitOfMeasure.findMany({ where: { id } });
    return updated[0]
      ? { ...updated[0], conversionFactor: updated[0].conversionFactor ? Number(updated[0].conversionFactor) : null }
      : null;
  }

  static async deleteUnitOfMeasure(id: string) {
    const existing = await prisma.masterUnitOfMeasure.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy đơn vị tính");
    await prisma.masterUnitOfMeasure.deleteMany({ where: { id } });
    return { success: true };
  }

  // 6. PRODUCT CATEGORIES
  static async getProductCategories() {
    const items = await prisma.masterProductCategory.findMany({});
    items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return items;
  }

  static async createProductCategory(data: any) {
    const existing = await prisma.masterProductCategory.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã danh mục ngành hàng đã tồn tại");
    const id = data.id || `cat-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [DanhMucNganhHang] (id, code, name, slug, icon, sortOrder, status, description, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.slug || null}, ${data.icon || null}, ${Number(data.sortOrder) || 0}, ${data.status || 'active'}, ${data.description || null}, ${now}, ${now})
    `;
    const created = await prisma.masterProductCategory.findMany({ where: { id } });
    return created[0] || null;
  }

  static async updateProductCategory(id: string, data: any) {
    const existing = await prisma.masterProductCategory.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy danh mục ngành hàng");
    await prisma.masterProductCategory.updateMany({ where: { id }, data });
    const updated = await prisma.masterProductCategory.findMany({ where: { id } });
    return updated[0] || null;
  }

  static async deleteProductCategory(id: string) {
    const existing = await prisma.masterProductCategory.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy danh mục ngành hàng");
    await prisma.masterProductCategory.deleteMany({ where: { id } });
    return { success: true };
  }

  // 7. CUSTOMER GROUPS
  static async getCustomerGroups() {
    const items = await prisma.customerGroup.findMany({});
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items.map((g) => ({
      ...g,
      discountPercent: Number(g.discountPercent),
      creditLimit: Number(g.creditLimit),
    }));
  }

  static async createCustomerGroup(data: any) {
    const existing = await prisma.customerGroup.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã nhóm khách hàng đã tồn tại");
    const id = data.id || `grp-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [NhomKhachHang] (id, code, name, discountPercent, paymentTerms, creditLimit, description, customerCount, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${Number(data.discountPercent) || 0}, ${data.paymentTerms || 'Thanh toán ngay'}, ${Number(data.creditLimit) || 0}, ${data.description || null}, ${Number(data.customerCount) || 0}, ${now}, ${now})
    `;
    const created = await prisma.customerGroup.findMany({ where: { id } });
    return created[0]
      ? { ...created[0], discountPercent: Number(created[0].discountPercent), creditLimit: Number(created[0].creditLimit) }
      : null;
  }

  static async updateCustomerGroup(id: string, data: any) {
    const existing = await prisma.customerGroup.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy nhóm khách hàng");
    await prisma.customerGroup.updateMany({ where: { id }, data });
    const updated = await prisma.customerGroup.findMany({ where: { id } });
    return updated[0]
      ? { ...updated[0], discountPercent: Number(updated[0].discountPercent), creditLimit: Number(updated[0].creditLimit) }
      : null;
  }

  static async deleteCustomerGroup(id: string) {
    const existing = await prisma.customerGroup.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy nhóm khách hàng");
    await prisma.customerGroup.deleteMany({ where: { id } });
    return { success: true };
  }

  // 8. CUSTOMER TIERS
  static async getCustomerTiers() {
    const items = await prisma.masterCustomerTier.findMany({});
    items.sort((a, b) => Number(a.minSpend || 0) - Number(b.minSpend || 0));
    return items.map((t) => ({
      ...t,
      minSpend: Number(t.minSpend),
      discountPercent: Number(t.discountPercent),
      pointMultiplier: Number(t.pointMultiplier),
    }));
  }

  static async createCustomerTier(data: any) {
    const existing = await prisma.masterCustomerTier.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã hạng thành viên đã tồn tại");
    const id = data.id || `tier-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [HangThanhVien] (id, code, name, minSpend, discountPercent, pointMultiplier, color, badge, benefits, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${Number(data.minSpend) || 0}, ${Number(data.discountPercent) || 0}, ${Number(data.pointMultiplier) || 1}, ${data.color || '#10B981'}, ${data.badge || null}, ${data.benefits || null}, ${now}, ${now})
    `;
    const created = await prisma.masterCustomerTier.findMany({ where: { id } });
    return created[0]
      ? {
          ...created[0],
          minSpend: Number(created[0].minSpend),
          discountPercent: Number(created[0].discountPercent),
          pointMultiplier: Number(created[0].pointMultiplier),
        }
      : null;
  }

  static async updateCustomerTier(id: string, data: any) {
    const existing = await prisma.masterCustomerTier.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy hạng thành viên");
    await prisma.masterCustomerTier.updateMany({ where: { id }, data });
    const updated = await prisma.masterCustomerTier.findMany({ where: { id } });
    return updated[0]
      ? {
          ...updated[0],
          minSpend: Number(updated[0].minSpend),
          discountPercent: Number(updated[0].discountPercent),
          pointMultiplier: Number(updated[0].pointMultiplier),
        }
      : null;
  }

  static async deleteCustomerTier(id: string) {
    const existing = await prisma.masterCustomerTier.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy hạng thành viên");
    await prisma.masterCustomerTier.deleteMany({ where: { id } });
    return { success: true };
  }

  // 9. SUPPLIER CATEGORIES
  static async getSupplierCategories() {
    const items = await prisma.masterSupplierCategory.findMany({});
    items.sort((a, b) => a.code.localeCompare(b.code));
    return items;
  }

  static async createSupplierCategory(data: any) {
    const existing = await prisma.masterSupplierCategory.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã phân loại NCC đã tồn tại");
    const id = data.id || `supcat-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [PhanLoaiNhaCungCap] (id, code, name, description, defaultPaymentTerms, supplierCount, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.description || null}, ${data.defaultPaymentTerms || 'Gối đầu 30 ngày'}, ${Number(data.supplierCount) || 0}, ${now}, ${now})
    `;
    const created = await prisma.masterSupplierCategory.findMany({ where: { id } });
    return created[0] || null;
  }

  static async updateSupplierCategory(id: string, data: any) {
    const existing = await prisma.masterSupplierCategory.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy phân loại NCC");
    await prisma.masterSupplierCategory.updateMany({ where: { id }, data });
    const updated = await prisma.masterSupplierCategory.findMany({ where: { id } });
    return updated[0] || null;
  }

  static async deleteSupplierCategory(id: string) {
    const existing = await prisma.masterSupplierCategory.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy phân loại NCC");
    await prisma.masterSupplierCategory.deleteMany({ where: { id } });
    return { success: true };
  }

  // 10. ENTERPRISE PROJECTS
  static async getProjects() {
    const items = await prisma.enterpriseProject.findMany({});
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items.map((p) => ({ ...p, budget: Number(p.budget) }));
  }

  static async createProject(data: any) {
    const existing = await prisma.enterpriseProject.findMany({ where: { code: data.code } });
    if (existing.length > 0) throw new ConflictError("Mã dự án đã tồn tại");
    const id = data.id || `proj-${Date.now()}`;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO [DuAnDoanhNghiep] (id, code, name, status, customerName, customerId, managerName, managerId, budget, startDate, endDate, sector, description, linkedDeviceCount, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.status || 'in_progress'}, ${data.customerName}, ${data.customerId || null}, ${data.managerName}, ${data.managerId || null}, ${Number(data.budget) || 0}, ${data.startDate}, ${data.endDate || null}, ${data.sector || 'Công Nghệ Thông Tin & Phần Mềm'}, ${data.description || null}, ${Number(data.linkedDeviceCount) || 0}, ${now}, ${now})
    `;
    const created = await prisma.enterpriseProject.findMany({ where: { id } });
    return created[0] ? { ...created[0], budget: Number(created[0].budget) } : null;
  }

  static async updateProject(id: string, data: any) {
    const existing = await prisma.enterpriseProject.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy dự án");
    await prisma.enterpriseProject.updateMany({ where: { id }, data });
    const updated = await prisma.enterpriseProject.findMany({ where: { id } });
    return updated[0] ? { ...updated[0], budget: Number(updated[0].budget) } : null;
  }

  static async deleteProject(id: string) {
    const existing = await prisma.enterpriseProject.findMany({ where: { id } });
    if (existing.length === 0) throw new NotFoundError("Không tìm thấy dự án");
    await prisma.enterpriseProject.deleteMany({ where: { id } });
    return { success: true };
  }
}
