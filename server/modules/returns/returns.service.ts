import prisma from "../../config/db";
import { CreateReturnOrderInput, ReturnOrderQueryInput } from "./returns.schema";
import { NotFoundError } from "../../core/errors/AppError";

export class ReturnsService {
  static async getReturnOrders(query: ReturnOrderQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { code: { contains: s } },
        { originalOrderCode: { contains: s } },
        { customerName: { contains: s } },
        { customerPhone: { contains: s } },
        { supplierName: { contains: s } },
        { reason: { contains: s } },
      ];
    }

    const allReturns = await prisma.returnOrder.findMany({
      where,
      include: { items: true },
    });

    allReturns.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allReturns.length;
    const returns = allReturns.slice(skip, skip + limit);

    const formatted = returns.map((r) => ({
      ...r,
      refundAmount: Number(r.refundAmount),
      totalReturnQuantity: Number(r.totalReturnQuantity),
      items: (r.items || []).map((it) => ({
        ...it,
        ratioToBase: Number(it.ratioToBase),
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        refundUnitPrice: Number(it.refundUnitPrice),
        totalRefund: Number(it.totalRefund),
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

  static async getReturnOrderById(id: string) {
    const items = await prisma.returnOrder.findMany({
      where: { id },
      include: { items: true },
    });

    const r = items[0];
    if (!r) {
      throw new NotFoundError(`Không tìm thấy phiếu trả hàng ID: ${id}`);
    }

    return {
      ...r,
      refundAmount: Number(r.refundAmount),
      totalReturnQuantity: Number(r.totalReturnQuantity),
      items: (r.items || []).map((it) => ({
        ...it,
        ratioToBase: Number(it.ratioToBase),
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        refundUnitPrice: Number(it.refundUnitPrice),
        totalRefund: Number(it.totalRefund),
      })),
    };
  }

  static async createReturnOrder(input: CreateReturnOrderInput) {
    const id = input.id || `ret-${Date.now()}`;
    const code =
      input.code ||
      `TH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const { items, ...orderData } = input;
    const now = new Date();

    // 1. Insert ReturnOrder
    await prisma.$executeRaw`
      INSERT INTO [ReturnOrder] (id, code, type, originalOrderCode, originalOrderId, customerId, customerName, customerPhone, supplierId, supplierName, warehouse, refundMethod, refundAmount, totalReturnQuantity, reason, destinationType, status, performedBy, notes, createdAt)
      VALUES (${id}, ${code}, ${orderData.type || "customer_return"}, ${orderData.originalOrderCode || null}, ${orderData.originalOrderId || null}, ${orderData.customerId || null}, ${orderData.customerName || null}, ${orderData.customerPhone || null}, ${orderData.supplierId || null}, ${orderData.supplierName || null}, ${orderData.warehouse || "Kho Chính"}, ${orderData.refundMethod || "cash"}, ${orderData.refundAmount}, ${orderData.totalReturnQuantity}, ${orderData.reason}, ${orderData.destinationType || "restock"}, ${orderData.status || "completed"}, ${orderData.performedBy || "Thu ngân"}, ${orderData.notes || null}, ${now})
    `;

    // 2. Insert Items & Process Inventory Restock
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const itemId = `ret-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [ReturnOrderItem] (id, returnOrderId, productId, productName, sku, unit, ratioToBase, quantity, unitPrice, refundUnitPrice, totalRefund, serialNumber, condition)
        VALUES (${itemId}, ${id}, ${it.productId}, ${it.productName}, ${it.sku}, ${it.unit || "Cái"}, ${it.ratioToBase || 1}, ${it.quantity}, ${it.unitPrice}, ${it.refundUnitPrice}, ${it.totalRefund}, ${it.serialNumber || null}, ${it.condition || "normal"})
      `;

      // Auto update inventory if restock
      if (orderData.destinationType === "restock" && it.productId) {
        const prodList = await prisma.product.findMany({ where: { id: it.productId } });
        const prod = prodList[0];
        if (prod) {
          const oldStock = Number(prod.stock);
          const ratio = Number(it.ratioToBase) || 1;
          const returnQtyBase = Number(it.quantity) * ratio;
          const newStock = oldStock + returnQtyBase;

          await prisma.$executeRaw`
            UPDATE [Product]
            SET stock = ${newStock}, updatedAt = ${new Date()}
            WHERE id = ${prod.id}
          `;

          const logId = `log-ret-${Date.now()}-${idx}`;
          const reasonText = `Nhập hoàn kho từ phiếu trả hàng ${code} (Lý do: ${orderData.reason})`;
          await prisma.$executeRaw`
            INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'return_restock', ${returnQtyBase}, ${oldStock}, ${newStock}, ${reasonText}, ${orderData.performedBy || "Thu ngân"}, ${new Date()})
          `;
        }
      } else if (orderData.destinationType === "faulty_warehouse" && it.productId) {
        const prodList = await prisma.product.findMany({ where: { id: it.productId } });
        const prod = prodList[0];
        if (prod) {
          const oldStock = Number(prod.stock);
          const logId = `log-ret-faulty-${Date.now()}-${idx}`;
          const reasonText = `Hàng lỗi chuyển kho bảo hành/kiểm tra từ phiếu trả hàng ${code}`;
          await prisma.$executeRaw`
            INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'return_faulty', 0, ${oldStock}, ${oldStock}, ${reasonText}, ${orderData.performedBy || "Thu ngân"}, ${new Date()})
          `;
        }
      }

      // Auto update SerialDeviceRecord status if serial is provided
      if (it.serialNumber && it.serialNumber.trim()) {
        const cleanSerial = it.serialNumber.trim();
        const existingSerials = await prisma.serialDeviceRecord.findMany({
          where: { serialNumber: cleanSerial },
        });
        if (existingSerials.length > 0) {
          const sRec = existingSerials[0];
          const updatedNote = `${sRec.notes ? sRec.notes + " | " : ""}[Đã trả hàng theo phiếu ${code} ngày ${now.toLocaleDateString("vi-VN")} - Tình trạng: ${it.condition || "normal"}]`;
          await prisma.$executeRaw`
            UPDATE [SerialDeviceRecord]
            SET warrantyStatus = 'voided', notes = ${updatedNote}
            WHERE serialNumber = ${cleanSerial}
          `;
        }
      }
    }

    // 3. Process Refund Accounting or Debt Deduction
    const refundAmount = Number(orderData.refundAmount) || 0;
    if (refundAmount > 0) {
      if (orderData.refundMethod === "cash" || orderData.refundMethod === "transfer") {
        const accId = `acc-pc-${Date.now()}`;
        const pcCode = `PC-TH-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
        const noteText = `Chi tiền hoàn trả cho phiếu trả hàng ${code} (Khách: ${orderData.customerName || "Khách lẻ"})`;
        await prisma.$executeRaw`
          INSERT INTO [AccountingRecord] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
          VALUES (${accId}, ${pcCode}, 'expense', 'Hoàn tiền trả hàng', ${refundAmount}, ${now}, ${orderData.customerName || "Khách lẻ"}, ${orderData.refundMethod}, 'completed', ${noteText}, ${code})
        `;
      } else if (orderData.refundMethod === "debt_deduct" && orderData.customerId) {
        const custList = await prisma.customer.findMany({ where: { id: orderData.customerId } });
        const cust = custList[0];
        if (cust) {
          const curDebt = Number(cust.debt) || 0;
          const newDebt = Math.max(0, curDebt - refundAmount);
          await prisma.$executeRaw`
            UPDATE [Customer]
            SET debt = ${newDebt}, updatedAt = ${new Date()}
            WHERE id = ${cust.id}
          `;
        }
      }
    }

    return this.getReturnOrderById(id);
  }

  static async deleteReturnOrder(id: string) {
    await this.getReturnOrderById(id);

    await prisma.returnOrderItem.deleteMany({
      where: { returnOrderId: id },
    });

    await prisma.returnOrder.deleteMany({
      where: { id },
    });

    return { message: "Xóa phiếu trả hàng thành công" };
  }
}
