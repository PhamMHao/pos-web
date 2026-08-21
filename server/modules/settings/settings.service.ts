import prisma from "../../config/db";
import bcrypt from "bcryptjs";

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
      storeName = "Gia Phúc Computer",
      tagline = "",
      phone = "",
      email = "",
      address = "",
      taxCode = "",
      bankName = "",
      bankAccount = "",
      bankCode = "",
      ...rest
    } = data;

    const settingsJson = JSON.stringify(data);

    const existing = await prisma.storeSettings.findMany({
      where: { id: "default_settings" },
    });

    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [StoreSettings] (id, storeName, tagline, phone, email, address, taxCode, bankName, bankAccount, bankCode, settingsJson, updatedAt)
        VALUES ('default_settings', ${storeName}, ${tagline}, ${phone}, ${email}, ${address}, ${taxCode}, ${bankName}, ${bankAccount}, ${bankCode}, ${settingsJson}, GETDATE())
      `;
    } else {
      await prisma.storeSettings.updateMany({
        where: { id: "default_settings" },
        data: {
          storeName,
          tagline,
          phone,
          email,
          address,
          taxCode,
          bankName,
          bankAccount,
          bankCode,
          settingsJson,
        },
      });
    }

    return this.getSettings();
  }

  /**
   * 1. Xuất toàn bộ dữ liệu CSDL ra JSON sao lưu (Full Backup)
   */
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
    ]);

    const totalRecords =
      users.length +
      storeSettings.length +
      products.length +
      uomConversions.length +
      customers.length +
      orders.length +
      orderItems.length +
      inventoryLogs.length +
      stockGoodsReceipts.length +
      stockGoodsReceiptItems.length +
      priceQuotes.length +
      priceQuoteItems.length +
      productCostings.length +
      costingBOMItems.length +
      enterpriseAssets.length +
      warrantyTickets.length +
      warrantyPartItems.length +
      warrantyTimelineEvents.length +
      serialDeviceRecords.length +
      eInvoices.length +
      eInvoiceItems.length +
      inboundEInvoices.length +
      inboundInvoiceItems.length +
      employees.length +
      laborContracts.length +
      accountingRecords.length +
      promotions.length +
      fraudAlerts.length +
      cashShifts.length;

    const backupPayload = {
      system: "GP-ERP Enterprise",
      version: "2.0.0",
      createdAt: new Date().toISOString(),
      totalRecords,
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
      },
    };

    return backupPayload;
  }

  /**
   * 2. Xóa sạch toàn bộ dữ liệu CSDL (Wipe Data - Reset về Trắng)
   */
  static async wipeAllData(confirmation: string) {
    if (confirmation !== "XOA_DU_LIEU") {
      throw new Error("Mã xác nhận không chính xác. Vui lòng nhập đúng 'XOA_DU_LIEU' để xác nhận xóa sạch dữ liệu.");
    }

    // Delete in strict foreign key order
    await prisma.$executeRaw`DELETE FROM [OrderItem]`;
    await prisma.$executeRaw`DELETE FROM [Order]`;
    await prisma.$executeRaw`DELETE FROM [StockGoodsReceiptItem]`;
    await prisma.$executeRaw`DELETE FROM [StockGoodsReceipt]`;
    await prisma.$executeRaw`DELETE FROM [InventoryLog]`;
    await prisma.$executeRaw`DELETE FROM [CostingBOMItem]`;
    await prisma.$executeRaw`DELETE FROM [ProductCosting]`;
    await prisma.$executeRaw`DELETE FROM [ProductUOMConversion]`;
    await prisma.$executeRaw`DELETE FROM [Product]`;
    await prisma.$executeRaw`DELETE FROM [WarrantyPartItem]`;
    await prisma.$executeRaw`DELETE FROM [WarrantyTimelineEvent]`;
    await prisma.$executeRaw`DELETE FROM [WarrantyTicket]`;
    await prisma.$executeRaw`DELETE FROM [SerialDeviceRecord]`;
    await prisma.$executeRaw`DELETE FROM [PriceQuoteItem]`;
    await prisma.$executeRaw`DELETE FROM [PriceQuote]`;
    await prisma.$executeRaw`DELETE FROM [EInvoiceItem]`;
    await prisma.$executeRaw`DELETE FROM [EInvoice]`;
    await prisma.$executeRaw`DELETE FROM [InboundInvoiceItem]`;
    await prisma.$executeRaw`DELETE FROM [InboundEInvoice]`;
    await prisma.$executeRaw`DELETE FROM [LaborContract]`;
    await prisma.$executeRaw`DELETE FROM [Employee]`;
    await prisma.$executeRaw`DELETE FROM [EnterpriseAsset]`;
    await prisma.$executeRaw`DELETE FROM [AccountingRecord]`;
    await prisma.$executeRaw`DELETE FROM [Promotion]`;
    await prisma.$executeRaw`DELETE FROM [FraudAlert]`;
    await prisma.$executeRaw`DELETE FROM [CashShift]`;
    await prisma.$executeRaw`DELETE FROM [Customer]`;

    // Ensure Admin user and StoreSettings remain active
    await this.ensureAdminAndSettings();

    return {
      success: true,
      message: "Đã xóa sạch toàn bộ dữ liệu hệ thống thành công! CSDL hiện tại là dữ liệu trống (sẵn sàng nhập mới).",
    };
  }

  /**
   * 3. Khôi phục CSDL từ File Sao Lưu JSON (Restore Backup)
   */
  static async restoreDatabase(payload: any) {
    if (!payload || !payload.tables) {
      throw new Error("File sao lưu không đúng định dạng GP-ERP Enterprise Backup JSON.");
    }

    const { tables } = payload;

    // Step 1: Clear current data
    await prisma.$executeRaw`DELETE FROM [OrderItem]`;
    await prisma.$executeRaw`DELETE FROM [Order]`;
    await prisma.$executeRaw`DELETE FROM [StockGoodsReceiptItem]`;
    await prisma.$executeRaw`DELETE FROM [StockGoodsReceipt]`;
    await prisma.$executeRaw`DELETE FROM [InventoryLog]`;
    await prisma.$executeRaw`DELETE FROM [CostingBOMItem]`;
    await prisma.$executeRaw`DELETE FROM [ProductCosting]`;
    await prisma.$executeRaw`DELETE FROM [ProductUOMConversion]`;
    await prisma.$executeRaw`DELETE FROM [Product]`;
    await prisma.$executeRaw`DELETE FROM [WarrantyPartItem]`;
    await prisma.$executeRaw`DELETE FROM [WarrantyTimelineEvent]`;
    await prisma.$executeRaw`DELETE FROM [WarrantyTicket]`;
    await prisma.$executeRaw`DELETE FROM [SerialDeviceRecord]`;
    await prisma.$executeRaw`DELETE FROM [PriceQuoteItem]`;
    await prisma.$executeRaw`DELETE FROM [PriceQuote]`;
    await prisma.$executeRaw`DELETE FROM [EInvoiceItem]`;
    await prisma.$executeRaw`DELETE FROM [EInvoice]`;
    await prisma.$executeRaw`DELETE FROM [InboundInvoiceItem]`;
    await prisma.$executeRaw`DELETE FROM [InboundEInvoice]`;
    await prisma.$executeRaw`DELETE FROM [LaborContract]`;
    await prisma.$executeRaw`DELETE FROM [Employee]`;
    await prisma.$executeRaw`DELETE FROM [EnterpriseAsset]`;
    await prisma.$executeRaw`DELETE FROM [AccountingRecord]`;
    await prisma.$executeRaw`DELETE FROM [Promotion]`;
    await prisma.$executeRaw`DELETE FROM [FraudAlert]`;
    await prisma.$executeRaw`DELETE FROM [CashShift]`;
    await prisma.$executeRaw`DELETE FROM [Customer]`;

    let restoredStats: Record<string, number> = {};

    // Step 2: Insert Users if present
    if (Array.isArray(tables.users) && tables.users.length > 0) {
      for (const u of tables.users) {
        const existingUsers = await prisma.user.findMany({ where: { username: u.username } });
        if (existingUsers.length === 0) {
          await prisma.user.create({
            data: {
              id: u.id,
              username: u.username,
              passwordHash: u.passwordHash,
              fullName: u.fullName,
              email: u.email,
              phone: u.phone,
              role: u.role,
              status: u.status || "active",
              avatar: u.avatar,
            },
          });
        }
      }
      restoredStats["users"] = tables.users.length;
    }

    // Step 3: Insert StoreSettings
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
        ...(s.settingsJson ? JSON.parse(s.settingsJson) : {}),
      });
      restoredStats["settings"] = 1;
    }

    // Step 4: Customers
    if (Array.isArray(tables.customers) && tables.customers.length > 0) {
      for (const c of tables.customers) {
        await prisma.customer.create({
          data: {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.address,
            tier: c.tier || "Đồng",
            totalSpent: c.totalSpent || 0,
            totalOrders: c.totalOrders || 0,
            debt: c.debt || 0,
            points: c.points || 0,
            note: c.note || c.notes,
          },
        });
      }
      restoredStats["customers"] = tables.customers.length;
    }

    // Step 5: Products & UOM
    if (Array.isArray(tables.products) && tables.products.length > 0) {
      for (const p of tables.products) {
        await prisma.product.create({
          data: {
            id: p.id,
            sku: p.sku,
            barcode: p.barcode || p.sku,
            name: p.name,
            category: p.category,
            unit: p.unit,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            stock: p.stock,
            minStock: p.minStock || 5,
            image: p.image,
            warehouse: p.warehouse || "Kho Chính",
            storageLocation: p.storageLocation,
            description: p.description,
            isFeatured: p.isFeatured || false,
            weightOrVolume: p.weightOrVolume,
          },
        });
      }
      restoredStats["products"] = tables.products.length;

      if (Array.isArray(tables.uomConversions) && tables.uomConversions.length > 0) {
        for (const u of tables.uomConversions) {
          await prisma.productUOMConversion.create({
            data: {
              id: u.id,
              productId: u.productId,
              unit: u.unit,
              ratioToBase: u.ratioToBase,
              costPrice: u.costPrice,
              sellingPrice: u.sellingPrice,
              barcode: u.barcode,
            },
          });
        }
        restoredStats["uomConversions"] = tables.uomConversions.length;
      }
    }

    // Step 6: Orders & OrderItems
    if (Array.isArray(tables.orders) && tables.orders.length > 0) {
      for (const o of tables.orders) {
        await prisma.order.create({
          data: {
            id: o.id,
            code: o.code,
            customerId: o.customerId,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            customerAddress: o.customerAddress,
            subtotal: o.subtotal,
            taxAmount: o.taxAmount || 0,
            discountAmount: o.discountAmount || 0,
            total: o.total,
            status: o.status,
            channel: o.channel || "Tại quầy (POS)",
            paymentMethod: o.paymentMethod || "cash",
            paymentStatus: o.paymentStatus || "paid",
            paidAmount: o.paidAmount || o.total,
            changeAmount: o.changeAmount || 0,
            note: o.note || o.notes,
            createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          },
        });
      }
      restoredStats["orders"] = tables.orders.length;

      if (Array.isArray(tables.orderItems) && tables.orderItems.length > 0) {
        for (const oi of tables.orderItems) {
          await prisma.orderItem.create({
            data: {
              id: oi.id,
              orderId: oi.orderId,
              productId: oi.productId,
              productName: oi.productName,
              sku: oi.sku,
              unit: oi.unit,
              ratioToBase: oi.ratioToBase || 1,
              quantity: oi.quantity,
              unitPrice: oi.unitPrice,
              costPrice: oi.costPrice,
              discountPercent: oi.discountPercent || 0,
              total: oi.total,
            },
          });
        }
        restoredStats["orderItems"] = tables.orderItems.length;
      }
    }

    // Step 7: Inventory Logs
    if (Array.isArray(tables.inventoryLogs) && tables.inventoryLogs.length > 0) {
      for (const l of tables.inventoryLogs) {
        await prisma.inventoryLog.create({
          data: {
            id: l.id,
            productId: l.productId,
            productName: l.productName,
            sku: l.sku,
            type: l.type,
            quantityChange: l.quantityChange,
            oldStock: l.oldStock,
            newStock: l.newStock,
            unitPrice: l.unitPrice,
            reason: l.reason,
            performedBy: l.performedBy,
            timestamp: l.timestamp ? new Date(l.timestamp) : new Date(),
          },
        });
      }
      restoredStats["inventoryLogs"] = tables.inventoryLogs.length;
    }

    // Step 8: Price Quotes
    if (Array.isArray(tables.priceQuotes) && tables.priceQuotes.length > 0) {
      for (const q of tables.priceQuotes) {
        await prisma.priceQuote.create({
          data: {
            id: q.id,
            code: q.code,
            customerName: q.customerName,
            customerPhone: q.customerPhone,
            customerCompany: q.customerCompany,
            validUntil: q.validUntil ? new Date(q.validUntil) : new Date(),
            totalAmount: q.totalAmount || q.subtotal || q.total,
            discountPercent: q.discountPercent || 0,
            finalTotal: q.finalTotal || q.total,
            status: q.status || "draft",
            notes: q.notes,
            createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
          },
        });
      }
      restoredStats["quotes"] = tables.priceQuotes.length;

      if (Array.isArray(tables.priceQuoteItems) && tables.priceQuoteItems.length > 0) {
        for (const qi of tables.priceQuoteItems) {
          await prisma.priceQuoteItem.create({
            data: {
              id: qi.id,
              quoteId: qi.quoteId,
              productName: qi.productName,
              sku: qi.sku,
              unit: qi.unit,
              quantity: qi.quantity,
              unitPrice: qi.unitPrice,
              total: qi.total,
            },
          });
        }
      }
    }

    // Step 9: Costings & BOM
    if (Array.isArray(tables.productCostings) && tables.productCostings.length > 0) {
      for (const c of tables.productCostings) {
        await prisma.productCosting.create({
          data: {
            id: c.id,
            productName: c.productName,
            sku: c.sku,
            rawMaterialsCost: c.rawMaterialsCost,
            laborCost: c.laborCost,
            machineryAndOverheadCost: c.machineryAndOverheadCost,
            totalStandardCost: c.totalStandardCost,
            currentSellingPrice: c.currentSellingPrice,
            grossMarginPercent: c.grossMarginPercent,
            lastUpdated: c.lastUpdated ? new Date(c.lastUpdated) : new Date(),
          },
        });
      }
      restoredStats["costings"] = tables.productCostings.length;

      if (Array.isArray(tables.costingBOMItems) && tables.costingBOMItems.length > 0) {
        for (const bi of tables.costingBOMItems) {
          await prisma.costingBOMItem.create({
            data: {
              id: bi.id,
              costingId: bi.costingId,
              materialName: bi.materialName,
              quantity: bi.quantity,
              unit: bi.unit,
              unitCost: bi.unitCost,
              totalCost: bi.totalCost,
            },
          });
        }
      }
    }

    // Step 10: Warranty Tickets & Serial Devices
    if (Array.isArray(tables.warrantyTickets) && tables.warrantyTickets.length > 0) {
      for (const w of tables.warrantyTickets) {
        await prisma.warrantyTicket.create({
          data: {
            id: w.id,
            code: w.code,
            type: w.type || "warranty",
            priority: w.priority || "normal",
            customerName: w.customerName,
            customerPhone: w.customerPhone,
            customerAddress: w.customerAddress,
            productName: w.productName || w.deviceName || "Thiết bị",
            serialNumber: w.serialNumber,
            productId: w.productId,
            issueDescription: w.issueDescription || "Bảo hành thiết bị",
            status: w.status || "received",
            technicianName: w.technicianName || w.assignedTechnician || "Kỹ thuật viên",
            receivedDate: w.receivedDate ? new Date(w.receivedDate) : new Date(),
            expectedReturnDate: w.expectedReturnDate ? new Date(w.expectedReturnDate) : new Date(),
            laborCost: w.laborCost || 0,
            partsCost: w.partsCost || 0,
            totalFee: w.totalFee || 0,
          },
        });
      }
      restoredStats["warrantyTickets"] = tables.warrantyTickets.length;
    }

    if (Array.isArray(tables.serialDeviceRecords) && tables.serialDeviceRecords.length > 0) {
      for (const s of tables.serialDeviceRecords) {
        await prisma.serialDeviceRecord.create({
          data: {
            id: s.id,
            serialNumber: s.serialNumber,
            productName: s.productName,
            sku: s.sku || s.productSku,
            customerName: s.customerName,
            customerPhone: s.customerPhone,
            soldDate: s.soldDate ? new Date(s.soldDate) : null,
            warrantyPeriodMonths: s.warrantyPeriodMonths || s.warrantyMonths || 12,
            warrantyExpiryDate: s.warrantyExpiryDate ? new Date(s.warrantyExpiryDate) : new Date(),
            warrantyStatus: s.warrantyStatus || "valid",
            soldOrderCode: s.soldOrderCode,
            totalRepairsCount: s.totalRepairsCount || 0,
            totalMaintenancesCount: s.totalMaintenancesCount || 0,
            notes: s.notes,
          },
        });
      }
      restoredStats["serialRecords"] = tables.serialDeviceRecords.length;
    }

    // Step 11: Accounting, HR, Assets, Inbound
    if (Array.isArray(tables.accountingRecords) && tables.accountingRecords.length > 0) {
      for (const a of tables.accountingRecords) {
        await prisma.accountingRecord.create({
          data: {
            id: a.id,
            code: a.code,
            type: a.type,
            category: a.category,
            amount: a.amount,
            date: a.date ? new Date(a.date) : new Date(),
            party: a.party,
            paymentMethod: a.paymentMethod || "cash",
            status: a.status || "completed",
            note: a.note,
            receiptNumber: a.receiptNumber,
          },
        });
      }
      restoredStats["accountingRecords"] = tables.accountingRecords.length;
    }

    if (Array.isArray(tables.employees) && tables.employees.length > 0) {
      for (const emp of tables.employees) {
        await prisma.employee.create({
          data: {
            id: emp.id,
            code: emp.code,
            name: emp.name,
            role: emp.role,
            phone: emp.phone,
            email: emp.email,
            baseSalary: emp.baseSalary,
            salesKpiTarget: emp.salesKpiTarget || 0,
            currentSales: emp.currentSales || 0,
            commissionRate: emp.commissionRate || 0,
            status: emp.status || "active",
            avatar: emp.avatar,
            joinedDate: emp.joinedDate ? new Date(emp.joinedDate) : new Date(),
            shiftSchedule: emp.shiftSchedule,
          },
        });
      }
      restoredStats["employees"] = tables.employees.length;
    }

    if (Array.isArray(tables.laborContracts) && tables.laborContracts.length > 0) {
      for (const lc of tables.laborContracts) {
        await prisma.laborContract.create({
          data: {
            id: lc.id,
            contractNumber: lc.contractNumber,
            employeeId: lc.employeeId,
            employeeCode: lc.employeeCode,
            employeeName: lc.employeeName,
            employeeRole: lc.employeeRole,
            contractType: lc.contractType,
            startDate: lc.startDate ? new Date(lc.startDate) : new Date(),
            endDate: lc.endDate ? new Date(lc.endDate) : null,
            signDate: lc.signDate ? new Date(lc.signDate) : new Date(),
            status: lc.status || "active",
            employerData: lc.employerData,
            employeeInfo: lc.employeeInfo,
            termsData: lc.termsData,
            signaturesData: lc.signaturesData,
            notes: lc.notes,
          },
        });
      }
      restoredStats["laborContracts"] = tables.laborContracts.length;
    }

    if (Array.isArray(tables.enterpriseAssets) && tables.enterpriseAssets.length > 0) {
      for (const ast of tables.enterpriseAssets) {
        const id = ast.id;
        const pDate = new Date(ast.purchaseDate);
        const mDate = ast.lastMaintenanceDate ? new Date(ast.lastMaintenanceDate) : null;
        const status = ast.status || "good";
        const depMonths = Number(ast.depreciationMonths) || 12;
        const origVal = Number(ast.originalValue) || 0;
        const remVal = Number(ast.remainingValue) || 0;
        if (mDate) {
          await prisma.$executeRaw`
            INSERT INTO [EnterpriseAsset] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status, lastMaintenanceDate)
            VALUES (${id}, ${ast.code}, ${ast.name}, ${ast.category}, ${pDate}, ${origVal}, ${depMonths}, ${remVal}, ${ast.assignedTo}, ${status}, ${mDate})
          `;
        } else {
          await prisma.$executeRaw`
            INSERT INTO [EnterpriseAsset] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status)
            VALUES (${id}, ${ast.code}, ${ast.name}, ${ast.category}, ${pDate}, ${origVal}, ${depMonths}, ${remVal}, ${ast.assignedTo}, ${status})
          `;
        }
      }
      restoredStats["assets"] = tables.enterpriseAssets.length;
    }

    if (Array.isArray(tables.eInvoices) && tables.eInvoices.length > 0) {
      for (const inv of tables.eInvoices) {
        await prisma.eInvoice.create({
          data: {
            id: inv.id,
            orderId: inv.orderId,
            orderCode: inv.orderCode,
            invoiceCode: inv.invoiceCode,
            invoiceNumber: inv.invoiceNumber,
            invoiceSymbol: inv.invoiceSymbol,
            invoiceTemplate: inv.invoiceTemplate,
            issueDate: inv.issueDate ? new Date(inv.issueDate) : new Date(),
            cqtCode: inv.cqtCode,
            lookupCode: inv.lookupCode || inv.invoiceCode,
            lookupUrl: inv.lookupUrl || "https://hoadondientu.gdt.gov.vn",
            sellerData: typeof inv.sellerData === "string" ? inv.sellerData : JSON.stringify(inv.sellerData || {}),
            buyerData: typeof inv.buyerData === "string" ? inv.buyerData : JSON.stringify(inv.buyerData || {}),
            paymentMethod: inv.paymentMethod || "TM/CK",
            subtotal: inv.subtotal,
            taxRate: inv.taxRate || 0,
            taxAmount: inv.taxAmount || 0,
            totalAmount: inv.totalAmount,
            amountInWords: inv.amountInWords || "",
            status: inv.status || "signed",
            signDate: inv.signDate ? new Date(inv.signDate) : new Date(),
          },
        });
      }
      restoredStats["eInvoices"] = tables.eInvoices.length;
    }

    if (Array.isArray(tables.promotions) && tables.promotions.length > 0) {
      for (const p of tables.promotions) {
        await prisma.promotion.create({
          data: {
            id: p.id,
            code: p.code,
            title: p.title,
            discountType: p.discountType,
            discountValue: p.discountValue,
            minOrderValue: p.minOrderValue || 0,
            maxDiscount: p.maxDiscount,
            usageLimit: p.usageLimit || 100,
            usedCount: p.usedCount || 0,
            startDate: p.startDate ? new Date(p.startDate) : new Date(),
            endDate: p.endDate ? new Date(p.endDate) : new Date(),
            isActive: p.isActive !== false,
          },
        });
      }
      restoredStats["promotions"] = tables.promotions.length;
    }

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
      await prisma.user.create({
        data: {
          id: "usr-admin-01",
          username: "admin",
          passwordHash,
          fullName: "Quản Trị Viên Hệ Thống (Phạm Gia Phúc)",
          email: "admin@vitinhgiaphuc.com",
          phone: "0985862609",
          role: "Admin",
          status: "active",
        },
      });
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

