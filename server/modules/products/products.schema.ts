import { z } from "zod";

export const uomConversionSchema = z.object({
  id: z.string().optional(),
  unit: z.string().min(1, "Tên đơn vị tính quy đổi không được để trống"),
  ratioToBase: z.coerce.number().positive("Hệ số quy đổi phải lớn hơn 0"),
  costPrice: z.coerce.number().min(0, "Giá vốn không được âm").default(0),
  sellingPrice: z.coerce.number().min(0, "Giá bán không được âm").default(0),
  barcode: z.string().optional().nullable(),
});

export const createProductSchema = z.object({
  sku: z.string().min(1, "Mã SKU không được để trống"),
  barcode: z.string().optional().default(""),
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  category: z.string().min(1, "Danh mục sản phẩm không được để trống"),
  unit: z.string().min(1, "Đơn vị tính cơ bản không được để trống"),
  costPrice: z.coerce.number().min(0, "Giá vốn không được âm").default(0),
  sellingPrice: z.coerce.number().min(0, "Giá bán không được âm").default(0),
  stock: z.coerce.number().default(0),
  minStock: z.coerce.number().default(5),
  image: z.string().optional().nullable(),
  warehouse: z.string().default("Kho Chính"),
  storageLocation: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  weightOrVolume: z.string().optional().nullable(),
  uomConversions: z.array(uomConversionSchema).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  warehouse: z.string().optional(),
  lowStockOnly: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["name", "sku", "stock", "sellingPrice", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const bulkImportProductSchema = z.object({
  products: z.array(createProductSchema),
});

export type UOMConversionInput = z.infer<typeof uomConversionSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type BulkImportProductInput = z.infer<typeof bulkImportProductSchema>;
