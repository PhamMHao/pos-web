import prisma from "../../config/db";
import { NotFoundError, ConflictError } from "../../core/errors/AppError";
import {
  CreateInboundInvoiceInput,
  InboundInvoiceQueryInput,
} from "./inbound-invoices.schema";
import { Prisma } from "@prisma/client";

export class InboundInvoicesService {
  static async createInboundInvoice(input: CreateInboundInvoiceInput) {
    const existing = await prisma.inboundEInvoice.findMany({
      where: { invoiceCode: input.invoiceCode },
    });

    if (existing.length > 0) {
      throw new ConflictError(`Hóa đơn đầu vào với mã "${input.invoiceCode}" đã tồn tại`);
    }

    const sellerInput = input.seller || input.sellerData || {};
    const buyerInput = input.buyer || input.buyerData || {};
    const sellerDataStr =
      typeof sellerInput === "string"
        ? sellerInput
        : JSON.stringify(sellerInput);
    const buyerDataStr =
      typeof buyerInput === "string"
        ? buyerInput
        : JSON.stringify(buyerInput);

    const id = `inbound-${Date.now()}`;
    const iDate = new Date(input.issueDate);
    const rDate = new Date();

    await prisma.$executeRaw`
      INSERT INTO [HoaDonDauVao] (id, source, sourceDetail, sourceFile, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, issueDate, receivedDate, cqtCode, lookupCode, lookupUrl, sellerData, buyerData, subtotal, taxRate, taxAmount, totalAmount, amountInWords, status, goodsReceiptId, targetWarehouse, notes, rawXmlContent)
      VALUES (${id}, ${input.source}, ${input.sourceDetail || null}, ${input.sourceFile || null}, ${input.invoiceCode}, ${input.invoiceNumber}, ${input.invoiceSymbol}, ${input.invoiceTemplate || "1/001"}, ${iDate}, ${rDate}, ${input.cqtCode || null}, ${input.lookupCode || null}, ${input.lookupUrl || null}, ${sellerDataStr}, ${buyerDataStr}, ${input.subtotal}, ${input.taxRate}, ${input.taxAmount}, ${input.totalAmount}, ${input.amountInWords}, ${input.status || "pending_review"}, ${input.goodsReceiptId || null}, ${input.targetWarehouse || null}, ${input.notes || null}, ${input.rawXmlContent || null})
    `;

    for (let idx = 0; idx < input.items.length; idx++) {
      const item = input.items[idx];
      const itemId = `inbound-item-${Date.now()}-${idx}`;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietHoaDonDauVao] (id, inboundInvoiceId, lineNumber, productName, skuOrCode, unit, quantity, unitPrice, subtotal, taxRate, taxAmount, total, matchedProductId, matchedProductName, matchedProductSku, currentStock, currentCostPrice, ratioToBaseUnit, isNewProduct, status, assignedCategory, assignedWarehouse, assignedStorageLocation, suggestedSellingPrice, customSku, customBarcode)
        VALUES (${itemId}, ${id}, ${item.lineNumber}, ${item.productName}, ${item.skuOrCode || null}, ${item.unit}, ${item.quantity}, ${item.unitPrice}, ${item.subtotal}, ${item.taxRate}, ${item.taxAmount}, ${item.total}, ${item.matchedProductId || null}, ${item.matchedProductName || null}, ${item.matchedProductSku || null}, ${item.currentStock || null}, ${item.currentCostPrice || null}, ${item.ratioToBaseUnit || 1}, ${item.isNewProduct ? 1 : 0}, ${item.status || "unmatched"}, ${item.assignedCategory || null}, ${item.assignedWarehouse || null}, ${item.assignedStorageLocation || null}, ${item.suggestedSellingPrice || null}, ${item.customSku || null}, ${item.customBarcode || null})
      `;
    }

    return this.getInboundInvoiceById(id);
  }

  static async getInboundInvoices(query: InboundInvoiceQueryInput) {
    const { search, status, source, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { invoiceCode: { contains: term } },
        { invoiceNumber: { contains: term } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (source && source !== "all") {
      where.source = source;
    }

    const allItems = await prisma.inboundEInvoice.findMany({
      where,
      include: {
        items: true,
      },
    });

    // In-memory sort by issueDate desc
    allItems.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((i) => {
      let seller = { name: "Nhà Cung Cấp", taxCode: "", address: "" };
      let buyer = { name: "Gia Phúc Computer", taxCode: "", address: "" };
      try {
        if (i.sellerData) {
          seller = typeof i.sellerData === "string" ? JSON.parse(i.sellerData) : i.sellerData;
        }
      } catch {
        seller = { name: "Nhà Cung Cấp", taxCode: "", address: "" };
      }
      try {
        if (i.buyerData) {
          buyer = typeof i.buyerData === "string" ? JSON.parse(i.buyerData) : i.buyerData;
        }
      } catch {
        buyer = { name: "Gia Phúc Computer", taxCode: "", address: "" };
      }

      return {
        ...i,
        seller,
        buyer,
        subtotal: Number(i.subtotal),
        taxRate: Number(i.taxRate),
        taxAmount: Number(i.taxAmount),
        totalAmount: Number(i.totalAmount),
        issueDate: i.issueDate instanceof Date ? i.issueDate.toISOString().split('T')[0] : String(i.issueDate).split('T')[0],
        receivedDate: i.receivedDate instanceof Date ? i.receivedDate.toISOString() : String(i.receivedDate),
        importedAt: i.importedAt instanceof Date ? i.importedAt.toISOString() : i.importedAt ? String(i.importedAt) : undefined,
        items: (i.items || []).map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          taxRate: Number(item.taxRate),
          taxAmount: Number(item.taxAmount),
          total: Number(item.total),
          currentStock: item.currentStock ? Number(item.currentStock) : null,
          currentCostPrice: item.currentCostPrice ? Number(item.currentCostPrice) : null,
          ratioToBaseUnit: Number(item.ratioToBaseUnit || 1),
          suggestedSellingPrice: item.suggestedSellingPrice ? Number(item.suggestedSellingPrice) : null,
          isNewProduct: Boolean(item.isNewProduct),
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

  static async getInboundInvoiceById(id: string) {
    const items = await prisma.inboundEInvoice.findMany({
      where: { id },
      include: {
        items: true,
      },
    });

    const invoice = items[0];
    if (!invoice) {
      throw new NotFoundError(`Không tìm thấy hóa đơn đầu vào ID: ${id}`);
    }

    let seller = { name: "Nhà Cung Cấp", taxCode: "", address: "" };
    let buyer = { name: "Gia Phúc Computer", taxCode: "", address: "" };
    try {
      if (invoice.sellerData) {
        seller = typeof invoice.sellerData === "string" ? JSON.parse(invoice.sellerData) : invoice.sellerData;
      }
    } catch {
      seller = { name: "Nhà Cung Cấp", taxCode: "", address: "" };
    }
    try {
      if (invoice.buyerData) {
        buyer = typeof invoice.buyerData === "string" ? JSON.parse(invoice.buyerData) : invoice.buyerData;
      }
    } catch {
      buyer = { name: "Gia Phúc Computer", taxCode: "", address: "" };
    }

    return {
      ...invoice,
      seller,
      buyer,
      subtotal: Number(invoice.subtotal),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      totalAmount: Number(invoice.totalAmount),
      issueDate: invoice.issueDate instanceof Date ? invoice.issueDate.toISOString().split('T')[0] : String(invoice.issueDate).split('T')[0],
      receivedDate: invoice.receivedDate instanceof Date ? invoice.receivedDate.toISOString() : String(invoice.receivedDate),
      importedAt: invoice.importedAt instanceof Date ? invoice.importedAt.toISOString() : invoice.importedAt ? String(invoice.importedAt) : undefined,
      items: (invoice.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        taxRate: Number(item.taxRate),
        taxAmount: Number(item.taxAmount),
        total: Number(item.total),
        currentStock: item.currentStock ? Number(item.currentStock) : null,
        currentCostPrice: item.currentCostPrice ? Number(item.currentCostPrice) : null,
        ratioToBaseUnit: Number(item.ratioToBaseUnit || 1),
        suggestedSellingPrice: item.suggestedSellingPrice ? Number(item.suggestedSellingPrice) : null,
        isNewProduct: Boolean(item.isNewProduct),
      })),
    };
  }

  static async deleteInboundInvoice(id: string) {
    await this.getInboundInvoiceById(id);
    await prisma.inboundInvoiceItem.deleteMany({
      where: { inboundInvoiceId: id },
    });
    await prisma.inboundEInvoice.deleteMany({
      where: { id },
    });
    return { message: "Xóa hóa đơn đầu vào thành công" };
  }

  static async importGoodsToInventory(id: string, targetWarehouse = "Kho Tổng Gia Phúc", performedBy = "Kế toán kho") {
    const invoice = await this.getInboundInvoiceById(id);
    const dt = new Date();
    const updatedProductsSummary: any[] = [];

    for (let idx = 0; idx < invoice.items.length; idx++) {
      const item = invoice.items[idx];
      const importQty = Number(item.quantity) * Number(item.ratioToBaseUnit || 1);
      const importUnitPrice = Number(item.unitPrice) / Number(item.ratioToBaseUnit || 1);

      // Find matching product
      let matchedProd = null;
      if (item.matchedProductId) {
        const found = await prisma.product.findMany({ where: { id: item.matchedProductId } });
        if (found.length > 0) matchedProd = found[0];
      }

      if (!matchedProd && item.skuOrCode) {
        const found = await prisma.product.findMany({ where: { sku: item.skuOrCode } });
        if (found.length > 0) matchedProd = found[0];
      }

      if (!matchedProd) {
        const found = await prisma.product.findMany({ where: { name: item.productName } });
        if (found.length > 0) matchedProd = found[0];
      }

      if (matchedProd) {
        const oldStock = Number(matchedProd.stock);
        const oldCostPrice = Number(matchedProd.costPrice);
        const newStock = oldStock + importQty;
        // Weighted average cost formula
        const newCostPrice = newStock > 0
          ? Math.round(((oldStock * oldCostPrice) + (importQty * importUnitPrice)) / newStock)
          : importUnitPrice;

        await prisma.product.updateMany({
          where: { id: matchedProd.id },
          data: {
            stock: new Prisma.Decimal(newStock),
            costPrice: new Prisma.Decimal(newCostPrice),
          },
        });

        const logId = `inv-inbound-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
          VALUES (${logId}, ${matchedProd.id}, ${matchedProd.name}, ${matchedProd.sku}, 'import_invoice', ${importQty}, ${oldStock}, ${newStock}, ${`Nhập kho từ HĐĐT số ${invoice.invoiceNumber || invoice.invoiceCode} (Giá vốn mới: ${newCostPrice.toLocaleString('vi-VN')}đ)`}, ${performedBy}, ${dt})
        `;

        updatedProductsSummary.push({
          productId: matchedProd.id,
          productName: matchedProd.name,
          sku: matchedProd.sku,
          oldStock,
          newStock,
          oldCostPrice,
          newCostPrice,
          importQty,
          importUnitPrice,
        });
      } else {
        // Create new product
        const newProdId = `prod-inbound-${Date.now()}-${idx}`;
        const newSku = item.customSku || item.skuOrCode || `SKU-INB-${Date.now().toString().slice(-4)}${idx}`;
        const sellingPrice = item.suggestedSellingPrice || Math.round(importUnitPrice * 1.25);

        await prisma.$executeRaw`
          INSERT INTO [SanPham] (id, name, sku, barcode, category, unit, costPrice, sellingPrice, stock, minStock, image, warehouse, storageLocation, description, isFeatured, createdAt, updatedAt)
          VALUES (${newProdId}, ${item.productName}, ${newSku}, ${item.customBarcode || newSku}, ${item.assignedCategory || 'Linh Kiện & Thiết Bị'}, ${item.unit}, ${importUnitPrice}, ${sellingPrice}, ${importQty}, 5, null, ${targetWarehouse}, null, 'Nhập từ hóa đơn đầu vào', 0, ${dt}, ${dt})
        `;

        const logId = `inv-inbound-${Date.now()}-${idx}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, reason, performedBy, [timestamp])
          VALUES (${logId}, ${newProdId}, ${item.productName}, ${newSku}, 'import_invoice', ${importQty}, 0, ${importQty}, ${`Khởi tạo & nhập kho từ HĐĐT số ${invoice.invoiceNumber || invoice.invoiceCode}`}, ${performedBy}, ${dt})
        `;

        updatedProductsSummary.push({
          productId: newProdId,
          productName: item.productName,
          sku: newSku,
          oldStock: 0,
          newStock: importQty,
          oldCostPrice: importUnitPrice,
          newCostPrice: importUnitPrice,
          importQty,
          importUnitPrice,
          isNew: true,
        });
      }
    }

    // Update invoice status to 'imported_to_stock'
    await prisma.inboundEInvoice.updateMany({
      where: { id },
      data: {
        status: "imported_to_stock",
        targetWarehouse,
      },
    });

    // Automatically create Accounting Record for Supplier Payable / Expense
    const accId = `acc-inb-${Date.now()}`;
    const accCode = `PC-NCC-${Date.now().toString().slice(-6)}`;
    let sellerName = 'Nhà Cung Cấp';
    try {
      const sellerObj = typeof invoice.sellerData === 'string' ? JSON.parse(invoice.sellerData) : invoice.sellerData;
      sellerName = sellerObj?.sellerName || sellerObj?.name || 'Nhà Cung Cấp';
    } catch {
      sellerName = 'Nhà Cung Cấp';
    }

    await prisma.$executeRaw`
      INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
      VALUES (${accId}, ${accCode}, 'expense', 'Nhập hàng', ${invoice.totalAmount}, ${dt}, ${sellerName}, 'transfer', 'completed', ${`Chi tiền nhập hàng theo HĐĐT ${invoice.invoiceNumber || invoice.invoiceCode}`}, ${invoice.invoiceCode})
    `;

    return {
      success: true,
      message: `Đã nhập kho thành công ${invoice.items.length} mặt hàng và tự động cập nhật Giá vốn bình quân gia quyền!`,
      invoiceId: id,
      invoiceCode: invoice.invoiceCode,
      totalAmount: invoice.totalAmount,
      accountingRecordCode: accCode,
      updatedProducts: updatedProductsSummary,
    };
  }
}
