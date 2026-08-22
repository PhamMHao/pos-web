import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQueryInput,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderStatusInput,
  PurchaseOrderQueryInput,
} from "./suppliers.schema";
import { Prisma } from "@prisma/client";

export class SuppliersService {
  // ==========================================
  // 1. QUẢN LÝ NHÀ CUNG CẤP (SUPPLIERS)
  // ==========================================

  static async getSuppliers(query: SupplierQueryInput) {
    const {
      search,
      category,
      tier,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.SupplierWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term } },
        { code: { contains: term } },
        { phone: { contains: term } },
        { contactPerson: { contains: term } },
        { taxCode: { contains: term } },
      ];
    }

    if (category && category !== "all" && category !== "Tất cả") {
      where.category = category;
    }

    if (tier && tier !== "all" && tier !== "Tất cả") {
      where.tier = tier;
    }

    const allItems = await prisma.supplier.findMany({
      where,
      include: {
        priceList: true,
      },
    });

    // In-memory sort (100% SQL Server 2008 / Multi-version compatible)
    allItems.sort((a, b) => {
      if (sortBy === "currentDebt") {
        return sortOrder === "asc"
          ? Number(a.currentDebt) - Number(b.currentDebt)
          : Number(b.currentDebt) - Number(a.currentDebt);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((s) => ({
      ...s,
      creditLimit: Number(s.creditLimit),
      currentDebt: Number(s.currentDebt),
      ratingQuality: Number(s.ratingQuality),
      ratingPrice: Number(s.ratingPrice),
      ratingOnTime: Number(s.ratingOnTime),
      ratingWarranty: Number(s.ratingWarranty),
      priceList: (s.priceList || []).map((p) => ({
        ...p,
        costPrice: Number(p.costPrice),
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

  static async getSupplierById(id: string) {
    const items = await prisma.supplier.findMany({
      where: { id },
      include: {
        priceList: true,
        purchaseOrders: {
          include: {
            items: true,
          },
        },
      },
    });

    const supplier = items[0];
    if (!supplier) {
      throw new NotFoundError(`Không tìm thấy nhà cung cấp với ID: ${id}`);
    }

    return {
      ...supplier,
      creditLimit: Number(supplier.creditLimit),
      currentDebt: Number(supplier.currentDebt),
      ratingQuality: Number(supplier.ratingQuality),
      ratingPrice: Number(supplier.ratingPrice),
      ratingOnTime: Number(supplier.ratingOnTime),
      ratingWarranty: Number(supplier.ratingWarranty),
      priceList: (supplier.priceList || []).map((p) => ({
        ...p,
        costPrice: Number(p.costPrice),
      })),
      purchaseOrders: (supplier.purchaseOrders || []).map((po) => ({
        ...po,
        subtotal: Number(po.subtotal),
        vatRate: Number(po.vatRate),
        vatAmount: Number(po.vatAmount),
        shippingFee: Number(po.shippingFee),
        discountAmount: Number(po.discountAmount),
        totalAmount: Number(po.totalAmount),
        paidAmount: Number(po.paidAmount),
        items: (po.items || []).map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      })),
    };
  }

  static async createSupplier(input: CreateSupplierInput) {
    const cleanCode = input.code.trim().toUpperCase();
    const existing = await prisma.supplier.findMany({
      where: { code: cleanCode },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Mã nhà cung cấp "${cleanCode}" đã tồn tại trong hệ thống`);
    }

    const id = input.id || `sup-${Date.now()}`;
    const dt = new Date();
    const { priceList = [], ...data } = input;

    await prisma.$executeRaw`
      INSERT INTO [Supplier] (id, code, name, taxCode, tier, category, contactPerson, phone, email, address, bankName, bankAccount, bankCode, creditLimit, creditDays, currentDebt, ratingQuality, ratingPrice, ratingOnTime, ratingWarranty, notes, createdAt, updatedAt)
      VALUES (${id}, ${cleanCode}, ${data.name}, ${data.taxCode || null}, ${data.tier || "Tổng Đại Lý"}, ${data.category || "Camera & An Ninh"}, ${data.contactPerson || null}, ${data.phone}, ${data.email || null}, ${data.address || null}, ${data.bankName || null}, ${data.bankAccount || null}, ${data.bankCode || null}, ${data.creditLimit || 0}, ${data.creditDays || 30}, ${data.currentDebt || 0}, ${data.ratingQuality || 9.5}, ${data.ratingPrice || 9.0}, ${data.ratingOnTime || 9.5}, ${data.ratingWarranty || 9.2}, ${data.notes || null}, ${dt}, ${dt})
    `;

    for (let idx = 0; idx < priceList.length; idx++) {
      const it = priceList[idx];
      const pId = `sup-price-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [SupplierPriceItem] (id, supplierId, sku, productName, costPrice, warrantyMonths, moq)
        VALUES (${pId}, ${id}, ${it.sku}, ${it.productName}, ${it.costPrice}, ${it.warrantyMonths || 24}, ${it.moq || 1})
      `;
    }

    return this.getSupplierById(id);
  }

  static async updateSupplier(id: string, input: UpdateSupplierInput) {
    await this.getSupplierById(id);
    const { priceList, ...data } = input;

    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.code) updateData.code = data.code.trim().toUpperCase();
    if (data.creditLimit !== undefined) updateData.creditLimit = new Prisma.Decimal(data.creditLimit);
    if (data.currentDebt !== undefined) updateData.currentDebt = new Prisma.Decimal(data.currentDebt);
    if (data.ratingQuality !== undefined) updateData.ratingQuality = new Prisma.Decimal(data.ratingQuality);
    if (data.ratingPrice !== undefined) updateData.ratingPrice = new Prisma.Decimal(data.ratingPrice);
    if (data.ratingOnTime !== undefined) updateData.ratingOnTime = new Prisma.Decimal(data.ratingOnTime);
    if (data.ratingWarranty !== undefined) updateData.ratingWarranty = new Prisma.Decimal(data.ratingWarranty);

    await prisma.supplier.updateMany({
      where: { id },
      data: updateData,
    });

    if (priceList && Array.isArray(priceList)) {
      await prisma.supplierPriceItem.deleteMany({
        where: { supplierId: id },
      });

      for (let idx = 0; idx < priceList.length; idx++) {
        const it = priceList[idx];
        const pId = `sup-price-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [SupplierPriceItem] (id, supplierId, sku, productName, costPrice, warrantyMonths, moq)
          VALUES (${pId}, ${id}, ${it.sku}, ${it.productName}, ${it.costPrice}, ${it.warrantyMonths || 24}, ${it.moq || 1})
        `;
      }
    }

    return this.getSupplierById(id);
  }

  static async deleteSupplier(id: string) {
    await this.getSupplierById(id);

    // Delete price items
    await prisma.supplierPriceItem.deleteMany({
      where: { supplierId: id },
    });

    // Delete supplier
    await prisma.supplier.deleteMany({
      where: { id },
    });

    return { message: "Xóa nhà cung cấp thành công" };
  }

  // ==========================================
  // 2. QUẢN LÝ ĐƠN MUA HÀNG (PURCHASE ORDERS - PO)
  // ==========================================

  static async getPurchaseOrders(query: PurchaseOrderQueryInput) {
    const {
      search,
      supplierId,
      status,
      paymentStatus,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { supplierName: { contains: term } },
        { supplierPhone: { contains: term } },
      ];
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status && status !== "all" && status !== "Tất cả") {
      where.status = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }

    const allItems = await prisma.purchaseOrder.findMany({
      where,
      include: {
        items: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "totalAmount") {
        return sortOrder === "asc"
          ? Number(a.totalAmount) - Number(b.totalAmount)
          : Number(b.totalAmount) - Number(a.totalAmount);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((po) => ({
      ...po,
      subtotal: Number(po.subtotal),
      vatRate: Number(po.vatRate),
      vatAmount: Number(po.vatAmount),
      shippingFee: Number(po.shippingFee),
      discountAmount: Number(po.discountAmount),
      totalAmount: Number(po.totalAmount),
      paidAmount: Number(po.paidAmount),
      items: (po.items || []).map((i) => ({
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

  static async getPurchaseOrderById(id: string) {
    const items = await prisma.purchaseOrder.findMany({
      where: { id },
      include: {
        items: true,
        supplier: true,
      },
    });

    const po = items[0];
    if (!po) {
      throw new NotFoundError(`Không tìm thấy đơn đặt hàng mua ID: ${id}`);
    }

    return {
      ...po,
      subtotal: Number(po.subtotal),
      vatRate: Number(po.vatRate),
      vatAmount: Number(po.vatAmount),
      shippingFee: Number(po.shippingFee),
      discountAmount: Number(po.discountAmount),
      totalAmount: Number(po.totalAmount),
      paidAmount: Number(po.paidAmount),
      items: (po.items || []).map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
      supplier: po.supplier
        ? {
            ...po.supplier,
            creditLimit: Number(po.supplier.creditLimit),
            currentDebt: Number(po.supplier.currentDebt),
          }
        : null,
    };
  }

  static async createPurchaseOrder(input: CreatePurchaseOrderInput) {
    const code =
      input.code ||
      `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const id = input.id || `po-${Date.now()}`;
    const dt = input.orderDate ? new Date(input.orderDate) : new Date();
    const expDt = new Date(input.expectedDeliveryDate);
    const { items, ...poData } = input;

    await prisma.$executeRaw`
      INSERT INTO [PurchaseOrder] (id, code, supplierId, supplierName, supplierPhone, supplierAddress, supplierTaxCode, warehouseId, warehouseName, orderDate, expectedDeliveryDate, status, subtotal, vatRate, vatAmount, shippingFee, discountAmount, totalAmount, paidAmount, paymentStatus, paymentMethod, notes, createdAt, updatedAt)
      VALUES (${id}, ${code}, ${poData.supplierId}, ${poData.supplierName}, ${poData.supplierPhone || null}, ${poData.supplierAddress || null}, ${poData.supplierTaxCode || null}, ${poData.warehouseId || "wh-main"}, ${poData.warehouseName || "Kho Chính"}, ${dt}, ${expDt}, ${poData.status || "confirmed"}, ${poData.subtotal}, ${poData.vatRate || 10}, ${poData.vatAmount || 0}, ${poData.shippingFee || 0}, ${poData.discountAmount || 0}, ${poData.totalAmount}, ${poData.paidAmount || 0}, ${poData.paymentStatus || "unpaid"}, ${poData.paymentMethod || "transfer"}, ${poData.notes || null}, ${new Date()}, ${new Date()})
    `;

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const itemId = `po-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [PurchaseOrderItem] (id, purchaseOrderId, productId, sku, productName, unit, quantity, unitPrice, total)
        VALUES (${itemId}, ${id}, ${it.productId || null}, ${it.sku}, ${it.productName}, ${it.unit || "Cái"}, ${it.quantity}, ${it.unitPrice}, ${it.total})
      `;
    }

    return this.getPurchaseOrderById(id);
  }

  static async updatePurchaseOrderStatus(id: string, input: UpdatePurchaseOrderStatusInput) {
    const po = await this.getPurchaseOrderById(id);

    const updateData: any = {
      status: input.status,
      updatedAt: new Date(),
    };

    if (input.paidAmount !== undefined) {
      updateData.paidAmount = new Prisma.Decimal(input.paidAmount);
    }

    if (input.paymentStatus) {
      updateData.paymentStatus = input.paymentStatus;
    }

    if (input.notes) {
      updateData.notes = po.notes ? `${po.notes}\n[Cập nhật]: ${input.notes}` : input.notes;
    }

    await prisma.purchaseOrder.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getPurchaseOrderById(id);
  }

  static async deletePurchaseOrder(id: string) {
    await this.getPurchaseOrderById(id);

    await prisma.purchaseOrderItem.deleteMany({
      where: { purchaseOrderId: id },
    });

    await prisma.purchaseOrder.deleteMany({
      where: { id },
    });

    return { message: "Xóa đơn đặt hàng mua thành công" };
  }
}
