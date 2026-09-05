import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreatePriceQuoteInput,
  UpdatePriceQuoteInput,
  PriceQuoteQueryInput,
} from "./quotes.schema";
import { Prisma } from "@prisma/client";

export class QuotesService {
  static async createQuote(input: CreatePriceQuoteInput) {
    const code =
      input.code ||
      `BG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const { items, ...quoteData } = input;
    const id = `quote-${Date.now()}`;
    const vDate = new Date(quoteData.validUntil);
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [BaoGia] (id, code, customerName, customerPhone, customerCompany, totalAmount, discountPercent, finalTotal, validUntil, status, notes, createdAt)
      VALUES (${id}, ${code}, ${quoteData.customerName}, ${quoteData.customerPhone}, ${quoteData.customerCompany || null}, ${quoteData.totalAmount}, ${quoteData.discountPercent}, ${quoteData.finalTotal}, ${vDate}, ${quoteData.status || "draft"}, ${quoteData.notes || null}, ${dt})
    `;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemId = `quote-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietBaoGia] (id, quoteId, productName, sku, unit, quantity, unitPrice, total)
        VALUES (${itemId}, ${id}, ${item.productName}, ${item.sku}, ${item.unit}, ${item.quantity}, ${item.unitPrice}, ${item.total})
      `;
    }

    return this.getQuoteById(id);
  }

  static async getQuotes(query: PriceQuoteQueryInput) {
    const {
      search,
      status,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.PriceQuoteWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { customerName: { contains: term } },
        { customerPhone: { contains: term } },
        { customerCompany: { contains: term } },
      ];
    }

    if (status && status !== "all" && status !== "Tất cả") {
      where.status = status;
    }

    const allItems = await prisma.priceQuote.findMany({
      where,
      include: {
        items: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "finalTotal") {
        return sortOrder === "asc"
          ? Number(a.finalTotal) - Number(b.finalTotal)
          : Number(b.finalTotal) - Number(a.finalTotal);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((q) => ({
      ...q,
      totalAmount: Number(q.totalAmount),
      discountPercent: Number(q.discountPercent),
      finalTotal: Number(q.finalTotal),
      digitalSignature: (() => {
        if (!q.digitalSignature) return null;
        try { return JSON.parse(q.digitalSignature); } catch { return q.digitalSignature; }
      })(),
      items: (q.items || []).map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
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

  static async getQuoteById(id: string) {
    const items = await prisma.priceQuote.findMany({
      where: { id },
      include: {
        items: true,
      },
    });

    const quote = items[0];
    if (!quote) {
      throw new NotFoundError(`Không tìm thấy báo giá với ID: ${id}`);
    }

    return {
      ...quote,
      totalAmount: Number(quote.totalAmount),
      discountPercent: Number(quote.discountPercent),
      finalTotal: Number(quote.finalTotal),
      digitalSignature: (() => {
        if (!quote.digitalSignature) return null;
        try { return JSON.parse(quote.digitalSignature); } catch { return quote.digitalSignature; }
      })(),
      items: (quote.items || []).map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    };
  }

  static async signQuote(id: string, signature: any) {
    await this.getQuoteById(id);
    const signatureStr = typeof signature === "string" ? signature : JSON.stringify(signature);

    await prisma.priceQuote.updateMany({
      where: { id },
      data: {
        digitalSignature: signatureStr,
        status: "approved",
      },
    });

    return this.getQuoteById(id);
  }

  static async updateQuote(id: string, input: UpdatePriceQuoteInput) {
    await this.getQuoteById(id);
    const { items, ...quoteData } = input;

    const updateData: any = {};
    if (quoteData.customerName) updateData.customerName = quoteData.customerName;
    if (quoteData.customerPhone) updateData.customerPhone = quoteData.customerPhone;
    if (quoteData.customerCompany !== undefined) updateData.customerCompany = quoteData.customerCompany;
    if (quoteData.totalAmount !== undefined) updateData.totalAmount = new Prisma.Decimal(quoteData.totalAmount);
    if (quoteData.discountPercent !== undefined) updateData.discountPercent = new Prisma.Decimal(quoteData.discountPercent);
    if (quoteData.finalTotal !== undefined) updateData.finalTotal = new Prisma.Decimal(quoteData.finalTotal);
    if (quoteData.validUntil) updateData.validUntil = new Date(quoteData.validUntil);
    if (quoteData.status) updateData.status = quoteData.status;
    if (quoteData.notes !== undefined) updateData.notes = quoteData.notes;

    await prisma.priceQuote.updateMany({
      where: { id },
      data: updateData,
    });

    if (items && items.length > 0) {
      await prisma.priceQuoteItem.deleteMany({
        where: { quoteId: id },
      });

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const itemId = `quote-item-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [ChiTietBaoGia] (id, quoteId, productName, sku, unit, quantity, unitPrice, total)
          VALUES (${itemId}, ${id}, ${item.productName}, ${item.sku}, ${item.unit}, ${item.quantity}, ${item.unitPrice}, ${item.total})
        `;
      }
    }

    return this.getQuoteById(id);
  }

  static async deleteQuote(id: string) {
    await this.getQuoteById(id);
    await prisma.priceQuoteItem.deleteMany({
      where: { quoteId: id },
    });
    await prisma.priceQuote.deleteMany({
      where: { id },
    });
    return { message: "Xóa báo giá thành công" };
  }
}
