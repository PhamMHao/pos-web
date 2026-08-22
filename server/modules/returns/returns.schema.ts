import { z } from "zod";

export const returnOrderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Thiếu Product ID"),
  productName: z.string().min(1, "Thiếu tên sản phẩm"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().default("Cái"),
  ratioToBase: z.coerce.number().default(1),
  quantity: z.coerce.number().positive("Số lượng trả phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0, "Đơn giá gốc không hợp lệ"),
  refundUnitPrice: z.coerce.number().min(0, "Đơn giá hoàn tiền không hợp lệ"),
  totalRefund: z.coerce.number().min(0),
  serialNumber: z.string().optional().nullable(),
  condition: z.enum(["normal", "damaged", "unopened"]).default("normal"),
});

export const createReturnOrderSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  type: z.enum(["customer_return", "supplier_return"]).default("customer_return"),
  originalOrderCode: z.string().optional().nullable(),
  originalOrderId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  supplierName: z.string().optional().nullable(),
  warehouse: z.string().default("Kho Chính"),
  refundMethod: z.enum(["cash", "transfer", "debt_deduct", "no_refund"]).default("cash"),
  refundAmount: z.coerce.number().min(0),
  totalReturnQuantity: z.coerce.number().min(0),
  reason: z.string().min(1, "Lý do trả hàng không được để trống"),
  destinationType: z.enum(["restock", "faulty_warehouse", "supplier_rma"]).default("restock"),
  status: z.enum(["completed", "pending", "cancelled"]).default("completed"),
  performedBy: z.string().default("Thu ngân"),
  notes: z.string().optional().nullable(),
  items: z.array(returnOrderItemSchema).min(1, "Phiếu trả hàng phải có ít nhất 1 sản phẩm"),
});

export const returnOrderQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["createdAt", "refundAmount", "code"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ReturnOrderItemInput = z.infer<typeof returnOrderItemSchema>;
export type CreateReturnOrderInput = z.infer<typeof createReturnOrderSchema>;
export type ReturnOrderQueryInput = z.infer<typeof returnOrderQuerySchema>;
