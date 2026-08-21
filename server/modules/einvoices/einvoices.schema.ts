import { z } from "zod";

export const eInvoiceItemSchema = z.object({
  sku: z.string().min(1, "Thiếu SKU"),
  productName: z.string().min(1, "Tên hàng hóa không được để trống"),
  unit: z.string().min(1, "Thiếu ĐVT"),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0),
  subtotal: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).default(0),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).default(8),
  taxAmount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
});

export const createEInvoiceSchema = z.object({
  invoiceCode: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceSymbol: z.string().default("1C26TGP"),
  invoiceTemplate: z.string().default("1/001"),
  invoiceType: z.enum(["vat", "sales"]).default("vat"),
  cqtCode: z.string().optional().nullable(),
  lookupCode: z.string().optional(),
  lookupUrl: z.string().default("https://hoadondientu.gdt.gov.vn"),
  issueDate: z.string().optional(),
  status: z
    .enum(["draft", "signed", "sent_cqt", "cqt_approved", "cancelled", "adjusted"])
    .default("signed"),
  orderId: z.string().optional().nullable(),
  orderCode: z.string().optional().nullable(),
  sellerData: z.union([z.string(), z.record(z.string(), z.any())]),
  buyerData: z.union([z.string(), z.record(z.string(), z.any())]),
  subtotal: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).default(8),
  taxAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  amountInWords: z.string().min(1, "Thiếu số tiền bằng chữ"),
  paymentMethod: z.string().default("TM/CK"),
  notes: z.string().optional().nullable(),
  items: z.array(eInvoiceItemSchema).min(1, "Hóa đơn phải có ít nhất 1 mặt hàng"),
});

export const eInvoiceQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  invoiceType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["issueDate", "totalAmount", "invoiceNumber"]).default("issueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type EInvoiceItemInput = z.infer<typeof eInvoiceItemSchema>;
export type CreateEInvoiceInput = z.infer<typeof createEInvoiceSchema>;
export type EInvoiceQueryInput = z.infer<typeof eInvoiceQuerySchema>;
