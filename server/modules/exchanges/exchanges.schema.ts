import { z } from "zod";

export const exchangeInItemSchema = z.object({
  id: z.string().optional(),
  originalOrderItemId: z.string().optional().nullable(),
  productId: z.string().min(1, "Thiếu Product ID hàng nhận lại"),
  productName: z.string().min(1, "Thiếu tên sản phẩm nhận lại"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().default("Cái"),
  ratioToBase: z.coerce.number().default(1),
  quantity: z.coerce.number().positive("Số lượng nhận lại phải lớn hơn 0"),
  costPrice: z.coerce.number().min(0).default(0),
  returnUnitPrice: z.coerce.number().min(0, "Đơn giá nhận lại không hợp lệ"),
  taxRate: z.coerce.number().min(0).default(0),
  taxAmount: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  condition: z.enum(["normal", "damaged", "unopened"]).default("normal"),
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

export const exchangeOutItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Thiếu Product ID hàng xuất mới"),
  productName: z.string().min(1, "Thiếu tên sản phẩm xuất mới"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().default("Cái"),
  ratioToBase: z.coerce.number().default(1),
  quantity: z.coerce.number().positive("Số lượng xuất đổi phải lớn hơn 0"),
  costPrice: z.coerce.number().min(0).default(0),
  exchangeUnitPrice: z.coerce.number().min(0, "Đơn giá xuất bán mới không hợp lệ"),
  taxRate: z.coerce.number().min(0).default(0),
  taxAmount: z.coerce.number().min(0).default(0),
  subtotal: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  warehouseId: z.string().optional().nullable(),
  warehouseName: z.string().default("Kho Chính Gia Phúc Computer"),
  warrantyMonths: z.coerce.number().int().min(0).default(12),
  specifications: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  serials: z.array(z.string()).optional().default([]),
});

export const createProductExchangeSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  originalOrderId: z.string().optional().nullable(),
  originalOrderCode: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, "Tên khách hàng không được để trống"),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  warehouseName: z.string().default("Kho Chính Gia Phúc Computer"),
  restockingFee: z.coerce.number().min(0).default(0),
  giftDeductionAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(["cash", "transfer", "debt_adjust"]).default("cash"),
  status: z.enum(["draft", "pending_approval", "completed", "cancelled"]).default("completed"),
  idempotencyKey: z.string().min(1, "Yêu cầu idempotencyKey duy nhất"),
  createdBy: z.string().default("usr-admin-01"),
  reason: z.string().default("upgrade_model"),
  notes: z.string().optional().nullable(),
  inItems: z.array(exchangeInItemSchema).min(1, "Phải có ít nhất 1 sản phẩm nhận lại"),
  outItems: z.array(exchangeOutItemSchema).min(1, "Phải có ít nhất 1 sản phẩm xuất mới"),
});

export const cancelExchangeSchema = z.object({
  cancelledBy: z.string().min(1, "Thiếu thông tin người hủy phiếu"),
  cancelReason: z.string().min(1, "Vui lòng nhập lý do hủy phiếu"),
});

export const exchangeQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  paymentAction: z.string().optional(),
  warehouseName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["createdAt", "differenceAmount", "code"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updatePolicySchema = z.object({
  returnPeriodDays: z.coerce.number().int().min(1),
  exchangePeriodDays: z.coerce.number().int().min(1),
  approvalThresholdAmount: z.coerce.number().min(0),
  restockingFeeDamagedBox: z.coerce.number().min(0).max(100),
  restockingFeeUsed: z.coerce.number().min(0).max(100),
  allowNoReceiptReturn: z.boolean().default(false),
});

export type ExchangeInItemInput = z.infer<typeof exchangeInItemSchema>;
export type ExchangeOutItemInput = z.infer<typeof exchangeOutItemSchema>;
export type CreateProductExchangeInput = z.infer<typeof createProductExchangeSchema>;
export type CancelExchangeInput = z.infer<typeof cancelExchangeSchema>;
export type ExchangeQueryInput = z.infer<typeof exchangeQuerySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
