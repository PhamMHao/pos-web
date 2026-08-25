import { z } from "zod";

export const inboundInvoiceItemSchema = z.object({
  lineNumber: z.coerce.number().int().default(1),
  productName: z.string().min(1, "Tên hàng hóa không được để trống"),
  skuOrCode: z.string().optional().nullable(),
  unit: z.string().min(1, "Thiếu ĐVT"),
  quantity: z.coerce.number().positive("Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0),
  subtotal: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).default(8),
  taxAmount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0),
  matchedProductId: z.string().optional().nullable(),
  matchedProductName: z.string().optional().nullable(),
  matchedProductSku: z.string().optional().nullable(),
  currentStock: z.coerce.number().optional().nullable(),
  currentCostPrice: z.coerce.number().optional().nullable(),
  ratioToBaseUnit: z.coerce.number().default(1),
  isNewProduct: z.boolean().default(false),
  status: z.enum(["matched", "unmatched", "needs_create", "ignored"]).default("unmatched"),
  assignedCategory: z.string().optional().nullable(),
  assignedWarehouse: z.string().optional().nullable(),
  assignedStorageLocation: z.string().optional().nullable(),
  suggestedSellingPrice: z.coerce.number().optional().nullable(),
  customSku: z.string().optional().nullable(),
  customBarcode: z.string().optional().nullable(),
});

export const createInboundInvoiceSchema = z.object({
  source: z.enum(["cqt_portal", "gmail_sync", "xml_upload"]).default("xml_upload"),
  sourceDetail: z.string().optional().nullable(),
  sourceFile: z.string().optional().nullable(),
  invoiceCode: z.string().min(1, "Mã hóa đơn không được để trống"),
  invoiceNumber: z.string().min(1, "Số hóa đơn không được để trống"),
  invoiceSymbol: z.string().min(1, "Ký hiệu hóa đơn không được để trống"),
  invoiceTemplate: z.string().default("1/001"),
  issueDate: z.string().min(1, "Ngày lập không được để trống"),
  cqtCode: z.string().optional().nullable(),
  lookupCode: z.string().optional().nullable(),
  lookupUrl: z.string().optional().nullable(),
  seller: z.record(z.string(), z.any()).optional().nullable(),
  sellerData: z.union([z.string(), z.record(z.string(), z.any())]).optional().nullable(),
  buyer: z.record(z.string(), z.any()).optional().nullable(),
  buyerData: z.union([z.string(), z.record(z.string(), z.any())]).optional().nullable(),
  subtotal: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).default(8),
  taxAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0),
  amountInWords: z.string().min(1, "Thiếu số tiền bằng chữ"),
  status: z
    .enum(["pending_review", "matched", "imported_to_stock", "rejected"])
    .default("pending_review"),
  goodsReceiptId: z.string().optional().nullable(),
  targetWarehouse: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  rawXmlContent: z.string().optional().nullable(),
  items: z.array(inboundInvoiceItemSchema).min(1, "Hóa đơn phải có ít nhất 1 mặt hàng"),
});

export const inboundInvoiceQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export type InboundInvoiceItemInput = z.infer<typeof inboundInvoiceItemSchema>;
export type CreateInboundInvoiceInput = z.infer<typeof createInboundInvoiceSchema>;
export type InboundInvoiceQueryInput = z.infer<typeof inboundInvoiceQuerySchema>;
