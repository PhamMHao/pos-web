import { z } from "zod";

export const createEnterpriseAssetSchema = z.object({
  code: z.string().min(1, "Mã tài sản không được để trống"),
  name: z.string().min(1, "Tên tài sản không được để trống"),
  category: z.string().min(1, "Loại tài sản không được để trống"),
  purchaseDate: z.string().min(1, "Ngày mua không được để trống"),
  originalValue: z.coerce.number().positive("Nguyên giá phải lớn hơn 0"),
  depreciationMonths: z.coerce.number().int().positive("Thời gian khấu hao phải lớn hơn 0"),
  remainingValue: z.coerce.number().min(0),
  assignedTo: z.string().min(1, "Người sử dụng/quản lý không được để trống"),
  status: z
    .enum(["good", "maintenance_required", "broken", "liquidated"])
    .default("good"),
  lastMaintenanceDate: z.string().optional().nullable(),
});

export const updateEnterpriseAssetSchema = createEnterpriseAssetSchema.partial();

export const enterpriseAssetQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
});

export type CreateEnterpriseAssetInput = z.infer<typeof createEnterpriseAssetSchema>;
export type UpdateEnterpriseAssetInput = z.infer<typeof updateEnterpriseAssetSchema>;
export type EnterpriseAssetQueryInput = z.infer<typeof enterpriseAssetQuerySchema>;
