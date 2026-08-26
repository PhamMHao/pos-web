import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateAccountingRecordInput,
  UpdateAccountingRecordInput,
  AccountingRecordQueryInput,
} from "./finance.schema";
import { Prisma } from "@prisma/client";

export class FinanceService {
  static async createRecord(input: CreateAccountingRecordInput) {
    const prefix = input.type === "income" ? "PT" : "PC";
    const code = input.code || `${prefix}-${Date.now().toString().slice(-6)}`;
    const id = (input as any).id || `finance-${Date.now()}`;
    const dt = input.date ? new Date(input.date) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
      VALUES (${id}, ${code}, ${input.type}, ${input.category}, ${input.amount}, ${dt}, ${input.party}, ${input.paymentMethod || "cash"}, ${input.status || "completed"}, ${input.note || null}, ${input.receiptNumber || null})
    `;

    return this.getRecordById(id);
  }

  static async getRecords(query: AccountingRecordQueryInput) {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "date",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.AccountingRecordWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { party: { contains: term } },
        { note: { contains: term } },
        { receiptNumber: { contains: term } },
      ];
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const allItems = await prisma.accountingRecord.findMany({ where });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "amount") {
        return sortOrder === "asc"
          ? Number(a.amount) - Number(b.amount)
          : Number(b.amount) - Number(a.amount);
      }
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((r) => ({
      ...r,
      amount: Number(r.amount),
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

  static async getSummary() {
    const records = await prisma.accountingRecord.findMany();
    let totalIncome = 0;
    let totalExpense = 0;

    for (const r of records) {
      const amt = Number(r.amount);
      if (r.type === "income") {
        totalIncome += amt;
      } else {
        totalExpense += amt;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalRecords: records.length,
    };
  }

  static async getRecordById(id: string) {
    const items = await prisma.accountingRecord.findMany({
      where: { id },
    });

    const record = items[0];
    if (!record) {
      throw new NotFoundError(`Không tìm thấy chứng từ thu chi ID: ${id}`);
    }

    return {
      ...record,
      amount: Number(record.amount),
    };
  }

  static async updateRecord(id: string, input: UpdateAccountingRecordInput) {
    await this.getRecordById(id);

    const updateData: any = { ...input };
    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.date) {
      updateData.date = new Date(input.date);
    }

    await prisma.accountingRecord.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getRecordById(id);
  }

  static async deleteRecord(id: string) {
    await this.getRecordById(id);
    await prisma.accountingRecord.deleteMany({
      where: { id },
    });
    return { message: "Xóa chứng từ thu chi thành công" };
  }
}
