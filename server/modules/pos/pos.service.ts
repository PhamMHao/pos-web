import prisma from "../../config/db";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError";
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderQueryInput,
  OpenShiftInput,
  CloseShiftInput,
} from "./pos.schema";
import { Prisma } from "@prisma/client";

export class PosService {
  static async createOrder(input: CreateOrderInput) {
    const code = input.code || `DH-${Date.now().toString().slice(-6)}`;
    const { items, ...orderData } = input;
    const id = `order-${Date.now()}`;
    const dt = new Date();

    // 1. Create Order
    await prisma.$executeRaw`
      INSERT INTO [HoaDon] (id, code, channel, status, customerId, customerName, customerPhone, customerAddress, customerRank, subtotal, discountAmount, discountCode, taxRate, taxAmount, shippingFee, shippingPartner, trackingCode, total, totalCost, profit, paymentMethod, paymentStatus, paidAmount, changeAmount, note, shiftId, createdAt, completedAt)
      VALUES (${id}, ${code}, ${orderData.channel}, ${orderData.status}, ${orderData.customerId || null}, ${orderData.customerName || null}, ${orderData.customerPhone || null}, ${orderData.customerAddress || null}, ${orderData.customerRank || null}, ${orderData.subtotal}, ${orderData.discountAmount || 0}, ${orderData.discountCode || null}, ${orderData.taxRate || 0}, ${orderData.taxAmount || 0}, ${orderData.shippingFee || 0}, ${orderData.shippingPartner || null}, ${orderData.trackingCode || null}, ${orderData.total}, ${orderData.totalCost || 0}, ${orderData.profit || 0}, ${orderData.paymentMethod}, ${orderData.paymentStatus}, ${orderData.paidAmount || orderData.total}, ${orderData.changeAmount || 0}, ${orderData.note || null}, ${orderData.shiftId || null}, ${dt}, ${dt})
    `;

    // 2. Create Order Items & Deduct stock
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemId = `order-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietHoaDon] (id, orderId, productId, productName, sku, unit, ratioToBase, quantity, unitPrice, costPrice, discountPercent, total)
        VALUES (${itemId}, ${id}, ${item.productId}, ${item.productName}, ${item.sku}, ${item.unit}, ${item.ratioToBase}, ${item.quantity}, ${item.unitPrice}, ${item.costPrice}, ${item.discountPercent || 0}, ${item.total})
      `;

      // Deduct stock
      const products = await prisma.product.findMany({ where: { id: item.productId } });
      if (products.length > 0) {
        const prod = products[0];
        const deductQty = Number(item.quantity) * Number(item.ratioToBase);
        const oldStock = Number(prod.stock);
        const newStock = Math.max(0, oldStock - deductQty);

        await prisma.product.updateMany({
          where: { id: item.productId },
          data: { stock: new Prisma.Decimal(newStock) },
        });

        const logId = `inv-log-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
          VALUES (${logId}, ${item.productId}, ${item.productName}, ${item.sku}, 'sale_deduct', ${-deductQty}, ${oldStock}, ${newStock}, ${`Bán lẻ qua đơn hàng ${code} (${item.quantity} ${item.unit})`}, 'Thu ngân POS', ${dt})
        `;
      }

      // Auto create/update SerialDeviceRecord for Warranty tracking
      const serialNum = (item as any).serialNumber || (item as any).serial || (item.sku ? `SN-${item.sku.toUpperCase()}-${code.slice(-4)}${idx + 1}` : null);
      const warrantyMonths = Number((item as any).warrantyMonths || 12);
      const expiryDate = new Date(dt);
      expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

      if (serialNum) {
        const cleanSerial = serialNum.trim();
        const existingDevices = await prisma.serialDeviceRecord.findMany({
          where: { serialNumber: cleanSerial },
        });

        if (existingDevices.length > 0) {
          await prisma.serialDeviceRecord.updateMany({
            where: { serialNumber: cleanSerial },
            data: {
              soldOrderCode: code,
              soldDate: dt,
              customerName: orderData.customerName || "Khách lẻ",
              customerPhone: orderData.customerPhone || null,
              warrantyPeriodMonths: warrantyMonths,
              warrantyExpiryDate: expiryDate,
              warrantyStatus: "valid",
            },
          });
        } else {
          const devId = `dev-pos-${Date.now()}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [SoSerialThietBi] (id, serialNumber, productName, sku, soldOrderCode, soldDate, customerName, customerPhone, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
            VALUES (${devId}, ${cleanSerial}, ${item.productName}, ${item.sku}, ${code}, ${dt}, ${orderData.customerName || "Khách lẻ"}, ${orderData.customerPhone || null}, ${warrantyMonths}, ${expiryDate}, 'valid', 0, 0, ${`Tự động kích hoạt từ đơn hàng POS ${code}`})
          `;
        }
      }
    }

    // 3. Update Customer stats
    if (orderData.customerId) {
      const customers = await prisma.customer.findMany({ where: { id: orderData.customerId } });
      if (customers.length > 0) {
        const cust = customers[0];
        const addedPoints = Math.floor(orderData.total / 100000);
        const newTotalSpent = Number(cust.totalSpent) + orderData.total;
        let newTier = cust.tier;
        if (newTotalSpent >= 50000000) newTier = "Kim Cương";
        else if (newTotalSpent >= 20000000) newTier = "Vàng";
        else if (newTotalSpent >= 5000000) newTier = "Bạc";

        let newDebt = Number(cust.debt);
        if (orderData.paymentMethod === "debt") {
          newDebt += orderData.total;
        }

        await prisma.customer.updateMany({
          where: { id: orderData.customerId },
          data: {
            totalOrders: cust.totalOrders + 1,
            totalSpent: new Prisma.Decimal(newTotalSpent),
            points: new Prisma.Decimal(Number(cust.points) + addedPoints),
            tier: newTier,
            debt: new Prisma.Decimal(newDebt),
          },
        });
      }
    }

    // 4. Update Shift
    if (orderData.shiftId) {
      const shifts = await prisma.cashShift.findMany({ where: { id: orderData.shiftId } });
      if (shifts.length > 0 && shifts[0].status === "open") {
        const shift = shifts[0];
        const amount = orderData.total;
        const updateData: any = {
          totalSales: new Prisma.Decimal(Number(shift.totalSales) + amount),
        };

        if (orderData.paymentMethod === "cash") {
          updateData.cashSales = new Prisma.Decimal(Number(shift.cashSales) + amount);
          updateData.expectedEndingCash = new Prisma.Decimal(
            Number(shift.expectedEndingCash) + amount
          );
        } else if (orderData.paymentMethod === "transfer" || orderData.paymentMethod === "momo") {
          updateData.transferSales = new Prisma.Decimal(Number(shift.transferSales) + amount);
        } else if (orderData.paymentMethod === "card") {
          updateData.cardSales = new Prisma.Decimal(Number(shift.cardSales) + amount);
        } else {
          updateData.otherSales = new Prisma.Decimal(Number(shift.otherSales) + amount);
        }

        await prisma.cashShift.updateMany({
          where: { id: orderData.shiftId },
          data: updateData,
        });
      }
    }

    return this.getOrderById(id);
  }

  static async getOrders(query: OrderQueryInput) {
    const {
      search,
      status,
      paymentMethod,
      paymentStatus,
      shiftId,
      customerId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { customerName: { contains: term } },
        { customerPhone: { contains: term } },
      ];
    }

    if (status && status !== "all" && status !== "Tất cả") {
      where.status = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }

    if (shiftId) {
      where.shiftId = shiftId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const allItems = await prisma.order.findMany({
      where,
      include: {
        items: true,
        customer: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if (sortBy === "total") {
        return sortOrder === "asc"
          ? Number(a.total) - Number(b.total)
          : Number(b.total) - Number(a.total);
      }
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discountAmount),
      taxRate: Number(o.taxRate),
      taxAmount: Number(o.taxAmount),
      shippingFee: Number(o.shippingFee),
      total: Number(o.total),
      totalCost: Number(o.totalCost),
      profit: Number(o.profit),
      paidAmount: Number(o.paidAmount),
      changeAmount: Number(o.changeAmount),
      items: (o.items || []).map((i) => ({
        ...i,
        ratioToBase: Number(i.ratioToBase),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        costPrice: Number(i.costPrice),
        discountPercent: Number(i.discountPercent),
        total: Number(i.total),
      })),
      customer: o.customer
        ? {
            ...o.customer,
            points: Number(o.customer.points),
            totalSpent: Number(o.customer.totalSpent),
            debt: Number(o.customer.debt),
          }
        : null,
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

  static async getOrderById(id: string) {
    const items = await prisma.order.findMany({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    const order = items[0];
    if (!order) {
      throw new NotFoundError(`Không tìm thấy đơn hàng với ID: ${id}`);
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      taxRate: Number(order.taxRate),
      taxAmount: Number(order.taxAmount),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      totalCost: Number(order.totalCost),
      profit: Number(order.profit),
      paidAmount: Number(order.paidAmount),
      changeAmount: Number(order.changeAmount),
      items: (order.items || []).map((i) => ({
        ...i,
        ratioToBase: Number(i.ratioToBase),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        costPrice: Number(i.costPrice),
        discountPercent: Number(i.discountPercent),
        total: Number(i.total),
      })),
      customer: order.customer
        ? {
            ...order.customer,
            points: Number(order.customer.points),
            totalSpent: Number(order.customer.totalSpent),
            debt: Number(order.customer.debt),
          }
        : null,
    };
  }

  static async updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
    const existing = await this.getOrderById(id);

    if (
      existing.status === "completed" &&
      (input.status === "cancelled" || input.status === "refunded")
    ) {
      for (const item of existing.items) {
        const products = await prisma.product.findMany({
          where: { id: item.productId },
        });
        if (products.length > 0) {
          const product = products[0];
          const restoreQty = Number(item.quantity) * Number(item.ratioToBase);
          const oldStock = Number(product.stock);
          const newStock = oldStock + restoreQty;

          await prisma.product.updateMany({
            where: { id: item.productId },
            data: { stock: new Prisma.Decimal(newStock) },
          });

          const logId = `inv-log-${Date.now()}-${item.id}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
            VALUES (${logId}, ${item.productId}, ${item.productName}, ${item.sku}, 'return_restock', ${restoreQty}, ${oldStock}, ${newStock}, ${`Hoàn trả tồn kho do đơn hàng ${existing.code} bị ${input.status === "cancelled" ? "hủy" : "trả hàng"}`}, 'Hệ thống POS', ${new Date()})
          `;
        }
      }
    }

    await prisma.order.updateMany({
      where: { id },
      data: {
        status: input.status,
        paymentStatus: input.paymentStatus || existing.paymentStatus,
        note: input.note ? `${existing.note || ""}[QuyDoiDonViTinh][Cập nhật]: ${input.note}` : existing.note,
      },
    });

    return this.getOrderById(id);
  }

  // --- CASH SHIFT MANAGEMENT ---
  static async openShift(input: OpenShiftInput) {
    const openShifts = await prisma.cashShift.findMany({
      where: { status: "open" },
    });

    if (openShifts.length > 0) {
      const existingOpen = openShifts[0];
      throw new BadRequestError(
        `Hiện đang có ca làm việc "${existingOpen.shiftName}" của nhân viên "${existingOpen.staffName}" chưa đóng. Vui lòng kết ca trước khi mở ca mới.`
      );
    }

    const id = `shift-${Date.now()}`;
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [CaBanHang] (id, shiftName, staffId, staffName, startTime, initialCash, cashSales, transferSales, cardSales, otherSales, totalSales, cashWithdrawals, expectedEndingCash, status, note)
      VALUES (${id}, ${input.shiftName}, ${input.staffId || null}, ${input.staffName}, ${dt}, ${input.initialCash}, 0, 0, 0, 0, 0, 0, ${input.initialCash}, 'open', ${input.note || null})
    `;

    const shifts = await prisma.cashShift.findMany({ where: { id } });
    const created = shifts[0];

    return {
      ...created,
      initialCash: Number(created.initialCash),
      cashSales: Number(created.cashSales),
      transferSales: Number(created.transferSales),
      cardSales: Number(created.cardSales),
      otherSales: Number(created.otherSales),
      totalSales: Number(created.totalSales),
      cashWithdrawals: Number(created.cashWithdrawals),
      expectedEndingCash: Number(created.expectedEndingCash),
      actualEndingCash: created.actualEndingCash ? Number(created.actualEndingCash) : null,
    };
  }

  static async closeShift(id: string, input: CloseShiftInput) {
    const shifts = await prisma.cashShift.findMany({
      where: { id },
    });

    if (shifts.length === 0) {
      throw new NotFoundError("Không tìm thấy ca làm việc");
    }

    const shift = shifts[0];
    if (shift.status === "closed") {
      throw new BadRequestError("Ca làm việc này đã được kết thúc trước đó");
    }

    await prisma.cashShift.updateMany({
      where: { id },
      data: {
        actualEndingCash: new Prisma.Decimal(input.actualEndingCash),
        note: input.note ? `${shift.note || ""}[QuyDoiDonViTinh][Kết ca]: ${input.note}` : shift.note,
        endTime: new Date(),
        status: "closed",
      },
    });

    const updatedShifts = await prisma.cashShift.findMany({ where: { id } });
    const updated = updatedShifts[0];

    return {
      ...updated,
      initialCash: Number(updated.initialCash),
      cashSales: Number(updated.cashSales),
      transferSales: Number(updated.transferSales),
      cardSales: Number(updated.cardSales),
      otherSales: Number(updated.otherSales),
      totalSales: Number(updated.totalSales),
      cashWithdrawals: Number(updated.cashWithdrawals),
      expectedEndingCash: Number(updated.expectedEndingCash),
      actualEndingCash: Number(updated.actualEndingCash),
    };
  }

  static async getCurrentShift() {
    const shifts = await prisma.cashShift.findMany({
      where: { status: "open" },
    });

    if (shifts.length === 0) {
      return null;
    }

    // Sort by startTime desc
    shifts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const current = shifts[0];

    return {
      ...current,
      initialCash: Number(current.initialCash),
      cashSales: Number(current.cashSales),
      transferSales: Number(current.transferSales),
      cardSales: Number(current.cardSales),
      otherSales: Number(current.otherSales),
      totalSales: Number(current.totalSales),
      cashWithdrawals: Number(current.cashWithdrawals),
      expectedEndingCash: Number(current.expectedEndingCash),
      actualEndingCash: current.actualEndingCash ? Number(current.actualEndingCash) : null,
    };
  }

  static async getShiftHistory(limit = 30) {
    const shifts = await prisma.cashShift.findMany();
    shifts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const limited = shifts.slice(0, limit);

    return limited.map((s) => ({
      ...s,
      initialCash: Number(s.initialCash),
      cashSales: Number(s.cashSales),
      transferSales: Number(s.transferSales),
      cardSales: Number(s.cardSales),
      otherSales: Number(s.otherSales),
      totalSales: Number(s.totalSales),
      cashWithdrawals: Number(s.cashWithdrawals),
      expectedEndingCash: Number(s.expectedEndingCash),
      actualEndingCash: s.actualEndingCash ? Number(s.actualEndingCash) : null,
    }));
  }
}
