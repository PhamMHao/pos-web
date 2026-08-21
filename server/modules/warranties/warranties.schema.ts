import { z } from "zod";

export const warrantyPartItemSchema = z.object({
  partName: z.string().min(1, "Tên linh kiện không được để trống"),
  sku: z.string().optional().nullable(),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unit: z.string().min(1, "Thiếu ĐVT"),
  unitPrice: z.coerce.number().min(0).default(0),
  isUnderWarranty: z.boolean().default(true),
  warrantyMonths: z.coerce.number().int().min(0).default(0),
});

export const warrantyTimelineEventSchema = z.object({
  action: z.string().min(1, "Hành động không được để trống"),
  actor: z.string().min(1, "Người thực hiện không được để trống"),
  notes: z.string().optional().nullable(),
  status: z.string().min(1, "Trạng thái không được để trống"),
  timestamp: z.string().optional(),
});

export const createWarrantyTicketSchema = z.object({
  code: z.string().optional(),
  type: z.enum(["warranty", "maintenance", "repair"]).default("warranty"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  status: z
    .enum([
      "received",
      "diagnosing",
      "repairing",
      "waiting_parts",
      "sent_vendor",
      "ready_to_return",
      "returned",
      "replaced_new",
      "unrepairable",
    ])
    .default("received"),
  orderCode: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  productName: z.string().min(1, "Tên thiết bị không được để trống"),
  model: z.string().optional().nullable(),
  serialNumber: z.string().min(1, "Số Serial/IMEI không được để trống"),
  qrCodeUrl: z.string().optional().nullable(),
  customerName: z.string().min(1, "Tên khách hàng không được để trống"),
  customerPhone: z.string().min(1, "SĐT khách hàng không được để trống"),
  customerAddress: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  accessoriesIncluded: z.string().optional().nullable(),
  cosmeticCondition: z.string().optional().nullable(),
  issueDescription: z.string().min(1, "Mô tả lỗi không được để trống"),
  technicianDiagnosis: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
  technicianName: z.string().min(1, "Kỹ thuật viên tiếp nhận không được để trống"),
  receivedDate: z.string().optional(),
  expectedReturnDate: z.string().min(1, "Ngày hẹn trả không được để trống"),
  actualReturnDate: z.string().optional().nullable(),
  laborCost: z.coerce.number().min(0).default(0),
  partsCost: z.coerce.number().min(0).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  totalFee: z.coerce.number().min(0).default(0),
  paymentStatus: z.enum(["free", "paid", "unpaid", "partial"]).default("free"),
  paidAmount: z.coerce.number().min(0).default(0),
  returnedToPerson: z.string().optional().nullable(),
  returnNote: z.string().optional().nullable(),
  warrantyExtensionMonths: z.coerce.number().int().min(0).default(0),
  parts: z.array(warrantyPartItemSchema).optional().default([]),
  timeline: z.array(warrantyTimelineEventSchema).optional().default([]),
});

export const updateWarrantyTicketSchema = createWarrantyTicketSchema.partial();

export const warrantyTicketQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["receivedDate", "expectedReturnDate", "priority", "code"]).default("receivedDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createSerialDeviceRecordSchema = z.object({
  serialNumber: z.string().min(1, "Số Serial/IMEI không được để trống"),
  productName: z.string().min(1, "Tên sản phẩm không được để trống"),
  sku: z.string().min(1, "SKU không được để trống"),
  soldOrderCode: z.string().optional().nullable(),
  soldDate: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  warrantyPeriodMonths: z.coerce.number().int().min(0).default(12),
  warrantyExpiryDate: z.string().min(1, "Ngày hết hạn bảo hành không được để trống"),
  warrantyStatus: z.enum(["valid", "expired", "voided"]).default("valid"),
  totalRepairsCount: z.coerce.number().int().min(0).default(0),
  totalMaintenancesCount: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const updateSerialDeviceRecordSchema = createSerialDeviceRecordSchema.partial();

export const serialDeviceQuerySchema = z.object({
  search: z.string().optional(),
  warrantyStatus: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export type CreateWarrantyTicketInput = z.infer<typeof createWarrantyTicketSchema>;
export type UpdateWarrantyTicketInput = z.infer<typeof updateWarrantyTicketSchema>;
export type WarrantyTicketQueryInput = z.infer<typeof warrantyTicketQuerySchema>;
export type CreateSerialDeviceRecordInput = z.infer<typeof createSerialDeviceRecordSchema>;
export type UpdateSerialDeviceRecordInput = z.infer<typeof updateSerialDeviceRecordSchema>;
export type SerialDeviceQueryInput = z.infer<typeof serialDeviceQuerySchema>;
