import { z } from "zod";

export const createAccountingRecordSchema = z.object({
  code: z.string().optional(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Danh mục không được để trống"),
  amount: z.coerce.number().positive("Số tiền phải lớn hơn 0"),
  date: z.string().optional(),
  party: z.string().min(1, "Đối tác / Người nộp nhận không được để trống"),
  paymentMethod: z.string().default("cash"),
  status: z.string().default("completed"),
  note: z.string().optional().nullable(),
  receiptNumber: z.string().optional().nullable(),
});

export const updateAccountingRecordSchema = createAccountingRecordSchema.partial();

export const accountingRecordQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["date", "amount", "code"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAccountingRecordInput = z.infer<typeof createAccountingRecordSchema>;
export type UpdateAccountingRecordInput = z.infer<typeof updateAccountingRecordSchema>;
export type AccountingRecordQueryInput = z.infer<typeof accountingRecordQuerySchema>;
