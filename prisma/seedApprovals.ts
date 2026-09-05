import { prisma } from '../server/config/db';
import { randomUUID } from 'crypto';

export async function seedApprovals() {
  console.log('🔄 Đang khởi tạo dữ liệu mẫu cho Quy Trình Phê Duyệt Tuần Tự...');

  // 1. Xóa sạch dữ liệu cũ
  await prisma.$executeRaw`DELETE FROM [NhatKyPheDuyet]`;
  await prisma.$executeRaw`DELETE FROM [ChiTietBuocPheDuyet]`;
  await prisma.$executeRaw`DELETE FROM [PhieuTrinhKyPheDuyet]`;
  await prisma.$executeRaw`DELETE FROM [CacBuocMauQuyTrinh]`;
  await prisma.$executeRaw`DELETE FROM [MauQuyTrinhPheDuyet]`;

  // 2. Định nghĩa 8 Mẫu Quy Trình Chuẩn
  const templatesData = [
    {
      id: randomUUID(),
      code: 'WF-PR',
      name: 'Quy Trình Duyệt Đề Xuất Mua Hàng & Vật Tư (PR)',
      moduleType: 'purchase_request',
      department: 'Phòng Hành Chính & Kỹ Thuật',
      description: 'Quy trình kiểm soát nhu cầu mua sắm thiết bị, linh kiện phục vụ hoạt động công ty và công trường',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Trưởng Bộ Phận Xác Nhận Nhu Cầu',
          requiredRole: 'manager',
          assignedUserName: 'Nguyễn Văn Quản Lý (Trưởng Phòng)',
          minAmount: 0,
          slaHours: 8,
          signMethod: 'pin',
          description: 'Kiểm tra tính cần thiết, số lượng tồn kho khả dụng và mục đích sử dụng',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Kế Toán Kiểm Soát Dự Toán & Ngân Sách',
          requiredRole: 'accountant',
          assignedUserName: 'Lê Thị Kế Toán (Kế Toán Ngân Sách)',
          minAmount: 0,
          slaHours: 12,
          signMethod: 'pin',
          description: 'Đối chiếu hạn mức ngân sách tháng của phòng ban và phê duyệt kế hoạch mua sắm',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-PO',
      name: 'Quy Trình Duyệt Đơn Mua Hàng Nhà Cung Cấp (PO)',
      moduleType: 'purchase_order',
      department: 'Phòng Mua Hàng & Cung Ứng',
      description: 'Kiểm soát đơn đặt hàng vật tư, đàm phán giá nhà cung cấp và điều khoản thanh toán',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Quản Lý Mua Hàng & Đàm Phán Báo Giá',
          requiredRole: 'warehouse',
          assignedUserName: 'Trần Văn Kho (Trưởng Bộ Phận Thu Mua)',
          minAmount: 0,
          slaHours: 8,
          signMethod: 'pin',
          description: 'So sánh bảng giá đối tác, thời gian giao hàng và chính sách bảo hành',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Kế Toán Trưởng Thẩm Định Ngân Sách',
          requiredRole: 'accountant',
          assignedUserName: 'Lê Thị Kế Toán (Kế Toán Trưởng)',
          minAmount: 0,
          slaHours: 12,
          signMethod: 'pin',
          description: 'Kiểm tra điều khoản công nợ gối đầu, dòng tiền và thuế GTGT đầu vào',
        },
        {
          stepOrder: 3,
          stepName: 'Bước 3: Ban Giám Đốc Phê Duyệt Phát Hành PO',
          requiredRole: 'admin',
          assignedUserName: 'Ban Giám Đốc (Tổng Giám Đốc)',
          minAmount: 20000000,
          slaHours: 24,
          signMethod: 'pki_ca',
          description: 'Ký duyệt phát hành chính thức Đơn đặt hàng PO gửi nhà cung ứng bằng Chữ ký số CA',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-GRN',
      name: 'Quy Trình Kiểm Định Chất Lượng & Nhập Kho (GRN)',
      moduleType: 'goods_receipt',
      department: 'Kho Vận & KCS Kiểm Định',
      description: 'Kiểm tra quy cách, tem nhãn Serial/IMEI, biên bản kiểm định chất lượng trước khi nhập kho',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: KCS / Kỹ Thuật Kiểm Định Chất Lượng',
          requiredRole: 'technician',
          assignedUserName: 'Phạm Kỹ Thuật (Chuyên Viên KCS)',
          minAmount: 0,
          slaHours: 6,
          signMethod: 'pin',
          description: 'Kiểm tra ngoại quan, test tính năng kỹ thuật, quét Serial thiết bị (Đạt/Không đạt)',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Thủ Kho Đối Soát & Nhập Kho Vật Lý',
          requiredRole: 'warehouse',
          assignedUserName: 'Trần Văn Kho (Thủ Kho Chính)',
          minAmount: 0,
          slaHours: 6,
          signMethod: 'pin',
          description: 'Kiểm đếm số lượng thực nhận so với phiếu giao hàng, xếp hàng vào vị trí ô kệ',
        },
        {
          stepOrder: 3,
          stepName: 'Bước 3: Kế Toán Kho Hạch Toán Tăng Tồn Kho',
          requiredRole: 'accountant',
          assignedUserName: 'Lê Thị Kế Toán (Kế Toán Kho)',
          minAmount: 0,
          slaHours: 12,
          signMethod: 'pin',
          description: 'Khớp hóa đơn đầu vào, ghi sổ kế toán kho và cập nhật giá vốn nhập kho',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-ISSUE',
      name: 'Quy Trình Duyệt Xuất Kho Vật Tư Thi Công & Giao Khách',
      moduleType: 'goods_issue',
      department: 'Phòng Quản Lý Kho Vận',
      description: 'Phê duyệt xuất kho vật tư phục vụ thi công dự án, lắp ráp hoặc bàn giao đại lý',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Quản Lý Thi Công / Kinh Doanh Duyệt Mục Đích',
          requiredRole: 'manager',
          assignedUserName: 'Nguyễn Văn Quản Lý (Giám Sát Dự Án)',
          minAmount: 0,
          slaHours: 4,
          signMethod: 'pin',
          description: 'Xác nhận đúng định mức công trình hoặc phiếu giao hàng đơn bán buôn',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Thủ Kho Kiểm Xuất & Bàn Giao Hàng Hóa',
          requiredRole: 'warehouse',
          assignedUserName: 'Trần Văn Kho (Thủ Kho)',
          minAmount: 0,
          slaHours: 4,
          signMethod: 'pin',
          description: 'Xuất hàng theo phiếu, quét mã Serial/IMEI thiết bị xuất kho và ký bàn giao',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-PROD',
      name: 'Quy Trình Duyệt Lệnh Sản Xuất / Gia Công Lắp Ráp (WO)',
      moduleType: 'work_order',
      department: 'Phân Xưởng Kỹ Thuật & Lắp Ráp',
      description: 'Quy trình giao việc gia công, lắp ráp máy bộ PC, cấu hình server tủ rack và nghiệm thu',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Quản Đốc Phân Xưởng Lập & Duyệt Kế Hoạch',
          requiredRole: 'technician',
          assignedUserName: 'Võ Phân Xưởng (Quản Đốc Xưởng)',
          minAmount: 0,
          slaHours: 8,
          signMethod: 'pin',
          description: 'Thẩm tra danh mục linh kiện BOM, nhân công lắp ráp và thời hạn hoàn tất',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: KCS Nghiệm Thu Thành Phẩm & Đóng Gói',
          requiredRole: 'manager',
          assignedUserName: 'Nguyễn Văn Quản Lý (Trưởng Bộ Phận Kỹ Thuật)',
          minAmount: 0,
          slaHours: 12,
          signMethod: 'pki_ca',
          description: 'Chạy benchmark kiểm tra nhiệt độ, độ ổn định và dán tem niêm phong xuất xưởng',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-DELIVERY',
      name: 'Quy Trình Phê Duyệt Giao Hàng & Bàn Giao Vận Chuyển',
      moduleType: 'delivery',
      department: 'Đội Vận Chuyển & Điều Phối',
      description: 'Lệnh điều xe vận tải, chuyển phát hàng hóa liên tỉnh và ký biên bản giao nhận (POD)',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Điều Phối Viên Lập Lệnh & Tuyến Giao Hàng',
          requiredRole: 'sales',
          assignedUserName: 'Hoàng Kinh Doanh (Điều Phối Giao Hàng)',
          minAmount: 0,
          slaHours: 4,
          signMethod: 'pin',
          description: 'Kiểm tra thông tin địa chỉ khách hàng, phân tuyến đường và chỉ định tài xế',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Khách Hàng / Đơn Vị Nhận Ký Bàn Giao (POD)',
          requiredRole: 'manager',
          assignedUserName: 'Đại Diện Khách Hàng / Chỉ Huy Trưởng',
          minAmount: 0,
          slaHours: 24,
          signMethod: 'drawing',
          description: 'Ký nhận thực tế đầy đủ nguyên đai nguyên kiện và giấy bảo hành đi kèm',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-ACC',
      name: 'Quy Trình Thẩm Tra Kế Toán & Đối Soát 3 Bên',
      moduleType: 'accounting_audit',
      department: 'Phòng Kế Toán & Tài Chính',
      description: 'Đối soát Three-Way Matching: Đơn mua hàng PO - Phiếu nhập kho GRN - Hóa đơn GTGT đầu vào',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Kế Toán Viên Đối Soát Hồ Sơ 3 Bên',
          requiredRole: 'accountant',
          assignedUserName: 'Lê Thị Kế Toán (Kế Toán Công Nợ)',
          minAmount: 0,
          slaHours: 8,
          signMethod: 'pin',
          description: 'Khớp đúng số lượng, đơn giá, mã số thuế và kiểm tra tính hợp lệ hóa đơn TT78',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Kế Toán Trưởng Ký Duyệt Quyết Toán Chi Phí',
          requiredRole: 'accountant',
          assignedUserName: 'Lê Thị Kế Toán (Kế Toán Trưởng)',
          minAmount: 0,
          slaHours: 12,
          signMethod: 'pki_ca',
          description: 'Ký duyệt số dư công nợ phải trả, định khoản tài khoản nợ/có và lên lịch thanh toán',
        },
      ],
    },
    {
      id: randomUUID(),
      code: 'WF-CASH',
      name: 'Quy Trình Phê Duyệt Đề Nghị Chi Tiền & Xuất Quỹ',
      moduleType: 'cash_settlement',
      department: 'Ban Tài Chính & Thủ Quỹ',
      description: 'Phê duyệt giải ngân tiền mặt, ủy nhiệm chi ngân hàng thanh toán cho đối tác hoặc tạm ứng',
      steps: [
        {
          stepOrder: 1,
          stepName: 'Bước 1: Kế Toán Thanh Toán Soát Xét Hồ Sơ Đề Nghị',
          requiredRole: 'accountant',
          assignedUserName: 'Lê Thị Kế Toán (Kế Toán Thanh Toán)',
          minAmount: 0,
          slaHours: 4,
          signMethod: 'pin',
          description: 'Kiểm tra phiếu đề nghị, hóa đơn chứng từ kèm theo và số dư tài khoản ngân hàng',
        },
        {
          stepOrder: 2,
          stepName: 'Bước 2: Ban Giám Đốc Phê Duyệt Chi Tiền',
          requiredRole: 'admin',
          assignedUserName: 'Ban Giám Đốc (Chủ Tài Khoản)',
          minAmount: 10000000,
          slaHours: 12,
          signMethod: 'pki_ca',
          description: 'Phê duyệt lệnh chuyển tiền ngân hàng / duyệt chi tiền mặt bằng Chữ ký số SmartCA',
        },
        {
          stepOrder: 3,
          stepName: 'Bước 3: Thủ Quỹ Giải Ngân & Xác Nhận Bút Toán',
          requiredRole: 'cashier',
          assignedUserName: 'Nguyễn Thị Thu Ngân (Thủ Quỹ)',
          minAmount: 0,
          slaHours: 4,
          signMethod: 'pin',
          description: 'Thực hiện chuyển khoản Internet Banking hoặc chi tiền mặt tại két, in phiếu chi có chữ ký',
        },
      ],
    },
  ];

  // Lưu từng mẫu vào DB bằng $executeRaw
  const tplIdMap: Record<string, string> = {};
  for (const t of templatesData) {
    tplIdMap[t.code] = t.id;
    await prisma.$executeRaw`
      INSERT INTO [MauQuyTrinhPheDuyet] (id, code, name, moduleType, department, description, isActive, createdAt, updatedAt)
      VALUES (${t.id}, ${t.code}, ${t.name}, ${t.moduleType}, ${t.department}, ${t.description}, 1, GETDATE(), GETDATE())
    `;

    for (const s of t.steps) {
      const stepId = randomUUID();
      await prisma.$executeRaw`
        INSERT INTO [CacBuocMauQuyTrinh] (id, templateId, stepOrder, stepName, requiredRole, assignedUserName, minAmount, maxAmount, slaHours, canDelegate, signMethod, description, createdAt, updatedAt)
        VALUES (${stepId}, ${t.id}, ${s.stepOrder}, ${s.stepName}, ${s.requiredRole}, ${s.assignedUserName}, ${s.minAmount}, NULL, ${s.slaHours}, 1, ${s.signMethod}, ${s.description}, GETDATE(), GETDATE())
      `;
    }
    console.log(`  + Đã tạo mẫu quy trình: ${t.name} (${t.code})`);
  }

  // 3. Khởi tạo 8 Phiếu Trình Ký Thực Tế vào DB
  console.log('🔄 Đang tạo các Phiếu Trình Ký Mẫu trên Database...');

  // Phiếu 1: PO-2026-0089 (Trình Ký Đơn Mua Hàng 145 triệu)
  // Bước 1: approved -> Bước 2: waiting -> Bước 3: locked
  const p1Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p1Id}, 'TK-2026-0001', ${tplIdMap['WF-PO']}, 'purchase_order', N'Tờ trình phê duyệt Đơn đặt hàng linh kiện Server DELL & Ram Kingston NCC Synnex FPT', NULL, 'PO-2026-0089', N'Phòng Mua Hàng & Cung Ứng', NULL, N'Trần Văn Kho', 145200000, 'high', 2, 3, 'in_progress', NULL, N'Đơn mua 10 cụm RAM ECC 64GB DDR5 và 4 ổ SSD Enterprise NVMe phục vụ dự án Viện Nghiên Cứu Y Dược. Đã đàm phán chiết khấu 8.5%.', NULL, DATEADD(hour, 48, GETDATE()), 0, NULL, DATEADD(hour, -18, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p1Id}, 1, N'Bước 1: Quản Lý Mua Hàng & Đàm Phán Báo Giá', 'warehouse', NULL, N'Trần Văn Kho (Trưởng Bộ Phận Thu Mua)', NULL, NULL, 'approved', 8, DATEADD(hour, -10, GETDATE()), 0, DATEADD(hour, -14, GETDATE()), N'Trần Văn Kho', 'approved', N'Đã đối chiếu 3 nhà phân phối FPT, DGW, Viettel. Giá FPT tốt nhất và sẵn kho giao trong 24h.', NULL, 'pin', 'PIN_AUTH_VERIFIED:984723', NULL, 'a8f9c1b3e2d7f8a9c0b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3', NULL, DATEADD(hour, -18, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p1Id}, 2, N'Bước 2: Kế Toán Trưởng Thẩm Định Ngân Sách', 'accountant', NULL, N'Lê Thị Kế Toán (Kế Toán Trưởng)', NULL, NULL, 'waiting', 12, DATEADD(hour, 6, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -18, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p1Id}, 3, N'Bước 3: Ban Giám Đốc Phê Duyệt Phát Hành PO', 'admin', NULL, N'Ban Giám Đốc (Tổng Giám Đốc)', NULL, NULL, 'locked', 24, DATEADD(hour, 30, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pki_ca', NULL, NULL, NULL, NULL, DATEADD(hour, -18, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
    VALUES (${randomUUID()}, ${p1Id}, 'create', NULL, N'Trần Văn Kho', 'warehouse', N'Khởi tạo tờ trình phê duyệt đơn hàng PO-2026-0089', '127.0.0.1', DATEADD(hour, -18, GETDATE())),
           (${randomUUID()}, ${p1Id}, 'approve', 1, N'Trần Văn Kho', 'warehouse', N'Phê duyệt Bước 1: Giá đàm phán hợp lý, mở khóa chuyển sang Kế Toán Trưởng', '127.0.0.1', DATEADD(hour, -14, GETDATE())),
           (${randomUUID()}, ${p1Id}, 'step_unlocked', 2, N'Hệ Thống Tự Động', 'system', N'Mở khóa Bước 2 cho Kế Toán Trưởng thẩm định ngân sách', '127.0.0.1', DATEADD(hour, -14, GETDATE()))
  `;

  // Phiếu 2: PR-2026-0120 (Đề Xuất Mua Sắm Vật Tư 18.5 triệu)
  // Bước 1: waiting -> Bước 2: locked
  const p2Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p2Id}, 'TK-2026-0002', ${tplIdMap['WF-PR']}, 'purchase_request', N'Đề xuất trang bị máy đo suy hao quang Fluke và kìm bấm mạng đa năng cho đội thi công 3', NULL, 'PR-2026-0120', N'Phòng Kỹ Thuật Công Trình', NULL, N'Phạm Kỹ Thuật', 18500000, 'normal', 1, 2, 'in_progress', NULL, N'Bộ thiết bị cũ đã xuống cấp sau 3 năm sử dụng, cần bổ sung để chuẩn bị thi công gói thầu cáp quang Tòa nhà Petrovietnam.', NULL, DATEADD(hour, 20, GETDATE()), 0, NULL, DATEADD(hour, -3, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p2Id}, 1, N'Bước 1: Trưởng Bộ Phận Xác Nhận Nhu Cầu', 'manager', NULL, N'Nguyễn Văn Quản Lý (Trưởng Phòng)', NULL, NULL, 'waiting', 8, DATEADD(hour, 5, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -3, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p2Id}, 2, N'Bước 2: Kế Toán Kiểm Soát Dự Toán & Ngân Sách', 'accountant', NULL, N'Lê Thị Kế Toán (Kế Toán Ngân Sách)', NULL, NULL, 'locked', 12, DATEADD(hour, 17, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -3, GETDATE()), GETDATE())
  `;

  // Phiếu 3: PNK-2026-0045 (Kiểm Định KCS & Nhập Kho 86.2 triệu - ĐÃ HOÀN TẤT VỚI SMARTCA)
  const p3Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p3Id}, 'TK-2026-0003', ${tplIdMap['WF-GRN']}, 'goods_receipt', N'Biên bản nghiệm thu kỹ thuật & Ký duyệt nhập kho lô 15 máy in Canon LBP2900 và linh kiện', NULL, 'PNK-2026-0045', N'Kho Vận & KCS Kiểm Định', NULL, N'Trần Văn Kho', 86200000, 'normal', 3, 3, 'approved', NULL, N'Đã hoàn tất kiểm định 100% Serial/IMEI, tem chính hãng Lê Bảo Minh, đầy đủ CO/CQ xuất xưởng.', NULL, DATEADD(hour, -4, GETDATE()), 0, DATEADD(hour, -4, GETDATE()), DATEADD(hour, -24, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p3Id}, 1, N'Bước 1: KCS / Kỹ Thuật Kiểm Định Chất Lượng', 'technician', NULL, N'Phạm Kỹ Thuật (Chuyên Viên KCS)', NULL, NULL, 'approved', 6, DATEADD(hour, -18, GETDATE()), 0, DATEADD(hour, -20, GETDATE()), N'Phạm Kỹ Thuật', 'approved', N'15/15 máy in test in thử sắc nét, không kẹt giấy, hộp mực nguyên seal.', NULL, 'pin', 'PIN_AUTH_VERIFIED:771920', NULL, NULL, NULL, DATEADD(hour, -24, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p3Id}, 2, N'Bước 2: Thủ Kho Đối Soát & Nhập Kho Vật Lý', 'warehouse', NULL, N'Trần Văn Kho (Thủ Kho Chính)', NULL, NULL, 'approved', 6, DATEADD(hour, -12, GETDATE()), 0, DATEADD(hour, -12, GETDATE()), N'Trần Văn Kho', 'approved', N'Đã xếp vào Kệ B2 Ô 04 Kho Chính, số lượng khớp 100% phiếu xuất NCC.', NULL, 'pin', 'PIN_AUTH_VERIFIED:338192', NULL, NULL, NULL, DATEADD(hour, -24, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p3Id}, 3, N'Bước 3: Kế Toán Kho Hạch Toán Tăng Tồn Kho', 'accountant', NULL, N'Lê Thị Kế Toán (Kế Toán Kho)', NULL, NULL, 'approved', 12, DATEADD(hour, -4, GETDATE()), 0, DATEADD(hour, -4, GETDATE()), N'Lê Thị Kế Toán', 'approved', N'Đã khớp hóa đơn điện tử GTGT số 0004519, ghi nhận nợ 156 / có 331.', NULL, 'pki_ca', 'SMARTCA_X509_CERT_LE_THI_KETOAN_SUCCESS', '5401:3819:2281:9914:B7A1', '7f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e', 'viettel_smartca', DATEADD(hour, -24, GETDATE()), GETDATE())
  `;

  // Phiếu 4: PC-2026-0032 (YÊU CẦU LÀM LẠI / REWORK)
  const p4Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p4Id}, 'TK-2026-0004', ${tplIdMap['WF-CASH']}, 'cash_settlement', N'Đề nghị chuyển khoản thanh toán đợt 2 gói thầu Camera an ninh Khu Đô Thị Sala', NULL, 'PC-2026-0032', N'Ban Tài Chính & Kế Toán', NULL, N'Lê Thị Kế Toán', 320000000, 'urgent', 2, 3, 'rework', NULL, N'Hợp đồng số 18/HĐKT-2026. Đã có biên bản nghiệm thu giai đoạn 2.', NULL, DATEADD(hour, 12, GETDATE()), 0, NULL, DATEADD(hour, -10, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p4Id}, 1, N'Bước 1: Kế Toán Thanh Toán Soát Xét Hồ Sơ Đề Nghị', 'accountant', NULL, N'Lê Thị Kế Toán (Kế Toán Thanh Toán)', NULL, NULL, 'approved', 4, DATEADD(hour, -6, GETDATE()), 0, DATEADD(hour, -8, GETDATE()), N'Lê Thị Kế Toán', 'approved', N'Hồ sơ đầy đủ phiếu đề xuất và bảng kê khối lượng thi công hoàn thành.', NULL, 'pin', 'PIN_AUTH_VERIFIED:448102', NULL, NULL, NULL, DATEADD(hour, -10, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p4Id}, 2, N'Bước 2: Ban Giám Đốc Phê Duyệt Chi Tiền', 'admin', NULL, N'Ban Giám Đốc (Chủ Tài Khoản)', NULL, NULL, 'rework', 12, DATEADD(hour, 2, GETDATE()), 0, DATEADD(hour, -2, GETDATE()), N'Ban Giám Đốc (Phạm Minh Hào)', 'rework', N'Tạm ngưng duyệt. Cần bổ sung thêm bản scan Giấy bảo lãnh bảo hành của ngân hàng (5% giá trị hợp đồng) theo đúng điều 6.2 hợp đồng gốc.', N'Bổ sung thư bảo lãnh ngân hàng trước 17h00 hôm nay.', 'pki_ca', NULL, NULL, NULL, NULL, DATEADD(hour, -10, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p4Id}, 3, N'Bước 3: Thủ Quỹ Giải Ngân & Xác Nhận Bút Toán', 'cashier', NULL, N'Nguyễn Thị Thu Ngân (Thủ Quỹ)', NULL, NULL, 'locked', 4, DATEADD(hour, 6, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -10, GETDATE()), GETDATE())
  `;

  // Phiếu 5: XK-2026-0078 (Xuất Kho Vật Tư 42 triệu)
  const p5Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p5Id}, 'TK-2026-0005', ${tplIdMap['WF-ISSUE']}, 'goods_issue', N'Phiếu trình duyệt xuất 20 cuộn cáp Cat6 AMP và 2 tủ rack 42U cho công trình Bệnh Viện Đa Khoa', NULL, 'XK-2026-0078', N'Phòng Quản Lý Kho Vận', NULL, N'Phạm Kỹ Thuật', 42000000, 'high', 2, 2, 'in_progress', NULL, N'Vật tư thi công trục cáp chính tầng 3 đến tầng 6, tiến độ gấp cần bàn giao trước ngày mai.', NULL, DATEADD(hour, 2, GETDATE()), 0, NULL, DATEADD(hour, -4, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p5Id}, 1, N'Bước 1: Quản Lý Thi Công / Kinh Doanh Duyệt Mục Đích', 'manager', NULL, N'Nguyễn Văn Quản Lý (Giám Sát)', NULL, NULL, 'approved', 4, DATEADD(hour, 0, GETDATE()), 0, DATEADD(hour, -3, GETDATE()), N'Nguyễn Văn Quản Lý', 'approved', N'Đúng khối lượng theo hồ sơ thiết kế thi công đã duyệt.', NULL, 'pin', 'PIN_AUTH_VERIFIED:663019', NULL, NULL, NULL, DATEADD(hour, -4, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p5Id}, 2, N'Bước 2: Thủ Kho Kiểm Xuất & Bàn Giao Hàng Hóa', 'warehouse', NULL, N'Trần Văn Kho (Thủ Kho)', NULL, NULL, 'waiting', 4, DATEADD(hour, 1, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -4, GETDATE()), GETDATE())
  `;

  // Phiếu 6: LSX-2026-0012 (Lệnh Sản Xuất 95 triệu)
  const p6Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p6Id}, 'TK-2026-0006', ${tplIdMap['WF-PROD']}, 'work_order', N'Lệnh sản xuất & ráp hoàn chỉnh 30 bộ máy tính đồ họa cấu hình RTX 4080 cho Trường Đại Học', NULL, 'LSX-2026-0012', N'Phân Xưởng Kỹ Thuật & Lắp Ráp', NULL, N'Võ Phân Xưởng', 95000000, 'normal', 1, 2, 'in_progress', NULL, N'Tiêu chuẩn kỹ thuật cao, yêu cầu đi dây thẩm mỹ và kiểm tra nhiệt độ 12 tiếng liên tục.', NULL, DATEADD(hour, 18, GETDATE()), 0, NULL, DATEADD(hour, -2, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p6Id}, 1, N'Bước 1: Quản Đốc Phân Xưởng Lập & Duyệt Kế Hoạch', 'technician', NULL, N'Võ Phân Xưởng (Quản Đốc Xưởng)', NULL, NULL, 'waiting', 8, DATEADD(hour, 6, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -2, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p6Id}, 2, N'Bước 2: KCS Nghiệm Thu Thành Phẩm & Đóng Gói', 'manager', NULL, N'Nguyễn Văn Quản Lý (Trưởng Bộ Phận Kỹ Thuật)', NULL, NULL, 'locked', 12, DATEADD(hour, 18, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pki_ca', NULL, NULL, NULL, NULL, DATEADD(hour, -2, GETDATE()), GETDATE())
  `;

  // Phiếu 7: VC-2026-0056 (Giao Hàng POD 12 triệu - ĐÃ HOÀN TẤT)
  const p7Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p7Id}, 'TK-2026-0007', ${tplIdMap['WF-DELIVERY']}, 'delivery', N'Lệnh điều phối xe tải 3.5 tấn vận chuyển thiết bị văn phòng chi nhánh Cần Thơ', NULL, 'VC-2026-0056', N'Đội Vận Chuyển & Điều Phối', NULL, N'Hoàng Kinh Doanh', 12000000, 'normal', 2, 2, 'approved', NULL, N'Đã giao tận nơi và có chữ ký xác nhận của đại diện chi nhánh Cần Thơ.', NULL, DATEADD(hour, -10, GETDATE()), 0, DATEADD(hour, -10, GETDATE()), DATEADD(hour, -30, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p7Id}, 1, N'Bước 1: Điều Phối Viên Lập Lệnh & Tuyến Giao Hàng', 'sales', NULL, N'Hoàng Kinh Doanh', NULL, NULL, 'approved', 4, DATEADD(hour, -26, GETDATE()), 0, DATEADD(hour, -24, GETDATE()), N'Hoàng Kinh Doanh', 'approved', N'Đã điều xe tải BKS 51C-889.21.', NULL, 'pin', 'PIN_AUTH_VERIFIED:102948', NULL, NULL, NULL, DATEADD(hour, -30, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p7Id}, 2, N'Bước 2: Khách Hàng / Đơn Vị Nhận Ký Bàn Giao (POD)', 'manager', NULL, N'Chi Nhánh Cần Thơ (Đại Diện Nhận Hàng)', NULL, NULL, 'approved', 24, DATEADD(hour, -6, GETDATE()), 0, DATEADD(hour, -10, GETDATE()), N'Trần Đại Diện', 'approved', N'Đã nhận đủ 10 thùng hàng, niêm phong nguyên vẹn.', NULL, 'drawing', 'SIGNATURE_DRAWING_BASE64_VERIFIED', NULL, NULL, NULL, DATEADD(hour, -30, GETDATE()), GETDATE())
  `;

  // Phiếu 8: KT-2026-0019 (Thẩm Tra Quyết Toán Kế Toán 235 triệu)
  const p8Id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO [PhieuTrinhKyPheDuyet] (id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode, departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber, totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue, completedAt, createdAt, updatedAt)
    VALUES (${p8Id}, 'TK-2026-0008', ${tplIdMap['WF-ACC']}, 'accounting_audit', N'Hồ sơ thẩm tra đối soát 3 bên và quyết toán chi phí mua sắm thiết bị mạng quý 3/2026', NULL, 'KT-2026-0019', N'Phòng Kế Toán & Tài Chính', NULL, N'Lê Thị Kế Toán', 235000000, 'high', 1, 2, 'in_progress', NULL, N'Đã khớp 8 hóa đơn điện tử tổng tiền 235.000.000 đ với 3 phiếu nhập kho tương ứng.', NULL, DATEADD(hour, 16, GETDATE()), 0, NULL, DATEADD(hour, -4, GETDATE()), GETDATE())
  `;

  await prisma.$executeRaw`
    INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName, delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt, actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData, pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt)
    VALUES (${randomUUID()}, ${p8Id}, 1, N'Bước 1: Kế Toán Viên Đối Soát Hồ Sơ 3 Bên', 'accountant', NULL, N'Lê Thị Kế Toán (Kế Toán Công Nợ)', NULL, NULL, 'waiting', 8, DATEADD(hour, 4, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pin', NULL, NULL, NULL, NULL, DATEADD(hour, -4, GETDATE()), GETDATE()),
           (${randomUUID()}, ${p8Id}, 2, N'Bước 2: Kế Toán Trưởng Ký Duyệt Quyết Toán Chi Phí', 'accountant', NULL, N'Lê Thị Kế Toán (Kế Toán Trưởng)', NULL, NULL, 'locked', 12, DATEADD(hour, 16, GETDATE()), 0, NULL, NULL, NULL, NULL, NULL, 'pki_ca', NULL, NULL, NULL, NULL, DATEADD(hour, -4, GETDATE()), GETDATE())
  `;

  console.log('✅ Nạp dữ liệu mẫu Quy Trình Phê Duyệt Tuần Tự thành công 100% vào Microsoft SQL Server!');
}

if (process.argv[1] && process.argv[1].includes('seedApprovals')) {
  seedApprovals()
    .catch((e) => {
      console.error('❌ Lỗi nạp seed data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
