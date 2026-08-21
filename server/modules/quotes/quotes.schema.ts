import { z } from "zod";

export const priceQuoteItemSchema = z.object({
  productName: z.string().min(1, "Tên sản phẩm không được để trống"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().min(1, "Thiếu ĐVT"),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0, "Đơn giá không được âm"),
  total: z.coerce.number().min(0),
});

export const createPriceQuoteSchema = z.object({
  code: z.string().optional(),
  customerName: z.string().min(1, "Tên khách hàng không được để trống"),
  customerPhone: z.string().min(1, "Số điện thoại không được để trống"),
  customerCompany: z.string().optional().nullable(),
  totalAmount: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).default(0),
  finalTotal: z.coerce.number().min(0),
  validUntil: z.string().min(1, "Ngày hiệu lực không được để trống"),
  status: z
    .enum(["draft", "sent", "approved", "converted_to_order", "rejected"])
    .default("draft"),
  notes: z.string().optional().nullable(),
  items: z.array(priceQuoteItemSchema).min(1, "Báo giá phải có ít nhất 1 sản phẩm"),
});

export const updatePriceQuoteSchema = createPriceQuoteSchema.partial();

export const priceQuoteQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["createdAt", "finalTotal", "validUntil"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PriceQuoteItemInput = z.infer<typeof priceQuoteItemSchema>;
export type CreatePriceQuoteInput = z.infer<typeof createPriceQuoteSchema>;
export type UpdatePriceQuoteInput = z.infer<typeof updatePriceQuoteSchema>;
export type PriceQuoteQueryInput = z.infer<typeof priceQuoteQuerySchema>;
