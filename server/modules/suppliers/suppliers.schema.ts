import { z } from "zod";

export const supplierPriceItemSchema = z.object({
  sku: z.string().min(1, "Mã SKU không được để trống"),
  productName: z.string().min(1, "Tên sản phẩm không được để trống"),
  costPrice: z.coerce.number().min(0, "Giá vốn không được âm"),
  warrantyMonths: z.coerce.number().int().min(0).default(24),
  moq: z.coerce.number().int().min(1).default(1),
});

export const createSupplierSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Mã nhà cung cấp không được để trống"),
  name: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  taxCode: z.string().optional().nullable(),
  tier: z.string().optional().default("Tổng Đại Lý"),
  category: z.string().optional().default("Camera & An Ninh"),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  bankCode: z.string().optional().nullable(),
  creditLimit: z.coerce.number().min(0).default(0),
  creditDays: z.coerce.number().int().min(0).default(30),
  currentDebt: z.coerce.number().min(0).default(0),
  ratingQuality: z.coerce.number().min(0).max(10).default(9.5),
  ratingPrice: z.coerce.number().min(0).max(10).default(9.0),
  ratingOnTime: z.coerce.number().min(0).max(10).default(9.5),
  ratingWarranty: z.coerce.number().min(0).max(10).default(9.2),
  notes: z.string().optional().nullable(),
  priceList: z.array(supplierPriceItemSchema).default([]),
}).passthrough();

export const updateSupplierSchema = createSupplierSchema.partial().passthrough();

export const supplierQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  tier: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const purchaseOrderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  sku: z.string().min(1, "Mã SKU không được để trống"),
  productName: z.string().min(1, "Tên sản phẩm không được để trống"),
  unit: z.string().default("Cái"),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0, "Đơn giá không được âm"),
  total: z.coerce.number().min(0),
});

export const createPurchaseOrderSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(),
  supplierId: z.string().min(1, "Mã nhà cung cấp không được để trống"),
  supplierName: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  supplierPhone: z.string().optional().nullable(),
  supplierAddress: z.string().optional().nullable(),
  supplierTaxCode: z.string().optional().nullable(),
  warehouseId: z.string().default("wh-main"),
  warehouseName: z.string().default("Kho Chính"),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().min(1, "Ngày hẹn giao hàng không được để trống"),
  status: z
    .enum(["draft", "sent", "confirmed", "partially_received", "completed", "cancelled"])
    .default("confirmed"),
  items: z.array(purchaseOrderItemSchema).min(1, "Đơn đặt hàng phải có ít nhất 1 sản phẩm"),
  subtotal: z.coerce.number().min(0),
  vatRate: z.coerce.number().default(10),
  vatAmount: z.coerce.number().default(0),
  shippingFee: z.coerce.number().default(0),
  discountAmount: z.coerce.number().default(0),
  totalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().default(0),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).default("unpaid"),
  paymentMethod: z.enum(["transfer", "cash", "debt_30d"]).default("transfer"),
  notes: z.string().optional().nullable(),
});

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(["draft", "sent", "confirmed", "partially_received", "completed", "cancelled"]),
  paidAmount: z.coerce.number().optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).optional(),
  notes: z.string().optional(),
});

export const purchaseOrderQuerySchema = z.object({
  search: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierQueryInput = z.infer<typeof supplierQuerySchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderStatusInput = z.infer<typeof updatePurchaseOrderStatusSchema>;
export type PurchaseOrderQueryInput = z.infer<typeof purchaseOrderQuerySchema>;
