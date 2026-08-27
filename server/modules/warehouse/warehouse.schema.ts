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
  specifications: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  warrantyMonths: z.coerce.number().int().optional().default(12),
  accessories: z.string().optional().nullable(),
  serials: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
});

export const createGoodsReceiptSchema = z.object({
  code: z.string().optional(),
  date: z.string().optional(),
  sourceType: z.enum(["po", "quote", "inbound_invoice", "manual"]).optional().default("manual"),
  sourceId: z.string().optional().nullable(),
  sourceCode: z.string().optional().nullable(),
  inboundInvoiceId: z.string().optional().nullable(),
  inboundInvoiceCode: z.string().optional().nullable(),
  supplierName: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  supplierTaxCode: z.string().optional().nullable(),
  supplierPhone: z.string().optional().nullable(),
  supplierAddress: z.string().optional().nullable(),
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

export const goodsIssueItemSchema = z.object({
  productId: z.string().min(1, "Thiếu productId"),
  productName: z.string().min(1, "Thiếu productName"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().default("Cái"),
  quantity: z.coerce.number().positive("Số lượng xuất phải lớn hơn 0"),
  serials: z.array(z.string()).optional().default([]),
  warrantyMonths: z.coerce.number().int().optional().default(12),
  notes: z.string().optional().nullable(),
});

export const createGoodsIssueSchema = z.object({
  code: z.string().optional(),
  orderId: z.string().optional().nullable(),
  orderCode: z.string().min(1, "Mã đơn hàng không được để trống"),
  customerName: z.string().min(1, "Tên khách hàng không được để trống"),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  warehouseName: z.string().default("Kho Chính"),
  dispatchedBy: z.string().min(1, "Thủ kho xuất hàng không được để trống"),
  dispatchedAt: z.string().optional(),
  totalQuantity: z.coerce.number().positive(),
  totalItemsCount: z.coerce.number().int().min(1),
  status: z.enum(["completed", "cancelled"]).default("completed"),
  notes: z.string().optional().nullable(),
  items: z.array(goodsIssueItemSchema).min(1, "Phiếu xuất phải có ít nhất 1 mặt hàng"),
});

export const goodsIssueQuerySchema = z.object({
  search: z.string().optional(),
  orderCode: z.string().optional(),
  customerName: z.string().optional(),
  warehouseName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["dispatchedAt", "code"]).default("dispatchedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
export type GoodsIssueItemInput = z.infer<typeof goodsIssueItemSchema>;
export type CreateGoodsIssueInput = z.infer<typeof createGoodsIssueSchema>;
export type GoodsIssueQueryInput = z.infer<typeof goodsIssueQuerySchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type GoodsReceiptQueryInput = z.infer<typeof goodsReceiptQuerySchema>;
export type InventoryLogQueryInput = z.infer<typeof inventoryLogQuerySchema>;
