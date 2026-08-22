import prisma from "../../config/db";
import {
  CreateStockTransferInput,
  StockTransferQueryInput,
  UpdateStockTransferStatusInput,
} from "./transfers.schema";
import { NotFoundError } from "../../core/errors/AppError";

export class TransfersService {
  static async getTransfers(query: StockTransferQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.fromWarehouse) {
      where.fromWarehouse = query.fromWarehouse;
    }

    if (query.toWarehouse) {
      where.toWarehouse = query.toWarehouse;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { code: { contains: s } },
        { fromWarehouse: { contains: s } },
        { toWarehouse: { contains: s } },
        { senderName: { contains: s } },
        { receiverName: { contains: s } },
        { trackingNumber: { contains: s } },
        { notes: { contains: s } },
      ];
    }

    const allTransfers = await prisma.stockTransfer.findMany({
      where,
      include: { items: true },
    });

    allTransfers.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allTransfers.length;
    const transfers = allTransfers.slice(skip, skip + limit);

    const formatted = transfers.map((t) => ({
      ...t,
      totalQuantity: Number(t.totalQuantity),
      items: (t.items || []).map((it) => ({
        ...it,
        quantity: Number(it.quantity),
        unitCost: Number(it.unitCost),
        totalCost: Number(it.totalCost),
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

  static async getTransferById(id: string) {
    const items = await prisma.stockTransfer.findMany({
      where: { id },
      include: { items: true },
    });

    const t = items[0];
    if (!t) {
      throw new NotFoundError(`Không tìm thấy phiếu chuyển kho ID: ${id}`);
    }

    return {
      ...t,
      totalQuantity: Number(t.totalQuantity),
      items: (t.items || []).map((it) => ({
        ...it,
        quantity: Number(it.quantity),
        unitCost: Number(it.unitCost),
        totalCost: Number(it.totalCost),
      })),
    };
  }

  static async createStockTransfer(input: CreateStockTransferInput) {
    const id = input.id || `st-${Date.now()}`;
    const code =
      input.code ||
      `CK-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const { items, ...transferData } = input;
    const now = new Date();
    const tDate = transferData.transferDate ? new Date(transferData.transferDate) : now;

    // 1. Insert StockTransfer
    await prisma.$executeRaw`
      INSERT INTO [StockTransfer] (id, code, fromWarehouse, toWarehouse, transferDate, status, totalItems, totalQuantity, senderName, receiverName, transportMethod, trackingNumber, notes, createdAt)
      VALUES (${id}, ${code}, ${transferData.fromWarehouse}, ${transferData.toWarehouse}, ${tDate}, ${transferData.status || "in_transit"}, ${transferData.totalItems}, ${transferData.totalQuantity}, ${transferData.senderName}, ${transferData.receiverName || null}, ${transferData.transportMethod || null}, ${transferData.trackingNumber || null}, ${transferData.notes || null}, ${now})
    `;

    // 2. Insert Items & Process Stock Deduct
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const itemId = `st-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [StockTransferItem] (id, transferId, productId, productName, sku, unit, quantity, unitCost, totalCost)
        VALUES (${itemId}, ${id}, ${it.productId}, ${it.productName}, ${it.sku}, ${it.unit || "Cái"}, ${it.quantity}, ${it.unitCost}, ${it.totalCost})
      `;

      // Deduct stock from source warehouse if in_transit or completed
      if (transferData.status !== "draft" && it.productId) {
        const prodList = await prisma.product.findMany({ where: { id: it.productId } });
        const prod = prodList[0];
        if (prod) {
          const oldStock = Number(prod.stock);
          const transferQty = Number(it.quantity);
          const newStock = Math.max(0, oldStock - transferQty);

          await prisma.$executeRaw`
            UPDATE [Product]
            SET stock = ${newStock}, updatedAt = ${new Date()}
            WHERE id = ${prod.id}
          `;

          const logId = `log-st-out-${Date.now()}-${idx}`;
          const reasonText = `Xuất chuyển kho từ [${transferData.fromWarehouse}] đến [${transferData.toWarehouse}] theo phiếu ${code}`;
          await prisma.$executeRaw`
            INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'transfer_out', ${-transferQty}, ${oldStock}, ${newStock}, ${reasonText}, ${transferData.senderName || "Thủ kho"}, ${new Date()})
          `;
        }
      }
    }

    return this.getTransferById(id);
  }

  static async updateTransferStatus(id: string, input: UpdateStockTransferStatusInput) {
    const current = await this.getTransferById(id);
    const now = new Date();

    if (input.status === "completed" && current.status !== "completed") {
      // Complete transfer: Log transfer_in
      for (let idx = 0; idx < current.items.length; idx++) {
        const it = current.items[idx];
        const prodList = await prisma.product.findMany({ where: { id: it.productId } });
        const prod = prodList[0];
        const curStock = prod ? Number(prod.stock) : 0;
        const logId = `log-st-in-${Date.now()}-${idx}`;
        const reasonText = `Đã nhận hàng chuyển kho vào [${current.toWarehouse}] từ [${current.fromWarehouse}] theo phiếu ${current.code}`;
        await prisma.$executeRaw`
          INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, timestamp)
          VALUES (${logId}, ${it.productId}, ${it.productName}, ${it.sku}, 'transfer_in', ${it.quantity}, ${curStock}, ${curStock}, ${reasonText}, ${input.receiverName || "Thủ kho nhận"}, ${now})
        `;
      }

      await prisma.$executeRaw`
        UPDATE [StockTransfer]
        SET status = 'completed', receivedDate = ${now}, receiverName = ${input.receiverName || current.receiverName || "Thủ kho nhận"}, notes = ${input.notes || current.notes || null}
        WHERE id = ${id}
      `;
    } else if (input.status === "cancelled" && current.status === "in_transit") {
      // Revert stock deduction back to source warehouse
      for (let idx = 0; idx < current.items.length; idx++) {
        const it = current.items[idx];
        const prodList = await prisma.product.findMany({ where: { id: it.productId } });
        const prod = prodList[0];
        if (prod) {
          const oldStock = Number(prod.stock);
          const revertQty = Number(it.quantity);
          const newStock = oldStock + revertQty;

          await prisma.$executeRaw`
            UPDATE [Product]
            SET stock = ${newStock}, updatedAt = ${now}
            WHERE id = ${prod.id}
          `;

          const logId = `log-st-revert-${Date.now()}-${idx}`;
          const reasonText = `Hủy phiếu chuyển kho ${current.code} - hoàn lại tồn kho cho [${current.fromWarehouse}]`;
          await prisma.$executeRaw`
            INSERT INTO [InventoryLog] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'transfer_cancel_revert', ${revertQty}, ${oldStock}, ${newStock}, ${reasonText}, ${input.receiverName || "Thủ kho"}, ${now})
          `;
        }
      }

      await prisma.$executeRaw`
        UPDATE [StockTransfer]
        SET status = 'cancelled', notes = ${input.notes || current.notes || null}
        WHERE id = ${id}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE [StockTransfer]
        SET status = ${input.status}, receiverName = ${input.receiverName || current.receiverName || null}, notes = ${input.notes || current.notes || null}
        WHERE id = ${id}
      `;
    }

    return this.getTransferById(id);
  }

  static async deleteTransfer(id: string) {
    await this.getTransferById(id);

    await prisma.stockTransferItem.deleteMany({
      where: { transferId: id },
    });

    await prisma.stockTransfer.deleteMany({
      where: { id },
    });

    return { message: "Xóa phiếu chuyển kho thành công" };
  }
}
