import prisma from "../../config/db";
import {
  CreateProductExchangeInput,
  ExchangeQueryInput,
  CancelExchangeInput,
  UpdatePolicyInput,
} from "./exchanges.schema";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError";
import { Prisma } from "@prisma/client";

export class ExchangesService {
  /**
   * Lấy danh sách phiếu đổi hàng kèm phân trang và lọc
   */
  static async getExchanges(query: ExchangeQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductExchangeWhereInput = {};

    if (query.status && query.status !== "all") {
      where.status = query.status;
    }

    if (query.paymentAction && query.paymentAction !== "all") {
      where.paymentAction = query.paymentAction;
    }

    if (query.warehouseName && query.warehouseName !== "all") {
      where.warehouseName = query.warehouseName;
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
        { inboundReceiptCode: { contains: s } },
        { outboundIssueCode: { contains: s } },
      ];
    }

    const allExchanges = await prisma.productExchange.findMany({
      where,
      include: {
        inItems: { include: { serials: true } },
        outItems: { include: { serials: true } },
      },
    });

    allExchanges.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allExchanges.length;
    const items = allExchanges.slice(skip, skip + limit);

    const formatted = items.map((ex) => this.formatExchange(ex));

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
   * Lấy chi tiết 1 phiếu đổi hàng theo ID
   */
  static async getExchangeById(id: string) {
    const list = await prisma.productExchange.findMany({
      where: { id },
      include: {
        inItems: { include: { serials: true } },
        outItems: { include: { serials: true } },
      },
    });

    const ex = list[0];
    if (!ex) {
      throw new NotFoundError(`Không tìm thấy phiếu đổi hàng ID: ${id}`);
    }

    return this.formatExchange(ex);
  }

  /**
   * Tạo phiếu đổi hàng mới (Server-side Math & Anti-tampering)
   */
  static async createExchange(input: CreateProductExchangeInput) {
    // 1. Kiểm tra Idempotency
    const existingIdem = await prisma.productExchange.findMany({
      where: { idempotencyKey: input.idempotencyKey },
      include: {
        inItems: { include: { serials: true } },
        outItems: { include: { serials: true } },
      },
    });
    if (existingIdem.length > 0) {
      return this.formatExchange(existingIdem[0]);
    }

    const id = input.id || `ex-${Date.now()}`;
    const code =
      input.code ||
      `DH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const now = new Date();

    // 2. Server-side tính toán Inbound (Hàng nhận lại)
    let inboundSubtotal = 0;
    let inboundTaxAmount = 0;
    const processedInItems: any[] = [];

    for (let idx = 0; idx < input.inItems.length; idx++) {
      const it = input.inItems[idx];
      const qty = Number(it.quantity);
      const returnUnitPrice = Number(it.returnUnitPrice);
      const taxRate = Number(it.taxRate) || 0;
      const subtotal = qty * returnUnitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      inboundSubtotal += subtotal;
      inboundTaxAmount += taxAmount;

      // Lấy costPrice từ sản phẩm hoặc OrderItem
      let itemCostPrice = Number(it.costPrice) || 0;
      if (it.originalOrderItemId) {
        const oItems = await prisma.orderItem.findMany({ where: { id: it.originalOrderItemId } });
        if (oItems.length > 0) {
          itemCostPrice = Number(oItems[0].costPrice);
        }
      } else if (it.productId) {
        const prods = await prisma.product.findMany({ where: { id: it.productId } });
        if (prods.length > 0) {
          itemCostPrice = Number(prods[0].costPrice);
        }
      }

      processedInItems.push({
        ...it,
        id: it.id || `ex-in-${Date.now()}-${idx}`,
        quantity: qty,
        costPrice: itemCostPrice,
        returnUnitPrice,
        taxRate,
        taxAmount,
        subtotal,
        totalAmount,
      });
    }

    const inboundTotalAmount = inboundSubtotal + inboundTaxAmount;

    // 3. Server-side tính toán Outbound (Hàng xuất mới)
    let outboundSubtotal = 0;
    let outboundTaxAmount = 0;
    const processedOutItems: any[] = [];

    for (let idx = 0; idx < input.outItems.length; idx++) {
      const it = input.outItems[idx];
      const qty = Number(it.quantity);
      const exchangeUnitPrice = Number(it.exchangeUnitPrice);
      const taxRate = Number(it.taxRate) || 0;
      const subtotal = qty * exchangeUnitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      outboundSubtotal += subtotal;
      outboundTaxAmount += taxAmount;

      let itemCostPrice = Number(it.costPrice) || 0;
      if (it.productId) {
        const prods = await prisma.product.findMany({ where: { id: it.productId } });
        if (prods.length > 0) {
          itemCostPrice = Number(prods[0].costPrice);
        }
      }

      processedOutItems.push({
        ...it,
        id: it.id || `ex-out-${Date.now()}-${idx}`,
        quantity: qty,
        costPrice: itemCostPrice,
        exchangeUnitPrice,
        taxRate,
        taxAmount,
        subtotal,
        totalAmount,
      });
    }

    const outboundTotalAmount = outboundSubtotal + outboundTaxAmount;
    const restockingFee = Number(input.restockingFee) || 0;
    const giftDeductionAmount = Number(input.giftDeductionAmount) || 0;

    // 4. Công thức chênh lệch chuẩn: Delta = V_xuat - V_nhap + restockingFee + giftDeductionAmount
    const differenceAmount =
      outboundTotalAmount - inboundTotalAmount + restockingFee + giftDeductionAmount;

    let paymentAction = "even";
    if (differenceAmount > 0) {
      paymentAction = "collect_difference";
    } else if (differenceAmount < 0) {
      paymentAction = "refund_difference";
    }

    const accountingCode =
      differenceAmount > 0
        ? `PT-DH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
        : differenceAmount < 0
        ? `PC-DH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
        : null;

    const inboundReceiptCode = `PNK-DH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const outboundIssueCode = `PXK-DH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    // 5. Lưu phiếu ProductExchange và Items
    await prisma.$executeRaw`
      INSERT INTO [PhieuDoiHang] (id, code, originalOrderId, originalOrderCode, customerId, customerName, customerPhone, customerAddress, warehouseName, inboundSubtotal, inboundTaxAmount, inboundTotalAmount, outboundSubtotal, outboundTaxAmount, outboundTotalAmount, restockingFee, giftDeductionAmount, differenceAmount, paymentAction, paymentMethod, accountingCode, inboundReceiptCode, outboundIssueCode, status, idempotencyKey, createdBy, reason, notes, createdAt, updatedAt)
      VALUES (${id}, ${code}, ${input.originalOrderId || null}, ${input.originalOrderCode || null}, ${input.customerId || null}, ${input.customerName}, ${input.customerPhone || null}, ${input.customerAddress || null}, ${input.warehouseName || "Kho Chính Gia Phúc Computer"}, ${inboundSubtotal}, ${inboundTaxAmount}, ${inboundTotalAmount}, ${outboundSubtotal}, ${outboundTaxAmount}, ${outboundTotalAmount}, ${restockingFee}, ${giftDeductionAmount}, ${differenceAmount}, ${paymentAction}, ${input.paymentMethod || "cash"}, ${accountingCode}, ${inboundReceiptCode}, ${outboundIssueCode}, ${input.status || "completed"}, ${input.idempotencyKey}, ${input.createdBy || "usr-admin-01"}, ${input.reason || "upgrade_model"}, ${input.notes || null}, ${now}, ${now})
    `;

    // Lưu inItems & serials
    for (const inIt of processedInItems) {
      await prisma.$executeRaw`
        INSERT INTO [ChiTietDoiHangNhan] (id, exchangeId, originalOrderItemId, productId, productName, sku, unit, ratioToBase, quantity, costPrice, returnUnitPrice, taxRate, taxAmount, subtotal, totalAmount, condition, destinationType, warehouseId, warehouseName, storageLocation, specifications, color, brand, notes)
        VALUES (${inIt.id}, ${id}, ${inIt.originalOrderItemId || null}, ${inIt.productId}, ${inIt.productName}, ${inIt.sku}, ${inIt.unit || "Cái"}, ${inIt.ratioToBase || 1}, ${inIt.quantity}, ${inIt.costPrice}, ${inIt.returnUnitPrice}, ${inIt.taxRate}, ${inIt.taxAmount}, ${inIt.subtotal}, ${inIt.totalAmount}, ${inIt.condition || "normal"}, ${inIt.destinationType || "restock"}, ${inIt.warehouseId || null}, ${inIt.warehouseName || "Kho Chính Gia Phúc Computer"}, ${inIt.storageLocation || null}, ${inIt.specifications || null}, ${inIt.color || null}, ${inIt.brand || null}, ${inIt.notes || null})
      `;

      if (Array.isArray(inIt.serials)) {
        for (let sIdx = 0; sIdx < inIt.serials.length; sIdx++) {
          const sNum = inIt.serials[sIdx].trim();
          if (sNum) {
            const sId = `s-in-${Date.now()}-${sIdx}-${Math.random().toString(36).substring(2, 6)}`;
            await prisma.$executeRaw`
              INSERT INTO [ChiTietSerialDoiHangNhan] (id, inItemId, serialNumber)
              VALUES (${sId}, ${inIt.id}, ${sNum})
            `;
          }
        }
      }
    }

    // Lưu outItems & serials
    for (const outIt of processedOutItems) {
      await prisma.$executeRaw`
        INSERT INTO [ChiTietDoiHangXuat] (id, exchangeId, productId, productName, sku, unit, ratioToBase, quantity, costPrice, exchangeUnitPrice, taxRate, taxAmount, subtotal, totalAmount, warehouseId, warehouseName, warrantyMonths, specifications, color, brand, notes)
        VALUES (${outIt.id}, ${id}, ${outIt.productId}, ${outIt.productName}, ${outIt.sku}, ${outIt.unit || "Cái"}, ${outIt.ratioToBase || 1}, ${outIt.quantity}, ${outIt.costPrice}, ${outIt.exchangeUnitPrice}, ${outIt.taxRate}, ${outIt.taxAmount}, ${outIt.subtotal}, ${outIt.totalAmount}, ${outIt.warehouseId || null}, ${outIt.warehouseName || "Kho Chính Gia Phúc Computer"}, ${outIt.warrantyMonths || 12}, ${outIt.specifications || null}, ${outIt.color || null}, ${outIt.brand || null}, ${outIt.notes || null})
      `;

      if (Array.isArray(outIt.serials)) {
        for (let sIdx = 0; sIdx < outIt.serials.length; sIdx++) {
          const sNum = outIt.serials[sIdx].trim();
          if (sNum) {
            const sId = `s-out-${Date.now()}-${sIdx}-${Math.random().toString(36).substring(2, 6)}`;
            await prisma.$executeRaw`
              INSERT INTO [ChiTietSerialDoiHangXuat] (id, outItemId, serialNumber)
              VALUES (${sId}, ${outIt.id}, ${sNum})
            `;
          }
        }
      }
    }

    // 6. Nếu status === 'completed', thực thi commit ngay
    if (input.status === "completed") {
      await this.commitExchangeExecution({
        id,
        code,
        input,
        processedInItems,
        processedOutItems,
        differenceAmount,
        paymentAction,
        accountingCode,
        inboundTotalAmount,
        outboundTotalAmount,
        now,
      });
    }

    return this.getExchangeById(id);
  }

  /**
   * Commit Exchange Execution (Atomic Stock, WAC, Quỹ, Bút toán, Serial)
   */
  private static async commitExchangeExecution(params: {
    id: string;
    code: string;
    input: CreateProductExchangeInput;
    processedInItems: any[];
    processedOutItems: any[];
    differenceAmount: number;
    paymentAction: string;
    accountingCode: string | null;
    inboundTotalAmount: number;
    outboundTotalAmount: number;
    now: Date;
  }) {
    const {
      id,
      code,
      input,
      processedInItems,
      processedOutItems,
      differenceAmount,
      paymentAction,
      accountingCode,
      inboundTotalAmount,
      outboundTotalAmount,
      now,
    } = params;

    // 1. Trừ tồn kho hàng xuất mới (Conditional Atomic Update TOCTOU)
    for (const outIt of processedOutItems) {
      const needStock = Number(outIt.quantity) * Number(outIt.ratioToBase || 1);
      const prodList = await prisma.product.findMany({ where: { id: outIt.productId } });
      if (prodList.length === 0) {
        throw new BadRequestError(`Không tìm thấy sản phẩm xuất mới [${outIt.productName}]`);
      }
      const prod = prodList[0];
      const oldStock = Number(prod.stock);
      if (oldStock < needStock) {
        throw new BadRequestError(
          `Sản phẩm [${outIt.productName}] không đủ tồn kho khả dụng để xuất đổi (Hiện có: ${oldStock}, Cần: ${needStock})`
        );
      }

      const newStock = oldStock - needStock;
      await prisma.$executeRaw`
        UPDATE [SanPham]
        SET stock = ${newStock}, updatedAt = ${now}
        WHERE id = ${prod.id}
      `;

      // Ghi thẻ kho xuất đổi
      const logId = `inv-log-ex-out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await prisma.$executeRaw`
        INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
        VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'exchange_outbound', ${-needStock}, ${oldStock}, ${newStock}, ${outIt.costPrice}, ${`Xuất đổi hàng theo phiếu ${code} cho khách ${input.customerName}`}, ${input.createdBy || "Thủ kho"}, ${now})
      `;

      // Cập nhật/Tạo mới Serial xuất bán
      if (Array.isArray(outIt.serials)) {
        for (const sNum of outIt.serials) {
          const cleanSerial = sNum.trim();
          if (!cleanSerial) continue;

          const expDate = new Date(now);
          expDate.setMonth(expDate.getMonth() + (outIt.warrantyMonths || 12));

          const existingDevs = await prisma.serialDeviceRecord.findMany({
            where: { serialNumber: cleanSerial },
          });
          if (existingDevs.length > 0) {
            await prisma.$executeRaw`
              UPDATE [SoSerialThietBi]
              SET status = 'sold', soldOrderCode = ${code}, soldDate = ${now}, customerName = ${input.customerName}, customerPhone = ${input.customerPhone || null}, customerAddress = ${input.customerAddress || null}, warrantyPeriodMonths = ${outIt.warrantyMonths || 12}, warrantyExpiryDate = ${expDate}, warrantyStatus = 'valid'
              WHERE serialNumber = ${cleanSerial}
            `;
          } else {
            const devId = `dev-ex-out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            await prisma.$executeRaw`
              INSERT INTO [SoSerialThietBi] (id, serialNumber, productId, productName, sku, status, warehouseName, soldOrderCode, soldDate, customerName, customerPhone, customerAddress, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
              VALUES (${devId}, ${cleanSerial}, ${prod.id}, ${prod.name}, ${prod.sku}, 'sold', ${outIt.warehouseName || "Kho Chính"}, ${code}, ${now}, ${input.customerName}, ${input.customerPhone || null}, ${input.customerAddress || null}, ${outIt.warrantyMonths || 12}, ${expDate}, 'valid', 0, 0, ${`Xuất đổi hàng theo phiếu ${code}`})
            `;
          }

          // Ghi SerialHistory
          const shId = `sh-ex-out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKySerialThietBi] (id, serialNumber, productId, productName, sku, action, fromStatus, toStatus, docType, docCode, customerName, customerPhone, warehouseName, notes, performedBy, timestamp)
            VALUES (${shId}, ${cleanSerial}, ${prod.id}, ${prod.name}, ${prod.sku}, 'exchanged_out', 'in_stock', 'sold', 'DH', ${code}, ${input.customerName}, ${input.customerPhone || null}, ${outIt.warehouseName || "Kho Chính"}, 'Xuất bàn giao thiết bị mới đổi hàng', ${input.createdBy || "Thủ kho"}, ${now})
          `;
        }
      }
    }

    // 2. Nhập kho hàng nhận lại & Tính lại giá vốn bình quân (WAC)
    for (const inIt of processedInItems) {
      const returnQtyBase = Number(inIt.quantity) * Number(inIt.ratioToBase || 1);
      const prodList = await prisma.product.findMany({ where: { id: inIt.productId } });

      if (prodList.length > 0) {
        const prod = prodList[0];
        const oldStock = Number(prod.stock);
        const oldCostPrice = Number(prod.costPrice);
        const inCostPrice = Number(inIt.costPrice);

        if (inIt.destinationType === "restock") {
          const newStock = oldStock + returnQtyBase;
          // Công thức WAC
          const newCostPrice =
            newStock > 0
              ? (oldStock * oldCostPrice + returnQtyBase * inCostPrice) / newStock
              : inCostPrice;

          await prisma.$executeRaw`
            UPDATE [SanPham]
            SET stock = ${newStock}, costPrice = ${newCostPrice}, updatedAt = ${now}
            WHERE id = ${prod.id}
          `;

          // Ghi thẻ kho nhập đổi
          const logId = `inv-log-ex-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'exchange_inbound', ${returnQtyBase}, ${oldStock}, ${newStock}, ${inCostPrice}, ${`Nhập lại hàng đổi theo phiếu ${code} từ khách ${input.customerName}`}, ${input.createdBy || "Thủ kho"}, ${now})
          `;
        } else {
          // Kho lỗi: chỉ ghi thẻ kho cách ly
          const logId = `inv-log-ex-faulty-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'exchange_faulty', 0, ${oldStock}, ${oldStock}, ${inCostPrice}, ${`Nhận hàng đổi lỗi kỹ thuật theo phiếu ${code} (Chuyển kho bảo hành)`}, ${input.createdBy || "Thủ kho"}, ${now})
          `;
        }
      }

      // Cập nhật OrderItem.returnedQuantity nếu có originalOrderItemId
      if (inIt.originalOrderItemId) {
        await prisma.$executeRaw`
          UPDATE [ChiTietHoaDon]
          SET returnedQuantity = returnedQuantity + ${inIt.quantity}
          WHERE id = ${inIt.originalOrderItemId}
        `;
      }

      // Cập nhật Serial hàng cũ
      if (Array.isArray(inIt.serials)) {
        for (const sNum of inIt.serials) {
          const cleanSerial = sNum.trim();
          if (!cleanSerial) continue;

          const nextStatus = inIt.destinationType === "restock" ? "returned" : "defective";
          await prisma.$executeRaw`
            UPDATE [SoSerialThietBi]
            SET status = ${nextStatus}, notes = ${`Nhập lại theo phiếu đổi hàng ${code} (Tình trạng: ${inIt.condition || "normal"})`}
            WHERE serialNumber = ${cleanSerial}
          `;

          const shId = `sh-ex-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKySerialThietBi] (id, serialNumber, productId, productName, sku, action, fromStatus, toStatus, docType, docCode, customerName, customerPhone, warehouseName, notes, performedBy, timestamp)
            VALUES (${shId}, ${cleanSerial}, ${inIt.productId}, ${inIt.productName}, ${inIt.sku}, 'exchanged_in', 'sold', ${nextStatus}, 'DH', ${code}, ${input.customerName}, ${input.customerPhone || null}, ${inIt.warehouseName || "Kho Chính"}, 'Nhập lại thiết bị theo phiếu đổi hàng', ${input.createdBy || "Thủ kho"}, ${now})
          `;
        }
      }
    }

    // 3. Xử lý Thu / Chi Quỹ và Công Nợ (Lớp 2)
    const absDiff = Math.abs(differenceAmount);
    if (absDiff > 0 && accountingCode) {
      if (paymentAction === "collect_difference") {
        if (input.paymentMethod === "cash" || input.paymentMethod === "transfer") {
          await prisma.$executeRaw`
            INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
            VALUES (${`acc-${accountingCode}`}, ${accountingCode}, 'income', 'Thu chênh lệch đổi hàng', ${absDiff}, ${now}, ${input.customerName}, ${input.paymentMethod}, 'completed', ${`Thu tiền bù chênh lệch đổi hàng theo phiếu ${code}`}, ${code})
          `;
        } else if (input.paymentMethod === "debt_adjust" && input.customerId) {
          const custList = await prisma.customer.findMany({ where: { id: input.customerId } });
          if (custList.length > 0) {
            const cust = custList[0];
            const oldDebt = Number(cust.debt);
            const newDebt = oldDebt + absDiff;
            await prisma.$executeRaw`
              UPDATE [KhachHang]
              SET debt = ${newDebt}, updatedAt = ${now}
              WHERE id = ${cust.id}
            `;
            const debtLogId = `dl-${Date.now()}`;
            await prisma.$executeRaw`
              INSERT INTO [NhatKyCongNoKhachHang] (id, customerId, customerPhone, customerName, sourceType, sourceId, sourceCode, changeAmount, oldDebt, newDebt, reason, performedBy, createdAt)
              VALUES (${debtLogId}, ${cust.id}, ${cust.phone || null}, ${cust.name}, 'exchange_order', ${id}, ${code}, ${absDiff}, ${oldDebt}, ${newDebt}, ${`Ghi tăng công nợ chênh lệch đổi hàng phiếu ${code}`}, ${input.createdBy || "Kế toán"}, ${now})
            `;
          }
        }
      } else if (paymentAction === "refund_difference") {
        if (input.paymentMethod === "cash" || input.paymentMethod === "transfer") {
          await prisma.$executeRaw`
            INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
            VALUES (${`acc-${accountingCode}`}, ${accountingCode}, 'expense', 'Hoàn tiền đổi/trả hàng', ${absDiff}, ${now}, ${input.customerName}, ${input.paymentMethod}, 'completed', ${`Chi hoàn tiền thừa chênh lệch đổi hàng theo phiếu ${code}`}, ${code})
          `;
        } else if (input.paymentMethod === "debt_adjust" && input.customerId) {
          const custList = await prisma.customer.findMany({ where: { id: input.customerId } });
          if (custList.length > 0) {
            const cust = custList[0];
            const oldDebt = Number(cust.debt);
            const newDebt = Math.max(0, oldDebt - absDiff);
            await prisma.$executeRaw`
              UPDATE [KhachHang]
              SET debt = ${newDebt}, updatedAt = ${now}
              WHERE id = ${cust.id}
            `;
            const debtLogId = `dl-${Date.now()}`;
            await prisma.$executeRaw`
              INSERT INTO [NhatKyCongNoKhachHang] (id, customerId, customerPhone, customerName, sourceType, sourceId, sourceCode, changeAmount, oldDebt, newDebt, reason, performedBy, createdAt)
              VALUES (${debtLogId}, ${cust.id}, ${cust.phone || null}, ${cust.name}, 'exchange_order', ${id}, ${code}, ${-absDiff}, ${oldDebt}, ${newDebt}, ${`Cấn trừ công nợ tiền thừa đổi hàng phiếu ${code}`}, ${input.createdBy || "Kế toán"}, ${now})
            `;
          }
        }
      }
    }

    // 4. Sinh Sổ Bút Toán Kép (Lớp 1 Kế Toán)
    const pktCode = `PKT-DH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const pktId = `pkt-${id}`;

    await prisma.$executeRaw`
      INSERT INTO [SoNhatKyChung] (id, entryCode, entryDate, docType, docId, docCode, description, totalDebit, totalCredit, postedBy, createdAt)
      VALUES (${pktId}, ${pktCode}, ${now}, 'product_exchange', ${id}, ${code}, ${`Bút toán hạch toán 2 chiều đổi hàng phiếu ${code}`}, ${inboundTotalAmount + outboundTotalAmount}, ${inboundTotalAmount + outboundTotalAmount}, ${input.createdBy || "Kế toán"}, ${now})
    `;

    // Dòng bút toán Giảm trừ doanh thu hàng cũ (TK 5212)
    await prisma.$executeRaw`
      INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description, partyId, partyName)
      VALUES (${`line-${pktCode}-1`}, ${pktId}, '5212', 'Hàng bán bị trả lại (Hàng cũ)', ${inboundTotalAmount}, 0, ${`Giảm trừ doanh thu hàng nhận lại theo phiếu ${code}`}, ${input.customerId || null}, ${input.customerName})
    `;

    // Dòng bút toán Doanh thu hàng mới (TK 511)
    await prisma.$executeRaw`
      INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description, partyId, partyName)
      VALUES (${`line-${pktCode}-2`}, ${pktId}, '511', 'Doanh thu bán hàng mới', 0, ${outboundTotalAmount}, ${`Ghi nhận doanh thu xuất hàng mới theo phiếu ${code}`}, ${input.customerId || null}, ${input.customerName})
    `;

    if (differenceAmount > 0) {
      await prisma.$executeRaw`
        INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description, partyId, partyName)
        VALUES (${`line-${pktCode}-3`}, ${pktId}, '111', 'Tiền mặt thu chênh lệch', ${absDiff}, 0, ${`Thu tiền bù chênh lệch đổi hàng phiếu ${code}`}, ${input.customerId || null}, ${input.customerName})
      `;
    } else if (differenceAmount < 0) {
      await prisma.$executeRaw`
        INSERT INTO [ChiTietSoNhatKy] (id, entryId, accountCode, accountName, debitAmount, creditAmount, description, partyId, partyName)
        VALUES (${`line-${pktCode}-3`}, ${pktId}, '111', 'Tiền mặt chi hoàn chênh lệch', 0, ${absDiff}, ${`Hoàn tiền thừa chênh lệch đổi hàng phiếu ${code}`}, ${input.customerId || null}, ${input.customerName})
      `;
    }
  }

  /**
   * Phê duyệt / Commit phiếu đổi hàng từ Draft sang Completed
   */
  static async commitExchange(id: string, userId: string) {
    const ex = await this.getExchangeById(id);
    if (ex.status === "completed") {
      return ex;
    }
    if (ex.status === "cancelled") {
      throw new BadRequestError("Không thể hoàn tất phiếu đã bị hủy!");
    }

    const now = new Date();
    await this.commitExchangeExecution({
      id: ex.id,
      code: ex.code,
      input: {
        ...ex,
        inItems: ex.inItems,
        outItems: ex.outItems,
        idempotencyKey: ex.idempotencyKey,
        createdBy: userId || ex.createdBy,
      } as any,
      processedInItems: ex.inItems,
      processedOutItems: ex.outItems,
      differenceAmount: ex.differenceAmount,
      paymentAction: ex.paymentAction,
      accountingCode: ex.accountingCode,
      inboundTotalAmount: ex.inboundTotalAmount,
      outboundTotalAmount: ex.outboundTotalAmount,
      now,
    });

    await prisma.$executeRaw`
      UPDATE [PhieuDoiHang]
      SET status = 'completed', approvedBy = ${userId}, approvedAt = ${now}, updatedAt = ${now}
      WHERE id = ${id}
    `;

    return this.getExchangeById(id);
  }

  /**
   * Hủy phiếu đổi hàng & Đảo bút toán an toàn
   */
  static async cancelExchange(id: string, input: CancelExchangeInput) {
    const ex = await this.getExchangeById(id);
    if (ex.status === "cancelled") {
      throw new BadRequestError("Phiếu đổi hàng này đã được hủy trước đó!");
    }

    const now = new Date();

    // Guard: Kiểm tra xem các serial nhập lại đã bị bán cho đơn khác chưa
    for (const inIt of ex.inItems) {
      if (Array.isArray(inIt.serials)) {
        for (const s of inIt.serials) {
          const sNum = typeof s === "string" ? s : s.serialNumber;
          if (!sNum) continue;

          const devList = await prisma.serialDeviceRecord.findMany({
            where: { serialNumber: sNum },
          });
          if (devList.length > 0 && devList[0].status === "sold" && devList[0].soldOrderCode !== ex.code) {
            throw new BadRequestError(
              `Không thể hủy phiếu vì thiết bị [Serial: ${sNum}] đã được bán cho đơn hàng khác (${devList[0].soldOrderCode})!`
            );
          }
        }
      }
    }

    // Đảo bút toán kho: Trừ lại hàng cũ đã cộng, cộng lại hàng mới đã xuất
    for (const outIt of ex.outItems) {
      const returnQtyBase = Number(outIt.quantity) * Number(outIt.ratioToBase || 1);
      const prodList = await prisma.product.findMany({ where: { id: outIt.productId } });
      if (prodList.length > 0) {
        const prod = prodList[0];
        const newStock = Number(prod.stock) + returnQtyBase;
        await prisma.$executeRaw`
          UPDATE [SanPham]
          SET stock = ${newStock}, updatedAt = ${now}
          WHERE id = ${prod.id}
        `;
        const logId = `inv-log-cancel-out-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
          VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'exchange_cancel_out', ${returnQtyBase}, ${Number(prod.stock)}, ${newStock}, ${outIt.costPrice}, ${`Hoàn tồn kho do hủy phiếu đổi hàng ${ex.code}`}, ${input.cancelledBy}, ${now})
        `;
      }
    }

    for (const inIt of ex.inItems) {
      if (inIt.destinationType === "restock") {
        const deductQtyBase = Number(inIt.quantity) * Number(inIt.ratioToBase || 1);
        const prodList = await prisma.product.findMany({ where: { id: inIt.productId } });
        if (prodList.length > 0) {
          const prod = prodList[0];
          const curStock = Number(prod.stock);
          if (curStock < deductQtyBase) {
            throw new BadRequestError(
              `Không thể hủy phiếu vì lượng tồn kho hiện tại của [${inIt.productName}] nhỏ hơn số lượng cần trừ lại (${curStock} < ${deductQtyBase})!`
            );
          }
          const newStock = curStock - deductQtyBase;
          await prisma.$executeRaw`
            UPDATE [SanPham]
            SET stock = ${newStock}, updatedAt = ${now}
            WHERE id = ${prod.id}
          `;
          const logId = `inv-log-cancel-in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          await prisma.$executeRaw`
            INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
            VALUES (${logId}, ${prod.id}, ${prod.name}, ${prod.sku}, 'exchange_cancel_in', ${-deductQtyBase}, ${curStock}, ${newStock}, ${inIt.costPrice}, ${`Trừ lại tồn kho do hủy phiếu đổi hàng ${ex.code}`}, ${input.cancelledBy}, ${now})
          `;
        }
      }

      // Giảm OrderItem.returnedQuantity
      if (inIt.originalOrderItemId) {
        await prisma.$executeRaw`
          UPDATE [ChiTietHoaDon]
          SET returnedQuantity = CASE WHEN returnedQuantity >= ${inIt.quantity} THEN returnedQuantity - ${inIt.quantity} ELSE 0 END
          WHERE id = ${inIt.originalOrderItemId}
        `;
      }
    }

    // Hủy phiếu quỹ kế toán
    if (ex.accountingCode) {
      await prisma.$executeRaw`
        UPDATE [SoThuChiKeToan]
        SET status = 'cancelled', note = ${`Đã hủy giao dịch theo phiếu đổi hàng ${ex.code} (Lý do: ${input.cancelReason})`}
        WHERE code = ${ex.accountingCode}
      `;
    }

    // Đảo công nợ
    if (ex.paymentMethod === "debt_adjust" && ex.customerId && Math.abs(ex.differenceAmount) > 0) {
      const custList = await prisma.customer.findMany({ where: { id: ex.customerId } });
      if (custList.length > 0) {
        const cust = custList[0];
        const oldDebt = Number(cust.debt);
        const diff = Math.abs(ex.differenceAmount);
        const newDebt =
          ex.paymentAction === "collect_difference" ? Math.max(0, oldDebt - diff) : oldDebt + diff;

        await prisma.$executeRaw`
          UPDATE [KhachHang]
          SET debt = ${newDebt}, updatedAt = ${now}
          WHERE id = ${cust.id}
        `;

        const dlId = `dl-cancel-${Date.now()}`;
        await prisma.$executeRaw`
          INSERT INTO [NhatKyCongNoKhachHang] (id, customerId, customerPhone, customerName, sourceType, sourceId, sourceCode, changeAmount, oldDebt, newDebt, reason, performedBy, createdAt)
          VALUES (${dlId}, ${cust.id}, ${cust.phone || null}, ${cust.name}, 'cancel_exchange', ${ex.id}, ${ex.code}, ${ex.paymentAction === "collect_difference" ? -diff : diff}, ${oldDebt}, ${newDebt}, ${`Đảo công nợ do hủy phiếu đổi hàng ${ex.code}: ${input.cancelReason}`}, ${input.cancelledBy}, ${now})
        `;
      }
    }

    // Cập nhật trạng thái phiếu
    await prisma.$executeRaw`
      UPDATE [PhieuDoiHang]
      SET status = 'cancelled', cancelledBy = ${input.cancelledBy}, cancelledAt = ${now}, cancelReason = ${input.cancelReason}, updatedAt = ${now}
      WHERE id = ${id}
    `;

    return this.getExchangeById(id);
  }

  /**
   * Lấy cấu hình chính sách đổi trả
   */
  static async getReturnPolicy() {
    const list = await prisma.returnPolicyConfig.findMany({ where: { id: "default_policy" } });
    if (list.length === 0) {
      return {
        id: "default_policy",
        returnPeriodDays: 15,
        exchangePeriodDays: 30,
        approvalThresholdAmount: 10000000,
        restockingFeeDamagedBox: 10,
        restockingFeeUsed: 20,
        allowNoReceiptReturn: false,
      };
    }
    const p = list[0];
    return {
      ...p,
      approvalThresholdAmount: Number(p.approvalThresholdAmount),
      restockingFeeDamagedBox: Number(p.restockingFeeDamagedBox),
      restockingFeeUsed: Number(p.restockingFeeUsed),
    };
  }

  /**
   * Cập nhật chính sách đổi trả
   */
  static async updateReturnPolicy(input: UpdatePolicyInput) {
    const dt = new Date();
    await prisma.$executeRaw`
      UPDATE [CauHinhChinhSachDoiTra]
      SET returnPeriodDays = ${input.returnPeriodDays}, exchangePeriodDays = ${input.exchangePeriodDays}, approvalThresholdAmount = ${input.approvalThresholdAmount}, restockingFeeDamagedBox = ${input.restockingFeeDamagedBox}, restockingFeeUsed = ${input.restockingFeeUsed}, allowNoReceiptReturn = ${input.allowNoReceiptReturn ? 1 : 0}, updatedAt = ${dt}
      WHERE id = 'default_policy'
    `;
    return this.getReturnPolicy();
  }

  /**
   * Format object helper
   */
  private static formatExchange(ex: any) {
    return {
      ...ex,
      inboundSubtotal: Number(ex.inboundSubtotal),
      inboundTaxAmount: Number(ex.inboundTaxAmount),
      inboundTotalAmount: Number(ex.inboundTotalAmount),
      outboundSubtotal: Number(ex.outboundSubtotal),
      outboundTaxAmount: Number(ex.outboundTaxAmount),
      outboundTotalAmount: Number(ex.outboundTotalAmount),
      restockingFee: Number(ex.restockingFee),
      giftDeductionAmount: Number(ex.giftDeductionAmount),
      differenceAmount: Number(ex.differenceAmount),
      inItems: (ex.inItems || []).map((it: any) => ({
        ...it,
        ratioToBase: Number(it.ratioToBase),
        quantity: Number(it.quantity),
        costPrice: Number(it.costPrice),
        returnUnitPrice: Number(it.returnUnitPrice),
        taxRate: Number(it.taxRate),
        taxAmount: Number(it.taxAmount),
        subtotal: Number(it.subtotal),
        totalAmount: Number(it.totalAmount),
        serials: (it.serials || []).map((s: any) => s.serialNumber || s),
      })),
      outItems: (ex.outItems || []).map((it: any) => ({
        ...it,
        ratioToBase: Number(it.ratioToBase),
        quantity: Number(it.quantity),
        costPrice: Number(it.costPrice),
        exchangeUnitPrice: Number(it.exchangeUnitPrice),
        taxRate: Number(it.taxRate),
        taxAmount: Number(it.taxAmount),
        subtotal: Number(it.subtotal),
        totalAmount: Number(it.totalAmount),
        serials: (it.serials || []).map((s: any) => s.serialNumber || s),
      })),
    };
  }
}
