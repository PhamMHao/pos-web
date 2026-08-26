import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQueryInput,
  AdjustPointsInput,
  AdjustDebtInput,
} from "./customers.schema";
import { Prisma } from "@prisma/client";

export class CustomersService {
  static async getCustomers(query: CustomerQueryInput) {
    const {
      search,
      tier,
      hasDebt,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.CustomerWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { phone: { contains: term } },
        { email: { contains: term } },
        { address: { contains: term } },
      ];
    }

    if (tier && tier !== "all" && tier !== "Tất cả") {
      where.tier = tier;
    }

    if (hasDebt === "true") {
      where.debt = { gt: 0 };
    }

    const allItems = await prisma.customer.findMany({ where });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "totalSpent") {
        return sortOrder === "asc"
          ? Number(a.totalSpent) - Number(b.totalSpent)
          : Number(b.totalSpent) - Number(a.totalSpent);
      }
      if (sortBy === "points") {
        return sortOrder === "asc"
          ? Number(a.points) - Number(b.points)
          : Number(b.points) - Number(a.points);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formattedItems = items.map((c) => ({
      ...c,
      points: Number(c.points),
      totalSpent: Number(c.totalSpent),
      debt: Number(c.debt),
    }));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getCustomerById(id: string) {
    const items = await prisma.customer.findMany({
      where: { id },
    });

    const customer = items[0];
    if (!customer) {
      throw new NotFoundError(`Không tìm thấy khách hàng với ID: ${id}`);
    }

    return {
      ...customer,
      points: Number(customer.points),
      totalSpent: Number(customer.totalSpent),
      debt: Number(customer.debt),
    };
  }

  static async getCustomerByPhone(phone: string) {
    const cleanPhone = phone.trim();
    const items = await prisma.customer.findMany({
      where: { phone: cleanPhone },
    });

    const customer = items[0];
    if (!customer) {
      throw new NotFoundError(`Không tìm thấy khách hàng với số điện thoại: "${cleanPhone}"`);
    }

    return {
      ...customer,
      points: Number(customer.points),
      totalSpent: Number(customer.totalSpent),
      debt: Number(customer.debt),
    };
  }

  static async createCustomer(input: CreateCustomerInput) {
    const existing = await prisma.customer.findMany({
      where: { phone: input.phone },
    });

    const dt = new Date();
    if (existing.length > 0) {
      const existingId = existing[0].id;
      await prisma.customer.updateMany({
        where: { id: existingId },
        data: {
          name: input.name,
          email: input.email || null,
          address: input.address || null,
          tier: input.tier || "Đồng",
          points: input.points !== undefined ? new Prisma.Decimal(input.points) : undefined,
          totalSpent: input.totalSpent !== undefined ? new Prisma.Decimal(input.totalSpent) : undefined,
          debt: input.debt !== undefined ? new Prisma.Decimal(input.debt) : undefined,
          note: input.note || null,
          updatedAt: dt,
        },
      });
      return this.getCustomerById(existingId);
    }

    const id = (input as any).id || `cust-${Date.now()}`;

    await prisma.$executeRaw`
      INSERT INTO [KhachHang] (id, name, phone, email, address, tier, points, totalSpent, totalOrders, debt, note, createdAt, updatedAt)
      VALUES (${id}, ${input.name}, ${input.phone}, ${input.email || null}, ${input.address || null}, ${input.tier || "Đồng"}, ${input.points || 0}, ${input.totalSpent || 0}, ${input.totalOrders || 0}, ${input.debt || 0}, ${input.note || null}, ${dt}, ${dt})
    `;

    return this.getCustomerById(id);
  }

  static async updateCustomer(id: string, input: UpdateCustomerInput) {
    await this.getCustomerById(id);

    if (input.phone) {
      const existingPhone = await prisma.customer.findMany({
        where: {
          phone: input.phone,
          NOT: { id },
        },
      });
      if (existingPhone.length > 0) {
        throw new ConflictError(`Số điện thoại "${input.phone}" đã được sử dụng bởi khách hàng khác`);
      }
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.email !== undefined) updateData.email = input.email || null;
    if (input.address !== undefined) updateData.address = input.address || null;
    if (input.tier !== undefined) updateData.tier = input.tier;
    if (input.points !== undefined) updateData.points = new Prisma.Decimal(input.points);
    if (input.totalSpent !== undefined) updateData.totalSpent = new Prisma.Decimal(input.totalSpent);
    if (input.totalOrders !== undefined) updateData.totalOrders = input.totalOrders;
    if (input.debt !== undefined) updateData.debt = new Prisma.Decimal(input.debt);
    if (input.note !== undefined) updateData.note = input.note || null;
    updateData.updatedAt = new Date();

    await prisma.customer.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getCustomerById(id);
  }

  static async deleteCustomer(id: string) {
    await this.getCustomerById(id);
    await prisma.customer.deleteMany({
      where: { id },
    });
    return { message: "Xóa khách hàng thành công" };
  }

  static async adjustPoints(id: string, input: AdjustPointsInput) {
    const customer = await this.getCustomerById(id);
    const newPoints = Math.max(0, customer.points + input.pointsChange);

    await prisma.customer.updateMany({
      where: { id },
      data: {
        points: new Prisma.Decimal(newPoints),
      },
    });

    const updated = await this.getCustomerById(id);
    return {
      ...updated,
      pointsAdjusted: input.pointsChange,
    };
  }

  static async adjustDebt(id: string, input: AdjustDebtInput) {
    const customer = await this.getCustomerById(id);
    const newDebt = customer.debt + input.debtChange;

    await prisma.customer.updateMany({
      where: { id },
      data: {
        debt: new Prisma.Decimal(newDebt),
      },
    });

    const updated = await this.getCustomerById(id);
    return {
      ...updated,
      debtAdjusted: input.debtChange,
    };
  }

  static async bulkImport(customers: CreateCustomerInput[]) {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const c of customers) {
      try {
        const existing = await prisma.customer.findMany({
          where: { phone: c.phone },
        });

        if (existing.length > 0) {
          await this.updateCustomer(existing[0].id, c);
        } else {
          await this.createCustomer(c);
        }
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Khách hàng ${c.name} (${c.phone}): ${err.message}`);
      }
    }

    return {
      total: customers.length,
      successCount,
      failedCount,
      errors,
    };
  }
}
