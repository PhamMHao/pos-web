import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  INITIAL_STORE_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_PROMOTIONS,
  INITIAL_ACCOUNTING_RECORDS,
  INITIAL_EMPLOYEES,
  INITIAL_QUOTES,
  INITIAL_ASSETS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_WARRANTY_TICKETS,
  INITIAL_SERIAL_RECORDS,
  INITIAL_EINVOICES,
  INITIAL_LABOR_CONTRACTS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_INBOUND_INVOICES,
  INITIAL_ORDERS,
} from "./seedData";

const prisma = new PrismaClient();

function safeDate(d: any, fallback = new Date()): Date {
  if (!d) return fallback;
  const parsed = new Date(typeof d === "string" ? d.replace(" ", "T") : d);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu vào SQL Server (Tương thích 100% MSSQL 2008 - 2025)...");

  // 1. Tạo tài khoản người dùng mặc định (Default Users)
  console.log("1. Creating default users...");
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("123456", salt);

  const defaultUsers = [
    {
      id: "usr-admin-01",
      username: "admin",
      fullName: "Quản Trị Viên Hệ Thống (Phạm Gia Phúc)",
      email: "admin@vitinhgiaphuc.com",
      phone: "0985862609",
      role: "Admin",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-manager-01",
      username: "manager01",
      fullName: "Trần Quốc Bảo (Quản Lý)",
      email: "quanly@vitinhgiaphuc.com",
      phone: "0914665994",
      role: "Quản Lý",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-thungan-01",
      username: "thungan01",
      fullName: "Nguyễn Thị Thu Ngân",
      email: "thungan@vitinhgiaphuc.com",
      phone: "0914665994",
      role: "Thu Ngân",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-thukho-01",
      username: "thukho01",
      fullName: "Nguyễn Văn Minh (Thủ Kho)",
      email: "thukho@vitinhgiaphuc.com",
      phone: "0985862609",
      role: "Thủ Kho",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-ketoan-01",
      username: "ketoan01",
      fullName: "Lê Thị Thu Thảo (Kế Toán)",
      email: "ketoan@vitinhgiaphuc.com",
      phone: "0977112233",
      role: "Kế Toán",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-sale-01",
      username: "sale01",
      fullName: "Phạm Hoàng Minh (Kinh Doanh)",
      email: "sales@vitinhgiaphuc.com",
      phone: "0908123456",
      role: "Bán Hàng",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
    {
      id: "usr-kythuat-01",
      username: "kythuat01",
      fullName: "Đỗ Minh Khang (Kỹ Thuật)",
      email: "kythuat@vitinhgiaphuc.com",
      phone: "0933888999",
      role: "Kỹ Thuật",
      status: "active",
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const u of defaultUsers) {
    const existing = await prisma.user.findMany({ where: { username: u.username } });
    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [NguoiDung] (id, username, passwordHash, fullName, email, phone, role, status, createdAt, updatedAt)
        VALUES (${u.id}, ${u.username}, ${u.passwordHash}, ${u.fullName}, ${u.email}, ${u.phone}, ${u.role}, ${u.status}, GETDATE(), GETDATE())
      `;
    }
  }

  // 2. Cài đặt hệ thống (Store Settings)
  console.log("2. Seeding Store Settings...");
  const settingsJson = JSON.stringify(INITIAL_STORE_SETTINGS);
  const existingSettings = await prisma.storeSettings.findMany({ where: { id: "default_settings" } });
  if (existingSettings.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO [CauHinhCuaHang] (id, storeName, tagline, phone, email, address, taxCode, bankName, bankAccount, bankCode, settingsJson, updatedAt)
      VALUES ('default_settings', ${INITIAL_STORE_SETTINGS.storeName}, ${INITIAL_STORE_SETTINGS.tagline}, ${INITIAL_STORE_SETTINGS.phone}, ${INITIAL_STORE_SETTINGS.email}, ${INITIAL_STORE_SETTINGS.address}, ${INITIAL_STORE_SETTINGS.taxCode}, ${INITIAL_STORE_SETTINGS.bankName}, ${INITIAL_STORE_SETTINGS.bankAccount}, ${INITIAL_STORE_SETTINGS.bankCode}, ${settingsJson}, GETDATE())
    `;
  } else {
    const current = existingSettings[0];
    let parsed: any = {};
    if (current.settingsJson) {
      try {
        parsed = JSON.parse(current.settingsJson);
      } catch {}
    }
    const merged = {
      ...INITIAL_STORE_SETTINGS,
      ...parsed,
      printDocConfigs: {
        ...(INITIAL_STORE_SETTINGS.printDocConfigs || {}),
        ...(parsed.printDocConfigs || {}),
      },
    };
    const updatedJson = JSON.stringify(merged);
    await prisma.$executeRaw`
      UPDATE [CauHinhCuaHang]
      SET settingsJson = ${updatedJson}, updatedAt = GETDATE()
      WHERE id = 'default_settings'
    `;
  }

  // 3. Khách hàng (Customers)
  console.log(`3. Seeding ${INITIAL_CUSTOMERS.length} Customers...`);
  for (const c of INITIAL_CUSTOMERS) {
    const existing = await prisma.customer.findMany({ where: { id: c.id } });
    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [KhachHang] (id, name, phone, email, address, tier, points, totalSpent, totalOrders, debt, note, createdAt, updatedAt)
        VALUES (${c.id}, ${c.name}, ${c.phone}, ${c.email || null}, ${c.address || null}, ${c.tier || "Đồng"}, ${c.points || 0}, ${c.totalSpent || 0}, ${c.totalOrders || 0}, ${c.debt || 0}, ${c.note || null}, GETDATE(), GETDATE())
      `;
    }
  }

  // 4. Sản phẩm & Quy đổi ĐVT (Products & Multi-UOM)
  console.log(`4. Seeding ${INITIAL_PRODUCTS.length} Products with UOM conversions...`);
  for (const p of INITIAL_PRODUCTS) {
    const existing = await prisma.product.findMany({ where: { sku: p.sku } });
    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [SanPham] (id, sku, barcode, name, category, unit, costPrice, sellingPrice, stock, minStock, image, warehouse, storageLocation, description, isFeatured, weightOrVolume, createdAt, updatedAt)
        VALUES (${p.id}, ${p.sku}, ${p.barcode || ""}, ${p.name}, ${p.category}, ${p.unit}, ${p.costPrice}, ${p.sellingPrice}, ${p.stock}, ${p.minStock || 5}, ${p.image || null}, ${p.warehouse || "Kho Chính"}, ${p.storageLocation || null}, ${p.description || null}, ${p.isFeatured ? 1 : 0}, ${p.weightOrVolume || null}, GETDATE(), GETDATE())
      `;

      if (p.uomConversions && p.uomConversions.length > 0) {
        for (let i = 0; i < p.uomConversions.length; i++) {
          const u = p.uomConversions[i];
          const uomId = `uom-${p.id}-${i}`;
          await prisma.$executeRaw`
            INSERT INTO [QuyDoiDonViTinh] (id, productId, unit, ratioToBase, costPrice, sellingPrice, barcode, isBase, referenceUnit, conversionRate, description)
            VALUES (${uomId}, ${p.id}, ${u.unit}, ${u.ratioToBase}, ${u.costPrice}, ${u.sellingPrice}, ${u.barcode || null}, ${u.isBase ? 1 : 0}, ${u.referenceUnit || null}, ${u.conversionRate || null}, ${u.description || null})
          `;
        }
      }
    }
  }

  // 5. Nhân sự (Employees)
  console.log(`5. Seeding ${INITIAL_EMPLOYEES.length} Employees...`);
  for (const emp of INITIAL_EMPLOYEES) {
    const existing = await prisma.employee.findMany({ where: { code: emp.code } });
    if (existing.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO [NhanVien] (id, code, name, role, phone, email, baseSalary, salesKpiTarget, currentSales, commissionRate, status, avatar, joinedDate, shiftSchedule)
        VALUES (${emp.id}, ${emp.code}, ${emp.name}, ${emp.role}, ${emp.phone}, ${emp.email}, ${emp.baseSalary}, ${emp.salesKpiTarget || 0}, ${emp.currentSales || 0}, ${emp.commissionRate || 0}, ${emp.status || "active"}, ${emp.avatar || null}, GETDATE(), ${emp.shiftSchedule || null})
      `;
    }
  }

  // 6. Khuyến mãi (Promotions)
  console.log(`6. Seeding ${INITIAL_PROMOTIONS.length} Promotions...`);
  for (const promo of INITIAL_PROMOTIONS) {
    const existing = await prisma.promotion.findMany({ where: { code: promo.code } });
    if (existing.length === 0) {
      const sDate = safeDate(promo.startDate);
      const eDate = safeDate(promo.endDate);
      await prisma.$executeRaw`
        INSERT INTO [ChuongTrinhKhuyenMai] (id, code, title, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, usedCount, startDate, endDate, isActive)
        VALUES (${promo.id}, ${promo.code}, ${promo.title}, ${promo.discountType}, ${promo.discountValue}, ${promo.minOrderValue || 0}, ${promo.maxDiscount || null}, ${promo.usageLimit || 100}, ${promo.usedCount || 0}, ${sDate}, ${eDate}, ${promo.isActive ? 1 : 0})
      `;
    }
  }

  // 7. Kế toán & Thu chi (Accounting)
  console.log(`7. Seeding ${INITIAL_ACCOUNTING_RECORDS.length} Accounting Records...`);
  for (const acc of INITIAL_ACCOUNTING_RECORDS) {
    const existing = await prisma.accountingRecord.findMany({ where: { code: acc.code } });
    if (existing.length === 0) {
      const dt = safeDate(acc.date);
      await prisma.$executeRaw`
        INSERT INTO [SoThuChiKeToan] (id, code, type, category, amount, date, party, paymentMethod, status, note, receiptNumber)
        VALUES (${acc.id}, ${acc.code}, ${acc.type}, ${acc.category}, ${acc.amount}, ${dt}, ${acc.party}, ${acc.paymentMethod || "cash"}, ${acc.status || "completed"}, ${acc.note || null}, ${acc.receiptNumber || null})
      `;
    }
  }

  // 8. Báo giá (Price Quotes)
  console.log(`8. Seeding ${INITIAL_QUOTES.length} Quotes...`);
  for (const q of INITIAL_QUOTES) {
    const existing = await prisma.priceQuote.findMany({ where: { code: q.code } });
    if (existing.length === 0) {
      const vDate = safeDate(q.validUntil);
      await prisma.$executeRaw`
        INSERT INTO [BaoGia] (id, code, customerName, customerPhone, customerCompany, totalAmount, discountPercent, finalTotal, validUntil, status, notes, createdAt)
        VALUES (${q.id}, ${q.code}, ${q.customerName}, ${q.customerPhone}, ${q.customerCompany || null}, ${q.totalAmount}, ${q.discountPercent || 0}, ${q.finalTotal}, ${vDate}, ${q.status || "draft"}, ${q.notes || null}, GETDATE())
      `;

      if (q.items && q.items.length > 0) {
        for (let idx = 0; idx < q.items.length; idx++) {
          const it = q.items[idx];
          const itemId = `qi-${q.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [ChiTietBaoGia] (id, quoteId, productName, sku, unit, quantity, unitPrice, total)
            VALUES (${itemId}, ${q.id}, ${it.productName}, ${it.sku}, ${it.unit}, ${it.quantity}, ${it.unitPrice}, ${it.total})
          `;
        }
      }
    }
  }

  // 9. Tài sản doanh nghiệp (Assets)
  console.log(`9. Seeding ${INITIAL_ASSETS.length} Enterprise Assets...`);
  for (const asset of INITIAL_ASSETS) {
    const existing = await prisma.enterpriseAsset.findMany({ where: { code: asset.code } });
    if (existing.length === 0) {
      const pDate = safeDate(asset.purchaseDate);
      if (asset.lastMaintenanceDate) {
        const mDate = safeDate(asset.lastMaintenanceDate);
        await prisma.$executeRaw`
          INSERT INTO [TaiSanDoanhNghiep] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status, lastMaintenanceDate)
          VALUES (${asset.id}, ${asset.code}, ${asset.name}, ${asset.category}, ${pDate}, ${asset.originalValue}, ${asset.depreciationMonths}, ${asset.remainingValue}, ${asset.assignedTo}, ${asset.status || "good"}, ${mDate})
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO [TaiSanDoanhNghiep] (id, code, name, category, purchaseDate, originalValue, depreciationMonths, remainingValue, assignedTo, status)
          VALUES (${asset.id}, ${asset.code}, ${asset.name}, ${asset.category}, ${pDate}, ${asset.originalValue}, ${asset.depreciationMonths}, ${asset.remainingValue}, ${asset.assignedTo}, ${asset.status || "good"})
        `;
      }
    }
  }

  // 10. Serial & Bảo hành (Warranties & Serials)
  console.log(`10. Seeding ${INITIAL_SERIAL_RECORDS.length} Serial Device Records & Tickets...`);
  for (const s of INITIAL_SERIAL_RECORDS) {
    const existing = await prisma.serialDeviceRecord.findMany({ where: { serialNumber: s.serialNumber } });
    if (existing.length === 0) {
      const expDate = safeDate(s.warrantyExpiryDate);
      if (s.soldDate) {
        const sDate = safeDate(s.soldDate);
        await prisma.$executeRaw`
          INSERT INTO [SoSerialThietBi] (id, serialNumber, productName, sku, soldOrderCode, soldDate, customerName, customerPhone, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
          VALUES (${s.id}, ${s.serialNumber}, ${s.productName}, ${s.sku}, ${s.soldOrderCode || null}, ${sDate}, ${s.customerName || null}, ${s.customerPhone || null}, ${s.warrantyPeriodMonths || 12}, ${expDate}, ${s.warrantyStatus || "valid"}, ${s.totalRepairsCount || 0}, ${s.totalMaintenancesCount || 0}, ${s.notes || null})
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO [SoSerialThietBi] (id, serialNumber, productName, sku, soldOrderCode, customerName, customerPhone, warrantyPeriodMonths, warrantyExpiryDate, warrantyStatus, totalRepairsCount, totalMaintenancesCount, notes)
          VALUES (${s.id}, ${s.serialNumber}, ${s.productName}, ${s.sku}, ${s.soldOrderCode || null}, ${s.customerName || null}, ${s.customerPhone || null}, ${s.warrantyPeriodMonths || 12}, ${expDate}, ${s.warrantyStatus || "valid"}, ${s.totalRepairsCount || 0}, ${s.totalMaintenancesCount || 0}, ${s.notes || null})
        `;
      }
    }
  }

  for (const w of INITIAL_WARRANTY_TICKETS) {
    const existing = await prisma.warrantyTicket.findMany({ where: { code: w.code } });
    if (existing.length === 0) {
      const recDate = safeDate(w.receivedDate);
      const expDate = safeDate(w.expectedReturnDate);
      if (w.actualReturnDate) {
        const actDate = safeDate(w.actualReturnDate);
        await prisma.$executeRaw`
          INSERT INTO [PhieuBaoHanh] (id, code, type, priority, status, orderCode, productId, productName, model, serialNumber, qrCodeUrl, customerName, customerPhone, customerAddress, customerEmail, accessoriesIncluded, cosmeticCondition, issueDescription, technicianDiagnosis, resolution, technicianName, receivedDate, expectedReturnDate, actualReturnDate, laborCost, partsCost, discountAmount, totalFee, paymentStatus, paidAmount, returnedToPerson, returnNote, warrantyExtensionMonths)
          VALUES (${w.id}, ${w.code}, ${w.type || "warranty"}, ${w.priority || "normal"}, ${w.status || "received"}, ${w.orderCode || null}, ${w.productId || null}, ${w.productName}, ${w.model || null}, ${w.serialNumber}, ${w.qrCodeUrl || null}, ${w.customerName}, ${w.customerPhone}, ${w.customerAddress || null}, ${w.customerEmail || null}, ${w.accessoriesIncluded || ""}, ${w.cosmeticCondition || ""}, ${w.issueDescription || ""}, ${w.technicianDiagnosis || null}, ${w.resolution || null}, ${w.technicianName || "Kỹ thuật viên"}, ${recDate}, ${expDate}, ${actDate}, ${w.laborCost || 0}, ${w.partsCost || 0}, ${w.discountAmount || 0}, ${w.totalFee || 0}, ${w.paymentStatus || "free"}, ${w.paidAmount || 0}, ${w.returnedToPerson || null}, ${w.returnNote || null}, ${w.warrantyExtensionMonths || 0})
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO [PhieuBaoHanh] (id, code, type, priority, status, orderCode, productId, productName, model, serialNumber, qrCodeUrl, customerName, customerPhone, customerAddress, customerEmail, accessoriesIncluded, cosmeticCondition, issueDescription, technicianDiagnosis, resolution, technicianName, receivedDate, expectedReturnDate, laborCost, partsCost, discountAmount, totalFee, paymentStatus, paidAmount, returnedToPerson, returnNote, warrantyExtensionMonths)
          VALUES (${w.id}, ${w.code}, ${w.type || "warranty"}, ${w.priority || "normal"}, ${w.status || "received"}, ${w.orderCode || null}, ${w.productId || null}, ${w.productName}, ${w.model || null}, ${w.serialNumber}, ${w.qrCodeUrl || null}, ${w.customerName}, ${w.customerPhone}, ${w.customerAddress || null}, ${w.customerEmail || null}, ${w.accessoriesIncluded || ""}, ${w.cosmeticCondition || ""}, ${w.issueDescription || ""}, ${w.technicianDiagnosis || null}, ${w.resolution || null}, ${w.technicianName || "Kỹ thuật viên"}, ${recDate}, ${expDate}, ${w.laborCost || 0}, ${w.partsCost || 0}, ${w.discountAmount || 0}, ${w.totalFee || 0}, ${w.paymentStatus || "free"}, ${w.paidAmount || 0}, ${w.returnedToPerson || null}, ${w.returnNote || null}, ${w.warrantyExtensionMonths || 0})
        `;
      }

      if (w.parts && w.parts.length > 0) {
        for (let idx = 0; idx < w.parts.length; idx++) {
          const p = w.parts[idx];
          const partId = `wp-${w.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [LinhKienBaoHanh] (id, warrantyId, partName, sku, quantity, unit, unitPrice, isUnderWarranty, warrantyMonths)
            VALUES (${partId}, ${w.id}, ${p.partName}, ${p.sku || null}, ${p.quantity}, ${p.unit}, ${p.unitPrice}, ${p.isUnderWarranty ? 1 : 0}, ${p.warrantyMonths || 0})
          `;
        }
      }

      if (w.timeline && w.timeline.length > 0) {
        for (let idx = 0; idx < w.timeline.length; idx++) {
          const tl = w.timeline[idx];
          const tlId = `wtl-${w.id}-${idx}`;
          const tlDate = safeDate(tl.timestamp);
          await prisma.$executeRaw`
            INSERT INTO [NhatKyBaoHanh] (id, warrantyId, action, actor, timestamp, notes, status)
            VALUES (${tlId}, ${w.id}, ${tl.action}, ${tl.actor}, ${tlDate}, ${tl.notes || null}, ${tl.status})
          `;
        }
      }
    }
  }

  // 11. Hóa đơn điện tử (E-Invoices)
  console.log(`11. Seeding ${INITIAL_EINVOICES.length} E-Invoices...`);
  for (const inv of INITIAL_EINVOICES) {
    const existing = await prisma.eInvoice.findMany({ where: { invoiceCode: inv.invoiceCode } });
    if (existing.length === 0) {
      const iDate = safeDate(inv.issueDate);
      const digSig = inv.digitalSignature ? JSON.stringify(inv.digitalSignature) : null;
      if (inv.signDate) {
        const sDate = safeDate(inv.signDate);
        await prisma.$executeRaw`
          INSERT INTO [HoaDonDienTu] (id, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, invoiceType, cqtCode, lookupCode, lookupUrl, issueDate, signDate, status, orderCode, sellerData, buyerData, subtotal, discountAmount, taxRate, taxAmount, totalAmount, amountInWords, paymentMethod, notes, digitalSignature, cqtStatusMessage)
          VALUES (${inv.id}, ${inv.invoiceCode}, ${inv.invoiceNumber}, ${inv.invoiceSymbol}, ${inv.invoiceTemplate}, ${inv.invoiceType || "vat"}, ${inv.cqtCode || null}, ${inv.lookupCode}, ${inv.lookupUrl}, ${iDate}, ${sDate}, ${inv.status || "draft"}, ${inv.orderCode || null}, ${JSON.stringify(inv.seller)}, ${JSON.stringify(inv.buyer)}, ${inv.subtotal}, ${inv.discountAmount || 0}, ${inv.taxRate || 0}, ${inv.taxAmount || 0}, ${inv.totalAmount}, ${inv.amountInWords || ""}, ${inv.paymentMethod || "TM/CK"}, ${inv.notes || null}, ${digSig}, ${inv.cqtStatusMessage || null})
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO [HoaDonDienTu] (id, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, invoiceType, cqtCode, lookupCode, lookupUrl, issueDate, status, orderCode, sellerData, buyerData, subtotal, discountAmount, taxRate, taxAmount, totalAmount, amountInWords, paymentMethod, notes, digitalSignature, cqtStatusMessage)
          VALUES (${inv.id}, ${inv.invoiceCode}, ${inv.invoiceNumber}, ${inv.invoiceSymbol}, ${inv.invoiceTemplate}, ${inv.invoiceType || "vat"}, ${inv.cqtCode || null}, ${inv.lookupCode}, ${inv.lookupUrl}, ${iDate}, ${inv.status || "draft"}, ${inv.orderCode || null}, ${JSON.stringify(inv.seller)}, ${JSON.stringify(inv.buyer)}, ${inv.subtotal}, ${inv.discountAmount || 0}, ${inv.taxRate || 0}, ${inv.taxAmount || 0}, ${inv.totalAmount}, ${inv.amountInWords || ""}, ${inv.paymentMethod || "TM/CK"}, ${inv.notes || null}, ${digSig}, ${inv.cqtStatusMessage || null})
        `;
      }

      if (inv.items && inv.items.length > 0) {
        for (let idx = 0; idx < inv.items.length; idx++) {
          const it = inv.items[idx];
          const itemId = `eii-${inv.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [ChiTietHoaDonDienTu] (id, invoiceId, sku, productName, unit, quantity, unitPrice, subtotal, discountPercent, discountAmount, taxRate, taxAmount, total)
            VALUES (${itemId}, ${inv.id}, ${it.sku}, ${it.productName}, ${it.unit}, ${it.quantity}, ${it.unitPrice}, ${it.subtotal}, ${it.discountPercent || 0}, ${it.discountAmount || 0}, ${it.taxRate || 0}, ${it.taxAmount || 0}, ${it.total})
          `;
        }
      }
    }
  }

  // 12. Hợp đồng lao động (Labor Contracts)
  console.log(`12. Seeding ${INITIAL_LABOR_CONTRACTS.length} Labor Contracts...`);
  for (const ct of INITIAL_LABOR_CONTRACTS) {
    const existing = await prisma.laborContract.findMany({ where: { contractNumber: ct.contractNumber } });
    if (existing.length === 0) {
      const sDate = safeDate(ct.startDate);
      const signDt = safeDate(ct.signDate);
      if (ct.endDate) {
        const eDate = safeDate(ct.endDate);
        await prisma.$executeRaw`
          INSERT INTO [HopDongLaoDong] (id, contractNumber, employeeId, employeeCode, employeeName, employeeRole, contractType, startDate, endDate, signDate, status, employerData, employeeInfo, termsData, signaturesData, notes)
          VALUES (${ct.id}, ${ct.contractNumber}, ${ct.employeeId}, ${ct.employeeCode}, ${ct.employeeName}, ${ct.employeeRole}, ${ct.contractType}, ${sDate}, ${eDate}, ${signDt}, ${ct.status || "active"}, ${JSON.stringify(ct.employer)}, ${JSON.stringify(ct.employeeInfo)}, ${JSON.stringify(ct.terms)}, ${JSON.stringify(ct.signatures)}, ${ct.notes || null})
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO [HopDongLaoDong] (id, contractNumber, employeeId, employeeCode, employeeName, employeeRole, contractType, startDate, signDate, status, employerData, employeeInfo, termsData, signaturesData, notes)
          VALUES (${ct.id}, ${ct.contractNumber}, ${ct.employeeId}, ${ct.employeeCode}, ${ct.employeeName}, ${ct.employeeRole}, ${ct.contractType}, ${sDate}, ${signDt}, ${ct.status || "active"}, ${JSON.stringify(ct.employer)}, ${JSON.stringify(ct.employeeInfo)}, ${JSON.stringify(ct.terms)}, ${JSON.stringify(ct.signatures)}, ${ct.notes || null})
        `;
      }
    }
  }

  // 13. Hóa đơn điện tử đầu vào (Inbound E-Invoices)
  console.log(`13. Seeding ${INITIAL_INBOUND_INVOICES.length} Inbound Invoices...`);
  for (const inb of INITIAL_INBOUND_INVOICES) {
    const existing = await prisma.inboundEInvoice.findMany({ where: { invoiceCode: inb.invoiceCode } });
    if (existing.length === 0) {
      const iDate = safeDate(inb.issueDate);
      const rDate = safeDate(inb.receivedDate);
      await prisma.$executeRaw`
        INSERT INTO [HoaDonDauVao] (id, source, sourceDetail, sourceFile, invoiceCode, invoiceNumber, invoiceSymbol, invoiceTemplate, issueDate, receivedDate, cqtCode, lookupCode, lookupUrl, sellerData, buyerData, subtotal, taxRate, taxAmount, totalAmount, amountInWords, status, notes, rawXmlContent)
        VALUES (${inb.id}, ${inb.source || "xml_upload"}, ${inb.sourceDetail || null}, ${inb.sourceFile || null}, ${inb.invoiceCode}, ${inb.invoiceNumber}, ${inb.invoiceSymbol}, ${inb.invoiceTemplate}, ${iDate}, ${rDate}, ${inb.cqtCode || null}, ${inb.lookupCode || null}, ${inb.lookupUrl || null}, ${JSON.stringify(inb.seller)}, ${JSON.stringify(inb.buyer)}, ${inb.subtotal}, ${inb.taxRate || 0}, ${inb.taxAmount || 0}, ${inb.totalAmount}, ${inb.amountInWords || ""}, ${inb.status || "pending_review"}, ${inb.notes || null}, ${inb.rawXmlContent || null})
      `;

      if (inb.items && inb.items.length > 0) {
        for (let idx = 0; idx < inb.items.length; idx++) {
          const it = inb.items[idx];
          const itemId = `inbi-${inb.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [ChiTietHoaDonDauVao] (id, inboundInvoiceId, lineNumber, productName, skuOrCode, unit, quantity, unitPrice, subtotal, taxRate, taxAmount, total, matchedProductId, matchedProductName, matchedProductSku, currentStock, currentCostPrice, ratioToBaseUnit, isNewProduct, status, assignedCategory, assignedWarehouse, assignedStorageLocation, suggestedSellingPrice, customSku, customBarcode)
            VALUES (${itemId}, ${inb.id}, ${it.lineNumber}, ${it.productName}, ${it.skuOrCode || null}, ${it.unit}, ${it.quantity}, ${it.unitPrice}, ${it.subtotal}, ${it.taxRate || 0}, ${it.taxAmount || 0}, ${it.total}, ${it.matchedProductId || null}, ${it.matchedProductName || null}, ${it.matchedProductSku || null}, ${it.currentStock || null}, ${it.currentCostPrice || null}, ${it.ratioToBaseUnit || 1}, ${it.isNewProduct ? 1 : 0}, ${it.status || "unmatched"}, ${it.assignedCategory || null}, ${it.assignedWarehouse || null}, ${it.assignedStorageLocation || null}, ${it.suggestedSellingPrice || null}, ${it.customSku || null}, ${it.customBarcode || null})
          `;
        }
      }
    }
  }

  // 14. Cảnh báo gian lận AI (Fraud Alerts)
  console.log(`14. Seeding ${INITIAL_FRAUD_ALERTS.length} Fraud Alerts...`);
  for (const f of INITIAL_FRAUD_ALERTS) {
    const existing = await prisma.fraudAlert.findMany({ where: { id: f.id } });
    if (existing.length === 0) {
      const dt = safeDate(f.timestamp);
      await prisma.$executeRaw`
        INSERT INTO [CanhBaoGianLan] (id, severity, title, description, timestamp, source, status, suggestedAction)
        VALUES (${f.id}, ${f.severity || "medium"}, ${f.title}, ${f.description}, ${dt}, ${f.source || "POS"}, ${f.status || "unresolved"}, ${f.suggestedAction || ""})
      `;
    }
  }

  // 15. Nhà cung cấp & Bảng giá (Suppliers & Price List)
  console.log(`15. Seeding ${INITIAL_SUPPLIERS.length} Suppliers...`);
  for (const s of INITIAL_SUPPLIERS) {
    const existing = await prisma.supplier.findMany({ where: { code: s.code } });
    if (existing.length === 0) {
      const dt = safeDate(s.createdAt);
      await prisma.$executeRaw`
        INSERT INTO [NhaCungCap] (id, code, name, taxCode, tier, category, contactPerson, phone, email, address, bankName, bankAccount, bankCode, creditLimit, creditDays, currentDebt, ratingQuality, ratingPrice, ratingOnTime, ratingWarranty, notes, createdAt, updatedAt)
        VALUES (${s.id}, ${s.code}, ${s.name}, ${s.taxCode || null}, ${s.tier || "Tổng Đại Lý"}, ${s.category || "Camera & An Ninh"}, ${s.contactPerson || null}, ${s.phone}, ${s.email || null}, ${s.address || null}, ${s.bankName || null}, ${s.bankAccount || null}, ${s.bankCode || null}, ${s.creditLimit || 0}, ${s.creditDays || 30}, ${s.currentDebt || 0}, ${s.ratingQuality || 9.5}, ${s.ratingPrice || 9.0}, ${s.ratingOnTime || 9.5}, ${s.ratingWarranty || 9.2}, ${s.notes || null}, ${dt}, ${dt})
      `;

      if (s.priceList && s.priceList.length > 0) {
        for (let idx = 0; idx < s.priceList.length; idx++) {
          const it = s.priceList[idx];
          const pId = `sup-price-${s.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [BangGiaNhaCungCap] (id, supplierId, sku, productName, costPrice, warrantyMonths, moq)
            VALUES (${pId}, ${s.id}, ${it.sku}, ${it.productName}, ${it.costPrice}, ${it.warrantyMonths || 24}, ${it.moq || 1})
          `;
        }
      }
    }
  }

  // 16. Đơn đặt hàng mua (Purchase Orders)
  console.log(`16. Seeding ${INITIAL_PURCHASE_ORDERS.length} Purchase Orders...`);
  for (const po of INITIAL_PURCHASE_ORDERS) {
    const existing = await prisma.purchaseOrder.findMany({ where: { code: po.code } });
    if (existing.length === 0) {
      const dt = safeDate(po.orderDate);
      const expDt = safeDate(po.expectedDeliveryDate);
      await prisma.$executeRaw`
        INSERT INTO [DonDatHangMua] (id, code, supplierId, supplierName, supplierPhone, supplierAddress, supplierTaxCode, warehouseId, warehouseName, orderDate, expectedDeliveryDate, status, subtotal, vatRate, vatAmount, shippingFee, discountAmount, totalAmount, paidAmount, paymentStatus, paymentMethod, notes, createdAt, updatedAt)
        VALUES (${po.id}, ${po.code}, ${po.supplierId}, ${po.supplierName}, ${po.supplierPhone || null}, ${po.supplierAddress || null}, ${po.supplierTaxCode || null}, ${po.warehouseId || "wh-main"}, ${po.warehouseName || "Kho Tổng Gia Phúc TP.HCM"}, ${dt}, ${expDt}, ${po.status || "confirmed"}, ${po.subtotal}, ${po.vatRate || 10}, ${po.vatAmount || 0}, ${po.shippingFee || 0}, ${po.discountAmount || 0}, ${po.totalAmount}, ${po.paidAmount || 0}, ${po.paymentStatus || "unpaid"}, ${po.paymentMethod || "transfer"}, ${po.notes || null}, ${dt}, ${dt})
      `;

      if (po.items && po.items.length > 0) {
        for (let idx = 0; idx < po.items.length; idx++) {
          const it = po.items[idx];
          const itemId = `po-item-${po.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [ChiTietDonDatHangMua] (id, purchaseOrderId, productId, sku, productName, unit, quantity, unitPrice, total)
            VALUES (${itemId}, ${po.id}, ${it.productId || null}, ${it.sku}, ${it.productName}, ${it.unit || "Cái"}, ${it.quantity}, ${it.unitPrice}, ${it.total})
          `;
        }
      }
    }
  }

  // 17. Phòng ban & Bộ phận (Departments)
  console.log("17. Seeding Departments...");
  const INITIAL_DEPARTMENTS = [
    { id: "dept-bgd", code: "PB-BGD", name: "Ban Giám Đốc & Điều Hành", managerName: "Phạm Gia Phúc (Tổng Giám Đốc)", budget: 500000000, memberCount: 2, status: "active", description: "Hoạch định chiến lược kinh doanh, quản trị tài chính và phát triển hệ sinh thái ERP" },
    { id: "dept-kd", code: "PB-KD", name: "Phòng Kinh Doanh & Dự Án B2B", managerName: "Trần Quốc Bảo (Trưởng Phòng)", budget: 200000000, memberCount: 6, status: "active", description: "Tư vấn giải pháp CNTT, bán lẻ POS, lập báo giá dự án doanh nghiệp và trường học" },
    { id: "dept-kt", code: "PB-KT", name: "Phòng Kỹ Thuật & Triển Khai", managerName: "Trần Văn Hưng (Kỹ Thuật Trưởng)", budget: 150000000, memberCount: 8, status: "active", description: "Lắp ráp PC Gaming/Workstation, thi công mạng LAN/Server, xử lý bảo hành RMA" },
    { id: "dept-kho", code: "PB-KHO", name: "Bộ Phận Kho Vận & Logistics", managerName: "Lê Hoàng Long (Quản Kho)", budget: 80000000, memberCount: 4, status: "active", description: "Quản lý tồn kho WMS, kiểm đếm nhập - xuất hàng hóa, đóng gói giao nhận" },
    { id: "dept-ketoan", code: "PB-TCKT", name: "Phòng Tài Chính - Kế Toán", managerName: "Lê Thị Mỹ Hạnh (Kế Toán Trưởng)", budget: 120000000, memberCount: 3, status: "active", description: "Quản lý thu chi sổ quỹ, phát hành hóa đơn điện tử TT78, theo dõi công nợ NCC & Khách hàng" }
  ];
  for (const item of INITIAL_DEPARTMENTS) {
    const exists = await prisma.department.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [PhongBan] (id, code, name, managerName, budget, memberCount, status, description, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.managerName}, ${item.budget}, ${item.memberCount}, ${item.status}, ${item.description}, ${dt}, ${dt})
      `;
    }
  }

  // 18. Chức vụ & Cấp bậc (Job Positions)
  console.log("18. Seeding Job Positions...");
  const INITIAL_JOB_POSITIONS = [
    { id: "pos-ceo", code: "CV-CEO", title: "Tổng Giám Đốc (CEO)", departmentId: "dept-bgd", departmentName: "Ban Giám Đốc & Điều Hành", baseSalary: 45000000, responsibilityAllowance: 15000000, status: "active", description: "Đại diện pháp luật, ra quyết định toàn diện mọi hoạt động kinh doanh" },
    { id: "pos-sales-lead", code: "CV-TP-KD", title: "Trưởng Phòng Kinh Doanh B2B", departmentId: "dept-kd", departmentName: "Phòng Kinh Doanh & Dự Án B2B", baseSalary: 18000000, responsibilityAllowance: 7000000, status: "active", description: "Chịu trách nhiệm KPI doanh số toàn công ty, phát triển khách hàng đại lý và dự án" },
    { id: "pos-tech-lead", code: "CV-TP-KT", title: "Trưởng Phòng Kỹ Thuật IT", departmentId: "dept-kt", departmentName: "Phòng Kỹ Thuật & Triển Khai", baseSalary: 16000000, responsibilityAllowance: 5000000, status: "active", description: "Phụ trách chất lượng dịch vụ bảo hành sửa chữa, thẩm định kỹ thuật sản phẩm" },
    { id: "pos-sales", code: "CV-NV-BH", title: "Nhân Viên Tư Vấn Bán Hàng & POS", departmentId: "dept-kd", departmentName: "Phòng Kinh Doanh & Dự Án B2B", baseSalary: 8500000, responsibilityAllowance: 2000000, status: "active", description: "Bán hàng trực tiếp tại quầy POS, tư vấn cấu hình máy tính cho khách hàng" },
    { id: "pos-warehouse", code: "CV-NV-KHO", title: "Nhân Viên Thủ Kho & Điều Vận", departmentId: "dept-kho", departmentName: "Bộ Phận Kho Vận & Logistics", baseSalary: 8000000, responsibilityAllowance: 1500000, status: "active", description: "Thực hiện nhập kho NCC, xuất kho bán hàng và kiểm kê định kỳ" },
    { id: "pos-accountant", code: "CV-NV-KT", title: "Chuyên Viên Kế Toán Tổng Hợp", departmentId: "dept-ketoan", departmentName: "Phòng Tài Chính - Kế Toán", baseSalary: 11000000, responsibilityAllowance: 3000000, status: "active", description: "Lập báo cáo tài chính, xuất hóa đơn VAT, thu hồi công nợ đối tác" }
  ];
  for (const item of INITIAL_JOB_POSITIONS) {
    const exists = await prisma.jobPosition.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [ChucVu] (id, code, title, departmentId, departmentName, baseSalary, responsibilityAllowance, status, description, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.title}, ${item.departmentId}, ${item.departmentName}, ${item.baseSalary}, ${item.responsibilityAllowance}, ${item.status}, ${item.description}, ${dt}, ${dt})
      `;
    }
  }

  // 19. Vị trí lưu kho (Warehouse Locations)
  console.log("19. Seeding Warehouse Locations...");
  const INITIAL_LOCATIONS = [
    { id: "loc-a1-01", code: "VT-A1-01", name: "Kệ A1 - Tầng 1 (CPU & Vi Xử Lý)", warehouseName: "Kho Tổng Gia Phúc TP.HCM", zone: "Khu A - Linh Kiện Nhỏ Giá Trị Cao", shelf: "Kệ A1", tier: "Tầng 1 (Tầm Mắt)", bin: "Ngăn 01", capacity: 200, currentUsage: 85, status: "active", notes: "Có khóa an ninh, nhiệt độ phòng 22-25 độ C" },
    { id: "loc-a2-01", code: "VT-A2-01", name: "Kệ A2 - Tầng 2 (VGA & Card Màn Hình)", warehouseName: "Kho Tổng Gia Phúc TP.HCM", zone: "Khu A - Linh Kiện Nhỏ Giá Trị Cao", shelf: "Kệ A2", tier: "Tầng 2", bin: "Ngăn 01-04", capacity: 120, currentUsage: 42, status: "active", notes: "Khu vực trang bị camera giám sát 24/7 chống thất thoát" },
    { id: "loc-b1-01", code: "VT-B1-01", name: "Kệ B1 - Tầng 1 (RAM & Ổ Cứng SSD)", warehouseName: "Kho Tổng Gia Phúc TP.HCM", zone: "Khu B - Thiết Bị Lưu Trữ & Bộ Nhớ", shelf: "Kệ B1", tier: "Tầng 1", bin: "Ngăn 01-08", capacity: 350, currentUsage: 190, status: "active", notes: "Khu vực khô ráo, đóng gói chống ẩm" },
    { id: "loc-c1-01", code: "VT-C1-01", name: "Khu Pallet C1 (Màn Hình & Vỏ Case)", warehouseName: "Kho Tổng Gia Phúc TP.HCM", zone: "Khu C - Hàng Cồng Kềnh", shelf: "Pallet C1-C4", tier: "Mặt sàn", bin: "Khu mở", capacity: 60, currentUsage: 28, status: "active", notes: "Xếp tối đa 3 thùng chồng lên nhau theo khuyến cáo nhà sản xuất" }
  ];
  for (const item of INITIAL_LOCATIONS) {
    const exists = await prisma.warehouseLocation.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [ViTriLuuKho] (id, code, name, warehouseName, zone, shelf, tier, bin, capacity, currentUsage, status, notes, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.warehouseName}, ${item.zone}, ${item.shelf}, ${item.tier}, ${item.bin}, ${item.capacity}, ${item.currentUsage}, ${item.status}, ${item.notes}, ${dt}, ${dt})
      `;
    }
  }

  // 20. Đơn vị tính (Units of Measure)
  console.log("20. Seeding Units of Measure...");
  const INITIAL_UOMS = [
    { id: "uom-cai", code: "DVT-CAI", name: "Cái (Chiếc)", symbol: "Cái", isBaseUnit: true, referenceUnit: null, conversionFactor: 1, status: "active", description: "Đơn vị tính cơ sở chuẩn cho hầu hết các thiết bị IT và linh kiện máy tính" },
    { id: "uom-bo", code: "DVT-BO", name: "Bộ (Combo / Fullset)", symbol: "Bộ", isBaseUnit: false, referenceUnit: "Cái", conversionFactor: 1, status: "active", description: "Bộ linh kiện kèm phụ kiện hoặc trọn bộ máy tính nguyên thùng" },
    { id: "uom-hop", code: "DVT-HOP", name: "Hộp (Box)", symbol: "Hộp", isBaseUnit: false, referenceUnit: "Cái", conversionFactor: 10, status: "active", description: "Quy cách đóng gói hộp phụ kiện, hạt mạng, keo tản nhiệt" },
    { id: "uom-thung", code: "DVT-THUNG", name: "Thùng (Carton)", symbol: "Thùng", isBaseUnit: false, referenceUnit: "Cái", conversionFactor: 20, status: "active", description: "Quy cách nhập khẩu nguyên đai nguyên kiện từ hãng" },
    { id: "uom-cuon", code: "DVT-CUON", name: "Cuộn (Thùng Cáp 305m)", symbol: "Cuộn", isBaseUnit: false, referenceUnit: "Mét", conversionFactor: 305, status: "active", description: "Thùng cáp mạng Cat6 UTP/FTP chính hãng 305 mét" },
    { id: "uom-met", code: "DVT-MET", name: "Mét (Dây Cáp Cắt Lẻ)", symbol: "m", isBaseUnit: true, referenceUnit: null, conversionFactor: 1, status: "active", description: "Đơn vị đo chiều dài cáp mạng, cáp quang, dây nguồn thi công" },
    { id: "uom-pallet", code: "DVT-PALLET", name: "Pallet (Kiện Lớn)", symbol: "Pallet", isBaseUnit: false, referenceUnit: null, conversionFactor: 1, status: "active", description: "Quy cách lưu kho và bốc dỡ theo pallet tiêu chuẩn" },
    { id: "uom-kg", code: "DVT-KG", name: "Kilogram (Kg)", symbol: "kg", isBaseUnit: true, referenceUnit: null, conversionFactor: 1, status: "active", description: "Đơn vị đo khối lượng chuẩn" },
    { id: "uom-gam", code: "DVT-GAM", name: "Gam (g)", symbol: "g", isBaseUnit: false, referenceUnit: null, conversionFactor: 0.001, status: "active", description: "Đơn vị đo khối lượng nhỏ (keo tản nhiệt, linh kiện chip)" },
    { id: "uom-lon", code: "DVT-LON", name: "Lon (Can)", symbol: "Lon", isBaseUnit: true, referenceUnit: null, conversionFactor: 1, status: "active", description: "Đơn vị đóng gói lon nước ngọt, dung dịch vệ sinh mạch" },
    { id: "uom-loc", code: "DVT-LOC", name: "Lốc (Vỉ 6)", symbol: "Lốc", isBaseUnit: false, referenceUnit: null, conversionFactor: 6, status: "active", description: "Lốc vỉ đóng gói 6 lon/chai" },
    { id: "uom-goi", code: "DVT-GOI", name: "Gói (Túi)", symbol: "Gói", isBaseUnit: false, referenceUnit: null, conversionFactor: 1, status: "active", description: "Gói phụ kiện nhỏ, ốc vít máy tính, dây rút" }
  ];
  for (const item of INITIAL_UOMS) {
    const exists = await prisma.masterUnitOfMeasure.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [DanhMucDonViTinh] (id, code, name, symbol, isBaseUnit, referenceUnit, conversionFactor, status, description, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.symbol}, ${item.isBaseUnit ? 1 : 0}, ${item.referenceUnit}, ${item.conversionFactor}, ${item.status}, ${item.description}, ${dt}, ${dt})
      `;
    }
  }

  // 20.1 Bảng quy đổi đơn vị tính (Master UOM Conversions: ĐVT A = Hệ số x ĐVT B)
  console.log("20.1 Seeding Master UOM Conversions...");
  const INITIAL_UOM_CONVERSIONS = [
    { id: "conv-thung-cuon", fromUnitName: "Thùng", factor: 10, toUnitName: "Cuộn", note: "1 Thùng cáp = 10 Cuộn", status: "active" },
    { id: "conv-cuon-met", fromUnitName: "Cuộn", factor: 100, toUnitName: "Mét", note: "1 Cuộn = 100 Mét", status: "active" },
    { id: "conv-cuon-kg", fromUnitName: "Cuộn", factor: 10, toUnitName: "Kilogram (Kg)", note: "1 Cuộn = 10 Kg", status: "active" },
    { id: "conv-thung-lon", fromUnitName: "Thùng", factor: 24, toUnitName: "Lon", note: "1 Thùng = 24 Lon", status: "active" },
    { id: "conv-loc-lon", fromUnitName: "Lốc", factor: 6, toUnitName: "Lon", note: "1 Lốc = 6 Lon", status: "active" },
    { id: "conv-thung-hop", fromUnitName: "Thùng", factor: 20, toUnitName: "Hộp", note: "1 Thùng = 20 Hộp", status: "active" },
    { id: "conv-hop-cai", fromUnitName: "Hộp", factor: 50, toUnitName: "Cái (Chiếc)", note: "1 Hộp = 50 Cái", status: "active" },
    { id: "conv-pallet-thung", fromUnitName: "Pallet", factor: 40, toUnitName: "Thùng", note: "1 Pallet = 40 Thùng", status: "active" },
  ];

  for (const conv of INITIAL_UOM_CONVERSIONS) {
    const exists = await prisma.masterUOMConversion.findMany({
      where: { fromUnitName: conv.fromUnitName, toUnitName: conv.toUnitName },
    });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [DanhMucQuyDoiDVT] (id, fromUnitName, factor, toUnitName, note, status, createdAt, updatedAt)
        VALUES (${conv.id}, ${conv.fromUnitName}, ${conv.factor}, ${conv.toUnitName}, ${conv.note}, ${conv.status}, ${dt}, ${dt})
      `;
    }
  }

  // 21. Danh mục ngành hàng (Product Categories)
  console.log("21. Seeding Product Categories...");
  const INITIAL_CATEGORIES = [
    { id: "cat-vga", code: "DM-VGA", name: "Card Màn Hình (VGA)", slug: "card-man-hinh-vga", icon: "Monitor", sortOrder: 1, status: "active", description: "NVIDIA GeForce RTX, AMD Radeon chính hãng bảo hành 36 tháng" },
    { id: "cat-cpu", code: "DM-CPU", name: "Bộ Vi Xử Lý (CPU)", slug: "bo-vi-xu-ly-cpu", icon: "Cpu", sortOrder: 2, status: "active", description: "Intel Core i3/i5/i7/i9 Gen 12-14, AMD Ryzen 5000/7000/9000 Series" },
    { id: "cat-main", code: "DM-MAIN", name: "Bo Mạch Chủ (Mainboard)", slug: "bo-mach-chu-mainboard", icon: "CircuitBoard", sortOrder: 3, status: "active", description: "ASUS, MSI, Gigabyte, ASRock chipset B760, Z790, B650, X670" },
    { id: "cat-ram", code: "DM-RAM", name: "Bộ Nhớ Trong (RAM)", slug: "bo-nho-ram", icon: "Layers", sortOrder: 4, status: "active", description: "DDR4, DDR5 bus 3200MHz - 6000MHz Kingston, Corsair, G.Skill" },
    { id: "cat-ssd", code: "DM-SSD", name: "Ổ Cứng SSD & HDD", slug: "o-cung-ssd-hdd", icon: "HardDrive", sortOrder: 5, status: "active", description: "SSD M.2 NVMe PCIe Gen 4/Gen 5 Samsung, Kingston, WD Black" },
    { id: "cat-monitor", code: "DM-MONITOR", name: "Màn Hình Máy Tính", slug: "man-hinh-may-tinh", icon: "Tv", sortOrder: 6, status: "active", description: "Màn hình Gaming 144Hz-240Hz, màn hình đồ họa 2K/4K IPS" }
  ];
  for (const item of INITIAL_CATEGORIES) {
    const exists = await prisma.masterProductCategory.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [DanhMucNganhHang] (id, code, name, slug, icon, sortOrder, status, description, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.slug}, ${item.icon}, ${item.sortOrder}, ${item.status}, ${item.description}, ${dt}, ${dt})
      `;
    }
  }

  // 22. Nhóm khách hàng (Customer Groups)
  console.log("22. Seeding Customer Groups...");
  const INITIAL_CUSTOMER_GROUPS = [
    { id: "grp-retail", code: "NKH-LE", name: "Khách Hàng Mua Lẻ (Showroom / Web)", discountPercent: 0, paymentTerms: "Thanh toán ngay (Tiền mặt / Chuyển khoản / Quẹt thẻ)", creditLimit: 0, description: "Khách hàng cá nhân mua sắm nâng cấp máy tính tại quầy và online", customerCount: 45 },
    { id: "grp-b2b", code: "NKH-DOANH-NGHIEP", name: "Khách Hàng Doanh Nghiệp & Phòng Net (B2B)", discountPercent: 5, paymentTerms: "Gối đầu 15 - 30 ngày theo hợp đồng nguyên tắc", creditLimit: 200000000, description: "Công ty, văn phòng, chuỗi Cyber Game mua số lượng lớn theo dự án", customerCount: 12 },
    { id: "grp-dealer", code: "NKH-DAI-LY", name: "Đại Lý Cấp 2 & Thợ Kỹ Thuật (Sỉ)", discountPercent: 8, paymentTerms: "Chuyển khoản cọc 50%, thanh toán đủ khi nhận hàng", creditLimit: 50000000, description: "Cửa hàng tin học địa phương, kỹ thuật viên lắp ráp mua sỉ linh kiện", customerCount: 18 }
  ];
  for (const item of INITIAL_CUSTOMER_GROUPS) {
    const exists = await prisma.customerGroup.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [NhomKhachHang] (id, code, name, discountPercent, paymentTerms, creditLimit, description, customerCount, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.discountPercent}, ${item.paymentTerms}, ${item.creditLimit}, ${item.description}, ${item.customerCount}, ${dt}, ${dt})
      `;
    }
  }

  // 23. Hạng thành viên (Customer Tiers)
  console.log("23. Seeding Customer Tiers...");
  const INITIAL_CUSTOMER_TIERS = [
    { id: "tier-bronze", code: "H-DONG", name: "Đồng", minSpend: 0, discountPercent: 0, pointMultiplier: 1.0, color: "#CD7F32", badge: "Thành Viên Mới", benefits: "Tích lũy 1% giá trị đơn hàng làm điểm thưởng quy đổi" },
    { id: "tier-silver", code: "H-BAC", name: "Bạc", minSpend: 15000000, discountPercent: 2, pointMultiplier: 1.2, color: "#C0C0C0", badge: "Khách Quen", benefits: "Chiết khấu trực tiếp 2% trên mọi đơn hàng linh kiện, vệ sinh PC miễn phí" },
    { id: "tier-gold", code: "H-VANG", name: "Vàng", minSpend: 50000000, discountPercent: 5, pointMultiplier: 1.5, color: "#FFD700", badge: "Khách VIP Vàng", benefits: "Chiết khấu 5%, ưu tiên bảo hành 1 đổi 1 tận nơi trong 24h, tặng quà sinh nhật" },
    { id: "tier-diamond", code: "H-KIMCUONG", name: "Kim Cương", minSpend: 150000000, discountPercent: 8, pointMultiplier: 2.0, color: "#00E5FF", badge: "Đối Tác Kim Cương", benefits: "Chiết khấu kịch sàn 8%, kỹ thuật viên riêng hỗ trợ 24/7, mượn thiết bị thay thế" }
  ];
  for (const item of INITIAL_CUSTOMER_TIERS) {
    const exists = await prisma.masterCustomerTier.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [HangThanhVien] (id, code, name, minSpend, discountPercent, pointMultiplier, color, badge, benefits, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.minSpend}, ${item.discountPercent}, ${item.pointMultiplier}, ${item.color}, ${item.badge}, ${item.benefits}, ${dt}, ${dt})
      `;
    }
  }

  // 24. Phân loại nhà cung cấp (Supplier Categories)
  console.log("24. Seeding Supplier Categories...");
  const INITIAL_SUPPLIER_CATEGORIES = [
    { id: "supcat-tier1", code: "PL-T1", name: "Nhà Phân Phối Cấp 1 Chính Hãng (Tier-1 Distributor)", description: "Các tổng kho phân phối được hãng ủy quyền trực tiếp tại Việt Nam (Synnex FPT, Viễn Sơn, SPC, Dầu Khí PSD)", defaultPaymentTerms: "Gối đầu 30 ngày / Hạn mức 500 Triệu", supplierCount: 4 },
    { id: "supcat-master-dealer", code: "PL-TONG-DL", name: "Tổng Đại Lý & Nhập Khẩu Trực Tiếp", description: "Đơn vị cung cấp nguồn hàng xách tay chính hãng hoặc phụ kiện chuyên biệt số lượng lớn", defaultPaymentTerms: "Gối đầu 15 ngày / Thanh toán theo từng đợt", supplierCount: 3 }
  ];
  for (const item of INITIAL_SUPPLIER_CATEGORIES) {
    const exists = await prisma.masterSupplierCategory.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [PhanLoaiNhaCungCap] (id, code, name, description, defaultPaymentTerms, supplierCount, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.description}, ${item.defaultPaymentTerms}, ${item.supplierCount}, ${dt}, ${dt})
      `;
    }
  }

  // 25. Dự án doanh nghiệp (Enterprise Projects)
  console.log("25. Seeding Enterprise Projects...");
  const INITIAL_PROJECTS = [
    { id: "proj-2026-01", code: "DA-2026-FPT", name: "Triển Khai Phòng Lab AI & Đồ Họa Đại Học FPT", status: "in_progress", customerName: "Đại Học FPT TP.HCM", customerId: "cust-01", managerName: "Trần Quốc Bảo (Phòng Dự Án)", managerId: "emp-01", budget: 680000000, startDate: "2026-02-10", endDate: "2026-04-30", sector: "Giáo Dục & Nghiên Cứu CNTT", description: "Cung cấp 40 bộ máy Workstation cấu hình i7-14700K / RTX 4070 Ti Super kèm hệ thống mạng 10Gbps", linkedDeviceCount: 40 },
    { id: "proj-2026-02", code: "DA-2026-CYBER", name: "Lắp Đặt Trọn Gói Chuỗi Cyber Game Kingdom Quận 10", status: "in_progress", customerName: "Kingdom Cyber Gaming Hub", customerId: "cust-02", managerName: "Trần Văn Hưng (Kỹ Thuật)", managerId: "emp-02", budget: 950000000, startDate: "2026-01-15", endDate: "2026-03-25", sector: "Dịch Vụ & Thể Thao Điện Tử", description: "Hệ thống Bootrom Server + 60 máy trạm Gaming màn hình 240Hz cong và hệ thống thanh toán tự động", linkedDeviceCount: 60 }
  ];
  for (const item of INITIAL_PROJECTS) {
    const exists = await prisma.enterpriseProject.findMany({ where: { code: item.code } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [DuAnDoanhNghiep] (id, code, name, status, customerName, customerId, managerName, managerId, budget, startDate, endDate, sector, description, linkedDeviceCount, createdAt, updatedAt)
        VALUES (${item.id}, ${item.code}, ${item.name}, ${item.status}, ${item.customerName}, ${item.customerId}, ${item.managerName}, ${item.managerId}, ${item.budget}, ${item.startDate}, ${item.endDate}, ${item.sector}, ${item.description}, ${item.linkedDeviceCount}, ${dt}, ${dt})
      `;
    }
  }

  // 26. Phiếu Nhập Kho & Xuất Kho Mẫu (Stock Goods Receipts & Issues with Multiple Serials)
  console.log("26. Seeding Stock Goods Receipts & Issues with Multiple Serials...");
  
  // 26.1 Phiếu Nhập Kho 1 (PNK-2026-0827-001 - FPT Synnex)
  const existingReceipts1 = await prisma.stockGoodsReceipt.findMany({ where: { code: "PNK-2026-0827-001" } });
  if (existingReceipts1.length === 0) {
    const rcId = "rc-2026-827-01";
    const rcDate = new Date("2026-08-27T08:00:00");
    await prisma.$executeRaw`
      INSERT INTO [PhieuNhapKho] (id, code, date, sourceType, sourceId, sourceCode, supplierName, supplierTaxCode, supplierPhone, supplierAddress, warehouseName, creatorName, receivedBy, totalItemsCount, totalQuantity, totalCostAmount, totalTaxAmount, grandTotal, paymentStatus, notes)
      VALUES (${rcId}, 'PNK-2026-0827-001', ${rcDate}, 'po', 'po-01', 'PO-2026-001', N'Công Ty Cổ Phần Phân Phối Synnex FPT', '0101778899', '028 7300 6666', N'Tòa nhà FPT Tân Thuận, Quận 7, TP.HCM', N'Kho Chính Gia Phúc Computer', N'Nguyễn Văn Minh (Thủ Kho)', N'Nguyễn Văn Minh (Thủ Kho)', 4, 14, 21430000, 1714400, 23144400, 'paid', N'Nhập linh kiện máy tính Kingston, Gigabyte, Corsair kèm Serial 100% nguyên seal')
    `;

    // 5x SSD Kingston
    const serialsSsd = JSON.stringify(["SN-SSD-KS-5001", "SN-SSD-KS-5002", "SN-SSD-KS-5003", "SN-SSD-KS-5004", "SN-SSD-KS-5005"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
      VALUES ('rc-item-827-1', ${rcId}, 'prod-gp-ssd-500', N'Ổ Cứng SSD Kingston NV2 500GB PCIe 4.0 NVMe M.2 2280', 'SSD-KINGSTON-500G', N'Cái', 5, 10, 15, 850000, 850000, 850000, 8, 4590000, N'Kệ A2 - Tầng 2 (Ổ cứng & SSD)', N'Kho Chính Gia Phúc Computer', N'Linh kiện Máy tính & Laptop', N'PCIe 4.0 x4 NVMe 3500MB/s', N'Xanh Đen', 'Kingston', 36, N'Vít M.2, Sách HDSD', ${serialsSsd}, N'Bảo hành chính hãng 36 tháng SPC/Vĩnh Xuân')
    `;

    // 3x Mainboard Gigabyte
    const serialsMb = JSON.stringify(["SN-MB-GIGA-001", "SN-MB-GIGA-002", "SN-MB-GIGA-003"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
      VALUES ('rc-item-827-2', ${rcId}, 'prod-gp-mb-b760', N'Mainboard Gigabyte B760M GAMING PLUS WIFI DDR4', 'MB-GIGA-B760M', N'Cái', 3, 5, 8, 2950000, 2950000, 2950000, 8, 9558000, N'Kệ B2 - Tầng 2 (RAM & Linh kiện PC)', N'Kho Chính Gia Phúc Computer', N'Linh kiện Máy tính & Laptop', N'Socket LGA1700, WiFi 6 + BT 5.2', N'Đen Bạc', 'Gigabyte', 36, N'Antenna WiFi, Cáp SATA, Chặn Fe I/O', ${serialsMb}, N'Hàng phân phối chính hãng Viễn Sơn')
    `;

    // 4x RAM Corsair
    const serialsRam = JSON.stringify(["SN-RAM-CS-16G-01", "SN-RAM-CS-16G-02", "SN-RAM-CS-16G-03", "SN-RAM-CS-16G-04"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
      VALUES ('rc-item-827-3', ${rcId}, 'prod-gp-ram-16g', N'RAM Desktop Corsair Vengeance LPX 16GB DDR4 3200MHz', 'RAM-CORSAIR-16G', N'Thanh', 4, 16, 20, 920000, 920000, 920000, 8, 3974400, N'Kệ B2 - Tầng 2 (RAM & Linh kiện PC)', N'Kho Chính Gia Phúc Computer', N'Linh kiện Máy tính & Laptop', N'DDR4 3200MHz CL16 1.35V', N'Đen Nhám', 'Corsair', 36, N'Hộp Mica', ${serialsRam}, N'Tem KTC phân phối')
    `;

    // 2x Đầu Ghi Hikvision
    const serialsDvr = JSON.stringify(["SN-DVR-HIK-8801", "SN-DVR-HIK-8802"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
      VALUES ('rc-item-827-4', ${rcId}, 'prod-gp-1', N'Đầu ghi hình IP DS-7616NXI-K1 (16 Kênh Chuẩn NVR 4K AcuSense)', 'DVR7616-k1', 'PCS', 2, 16, 18, 2350000, 2350000, 2350000, 8, 5076000, N'Kệ A1 - Tầng 1 (Đầu ghi & Camera)', N'Kho Chính Gia Phúc Computer', N'Điện tử & Cáp điện', N'16 Kênh 4K AcuSense H.265+', N'Đen', 'Hikvision', 24, N'Adapter 12V, Chuột USB, Cáp SATA, Ốc vít', ${serialsDvr}, N'Nguyên seal nhà máy Hikvision')
    `;
  }

  // 26.2 Phiếu Nhập Kho 2 (PNK-2026-0827-002 - Phong Vũ)
  const existingReceipts2 = await prisma.stockGoodsReceipt.findMany({ where: { code: "PNK-2026-0827-002" } });
  if (existingReceipts2.length === 0) {
    const rcId2 = "rc-2026-827-02";
    const rcDate2 = new Date("2026-08-27T09:00:00");
    await prisma.$executeRaw`
      INSERT INTO [PhieuNhapKho] (id, code, date, sourceType, sourceId, sourceCode, supplierName, supplierTaxCode, supplierPhone, supplierAddress, warehouseName, creatorName, receivedBy, totalItemsCount, totalQuantity, totalCostAmount, totalTaxAmount, grandTotal, paymentStatus, notes)
      VALUES (${rcId2}, 'PNK-2026-0827-002', ${rcDate2}, 'inbound_invoice', 'inv-in-01', 'HD-PV-9921', N'Công Ty Cổ Phần Thương Mại - Dịch Vụ Phong Vũ', '0304998877', '1800 6867', N'Tầng 5, Số 117-119-121 Nguyễn Du, P. Bến Thành, Quận 1, TP.HCM', N'Kho Chính Gia Phúc Computer', N'Nguyễn Văn Minh (Thủ Kho)', N'Nguyễn Văn Minh (Thủ Kho)', 2, 7, 43300000, 3464000, 46764000, 'paid', N'Nhập Laptop Dell Vostro & Camera IP theo HĐĐT')
    `;

    const serialsDell = JSON.stringify(["SN-DELL-V3520-01", "SN-DELL-V3520-02"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
      VALUES ('rc-item-827-5', ${rcId2}, 'prod-gp-dell-v3520', N'Laptop Dell Vostro 3520 (Core i5-1235U / 16GB RAM / 512GB SSD / 15.6" FHD 120Hz)', 'LAP-DELL-V3520', N'Máy', 2, 4, 6, 12800000, 12800000, 12800000, 8, 27648000, N'Kệ B1 - Tầng 1 (Switch & Thiết bị mạng)', N'Kho Chính Gia Phúc Computer', N'Linh kiện Máy tính & Laptop', N'i5-1235U / 16GB / 512GB NVMe / 15.6" 120Hz', N'Xám Đen Titan', 'Dell', 12, N'Củ sạc zin Dell 65W, Dây nguồn, Balo, Chuột', ${serialsDell}, N'Chính hãng Dell ProSupport')
    `;

    const serialsCam = JSON.stringify(["SN-CAM-HIK-401", "SN-CAM-HIK-402", "SN-CAM-HIK-403", "SN-CAM-HIK-404", "SN-CAM-HIK-405"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuNhapKho] (id, receiptId, productId, productName, sku, unit, quantity, oldStock, newStock, oldCostPrice, newCostPrice, unitCost, taxRate, totalAmount, storageLocation, warehouse, category, specifications, color, brand, warrantyMonths, accessories, serials, notes)
      VALUES ('rc-item-827-6', ${rcId2}, 'prod-gp-2', N'Camera IP DS-2CD1T41G2-LIU (Thân Trụ 4MP Cảnh Báo Âm Thanh Ánh Sáng)', 'CA41G2', 'PCS', 5, 40, 45, 980000, 980000, 980000, 8, 5292000, N'Kệ A1 - Tầng 1 (Đầu ghi & Camera)', N'Kho Chính Gia Phúc Computer', N'Điện tử & Cáp điện', N'4.0MP ColorVu ban đêm có màu, Micro thu âm', N'Trắng', 'Hikvision', 24, N'Chân đế, Bộ ốc vít, Đầu chụp mạng chống nước', ${serialsCam}, N'Bảo hành 24 tháng')
    `;
  }

  // 26.3 Phiếu Xuất Kho Mẫu (XK-2026-9580)
  const existingIssues = await prisma.stockGoodsIssue.findMany({ where: { code: "XK-2026-9580" } });
  if (existingIssues.length === 0) {
    const isId = "issue-2026-9580";
    const isDate = new Date("2026-08-27T09:30:00");
    await prisma.$executeRaw`
      INSERT INTO [PhieuXuatKho] (id, code, orderId, orderCode, customerName, customerPhone, customerAddress, warehouseName, dispatchedBy, dispatchedAt, totalQuantity, totalItemsCount, status, notes, createdAt)
      VALUES (${isId}, 'XK-2026-9580', 'ord-test-800', 'HD-20260827-800', N'Anh Trần Quốc Toản', '0933888999', N'Quận 10, TP.HCM', N'Kho Chính Gia Phúc Computer', N'Nguyễn Văn Minh (Thủ Kho)', ${isDate}, 2, 2, 'completed', N'Xuất kho hoàn tất bàn giao kèm kích hoạt bảo hành điện tử', ${isDate})
    `;

    const serialsIssued = JSON.stringify(["SN-SSD-KS-5001"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuXuatKho] (id, issueId, productId, productName, sku, unit, quantity, serials, warrantyMonths, notes)
      VALUES ('issue-item-800-1', ${isId}, 'prod-gp-ssd-500', N'Ổ Cứng SSD Kingston NV2 500GB PCIe 4.0 NVMe M.2 2280', 'SSD-KINGSTON-500G', N'Cái', 1, ${serialsIssued}, 36, N'Đã dán tem bảo hành Gia Phúc')
    `;

    const serialsIssuedMb = JSON.stringify(["SN-MB-GIGA-001"]);
    await prisma.$executeRaw`
      INSERT INTO [ChiTietPhieuXuatKho] (id, issueId, productId, productName, sku, unit, quantity, serials, warrantyMonths, notes)
      VALUES ('issue-item-800-2', ${isId}, 'prod-gp-mb-b760', N'Mainboard Gigabyte B760M GAMING PLUS WIFI DDR4', 'MB-GIGA-B760M', N'Cái', 1, ${serialsIssuedMb}, 36, N'Đã kiểm tra bios mới nhất')
    `;
  }

  // 26.4 Nạp Đơn Hàng Bán POS (Orders)
  console.log(`26.4 Seeding ${INITIAL_ORDERS.length} POS Sales Orders...`);
  for (const ord of INITIAL_ORDERS) {
    const existingOrd = await prisma.order.findMany({ where: { code: ord.code } });
    if (existingOrd.length === 0) {
      const oDate = safeDate(ord.createdAt);
      const cDate = safeDate(ord.completedAt);

      let validCustId: string | null = null;
      if (ord.customer?.id) {
        const custs = await prisma.customer.findMany({ where: { id: ord.customer.id } });
        if (custs.length > 0) {
          validCustId = ord.customer.id;
        } else if (ord.customer.phone) {
          const byPhone = await prisma.customer.findMany({ where: { phone: ord.customer.phone } });
          if (byPhone.length > 0) {
            validCustId = byPhone[0].id;
          }
        }
      }

      await prisma.$executeRaw`
        INSERT INTO [HoaDon] (id, code, channel, status, customerId, customerName, customerPhone, customerAddress, customerRank, subtotal, discountAmount, discountCode, taxRate, taxAmount, shippingFee, shippingPartner, trackingCode, total, totalCost, profit, paymentMethod, paymentStatus, paidAmount, changeAmount, note, shiftId, createdAt, completedAt)
        VALUES (${ord.id}, ${ord.code}, ${ord.channel || "Tại quầy (POS)"}, ${ord.status || "completed"}, ${validCustId}, ${ord.customer?.name || null}, ${ord.customer?.phone || null}, ${ord.customer?.address || null}, ${ord.customer?.rank || null}, ${ord.subtotal}, ${ord.discountAmount || 0}, ${ord.discountCode || null}, ${ord.taxRate || 0}, ${ord.taxAmount || 0}, ${ord.shippingFee || 0}, ${ord.shippingPartner || null}, ${ord.trackingCode || null}, ${ord.total}, ${ord.totalCost || 0}, ${ord.profit || 0}, ${ord.paymentMethod || "cash"}, ${ord.paymentStatus || "paid"}, ${ord.paidAmount || ord.total}, ${ord.changeAmount || 0}, ${ord.note || null}, ${(ord as any).shiftId || null}, ${oDate}, ${cDate})
      `;

      if (ord.items && ord.items.length > 0) {
        for (let idx = 0; idx < ord.items.length; idx++) {
          const it = ord.items[idx];
          const itemId = `oi-${ord.id}-${idx}`;
          await prisma.$executeRaw`
            INSERT INTO [ChiTietHoaDon] (id, orderId, productId, productName, sku, unit, ratioToBase, quantity, unitPrice, costPrice, discountPercent, total)
            VALUES (${itemId}, ${ord.id}, ${it.productId}, ${it.productName}, ${it.sku}, ${it.unit || "Cái"}, ${it.ratioToBase || 1}, ${it.quantity}, ${it.unitPrice}, ${it.costPrice || 0}, ${it.discountPercent || 0}, ${it.total})
          `;
        }
      }
    }
  }

  // 27. Phân quyền vai trò hệ thống (RBAC Roles & Modules)
  console.log("27. Seeding RBAC Roles & Modules...");
  const INITIAL_ROLES_SEED = [
    {
      roleKey: "admin",
      roleNameVi: "Quản Trị Viên (Admin)",
      description: "Toàn quyền tối cao quản trị hệ thống, dữ liệu, tài khoản và cấu hình phân quyền",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      gradient: "from-rose-600 to-red-600",
      defaultTab: "pos",
      permissions: JSON.stringify([
        "pos", "quotes", "suppliers", "costing", "inventory", "assets", "warranties",
        "accounting", "einvoices", "contracts", "orders", "hr", "ai", "customers",
        "promotions", "analytics", "accounts", "masterdata", "settings",
        "scanner_printer_hub", "quick_stock", "ai_copilot", "cash_shift", "doc_ocr",
        "digital_signature", "database_config", "fraud_alerts"
      ]),
    },
    {
      roleKey: "manager",
      roleNameVi: "Quản Lý Cửa Hàng / Giám Đốc",
      description: "Giám sát hoạt động bán hàng, kho, doanh thu, phê duyệt báo giá và đánh giá KPI nhân sự",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      gradient: "from-blue-600 to-indigo-600",
      defaultTab: "analytics",
      permissions: JSON.stringify([
        "pos", "quotes", "suppliers", "costing", "inventory", "assets", "warranties",
        "accounting", "einvoices", "contracts", "orders", "hr", "ai", "customers",
        "promotions", "analytics", "masterdata", "scanner_printer_hub", "quick_stock",
        "ai_copilot", "cash_shift", "doc_ocr", "digital_signature", "fraud_alerts"
      ]),
    },
    {
      roleKey: "cashier",
      roleNameVi: "Nhân Viên Thu Ngân POS",
      description: "Bán hàng tại quầy, quản lý két tiền ca làm việc, in hóa đơn, đổi trả hàng tại quầy",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      gradient: "from-emerald-600 to-teal-600",
      defaultTab: "pos",
      permissions: JSON.stringify([
        "pos", "orders", "customers", "warranties", "promotions", "quotes",
        "scanner_printer_hub", "cash_shift"
      ]),
    },
    {
      roleKey: "warehouse",
      roleNameVi: "Thủ Kho Vật Tư & Nhập Hàng",
      description: "Quản lý tồn kho, nhập/xuất/kiểm kê kho, mua hàng PO, quản lý nhà cung cấp, in tem mã vạch",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      gradient: "from-amber-600 to-orange-600",
      defaultTab: "inventory",
      permissions: JSON.stringify([
        "inventory", "suppliers", "costing", "assets", "orders",
        "scanner_printer_hub", "quick_stock", "doc_ocr"
      ]),
    },
    {
      roleKey: "accountant",
      roleNameVi: "Kế Toán Trưởng & Tài Chính",
      description: "Quản lý sổ quỹ, thu chi công nợ, hóa đơn điện tử TT78, hợp đồng lao động, tính lương và ký số CA",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      gradient: "from-purple-600 to-fuchsia-600",
      defaultTab: "accounting",
      permissions: JSON.stringify([
        "accounting", "einvoices", "contracts", "hr", "analytics", "ai", "suppliers",
        "orders", "costing", "assets", "masterdata", "digital_signature", "doc_ocr",
        "ai_copilot", "fraud_alerts"
      ]),
    },
    {
      roleKey: "sales",
      roleNameVi: "Nhân Viên Kinh Doanh / Bán Hàng",
      description: "Lập báo giá khách hàng, quản lý CRM khách hàng, theo dõi đơn hàng và khuyến mãi",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      gradient: "from-cyan-600 to-blue-600",
      defaultTab: "quotes",
      permissions: JSON.stringify([
        "quotes", "customers", "promotions", "orders"
      ]),
    },
    {
      roleKey: "technician",
      roleNameVi: "Kỹ Thuật Viên & Bảo Hành",
      description: "Tiếp nhận xử lý bảo hành, sửa chữa thiết bị, tra cứu serial/IMEI và quản lý vật tư thay thế",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      gradient: "from-teal-600 to-emerald-600",
      defaultTab: "warranties",
      permissions: JSON.stringify([
        "warranties", "scanner_printer_hub"
      ]),
    },
  ];

  for (const r of INITIAL_ROLES_SEED) {
    const exists = await prisma.rolePermission.findMany({ where: { roleKey: r.roleKey } });
    if (exists.length === 0) {
      const id = `role-${r.roleKey}`;
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [PhanQuyenVaiTro] (id, roleKey, roleNameVi, description, badgeColor, gradient, defaultTab, permissions, createdAt, updatedAt)
        VALUES (${id}, ${r.roleKey}, ${r.roleNameVi}, ${r.description}, ${r.badgeColor}, ${r.gradient}, ${r.defaultTab}, ${r.permissions}, ${dt}, ${dt})
      `;
    }
  }

  const INITIAL_MODULES_SEED = [
    { id: "pos", label: "Quản Lý Bán Hàng (POS)", category: "core", description: "Bán hàng thu ngân tại quầy, tính tiền nhanh, mở/đóng ca két tiền", orderIndex: 1 },
    { id: "quotes", label: "Quản Lý Báo Giá", category: "operation", description: "Lập báo giá chuyên nghiệp cho khách hàng cá nhân / doanh nghiệp", orderIndex: 2 },
    { id: "suppliers", label: "Nhà Cung Ứng & Mua Hàng", category: "operation", description: "Quản lý danh sách nhà cung cấp, bảng giá đối tác và đơn mua hàng PO", orderIndex: 3 },
    { id: "costing", label: "Tính Giá Thành & BOM", category: "operation", description: "Định mức linh kiện vật tư BOM, chi phí nhân công, khấu hao máy móc", orderIndex: 4 },
    { id: "inventory", label: "Quản Lý Kho Hàng", category: "operation", description: "Quản lý tồn kho, xuất nhập kho, kiểm kho, chuyển kho nội bộ", orderIndex: 5 },
    { id: "assets", label: "Tài Sản & Thiết Bị", category: "management", description: "Quản lý trang thiết bị doanh nghiệp, tài sản cố định và khấu hao", orderIndex: 6 },
    { id: "warranties", label: "Bảo Hành & Bảo Trì", category: "operation", description: "Tiếp nhận phiếu bảo hành, sửa chữa, theo dõi Serial/IMEI thiết bị", orderIndex: 7 },
    { id: "accounting", label: "Kế Toán & Công Nợ", category: "finance", description: "Quản lý phiếu thu chi, sổ quỹ tiền mặt, công nợ khách hàng và NCC", orderIndex: 8 },
    { id: "einvoices", label: "Hóa Đơn Điện Tử (TT78)", category: "finance", description: "Phát hành HĐĐT kết nối Tổng Cục Thuế, đồng bộ XML đầu vào", orderIndex: 9 },
    { id: "contracts", label: "Hợp Đồng Lao Động Online", category: "management", description: "Soạn thảo hợp đồng lao động điện tử và ký số nhân sự", orderIndex: 10 },
    { id: "orders", label: "Quản Lý Đơn Hàng & Vận Chuyển", category: "core", description: "Theo dõi đơn hàng đa kênh, trạng thái giao vận và đổi trả RMA", orderIndex: 11 },
    { id: "hr", label: "Chấm Công & HR & Lương", category: "management", description: "Hồ sơ nhân viên, chấm công ca, đánh giá KPI và tính hoa hồng doanh số", orderIndex: 12 },
    { id: "ai", label: "Dashboard AI Phân Tích", category: "management", description: "Trợ lý AI phân tích doanh số bán hàng, dự báo tồn kho và cảnh báo gian lận", orderIndex: 13 },
    { id: "customers", label: "Khách Hàng & CRM", category: "core", description: "Quản lý thông tin khách hàng, tích điểm thưởng, phân hạng thành viên", orderIndex: 14 },
    { id: "promotions", label: "Khuyến Mãi & Voucher", category: "operation", description: "Thiết lập chương trình khuyến mãi, mã giảm giá và voucher quà tặng", orderIndex: 15 },
    { id: "analytics", label: "Báo Cáo & Doanh Thu", category: "finance", description: "Báo cáo trực quan doanh thu, lợi nhuận, biểu đồ dòng tiền và top bán chạy", orderIndex: 16 },
    { id: "accounts", label: "Quản Lý Tài Khoản & RBAC", category: "system", description: "Quản lý tài khoản người dùng, đổi mật khẩu và tùy biến ma trận phân quyền", orderIndex: 17 },
    { id: "masterdata", label: "Dữ Liệu Cơ Bản & MDM", category: "system", description: "Quản lý danh mục gốc: Khách hàng, NCC, ĐVT quy đổi, Phòng ban, Chức vụ, Vị trí ô kệ, Nhóm hàng & VAT", orderIndex: 18 },
    { id: "settings", label: "Cài Đặt & Cấu Hình", category: "system", description: "Cấu hình thông tin cửa hàng, máy in, kết nối cơ sở dữ liệu SQL Server", orderIndex: 19 },
  ];

  for (const m of INITIAL_MODULES_SEED) {
    const exists = await prisma.systemModule.findMany({ where: { id: m.id } });
    if (exists.length === 0) {
      const dt = new Date();
      await prisma.$executeRaw`
        INSERT INTO [DanhMucPhanHe] (id, label, category, description, orderIndex, createdAt, updatedAt)
        VALUES (${m.id}, ${m.label}, ${m.category}, ${m.description}, ${m.orderIndex}, ${dt}, ${dt})
      `;
    }
  }

  console.log("🎉 SEED THÀNH CÔNG: Toàn bộ 26 danh mục dữ liệu mẫu & Phân quyền RBAC đã được nạp vĩnh viễn vào SQL Server!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi nạp dữ liệu seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
