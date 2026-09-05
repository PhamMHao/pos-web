import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Customer Economic Contracts into SQL Server via raw SQL...");

  // Contract 1: HĐKT-2026/GP-0001 (FPT Lab AI, Active, Level 3)
  const c1Id = "contract-2026-0001";
  const existing1: any[] = await prisma.$queryRaw`
    SELECT id FROM [HopDongKinhTe] WHERE contractNumber = 'HĐKT-2026/GP-0001'
  `;

  if (existing1.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO [HopDongKinhTe] (
        id, contractNumber, title, contractType, customerName, customerTaxCode,
        customerRepresentative, customerPosition, customerAddress, customerPhone, customerEmail,
        customerBankName, customerBankAccount, companyRepresentative, companyPosition,
        projectCode, totalAmount, discountPercent, taxRate, taxAmount, finalTotal,
        depositAmount, paidAmount, remainingAmount, signedDate, effectiveDate, expiryDate,
        warrantyMonths, termsAndConditions, status, approvalLevel, approvalStatus,
        digitalSignatureA, digitalSignatureB, signatureBDetails, notes, createdAt, updatedAt
      ) VALUES (
        ${c1Id}, 'HĐKT-2026/GP-0001', N'Hợp đồng triển khai lắp đặt hệ thống phòng Lab AI & Server',
        'turnkey_project', N'Đại Học FPT TP.HCM', '0301234567',
        N'TS. Nguyễn Văn Hùng', N'Phó Hiệu Trưởng', N'Khu Công Nghệ Cao, TP. Thủ Đức, TP.HCM',
        '0912 345 678', 'contact@fpt.edu.vn', N'Vietcombank CN Tân Định', '0071000123456',
        N'Phạm Ngọc Thơm', N'Tổng Giám Đốc', 'DA-2026-FPT',
        350000000, 0, 10, 35000000, 385000000,
        115500000, 308000000, 77000000, '2026-02-15', '2026-02-16', '2026-12-31',
        24, N'Bảo hành chính hãng 24 tháng tận nơi trong vòng 4 giờ. Thanh toán 3 đợt.',
        'active', 3, 'approved',
        N'TS. Nguyễn Văn Hùng (Ký số cơ quan)', N'Phạm Ngọc Thơm (Tổng Giám Đốc)',
        N'{"provider":"viettel_smartca","serial":"5401:0000:GP01:2026:CA99","tsa":"TSA RFC 3161 Certified","sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","method":"FaceID / SmartCA"}',
        N'Hợp đồng trọng điểm Q1/2026, triển khai song song cùng dự án DA-2026-FPT.',
        GETDATE(), GETDATE()
      )
    `;

    // Items for Contract 1
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c1-1', ${c1Id}, 'SRV-AI-4090', N'Máy Trạm Đồ Họa AI Workstation RTX 4090 24GB', N'Bộ', 4, 65000000, 0, 260000000)
    `;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c1-2', ${c1Id}, 'RACK-42U', N'Tủ Rack Server 42U Sâu 1000mm Cửa Lưới', N'Cái', 2, 15000000, 0, 30000000)
    `;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c1-3', ${c1Id}, 'SW-CISCO-10G', N'Switch Cisco Catalyst 24 Port 10G SFP+', N'Cái', 2, 22000000, 0, 44000000)
    `;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c1-4', ${c1Id}, 'CAB-CAT6A', N'Thùng Cáp Mạng Cat6A UTP Commscope 305m', N'Thùng', 4, 4000000, 0, 16000000)
    `;

    // Milestones for Contract 1
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, dueDate, status, paidAmount, paidDate, invoiceCode)
      VALUES ('ms-c1-1', ${c1Id}, 1, N'Đợt 1: Tạm ứng 30% sau ký kết', 30, 115500000, '2026-02-20', 'paid', 115500000, '2026-02-18', 'UNC-2026-001')
    `;
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, dueDate, status, paidAmount, paidDate, invoiceCode)
      VALUES ('ms-c1-2', ${c1Id}, 2, N'Đợt 2: Giao hàng máy trạm & lắp đặt 50%', 50, 192500000, '2026-03-10', 'paid', 192500000, '2026-03-08', 'UNC-2026-008')
    `;
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, dueDate, status, paidAmount)
      VALUES ('ms-c1-3', ${c1Id}, 3, N'Đợt 3: Nghiệm thu hoàn thành & Thanh lý 20%', 20, 77000000, '2026-03-30', 'pending', 0)
    `;

    // Handover for Contract 1
    await prisma.$executeRaw`
      INSERT INTO [PhieuBanGiaoHopDong] (id, handoverCode, contractId, handoverDate, handoverLocation, delivererName, receiverName, content, status, signatureDeliverer, signatureReceiver, createdAt)
      VALUES ('bg-c1-1', 'BG-HĐ-2026-0001', ${c1Id}, '2026-03-05', N'Phòng Lab AI, Lầu 3, Tòa Nhà Alpha, FPT', N'Đỗ Minh Khang (Kỹ thuật trưởng)', N'ThS. Lê Thành Đạt (Quản lý phòng Lab)', N'Bàn giao 04 bộ Workstation AI RTX 4090 nguyên seal, tem bảo hành chính hãng.', 'signed', N'Đỗ Minh Khang', N'Lê Thành Đạt', GETDATE())
    `;

    console.log("Seeded Contract 1 (FPT Lab AI)");
  }

  // Contract 2: HĐKT-2026/GP-0002 (ABC Tech, Completed & Liquidated)
  const c2Id = "contract-2026-0002";
  const existing2: any[] = await prisma.$queryRaw`
    SELECT id FROM [HopDongKinhTe] WHERE contractNumber = 'HĐKT-2026/GP-0002'
  `;

  if (existing2.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO [HopDongKinhTe] (
        id, contractNumber, title, contractType, customerName, customerTaxCode,
        customerRepresentative, customerPosition, customerAddress, customerPhone, customerEmail,
        companyRepresentative, companyPosition, totalAmount, discountPercent, taxRate, taxAmount, finalTotal,
        depositAmount, paidAmount, remainingAmount, signedDate, effectiveDate, expiryDate,
        warrantyMonths, termsAndConditions, status, approvalLevel, approvalStatus,
        digitalSignatureA, digitalSignatureB, handoverDate, liquidationDate, einvoiceCode, createdAt, updatedAt
      ) VALUES (
        ${c2Id}, 'HĐKT-2026/GP-0002', N'Hợp đồng mua bán thiết bị mạng và camera giám sát thông minh AI',
        'commercial_goods', N'Công ty Cổ phần Công nghệ ABC', '0312987654',
        N'Bà Trần Thị Bích Thủy', N'Giám Đốc Vận Hành', N'45 Lê Duẩn, Quận 1, TP.HCM', '0908 777 888', 'thuy.tran@abc-tech.com',
        N'Trần Quốc Bảo', N'Quản Lý Kinh Doanh', 45000000, 0, 10, 4500000, 49500000,
        49500000, 49500000, 0, '2026-01-10', '2026-01-10', '2026-06-30',
        12, N'Giao hàng và chuyển giao công nghệ trong 05 ngày làm việc.', 'completed', 1, 'approved',
        N'Trần Thị Bích Thủy', N'Trần Quốc Bảo', '2026-01-15', '2026-01-20', 'HD-2026-0089', GETDATE(), GETDATE()
      )
    `;

    // Items for Contract 2
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c2-1', ${c2Id}, 'CAM-AI-4K', N'Camera IP AI 4K Nhận Diện Khuôn Mặt Hikvision', N'Cái', 5, 5500000, 0, 27500000)
    `;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c2-2', ${c2Id}, 'NVR-16CH', N'Đầu Ghi Hình NVR 16 Kênh 4K H.265+', N'Bộ', 1, 9500000, 0, 9500000)
    `;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c2-3', ${c2Id}, 'HDD-8TB', N'Ổ Cứng Chuyên Dụng Camera WD Purple Pro 8TB', N'Cái', 1, 8000000, 0, 8000000)
    `;

    // Milestone for Contract 2
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, dueDate, status, paidAmount, paidDate, invoiceCode)
      VALUES ('ms-c2-1', ${c2Id}, 1, N'Thanh toán trọn gói 100%', 100, 49500000, '2026-01-15', 'paid', 49500000, '2026-01-15', 'UNC-2026-002')
    `;

    // Handover for Contract 2
    await prisma.$executeRaw`
      INSERT INTO [PhieuBanGiaoHopDong] (id, handoverCode, contractId, handoverDate, handoverLocation, delivererName, receiverName, content, status, createdAt)
      VALUES ('bg-c2-1', 'BG-HĐ-2026-0002', ${c2Id}, '2026-01-15', N'Văn phòng ABC Tech, 45 Lê Duẩn, Q.1', N'Lê Văn Tuấn', N'Trần Thị Bích Thủy', N'Bàn giao trọn bộ 5 camera 4K, 1 đầu ghi 16CH và ổ cứng 8TB.', 'signed', GETDATE())
    `;

    // Liquidation for Contract 2
    await prisma.$executeRaw`
      INSERT INTO [ThanhLyHopDongKinhTe] (id, liquidationCode, contractId, liquidationDate, originalAmount, actualAmount, paidAmount, penaltyOrAdjustment, finalPaymentAmount, warrantyCommitment, conclusion, status, signatureA, signatureB, createdAt)
      VALUES ('tl-c2-1', 'TL-HĐ-2026-0002', ${c2Id}, '2026-01-20', 49500000, 49500000, 49500000, 0, 0, N'Bảo hành 12 tháng.', N'Hai bên thanh lý toàn bộ nghĩa vụ tài chính.', 'completed', N'Trần Thị Bích Thủy', N'Phạm Ngọc Thơm', GETDATE())
    `;

    console.log("Seeded Contract 2 (ABC Tech)");
  }

  // Contract 3: HĐKT-2026/GP-0003 (Viettel, Internal Review, Level 2)
  const c3Id = "contract-2026-0003";
  const existing3: any[] = await prisma.$queryRaw`
    SELECT id FROM [HopDongKinhTe] WHERE contractNumber = 'HĐKT-2026/GP-0003'
  `;

  if (existing3.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO [HopDongKinhTe] (
        id, contractNumber, title, contractType, customerName, customerTaxCode,
        customerRepresentative, customerPosition, customerAddress, customerPhone, customerEmail,
        companyRepresentative, companyPosition, totalAmount, discountPercent, taxRate, taxAmount, finalTotal,
        depositAmount, paidAmount, remainingAmount, signedDate, effectiveDate, expiryDate,
        warrantyMonths, termsAndConditions, status, approvalLevel, approvalStatus, notes, createdAt, updatedAt
      ) VALUES (
        ${c3Id}, 'HĐKT-2026/GP-0003', N'Hợp đồng cung ứng linh kiện máy tính và dịch vụ bảo trì định kỳ 12 tháng',
        'maintenance_service', N'Tập Đoàn Công Nghiệp - Viễn Thông Quân Đội', '0100109106',
        N'Đại tá Nguyễn Minh Tâm', N'Chủ Nhiệm Kỹ Thuật', N'Số 1 Giang Văn Minh, Ba Đình, Hà Nội', '024 6255 6789', 'contact@viettel.com.vn',
        N'Phạm Ngọc Thơm', N'Tổng Giám Đốc', 120000000, 0, 10, 12000000, 132000000,
        39600000, 0, 132000000, NULL, NULL, '2027-02-28',
        12, N'Định kỳ bảo trì 03 tháng/lần, khắc phục sự cố khẩn cấp trong 2 giờ.',
        'internal_review', 2, 'pending', N'Đang chờ Giám đốc Kỹ thuật & Kế toán trưởng thẩm định ký duyệt Cấp 2.', GETDATE(), GETDATE()
      )
    `;

    // Items for Contract 3
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c3-1', ${c3Id}, 'SRV-MAINT-12M', N'Gói Dịch Vụ Bảo Trì Phòng Server 12 Tháng (24/7 SLA 2h)', N'Gói', 1, 72000000, 0, 72000000)
    `;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietHopDongKinhTe] (id, contractId, sku, productName, unit, quantity, unitPrice, discountPercent, total)
      VALUES ('item-c3-2', ${c3Id}, 'UPS-6KVA', N'Bộ Lưu Điện Online APC Smart-UPS 6kVA 230V', N'Bộ', 1, 48000000, 0, 48000000)
    `;

    // Milestones for Contract 3
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, status, paidAmount)
      VALUES ('ms-c3-1', ${c3Id}, 1, N'Tạm ứng đợt 1 (30%)', 30, 39600000, 'pending', 0)
    `;
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, status, paidAmount)
      VALUES ('ms-c3-2', ${c3Id}, 2, N'Nghiệm thu bảo trì quý 2 (40%)', 40, 52800000, 'pending', 0)
    `;
    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanHopDong] (id, contractId, milestoneOrder, milestoneName, percentage, plannedAmount, status, paidAmount)
      VALUES ('ms-c3-3', ${c3Id}, 3, N'Nghiệm thu tất toán hợp đồng (30%)', 30, 39600000, 'pending', 0)
    `;

    console.log("Seeded Contract 3 (Viettel)");
  }

  console.log("Successfully seeded Customer Economic Contracts into Microsoft SQL Server!");
}

main()
  .catch((e) => {
    console.error("Error seeding contracts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
