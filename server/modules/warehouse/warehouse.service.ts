import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateGoodsReceiptInput,
  AdjustStockInput,
  GoodsReceiptQueryInput,
  InventoryLogQueryInput,
} from "./warehouse.schema";
import { Prisma } from "@prisma/client";

export class WarehouseService {
  static async createGoodsReceipt(input: CreateGoodsReceiptInput) {
    const code =
      input.code ||
      `PNK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const { items, ...receiptData } = input;
    const id = `receipt-${Date.now()}`;
    const dt = receiptData.date ? new Date(receiptData.date) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [StockGoodsReceipt] (id, code, date, inboundInvoiceId, inboundInvoiceCode, supplierName, supplierTaxCode, warehouseName, creatorName, receivedBy, totalItemsCount, totalQuantity, totalCostAmount, totalTaxAmount, grandTotal, paymentStatus, notes, createdAt, updatedAt)
      VALUES (${id}, ${code}, ${dt}, ${receiptData.inboundInvoiceId || null}, ${receiptData.inboundInvoiceCode || null}, ${receiptData.supplierName}, ${receiptData.supplierTaxCode || null}, ${receiptData.warehouseName || "Kho Chính"}, ${receiptData.creatorName}, ${receiptData.receivedBy}, ${receiptData.totalItemsCount}, ${receiptData.totalQuantity}, ${receiptData.totalCostAmount}, ${receiptData.totalTaxAmount}, ${receiptData.grandTotal}, ${receiptData.paymentStatus}, ${receiptData.notes || null}, ${new Date()}, ${new Date()})
    `;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemId = `receipt-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [StockGoodsReceiptItem] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, notes)
        VALUES (${itemId}, ${id}, ${item.productId}, ${item.productName}, ${item.sku}, ${item.unit}, ${item.quantity}, ${item.oldStock}, ${item.newStock}, ${item.oldCostPrice}, ${item.newCostPrice}, ${item.unitCost}, ${item.taxRate}, ${item.totalAmount}, ${item.storageLocation || null}, ${item.warehouse || null}, ${item.category || null}, ${item.notes || null})
      `;

      // Update product stock and cost price
      const products = await prisma.product.findMany({ where: { id: item.productId } });
      if (products.length > 0) {
        const prod = products[0];
        const addQty = Number(item.quantity);
        const oldStock = Number(prod.stock);
        const newStock = oldStock + addQty;

        await prisma.product.updateMany({
          where: { id: item.productId },
          data: {
            stock: new Prisma.Decimal(newStock),
            costPrice: new Prisma.Decimal(item.unitCost),
            storageLocation: item.storageLocation || prod.storageLocation,
          },
        });

        const logId = `inv-log-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, [timestamp])
          VALUES (${logId}, ${item.productId}, ${item.productName}, ${item.sku}, 'import', ${addQty}, ${oldStock}, ${newStock}, ${item.unitCost}, ${`Nhập kho từ NCC ${receiptData.supplierName} theo phiếu ${code}`}, ${receiptData.receivedBy || "Thủ kho"}, ${new Date()})
        `;
      }
    }

    return this.getGoodsReceiptById(id);
  }

  static async getGoodsReceipts(query: GoodsReceiptQueryInput) {
    const {
      search,
      supplierName,
      paymentStatus,
      warehouseName,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "date",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.StockGoodsReceiptWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { supplierName: { contains: term } },
        { inboundInvoiceCode: { contains: term } },
      ];
    }

    if (supplierName) {
      where.supplierName = { contains: supplierName };
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }

    if (warehouseName && warehouseName !== "all") {
      where.warehouseName = warehouseName;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const allItems = await prisma.stockGoodsReceipt.findMany({
      where,
      include: {
        items: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "grandTotal") {
        return sortOrder === "asc"
          ? Number(a.grandTotal) - Number(b.grandTotal)
          : Number(b.grandTotal) - Number(a.grandTotal);
      }
      return sortOrder === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((r) => ({
      ...r,
      totalQuantity: Number(r.totalQuantity),
      totalCostAmount: Number(r.totalCostAmount),
      totalTaxAmount: Number(r.totalTaxAmount),
      grandTotal: Number(r.grandTotal),
      items: (r.items || []).map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        oldStock: Number(i.oldStock),
        newStock: Number(i.newStock),
        oldCostPrice: Number(i.oldCostPrice),
        newCostPrice: Number(i.newCostPrice),
        unitCost: Number(i.unitCost),
        taxRate: Number(i.taxRate),
        totalAmount: Number(i.totalAmount),
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

  static async getGoodsReceiptById(id: string) {
    const items = await prisma.stockGoodsReceipt.findMany({
      where: { id },
      include: {
        items: true,
      },
    });

    const receipt = items[0];
    if (!receipt) {
      throw new NotFoundError(`Không tìm thấy phiếu nhập kho với ID: ${id}`);
    }

    return {
      ...receipt,
      totalQuantity: Number(receipt.totalQuantity),
      totalCostAmount: Number(receipt.totalCostAmount),
      totalTaxAmount: Number(receipt.totalTaxAmount),
      grandTotal: Number(receipt.grandTotal),
      items: (receipt.items || []).map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        oldStock: Number(i.oldStock),
        newStock: Number(i.newStock),
        oldCostPrice: Number(i.oldCostPrice),
        newCostPrice: Number(i.newCostPrice),
        unitCost: Number(i.unitCost),
        taxRate: Number(i.taxRate),
        totalAmount: Number(i.totalAmount),
      })),
    };
  }

  static async adjustStock(input: AdjustStockInput) {
    const products = await prisma.product.findMany({
      where: { id: input.productId },
    });

    if (products.length === 0) {
      throw new NotFoundError(`Không tìm thấy sản phẩm ID: ${input.productId}`);
    }

    await prisma.product.updateMany({
      where: { id: input.productId },
      data: {
        stock: new Prisma.Decimal(input.newStock),
      },
    });

    const logId = `inv-log-${Date.now()}`;
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, [timestamp])
      VALUES (${logId}, ${input.productId}, ${input.productName}, ${input.sku}, ${input.type}, ${input.quantityChange}, ${input.oldStock}, ${input.newStock}, ${input.unitPrice || null}, ${input.reason}, ${input.performedBy || "Thủ kho"}, ${dt})
    `;

    const logs = await prisma.inventoryLog.findMany({ where: { id: logId } });
    const result = logs[0];

    return {
      ...result,
      quantityChange: Number(result.quantityChange),
      oldStock: Number(result.oldStock),
      newStock: Number(result.newStock),
      unitPrice: result.unitPrice ? Number(result.unitPrice) : null,
    };
  }

  static async getInventoryLogs(query: InventoryLogQueryInput) {
    const { productId, sku, type, startDate, endDate, page = 1, limit = 100 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.InventoryLogWhereInput = {};

    if (productId) where.productId = productId;
    if (sku) where.sku = sku;
    if (type && type !== "all") where.type = type;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const allItems = await prisma.inventoryLog.findMany({ where });

    // In-memory sort
    allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((l) => ({
      ...l,
      quantityChange: Number(l.quantityChange),
      oldStock: Number(l.oldStock),
      newStock: Number(l.newStock),
      unitPrice: l.unitPrice ? Number(l.unitPrice) : null,
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
}
