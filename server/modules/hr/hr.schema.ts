import { z } from "zod";

export const createEmployeeSchema = z.object({
  code: z.string().min(1, "Mã nhân viên không được để trống"),
  name: z.string().min(1, "Tên nhân viên không được để trống"),
  role: z.string().min(1, "Chức vụ không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  baseSalary: z.coerce.number().min(0, "Lương cơ bản không được âm"),
  salesKpiTarget: z.coerce.number().min(0).default(0),
  currentSales: z.coerce.number().min(0).default(0),
  commissionRate: z.coerce.number().min(0).default(0),
  status: z.enum(["active", "leave", "inactive"]).default("active"),
  avatar: z.string().optional().nullable(),
  joinedDate: z.string().optional(),
  shiftSchedule: z.string().optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export const createLaborContractSchema = z.object({
  contractNumber: z.string().optional(),
  employeeId: z.string().min(1, "Thiếu employeeId"),
  employeeCode: z.string().min(1, "Thiếu employeeCode"),
  employeeName: z.string().min(1, "Tên nhân viên không được để trống"),
  employeeRole: z.string().min(1, "Chức danh không được để trống"),
  contractType: z.string().default("Xác định thời hạn (12 tháng)"),
  startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
  endDate: z.string().optional().nullable(),
  signDate: z.string().optional(),
  status: z
    .enum(["draft", "sent_for_signature", "signed", "active", "expired", "terminated"])
    .default("active"),
  employerData: z.union([z.string(), z.record(z.string(), z.any())]),
  employeeInfo: z.union([z.string(), z.record(z.string(), z.any())]),
  termsData: z.union([z.string(), z.record(z.string(), z.any())]),
  signaturesData: z.union([z.string(), z.record(z.string(), z.any())]),
  notes: z.string().optional().nullable(),
});

export const updateLaborContractSchema = createLaborContractSchema.partial();

export const laborContractQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  contractType: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
export type CreateLaborContractInput = z.infer<typeof createLaborContractSchema>;
export type UpdateLaborContractInput = z.infer<typeof updateLaborContractSchema>;
export type LaborContractQueryInput = z.infer<typeof laborContractQuerySchema>;
