import { z } from "zod";

export const createCustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tier: z.string().optional().default("Đồng"),
  points: z.coerce.number().min(0).optional().default(0),
  totalSpent: z.coerce.number().min(0).optional().default(0),
  totalOrders: z.coerce.number().int().min(0).optional().default(0),
  debt: z.coerce.number().optional().default(0),
  note: z.string().optional().nullable(),
  customerType: z.string().optional().nullable(),
  groupName: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  taxCode: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  creditLimit: z.coerce.number().optional().nullable(),
  creditDays: z.coerce.number().optional().nullable(),
  invoiceEmail: z.string().optional().nullable(),
  quoteEmail: z.string().optional().nullable(),
}).passthrough();

export const updateCustomerSchema = createCustomerSchema.partial();

export const bulkImportCustomerSchema = z.object({
  customers: z.array(createCustomerSchema),
});

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  tier: z.string().optional(),
  hasDebt: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["name", "phone", "totalSpent", "points", "debt", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const adjustPointsSchema = z.object({
  pointsChange: z.coerce.number(), // positive or negative
  reason: z.string().optional(),
});

export const adjustDebtSchema = z.object({
  debtChange: z.coerce.number(), // positive or negative
  reason: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type BulkImportCustomerInput = z.infer<typeof bulkImportCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
export type AdjustPointsInput = z.infer<typeof adjustPointsSchema>;
export type AdjustDebtInput = z.infer<typeof adjustDebtSchema>;
