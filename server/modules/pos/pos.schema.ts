import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Thiếu productId"),
  productName: z.string().min(1, "Thiếu productName"),
  sku: z.string().min(1, "Thiếu SKU"),
  unit: z.string().min(1, "Thiếu đơn vị tính"),
  ratioToBase: z.coerce.number().default(1),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0).default(0),
  discountPercent: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  serialNumber: z.string().optional().nullable(),
  warrantyMonths: z.coerce.number().optional().nullable(),
});

export const createOrderSchema = z.object({
  code: z.string().optional(),
  channel: z.string().default("Tại quầy (POS)"),
  status: z.enum(["pending", "confirmed", "processing", "shipping", "completed", "cancelled", "refunded"]).default("completed"),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  customerRank: z.string().optional().nullable(),
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  discountCode: z.string().optional().nullable(),
  taxRate: z.coerce.number().min(0).default(0),
  taxAmount: z.coerce.number().min(0).default(0),
  shippingFee: z.coerce.number().min(0).default(0),
  shippingPartner: z.string().optional().nullable(),
  trackingCode: z.string().optional().nullable(),
  total: z.coerce.number().min(0),
  totalCost: z.coerce.number().min(0).default(0),
  profit: z.coerce.number().default(0),
  paymentMethod: z.enum(["cash", "transfer", "card", "momo", "debt"]).default("cash"),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]).default("paid"),
  paidAmount: z.coerce.number().min(0).default(0),
  changeAmount: z.coerce.number().min(0).default(0),
  note: z.string().optional().nullable(),
  shiftId: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipping", "completed", "cancelled", "refunded"]),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]).optional(),
  note: z.string().optional(),
});

export const orderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  shiftId: z.string().optional(),
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["createdAt", "total", "code"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const openShiftSchema = z.object({
  shiftName: z.string().default("Ca Sáng"),
  staffId: z.string().optional().nullable(),
  staffName: z.string().min(1, "Tên nhân viên thu ngân không được để trống"),
  initialCash: z.coerce.number().min(0, "Tiền đầu ca không được âm"),
  note: z.string().optional().nullable(),
});

export const closeShiftSchema = z.object({
  actualEndingCash: z.coerce.number().min(0, "Tiền thực tế kết ca không được âm"),
  note: z.string().optional().nullable(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OpenShiftInput = z.infer<typeof openShiftSchema>;
export type CloseShiftInput = z.infer<typeof closeShiftSchema>;
