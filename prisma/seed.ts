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
} from "../src/data/initialData";
import { INITIAL_INBOUND_INVOICES } from "../src/data/mockInboundData";

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
  }

  // 3. Khách hàng (Customers)
  console.log(`3. Seeding ${INITIAL_CUSTOMERS.length} Customers...`);
  for (const c of INITIAL_CUSTOMERS) {
    const existing = await prisma.customer.findMany({ where: { phone: c.phone } });
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

  console.log("🎉 SEED THÀNH CÔNG: Toàn bộ 16 danh mục dữ liệu mẫu đã được nạp trơn tru vào SQL Server!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi nạp dữ liệu seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
