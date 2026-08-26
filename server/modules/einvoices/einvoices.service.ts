import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateEInvoiceInput,
  EInvoiceQueryInput,
} from "./einvoices.schema";

export class EInvoicesService {
  static async createInvoice(input: CreateEInvoiceInput) {
    const nextCount = (await prisma.eInvoice.count()) + 1;
    const invNumStr = String(nextCount).padStart(8, "0");
    const symbol = input.invoiceSymbol || "1C26TGP";
    const invoiceNumber = input.invoiceNumber || invNumStr;
    const invoiceCode = input.invoiceCode || `${symbol}-${invoiceNumber}`;
    const lookupCode =
      input.lookupCode ||
      Math.random().toString(36).substring(2, 10).toUpperCase();

    const sellerDataStr =
      typeof input.sellerData === "string"
        ? input.sellerData
        : JSON.stringify(input.sellerData);
    const buyerDataStr =
      typeof input.buyerData === "string"
        ? input.buyerData
        : JSON.stringify(input.buyerData);

    const digitalSignature = JSON.stringify({
      signedBy: "CÔNG TY TNHH GIẢI PHÁP GP-ERP ENTERPRISE",
      signerTaxCode: "0109998888",
      signTime: new Date().toISOString(),
      certificateSerial: "5404B67F993A11EC8B9E",
      status: "VALID_CERTIFICATE",
    });

    const id = `inv-${Date.now()}`;
    const iDate = input.issueDate ? new Date(input.issueDate) : new Date();
    const sDate = new Date();

    await prisma.$executeRaw`
      INSERT INTO [HoaDonDienTu] (id, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, invoiceType, cqtCode, lookupCode, lookupUrl, issueDate, signDate, status, orderId, orderCode, sellerData, buyerData, subtotal, discountAmount, taxRate, taxAmount, totalAmount, amountInWords, paymentMethod, notes, digitalSignature, cqtStatusMessage)
      VALUES (${id}, ${invoiceCode}, ${invoiceNumber}, ${symbol}, ${input.invoiceTemplate || "1/001"}, ${input.invoiceType || "vat"}, ${input.cqtCode || `CQT-${Date.now().toString().slice(-8)}`}, ${lookupCode}, ${input.lookupUrl || "https://hoadondientu.gdt.gov.vn"}, ${iDate}, ${sDate}, ${input.status || "signed"}, ${input.orderId || null}, ${input.orderCode || null}, ${sellerDataStr}, ${buyerDataStr}, ${input.subtotal}, ${input.discountAmount || 0}, ${input.taxRate}, ${input.taxAmount}, ${input.totalAmount}, ${input.amountInWords}, ${input.paymentMethod || "TM/CK"}, ${input.notes || null}, ${digitalSignature}, N'CQT đã cấp mã hóa đơn thành công')
    `;

    for (let idx = 0; idx < input.items.length; idx++) {
      const item = input.items[idx];
      const itemId = `inv-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietHoaDonDienTu] (id, invoiceId, sku, productName, unit, quantity, unitPrice, subtotal, discountPercent, discountAmount, taxRate, taxAmount, total)
        VALUES (${itemId}, ${id}, ${item.sku}, ${item.productName}, ${item.unit}, ${item.quantity}, ${item.unitPrice}, ${item.subtotal}, ${item.discountPercent || 0}, ${item.discountAmount || 0}, ${item.taxRate}, ${item.taxAmount}, ${item.total})
      `;
    }

    return this.getInvoiceById(id);
  }

  static async getInvoices(query: EInvoiceQueryInput) {
    const {
      search,
      status,
      invoiceType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "issueDate",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { invoiceCode: { contains: term } },
        { invoiceNumber: { contains: term } },
        { lookupCode: { contains: term } },
        { orderCode: { contains: term } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (invoiceType && invoiceType !== "all") {
      where.invoiceType = invoiceType;
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }

    const allItems = await prisma.eInvoice.findMany({
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
        ? new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        : new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((i) => {
      let seller = {
        name: "CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC",
        taxCode: "0318999888",
        address: "Đường PA 087, Khu phố An Thuận, Phường Phú An, TP. HCM",
        phone: "0985 862 609 - 0914 665 994",
        email: "hrmgpsoft@gmail.com",
        bankAccount: "1903688899901",
        bankName: "Techcombank",
        representative: "Phạm Gia Phúc",
      };
      if (i.sellerData) {
        try {
          const parsed = JSON.parse(i.sellerData);
          seller = { ...seller, ...parsed, name: parsed.name || parsed.companyName || seller.name };
        } catch {}
      }

      let buyer = {
        buyerName: "Khách lẻ",
        companyName: "",
        taxCode: "",
        address: "",
        phone: "",
        email: "",
        idCard: "",
      };
      if (i.buyerData) {
        try {
          const parsed = JSON.parse(i.buyerData);
          buyer = { ...buyer, ...parsed };
        } catch {}
      }

      let digitalSignature = {
        signedBy: "CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC",
        serialNumber: "5404B67F993A11EC8B9E",
        signTime: i.signDate ? new Date(i.signDate).toISOString() : new Date().toISOString(),
        certProvider: "VIETTEL-CA",
        isVerified: true,
      };
      if (i.digitalSignature) {
        try {
          const parsed = JSON.parse(i.digitalSignature);
          digitalSignature = { ...digitalSignature, ...parsed };
        } catch {}
      }

      return {
        ...i,
        seller,
        buyer,
        digitalSignature,
        subtotal: Number(i.subtotal),
        discountAmount: Number(i.discountAmount),
        taxRate: Number(i.taxRate),
        taxAmount: Number(i.taxAmount),
        totalAmount: Number(i.totalAmount),
        items: (i.items || []).map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          discountPercent: Number(item.discountPercent),
          discountAmount: Number(item.discountAmount),
          taxRate: Number(item.taxRate),
          taxAmount: Number(item.taxAmount),
          total: Number(item.total),
        })),
      };
    });

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

  static async getInvoiceById(id: string) {
    const items = await prisma.eInvoice.findMany({
      where: { id },
      include: {
        items: true,
      },
    });

    const invoice = items[0];
    if (!invoice) {
      throw new NotFoundError(`Không tìm thấy hóa đơn điện tử với ID: ${id}`);
    }

    let seller = {
      name: "CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC",
      taxCode: "0318999888",
      address: "Đường PA 087, Khu phố An Thuận, Phường Phú An, TP. HCM",
      phone: "0985 862 609 - 0914 665 994",
      email: "hrmgpsoft@gmail.com",
      bankAccount: "1903688899901",
      bankName: "Techcombank",
      representative: "Phạm Gia Phúc",
    };
    if (invoice.sellerData) {
      try {
        const parsed = JSON.parse(invoice.sellerData);
        seller = { ...seller, ...parsed, name: parsed.name || parsed.companyName || seller.name };
      } catch {}
    }

    let buyer = {
      buyerName: "Khách lẻ",
      companyName: "",
      taxCode: "",
      address: "",
      phone: "",
      email: "",
      idCard: "",
    };
    if (invoice.buyerData) {
      try {
        const parsed = JSON.parse(invoice.buyerData);
        buyer = { ...buyer, ...parsed };
      } catch {}
    }

    let digitalSignature = {
      signedBy: "CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC",
      serialNumber: "5404B67F993A11EC8B9E",
      signTime: invoice.signDate ? new Date(invoice.signDate).toISOString() : new Date().toISOString(),
      certProvider: "VIETTEL-CA",
      isVerified: true,
    };
    if (invoice.digitalSignature) {
      try {
        const parsed = JSON.parse(invoice.digitalSignature);
        digitalSignature = { ...digitalSignature, ...parsed };
      } catch {}
    }

    return {
      ...invoice,
      seller,
      buyer,
      digitalSignature,
      subtotal: Number(invoice.subtotal),
      discountAmount: Number(invoice.discountAmount),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      totalAmount: Number(invoice.totalAmount),
      items: (invoice.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        discountPercent: Number(item.discountPercent),
        discountAmount: Number(item.discountAmount),
        taxRate: Number(item.taxRate),
        taxAmount: Number(item.taxAmount),
        total: Number(item.total),
      })),
    };
  }

  static async updateInvoiceStatus(id: string, status: string) {
    await this.getInvoiceById(id);

    await prisma.eInvoice.updateMany({
      where: { id },
      data: { status },
    });

    return this.getInvoiceById(id);
  }

  static async deleteInvoice(id: string) {
    await this.getInvoiceById(id);
    await prisma.eInvoiceItem.deleteMany({
      where: { invoiceId: id },
    });
    await prisma.eInvoice.deleteMany({
      where: { id },
    });
    return { message: "Xóa hóa đơn điện tử thành công" };
  }
}
