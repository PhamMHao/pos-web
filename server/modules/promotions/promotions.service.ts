import prisma from "../../config/db";
import { NotFoundError, ConflictError, BadRequestError } from "../../core/errors/AppError";
import {
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionQueryInput,
  ValidatePromoCodeInput,
} from "./promotions.schema";
import { Prisma } from "@prisma/client";

export class PromotionsService {
  static async getPromotions(query: PromotionQueryInput) {
    const { search, isActive, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.PromotionWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { title: { contains: term } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const allItems = await prisma.promotion.findMany({ where });

    // In-memory sort by startDate desc (100% compatible with SQL Server 2008)
    allItems.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((p) => ({
      ...p,
      discountValue: Number(p.discountValue),
      minOrderValue: Number(p.minOrderValue),
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : null,
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

  static async getPromotionById(id: string) {
    const items = await prisma.promotion.findMany({
      where: { id },
    });

    const promo = items[0];
    if (!promo) {
      throw new NotFoundError(`Không tìm thấy mã khuyến mãi với ID: ${id}`);
    }

    return {
      ...promo,
      discountValue: Number(promo.discountValue),
      minOrderValue: Number(promo.minOrderValue),
      maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
    };
  }

  static async getPromotionByCode(code: string) {
    const cleanCode = code.trim().toUpperCase();
    const items = await prisma.promotion.findMany({
      where: { code: cleanCode },
    });

    const promo = items[0];
    if (!promo) {
      throw new NotFoundError(`Mã khuyến mãi "${cleanCode}" không tồn tại`);
    }

    return {
      ...promo,
      discountValue: Number(promo.discountValue),
      minOrderValue: Number(promo.minOrderValue),
      maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
    };
  }

  static async createPromotion(input: CreatePromotionInput) {
    const cleanCode = input.code.trim().toUpperCase();
    const existing = await prisma.promotion.findMany({
      where: { code: cleanCode },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Mã khuyến mãi "${cleanCode}" đã tồn tại`);
    }

    const id = (input as any).id || `promo-${Date.now()}`;
    const maxDisc = input.maxDiscount ? Number(input.maxDiscount) : null;
    const startDt = new Date(input.startDate);
    const endDt = new Date(input.endDate);
    const active = input.isActive !== undefined ? input.isActive : true;

    await prisma.$executeRaw`
      INSERT INTO [ChuongTrinhKhuyenMai] (id, code, title, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, usedCount, startDate, endDate, isActive)
      VALUES (${id}, ${cleanCode}, ${input.title}, ${input.discountType}, ${input.discountValue}, ${input.minOrderValue || 0}, ${maxDisc}, ${input.usageLimit || 100}, ${input.usedCount || 0}, ${startDt}, ${endDt}, ${active})
    `;

    return this.getPromotionById(id);
  }

  static async updatePromotion(id: string, input: UpdatePromotionInput) {
    await this.getPromotionById(id);

    const updateData: any = { ...input };
    if (input.code) updateData.code = input.code.trim().toUpperCase();
    if (input.discountValue !== undefined) updateData.discountValue = new Prisma.Decimal(input.discountValue);
    if (input.minOrderValue !== undefined) updateData.minOrderValue = new Prisma.Decimal(input.minOrderValue);
    if (input.maxDiscount !== undefined) {
      updateData.maxDiscount = input.maxDiscount ? new Prisma.Decimal(input.maxDiscount) : null;
    }
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);

    await prisma.promotion.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getPromotionById(id);
  }

  static async deletePromotion(id: string) {
    await this.getPromotionById(id);
    await prisma.promotion.deleteMany({
      where: { id },
    });
    return { message: "Xóa mã khuyến mãi thành công" };
  }

  static async validatePromoCode(input: ValidatePromoCodeInput) {
    const promo = await this.getPromotionByCode(input.code);

    if (!promo.isActive) {
      throw new BadRequestError(`Mã khuyến mãi "${promo.code}" hiện đang bị tạm khóa`);
    }

    const now = new Date();
    if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
      throw new BadRequestError(`Mã khuyến mãi "${promo.code}" đã hết hạn hoặc chưa đến đợt áp dụng`);
    }

    if (promo.usedCount >= promo.usageLimit) {
      throw new BadRequestError(`Mã khuyến mãi "${promo.code}" đã đạt giới hạn lượt sử dụng`);
    }

    if (input.orderTotal < promo.minOrderValue) {
      throw new BadRequestError(
        `Đơn hàng tối thiểu phải đạt ${new Intl.NumberFormat("vi-VN").format(promo.minOrderValue)} đ để áp dụng mã này`
      );
    }

    let discountAmount = 0;
    if (promo.discountType === "percentage") {
      discountAmount = (input.orderTotal * promo.discountValue) / 100;
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = promo.discountValue;
    }

    return {
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: Math.min(discountAmount, input.orderTotal),
      message: `Áp dụng thành công giảm ${new Intl.NumberFormat("vi-VN").format(discountAmount)} đ`,
    };
  }
}
