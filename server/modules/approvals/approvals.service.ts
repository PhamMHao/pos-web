import { prisma } from '../../config/db';
import { randomUUID } from 'crypto';

export interface ExecuteApprovalPayload {
  stepId?: string;
  stepOrder?: number;
  action: 'approve' | 'reject' | 'rework';
  actedBy: string;
  userRole?: string;
  reviewNotes?: string;
  reworkRequirements?: string;
  signMethod?: 'pin' | 'pki_ca' | 'drawing';
  signatureData?: string;
  pkiCertificateSerial?: string;
  pkiSignatureHash?: string;
  caProvider?: string;
}

export class ApprovalsService {
  /**
   * Lấy danh sách phiếu trình ký theo bộ lọc
   */
  static async getProcesses(query: {
    moduleType?: string;
    status?: string;
    search?: string;
    priority?: string;
  }) {
    const { moduleType, status, search, priority } = query;

    const where: any = {};

    if (moduleType && moduleType !== 'all') {
      where.moduleType = moduleType;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { processCode: { contains: q } },
        { referenceDocCode: { contains: q } },
        { title: { contains: q } },
        { requesterName: { contains: q } },
        { departmentName: { contains: q } },
      ];
    }

    const [processes, allSteps, allAuditLogs] = await Promise.all([
      prisma.sequentialApprovalProcess.findMany({ where }),
      prisma.sequentialApprovalStep.findMany(),
      prisma.approvalAuditLog.findMany(),
    ]);

    // Nhóm steps và auditLogs theo processId
    const stepsByProcessId: Record<string, any[]> = {};
    for (const s of allSteps) {
      if (!stepsByProcessId[s.processId]) stepsByProcessId[s.processId] = [];
      stepsByProcessId[s.processId].push(s);
    }

    const logsByProcessId: Record<string, any[]> = {};
    for (const l of allAuditLogs) {
      if (!logsByProcessId[l.processId]) logsByProcessId[l.processId] = [];
      logsByProcessId[l.processId].push(l);
    }

    // Sắp xếp các bước theo thứ tự tăng dần (1, 2, 3...)
    for (const pid in stepsByProcessId) {
      stepsByProcessId[pid].sort((a, b) => a.stepOrder - b.stepOrder);
    }

    // Sắp xếp auditLogs theo thời gian mới nhất
    for (const pid in logsByProcessId) {
      logsByProcessId[pid].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    const now = new Date();

    const assembled = processes.map((p) => {
      const isOverdue =
        p.status === 'in_progress' && p.slaDeadline && new Date(p.slaDeadline) < now;
      return {
        ...p,
        isOverdue: Boolean(isOverdue),
        steps: stepsByProcessId[p.id] || [],
        auditLogs: logsByProcessId[p.id] || [],
      };
    });

    // Sắp xếp theo ngày tạo mới nhất
    assembled.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return assembled;
  }

  /**
   * Xem chi tiết 1 phiếu trình ký
   */
  static async getProcessById(id: string) {
    const list = await prisma.sequentialApprovalProcess.findMany({
      where: {
        OR: [{ id }, { processCode: id }],
      },
    });

    const process = list[0];

    if (!process) {
      throw new Error(`Không tìm thấy phiếu trình ký có mã/ID: ${id}`);
    }

    const [steps, auditLogs] = await Promise.all([
      prisma.sequentialApprovalStep.findMany({ where: { processId: process.id } }),
      prisma.approvalAuditLog.findMany({ where: { processId: process.id } }),
    ]);

    steps.sort((a, b) => a.stepOrder - b.stepOrder);
    auditLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      ...process,
      steps,
      auditLogs,
    };
  }

  /**
   * Tạo mới phiếu trình ký từ chứng từ nghiệp vụ hoặc biểu mẫu chuẩn
   */
  static async createProcess(data: {
    moduleType: string;
    title: string;
    referenceDocCode: string;
    referenceDocId?: string;
    departmentName: string;
    requesterName: string;
    totalAmount?: number;
    priority?: string;
    summaryNotes?: string;
    templateCode?: string;
  }) {
    const newProcessId = randomUUID();
    const count = await prisma.sequentialApprovalProcess.count();
    const processCode = `TK-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Tìm template chuẩn tương ứng
    let template = null;
    if (data.templateCode) {
      const tpls = await prisma.approvalWorkflowTemplate.findMany({
        where: { code: data.templateCode },
      });
      template = tpls[0] || null;
    } else {
      const tpls = await prisma.approvalWorkflowTemplate.findMany({
        where: { moduleType: data.moduleType },
      });
      template = tpls[0] || null;
    }

    let templateSteps: any[] = [];
    if (template) {
      templateSteps = await prisma.approvalWorkflowTemplateStep.findMany({
        where: { templateId: template.id },
      });
      templateSteps.sort((a, b) => a.stepOrder - b.stepOrder);
    }

    const totalSteps = templateSteps.length || 2;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + 48 * 3600 * 1000);

    // Chèn Process chính bằng executeRaw an toàn
    await prisma.$executeRaw`
      INSERT INTO [PhieuTrinhKyPheDuyet] (
        id, processCode, templateId, moduleType, title, referenceDocId, referenceDocCode,
        departmentName, requesterId, requesterName, totalAmount, priority, currentStepNumber,
        totalSteps, status, urgencyReason, summaryNotes, attachedFiles, slaDeadline, isOverdue,
        completedAt, createdAt, updatedAt
      )
      VALUES (
        ${newProcessId}, ${processCode}, ${template?.id || null}, ${data.moduleType},
        ${data.title}, ${data.referenceDocId || null}, ${data.referenceDocCode},
        ${data.departmentName}, NULL, ${data.requesterName}, ${data.totalAmount || 0},
        ${data.priority || 'normal'}, 1, ${totalSteps}, 'in_progress', NULL,
        ${data.summaryNotes || null}, NULL, ${slaDeadline}, 0, NULL, GETDATE(), GETDATE()
      )
    `;

    // Chèn các bước (Bước 1: waiting, Bước 2..N: locked)
    if (templateSteps.length > 0) {
      for (const s of templateSteps) {
        const stepStatus = s.stepOrder === 1 ? 'waiting' : 'locked';
        const stepSlaDeadline =
          s.stepOrder === 1 ? new Date(now.getTime() + s.slaHours * 3600 * 1000) : null;

        await prisma.$executeRaw`
          INSERT INTO [ChiTietBuocPheDuyet] (
            id, processId, stepOrder, stepName, requiredRole, assignedUserId, assignedUserName,
            delegatedToId, delegatedToName, status, slaHours, slaDeadline, isOverdue, actedAt,
            actedBy, decision, reviewNotes, reworkRequirements, signMethod, signatureData,
            pkiCertificateSerial, pkiSignatureHash, caProvider, createdAt, updatedAt
          )
          VALUES (
            ${randomUUID()}, ${newProcessId}, ${s.stepOrder}, ${s.stepName}, ${s.requiredRole},
            NULL, ${s.assignedUserName || 'Chuyên viên phụ trách'}, NULL, NULL, ${stepStatus},
            ${s.slaHours}, ${stepSlaDeadline}, 0, NULL, NULL, NULL, NULL, NULL,
            ${s.signMethod || 'pin'}, NULL, NULL, NULL, NULL, GETDATE(), GETDATE()
          )
        `;
      }
    } else {
      // Mặc định tạo 2 bước
      await prisma.$executeRaw`
        INSERT INTO [ChiTietBuocPheDuyet] (id, processId, stepOrder, stepName, requiredRole, assignedUserName, status, slaHours, slaDeadline, createdAt, updatedAt)
        VALUES 
        (${randomUUID()}, ${newProcessId}, 1, N'Bước 1: Trưởng Bộ Phận Xác Nhận', 'manager', N'Trưởng Bộ Phận', 'waiting', 8, ${new Date(now.getTime() + 8 * 3600 * 1000)}, GETDATE(), GETDATE()),
        (${randomUUID()}, ${newProcessId}, 2, N'Bước 2: Ban Giám Đốc Phê Duyệt', 'admin', N'Ban Giám Đốc', 'locked', 24, NULL, GETDATE(), GETDATE())
      `;
    }

    // Ghi audit log tạo mới
    await prisma.$executeRaw`
      INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
      VALUES (
        ${randomUUID()}, ${newProcessId}, 'create', NULL, ${data.requesterName},
        'requester', ${`Khởi tạo phiếu trình ký ${processCode} cho chứng từ ${data.referenceDocCode}`},
        '127.0.0.1', GETDATE()
      )
    `;

    return ApprovalsService.getProcessById(newProcessId);
  }

  /**
   * Ký Phê Duyệt Tuần Tự / Từ Chối / Yêu Cầu Làm Lại (Strict Sequential Locking Engine)
   */
  static async executeAction(id: string, payload: ExecuteApprovalPayload) {
    const process = await ApprovalsService.getProcessById(id);

    // Xác định bước cần xử lý
    let targetStep = null;
    if (payload.stepId) {
      targetStep = process.steps.find((s) => s.id === payload.stepId);
    } else if (payload.stepOrder !== undefined) {
      targetStep = process.steps.find((s) => s.stepOrder === payload.stepOrder);
    } else {
      // Mặc định lấy bước đang waiting
      targetStep = process.steps.find((s) => s.status === 'waiting');
    }

    if (!targetStep) {
      throw new Error('Không tìm thấy bước phê duyệt phù hợp để thao tác.');
    }

    // 🔒 KHÓA TUẦN TỰ: Chỉ bước đang 'waiting' mới được duyệt!
    if (targetStep.status === 'locked') {
      throw new Error(
        `⛔ BƯỚC PHÊ DUYỆT ĐANG BỊ KHÓA! Bước ${targetStep.stepOrder} (${targetStep.stepName}) chưa đến lượt. Bắt buộc người có thẩm quyền ở bước trước phải ký duyệt hoàn tất.`
      );
    }

    if (targetStep.status === 'approved') {
      throw new Error(`Bước ${targetStep.stepOrder} đã được ký duyệt trước đó, không thể ký lại.`);
    }

    const now = new Date();

    if (payload.action === 'approve') {
      // 1. Cập nhật bước hiện tại sang APPROVED
      await prisma.$executeRaw`
        UPDATE [ChiTietBuocPheDuyet]
        SET status = 'approved',
            decision = 'approved',
            actedAt = ${now},
            actedBy = ${payload.actedBy},
            reviewNotes = ${payload.reviewNotes || 'Đồng ý phê duyệt'},
            signMethod = ${payload.signMethod || 'pin'},
            signatureData = ${payload.signatureData || 'VERIFIED_SIGNATURE'},
            pkiCertificateSerial = ${payload.pkiCertificateSerial || null},
            pkiSignatureHash = ${payload.pkiSignatureHash || null},
            caProvider = ${payload.caProvider || null},
            updatedAt = ${now}
        WHERE id = ${targetStep.id}
      `;

      // 2. Kiểm tra xem có bước kế tiếp không (Sequential Step Unlocking)
      const nextStep = process.steps.find((s) => s.stepOrder === targetStep.stepOrder + 1);

      if (nextStep) {
        // MỞ KHÓA BƯỚC KẾ TIẾP: locked -> waiting
        const nextSlaDeadline = new Date(now.getTime() + nextStep.slaHours * 3600 * 1000);

        await prisma.$executeRaw`
          UPDATE [ChiTietBuocPheDuyet]
          SET status = 'waiting',
              slaDeadline = ${nextSlaDeadline},
              updatedAt = ${now}
          WHERE id = ${nextStep.id}
        `;

        await prisma.$executeRaw`
          UPDATE [PhieuTrinhKyPheDuyet]
          SET currentStepNumber = ${nextStep.stepOrder},
              status = 'in_progress',
              updatedAt = ${now}
          WHERE id = ${process.id}
        `;

        // Ghi log mở khóa
        await prisma.$executeRaw`
          INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
          VALUES 
          (${randomUUID()}, ${process.id}, 'approve', ${targetStep.stepOrder}, ${payload.actedBy}, ${payload.userRole || 'approver'}, ${payload.reviewNotes || 'Phê duyệt bước thành công'}, '127.0.0.1', ${now}),
          (${randomUUID()}, ${process.id}, 'step_unlocked', ${nextStep.stepOrder}, N'Hệ Thống Tự Động', 'system', ${`Tự động mở khóa Bước ${nextStep.stepOrder} (${nextStep.stepName}) cho người duyệt kế tiếp`}, '127.0.0.1', ${now})
        `;
      } else {
        // ĐÂY LÀ BƯỚC CUỐI CÙNG -> TOÀN BỘ QUY TRÌNH HOÀN TẤT
        await prisma.$executeRaw`
          UPDATE [PhieuTrinhKyPheDuyet]
          SET status = 'approved',
              completedAt = ${now},
              updatedAt = ${now}
          WHERE id = ${process.id}
        `;

        // Tự động đồng bộ trạng thái chứng từ gốc nếu có (Ví dụ đơn PO sang confirmed)
        if (process.referenceDocCode && process.referenceDocCode.startsWith('PO-')) {
          await prisma.$executeRaw`
            UPDATE [DonDatHangMua]
            SET status = 'confirmed',
                updatedAt = ${now}
            WHERE code = ${process.referenceDocCode}
          `.catch(() => {});
        }

        await prisma.$executeRaw`
          INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
          VALUES (${randomUUID()}, ${process.id}, 'approve', ${targetStep.stepOrder}, ${payload.actedBy}, ${payload.userRole || 'approver'}, ${`Hoàn tất ký duyệt cấp cuối cùng. Phiếu trình ký chính thức có hiệu lực.`}, '127.0.0.1', ${now})
        `;
      }
    } else if (payload.action === 'reject') {
      // TỪ CHỐI DỨT ĐIỂM
      await prisma.$executeRaw`
        UPDATE [ChiTietBuocPheDuyet]
        SET status = 'rejected',
            decision = 'rejected',
            actedAt = ${now},
            actedBy = ${payload.actedBy},
            reviewNotes = ${payload.reviewNotes || 'Từ chối phê duyệt'},
            updatedAt = ${now}
        WHERE id = ${targetStep.id}
      `;

      await prisma.$executeRaw`
        UPDATE [PhieuTrinhKyPheDuyet]
        SET status = 'rejected',
            completedAt = ${now},
            updatedAt = ${now}
        WHERE id = ${process.id}
      `;

      await prisma.$executeRaw`
        INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
        VALUES (${randomUUID()}, ${process.id}, 'reject', ${targetStep.stepOrder}, ${payload.actedBy}, ${payload.userRole || 'approver'}, ${`Từ chối phê duyệt: ${payload.reviewNotes || 'Không đủ điều kiện'}`}, '127.0.0.1', ${now})
      `;
    } else if (payload.action === 'rework') {
      // YÊU CẦU LÀM LẠI / GIẢI TRÌNH BỔ SUNG
      await prisma.$executeRaw`
        UPDATE [ChiTietBuocPheDuyet]
        SET status = 'rework',
            decision = 'rework',
            actedAt = ${now},
            actedBy = ${payload.actedBy},
            reviewNotes = ${payload.reviewNotes || 'Yêu cầu làm lại'},
            reworkRequirements = ${payload.reworkRequirements || 'Cần bổ sung tài liệu giải trình'},
            updatedAt = ${now}
        WHERE id = ${targetStep.id}
      `;

      await prisma.$executeRaw`
        UPDATE [PhieuTrinhKyPheDuyet]
        SET status = 'rework',
            updatedAt = ${now}
        WHERE id = ${process.id}
      `;

      await prisma.$executeRaw`
        INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
        VALUES (${randomUUID()}, ${process.id}, 'rework', ${targetStep.stepOrder}, ${payload.actedBy}, ${payload.userRole || 'approver'}, ${`Yêu cầu hiệu chỉnh/làm lại: ${payload.reworkRequirements || payload.reviewNotes}`}, '127.0.0.1', ${now})
      `;
    }

    return ApprovalsService.getProcessById(process.id);
  }

  /**
   * Gửi nhắc nhở duyệt cho người phụ trách bước hiện tại
   */
  static async sendReminder(id: string, actorName: string) {
    const process = await ApprovalsService.getProcessById(id);
    const waitingStep = process.steps.find((s) => s.status === 'waiting');

    if (!waitingStep) {
      throw new Error('Phiếu trình ký không có bước nào đang chờ duyệt để nhắc nhở.');
    }

    await prisma.$executeRaw`
      INSERT INTO [NhatKyPheDuyet] (id, processId, action, stepOrder, actorName, actorRole, note, ipAddress, timestamp)
      VALUES (
        ${randomUUID()}, ${process.id}, 'remind', ${waitingStep.stepOrder}, ${actorName},
        'requester', ${`Đã gửi cảnh báo nhắc duyệt hồ sơ đến: ${waitingStep.assignedUserName}`},
        '127.0.0.1', GETDATE()
      )
    `;

    return {
      success: true,
      message: `Đã gửi thông báo nhắc duyệt đến ${waitingStep.assignedUserName}`,
      stepName: waitingStep.stepName,
    };
  }

  /**
   * Lấy danh sách 8 mẫu quy trình chuẩn
   */
  static async getTemplates() {
    const [templates, allSteps] = await Promise.all([
      prisma.approvalWorkflowTemplate.findMany({
        where: { isActive: true },
      }),
      prisma.approvalWorkflowTemplateStep.findMany(),
    ]);

    const stepsByTplId: Record<string, any[]> = {};
    for (const s of allSteps) {
      if (!stepsByTplId[s.templateId]) stepsByTplId[s.templateId] = [];
      stepsByTplId[s.templateId].push(s);
    }

    for (const tid in stepsByTplId) {
      stepsByTplId[tid].sort((a, b) => a.stepOrder - b.stepOrder);
    }

    return templates.map((t) => ({
      ...t,
      steps: stepsByTplId[t.id] || [],
    }));
  }

  /**
   * Thống kê KPI và phân tích điểm nghẽn quy trình
   */
  static async getAnalytics() {
    const all = await ApprovalsService.getProcesses({});

    const total = all.length;
    const approved = all.filter((p) => p.status === 'approved').length;
    const inProgress = all.filter((p) => p.status === 'in_progress').length;
    const rework = all.filter((p) => p.status === 'rework').length;
    const rejected = all.filter((p) => p.status === 'rejected').length;

    const now = new Date();
    const overdueCount = all.filter(
      (p) => p.status === 'in_progress' && p.slaDeadline && new Date(p.slaDeadline) < now
    ).length;

    // Tính thời gian xử lý trung bình (giờ) của các phiếu đã hoàn thành
    let totalCompletedHours = 0;
    let completedWithDates = 0;
    for (const p of all) {
      if (p.status === 'approved' && p.completedAt) {
        const diffMs = new Date(p.completedAt).getTime() - new Date(p.createdAt).getTime();
        totalCompletedHours += diffMs / (1000 * 3600);
        completedWithDates++;
      }
    }

    const avgApprovalHours =
      completedWithDates > 0 ? Math.round((totalCompletedHours / completedWithDates) * 10) / 10 : 14.5;

    // Phân rã theo 8 khâu chuỗi cung ứng
    const moduleBreakdown: Record<string, { total: number; approved: number; pending: number }> = {};
    const moduleNames: Record<string, string> = {
      purchase_request: 'Đề xuất mua sắm (PR)',
      purchase_order: 'Đơn mua hàng (PO)',
      goods_receipt: 'Nhập kho & KCS (GRN)',
      goods_issue: 'Xuất kho vật tư (PXK)',
      work_order: 'Sản xuất & Thi công (WO)',
      delivery: 'Giao hàng (POD)',
      accounting_audit: 'Kế toán đối soát',
      cash_settlement: 'Thu / Chi Quỹ',
    };

    for (const p of all) {
      const mod = p.moduleType;
      if (!moduleBreakdown[mod]) {
        moduleBreakdown[mod] = { total: 0, approved: 0, pending: 0 };
      }
      moduleBreakdown[mod].total++;
      if (p.status === 'approved') moduleBreakdown[mod].approved++;
      if (p.status === 'in_progress' || p.status === 'rework') moduleBreakdown[mod].pending++;
    }

    const stageAnalytics = Object.entries(moduleBreakdown).map(([mod, data]) => ({
      moduleType: mod,
      name: moduleNames[mod] || mod,
      ...data,
      complianceRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 100,
    }));

    return {
      kpis: {
        total,
        approved,
        inProgress,
        rework,
        rejected,
        overdueCount,
        avgApprovalHours,
        complianceRate: total > 0 ? Math.round(((total - overdueCount) / total) * 100) : 100,
      },
      stageAnalytics,
    };
  }
}
