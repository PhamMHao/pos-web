import prisma from "../../config/db";
import bcrypt from "bcryptjs";

function escapeSqlStr(str: any): string {
  if (str === null || str === undefined) return "NULL";
  return `N'${String(str).replace(/'/g, "''")}'`;
}

function escapeSqlDate(d: any): string {
  if (!d) return "NULL";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "NULL";
  return `'${date.toISOString()}'`;
}

function escapeSqlDateRequired(d: any): string {
  if (!d) return `'${new Date().toISOString()}'`;
  const date = new Date(d);
  if (isNaN(date.getTime())) return `'${new Date().toISOString()}'`;
  return `'${date.toISOString()}'`;
}

function escapeSqlNum(num: any, defaultVal = 0): string {
  if (num === null || num === undefined || isNaN(Number(num))) return `${defaultVal}`;
  return `${Number(num)}`;
}

function escapeSqlNumNullable(num: any): string {
  if (num === null || num === undefined || isNaN(Number(num))) return "NULL";
  return `${Number(num)}`;
}

function escapeSqlBit(val: any, defaultVal = false): string {
  if (val === undefined || val === null) return defaultVal ? "1" : "0";
  return val ? "1" : "0";
}

export class SettingsService {
  static async getSettings() {
    const records = await prisma.storeSettings.findMany({
      where: { id: "default_settings" },
    });

    if (records.length === 0) {
      return null;
    }

    const rec = records[0];
    let parsedJson: any = {};
    if (rec.settingsJson) {
      try {
        parsedJson = JSON.parse(rec.settingsJson);
      } catch {}
    }

    return {
      storeName: rec.storeName,
      tagline: rec.tagline,
      phone: rec.phone,
      email: rec.email,
      address: rec.address,
      taxCode: rec.taxCode,
      bankName: rec.bankName,
      bankAccount: rec.bankAccount,
      bankCode: rec.bankCode,
      ...parsedJson,
      updatedAt: rec.updatedAt,
    };
  }

  static async updateSettings(data: any) {
    const {
      storeName,
      tagline,
      phone,
      email,
      address,
      taxCode,
      bankName,
      bankAccount,
      bankCode,
      ...extendedSettings
    } = data;

    const current = (await this.getSettings()) || ({} as any);
    const mergedExtended = {
      ...current,
      ...extendedSettings,
    };

    delete mergedExtended.storeName;
    delete mergedExtended.tagline;
    delete mergedExtended.phone;
    delete mergedExtended.email;
    delete mergedExtended.address;
    delete mergedExtended.taxCode;
    delete mergedExtended.bankName;
    delete mergedExtended.bankAccount;
    delete mergedExtended.bankCode;
    delete mergedExtended.updatedAt;

    const settingsJson = JSON.stringify(mergedExtended);
    const finalStoreName = storeName !== undefined ? storeName : (current.storeName || "Gia Phúc Computer");
    const finalTagline = tagline !== undefined ? tagline : (current.tagline || "Máy Tính - Laptop - Linh Kiện & Dịch Vụ Kỹ Thuật");
    const finalPhone = phone !== undefined ? phone : (current.phone || "0985 862 609");
    const finalEmail = email !== undefined ? email : (current.email || "contact@vitinhgiaphuc.com");
    const finalAddress = address !== undefined ? address : (current.address || "Số 123 Đường Công Nghệ, TP. Hồ Chí Minh");
    const finalTaxCode = taxCode !== undefined ? taxCode : (current.taxCode || "0318999888");
    const finalBankName = bankName !== undefined ? bankName : (current.bankName || "MBBank - Ngân Hàng Quân Đội");
    const finalBankAccount = bankAccount !== undefined ? bankAccount : (current.bankAccount || "9988776655");
    const finalBankCode = bankCode !== undefined ? bankCode : (current.bankCode || "MB");

    await prisma.$executeRawUnsafe(`
      IF EXISTS (SELECT 1 FROM [CauHinhCuaHang] WHERE id = 'default_settings')
      BEGIN
        UPDATE [CauHinhCuaHang]
        SET storeName = ${escapeSqlStr(finalStoreName)},
            tagline = ${escapeSqlStr(finalTagline)},
            phone = ${escapeSqlStr(finalPhone)},
            email = ${escapeSqlStr(finalEmail)},
            address = ${escapeSqlStr(finalAddress)},
            taxCode = ${escapeSqlStr(finalTaxCode)},
            bankName = ${escapeSqlStr(finalBankName)},
            bankAccount = ${escapeSqlStr(finalBankAccount)},
            bankCode = ${escapeSqlStr(finalBankCode)},
            settingsJson = ${escapeSqlStr(settingsJson)},
            updatedAt = GETDATE()
        WHERE id = 'default_settings'
      END
      ELSE
      BEGIN
        INSERT INTO [CauHinhCuaHang] (id, storeName, tagline, phone, email, address, taxCode, bankName, bankAccount, bankCode, settingsJson, updatedAt)
        VALUES ('default_settings', ${escapeSqlStr(finalStoreName)}, ${escapeSqlStr(finalTagline)}, ${escapeSqlStr(finalPhone)}, ${escapeSqlStr(finalEmail)}, ${escapeSqlStr(finalAddress)}, ${escapeSqlStr(finalTaxCode)}, ${escapeSqlStr(finalBankName)}, ${escapeSqlStr(finalBankAccount)}, ${escapeSqlStr(finalBankCode)}, ${escapeSqlStr(settingsJson)}, GETDATE())
      END
    `);

    return this.getSettings();
  }

  static async backupDatabase() {
    const [
      users,
      storeSettings,
      products,
      uomConversions,
      customers,
      orders,
      orderItems,
      inventoryLogs,
      stockGoodsReceipts,
      stockGoodsReceiptItems,
      priceQuotes,
      priceQuoteItems,
      productCostings,
      costingBOMItems,
      enterpriseAssets,
      warrantyTickets,
      warrantyPartItems,
      warrantyTimelineEvents,
      serialDeviceRecords,
      eInvoices,
      eInvoiceItems,
      inboundEInvoices,
      inboundInvoiceItems,
      employees,
      laborContracts,
      accountingRecords,
      promotions,
      fraudAlerts,
      cashShifts,
      suppliers,
      supplierPriceItems,
      purchaseOrders,
      purchaseOrderItems,
      returnOrders,
      returnOrderItems,
      stockTransfers,
      stockTransferItems,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.storeSettings.findMany(),
      prisma.product.findMany(),
      prisma.productUOMConversion.findMany(),
      prisma.customer.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.inventoryLog.findMany(),
      prisma.stockGoodsReceipt.findMany(),
      prisma.stockGoodsReceiptItem.findMany(),
      prisma.priceQuote.findMany(),
      prisma.priceQuoteItem.findMany(),
      prisma.productCosting.findMany(),
      prisma.costingBOMItem.findMany(),
      prisma.enterpriseAsset.findMany(),
      prisma.warrantyTicket.findMany(),
      prisma.warrantyPartItem.findMany(),
      prisma.warrantyTimelineEvent.findMany(),
      prisma.serialDeviceRecord.findMany(),
      prisma.eInvoice.findMany(),
      prisma.eInvoiceItem.findMany(),
      prisma.inboundEInvoice.findMany(),
      prisma.inboundInvoiceItem.findMany(),
      prisma.employee.findMany(),
      prisma.laborContract.findMany(),
      prisma.accountingRecord.findMany(),
      prisma.promotion.findMany(),
      prisma.fraudAlert.findMany(),
      prisma.cashShift.findMany(),
      prisma.supplier.findMany(),
      prisma.supplierPriceItem.findMany(),
      prisma.purchaseOrder.findMany(),
      prisma.purchaseOrderItem.findMany(),
      prisma.returnOrder.findMany(),
      prisma.returnOrderItem.findMany(),
      prisma.stockTransfer.findMany(),
      prisma.stockTransferItem.findMany(),
    ]);

    const backupPayload = {
      system: "GP-ERP Enterprise",
      version: "2.0.0",
      createdAt: new Date().toISOString(),
      tables: {
        users,
        storeSettings,
        products,
        uomConversions,
        customers,
        orders,
        orderItems,
        inventoryLogs,
        stockGoodsReceipts,
        stockGoodsReceiptItems,
        priceQuotes,
        priceQuoteItems,
        productCostings,
        costingBOMItems,
        enterpriseAssets,
        warrantyTickets,
        warrantyPartItems,
        warrantyTimelineEvents,
        serialDeviceRecords,
        eInvoices,
        eInvoiceItems,
        inboundEInvoices,
        inboundInvoiceItems,
        employees,
        laborContracts,
        accountingRecords,
        promotions,
        fraudAlerts,
        cashShifts,
        suppliers,
        supplierPriceItems,
        purchaseOrders,
        purchaseOrderItems,
        returnOrders,
        returnOrderItems,
        stockTransfers,
        stockTransferItems,
      },
    };

    return backupPayload;
  }

  static async wipeAllData(confirmation: string) {
    const normConfirm = (confirmation || "").trim().toUpperCase();
    if (normConfirm !== "XOA_DU_LIEU" && normConfirm !== "CONFIRM_DELETE_ALL_DATA") {
      throw new Error("Mã xác nhận xóa dữ liệu không chính xác. Vui lòng nhập XOA_DU_LIEU.");
    }

    // 1. Transactional & Operations Data
    await prisma.$executeRaw`DELETE FROM [ChiTietPhieuTraHang]`;
    await prisma.$executeRaw`DELETE FROM [PhieuTraHang]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietDieuChuyenKho]`;
    await prisma.$executeRaw`DELETE FROM [PhieuDieuChuyenKho]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietDonDatHangMua]`;
    await prisma.$executeRaw`DELETE FROM [DonDatHangMua]`;
    await prisma.$executeRaw`DELETE FROM [BangGiaNhaCungCap]`;
    await prisma.$executeRaw`DELETE FROM [NhaCungCap]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietHoaDon]`;
    await prisma.$executeRaw`DELETE FROM [HoaDon]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietPhieuNhapKho]`;
    await prisma.$executeRaw`DELETE FROM [PhieuNhapKho]`;
    await prisma.$executeRaw`DELETE FROM [NhatKyKho]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietDinhMucBOM]`;
    await prisma.$executeRaw`DELETE FROM [DinhMucSanXuat]`;
    await prisma.$executeRaw`DELETE FROM [QuyDoiDonViTinh]`;
    await prisma.$executeRaw`DELETE FROM [SanPham]`;
    await prisma.$executeRaw`DELETE FROM [LinhKienBaoHanh]`;
    await prisma.$executeRaw`DELETE FROM [NhatKyBaoHanh]`;
    await prisma.$executeRaw`DELETE FROM [PhieuBaoHanh]`;
    await prisma.$executeRaw`DELETE FROM [SoSerialThietBi]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietBaoGia]`;
    await prisma.$executeRaw`DELETE FROM [BaoGia]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietHoaDonDienTu]`;
    await prisma.$executeRaw`DELETE FROM [HoaDonDienTu]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietHoaDonDauVao]`;
    await prisma.$executeRaw`DELETE FROM [HoaDonDauVao]`;
    await prisma.$executeRaw`DELETE FROM [HopDongLaoDong]`;
    await prisma.$executeRaw`DELETE FROM [NhanVien]`;
    await prisma.$executeRaw`DELETE FROM [TaiSanDoanhNghiep]`;
    await prisma.$executeRaw`DELETE FROM [SoThuChiKeToan]`;
    await prisma.$executeRaw`DELETE FROM [ChuongTrinhKhuyenMai]`;
    await prisma.$executeRaw`DELETE FROM [CanhBaoGianLan]`;
    await prisma.$executeRaw`DELETE FROM [CaBanHang]`;
    await prisma.$executeRaw`DELETE FROM [KhachHang]`;

    // 2. Master Data (Dữ Liệu Cơ Bản & MDM)
    await prisma.$executeRaw`DELETE FROM [DuAnDoanhNghiep]`;
    await prisma.$executeRaw`DELETE FROM [PhanLoaiNhaCungCap]`;
    await prisma.$executeRaw`DELETE FROM [HangThanhVien]`;
    await prisma.$executeRaw`DELETE FROM [NhomKhachHang]`;
    await prisma.$executeRaw`DELETE FROM [DanhMucNganhHang]`;
    await prisma.$executeRaw`DELETE FROM [DanhMucDonViTinh]`;
    await prisma.$executeRaw`DELETE FROM [ViTriLuuKho]`;
    await prisma.$executeRaw`DELETE FROM [ChucVu]`;
    await prisma.$executeRaw`DELETE FROM [PhongBan]`;

    // Giữ nguyên StoreSettings và Admin Account
    await this.ensureAdminAndSettings();

    return {
      success: true,
      message: "Toàn bộ dữ liệu nghiệp vụ và dữ liệu cơ bản (Master Data) đã được xóa sạch hoàn toàn khỏi CSDL SQL Server!",
    };
  }

  static async restoreDatabase(backupPayload: any) {
    if (!backupPayload || !backupPayload.tables) {
      throw new Error("File sao lưu không hợp lệ hoặc thiếu dữ liệu bảng biểu.");
    }

    const { tables } = backupPayload;

    // Step 1: Wipe all existing data in correct FK order
    await prisma.$executeRaw`DELETE FROM [ChiTietPhieuTraHang]`;
    await prisma.$executeRaw`DELETE FROM [PhieuTraHang]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietDieuChuyenKho]`;
    await prisma.$executeRaw`DELETE FROM [PhieuDieuChuyenKho]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietDonDatHangMua]`;
    await prisma.$executeRaw`DELETE FROM [DonDatHangMua]`;
    await prisma.$executeRaw`DELETE FROM [BangGiaNhaCungCap]`;
    await prisma.$executeRaw`DELETE FROM [NhaCungCap]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietHoaDon]`;
    await prisma.$executeRaw`DELETE FROM [HoaDon]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietPhieuNhapKho]`;
    await prisma.$executeRaw`DELETE FROM [PhieuNhapKho]`;
    await prisma.$executeRaw`DELETE FROM [NhatKyKho]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietDinhMucBOM]`;
    await prisma.$executeRaw`DELETE FROM [DinhMucSanXuat]`;
    await prisma.$executeRaw`DELETE FROM [QuyDoiDonViTinh]`;
    await prisma.$executeRaw`DELETE FROM [SanPham]`;
    await prisma.$executeRaw`DELETE FROM [LinhKienBaoHanh]`;
    await prisma.$executeRaw`DELETE FROM [NhatKyBaoHanh]`;
    await prisma.$executeRaw`DELETE FROM [PhieuBaoHanh]`;
    await prisma.$executeRaw`DELETE FROM [SoSerialThietBi]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietBaoGia]`;
    await prisma.$executeRaw`DELETE FROM [BaoGia]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietHoaDonDienTu]`;
    await prisma.$executeRaw`DELETE FROM [HoaDonDienTu]`;
    await prisma.$executeRaw`DELETE FROM [ChiTietHoaDonDauVao]`;
    await prisma.$executeRaw`DELETE FROM [HoaDonDauVao]`;
    await prisma.$executeRaw`DELETE FROM [HopDongLaoDong]`;
    await prisma.$executeRaw`DELETE FROM [NhanVien]`;
    await prisma.$executeRaw`DELETE FROM [TaiSanDoanhNghiep]`;
    await prisma.$executeRaw`DELETE FROM [SoThuChiKeToan]`;
    await prisma.$executeRaw`DELETE FROM [ChuongTrinhKhuyenMai]`;
    await prisma.$executeRaw`DELETE FROM [CanhBaoGianLan]`;
    await prisma.$executeRaw`DELETE FROM [KhachHang]`;
    await prisma.$executeRaw`DELETE FROM [DuAnDoanhNghiep]`;
    await prisma.$executeRaw`DELETE FROM [PhanLoaiNhaCungCap]`;
    await prisma.$executeRaw`DELETE FROM [HangThanhVien]`;
    await prisma.$executeRaw`DELETE FROM [NhomKhachHang]`;
    await prisma.$executeRaw`DELETE FROM [DanhMucNganhHang]`;
    await prisma.$executeRaw`DELETE FROM [DanhMucDonViTinh]`;
    await prisma.$executeRaw`DELETE FROM [ViTriLuuKho]`;
    await prisma.$executeRaw`DELETE FROM [ChucVu]`;
    await prisma.$executeRaw`DELETE FROM [PhongBan]`;
    await prisma.$executeRaw`DELETE FROM [NguoiDung]`;

    let restoredStats: Record<string, number> = {};

    if (Array.isArray(tables.users) && tables.users.length > 0) {
      for (const u of tables.users) {
        await prisma.$executeRawUnsafe(`
          IF NOT EXISTS (SELECT 1 FROM [NguoiDung] WHERE id = ${escapeSqlStr(u.id)} OR username = ${escapeSqlStr(u.username)})
          BEGIN
            INSERT INTO [NguoiDung] (id, username, passwordHash, fullName, email, phone, role, status, avatar, createdAt, updatedAt)
            VALUES (${escapeSqlStr(u.id)}, ${escapeSqlStr(u.username)}, ${escapeSqlStr(u.passwordHash)}, ${escapeSqlStr(u.fullName)}, ${escapeSqlStr(u.email)}, ${escapeSqlStr(u.phone)}, ${escapeSqlStr(u.role)}, ${escapeSqlStr(u.status || 'active')}, ${escapeSqlStr(u.avatar)}, ${escapeSqlDateRequired(u.createdAt)}, ${escapeSqlDateRequired(u.updatedAt)})
          END
        `);
      }
      restoredStats["users"] = tables.users.length;
    }

    if (Array.isArray(tables.storeSettings) && tables.storeSettings.length > 0) {
      const s = tables.storeSettings[0];
      await this.updateSettings({
        storeName: s.storeName,
        tagline: s.tagline,
        phone: s.phone,
        email: s.email,
        address: s.address,
        taxCode: s.taxCode,
        bankName: s.bankName,
        bankAccount: s.bankAccount,
        bankCode: s.bankCode,
        ...(s.settingsJson ? (typeof s.settingsJson === "string" ? JSON.parse(s.settingsJson) : s.settingsJson) : {}),
      });
      restoredStats["settings"] = 1;
    }

    if (Array.isArray(tables.customers) && tables.customers.length > 0) {
      for (const c of tables.customers) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [KhachHang] (id, name, phone, email, address, tier, points, totalSpent, totalOrders, debt, note, createdAt, updatedAt)
          VALUES (${escapeSqlStr(c.id)}, ${escapeSqlStr(c.name)}, ${escapeSqlStr(c.phone)}, ${escapeSqlStr(c.email)}, ${escapeSqlStr(c.address)}, ${escapeSqlStr(c.tier || "Đồng")}, ${escapeSqlNum(c.points)}, ${escapeSqlNum(c.totalSpent)}, ${escapeSqlNum(c.totalOrders)}, ${escapeSqlNum(c.debt)}, ${escapeSqlStr(c.note || c.notes)}, ${escapeSqlDateRequired(c.createdAt)}, ${escapeSqlDateRequired(c.updatedAt)})
        `);
      }
      restoredStats["customers"] = tables.customers.length;
    }

    if (Array.isArray(tables.products) && tables.products.length > 0) {
      for (const p of tables.products) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [SanPham] (id, sku, barcode, name, category, unit, costPrice, sellingPrice, stock, minStock, image, warehouse, storageLocation, description, isFeatured, weightOrVolume, createdAt, updatedAt)
          VALUES (${escapeSqlStr(p.id)}, ${escapeSqlStr(p.sku)}, ${escapeSqlStr(p.barcode || p.sku)}, ${escapeSqlStr(p.name)}, ${escapeSqlStr(p.category)}, ${escapeSqlStr(p.unit)}, ${escapeSqlNum(p.costPrice)}, ${escapeSqlNum(p.sellingPrice)}, ${escapeSqlNum(p.stock)}, ${escapeSqlNum(p.minStock || 5)}, ${escapeSqlStr(p.image)}, ${escapeSqlStr(p.warehouse || "Kho Chính")}, ${escapeSqlStr(p.storageLocation)}, ${escapeSqlStr(p.description)}, ${escapeSqlBit(p.isFeatured, false)}, ${escapeSqlStr(p.weightOrVolume)}, ${escapeSqlDateRequired(p.createdAt)}, ${escapeSqlDateRequired(p.updatedAt)})
        `);
      }
      restoredStats["products"] = tables.products.length;

      if (Array.isArray(tables.uomConversions) && tables.uomConversions.length > 0) {
        for (const u of tables.uomConversions) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [QuyDoiDonViTinh] (id, productId, unit, ratioToBase, costPrice, sellingPrice, barcode, isBase, referenceUnit, conversionRate, description)
            VALUES (${escapeSqlStr(u.id)}, ${escapeSqlStr(u.productId)}, ${escapeSqlStr(u.unit)}, ${escapeSqlNum(u.ratioToBase || 1)}, ${escapeSqlNum(u.costPrice)}, ${escapeSqlNum(u.sellingPrice)}, ${escapeSqlStr(u.barcode)}, ${escapeSqlBit(u.isBase, false)}, ${escapeSqlStr(u.referenceUnit)}, ${escapeSqlNumNullable(u.conversionRate)}, ${escapeSqlStr(u.description)})
          `);
        }
        restoredStats["uomConversions"] = tables.uomConversions.length;
      }
    }

    if (Array.isArray(tables.orders) && tables.orders.length > 0) {
      for (const o of tables.orders) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [HoaDon] (id, code, channel, status, customerId, customerName, customerPhone, customerAddress, customerRank, subtotal, discountAmount, discountCode, taxRate, taxAmount, shippingFee, shippingPartner, trackingCode, total, totalCost, profit, paymentMethod, paymentStatus, paidAmount, changeAmount, note, shiftId, createdAt, completedAt)
          VALUES (${escapeSqlStr(o.id)}, ${escapeSqlStr(o.code)}, ${escapeSqlStr(o.channel || "Tại quầy (POS)")}, ${escapeSqlStr(o.status || "completed")}, ${escapeSqlStr(o.customerId)}, ${escapeSqlStr(o.customerName)}, ${escapeSqlStr(o.customerPhone)}, ${escapeSqlStr(o.customerAddress)}, ${escapeSqlStr(o.customerRank)}, ${escapeSqlNum(o.subtotal)}, ${escapeSqlNum(o.discountAmount)}, ${escapeSqlStr(o.discountCode)}, ${escapeSqlNum(o.taxRate)}, ${escapeSqlNum(o.taxAmount)}, ${escapeSqlNum(o.shippingFee)}, ${escapeSqlStr(o.shippingPartner)}, ${escapeSqlStr(o.trackingCode)}, ${escapeSqlNum(o.total)}, ${escapeSqlNum(o.totalCost)}, ${escapeSqlNum(o.profit)}, ${escapeSqlStr(o.paymentMethod || "cash")}, ${escapeSqlStr(o.paymentStatus || "paid")}, ${escapeSqlNum(o.paidAmount || o.total)}, ${escapeSqlNum(o.changeAmount)}, ${escapeSqlStr(o.note || o.notes)}, ${escapeSqlStr(o.shiftId)}, ${escapeSqlDateRequired(o.createdAt)}, ${escapeSqlDate(o.completedAt)})
        `);
      }
      restoredStats["orders"] = tables.orders.length;

      if (Array.isArray(tables.orderItems) && tables.orderItems.length > 0) {
        for (const oi of tables.orderItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietHoaDon] (id, orderId, productId, productName, sku, unit, ratioToBase, quantity, unitPrice, costPrice, discountPercent, total)
            VALUES (${escapeSqlStr(oi.id)}, ${escapeSqlStr(oi.orderId)}, ${escapeSqlStr(oi.productId)}, ${escapeSqlStr(oi.productName)}, ${escapeSqlStr(oi.sku)}, ${escapeSqlStr(oi.unit)}, ${escapeSqlNum(oi.ratioToBase || 1)}, ${escapeSqlNum(oi.quantity || 1)}, ${escapeSqlNum(oi.unitPrice)}, ${escapeSqlNum(oi.costPrice)}, ${escapeSqlNum(oi.discountPercent)}, ${escapeSqlNum(oi.total)})
          `);
        }
        restoredStats["orderItems"] = tables.orderItems.length;
      }
    }

    if (Array.isArray(tables.inventoryLogs) && tables.inventoryLogs.length > 0) {
      for (const l of tables.inventoryLogs) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
          VALUES (${escapeSqlStr(l.id)}, ${escapeSqlStr(l.productId)}, ${escapeSqlStr(l.productName)}, ${escapeSqlStr(l.sku)}, ${escapeSqlStr(l.type)}, ${escapeSqlNum(l.quantityChange)}, ${escapeSqlNum(l.oldStock)}, ${escapeSqlNum(l.newStock)}, ${escapeSqlNumNullable(l.unitPrice)}, ${escapeSqlStr(l.reason || "")}, ${escapeSqlStr(l.performedBy || "Hệ thống")}, ${escapeSqlDateRequired(l.timestamp)})
        `);
      }
      restoredStats["inventoryLogs"] = tables.inventoryLogs.length;
    }

    if (Array.isArray(tables.priceQuotes) && tables.priceQuotes.length > 0) {
      for (const q of tables.priceQuotes) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [BaoGia] (id, code, customerName, customerPhone, customerCompany, totalAmount, discountPercent, finalTotal, validUntil, status, createdAt, notes)
          VALUES (${escapeSqlStr(q.id)}, ${escapeSqlStr(q.code)}, ${escapeSqlStr(q.customerName)}, ${escapeSqlStr(q.customerPhone)}, ${escapeSqlStr(q.customerCompany)}, ${escapeSqlNum(q.totalAmount || q.subtotal || q.total)}, ${escapeSqlNum(q.discountPercent)}, ${escapeSqlNum(q.finalTotal || q.total)}, ${escapeSqlDateRequired(q.validUntil)}, ${escapeSqlStr(q.status || "draft")}, ${escapeSqlDateRequired(q.createdAt)}, ${escapeSqlStr(q.notes)})
        `);
      }
      restoredStats["quotes"] = tables.priceQuotes.length;

      if (Array.isArray(tables.priceQuoteItems) && tables.priceQuoteItems.length > 0) {
        for (const qi of tables.priceQuoteItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietBaoGia] (id, quoteId, productName, sku, unit, quantity, unitPrice, total)
            VALUES (${escapeSqlStr(qi.id)}, ${escapeSqlStr(qi.quoteId)}, ${escapeSqlStr(qi.productName)}, ${escapeSqlStr(qi.sku)}, ${escapeSqlStr(qi.unit)}, ${escapeSqlNum(qi.quantity || 1)}, ${escapeSqlNum(qi.unitPrice)}, ${escapeSqlNum(qi.total)})
          `);
        }
        restoredStats["priceQuoteItems"] = tables.priceQuoteItems.length;
      }
    }

    if (Array.isArray(tables.productCostings) && tables.productCostings.length > 0) {
      for (const c of tables.productCostings) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [DinhMucSanXuat] (id, productName, sku, rawMaterialsCost, laborCost, machineryAndOverheadCost, totalStandardCost, currentSellingPrice, grossMarginPercent, lastUpdated)
          VALUES (${escapeSqlStr(c.id)}, ${escapeSqlStr(c.productName)}, ${escapeSqlStr(c.sku)}, ${escapeSqlNum(c.rawMaterialsCost)}, ${escapeSqlNum(c.laborCost)}, ${escapeSqlNum(c.machineryAndOverheadCost)}, ${escapeSqlNum(c.totalStandardCost)}, ${escapeSqlNum(c.currentSellingPrice)}, ${escapeSqlNum(c.grossMarginPercent)}, ${escapeSqlDateRequired(c.lastUpdated)})
        `);
      }
      restoredStats["costings"] = tables.productCostings.length;

      if (Array.isArray(tables.costingBOMItems) && tables.costingBOMItems.length > 0) {
        for (const bi of tables.costingBOMItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietDinhMucBOM] (id, costingId, materialName, quantity, unit, unitCost, totalCost)
            VALUES (${escapeSqlStr(bi.id)}, ${escapeSqlStr(bi.costingId)}, ${escapeSqlStr(bi.materialName)}, ${escapeSqlNum(bi.quantity || 1)}, ${escapeSqlStr(bi.unit)}, ${escapeSqlNum(bi.unitCost)}, ${escapeSqlNum(bi.totalCost)})
          `);
        }
        restoredStats["costingBOMItems"] = tables.costingBOMItems.length;
      }
    }

    if (Array.isArray(tables.stockGoodsReceipts) && tables.stockGoodsReceipts.length > 0) {
      for (const r of tables.stockGoodsReceipts) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [PhieuNhapKho] (id, code, date, inboundInvoiceId, inboundInvoiceCode, supplierName, supplierTaxCode, warehouseName, creatorName, receivedBy, totalItemsCount, totalQuantity, totalCostAmount, totalTaxAmount, grandTotal, paymentStatus, notes)
          VALUES (${escapeSqlStr(r.id)}, ${escapeSqlStr(r.code)}, ${escapeSqlDateRequired(r.date)}, ${escapeSqlStr(r.inboundInvoiceId)}, ${escapeSqlStr(r.inboundInvoiceCode)}, ${escapeSqlStr(r.supplierName)}, ${escapeSqlStr(r.supplierTaxCode)}, ${escapeSqlStr(r.warehouseName || 'Kho Chính')}, ${escapeSqlStr(r.creatorName || 'Admin')}, ${escapeSqlStr(r.receivedBy || 'Thủ Kho')}, ${escapeSqlNum(r.totalItemsCount)}, ${escapeSqlNum(r.totalQuantity)}, ${escapeSqlNum(r.totalCostAmount)}, ${escapeSqlNum(r.totalTaxAmount)}, ${escapeSqlNum(r.grandTotal)}, ${escapeSqlStr(r.paymentStatus || 'paid')}, ${escapeSqlStr(r.notes)})
        `);
      }
      restoredStats["stockGoodsReceipts"] = tables.stockGoodsReceipts.length;

      if (Array.isArray(tables.stockGoodsReceiptItems) && tables.stockGoodsReceiptItems.length > 0) {
        for (const ri of tables.stockGoodsReceiptItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, notes)
            VALUES (${escapeSqlStr(ri.id)}, ${escapeSqlStr(ri.receiptId)}, ${escapeSqlStr(ri.productId)}, ${escapeSqlStr(ri.productName)}, ${escapeSqlStr(ri.sku)}, ${escapeSqlStr(ri.unit)}, ${escapeSqlNum(ri.quantity || 1)}, ${escapeSqlNum(ri.oldStock)}, ${escapeSqlNum(ri.newStock)}, ${escapeSqlNum(ri.oldCostPrice)}, ${escapeSqlNum(ri.newCostPrice)}, ${escapeSqlNum(ri.unitCost)}, ${escapeSqlNum(ri.taxRate)}, ${escapeSqlNum(ri.totalAmount)}, ${escapeSqlStr(ri.storageLocation)}, ${escapeSqlStr(ri.warehouse)}, ${escapeSqlStr(ri.category)}, ${escapeSqlStr(ri.notes)})
          `);
        }
        restoredStats["stockGoodsReceiptItems"] = tables.stockGoodsReceiptItems.length;
      }
    }

    if (Array.isArray(tables.warrantyTickets) && tables.warrantyTickets.length > 0) {
      for (const w of tables.warrantyTickets) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [PhieuBaoHanh] (id, code, type, priority, status, orderCode, productId, productName, model, serialNumber, qrCodeUrl, customerName, customerPhone, customerAddress, customerEmail, accessoriesIncluded, cosmeticCondition, issueDescription, technicianDiagnosis, resolution, technicianName, receivedDate, expectedReturnDate, actualReturnDate, laborCost, partsCost, discountAmount, totalFee, paymentStatus, paidAmount, returnedToPerson, returnNote, warrantyExtensionMonths)
          VALUES (${escapeSqlStr(w.id)}, ${escapeSqlStr(w.code)}, ${escapeSqlStr(w.type || "warranty")}, ${escapeSqlStr(w.priority || "normal")}, ${escapeSqlStr(w.status || "received")}, ${escapeSqlStr(w.orderCode)}, ${escapeSqlStr(w.productId)}, ${escapeSqlStr(w.productName || w.deviceName || "Thiết bị")}, ${escapeSqlStr(w.model)}, ${escapeSqlStr(w.serialNumber || "")}, ${escapeSqlStr(w.qrCodeUrl)}, ${escapeSqlStr(w.customerName)}, ${escapeSqlStr(w.customerPhone)}, ${escapeSqlStr(w.customerAddress)}, ${escapeSqlStr(w.customerEmail)}, ${escapeSqlStr(w.accessoriesIncluded)}, ${escapeSqlStr(w.cosmeticCondition)}, ${escapeSqlStr(w.issueDescription || "")}, ${escapeSqlStr(w.technicianDiagnosis)}, ${escapeSqlStr(w.resolution)}, ${escapeSqlStr(w.technicianName || "Kỹ thuật viên")}, ${escapeSqlDateRequired(w.receivedDate)}, ${escapeSqlDateRequired(w.expectedReturnDate)}, ${escapeSqlDate(w.actualReturnDate)}, ${escapeSqlNum(w.laborCost)}, ${escapeSqlNum(w.partsCost)}, ${escapeSqlNum(w.discountAmount)}, ${escapeSqlNum(w.totalFee)}, ${escapeSqlStr(w.paymentStatus || "free")}, ${escapeSqlNum(w.paidAmount)}, ${escapeSqlStr(w.returnedToPerson)}, ${escapeSqlStr(w.returnNote)}, ${escapeSqlNum(w.warrantyExtensionMonths)})
        `);
      }
      restoredStats["warrantyTickets"] = tables.warrantyTickets.length;

      if (Array.isArray(tables.warrantyPartItems) && tables.warrantyPartItems.length > 0) {
        for (const pi of tables.warrantyPartItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [LinhKienBaoHanh] (id, warrantyId, partName, sku, quantity, unit, unitPrice, isUnderWarranty, warrantyMonths)
            VALUES (${escapeSqlStr(pi.id)}, ${escapeSqlStr(pi.warrantyId)}, ${escapeSqlStr(pi.partName)}, ${escapeSqlStr(pi.sku)}, ${escapeSqlNum(pi.quantity || 1)}, ${escapeSqlStr(pi.unit)}, ${escapeSqlNum(pi.unitPrice)}, ${escapeSqlBit(pi.isUnderWarranty, true)}, ${escapeSqlNum(pi.warrantyMonths)})
          `);
        }
        restoredStats["warrantyPartItems"] = tables.warrantyPartItems.length;
      }

      if (Array.isArray(tables.warrantyTimelineEvents) && tables.warrantyTimelineEvents.length > 0) {
        for (const tl of tables.warrantyTimelineEvents) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [NhatKyBaoHanh] (id, warrantyId, timestamp, action, actor, notes, status)
            VALUES (${escapeSqlStr(tl.id)}, ${escapeSqlStr(tl.warrantyId)}, ${escapeSqlDateRequired(tl.timestamp)}, ${escapeSqlStr(tl.action)}, ${escapeSqlStr(tl.actor)}, ${escapeSqlStr(tl.notes)}, ${escapeSqlStr(tl.status)})
          `);
        }
        restoredStats["warrantyTimelineEvents"] = tables.warrantyTimelineEvents.length;
      }
    }

    if (Array.isArray(tables.serialDeviceRecords) && tables.serialDeviceRecords.length > 0) {
      for (const s of tables.serialDeviceRecords) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [SoSerialThietBi] (id, serialNumber, productName, sku, soldOrderCode, soldDate, customerName, customerPhone, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
          VALUES (${escapeSqlStr(s.id)}, ${escapeSqlStr(s.serialNumber)}, ${escapeSqlStr(s.productName)}, ${escapeSqlStr(s.sku || s.productSku || "")}, ${escapeSqlStr(s.soldOrderCode)}, ${escapeSqlDate(s.soldDate)}, ${escapeSqlStr(s.customerName)}, ${escapeSqlStr(s.customerPhone)}, ${escapeSqlNum(s.warrantyPeriodMonths || s.warrantyMonths || 12)}, ${escapeSqlDateRequired(s.warrantyExpiryDate)}, ${escapeSqlStr(s.warrantyStatus || "valid")}, ${escapeSqlNum(s.totalRepairsCount)}, ${escapeSqlNum(s.totalMaintenancesCount)}, ${escapeSqlStr(s.notes)})
        `);
      }
      restoredStats["serialRecords"] = tables.serialDeviceRecords.length;
    }

    if (Array.isArray(tables.accountingRecords) && tables.accountingRecords.length > 0) {
      for (const a of tables.accountingRecords) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
          VALUES (${escapeSqlStr(a.id)}, ${escapeSqlStr(a.code)}, ${escapeSqlStr(a.type)}, ${escapeSqlStr(a.category)}, ${escapeSqlNum(a.amount)}, ${escapeSqlDateRequired(a.date)}, ${escapeSqlStr(a.party)}, ${escapeSqlStr(a.paymentMethod || "cash")}, ${escapeSqlStr(a.status || "completed")}, ${escapeSqlStr(a.note)}, ${escapeSqlStr(a.receiptNumber)})
        `);
      }
      restoredStats["accountingRecords"] = tables.accountingRecords.length;
    }

    if (Array.isArray(tables.employees) && tables.employees.length > 0) {
      for (const emp of tables.employees) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [NhanVien] (id, code, name, role, phone, email, baseSalary, salesKpiTarget, currentSales, commissionRate, status, avatar, joinedDate, shiftSchedule)
          VALUES (${escapeSqlStr(emp.id)}, ${escapeSqlStr(emp.code)}, ${escapeSqlStr(emp.name)}, ${escapeSqlStr(emp.role)}, ${escapeSqlStr(emp.phone)}, ${escapeSqlStr(emp.email)}, ${escapeSqlNum(emp.baseSalary)}, ${escapeSqlNum(emp.salesKpiTarget)}, ${escapeSqlNum(emp.currentSales)}, ${escapeSqlNum(emp.commissionRate)}, ${escapeSqlStr(emp.status || "active")}, ${escapeSqlStr(emp.avatar)}, ${escapeSqlDateRequired(emp.joinedDate)}, ${escapeSqlStr(emp.shiftSchedule)})
        `);
      }
      restoredStats["employees"] = tables.employees.length;
    }

    if (Array.isArray(tables.laborContracts) && tables.laborContracts.length > 0) {
      for (const lc of tables.laborContracts) {
        const employerData = typeof lc.employerData === "string" ? lc.employerData : JSON.stringify(lc.employerData || {});
        const employeeInfo = typeof lc.employeeInfo === "string" ? lc.employeeInfo : JSON.stringify(lc.employeeInfo || {});
        const termsData = typeof lc.termsData === "string" ? lc.termsData : JSON.stringify(lc.termsData || {});
        const signaturesData = typeof lc.signaturesData === "string" ? lc.signaturesData : JSON.stringify(lc.signaturesData || {});
        await prisma.$executeRawUnsafe(`
          INSERT INTO [HopDongLaoDong] (id, contractNumber, employeeId, employeeCode, employeeName, employeeRole, contractType, startDate, endDate, signDate, status, employerData, employeeInfo, termsData, signaturesData, notes)
          VALUES (${escapeSqlStr(lc.id)}, ${escapeSqlStr(lc.contractNumber)}, ${escapeSqlStr(lc.employeeId)}, ${escapeSqlStr(lc.employeeCode)}, ${escapeSqlStr(lc.employeeName)}, ${escapeSqlStr(lc.employeeRole)}, ${escapeSqlStr(lc.contractType)}, ${escapeSqlDateRequired(lc.startDate)}, ${escapeSqlDate(lc.endDate)}, ${escapeSqlDateRequired(lc.signDate)}, ${escapeSqlStr(lc.status || "active")}, ${escapeSqlStr(employerData)}, ${escapeSqlStr(employeeInfo)}, ${escapeSqlStr(termsData)}, ${escapeSqlStr(signaturesData)}, ${escapeSqlStr(lc.notes)})
        `);
      }
      restoredStats["laborContracts"] = tables.laborContracts.length;
    }

    if (Array.isArray(tables.enterpriseAssets) && tables.enterpriseAssets.length > 0) {
      for (const ast of tables.enterpriseAssets) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [TaiSanDoanhNghiep] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status, lastMaintenanceDate)
          VALUES (${escapeSqlStr(ast.id)}, ${escapeSqlStr(ast.code)}, ${escapeSqlStr(ast.name)}, ${escapeSqlStr(ast.category)}, ${escapeSqlDateRequired(ast.purchaseDate)}, ${escapeSqlNum(ast.originalValue)}, ${escapeSqlNum(ast.depreciationMonths || 12)}, ${escapeSqlNum(ast.remainingValue)}, ${escapeSqlStr(ast.assignedTo)}, ${escapeSqlStr(ast.status || "good")}, ${escapeSqlDate(ast.lastMaintenanceDate)})
        `);
      }
      restoredStats["assets"] = tables.enterpriseAssets.length;
    }

    if (Array.isArray(tables.eInvoices) && tables.eInvoices.length > 0) {
      for (const inv of tables.eInvoices) {
        const sellerData = typeof inv.sellerData === "string" ? inv.sellerData : JSON.stringify(inv.sellerData || {});
        const buyerData = typeof inv.buyerData === "string" ? inv.buyerData : JSON.stringify(inv.buyerData || {});
        const digitalSignature = inv.digitalSignature ? (typeof inv.digitalSignature === "string" ? inv.digitalSignature : JSON.stringify(inv.digitalSignature)) : null;
        await prisma.$executeRawUnsafe(`
          INSERT INTO [HoaDonDienTu] (id, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, invoiceType, cqtCode, lookupCode, lookupUrl, issueDate, signDate, status, orderId, orderCode, sellerData, buyerData, subtotal, discountAmount, taxRate, taxAmount, totalAmount, amountInWords, paymentMethod, notes, digitalSignature, cqtStatusMessage)
          VALUES (${escapeSqlStr(inv.id)}, ${escapeSqlStr(inv.invoiceCode)}, ${escapeSqlStr(inv.invoiceNumber)}, ${escapeSqlStr(inv.invoiceSymbol)}, ${escapeSqlStr(inv.invoiceTemplate)}, ${escapeSqlStr(inv.invoiceType || "vat")}, ${escapeSqlStr(inv.cqtCode)}, ${escapeSqlStr(inv.lookupCode || inv.invoiceCode)}, ${escapeSqlStr(inv.lookupUrl || "https://hoadondientu.gdt.gov.vn")}, ${escapeSqlDateRequired(inv.issueDate)}, ${escapeSqlDate(inv.signDate)}, ${escapeSqlStr(inv.status || "signed")}, ${escapeSqlStr(inv.orderId)}, ${escapeSqlStr(inv.orderCode)}, ${escapeSqlStr(sellerData)}, ${escapeSqlStr(buyerData)}, ${escapeSqlNum(inv.subtotal)}, ${escapeSqlNum(inv.discountAmount)}, ${escapeSqlNum(inv.taxRate)}, ${escapeSqlNum(inv.taxAmount)}, ${escapeSqlNum(inv.totalAmount)}, ${escapeSqlStr(inv.amountInWords || "")}, ${escapeSqlStr(inv.paymentMethod || "TM/CK")}, ${escapeSqlStr(inv.notes)}, ${escapeSqlStr(digitalSignature)}, ${escapeSqlStr(inv.cqtStatusMessage)})
        `);
      }
      restoredStats["eInvoices"] = tables.eInvoices.length;

      if (Array.isArray(tables.eInvoiceItems) && tables.eInvoiceItems.length > 0) {
        for (const ii of tables.eInvoiceItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietHoaDonDienTu] (id, invoiceId, sku, productName, unit, quantity, unitPrice, subtotal, discountPercent, discountAmount, taxRate, taxAmount, total)
            VALUES (${escapeSqlStr(ii.id)}, ${escapeSqlStr(ii.invoiceId)}, ${escapeSqlStr(ii.sku)}, ${escapeSqlStr(ii.productName)}, ${escapeSqlStr(ii.unit)}, ${escapeSqlNum(ii.quantity || 1)}, ${escapeSqlNum(ii.unitPrice)}, ${escapeSqlNum(ii.subtotal)}, ${escapeSqlNum(ii.discountPercent)}, ${escapeSqlNum(ii.discountAmount)}, ${escapeSqlNum(ii.taxRate)}, ${escapeSqlNum(ii.taxAmount)}, ${escapeSqlNum(ii.total)})
          `);
        }
        restoredStats["eInvoiceItems"] = tables.eInvoiceItems.length;
      }
    }

    if (Array.isArray(tables.inboundEInvoices) && tables.inboundEInvoices.length > 0) {
      for (const inb of tables.inboundEInvoices) {
        const sellerData = typeof inb.sellerData === "string" ? inb.sellerData : JSON.stringify(inb.sellerData || {});
        const buyerData = typeof inb.buyerData === "string" ? inb.buyerData : JSON.stringify(inb.buyerData || {});
        await prisma.$executeRawUnsafe(`
          INSERT INTO [HoaDonDauVao] (id, source, sourceDetail, sourceFile, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, issueDate, receivedDate, cqtCode, lookupCode, lookupUrl, sellerData, buyerData, subtotal, taxRate, taxAmount, totalAmount, amountInWords, status, goodsReceiptId, importedAt, importedBy, targetWarehouse, accountingRecordId, notes, rawXmlContent)
          VALUES (${escapeSqlStr(inb.id)}, ${escapeSqlStr(inb.source || "xml_upload")}, ${escapeSqlStr(inb.sourceDetail)}, ${escapeSqlStr(inb.sourceFile)}, ${escapeSqlStr(inb.invoiceCode)}, ${escapeSqlStr(inb.invoiceNumber)}, ${escapeSqlStr(inb.invoiceSymbol)}, ${escapeSqlStr(inb.invoiceTemplate)}, ${escapeSqlDateRequired(inb.issueDate)}, ${escapeSqlDateRequired(inb.receivedDate)}, ${escapeSqlStr(inb.cqtCode)}, ${escapeSqlStr(inb.lookupCode)}, ${escapeSqlStr(inb.lookupUrl)}, ${escapeSqlStr(sellerData)}, ${escapeSqlStr(buyerData)}, ${escapeSqlNum(inb.subtotal)}, ${escapeSqlNum(inb.taxRate)}, ${escapeSqlNum(inb.taxAmount)}, ${escapeSqlNum(inb.totalAmount)}, ${escapeSqlStr(inb.amountInWords || "")}, ${escapeSqlStr(inb.status || "pending_review")}, ${escapeSqlStr(inb.goodsReceiptId)}, ${escapeSqlDate(inb.importedAt)}, ${escapeSqlStr(inb.importedBy)}, ${escapeSqlStr(inb.targetWarehouse)}, ${escapeSqlStr(inb.accountingRecordId)}, ${escapeSqlStr(inb.notes)}, ${escapeSqlStr(inb.rawXmlContent)})
        `);
      }
      restoredStats["inboundEInvoices"] = tables.inboundEInvoices.length;

      if (Array.isArray(tables.inboundInvoiceItems) && tables.inboundInvoiceItems.length > 0) {
        for (const item of tables.inboundInvoiceItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietHoaDonDauVao] (id, inboundInvoiceId, lineNumber, productName, skuOrCode, unit, quantity, unitPrice, subtotal, taxRate, taxAmount, total, matchedProductId, matchedProductName, matchedProductSku, currentStock, currentCostPrice, ratioToBaseUnit, isNewProduct, status, assignedCategory, assignedWarehouse, assignedStorageLocation, suggestedSellingPrice, customSku, customBarcode)
            VALUES (${escapeSqlStr(item.id)}, ${escapeSqlStr(item.inboundInvoiceId)}, ${escapeSqlNum(item.lineNumber || 1)}, ${escapeSqlStr(item.productName)}, ${escapeSqlStr(item.skuOrCode)}, ${escapeSqlStr(item.unit)}, ${escapeSqlNum(item.quantity || 1)}, ${escapeSqlNum(item.unitPrice)}, ${escapeSqlNum(item.subtotal)}, ${escapeSqlNum(item.taxRate)}, ${escapeSqlNum(item.taxAmount)}, ${escapeSqlNum(item.total)}, ${escapeSqlStr(item.matchedProductId)}, ${escapeSqlStr(item.matchedProductName)}, ${escapeSqlStr(item.matchedProductSku)}, ${escapeSqlNumNullable(item.currentStock)}, ${escapeSqlNumNullable(item.currentCostPrice)}, ${escapeSqlNum(item.ratioToBaseUnit || 1)}, ${escapeSqlBit(item.isNewProduct, false)}, ${escapeSqlStr(item.status || "unmatched")}, ${escapeSqlStr(item.assignedCategory)}, ${escapeSqlStr(item.assignedWarehouse)}, ${escapeSqlStr(item.assignedStorageLocation)}, ${escapeSqlNumNullable(item.suggestedSellingPrice)}, ${escapeSqlStr(item.customSku)}, ${escapeSqlStr(item.customBarcode)})
          `);
        }
        restoredStats["inboundInvoiceItems"] = tables.inboundInvoiceItems.length;
      }
    }

    if (Array.isArray(tables.promotions) && tables.promotions.length > 0) {
      for (const p of tables.promotions) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [ChuongTrinhKhuyenMai] (id, code, title, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, usedCount, startDate, endDate, isActive)
          VALUES (${escapeSqlStr(p.id)}, ${escapeSqlStr(p.code)}, ${escapeSqlStr(p.title)}, ${escapeSqlStr(p.discountType)}, ${escapeSqlNum(p.discountValue)}, ${escapeSqlNum(p.minOrderValue)}, ${escapeSqlNumNullable(p.maxDiscount)}, ${escapeSqlNum(p.usageLimit || 100)}, ${escapeSqlNum(p.usedCount)}, ${escapeSqlDateRequired(p.startDate)}, ${escapeSqlDateRequired(p.endDate)}, ${escapeSqlBit(p.isActive, true)})
        `);
      }
      restoredStats["promotions"] = tables.promotions.length;
    }

    if (Array.isArray(tables.fraudAlerts) && tables.fraudAlerts.length > 0) {
      for (const f of tables.fraudAlerts) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [CanhBaoGianLan] (id, severity, title, description, timestamp, source, status, suggestedAction)
          VALUES (${escapeSqlStr(f.id)}, ${escapeSqlStr(f.severity || "medium")}, ${escapeSqlStr(f.title)}, ${escapeSqlStr(f.description)}, ${escapeSqlDateRequired(f.timestamp)}, ${escapeSqlStr(f.source || "POS")}, ${escapeSqlStr(f.status || "unresolved")}, ${escapeSqlStr(f.suggestedAction || "")})
        `);
      }
      restoredStats["fraudAlerts"] = tables.fraudAlerts.length;
    }

    if (Array.isArray(tables.cashShifts) && tables.cashShifts.length > 0) {
      for (const cs of tables.cashShifts) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [CaBanHang] (id, shiftName, staffId, staffName, startTime, endTime, initialCash, cashSales, transferSales, cardSales, otherSales, totalSales, cashWithdrawals, expectedEndingCash, actualEndingCash, note, status)
          VALUES (${escapeSqlStr(cs.id)}, ${escapeSqlStr(cs.shiftName)}, ${escapeSqlStr(cs.staffId)}, ${escapeSqlStr(cs.staffName)}, ${escapeSqlDateRequired(cs.startTime)}, ${escapeSqlDate(cs.endTime)}, ${escapeSqlNum(cs.initialCash)}, ${escapeSqlNum(cs.cashSales)}, ${escapeSqlNum(cs.transferSales)}, ${escapeSqlNum(cs.cardSales)}, ${escapeSqlNum(cs.otherSales)}, ${escapeSqlNum(cs.totalSales)}, ${escapeSqlNum(cs.cashWithdrawals)}, ${escapeSqlNum(cs.expectedEndingCash)}, ${escapeSqlNumNullable(cs.actualEndingCash)}, ${escapeSqlStr(cs.note)}, ${escapeSqlStr(cs.status || "open")})
        `);
      }
      restoredStats["cashShifts"] = tables.cashShifts.length;
    }

    if (Array.isArray(tables.suppliers) && tables.suppliers.length > 0) {
      for (const sup of tables.suppliers) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [NhaCungCap] (id, code, name, taxCode, tier, category, contactPerson, phone, email, address, bankName, bankAccount, bankCode, creditLimit, creditDays, currentDebt, ratingQuality, ratingPrice, ratingOnTime, ratingWarranty, notes, createdAt, updatedAt)
          VALUES (${escapeSqlStr(sup.id)}, ${escapeSqlStr(sup.code)}, ${escapeSqlStr(sup.name)}, ${escapeSqlStr(sup.taxCode)}, ${escapeSqlStr(sup.tier || "Tổng Đại Lý")}, ${escapeSqlStr(sup.category || "Camera & An Ninh")}, ${escapeSqlStr(sup.contactPerson)}, ${escapeSqlStr(sup.phone)}, ${escapeSqlStr(sup.email)}, ${escapeSqlStr(sup.address)}, ${escapeSqlStr(sup.bankName)}, ${escapeSqlStr(sup.bankAccount)}, ${escapeSqlStr(sup.bankCode)}, ${escapeSqlNum(sup.creditLimit)}, ${escapeSqlNum(sup.creditDays || 30)}, ${escapeSqlNum(sup.currentDebt)}, ${escapeSqlNum(sup.ratingQuality || 9.5)}, ${escapeSqlNum(sup.ratingPrice || 9.0)}, ${escapeSqlNum(sup.ratingOnTime || 9.5)}, ${escapeSqlNum(sup.ratingWarranty || 9.2)}, ${escapeSqlStr(sup.notes)}, ${escapeSqlDateRequired(sup.createdAt)}, ${escapeSqlDateRequired(sup.updatedAt)})
        `);
      }
      restoredStats["suppliers"] = tables.suppliers.length;

      if (Array.isArray(tables.supplierPriceItems) && tables.supplierPriceItems.length > 0) {
        for (const pi of tables.supplierPriceItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [BangGiaNhaCungCap] (id, supplierId, sku, productName, costPrice, warrantyMonths, moq)
            VALUES (${escapeSqlStr(pi.id)}, ${escapeSqlStr(pi.supplierId)}, ${escapeSqlStr(pi.sku)}, ${escapeSqlStr(pi.productName)}, ${escapeSqlNum(pi.costPrice)}, ${escapeSqlNum(pi.warrantyMonths || 12)}, ${escapeSqlNum(pi.moq || 1)})
          `);
        }
        restoredStats["supplierPriceItems"] = tables.supplierPriceItems.length;
      }
    }

    if (Array.isArray(tables.purchaseOrders) && tables.purchaseOrders.length > 0) {
      for (const po of tables.purchaseOrders) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [DonDatHangMua] (id, code, supplierId, supplierName, supplierPhone, supplierAddress, supplierTaxCode, warehouseId, warehouseName, orderDate, expectedDeliveryDate, status, subtotal, vatRate, vatAmount, shippingFee, discountAmount, totalAmount, paidAmount, paymentStatus, paymentMethod, notes, createdAt, updatedAt)
          VALUES (${escapeSqlStr(po.id)}, ${escapeSqlStr(po.code)}, ${escapeSqlStr(po.supplierId)}, ${escapeSqlStr(po.supplierName)}, ${escapeSqlStr(po.supplierPhone)}, ${escapeSqlStr(po.supplierAddress)}, ${escapeSqlStr(po.supplierTaxCode)}, ${escapeSqlStr(po.warehouseId || "wh-main")}, ${escapeSqlStr(po.warehouseName || "Kho Chính")}, ${escapeSqlDateRequired(po.orderDate)}, ${escapeSqlDateRequired(po.expectedDeliveryDate)}, ${escapeSqlStr(po.status || "confirmed")}, ${escapeSqlNum(po.subtotal)}, ${escapeSqlNum(po.vatRate || 10)}, ${escapeSqlNum(po.vatAmount)}, ${escapeSqlNum(po.shippingFee)}, ${escapeSqlNum(po.discountAmount)}, ${escapeSqlNum(po.totalAmount)}, ${escapeSqlNum(po.paidAmount)}, ${escapeSqlStr(po.paymentStatus || "unpaid")}, ${escapeSqlStr(po.paymentMethod || "transfer")}, ${escapeSqlStr(po.notes)}, ${escapeSqlDateRequired(po.createdAt)}, ${escapeSqlDateRequired(po.updatedAt)})
        `);
      }
      restoredStats["purchaseOrders"] = tables.purchaseOrders.length;

      if (Array.isArray(tables.purchaseOrderItems) && tables.purchaseOrderItems.length > 0) {
        for (const poi of tables.purchaseOrderItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietDonDatHangMua] (id, purchaseOrderId, productId, sku, productName, unit, quantity, unitPrice, total)
            VALUES (${escapeSqlStr(poi.id)}, ${escapeSqlStr(poi.purchaseOrderId)}, ${escapeSqlStr(poi.productId)}, ${escapeSqlStr(poi.sku)}, ${escapeSqlStr(poi.productName)}, ${escapeSqlStr(poi.unit || "Cái")}, ${escapeSqlNum(poi.quantity || 1)}, ${escapeSqlNum(poi.unitPrice)}, ${escapeSqlNum(poi.total)})
          `);
        }
        restoredStats["purchaseOrderItems"] = tables.purchaseOrderItems.length;
      }
    }

    if (Array.isArray(tables.returnOrders) && tables.returnOrders.length > 0) {
      for (const ret of tables.returnOrders) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [PhieuTraHang] (id, code, type, originalOrderCode, originalOrderId, customerId, customerName, customerPhone, supplierId, supplierName, warehouse, refundMethod, refundAmount, totalReturnQuantity, reason, destinationType, status, performedBy, notes, createdAt)
          VALUES (${escapeSqlStr(ret.id)}, ${escapeSqlStr(ret.code)}, ${escapeSqlStr(ret.type || "customer_return")}, ${escapeSqlStr(ret.originalOrderCode)}, ${escapeSqlStr(ret.originalOrderId)}, ${escapeSqlStr(ret.customerId)}, ${escapeSqlStr(ret.customerName)}, ${escapeSqlStr(ret.customerPhone)}, ${escapeSqlStr(ret.supplierId)}, ${escapeSqlStr(ret.supplierName)}, ${escapeSqlStr(ret.warehouse || "Kho Chính")}, ${escapeSqlStr(ret.refundMethod || "cash")}, ${escapeSqlNum(ret.refundAmount)}, ${escapeSqlNum(ret.totalReturnQuantity)}, ${escapeSqlStr(ret.reason)}, ${escapeSqlStr(ret.destinationType || "restock")}, ${escapeSqlStr(ret.status || "completed")}, ${escapeSqlStr(ret.performedBy || "Thu ngân")}, ${escapeSqlStr(ret.notes)}, ${escapeSqlDateRequired(ret.createdAt)})
        `);
      }
      restoredStats["returnOrders"] = tables.returnOrders.length;

      if (Array.isArray(tables.returnOrderItems) && tables.returnOrderItems.length > 0) {
        for (const roi of tables.returnOrderItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietPhieuTraHang] (id, returnOrderId, productId, productName, sku, unit, ratioToBase, quantity, unitPrice, refundUnitPrice, totalRefund, serialNumber, condition)
            VALUES (${escapeSqlStr(roi.id)}, ${escapeSqlStr(roi.returnOrderId)}, ${escapeSqlStr(roi.productId)}, ${escapeSqlStr(roi.productName)}, ${escapeSqlStr(roi.sku)}, ${escapeSqlStr(roi.unit || "Cái")}, ${escapeSqlNum(roi.ratioToBase || 1)}, ${escapeSqlNum(roi.quantity || 1)}, ${escapeSqlNum(roi.unitPrice)}, ${escapeSqlNum(roi.refundUnitPrice)}, ${escapeSqlNum(roi.totalRefund)}, ${escapeSqlStr(roi.serialNumber)}, ${escapeSqlStr(roi.condition || "normal")})
          `);
        }
        restoredStats["returnOrderItems"] = tables.returnOrderItems.length;
      }
    }

    if (Array.isArray(tables.stockTransfers) && tables.stockTransfers.length > 0) {
      for (const st of tables.stockTransfers) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO [PhieuDieuChuyenKho] (id, code, fromWarehouse, toWarehouse, transferDate, receivedDate, status, totalItems, totalQuantity, senderName, receiverName, transportMethod, trackingNumber, notes, createdAt)
          VALUES (${escapeSqlStr(st.id)}, ${escapeSqlStr(st.code)}, ${escapeSqlStr(st.fromWarehouse)}, ${escapeSqlStr(st.toWarehouse)}, ${escapeSqlDateRequired(st.transferDate)}, ${escapeSqlDate(st.receivedDate)}, ${escapeSqlStr(st.status || "in_transit")}, ${escapeSqlNum(st.totalItems || 1)}, ${escapeSqlNum(st.totalQuantity || 1)}, ${escapeSqlStr(st.senderName || "Thủ kho")}, ${escapeSqlStr(st.receiverName)}, ${escapeSqlStr(st.transportMethod)}, ${escapeSqlStr(st.trackingNumber)}, ${escapeSqlStr(st.notes)}, ${escapeSqlDateRequired(st.createdAt)})
        `);
      }
      restoredStats["stockTransfers"] = tables.stockTransfers.length;

      if (Array.isArray(tables.stockTransferItems) && tables.stockTransferItems.length > 0) {
        for (const sti of tables.stockTransferItems) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO [ChiTietDieuChuyenKho] (id, transferId, productId, productName, sku, unit, quantity, unitCost, totalCost)
            VALUES (${escapeSqlStr(sti.id)}, ${escapeSqlStr(sti.transferId)}, ${escapeSqlStr(sti.productId)}, ${escapeSqlStr(sti.productName)}, ${escapeSqlStr(sti.sku)}, ${escapeSqlStr(sti.unit || "Cái")}, ${escapeSqlNum(sti.quantity || 1)}, ${escapeSqlNum(sti.unitCost)}, ${escapeSqlNum(sti.totalCost)})
          `);
        }
        restoredStats["stockTransferItems"] = tables.stockTransferItems.length;
      }
    }

    // Step 13: Ensure Admin and settings are intact
    await this.ensureAdminAndSettings();

    return {
      success: true,
      message: "Khôi phục dữ liệu CSDL thành công từ file sao lưu!",
      stats: restoredStats,
    };
  }

  /**
   * Đảm bảo luôn có tài khoản Admin và Cấu hình mặc định
   */
  static async ensureAdminAndSettings() {
    const adminUsers = await prisma.user.findMany({ where: { username: "admin" } });
    if (adminUsers.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("123456", salt);
      await prisma.$executeRaw`
        IF NOT EXISTS (SELECT 1 FROM [NguoiDung] WHERE username = 'admin' OR id = 'usr-admin-01')
        BEGIN
          INSERT INTO [NguoiDung] (id, username, passwordHash, fullName, email, phone, role, status, createdAt, updatedAt)
          VALUES ('usr-admin-01', 'admin', ${passwordHash}, N'Quản Trị Viên Hệ Thống (Phạm Gia Phúc)', 'admin@vitinhgiaphuc.com', '0985862609', 'Admin', 'active', GETDATE(), GETDATE())
        END
      `;
    }

    const settings = await prisma.storeSettings.findMany({ where: { id: "default_settings" } });
    if (settings.length === 0) {
      await this.updateSettings({
        storeName: "Gia Phúc Computer",
        tagline: "Máy Tính - Laptop - Linh Kiện & Dịch Vụ Kỹ Thuật Chuyên Nghiệp",
        phone: "0985 862 609",
        email: "contact@vitinhgiaphuc.com",
        address: "Số 123 Đường Công Nghệ, TP. Hồ Chí Minh",
        taxCode: "0318999888",
        bankName: "MBBank - Ngân Hàng Quân Đội",
        bankAccount: "9988776655",
        bankCode: "MB",
        currency: "VND",
        taxRate: 8,
        theme: "light",
      });
    }
  }
}
