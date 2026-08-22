import { z } from "zod";

export const stockTransferItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Thiếu Product ID"),
  productName: z.string().min(1, "Thiếu tên sản phẩm"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().default("Cái"),
  quantity: z.coerce.number().positive("Số lượng chuyển phải lớn hơn 0"),
  unitCost: z.coerce.number().min(0, "Giá vốn không hợp lệ"),
  totalCost: z.coerce.number().min(0),
});

export const createStockTransferSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  fromWarehouse: z.string().min(1, "Kho xuất không được để trống"),
  toWarehouse: z.string().min(1, "Kho nhận không được để trống"),
  transferDate: z.string().optional(),
  status: z.enum(["draft", "in_transit", "completed", "cancelled"]).default("in_transit"),
  totalItems: z.coerce.number().int().min(1),
  totalQuantity: z.coerce.number().positive(),
  senderName: z.string().min(1, "Tên người xuất chuyển không được để trống"),
  receiverName: z.string().optional().nullable(),
  transportMethod: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(stockTransferItemSchema).min(1, "Phiếu chuyển kho phải có ít nhất 1 sản phẩm"),
});

export const updateStockTransferStatusSchema = z.object({
  status: z.enum(["in_transit", "completed", "cancelled"]),
  receiverName: z.string().optional().nullable(),
  receivedDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const stockTransferQuerySchema = z.object({
  search: z.string().optional(),
  fromWarehouse: z.string().optional(),
  toWarehouse: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["createdAt", "transferDate", "code"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type StockTransferItemInput = z.infer<typeof stockTransferItemSchema>;
export type CreateStockTransferInput = z.infer<typeof createStockTransferSchema>;
export type UpdateStockTransferStatusInput = z.infer<typeof updateStockTransferStatusSchema>;
export type StockTransferQueryInput = z.infer<typeof stockTransferQuerySchema>;
