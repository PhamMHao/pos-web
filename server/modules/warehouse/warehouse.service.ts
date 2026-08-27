import prisma from "../../config/db";
import { NotFoundError } from "../../core/errors/AppError";
import {
  CreateGoodsReceiptInput,
  CreateGoodsIssueInput,
  GoodsReceiptQueryInput,
  GoodsIssueQueryInput,
  AdjustStockInput,
  InventoryLogQueryInput,
} from "./warehouse.schema";
import { Prisma } from "@prisma/client";

export class WarehouseService {
  /**
   * 1. LẬP PHIẾU NHẬP KHO (INWARD STOCK RECEIPT)
   * Tự động cộng tồn kho, lưu thông số quy cách/hãng/màu sắc/bảo hành/phụ kiện,
   * khởi tạo danh bạ Serial/IMEI trong kho (in_stock), ghi nhật ký kho.
   */
  static async createGoodsReceipt(input: CreateGoodsReceiptInput) {
    const code =
      input.code ||
      `PNK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const { items, ...receiptData } = input;
    const id = `receipt-${Date.now()}`;
    const dt = receiptData.date ? new Date(receiptData.date) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [PhieuNhapKho] (id, code, date, sourceType, sourceId, sourceCode, inboundInvoiceId, inboundInvoiceCode, supplierName, supplierTaxCode, supplierPhone, supplierAddress, warehouseName, creatorName, receivedBy, totalItemsCount, totalQuantity, totalCostAmount, totalTaxAmount, grandTotal, paymentStatus, notes)
      VALUES (${id}, ${code}, ${dt}, ${receiptData.sourceType || "manual"}, ${receiptData.sourceId || null}, ${receiptData.sourceCode || null}, ${receiptData.inboundInvoiceId || null}, ${receiptData.inboundInvoiceCode || null}, ${receiptData.supplierName}, ${receiptData.supplierTaxCode || null}, ${receiptData.supplierPhone || null}, ${receiptData.supplierAddress || null}, ${receiptData.warehouseName || "Kho Chính"}, ${receiptData.creatorName}, ${receiptData.receivedBy}, ${receiptData.totalItemsCount}, ${receiptData.totalQuantity}, ${receiptData.totalCostAmount}, ${receiptData.totalTaxAmount}, ${receiptData.grandTotal}, ${receiptData.paymentStatus}, ${receiptData.notes || null})
    `;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemId = `receipt-item-${Date.now()}-${idx}`;
      const serialsJson = Array.isArray(item.serials) && item.serials.length > 0 ? JSON.stringify(item.serials) : null;

      await prisma.$executeRaw`
        INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
        VALUES (${itemId}, ${id}, ${item.productId}, ${item.productName}, ${item.sku}, ${item.unit}, ${item.quantity}, ${item.oldStock}, ${item.newStock}, ${item.oldCostPrice}, ${item.newCostPrice}, ${item.unitCost}, ${item.taxRate}, ${item.totalAmount}, ${item.storageLocation || null}, ${item.warehouse || null}, ${item.category || null}, ${item.specifications || null}, ${item.color || null}, ${item.brand || null}, ${item.warrantyMonths || 12}, ${item.accessories || null}, ${serialsJson}, ${item.notes || null})
      `;

      // 1.1 Khởi tạo / cập nhật bản ghi Serial/IMEI trong SoSerialThietBi
      if (Array.isArray(item.serials) && item.serials.length > 0) {
        for (let sIdx = 0; sIdx < item.serials.length; sIdx++) {
          const serial = item.serials[sIdx].trim();
          if (!serial) continue;

          const existing = await prisma.serialDeviceRecord.findMany({
            where: { serialNumber: serial },
          });

          if (existing.length === 0) {
            const devId = `dev-${Date.now()}-${idx}-${sIdx}`;
            await prisma.$executeRaw`
              INSERT INTO [SoSerialThietBi] (id, serialNumber, productId, productName, sku, brand, color, specifications, accessories, status, warehouseName, storageLocation, receiptCode, receiptDate, warrantyPeriodMonths, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
              VALUES (${devId}, ${serial}, ${item.productId}, ${item.productName}, ${item.sku}, ${item.brand || null}, ${item.color || null}, ${item.specifications || null}, ${item.accessories || null}, 'in_stock', ${receiptData.warehouseName || "Kho Chính"}, ${item.storageLocation || null}, ${code}, ${dt}, ${item.warrantyMonths || 12}, 'valid', 0, 0, ${`Nhập kho theo phiếu ${code} từ NCC ${receiptData.supplierName}`})
            `;
          } else {
            await prisma.serialDeviceRecord.updateMany({
              where: { serialNumber: serial },
              data: {
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                brand: item.brand || existing[0].brand,
                color: item.color || existing[0].color,
                specifications: item.specifications || existing[0].specifications,
                accessories: item.accessories || existing[0].accessories,
                status: "in_stock",
                warehouseName: receiptData.warehouseName || "Kho Chính",
                storageLocation: item.storageLocation || existing[0].storageLocation,
                receiptCode: code,
                receiptDate: dt,
                warrantyPeriodMonths: item.warrantyMonths || existing[0].warrantyPeriodMonths,
              },
            });
          }
        }
      }

      // 1.2 Cập nhật tồn kho sản phẩm, giá vốn và thông số mở rộng
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
            specifications: item.specifications || prod.specifications,
            color: item.color || prod.color,
            brand: item.brand || prod.brand,
            warrantyMonths: item.warrantyMonths || prod.warrantyMonths,
            accessories: item.accessories || prod.accessories,
          },
        });

        // Ghi Sổ Nhật Ký Kho
        const logId = `inv-log-${Date.now()}-${idx}`;
        const serialListStr = Array.isArray(item.serials) && item.serials.length > 0 ? ` (S/N: ${item.serials.join(", ")})` : "";
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, [timestamp])
          VALUES (${logId}, ${item.productId}, ${item.productName}, ${item.sku}, 'import', ${addQty}, ${oldStock}, ${newStock}, ${item.unitCost}, ${`Nhập kho từ NCC ${receiptData.supplierName} theo phiếu ${code}${serialListStr}`}, ${receiptData.receivedBy || "Thủ kho"}, ${new Date()})
        `;
      }
    }

    // 1.3 Nếu nguồn là Đơn Đặt Hàng Mua (PO), tự động cập nhật trạng thái PO thành 'completed'
    if (receiptData.sourceType === "po" && receiptData.sourceId) {
      await prisma.purchaseOrder.updateMany({
        where: { id: receiptData.sourceId },
        data: {
          status: "completed",
        },
      });
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
        { sourceCode: { contains: term } },
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
      items: (r.items || []).map((i) => {
        let serialsList: string[] = [];
        if (i.serials) {
          try {
            serialsList = JSON.parse(i.serials);
          } catch {
            serialsList = i.serials.split(",").map((s) => s.trim()).filter(Boolean);
          }
        }
        return {
          ...i,
          quantity: Number(i.quantity),
          oldStock: Number(i.oldStock),
          newStock: Number(i.newStock),
          oldCostPrice: Number(i.oldCostPrice),
          newCostPrice: Number(i.newCostPrice),
          unitCost: Number(i.unitCost),
          taxRate: Number(i.taxRate),
          totalAmount: Number(i.totalAmount),
          serials: serialsList,
        };
      }),
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
      items: (receipt.items || []).map((i) => {
        let serialsList: string[] = [];
        if (i.serials) {
          try {
            serialsList = JSON.parse(i.serials);
          } catch {
            serialsList = i.serials.split(",").map((s) => s.trim()).filter(Boolean);
          }
        }
        return {
          ...i,
          quantity: Number(i.quantity),
          oldStock: Number(i.oldStock),
          newStock: Number(i.newStock),
          oldCostPrice: Number(i.oldCostPrice),
          newCostPrice: Number(i.newCostPrice),
          unitCost: Number(i.unitCost),
          taxRate: Number(i.taxRate),
          totalAmount: Number(i.totalAmount),
          serials: serialsList,
        };
      }),
    };
  }

  /**
   * 2. LẬP PHIẾU XUẤT KHO (STOCK GOODS ISSUE / OUTBOUND DISPATCH)
   * Trừ tồn kho, chuyển trạng thái Serial sang 'sold', tự động kích hoạt bảo hành điện tử,
   * cập nhật trạng thái đơn hàng và ghi sổ nhật ký kho.
   */
  static async createGoodsIssue(input: CreateGoodsIssueInput) {
    const code =
      input.code ||
      `XK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const { items, ...issueData } = input;
    const id = `issue-${Date.now()}`;
    const dt = issueData.dispatchedAt ? new Date(issueData.dispatchedAt) : new Date();

    await prisma.$executeRaw`
      INSERT INTO [PhieuXuatKho] (id, code, orderId, orderCode, customerName, customerPhone, customerAddress, warehouseName, dispatchedBy, dispatchedAt, totalQuantity, totalItemsCount, status, notes, createdAt)
      VALUES (${id}, ${code}, ${issueData.orderId || null}, ${issueData.orderCode}, ${issueData.customerName}, ${issueData.customerPhone || null}, ${issueData.customerAddress || null}, ${issueData.warehouseName || "Kho Chính"}, ${issueData.dispatchedBy}, ${dt}, ${issueData.totalQuantity}, ${issueData.totalItemsCount}, ${issueData.status || "completed"}, ${issueData.notes || null}, GETDATE())
    `;

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const itemId = `issue-item-${Date.now()}-${idx}`;
      const serialsJson = Array.isArray(item.serials) && item.serials.length > 0 ? JSON.stringify(item.serials) : null;

      await prisma.$executeRaw`
        INSERT INTO [ChiTietPhieuXuatKho] (id, issueId, productId, productName, sku, unit, quantity, serials, warrantyMonths, notes)
        VALUES (${itemId}, ${id}, ${item.productId}, ${item.productName}, ${item.sku}, ${item.unit || "Cái"}, ${item.quantity}, ${serialsJson}, ${item.warrantyMonths || 12}, ${item.notes || null})
      `;

      // 2.1 Cập nhật trạng thái Serial sang 'sold' và kích hoạt bảo hành điện tử
      if (Array.isArray(item.serials) && item.serials.length > 0) {
        for (const serial of item.serials) {
          const cleanSerial = serial.trim();
          if (!cleanSerial) continue;

          const expDate = new Date(dt);
          expDate.setMonth(expDate.getMonth() + (item.warrantyMonths || 12));

          const existing = await prisma.serialDeviceRecord.findMany({
            where: { serialNumber: cleanSerial },
          });

          if (existing.length > 0) {
            await prisma.serialDeviceRecord.updateMany({
              where: { serialNumber: cleanSerial },
              data: {
                status: "sold",
                soldOrderCode: issueData.orderCode,
                soldDate: dt,
                customerName: issueData.customerName,
                customerPhone: issueData.customerPhone || "",
                customerAddress: issueData.customerAddress || "",
                warrantyPeriodMonths: item.warrantyMonths || existing[0].warrantyPeriodMonths,
                warrantyExpiryDate: expDate,
                warrantyStatus: "valid",
              },
            });
          } else {
            const devId = `dev-out-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await prisma.$executeRaw`
              INSERT INTO [SoSerialThietBi] (id, serialNumber, productId, productName, sku, status, warehouseName, soldOrderCode, soldDate, customerName, customerPhone, customerAddress, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
              VALUES (${devId}, ${cleanSerial}, ${item.productId}, ${item.productName}, ${item.sku}, 'sold', ${issueData.warehouseName || "Kho Chính"}, ${issueData.orderCode}, ${dt}, ${issueData.customerName}, ${issueData.customerPhone || ""}, ${issueData.customerAddress || ""}, ${item.warrantyMonths || 12}, ${expDate}, 'valid', 0, 0, ${`Xuất bán theo đơn ${issueData.orderCode} (Phiếu ${code})`})
            `;
          }
        }
      }

      // 2.2 Trừ tồn kho sản phẩm trong SanPham
      const products = await prisma.product.findMany({ where: { id: item.productId } });
      if (products.length > 0) {
        const prod = products[0];
        const deductQty = Number(item.quantity);
        const oldStock = Number(prod.stock);
        const newStock = Math.max(0, oldStock - deductQty);

        await prisma.product.updateMany({
          where: { id: item.productId },
          data: {
            stock: new Prisma.Decimal(newStock),
          },
        });

        // Ghi Sổ Nhật Ký Kho
        const logId = `inv-log-out-${Date.now()}-${idx}`;
        const serialListStr = Array.isArray(item.serials) && item.serials.length > 0 ? ` (S/N: ${item.serials.join(", ")})` : "";
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, [timestamp])
          VALUES (${logId}, ${item.productId}, ${item.productName}, ${item.sku}, 'sale_deduct', ${-deductQty}, ${oldStock}, ${newStock}, ${prod.costPrice}, ${`Xuất kho bán hàng theo đơn ${issueData.orderCode} (Phiếu ${code})${serialListStr}`}, ${issueData.dispatchedBy || "Thủ kho"}, ${new Date()})
        `;
      }
    }

    // 2.3 Cập nhật trạng thái đơn hàng trong HoaDon
    if (issueData.orderCode) {
      await prisma.order.updateMany({
        where: { code: issueData.orderCode },
        data: {
          status: "completed",
        },
      });
    }

    return this.getGoodsIssueById(id);
  }

  static async getGoodsIssues(query: GoodsIssueQueryInput) {
    const {
      search,
      orderCode,
      customerName,
      warehouseName,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "dispatchedAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.StockGoodsIssueWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { code: { contains: term } },
        { orderCode: { contains: term } },
        { customerName: { contains: term } },
      ];
    }

    if (orderCode) where.orderCode = { contains: orderCode };
    if (customerName) where.customerName = { contains: customerName };
    if (warehouseName && warehouseName !== "all") where.warehouseName = warehouseName;

    if (startDate || endDate) {
      where.dispatchedAt = {};
      if (startDate) where.dispatchedAt.gte = new Date(startDate);
      if (endDate) where.dispatchedAt.lte = new Date(endDate);
    }

    const allItems = await prisma.stockGoodsIssue.findMany({
      where,
      include: {
        items: true,
      },
    });

    allItems.sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.dispatchedAt).getTime() - new Date(b.dispatchedAt).getTime()
        : new Date(b.dispatchedAt).getTime() - new Date(a.dispatchedAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    const formatted = items.map((issue) => ({
      ...issue,
      totalQuantity: Number(issue.totalQuantity),
      items: (issue.items || []).map((i) => {
        let serialsList: string[] = [];
        if (i.serials) {
          try {
            serialsList = JSON.parse(i.serials);
          } catch {
            serialsList = i.serials.split(",").map((s) => s.trim()).filter(Boolean);
          }
        }
        return {
          ...i,
          quantity: Number(i.quantity),
          serials: serialsList,
        };
      }),
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

  static async getGoodsIssueById(id: string) {
    const issues = await prisma.stockGoodsIssue.findMany({
      where: { id },
      include: {
        items: true,
      },
    });

    const issue = issues[0];
    if (!issue) {
      throw new NotFoundError(`Không tìm thấy phiếu xuất kho với ID: ${id}`);
    }

    return {
      ...issue,
      totalQuantity: Number(issue.totalQuantity),
      items: (issue.items || []).map((i) => {
        let serialsList: string[] = [];
        if (i.serials) {
          try {
            serialsList = JSON.parse(i.serials);
          } catch {
            serialsList = i.serials.split(",").map((s) => s.trim()).filter(Boolean);
          }
        }
        return {
          ...i,
          quantity: Number(i.quantity),
          serials: serialsList,
        };
      }),
    };
  }

  /**
   * 3. ĐIỀU CHỈNH TỒN KHO & NHẬT KÝ KHO
   */
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
      INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, [timestamp])
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
