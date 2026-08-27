import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  managerName: z.string().optional().nullable(),
  budget: z.number().optional().default(0),
  memberCount: z.number().optional().default(0),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  description: z.string().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createJobPositionSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  departmentId: z.string().optional().nullable(),
  departmentName: z.string().optional().nullable(),
  baseSalary: z.number().optional().default(0),
  responsibilityAllowance: z.number().optional().default(0),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  description: z.string().optional().nullable(),
});

export const updateJobPositionSchema = createJobPositionSchema.partial();

export const createWarehouseLocationSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  warehouseName: z.string().optional().default("Kho Tổng"),
  zone: z.string().optional().nullable(),
  shelf: z.string().optional().nullable(),
  tier: z.string().optional().nullable(),
  bin: z.string().optional().nullable(),
  capacity: z.number().optional().default(100),
  currentUsage: z.number().optional().default(0),
  status: z.enum(["active", "maintenance", "full"]).optional().default("active"),
  notes: z.string().optional().nullable(),
});

export const updateWarehouseLocationSchema = createWarehouseLocationSchema.partial();

export const createUnitOfMeasureSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().optional().nullable(),
  isBaseUnit: z.boolean().optional().default(true),
  referenceUnit: z.string().optional().nullable(),
  conversionFactor: z.number().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  description: z.string().optional().nullable(),
});

export const updateUnitOfMeasureSchema = createUnitOfMeasureSchema.partial();

export const createUOMConversionSchema = z.object({
  fromUnitName: z.string().min(1),
  fromUnitId: z.string().optional().nullable(),
  factor: z.number().positive(),
  toUnitName: z.string().min(1),
  toUnitId: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateUOMConversionSchema = createUOMConversionSchema.partial();

export const createProductCategorySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().optional().default(0),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  description: z.string().optional().nullable(),
});

export const updateProductCategorySchema = createProductCategorySchema.partial();

export const createCustomerGroupSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  discountPercent: z.number().optional().default(0),
  paymentTerms: z.string().optional().default("Thanh toán ngay"),
  creditLimit: z.number().optional().default(0),
  description: z.string().optional().nullable(),
  customerCount: z.number().optional().default(0),
});

export const updateCustomerGroupSchema = createCustomerGroupSchema.partial();

export const createCustomerTierSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  minSpend: z.number().optional().default(0),
  discountPercent: z.number().optional().default(0),
  pointMultiplier: z.number().optional().default(1),
  color: z.string().optional().default("#10B981"),
  badge: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
});

export const updateCustomerTierSchema = createCustomerTierSchema.partial();

export const createSupplierCategorySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  defaultPaymentTerms: z.string().optional().default("Gối đầu 30 ngày"),
  supplierCount: z.number().optional().default(0),
});

export const updateSupplierCategorySchema = createSupplierCategorySchema.partial();

export const createProjectSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(["in_progress", "completed", "planning", "on_hold"]).optional().default("in_progress"),
  customerName: z.string().min(1),
  customerId: z.string().optional().nullable(),
  managerName: z.string().min(1),
  managerId: z.string().optional().nullable(),
  budget: z.number().optional().default(0),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  sector: z.string().optional().default("Công Nghệ Thông Tin & Phần Mềm"),
  description: z.string().optional().nullable(),
  linkedDeviceCount: z.number().optional().default(0),
});

export const updateProjectSchema = createProjectSchema.partial();
