import { z } from "zod";

export const returnOrderItemSchema = z.object({
  id: z.string().optional(),
  originalOrderItemId: z.string().optional().nullable(),
  productId: z.string().min(1, "Thiếu Product ID"),
  productName: z.string().min(1, "Thiếu tên sản phẩm"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().default("Cái"),
  ratioToBase: z.coerce.number().default(1),
  quantity: z.coerce.number().positive("Số lượng trả phải lớn hơn 0"),
  costPrice: z.coerce.number().min(0).default(0),
  unitPrice: z.coerce.number().min(0, "Đơn giá gốc không hợp lệ"),
  refundUnitPrice: z.coerce.number().min(0, "Đơn giá hoàn tiền không hợp lệ"),
  taxRate: z.coerce.number().min(0).default(0),
  taxAmount: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0).default(0),
  totalRefund: z.coerce.number().min(0).default(0),
  condition: z.enum(["normal", "damaged", "unopened"]).default("unopened"),
  destinationType: z.enum(["restock", "faulty_warehouse"]).default("restock"),
  warehouseId: z.string().optional().nullable(),
  warehouseName: z.string().default("Kho Chính Gia Phúc Computer"),
  storageLocation: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  serials: z.array(z.string()).optional().default([]),
});

export const createReturnOrderSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  type: z.enum(["customer_return", "supplier_return"]).default("customer_return"),
  originalOrderId: z.string().optional().nullable(),
  originalOrderCode: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, "Tên khách hàng không được để trống"),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  warehouse: z.string().default("Kho Chính Gia Phúc Computer"),
  restockingFee: z.coerce.number().min(0).default(0),
  giftDeductionAmount: z.coerce.number().min(0).default(0),
  refundMethod: z.enum(["cash", "transfer", "debt_deduct", "no_refund"]).default("cash"),
  reason: z.string().min(1, "Lý do trả hàng không được để trống"),
  status: z.enum(["draft", "pending_approval", "completed", "cancelled"]).default("completed"),
  idempotencyKey: z.string().min(1, "Yêu cầu idempotencyKey duy nhất"),
  createdBy: z.string().default("usr-admin-01"),
  notes: z.string().optional().nullable(),
  items: z.array(returnOrderItemSchema).min(1, "Phiếu trả hàng phải có ít nhất 1 sản phẩm"),
});

export const cancelReturnOrderSchema = z.object({
  cancelledBy: z.string().min(1, "Thiếu thông tin người hủy phiếu"),
  cancelReason: z.string().min(1, "Vui lòng nhập lý do hủy phiếu"),
});

export const returnOrderQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  warehouse: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["createdAt", "refundAmount", "code"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ReturnOrderItemInput = z.infer<typeof returnOrderItemSchema>;
export type CreateReturnOrderInput = z.infer<typeof createReturnOrderSchema>;
export type CancelReturnOrderInput = z.infer<typeof cancelReturnOrderSchema>;
export type ReturnOrderQueryInput = z.infer<typeof returnOrderQuerySchema>;
