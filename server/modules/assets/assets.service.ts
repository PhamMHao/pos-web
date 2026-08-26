import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";
import {
  CreateEnterpriseAssetInput,
  UpdateEnterpriseAssetInput,
  EnterpriseAssetQueryInput,
} from "./assets.schema";
import { Prisma } from "@prisma/client";

export class AssetsService {
  static async getAssets(query: EnterpriseAssetQueryInput) {
    const { search, category, status, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.EnterpriseAssetWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { name: { contains: term } },
        { assignedTo: { contains: term } },
      ];
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const allItems = await prisma.enterpriseAsset.findMany({ where });

    // In-memory sort by purchaseDate desc
    allItems.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((a) => ({
      ...a,
      originalValue: Number(a.originalValue),
      remainingValue: Number(a.remainingValue),
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getAssetById(id: string) {
    const items = await prisma.enterpriseAsset.findMany({
      where: { id },
    });

    const asset = items[0];
    if (!asset) {
      throw new NotFoundError(`Không tìm thấy tài sản ID: ${id}`);
    }

    return {
      ...asset,
      originalValue: Number(asset.originalValue),
      remainingValue: Number(asset.remainingValue),
    };
  }

  static async createAsset(input: CreateEnterpriseAssetInput) {
    const existing = await prisma.enterpriseAsset.findMany({
      where: { code: input.code },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Mã tài sản "${input.code}" đã tồn tại`);
    }

    const id = (input as any).id || `asset-${Date.now()}`;
    const pDate = new Date(input.purchaseDate);
    const mDate = input.lastMaintenanceDate ? new Date(input.lastMaintenanceDate) : null;
    const status = input.status || "good";
    const depMonths = Number(input.depreciationMonths) || 12;
    const origVal = Number(input.originalValue) || 0;
    const remVal = Number(input.remainingValue) || 0;

    if (mDate) {
      await prisma.$executeRaw`
        INSERT INTO [TaiSanDoanhNghiep] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status, lastMaintenanceDate)
        VALUES (${id}, ${input.code}, ${input.name}, ${input.category}, ${pDate}, ${origVal}, ${depMonths}, ${remVal}, ${input.assignedTo}, ${status}, ${mDate})
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO [TaiSanDoanhNghiep] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status)
        VALUES (${id}, ${input.code}, ${input.name}, ${input.category}, ${pDate}, ${origVal}, ${depMonths}, ${remVal}, ${input.assignedTo}, ${status})
      `;
    }

    return this.getAssetById(id);
  }

  static async updateAsset(id: string, input: UpdateEnterpriseAssetInput) {
    await this.getAssetById(id);

    const updateData: any = { ...input };
    if (input.originalValue !== undefined) updateData.originalValue = new Prisma.Decimal(input.originalValue);
    if (input.remainingValue !== undefined) updateData.remainingValue = new Prisma.Decimal(input.remainingValue);
    if (input.purchaseDate) updateData.purchaseDate = new Date(input.purchaseDate);
    if (input.lastMaintenanceDate) updateData.lastMaintenanceDate = new Date(input.lastMaintenanceDate);

    await prisma.enterpriseAsset.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getAssetById(id);
  }

  static async deleteAsset(id: string) {
    await this.getAssetById(id);
    await prisma.enterpriseAsset.deleteMany({
      where: { id },
    });
    return { message: "Xóa tài sản thành công" };
  }
}
