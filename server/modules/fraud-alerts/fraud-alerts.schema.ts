import { z } from "zod";

export const createFraudAlertSchema = z.object({
  severity: z.enum(["high", "medium", "low"]).default("medium"),
  title: z.string().min(1, "Tiêu đề cảnh báo không được để trống"),
  description: z.string().min(1, "Mô tả cảnh báo không được để trống"),
  timestamp: z.string().optional(),
  source: z.enum(["POS", "CashShift", "Inventory", "Accounting"]).default("POS"),
  status: z.enum(["unresolved", "investigating", "resolved"]).default("unresolved"),
  suggestedAction: z.string().min(1, "Hành động đề xuất không được để trống"),
});

export const updateFraudAlertSchema = createFraudAlertSchema.partial();

export const fraudAlertQuerySchema = z.object({
  search: z.string().optional(),
  severity: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export type CreateFraudAlertInput = z.infer<typeof createFraudAlertSchema>;
export type UpdateFraudAlertInput = z.infer<typeof updateFraudAlertSchema>;
export type FraudAlertQueryInput = z.infer<typeof fraudAlertQuerySchema>;
