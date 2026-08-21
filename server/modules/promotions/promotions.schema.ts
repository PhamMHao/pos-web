import { z } from "zod";

export const createPromotionSchema = z.object({
  code: z.string().min(1, "Mã khuyến mãi không được để trống"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Giá trị giảm phải lớn hơn 0"),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().optional().nullable(),
  usageLimit: z.coerce.number().int().min(1).default(100),
  usedCount: z.coerce.number().int().min(0).default(0),
  startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
  endDate: z.string().min(1, "Ngày kết thúc không được để trống"),
  isActive: z.boolean().default(true),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export const promotionQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export const validatePromoCodeSchema = z.object({
  code: z.string().min(1, "Thiếu mã khuyến mãi"),
  orderTotal: z.coerce.number().min(0),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type PromotionQueryInput = z.infer<typeof promotionQuerySchema>;
export type ValidatePromoCodeInput = z.infer<typeof validatePromoCodeSchema>;
