import { z } from "zod";

export const goodsReceiptItemSchema = z.object({
  productId: z.string().min(1, "Thiếu productId"),
  productName: z.string().min(1, "Thiếu productName"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().min(1, "Thiếu ĐVT"),
  quantity: z.coerce.number().positive("Số lượng nhập phải lớn hơn 0"),
  oldStock: z.coerce.number().default(0),
  newStock: z.coerce.number().default(0),
  oldCostPrice: z.coerce.number().default(0),
  newCostPrice: z.coerce.number().default(0),
  unitCost: z.coerce.number().min(0, "Đơn giá nhập không được âm"),
  taxRate: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  storageLocation: z.string().optional().nullable(),
  warehouse: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createGoodsReceiptSchema = z.object({
  code: z.string().optional(),
  date: z.string().optional(),
  inboundInvoiceId: z.string().optional().nullable(),
  inboundInvoiceCode: z.string().optional().nullable(),
  supplierName: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  supplierTaxCode: z.string().optional().nullable(),
  warehouseName: z.string().default("Kho Chính"),
  creatorName: z.string().min(1, "Người lập phiếu không được để trống"),
  receivedBy: z.string().min(1, "Thủ kho nhận hàng không được để trống"),
  totalItemsCount: z.coerce.number().int().min(1),
  totalQuantity: z.coerce.number().positive(),
  totalCostAmount: z.coerce.number().min(0),
  totalTaxAmount: z.coerce.number().min(0).default(0),
  grandTotal: z.coerce.number().min(0),
  paymentStatus: z.enum(["paid", "debt_pending", "partial"]).default("paid"),
  notes: z.string().optional().nullable(),
  items: z.array(goodsReceiptItemSchema).min(1, "Phiếu nhập phải có ít nhất 1 mặt hàng"),
});

export const adjustStockSchema = z.object({
  productId: z.string().min(1, "Thiếu productId"),
  productName: z.string().min(1, "Thiếu productName"),
  sku: z.string().min(1, "Thiếu SKU"),
  type: z.enum(["import", "export", "audit_adjustment", "sale_deduct"]),
  quantityChange: z.coerce.number(),
  oldStock: z.coerce.number().min(0),
  newStock: z.coerce.number().min(0),
  unitPrice: z.coerce.number().optional().nullable(),
  reason: z.string().min(1, "Vui lòng nhập lý do điều chỉnh"),
  performedBy: z.string().default("Thủ kho"),
});

export const goodsReceiptQuerySchema = z.object({
  search: z.string().optional(),
  supplierName: z.string().optional(),
  paymentStatus: z.string().optional(),
  warehouseName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["date", "grandTotal", "code"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const inventoryLogQuerySchema = z.object({
  productId: z.string().optional(),
  sku: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(100),
});

export type GoodsReceiptItemInput = z.infer<typeof goodsReceiptItemSchema>;
export type CreateGoodsReceiptInput = z.infer<typeof createGoodsReceiptSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type GoodsReceiptQueryInput = z.infer<typeof goodsReceiptQuerySchema>;
export type InventoryLogQueryInput = z.infer<typeof inventoryLogQuerySchema>;
