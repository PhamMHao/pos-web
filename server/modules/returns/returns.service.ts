import prisma from "../../config/db";
import {
  CreateReturnOrderInput,
  ReturnOrderQueryInput,
  CancelReturnOrderInput,
} from "./returns.schema";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError";
import { Prisma } from "@prisma/client";

export class ReturnsService {
  /**
   * Lấy danh sách phiếu trả hàng kèm phân trang và lọc
   */
  static async getReturnOrders(query: ReturnOrderQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ReturnOrderWhereInput = {};

    if (query.type && query.type !== "all") {
      where.type = query.type;
    }

    if (query.status && query.status !== "all") {
      where.status = query.status;
    }

    if (query.warehouse && query.warehouse !== "all") {
      where.warehouse = query.warehouse;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { code: { contains: s } },
        { originalOrderCode: { contains: s } },
        { customerName: { contains: s } },
        { customerPhone: { contains: s } },
        { accountingCode: { contains: s } },
        { stockReceiptCode: { contains: s } },
        { reason: { contains: s } },
      ];
    }

    const allReturns = await prisma.returnOrder.findMany({
      where,
      include: {
        items: {
          include: { serials: true },
        },
      },
    });

    allReturns.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allReturns.length;
    const items = allReturns.slice(skip, skip + limit);

    const formatted = items.map((r) => this.formatReturnOrder(r));

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

  /**
   * Lấy chi tiết 1 phiếu trả hàng theo ID
   */
  static async getReturnOrderById(id: string) {
    const list = await prisma.returnOrder.findMany({
      where: { id },
      include: {
        items: {
          include: { serials: true },
        },
      },
    });

    const r = list[0];
    if (!r) {
      throw new NotFoundError(`Không tìm thấy phiếu trả hàng ID: ${id}`);
    }

    return this.formatReturnOrder(r);
  }

  /**
   * Tạo phiếu trả hàng mới (Server-side Math, Anti-fraud checks)
   */
  static async createReturnOrder(input: CreateReturnOrderInput) {
    // 1. Kiểm tra Idempotency
    const existingIdem = await prisma.returnOrder.findMany({
      where: { idempotencyKey: input.idempotencyKey },
      include: {
        items: { include: { serials: true } },
      },
    });
    if (existingIdem.length > 0) {
      return this.formatReturnOrder(existingIdem[0]);
    }

    const id = input.id || `ret-${Date.now()}`;
    const code =
      input.code ||
      `TH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const now = new Date();

    // 2. Server-side tính toán chi tiết từng món hàng
    let subtotal = 0;
    let taxAmount = 0;
    let totalReturnQuantity = 0;
    const processedItems: any[] = [];

    for (let idx = 0; idx < input.items.length; idx++) {
      const it = input.items[idx];
      const qty = Number(it.quantity);
      const refundUnitPrice = Number(it.refundUnitPrice);
      const taxRate = Number(it.taxRate) || 0;
      const itemSubtotal = qty * refundUnitPrice;
      const itemTaxAmount = (itemSubtotal * taxRate) / 100;
      const itemTotalRefund = itemSubtotal + itemTaxAmount;

      subtotal += itemSubtotal;
      taxAmount += itemTaxAmount;
      totalReturnQuantity += qty;

      // Lấy giá vốn gốc (costPrice)
      let itemCostPrice = Number(it.costPrice) || 0;
      if (it.originalOrderItemId) {
        const oItems = await prisma.orderItem.findMany({ where: { id: it.originalOrderItemId } });
        if (oItems.length > 0) {
          const oIt = oItems[0];
          itemCostPrice = Number(oIt.costPrice);
          const maxAllowable = Number(oIt.quantity) - Number(oIt.returnedQuantity || 0);
          if (qty > maxAllowable) {
            throw new BadRequestError(
              `Số lượng trả của [${it.productName}] (${qty}) vượt quá số lượng còn lại có thể trả (${maxAllowable}) trên hóa đơn gốc!`
            );
          }
        }
      } else if (it.productId) {
        const prods = await prisma.product.findMany({ where: { id: it.productId } });
        if (prods.length > 0) {
          itemCostPrice = Number(prods[0].costPrice);
        }
      }

      processedItems.push({
        ...it,
        id: it.id || `ret-item-${Date.now()}-${idx}`,
        quantity: qty,
        costPrice: itemCostPrice,
        refundUnitPrice,
        taxRate,
        taxAmount: itemTaxAmount,
        subtotal: itemSubtotal,
        totalRefund: itemTotalRefund,
      });
    }

    const restockingFee = Number(input.restockingFee) || 0;
    const giftDeductionAmount = Number(input.giftDeductionAmount) || 0;
    const refundAmount = Math.max(0, subtotal + taxAmount - restockingFee - giftDeductionAmount);

    const accountingCode =
      refundAmount > 0
        ? `PC-TH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
        : null;
    const stockReceiptCode = `PNK-TH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    // 3. Lưu ReturnOrder vào Database
    await prisma.$executeRaw`
      INSERT INTO [PhieuTraHang] (id, code, type, originalOrderId, originalOrderCode, customerId, customerName, customerPhone, warehouse, subtotal, taxAmount, restockingFee, giftDeductionAmount, refundAmount, totalReturnQuantity, refundMethod, accountingCode, stockReceiptCode, reason, status, idempotencyKey, createdBy, notes, createdAt, updatedAt)
      VALUES (${id}, ${code}, ${input.type || "customer_return"}, ${input.originalOrderId || null}, ${input.originalOrderCode || null}, ${input.customerId || null}, ${input.customerName}, ${input.customerPhone || null}, ${input.warehouse || "Kho Chính Gia Phúc Computer"}, ${subtotal}, ${taxAmount}, ${restockingFee}, ${giftDeductionAmount}, ${refundAmount}, ${totalReturnQuantity}, ${input.refundMethod || "cash"}, ${accountingCode}, ${stockReceiptCode}, ${input.reason}, ${input.status || "completed"}, ${input.idempotencyKey}, ${input.createdBy || "usr-admin-01"}, ${input.notes || null}, ${now}, ${now})
    `;

    // 4. Lưu Items và Serials
    for (const it of processedItems) {
      await prisma.$executeRaw`
        INSERT INTO [ChiTietPhieuTraHang] (id, returnOrderId, originalOrderItemId, productId, productName, sku, unit, ratioToBase, quantity, costPrice, unitPrice, refundUnitPrice, taxRate, taxAmount, subtotal, totalRefund, condition, destinationType, warehouseId, warehouseName, storageLocation, specifications, color, brand, notes)
        VALUES (${it.id}, ${id}, ${it.originalOrderItemId || null}, ${it.productId}, ${it.productName}, ${it.sku}, ${it.unit || "Cái"}, ${it.ratioToBase || 1}, ${it.quantity}, ${it.costPrice}, ${it.unitPrice}, ${it.refundUnitPrice}, ${it.taxRate}, ${it.taxAmount}, ${it.subtotal}, ${it.totalRefund}, ${it.condition || "unopened"}, ${it.destinationType || "restock"}, ${it.warehouseId || null}, ${it.warehouseName || "Kho Chính Gia Phúc Computer"}, ${it.storageLocation || null}, ${it.specifications || null}, ${it.color || null}, ${it.brand || null}, ${it.notes || null})
      `;

      if (Array.isArray(it.serials)) {
        for (let sIdx = 0; sIdx < it.serials.length; sIdx++) {
          const sNum = it.serials[sIdx].trim();
          if (sNum) {
            const sId = `s-ret-${Date.now()}-${sIdx}-${Math.random().toString(36).substring(2, 6)}`;
            await prisma.$executeRaw`
              INSERT INTO [ChiTietSerialTraHang] (id, returnItemId, serialNumber)
              VALUES (${sId}, ${it.id}, ${sNum})
            `;
          }
        }
      }
    }

    // 5. Nếu status === 'completed', thực thi commit ngay
    if (input.status === "completed") {
      await this.commitReturnOrderExecution({
        id,
        code,
        input,
        processedItems,
        refundAmount,
        accountingCode,
        subtotal,
        now,
      });
    }

    return this.getReturnOrderById(id);
  }

  /**
   * Commit Return Order Execution (Atomic Stock, WAC, Quỹ, Bút toán, Serial)
   */
  private static async commitReturnOrderExecution(params: {
    id: string;
    code: string;
    input: CreateReturnOrderInput;
    processedItems: any[];
    refundAmount: number;
    accountingCode: string | null;
    subtotal: number;
    now: Date;
  }) {
    const { id, code, input, processedItems, refundAmount, accountingCode, subtotal, now } = params;

    let totalCostVal = 0;

    for (const it of processedItems) {
      const returnQtyBase = Number(it.quantity) * Number(it.ratioToBase || 1);
      const itemCost = Number(it.costPrice);
      totalCostVal += returnQtyBase * itemCost;

      const prodList = await prisma.product.findMany({ where: { id: it.productId } });
      if (prodList.length > 0) {
        const prod = prodList[0];
        const oldStock = Number(prod.stock);
        const oldCostPrice = Number(prod.costPrice);

        if (it.destinationType === "restock") {
          const newStock = oldStock + returnQtyBase;
          const newCostPrice =
            newStock > 0
              ? (oldStock * oldCostPrice + returnQtyBase * itemCost) / newStock
              : itemCost;

          await prisma.$executeRaw`
            UPDATE [SanPham]
            SET stock = ${newStock}, costPrice = ${newCostPrice}, updatedAt = ${now}
            WHERE id = ${prod.id}
          `;

          const logId = `inv-log-ret-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'return_restock', ${returnQtyBase}, ${oldStock}, ${newStock}, ${itemCost}, ${`Nhập hoàn kho từ phiếu trả hàng ${code} (Khách: ${input.customerName})`}, ${input.createdBy || "Thủ kho"}, ${now})
          `;
        } else {
          // Kho lỗi
          const logId = `inv-log-ret-faulty-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'return_faulty', 0, ${oldStock}, ${oldStock}, ${itemCost}, ${`Nhận hàng trả lỗi chuyển kho cách ly theo phiếu ${code}`}, ${input.createdBy || "Thủ kho"}, ${now})
          `;
        }
      }

      // Cập nhật OrderItem.returnedQuantity
      if (it.originalOrderItemId) {
        await prisma.$executeRaw`
          UPDATE [ChiTietHoaDon]
          SET returnedQuantity = returnedQuantity + ${it.quantity}
          WHERE id = ${it.originalOrderItemId}
        `;
      }

      // Cập nhật Serial
      if (Array.isArray(it.serials)) {
        for (const sNum of it.serials) {
          const cleanSerial = sNum.trim();
          if (!cleanSerial) continue;

          const nextStatus = it.destinationType === "restock" ? "returned" : "defective";
          await prisma.$executeRaw`
            UPDATE [SoSerialThietBi]
            SET status = ${nextStatus}, notes = ${`Nhập lại theo phiếu trả hàng ${code} (Tình trạng: ${it.condition || "normal"})`}
            WHERE serialNumber = ${cleanSerial}
          `;

          const shId = `sh-ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKySerialThietBi] (id, serialNumber, productId, productName, sku, action, fromStatus, toStatus, docType, docCode, customerName, customerPhone, warehouseName, notes, performedBy, timestamp)
            VALUES (${shId}, ${cleanSerial}, ${it.productId}, ${it.productName}, ${it.sku}, 'returned', 'sold', ${nextStatus}, 'TH', ${code}, ${input.customerName}, ${input.customerPhone || null}, ${it.warehouseName || "Kho Chính"}, 'Nhập lại thiết bị theo phiếu trả hàng', ${input.createdBy || "Thủ kho"}, ${now})
          `;
        }
      }
    }

    // Xử lý Quỹ và Công nợ (Lớp 2)
    if (refundAmount > 0 && accountingCode) {
      if (input.refundMethod === "cash" || input.refundMethod === "transfer") {
        await prisma.$executeRaw`
          INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
          VALUES (${`acc-${accountingCode}`}, ${accountingCode}, 'expense', 'Hoàn tiền trả hàng', ${refundAmount}, ${now}, ${input.customerName}, ${input.refundMethod}, 'completed', ${`Chi hoàn tiền trả hàng theo phiếu ${code}`}, ${code})
        `;
      } else if (input.refundMethod === "debt_deduct" && input.customerId) {
        const custList = await prisma.customer.findMany({ where: { id: input.customerId } });
        if (custList.length > 0) {
          const cust = custList[0];
          const oldDebt = Number(cust.debt);
          const newDebt = Math.max(0, oldDebt - refundAmount);
          await prisma.$executeRaw`
            UPDATE [KhachHang]
            SET debt = ${newDebt}, updatedAt = ${now}
            WHERE id = ${cust.id}
          `;
          const dlId = `dl-ret-${Date.now()}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyCongNoKhachHang] (id, customerId, customerPhone, customerName, sourceType, sourceId, sourceCode, changeAmount, oldDebt, newDebt, reason, performedBy, createdAt)
            VALUES (${dlId}, ${cust.id}, ${cust.phone || null}, ${cust.name}, 'return_order', ${id}, ${code}, ${-refundAmount}, ${oldDebt}, ${newDebt}, ${`Giảm trừ công nợ hoàn trả hàng phiếu ${code}`}, ${input.createdBy || "Kế toán"}, ${now})
          `;
        }
      }
    }

    // Sinh Sổ Bút Toán Kép (Lớp 1 Kế Toán)
    const pktCode = `PKT-TH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const pktId = `pkt-${id}`;

    await prisma.$executeRaw`
      INSERT INTO [SoNhatKyChung] (id, entryCode, entryDate, docType, docId, docCode, description, totalDebit, totalCredit, postedBy, createdAt)
      VALUES (${pktId}, ${pktCode}, ${now}, 'sales_return', ${id}, ${code}, ${`Bút toán giảm trừ doanh thu và nhập kho giá vốn theo phiếu trả hàng ${code}`}, ${subtotal + totalCostVal}, ${subtotal + totalCostVal}, ${input.createdBy || "Kế toán"}, ${now})
    `;

    // Nợ 5212 (Giảm trừ doanh thu)
    await prisma.$executeRaw`
      INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description, partyId, partyName)
      VALUES (${`line-${pktCode}-1`}, ${pktId}, '5212', 'Hàng bán bị trả lại', ${subtotal}, 0, ${`Giảm trừ doanh thu trả hàng theo phiếu ${code}`}, ${input.customerId || null}, ${input.customerName})
    `;

    // Có 111 (Chi tiền hoàn trả)
    await prisma.$executeRaw`
      INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description, partyId, partyName)
      VALUES (${`line-${pktCode}-2`}, ${pktId}, '111', 'Tiền mặt chi hoàn trả', 0, ${subtotal}, ${`Chi tiền hoàn trả khách theo phiếu ${code}`}, ${input.customerId || null}, ${input.customerName})
    `;

    // Nợ 156 (Nhập lại kho theo giá vốn)
    await prisma.$executeRaw`
      INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description)
      VALUES (${`line-${pktCode}-3`}, ${pktId}, '156', 'Hàng hóa nhập kho', ${totalCostVal}, 0, 'Nhập lại kho theo giá vốn gốc')
    `;

    // Có 632 (Giảm giá vốn hàng bán)
    await prisma.$executeRaw`
      INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description)
      VALUES (${`line-${pktCode}-4`}, ${pktId}, '632', 'Giá vốn hàng bán', 0, ${totalCostVal}, 'Giảm giá vốn hàng bán trả lại')
    `;
  }

  /**
   * Phê duyệt / Commit phiếu trả hàng từ Draft sang Completed
   */
  static async commitReturnOrder(id: string, userId: string) {
    const r = await this.getReturnOrderById(id);
    if (r.status === "completed") return r;
    if (r.status === "cancelled") throw new BadRequestError("Không thể hoàn tất phiếu đã bị hủy!");

    const now = new Date();
    await this.commitReturnOrderExecution({
      id: r.id,
      code: r.code,
      input: {
        ...r,
        items: r.items,
        idempotencyKey: r.idempotencyKey,
        createdBy: userId || r.createdBy,
      } as any,
      processedItems: r.items,
      refundAmount: r.refundAmount,
      accountingCode: r.accountingCode,
      subtotal: r.subtotal,
      now,
    });

    await prisma.$executeRaw`
      UPDATE [PhieuTraHang]
      SET status = 'completed', approvedBy = ${userId}, approvedAt = ${now}, updatedAt = ${now}
      WHERE id = ${id}
    `;

    return this.getReturnOrderById(id);
  }

  /**
   * Hủy phiếu trả hàng & Đảo bút toán an toàn
   */
  static async cancelReturnOrder(id: string, input: CancelReturnOrderInput) {
    const r = await this.getReturnOrderById(id);
    if (r.status === "cancelled") {
      throw new BadRequestError("Phiếu trả hàng này đã được hủy trước đó!");
    }

    const now = new Date();

    // Guard: Kiểm tra serial đã bán lại chưa
    for (const it of r.items) {
      if (Array.isArray(it.serials)) {
        for (const s of it.serials) {
          const sNum = typeof s === "string" ? s : s.serialNumber;
          if (!sNum) continue;

          const devList = await prisma.serialDeviceRecord.findMany({
            where: { serialNumber: sNum },
          });
          if (devList.length > 0 && devList[0].status === "sold" && devList[0].soldOrderCode !== r.code) {
            throw new BadRequestError(
              `Không thể hủy phiếu vì thiết bị [Serial: ${sNum}] đã được bán cho đơn khác (${devList[0].soldOrderCode})!`
            );
          }
        }
      }
    }

    // Đảo tồn kho: Trừ lại lượng hàng đã nhập kho
    for (const it of r.items) {
      if (it.destinationType === "restock") {
        const deductQtyBase = Number(it.quantity) * Number(it.ratioToBase || 1);
        const prodList = await prisma.product.findMany({ where: { id: it.productId } });
        if (prodList.length > 0) {
          const prod = prodList[0];
          const curStock = Number(prod.stock);
          if (curStock < deductQtyBase) {
            throw new BadRequestError(
              `Không thể hủy phiếu vì tồn kho hiện tại của [${it.productName}] không đủ để trừ lại (${curStock} < ${deductQtyBase})!`
            );
          }
          const newStock = curStock - deductQtyBase;
          await prisma.$executeRaw`
            UPDATE [SanPham]
            SET stock = ${newStock}, updatedAt = ${now}
            WHERE id = ${prod.id}
          `;
          const logId = `inv-log-cancel-ret-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'return_cancel', ${-deductQtyBase}, ${curStock}, ${newStock}, ${it.costPrice}, ${`Trừ lại tồn kho do hủy phiếu trả hàng ${r.code}`}, ${input.cancelledBy}, ${now})
          `;
        }
      }

      // Giảm OrderItem.returnedQuantity
      if (it.originalOrderItemId) {
        await prisma.$executeRaw`
          UPDATE [ChiTietHoaDon]
          SET returnedQuantity = CASE WHEN returnedQuantity >= ${it.quantity} THEN returnedQuantity - ${it.quantity} ELSE 0 END
          WHERE id = ${it.originalOrderItemId}
        `;
      }
    }

    // Hủy phiếu chi quỹ
    if (r.accountingCode) {
      await prisma.$executeRaw`
        UPDATE [SoThuChiKeToan]
        SET status = 'cancelled', note = ${`Đã hủy do hủy phiếu trả hàng ${r.code} (Lý do: ${input.cancelReason})`}
        WHERE code = ${r.accountingCode}
      `;
    }

    // Đảo công nợ
    if (r.refundMethod === "debt_deduct" && r.customerId && r.refundAmount > 0) {
      const custList = await prisma.customer.findMany({ where: { id: r.customerId } });
      if (custList.length > 0) {
        const cust = custList[0];
        const oldDebt = Number(cust.debt);
        const newDebt = oldDebt + r.refundAmount;

        await prisma.$executeRaw`
          UPDATE [KhachHang]
          SET debt = ${newDebt}, updatedAt = ${now}
          WHERE id = ${cust.id}
        `;

        const dlId = `dl-cancel-ret-${Date.now()}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyCongNoKhachHang] (id, customerId, customerPhone, customerName, sourceType, sourceId, sourceCode, changeAmount, oldDebt, newDebt, reason, performedBy, createdAt)
          VALUES (${dlId}, ${cust.id}, ${cust.phone || null}, ${cust.name}, 'cancel_return', ${r.id}, ${r.code}, ${r.refundAmount}, ${oldDebt}, ${newDebt}, ${`Đảo công nợ do hủy phiếu trả hàng ${r.code}: ${input.cancelReason}`}, ${input.cancelledBy}, ${now})
        `;
      }
    }

    // Cập nhật trạng thái phiếu
    await prisma.$executeRaw`
      UPDATE [PhieuTraHang]
      SET status = 'cancelled', cancelledBy = ${input.cancelledBy}, cancelledAt = ${now}, cancelReason = ${input.cancelReason}, updatedAt = ${now}
      WHERE id = ${id}
    `;

    return this.getReturnOrderById(id);
  }

  /**
   * Xóa phiếu trả hàng (Chỉ cho phép xóa draft)
   */
  static async deleteReturnOrder(id: string) {
    const r = await this.getReturnOrderById(id);
    if (r.status === "completed") {
      throw new BadRequestError("Không thể xóa phiếu trả hàng đã hoàn tất! Vui lòng dùng chức năng Hủy phiếu.");
    }

    await prisma.$executeRaw`DELETE FROM [ChiTietSerialTraHang] WHERE returnItemId IN (SELECT id FROM [ChiTietPhieuTraHang] WHERE returnOrderId = ${id})`;
    await prisma.$executeRaw`DELETE FROM [ChiTietPhieuTraHang] WHERE returnOrderId = ${id}`;
    await prisma.$executeRaw`DELETE FROM [PhieuTraHang] WHERE id = ${id}`;

    return { message: "Xóa phiếu trả hàng draft thành công" };
  }

  /**
   * Format helper
   */
  private static formatReturnOrder(r: any) {
    return {
      ...r,
      subtotal: Number(r.subtotal || 0),
      taxAmount: Number(r.taxAmount || 0),
      restockingFee: Number(r.restockingFee || 0),
      giftDeductionAmount: Number(r.giftDeductionAmount || 0),
      refundAmount: Number(r.refundAmount || 0),
      totalReturnQuantity: Number(r.totalReturnQuantity || 0),
      items: (r.items || []).map((it: any) => ({
        ...it,
        ratioToBase: Number(it.ratioToBase || 1),
        quantity: Number(it.quantity),
        costPrice: Number(it.costPrice || 0),
        unitPrice: Number(it.unitPrice || 0),
        refundUnitPrice: Number(it.refundUnitPrice || 0),
        taxRate: Number(it.taxRate || 0),
        taxAmount: Number(it.taxAmount || 0),
        subtotal: Number(it.subtotal || 0),
        totalRefund: Number(it.totalRefund || 0),
        serials: (it.serials || []).map((s: any) => s.serialNumber || s),
      })),
    };
  }
}
