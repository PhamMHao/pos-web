import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateWarrantyTicketInput,
  UpdateWarrantyTicketInput,
  WarrantyTicketQueryInput,
  CreateSerialDeviceRecordInput,
  SerialDeviceQueryInput,
} from "./warranties.schema";
import { Prisma } from "@prisma/client";

export class WarrantiesService {
  static async createWarrantyTicket(input: CreateWarrantyTicketInput) {
    const code =
      input.code ||
      `BH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const { parts = [], timeline = [], ...ticketData } = input;
    const id = `warranty-${Date.now()}`;
    const recDt = ticketData.receivedDate ? new Date(ticketData.receivedDate) : new Date();
    const expDt = new Date(ticketData.expectedReturnDate);
    const actDt = ticketData.actualReturnDate ? new Date(ticketData.actualReturnDate) : null;
    const dt = new Date();

    await prisma.$executeRaw`
      INSERT INTO [PhieuBaoHanh] (id, code, type, priority, status, orderCode, productId, productName, model, serialNumber, qrCodeUrl, customerName, customerPhone, customerAddress, customerEmail, accessoriesIncluded, cosmeticCondition, issueDescription, technicianDiagnosis, resolution, technicianName, receivedDate, expectedReturnDate, actualReturnDate, laborCost, partsCost, discountAmount, totalFee, paymentStatus, paidAmount, returnedToPerson, returnNote, warrantyExtensionMonths)
      VALUES (${id}, ${code}, ${ticketData.type}, ${ticketData.priority}, ${ticketData.status || "received"}, ${ticketData.orderCode || null}, ${ticketData.productId || null}, ${ticketData.productName}, ${ticketData.model || null}, ${ticketData.serialNumber}, ${ticketData.qrCodeUrl || null}, ${ticketData.customerName}, ${ticketData.customerPhone}, ${ticketData.customerAddress || null}, ${ticketData.customerEmail || null}, ${ticketData.accessoriesIncluded || null}, ${ticketData.cosmeticCondition || null}, ${ticketData.issueDescription}, ${ticketData.technicianDiagnosis || null}, ${ticketData.resolution || null}, ${ticketData.technicianName}, ${recDt}, ${expDt}, ${actDt}, ${ticketData.laborCost}, ${ticketData.partsCost}, ${ticketData.discountAmount}, ${ticketData.totalFee}, ${ticketData.paymentStatus}, ${ticketData.paidAmount}, ${ticketData.returnedToPerson || null}, ${ticketData.returnNote || null}, ${ticketData.warrantyExtensionMonths || 0})
    `;

    for (let idx = 0; idx < parts.length; idx++) {
      const p = parts[idx];
      const partId = `w-part-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [LinhKienBaoHanh] (id, warrantyId, partName, sku, quantity, unit, unitPrice, isUnderWarranty, warrantyMonths)
        VALUES (${partId}, ${id}, ${p.partName}, ${p.sku || null}, ${p.quantity}, ${p.unit}, ${p.unitPrice}, ${p.isUnderWarranty ? 1 : 0}, ${p.warrantyMonths})
      `;
    }

    const tEvents = timeline.length > 0 ? timeline : [
      {
        action: "Tiếp nhận thiết bị & kiểm tra sơ bộ",
        actor: ticketData.technicianName,
        notes: ticketData.issueDescription,
        status: "received",
        timestamp: new Date(),
      },
    ];

    for (let idx = 0; idx < tEvents.length; idx++) {
      const t = tEvents[idx];
      const tId = `w-tl-${Date.now()}-${idx}`;
      const tTime = t.timestamp ? new Date(t.timestamp) : new Date();
      await prisma.$executeRaw`
        INSERT INTO [NhatKyBaoHanh] (id, warrantyId, action, actor, timestamp, notes, status)
        VALUES (${tId}, ${id}, ${t.action}, ${t.actor}, ${tTime}, ${t.notes || null}, ${t.status})
      `;
    }

    // Auto register/update SerialDeviceRecord
    const cleanSerial = ticketData.serialNumber.trim();
    const existingDevices = await prisma.serialDeviceRecord.findMany({
      where: { serialNumber: cleanSerial },
    });

    if (existingDevices.length > 0) {
      const existingDevice = existingDevices[0];
      await prisma.serialDeviceRecord.updateMany({
        where: { serialNumber: cleanSerial },
        data: {
          totalRepairsCount:
            ticketData.type === "repair"
              ? existingDevice.totalRepairsCount + 1
              : existingDevice.totalRepairsCount,
          totalMaintenancesCount:
            ticketData.type === "maintenance"
              ? existingDevice.totalMaintenancesCount + 1
              : existingDevice.totalMaintenancesCount,
        },
      });
    } else {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const devId = `dev-${Date.now()}`;

      await prisma.$executeRaw`
        INSERT INTO [SoSerialThietBi] (id, serialNumber, productName, sku, soldOrderCode, soldDate, customerName, customerPhone, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
        VALUES (${devId}, ${cleanSerial}, ${ticketData.productName}, ${ticketData.model || "SKU-DEVICE"}, ${ticketData.orderCode || null}, ${dt}, ${ticketData.customerName}, ${ticketData.customerPhone}, 12, ${expiryDate}, 'valid', ${ticketData.type === "repair" ? 1 : 0}, ${ticketData.type === "maintenance" ? 1 : 0}, ${`Tự động tạo từ phiếu bảo hành ${code}`})
      `;
    }

    return this.getWarrantyTicketById(id);
  }

  static async getWarrantyTickets(query: WarrantyTicketQueryInput) {
    const {
      search,
      status,
      type,
      priority,
      page = 1,
      limit = 50,
      sortBy = "receivedDate",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.WarrantyTicketWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { serialNumber: { contains: term } },
        { customerName: { contains: term } },
        { customerPhone: { contains: term } },
        { productName: { contains: term } },
      ];
    }

    if (status && status !== "all" && status !== "Tất cả") {
      where.status = status;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (priority && priority !== "all") {
      where.priority = priority;
    }

    const allItems = await prisma.warrantyTicket.findMany({
      where,
      include: {
        parts: true,
        timeline: true,
      },
    });

    // In-memory sort
    allItems.sort((a, b) => {
      if ((sortBy as string) === "totalFee") {
        return sortOrder === "asc"
          ? Number(a.totalFee) - Number(b.totalFee)
          : Number(b.totalFee) - Number(a.totalFee);
      }
      return sortOrder === "asc"
        ? new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime()
        : new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((t) => ({
      ...t,
      laborCost: Number(t.laborCost),
      partsCost: Number(t.partsCost),
      discountAmount: Number(t.discountAmount),
      totalFee: Number(t.totalFee),
      paidAmount: Number(t.paidAmount),
      parts: (t.parts || []).map((p) => ({
        ...p,
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
      })),
      timeline: (t.timeline || []).sort(
        (x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime()
      ),
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

  static async getWarrantyTicketById(id: string) {
    const items = await prisma.warrantyTicket.findMany({
      where: { id },
      include: {
        parts: true,
        timeline: true,
      },
    });

    const ticket = items[0];
    if (!ticket) {
      throw new NotFoundError(`Không tìm thấy phiếu bảo hành ID: ${id}`);
    }

    return {
      ...ticket,
      laborCost: Number(ticket.laborCost),
      partsCost: Number(ticket.partsCost),
      discountAmount: Number(ticket.discountAmount),
      totalFee: Number(ticket.totalFee),
      paidAmount: Number(ticket.paidAmount),
      parts: (ticket.parts || []).map((p) => ({
        ...p,
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice),
      })),
      timeline: (ticket.timeline || []).sort(
        (x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime()
      ),
    };
  }

  static async updateWarrantyTicket(id: string, input: UpdateWarrantyTicketInput) {
    const existing = await this.getWarrantyTicketById(id);
    const { parts, timeline, ...ticketData } = input;

    const updateData: any = {};
    if (ticketData.status && ticketData.status !== existing.status) {
      updateData.status = ticketData.status;
      const tId = `w-tl-${Date.now()}`;
      await prisma.$executeRaw`
        INSERT INTO [NhatKyBaoHanh] (id, warrantyId, action, actor, timestamp, notes, status)
        VALUES (${tId}, ${id}, ${`Chuyển trạng thái sang: ${ticketData.status}`}, ${ticketData.technicianName || existing.technicianName}, ${new Date()}, ${ticketData.resolution || null}, ${ticketData.status})
      `;
    }

    if (ticketData.technicianDiagnosis !== undefined) updateData.technicianDiagnosis = ticketData.technicianDiagnosis;
    if (ticketData.resolution !== undefined) updateData.resolution = ticketData.resolution;
    if (ticketData.laborCost !== undefined) updateData.laborCost = new Prisma.Decimal(ticketData.laborCost);
    if (ticketData.partsCost !== undefined) updateData.partsCost = new Prisma.Decimal(ticketData.partsCost);
    if (ticketData.discountAmount !== undefined) updateData.discountAmount = new Prisma.Decimal(ticketData.discountAmount);
    if (ticketData.totalFee !== undefined) updateData.totalFee = new Prisma.Decimal(ticketData.totalFee);
    if (ticketData.paymentStatus) updateData.paymentStatus = ticketData.paymentStatus;
    if (ticketData.paidAmount !== undefined) updateData.paidAmount = new Prisma.Decimal(ticketData.paidAmount);
    if (ticketData.actualReturnDate) updateData.actualReturnDate = new Date(ticketData.actualReturnDate);
    if (ticketData.returnedToPerson !== undefined) updateData.returnedToPerson = ticketData.returnedToPerson;
    if (ticketData.returnNote !== undefined) updateData.returnNote = ticketData.returnNote;

    await prisma.warrantyTicket.updateMany({
      where: { id },
      data: updateData,
    });

    return this.getWarrantyTicketById(id);
  }

  static async deleteWarrantyTicket(id: string) {
    await this.getWarrantyTicketById(id);
    await prisma.warrantyPartItem.deleteMany({ where: { warrantyId: id } });
    await prisma.warrantyTimelineEvent.deleteMany({ where: { warrantyId: id } });
    await prisma.warrantyTicket.deleteMany({
      where: { id },
    });
    return { message: "Xóa phiếu bảo hành thành công" };
  }

  // --- SERIAL DEVICES ---
  static async getSerialDevices(query: SerialDeviceQueryInput) {
    const { search, warrantyStatus, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.SerialDeviceRecordWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { serialNumber: { contains: term } },
        { productName: { contains: term } },
        { sku: { contains: term } },
        { customerPhone: { contains: term } },
        { customerName: { contains: term } },
      ];
    }

    if (warrantyStatus && warrantyStatus !== "all") {
      where.warrantyStatus = warrantyStatus;
    }

    const allItems = await prisma.serialDeviceRecord.findMany({ where });

    // In-memory sort
    allItems.sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  static async getSerialDeviceByCode(serialNumber: string) {
    const clean = serialNumber.trim();
    const items = await prisma.serialDeviceRecord.findMany({
      where: { serialNumber: clean },
    });

    const device = items[0];
    if (!device) {
      throw new NotFoundError(`Không tìm thấy thông tin thiết bị với Serial: ${clean}`);
    }

    const tickets = await prisma.warrantyTicket.findMany({
      where: { serialNumber: clean },
      include: { parts: true, timeline: true },
    });

    tickets.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());

    return {
      ...device,
      tickets: tickets.map((t) => ({
        ...t,
        laborCost: Number(t.laborCost),
        partsCost: Number(t.partsCost),
        discountAmount: Number(t.discountAmount),
        totalFee: Number(t.totalFee),
        paidAmount: Number(t.paidAmount),
      })),
    };
  }

  static async createOrUpdateSerialDevice(input: CreateSerialDeviceRecordInput) {
    const cleanSerial = input.serialNumber.trim();
    const existing = await prisma.serialDeviceRecord.findMany({
      where: { serialNumber: cleanSerial },
    });

    if (existing.length > 0) {
      await prisma.serialDeviceRecord.updateMany({
        where: { serialNumber: cleanSerial },
        data: {
          productName: input.productName,
          sku: input.sku,
          soldOrderCode: input.soldOrderCode || undefined,
          soldDate: input.soldDate ? new Date(input.soldDate) : undefined,
          customerName: input.customerName || undefined,
          customerPhone: input.customerPhone || undefined,
          warrantyPeriodMonths: input.warrantyPeriodMonths || undefined,
          warrantyExpiryDate: input.warrantyExpiryDate ? new Date(input.warrantyExpiryDate) : undefined,
          warrantyStatus: input.warrantyStatus || undefined,
          totalRepairsCount: input.totalRepairsCount || undefined,
          totalMaintenancesCount: input.totalMaintenancesCount || undefined,
          notes: input.notes || undefined,
        },
      });
    } else {
      const devId = `dev-${Date.now()}`;
      const sDate = input.soldDate ? new Date(input.soldDate) : new Date();
      const eDate = new Date(input.warrantyExpiryDate);
      const dt = new Date();

      await prisma.$executeRaw`
        INSERT INTO [SoSerialThietBi] (id, serialNumber, productName, sku, soldOrderCode, soldDate, customerName, customerPhone, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
        VALUES (${devId}, ${cleanSerial}, ${input.productName}, ${input.sku}, ${input.soldOrderCode || null}, ${sDate}, ${input.customerName || null}, ${input.customerPhone || null}, ${input.warrantyPeriodMonths || 12}, ${eDate}, ${input.warrantyStatus || "valid"}, ${input.totalRepairsCount || 0}, ${input.totalMaintenancesCount || 0}, ${input.notes || null})
      `;
    }

    const results = await prisma.serialDeviceRecord.findMany({
      where: { serialNumber: cleanSerial },
    });
    return results[0];
  }
}
