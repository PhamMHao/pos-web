import { z } from "zod";

export const costingBOMItemSchema = z.object({
  materialName: z.string().min(1, "Tên vật tư/linh kiện không được để trống"),
  quantity: z.preprocess((val) => Number(val), z.number().positive("Số lượng linh kiện phải lớn hơn 0")),
  unit: z.string().min(1, "Thiếu đơn vị tính"),
  unitCost: z.preprocess((val) => Number(val), z.number().min(0, "Đơn giá không được âm")),
  totalCost: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number().min(0)).optional().default(0),
});

export const createProductCostingSchema = z.object({
  productName: z.string().min(1, "Tên sản phẩm lắp ráp không được để trống"),
  sku: z.string().min(1, "SKU không được để trống"),
  rawMaterialsCost: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number().min(0)).optional().default(0),
  laborCost: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number().min(0)).optional().default(0),
  machineryAndOverheadCost: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number().min(0)).optional().default(0),
  totalStandardCost: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number().min(0)).optional().default(0),
  currentSellingPrice: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number().min(0)).optional().default(0),
  grossMarginPercent: z.preprocess((val) => (val === undefined || val === null ? 0 : Number(val)), z.number()).optional().default(0),
  bomItems: z.array(costingBOMItemSchema).min(1, "BOM phải có ít nhất 1 linh kiện"),
});

export const updateProductCostingSchema = createProductCostingSchema.partial();

export const productCostingQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
  sortBy: z.enum(["productName", "sku", "totalStandardCost", "lastUpdated"]).default("lastUpdated"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const assembleProductSchema = z.object({
  costingId: z.string().min(1, "Thiếu costingId"),
  quantity: z.preprocess((val) => Number(val), z.number().int().positive("Số lượng lắp ráp phải lớn hơn 0")),
  technicianName: z.string().optional().default("Kỹ thuật viên Gia Phúc"),
  warehouse: z.string().optional().default("Kho Tổng Gia Phúc"),
  note: z.string().optional().nullable(),
});

export type CostingBOMItemInput = z.infer<typeof costingBOMItemSchema>;
export type CreateProductCostingInput = z.infer<typeof createProductCostingSchema>;
export type UpdateProductCostingInput = z.infer<typeof updateProductCostingSchema>;
export type ProductCostingQueryInput = z.infer<typeof productCostingQuerySchema>;
export type AssembleProductInput = z.infer<typeof assembleProductSchema>;
