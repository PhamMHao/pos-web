import { z } from "zod";

export const contractItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional().nullable(),
  sku: z.string().min(1, "Mã SKU không được để trống"),
  productName: z.string().min(1, "Tên hàng hóa/dịch vụ không được để trống"),
  unit: z.string().default("Cái"),
  quantity: z.number().min(0.01, "Số lượng phải lớn hơn 0"),
  unitPrice: z.number().min(0, "Đơn giá không âm"),
  discountPercent: z.number().min(0).max(100).default(0),
  total: z.number().min(0),
  notes: z.string().optional().nullable(),
});

export const contractMilestoneSchema = z.object({
  id: z.string().optional(),
  milestoneOrder: z.number().int().min(1).default(1),
  milestoneName: z.string().min(1, "Tên đợt thanh toán không được để trống"),
  percentage: z.number().min(0).max(100),
  plannedAmount: z.number().min(0),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  paidAmount: z.number().min(0).default(0),
  paidDate: z.string().optional().nullable(),
  invoiceCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createCustomerContractSchema = z.object({
  contractNumber: z.string().optional(),
  title: z.string().min(1, "Tiêu đề hợp đồng không được để trống"),
  contractType: z
    .enum(["commercial_goods", "turnkey_project", "maintenance_service"])
    .default("commercial_goods"),
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, "Tên khách hàng không được để trống"),
  customerTaxCode: z.string().optional().nullable(),
  customerRepresentative: z.string().optional().nullable(),
  customerPosition: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  customerBankName: z.string().optional().nullable(),
  customerBankAccount: z.string().optional().nullable(),
  companyRepresentative: z.string().default("Phạm Ngọc Thơm"),
  companyPosition: z.string().default("Tổng Giám Đốc"),
  quoteId: z.string().optional().nullable(),
  quoteCode: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  projectCode: z.string().optional().nullable(),
  totalAmount: z.number().min(0),
  discountPercent: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(100).default(10),
  taxAmount: z.number().min(0).default(0),
  finalTotal: z.number().min(0),
  depositAmount: z.number().min(0).default(0),
  signedDate: z.string().optional().nullable(),
  effectiveDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  warrantyMonths: z.number().int().min(0).default(12),
  termsAndConditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(contractItemSchema).min(1, "Hợp đồng phải có ít nhất 1 hạng mục"),
  milestones: z.array(contractMilestoneSchema).optional().default([]),
});

export const createFromQuoteSchema = z.object({
  quoteId: z.string().min(1, "Cần mã ID Báo giá gốc"),
  contractNumber: z.string().optional(),
  contractType: z
    .enum(["commercial_goods", "turnkey_project", "maintenance_service"])
    .default("commercial_goods"),
  warrantyMonths: z.number().int().min(0).default(12),
  termsAndConditions: z.string().optional().nullable(),
  milestones: z.array(contractMilestoneSchema).optional().default([]),
});

export const updateCustomerContractSchema = createCustomerContractSchema.partial();

export const signCustomerContractSchema = z.object({
  signedBy: z.string().min(1, "Tên người ký"),
  signerRole: z.string().optional(),
  signSide: z.enum(["partyA", "partyB", "both"]).default("partyB"),
  method: z.string().default("remote_signing"), // 'remote_signing' | 'usb_token' | 'pin' | 'drawing'
  provider: z.string().optional(), // 'viettel_smartca' | 'vnpt_smartca' | 'fpt_esign' | 'misa_esign'
  signatureDetails: z.record(z.string(), z.any()).optional(),
  signatureImage: z.string().optional(),
});

export const createHandoverNoteSchema = z.object({
  handoverCode: z.string().optional(),
  handoverDate: z.string().optional(),
  handoverLocation: z.string().optional().nullable(),
  delivererName: z.string().min(1, "Người giao hàng"),
  receiverName: z.string().min(1, "Người nhận bàn giao"),
  content: z.string().min(1, "Nội dung bàn giao"),
  notes: z.string().optional().nullable(),
});

export const createLiquidationSchema = z.object({
  liquidationCode: z.string().optional(),
  liquidationDate: z.string().optional(),
  actualAmount: z.number().min(0),
  penaltyOrAdjustment: z.number().default(0),
  warrantyCommitment: z.string().min(1, "Cam kết bảo hành"),
  conclusion: z.string().min(1, "Kết luận thanh lý"),
  signatureA: z.string().optional().nullable(),
  signatureB: z.string().optional().nullable(),
  autoTriggerEInvoice: z.boolean().default(true),
});

export const contractQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  contractType: z.string().optional(),
  customerId: z.string().optional(),
  projectId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ContractMilestoneInput = z.infer<typeof contractMilestoneSchema>;
export type CreateCustomerContractInput = z.infer<typeof createCustomerContractSchema>;
export type CreateFromQuoteInput = z.infer<typeof createFromQuoteSchema>;
export type UpdateCustomerContractInput = z.infer<typeof updateCustomerContractSchema>;
export type SignCustomerContractInput = z.infer<typeof signCustomerContractSchema>;
export type CreateHandoverNoteInput = z.infer<typeof createHandoverNoteSchema>;
export type CreateLiquidationInput = z.infer<typeof createLiquidationSchema>;
export type ContractQueryInput = z.infer<typeof contractQuerySchema>;
