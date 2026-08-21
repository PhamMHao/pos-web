import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  phone: z.string().min(8, "Số điện thoại tối thiểu 8 số"),
  email: z.union([z.string().email("Email không hợp lệ"), z.literal(""), z.null(), z.undefined()]).optional(),
  address: z.string().optional().nullable(),
  tier: z.enum(["Đồng", "Bạc", "Vàng", "Kim Cương"]).default("Đồng"),
  points: z.coerce.number().min(0).default(0),
  totalSpent: z.coerce.number().min(0).default(0),
  totalOrders: z.coerce.number().int().min(0).default(0),
  debt: z.coerce.number().default(0),
  note: z.string().optional().nullable(),
});

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
