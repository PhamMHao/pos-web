import prisma from "../../config/db";
import { NotFoundError, BadRequestError } from "../../core/errors/AppError";

export class ProjectsService {
  /**
   * CÁC HÀM TƯƠNG THÁC NATIVE SQL SERVER 2008 - 2025
   * Tránh hoàn toàn lỗi OFFSET/OUTPUT INSERTED của Prisma query engine trên SQL Server 2008
   */
  static async insertProgressLog(data: {
    taskId: string;
    updatedBy: string;
    previousPercent: number;
    newPercent: number;
    statusChange?: string | null;
    workLogContent: string;
    issuesFaced?: string | null;
    attachments?: string | null;
  }) {
    const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const updatedBy = data.updatedBy || "Hệ thống";
    await prisma.$executeRaw`
      INSERT INTO [NhatKyTienDoCongViec] (id, taskId, updatedBy, previousPercent, newPercent, statusChange, workLogContent, issuesFaced, attachments, createdAt)
      VALUES (${id}, ${data.taskId}, ${updatedBy}, ${data.previousPercent}, ${data.newPercent}, ${data.statusChange || null}, ${data.workLogContent}, ${data.issuesFaced || null}, ${data.attachments || null}, ${dt})
    `;
    return { id, ...data, updatedBy, createdAt: dt.toISOString() };
  }

  static async insertTaskApproval(data: {
    taskId: string;
    approvalCode: string;
    level: number;
    levelName?: string | null;
    reviewerId?: string | null;
    reviewerName: string;
    reviewerRole: string;
    status: string;
    qualityRating?: number | null;
    reviewNotes?: string | null;
    punchList?: string | null;
    signatureData?: string | null;
    approvalMethod?: string | null;
    pinCodeVerified?: boolean | null;
    pkiCertificateSerial?: string | null;
    pkiSignatureHash?: string | null;
  }) {
    const id = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const pinVerified = data.pinCodeVerified ? 1 : 0;
    await prisma.$executeRaw`
      INSERT INTO [BienBanNghiemThuCongViec] (id, taskId, approvalCode, level, levelName, reviewerId, reviewerName, reviewerRole, status, qualityRating, reviewNotes, punchList, signatureData, approvalMethod, pinCodeVerified, pkiCertificateSerial, pkiSignatureHash, signedAt, createdAt, updatedAt)
      VALUES (${id}, ${data.taskId}, ${data.approvalCode}, ${data.level}, ${data.levelName || null}, ${data.reviewerId || null}, ${data.reviewerName}, ${data.reviewerRole}, ${data.status || "approved"}, ${data.qualityRating || 5}, ${data.reviewNotes || null}, ${data.punchList || null}, ${data.signatureData || null}, ${data.approvalMethod || "pin"}, ${pinVerified}, ${data.pkiCertificateSerial || null}, ${data.pkiSignatureHash || null}, ${dt}, ${dt}, ${dt})
    `;
    return {
      id,
      ...data,
      signedAt: dt.toISOString(),
      createdAt: dt.toISOString(),
      updatedAt: dt.toISOString(),
    };
  }

  static async insertProject(data: any) {
    const id = data.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    await prisma.$executeRaw`
      INSERT INTO [DuAnDoanhNghiep] (id, code, name, status, customerName, customerId, managerName, managerId, budget, startDate, endDate, sector, description, linkedDeviceCount, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.name}, ${data.status || "in_progress"}, ${data.customerName}, ${data.customerId || null}, ${data.managerName}, ${data.managerId || null}, ${data.budget || 0}, ${data.startDate || dt.toISOString().slice(0, 10)}, ${data.endDate || null}, ${data.sector || null}, ${data.description || null}, ${data.linkedDeviceCount || 0}, ${dt}, ${dt})
    `;
    return { id, ...data, createdAt: dt, updatedAt: dt };
  }

  static async insertProjectTask(data: any) {
    const id = data.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const dStart = data.startDate ? new Date(data.startDate) : dt;
    const dDue = data.dueDate ? new Date(data.dueDate) : new Date(dStart.getTime() + 7 * 86400000);
    await prisma.$executeRaw`
      INSERT INTO [CongViecDuAn] (id, code, projectId, parentTaskId, title, description, phase, priority, status, progressPercent, weightedSteps, reworkReason, reworkNotes, assignerId, assignerName, assigneeId, assigneeName, collaborators, departmentId, departmentName, startDate, dueDate, estimatedHours, actualHours, reminderSetting, isMilestone, isCriticalPath, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.projectId}, ${data.parentTaskId || null}, ${data.title}, ${data.description || null}, ${data.phase || "Khảo sát"}, ${data.priority || "normal"}, ${data.status || "todo"}, ${data.progressPercent || 0}, ${data.weightedSteps || null}, NULL, NULL, ${data.assignerId || null}, ${data.assignerName || null}, ${data.assigneeId || null}, ${data.assigneeName || null}, ${data.collaborators || null}, ${data.departmentId || null}, ${data.departmentName || null}, ${dStart}, ${dDue}, ${data.estimatedHours || 8}, 0, ${data.reminderSetting || "before_due_1d"}, 0, 0, ${dt}, ${dt})
    `;
    return { id, ...data, startDate: dStart, dueDate: dDue, createdAt: dt, updatedAt: dt };
  }

  static async insertMaterialTicket(data: any) {
    const id = data.id || `tk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const borrowDate = data.borrowDate ? new Date(data.borrowDate) : dt;
    const expectedReturnDate = data.expectedReturnDate ? new Date(data.expectedReturnDate) : new Date(borrowDate.getTime() + 14 * 86400000);
    await prisma.$executeRaw`
      INSERT INTO [PhieuVatTuCongTrinh] (id, code, projectId, taskId, ticketType, warehouseId, warehouseName, requesterName, requesterId, approverName, status, linkedOrderCode, totalItems, totalCost, totalAmount, borrowDate, expectedReturnDate, actualReturnDate, notes, createdAt, updatedAt)
      VALUES (${id}, ${data.code}, ${data.projectId}, ${data.taskId || null}, ${data.ticketType || "borrow"}, ${data.warehouseId || null}, ${data.warehouseName || "Kho Chính"}, ${data.requesterName}, ${data.requesterId || null}, ${data.approverName || null}, ${data.status || "in_use"}, ${data.linkedOrderCode || null}, ${data.totalItems || 0}, ${data.totalCost || 0}, ${data.totalAmount || 0}, ${borrowDate}, ${expectedReturnDate}, NULL, ${data.notes || null}, ${dt}, ${dt})
    `;
    return { id, ...data, borrowDate, expectedReturnDate, createdAt: dt, updatedAt: dt };
  }

  static async insertTicketItem(data: any) {
    const id = data.id || `tki-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const prodId = data.productId || data.sku || `prod-${Date.now()}`;
    await prisma.$executeRaw`
      INSERT INTO [ChiTietVatTuCongTrinh] (id, ticketId, productId, sku, name, unit, requestedQty, dispatchedQty, returnedQty, installedQty, costPrice, salePrice, serials)
      VALUES (${id}, ${data.ticketId}, ${prodId}, ${data.sku}, ${data.name}, ${data.unit || "Cái"}, ${data.requestedQty || 1}, ${data.dispatchedQty || 1}, 0, ${data.installedQty || 0}, ${data.costPrice || 0}, ${data.salePrice || 0}, ${data.serials || null})
    `;
    return { id, ...data };
  }

  static async insertTaskMaterialDemand(data: {
    id?: string;
    taskId: string;
    productId: string;
    productSku: string;
    productName: string;
    unit?: string;
    estimatedQuantity: number;
    actualUsedQuantity?: number;
    unitPrice: number;
    note?: string | null;
  }) {
    const id = data.id || `dem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const unit = data.unit || "Cái";
    const estQty = Number(data.estimatedQuantity) || 1;
    const actQty = Number(data.actualUsedQuantity) || 0;
    const price = Number(data.unitPrice) || 0;
    await prisma.$executeRaw`
      INSERT INTO [DinhMucVatTuCongViec] (id, taskId, productId, productSku, productName, unit, estimatedQuantity, actualUsedQuantity, unitPrice, note)
      VALUES (${id}, ${data.taskId}, ${data.productId}, ${data.productSku}, ${data.productName}, ${unit}, ${estQty}, ${actQty}, ${price}, ${data.note || null})
    `;
    return {
      id,
      taskId: data.taskId,
      productId: data.productId,
      productSku: data.productSku,
      productName: data.productName,
      unit,
      estimatedQuantity: estQty,
      actualUsedQuantity: actQty,
      unitPrice: price,
      note: data.note || null,
    };
  }

  static async insertInventoryLog(data: {
    productId: string;
    productName: string;
    sku: string;
    type: string;
    quantityChange: number;
    oldStock: number;
    newStock: number;
    reason: string;
    performedBy: string;
  }) {
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    await prisma.$executeRaw`
      INSERT INTO [NhatKyKho] (id, productId, productName, sku, type, quantityChange, oldStock, newStock, unitPrice, reason, performedBy, timestamp)
      VALUES (${id}, ${data.productId}, ${data.productName}, ${data.sku}, ${data.type}, ${data.quantityChange}, ${data.oldStock}, ${data.newStock}, NULL, ${data.reason}, ${data.performedBy}, ${dt})
    `;
    return { id, ...data, timestamp: dt };
  }

  /**
   * 1. DANH SÁCH DỰ ÁN KÈM TIẾN ĐỘ TỔNG THỂ & SỐ LƯỢNG TASK
   * Sử dụng truy vấn tương thích 100% MS SQL Server 2008 - 2025
   */
  static async getAllProjects() {
    const [projects, tasks, members, tickets] = await Promise.all([
      prisma.enterpriseProject.findMany({}),
      prisma.projectTask.findMany({}),
      prisma.projectMember.findMany({}),
      prisma.projectMaterialTicket.findMany({}),
    ]);

    projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const pMembers = members.filter((m) => m.projectId === p.id);
      const pTickets = tickets.filter((tk) => tk.projectId === p.id);

      const totalTasks = pTasks.length;
      const completedTasks = pTasks.filter((t) => t.status === "completed").length;
      const overallProgress =
        totalTasks > 0
          ? Math.round(
              pTasks.reduce((sum, t) => sum + (t.progressPercent || 0), 0) / totalTasks
            )
          : 0;

      return {
        ...p,
        members: pMembers,
        tasks: pTasks,
        materialTickets: pTickets,
        totalTasks,
        completedTasks,
        overallProgress,
      };
    });
  }

  static async getProjectById(id: string) {
    const projects = await prisma.enterpriseProject.findMany({
      where: { id },
    });
    const project = projects[0];
    if (!project) throw new NotFoundError("Không tìm thấy dự án");

    const [
      tasks,
      members,
      tickets,
      progressLogs,
      approvals,
      demands,
      ticketItems,
      budgetItems,
      actualExpenses,
      billingMilestones,
      handoverCertificates,
      dailySiteDiaries,
      variationOrders,
      stockReservations,
      dependencies,
    ] = await Promise.all([
      prisma.projectTask.findMany({ where: { projectId: id } }),
      prisma.projectMember.findMany({ where: { projectId: id } }),
      prisma.projectMaterialTicket.findMany({ where: { projectId: id } }),
      prisma.taskProgressLog.findMany({}),
      prisma.taskApproval.findMany({}),
      prisma.taskMaterialDemand.findMany({}),
      prisma.projectMaterialTicketItem.findMany({}),
      prisma.projectBudgetItem.findMany({ where: { projectId: id } }),
      prisma.projectActualExpense.findMany({ where: { projectId: id } }),
      prisma.projectBillingMilestone.findMany({ where: { projectId: id } }),
      prisma.projectHandoverCertificate.findMany({ where: { projectId: id } }),
      prisma.projectDailySiteDiary.findMany({ where: { projectId: id } }),
      prisma.projectVariationOrder.findMany({ where: { projectId: id } }),
      prisma.projectStockReservation.findMany({ where: { projectId: id } }),
      prisma.taskDependency.findMany({}),
    ]);

    const tasksWithDetails = tasks.map((t) => {
      const taskDeps = dependencies
        .filter((d) => d.taskId === t.id)
        .map((d) => {
          const parent = tasks.find((pt) => pt.id === d.dependsOnTaskId);
          return {
            ...d,
            dependsOnTask: parent
              ? {
                  id: parent.id,
                  code: parent.code,
                  title: parent.title,
                  status: parent.status,
                  progressPercent: parent.progressPercent,
                }
              : undefined,
          };
        });

      const depOnMe = dependencies.filter((d) => d.dependsOnTaskId === t.id);

      return {
        ...t,
        progressLogs: progressLogs.filter((l) => l.taskId === t.id),
        approvals: approvals.filter((a) => a.taskId === t.id),
        materialDemands: demands.filter((d) => d.taskId === t.id),
        dependencies: taskDeps,
        dependentTasks: depOnMe,
      };
    });

    const ticketsWithItems = tickets.map((tk) => ({
      ...tk,
      items: ticketItems.filter((it) => it.ticketId === tk.id),
    }));

    // Tính toán tiến độ & chi phí tổng thể
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const overallProgress =
      totalTasks > 0
        ? Math.round(tasks.reduce((sum, t) => sum + (t.progressPercent || 0), 0) / totalTasks)
        : 0;

    const totalBudgetCost =
      budgetItems.length > 0
        ? budgetItems.reduce((sum, b) => sum + Number(b.totalEstimatedCost || 0), 0)
        : Number(project.budget) || 0;

    const totalActualCost = actualExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // Tính toán EVM (Earned Value Management)
    const bac = totalBudgetCost;
    const ev = Math.round(bac * (overallProgress / 100));
    const ac = totalActualCost;
    const cv = ev - ac;

    // Planned Value (PV) theo thời gian
    let plannedRatio = 0.5;
    try {
      const dStart = new Date(project.startDate).getTime();
      const dEnd = project.endDate ? new Date(project.endDate).getTime() : dStart + 90 * 86400000;
      const now = Date.now();
      if (dEnd > dStart) {
        plannedRatio = Math.max(0, Math.min(1, (now - dStart) / (dEnd - dStart)));
      }
    } catch {
      plannedRatio = 0.5;
    }
    const pv = Math.round(bac * plannedRatio);
    const sv = ev - pv;
    const cpi = ac > 0 ? Number((ev / ac).toFixed(2)) : 1.0;
    const spi = pv > 0 ? Number((ev / pv).toFixed(2)) : 1.0;
    const eac = cpi > 0 ? Math.round(bac / cpi) : bac;

    let healthStatus: "good" | "warning" | "critical" = "good";
    if (cpi < 0.85 || spi < 0.85) {
      healthStatus = "critical";
    } else if (cpi < 0.95 || spi < 0.95) {
      healthStatus = "warning";
    }

    const totalRevenuePaidOrInvoiced = billingMilestones
      .filter((m) => m.status === "paid" || m.status === "invoiced")
      .reduce((sum, m) => sum + Number(m.paidAmount || m.actualInvoicedAmount || 0), 0);

    const grossMargin = totalRevenuePaidOrInvoiced - totalActualCost;

    // Gắn actualSpent cho từng budgetItem
    const budgetItemsWithSpent = budgetItems.map((b) => {
      const itemSpent = actualExpenses
        .filter((e) => e.budgetItemId === b.id)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return {
        ...b,
        actualSpent: itemSpent,
      };
    });

    return {
      ...project,
      members,
      tasks: tasksWithDetails,
      materialTickets: ticketsWithItems,
      budgetItems: budgetItemsWithSpent,
      actualExpenses,
      billingMilestones,
      handoverCertificates,
      dailySiteDiaries,
      variationOrders,
      stockReservations,
      totalTasks,
      completedTasks,
      overallProgress,
      totalBudgetCost,
      totalActualCost,
      grossMargin,
      evm: {
        pv,
        ev,
        ac,
        cv,
        sv,
        cpi,
        spi,
        eac,
        status: healthStatus,
      },
    };
  }

  static async createProject(data: any) {
    const id = data.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const code =
      data.code ||
      `DA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const created = await ProjectsService.insertProject({
      id,
      code,
      name: data.name,
      status: data.status || "in_progress",
      customerName: data.customerName,
      customerId: data.customerId || null,
      managerName: data.managerName,
      managerId: data.managerId || null,
      budget: data.budget ? Number(data.budget) : 0,
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      endDate: data.endDate || null,
      sector: data.sector || "Công Nghệ Thông Tin & Phần Mềm",
      description: data.description || null,
      linkedDeviceCount: data.linkedDeviceCount ? Number(data.linkedDeviceCount) : 0,
    });

    return created;
  }

  static async updateProject(id: string, data: any) {
    await prisma.enterpriseProject.updateMany({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        customerName: data.customerName,
        customerId: data.customerId,
        managerName: data.managerName,
        managerId: data.managerId,
        budget: data.budget !== undefined ? Number(data.budget) : undefined,
        startDate: data.startDate,
        endDate: data.endDate,
        sector: data.sector,
        description: data.description,
        linkedDeviceCount:
          data.linkedDeviceCount !== undefined
            ? Number(data.linkedDeviceCount)
            : undefined,
      },
    });
    const updatedList = await prisma.enterpriseProject.findMany({ where: { id } });
    return updatedList[0];
  }

  static async deleteProject(id: string) {
    return await prisma.enterpriseProject.deleteMany({
      where: { id },
    });
  }

  /**
   * 2. QUẢN LÝ CÔNG VIỆC (TASKS)
   */
  static async getTasks(projectId?: string) {
    const [tasks, projects, logs, approvals, demands, tickets, ticketItems] =
      await Promise.all([
        projectId
          ? prisma.projectTask.findMany({ where: { projectId } })
          : prisma.projectTask.findMany({}),
        prisma.enterpriseProject.findMany({}),
        prisma.taskProgressLog.findMany({}),
        prisma.taskApproval.findMany({}),
        prisma.taskMaterialDemand.findMany({}),
        prisma.projectMaterialTicket.findMany({}),
        prisma.projectMaterialTicketItem.findMany({}),
      ]);

    tasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return tasks.map((task) => {
      const proj = projects.find((p) => p.id === task.projectId);
      const taskLogs = logs.filter((l) => l.taskId === task.id);
      const taskApprovals = approvals.filter((a) => a.taskId === task.id);
      const taskDemands = demands.filter((d) => d.taskId === task.id);
      const taskTickets = tickets.filter((tk) => tk.taskId === task.id);

      return {
        ...task,
        project: proj
          ? { id: proj.id, code: proj.code, name: proj.name, customerName: proj.customerName }
          : undefined,
        progressLogs: taskLogs,
        approvals: taskApprovals,
        materialDemands: taskDemands,
        materialTickets: taskTickets.map((tk) => ({
          ...tk,
          items: ticketItems.filter((it) => it.ticketId === tk.id),
        })),
      };
    });
  }

  static async createTask(data: any) {
    const id = data.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const code =
      data.code ||
      `CV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const task = await ProjectsService.insertProjectTask({
      id,
      code,
      projectId: data.projectId,
      parentTaskId: data.parentTaskId || null,
      title: data.title,
      description: data.description || null,
      phase: data.phase || "Khảo sát",
      priority: data.priority || "normal",
      status: data.status || "todo",
      progressPercent: Number(data.progressPercent) || 0,
      weightedSteps: data.weightedSteps || null,
      assignerId: data.assignerId || null,
      assignerName: data.assignerName || null,
      assigneeId: data.assigneeId || null,
      assigneeName: data.assigneeName || null,
      collaborators: data.collaborators
        ? typeof data.collaborators === "string"
          ? data.collaborators
          : JSON.stringify(data.collaborators)
        : null,
      departmentId: data.departmentId || null,
      departmentName: data.departmentName || null,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : null,
      reminderSetting: data.reminderSetting || "before_due_1d",
    });

    if (Array.isArray(data.materialDemands) && data.materialDemands.length > 0) {
      for (const mat of data.materialDemands) {
        await ProjectsService.insertTaskMaterialDemand({
          taskId: task.id,
          productId: mat.productId,
          productSku: mat.productSku || mat.sku || "SKU-VT",
          productName: mat.productName || mat.name,
          unit: mat.unit || "Cái",
          estimatedQuantity: Number(mat.estimatedQuantity) || 1,
          unitPrice: Number(mat.unitPrice) || 0,
          note: mat.note || null,
        });
      }
    }

    return task;
  }

  static async updateTask(taskId: string, data: any) {
    const existingList = await prisma.projectTask.findMany({ where: { id: taskId } });
    const existing = existingList[0];
    if (!existing) throw new NotFoundError("Không tìm thấy công việc");

    const updateData: any = {
      title: data.title,
      description: data.description,
      phase: data.phase,
      priority: data.priority,
      status: data.status,
      progressPercent:
        data.progressPercent !== undefined ? Number(data.progressPercent) : undefined,
      weightedSteps: data.weightedSteps,
      assigneeId: data.assigneeId,
      assigneeName: data.assigneeName,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completedDate:
        data.status === "completed" && !existing.completedDate
          ? new Date()
          : data.completedDate
          ? new Date(data.completedDate)
          : undefined,
      actualHours:
        data.actualHours !== undefined ? Number(data.actualHours) : undefined,
      reminderSetting: data.reminderSetting,
    };

    if (data.collaborators) {
      updateData.collaborators =
        typeof data.collaborators === "string"
          ? data.collaborators
          : JSON.stringify(data.collaborators);
    }

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: updateData,
    });

    const updatedList = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updatedList[0];
  }

  static async deleteTask(taskId: string) {
    return await prisma.projectTask.deleteMany({
      where: { id: taskId },
    });
  }

  /**
   * 3. BÁO CÁO TIẾN ĐỘ & CẬP NHẬT BƯỚC TRỌNG SỐ (WEIGHTED STEPS)
   */
  static async updateTaskSteps(taskId: string, steps: any[], updatedBy?: string) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    const validSteps = Array.isArray(steps) ? steps : [];
    const calculatedPercent = validSteps.reduce(
      (sum, s) => sum + (s.isCompleted ? Number(s.weight) || 0 : 0),
      0
    );
    const newPercent = Math.min(100, Math.max(0, calculatedPercent));

    const nextStatus =
      newPercent === 100 && task.status === "in_progress"
        ? "review_pending"
        : task.status;

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        weightedSteps: JSON.stringify(validSteps),
        progressPercent: newPercent,
        status: nextStatus,
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy: updatedBy || task.assigneeName || "Kỹ thuật viên",
      previousPercent: task.progressPercent,
      newPercent,
      statusChange: nextStatus,
      workLogContent: `Cập nhật tiến độ theo trọng số từng bước: Hoàn thành ${validSteps.filter((s) => s.isCompleted).length}/${validSteps.length} bước (${newPercent}%).`,
    });

    const updatedList = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updatedList[0];
  }

  static async submitTaskForReview(taskId: string, updatedBy?: string) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    if (task.progressPercent < 100) {
      throw new BadRequestError("Công việc chưa đạt 100% tiến độ checklist! Kỹ thuật viên phải hoàn tất tất cả các bước thi công trước khi nộp nghiệm thu.");
    }

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        status: "review_pending",
        progressPercent: 100,
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy: updatedBy || task.assigneeName || "Kỹ thuật viên",
      previousPercent: task.progressPercent,
      newPercent: 100,
      statusChange: "review_pending",
      workLogContent: "Kỹ thuật viên hoàn thành 100% các hạng mục và nộp biên bản đề nghị KCS / QA-QC nghiệm thu chất lượng.",
    });

    const updatedList = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updatedList[0];
  }

  static async resubmitTaskAfterRework(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    if (!data.reworkNotes || !data.reworkNotes.trim()) {
      throw new BadRequestError("Bắt buộc phải nhập báo cáo giải trình khắc phục các lỗi trong Punch List trước khi nộp lại nghiệm thu!");
    }

    const reworkNotes = data.reworkNotes.trim();
    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        status: "resubmitted",
        reworkNotes,
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy: data.updatedBy || task.assigneeName || "Kỹ thuật viên",
      previousPercent: task.progressPercent,
      newPercent: task.progressPercent,
      statusChange: "resubmitted",
      workLogContent: `[NỘP LẠI NGHIỆM THU] Kỹ thuật viên đã khắc phục xong lỗi Punch List: ${reworkNotes}`,
    });

    const updatedList = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updatedList[0];
  }

  static async addProgressLog(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    const previousPercent = task.progressPercent;
    const newPercent =
      data.newPercent !== undefined ? Number(data.newPercent) : previousPercent;

    const log = await ProjectsService.insertProgressLog({
      taskId,
      updatedBy: data.updatedBy || "Kỹ thuật viên",
      previousPercent,
      newPercent,
      statusChange: data.statusChange || (newPercent === 100 ? "review_pending" : "in_progress"),
      workLogContent: data.workLogContent,
      issuesFaced: data.issuesFaced || null,
      attachments: data.attachments
        ? typeof data.attachments === "string"
          ? data.attachments
          : JSON.stringify(data.attachments)
        : null,
    });

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        progressPercent: newPercent,
        status:
          newPercent === 100 && task.status === "in_progress"
            ? "review_pending"
            : data.statusChange || task.status,
      },
    });

    return log;
  }

  static async acceptTask(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    if (task.status !== "assigned" && task.status !== "todo") {
      throw new BadRequestError(`Công việc đang ở trạng thái "${task.status}", không thể thực hiện thao tác nhận việc!`);
    }

    const acceptedBy = data.acceptedBy || task.assigneeName || "Kỹ thuật viên";
    const startDate = task.startDate || new Date();

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        status: "in_progress",
        startDate,
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy: acceptedBy,
      previousPercent: task.progressPercent,
      newPercent: task.progressPercent,
      statusChange: "in_progress",
      workLogContent: `[TIẾP NHẬN CÔNG VIỆC] Kỹ thuật viên ${acceptedBy} đã xác nhận nhận việc và bắt đầu triển khai thi công.`,
    });

    const updated = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updated[0];
  }

  static async reassignTask(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    if (data.userLevel && Number(data.userLevel) < 3) {
      throw new BadRequestError("Chỉ Quản lý dự án (Cấp 3) hoặc Ban Giám Đốc mới có thẩm quyền điều phối lại người phụ trách!");
    }

    const oldAssignee = task.assigneeName || "Chưa phân công";
    const newAssignee = data.assigneeName;
    const reason = data.reason || "Điều phối lại nguồn lực kỹ thuật";
    const updatedBy = data.updatedBy || "Quản lý dự án";

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        assigneeId: data.assigneeId || task.assigneeId,
        assigneeName: newAssignee,
        departmentName: data.departmentName || task.departmentName,
        status: "assigned",
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy,
      previousPercent: task.progressPercent,
      newPercent: task.progressPercent,
      statusChange: "assigned",
      workLogContent: `[CHUYỂN GIAO CÔNG VIỆC] Chuyển người phụ trách từ "${oldAssignee}" sang "${newAssignee}". Lý do: ${reason}`,
    });

    const updated = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updated[0];
  }

  static async blockTask(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    const reason = data.reason || "Vướng mặt bằng / thiếu vật tư";
    const updatedBy = data.updatedBy || task.assigneeName || "Kỹ thuật viên";

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        status: "blocked",
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy,
      previousPercent: task.progressPercent,
      newPercent: task.progressPercent,
      statusChange: "blocked",
      issuesFaced: reason,
      workLogContent: `[TẠM DỪNG THI CÔNG] Công việc bị tạm dừng do: ${reason}`,
    });

    const updated = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updated[0];
  }

  static async unblockTask(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    const notes = data.notes || "Đã giải quyết vướng mắc, khôi phục thi công";
    const updatedBy = data.updatedBy || task.assigneeName || "Kỹ thuật viên";

    await prisma.projectTask.updateMany({
      where: { id: taskId },
      data: {
        status: "in_progress",
      },
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy,
      previousPercent: task.progressPercent,
      newPercent: task.progressPercent,
      statusChange: "in_progress",
      workLogContent: `[TIẾP TỤC THI CÔNG] Đã giải quyết vướng mắc: ${notes}`,
    });

    const updated = await prisma.projectTask.findMany({ where: { id: taskId } });
    return updated[0];
  }

  static async addTaskMaterialDemand(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    return await ProjectsService.insertTaskMaterialDemand({
      id: data.id,
      taskId,
      productId: data.productId,
      productSku: data.productSku || data.sku || "SKU-VT",
      productName: data.productName || data.name,
      unit: data.unit || "Cái",
      estimatedQuantity: Number(data.estimatedQuantity) || 1,
      actualUsedQuantity: Number(data.actualUsedQuantity) || 0,
      unitPrice: Number(data.unitPrice) || 0,
      note: data.note || null,
    });
  }

  static async deleteTaskMaterialDemand(taskId: string, demandId: string) {
    return await prisma.taskMaterialDemand.deleteMany({
      where: { id: demandId, taskId },
    });
  }

  static async borrowMaterialsFromBom(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    const demands = await prisma.taskMaterialDemand.findMany({ where: { taskId } });
    if (!demands || demands.length === 0) {
      throw new BadRequestError("Công việc chưa có định mức vật tư (BOM) để lập phiếu mượn!");
    }

    const items = demands.map((d) => ({
      productId: d.productId,
      sku: d.productSku,
      name: d.productName,
      unit: d.unit,
      requestedQty: Number(d.estimatedQuantity),
      quantity: Number(d.estimatedQuantity),
      costPrice: Number(d.unitPrice),
      salePrice: Math.round(Number(d.unitPrice) * 1.25),
      installedQty: 0,
      returnedQty: 0,
    }));

    const ticket = await ProjectsService.createMaterialTicket({
      projectId: task.projectId,
      taskId: task.id,
      ticketType: "borrow",
      warehouseName: data.warehouseName || "Kho Chính",
      requesterName: data.requesterName || task.assigneeName || "Kỹ thuật viên",
      requesterId: data.requesterId || task.assigneeId,
      status: "in_use",
      notes: data.notes || `Xuất mượn vật tư theo định mức BOM cho công việc: ${task.title}`,
      items,
    });

    await ProjectsService.insertProgressLog({
      taskId,
      updatedBy: data.requesterName || task.assigneeName || "Kỹ thuật viên",
      previousPercent: task.progressPercent,
      newPercent: task.progressPercent,
      workLogContent: `[XUẤT MƯỢN VẬT TƯ] Đã lập phiếu mượn ${ticket.code} với ${demands.length} loại vật tư từ định mức BOM ra công trường.`,
    });

    return ticket;
  }

  /**
   * 4. NGHIỆM THU & KÝ DUYỆT PHÂN QUYỀN CẤP BẬC (HIERARCHICAL RBAC 4 CẤP)
   * Cấp 1: Kỹ thuật viên (Hạng 10) - Thi công & nộp nghiệm thu
   * Cấp 2: Giám sát KCS / QA-QC (Hạng 30) - Kiểm tra kỹ thuật, Duyệt hoặc Từ chối Rework
   * Cấp 3: Quản lý dự án / Chỉ huy trưởng (Hạng 60) - Duyệt kỹ thuật tổng thể (chỉ khi KCS duyệt)
   * Cấp 4: Giám đốc / Ban Lãnh Đạo (Hạng 100) - Nghiệm thu bàn giao & kích hoạt quyết toán
   */
  static async approveTask(taskId: string, data: any) {
    const tasks = await prisma.projectTask.findMany({ where: { id: taskId } });
    const task = tasks[0];
    if (!task) throw new NotFoundError("Không tìm thấy công việc");

    const level = Number(data.level) || 2; // 2: KCS | 3: PM | 4: Giám đốc
    if (level < 2) {
      throw new BadRequestError("Kỹ thuật viên (Cấp 1) không có thẩm quyền ký duyệt nghiệm thu chất lượng công việc!");
    }

    const isApproved = data.status === "approved" && !data.isRejected;
    const punchListString = Array.isArray(data.punchList)
      ? data.punchList.filter(Boolean).join("; ")
      : typeof data.punchList === "string"
      ? data.punchList.trim()
      : "";

    if (!isApproved && !punchListString) {
      throw new BadRequestError("Bắt buộc phải nhập Danh mục lỗi cần khắc phục (Punch List) khi từ chối nghiệm thu!");
    }

    // Lấy lịch sử phê duyệt trước đó của task
    const existingApprovals = await prisma.taskApproval.findMany({
      where: { taskId },
    });

    // KHÓA KÝ DUYỆT THÔNG MINH (SEQUENTIAL APPROVAL LOCK)
    if (level === 3 && isApproved) {
      const kcsApproved = existingApprovals.find(
        (a) => a.level === 2 && a.status === "approved"
      );
      if (!kcsApproved) {
        throw new BadRequestError(
          "🔒 KHÓA KÝ DUYỆT: Cấp 2 (Giám sát KCS / QA-QC) chưa ký duyệt đạt chuẩn! Chỉ huy trưởng chỉ được ký sau khi KCS hoàn tất."
        );
      }
    }

    if (level === 4 && isApproved) {
      const pmApproved = existingApprovals.find(
        (a) => a.level === 3 && a.status === "approved"
      );
      if (!pmApproved) {
        throw new BadRequestError(
          "🔒 KHÓA KÝ DUYỆT: Cấp 3 (Quản lý dự án / Chỉ huy trưởng) chưa ký duyệt đạt chuẩn! Ban Giám Đốc chỉ ký đóng dự án sau khi Chỉ huy trưởng duyệt."
        );
      }
    }

    // XÁC THỰC MÃ PIN BẢO MẬT (PIN VERIFICATION)
    const approvalMethod = data.approvalMethod || "pin";
    let pinCodeVerified = false;
    if (approvalMethod === "pin") {
      const pin = (data.pinCode || "").trim();
      if (pin !== "123456" && pin !== "666888" && pin !== "888888") {
        throw new BadRequestError("Mã PIN bảo mật không chính xác! (Mã PIN mặc định: 123456)");
      }
      pinCodeVerified = true;
    }

    // TẠO MÃ BĂM PKI-CA NẾU CHỌN KÝ SỐ ĐIỆN TỬ
    let pkiCertificateSerial = data.pkiCertificateSerial || null;
    let pkiSignatureHash = data.pkiSignatureHash || null;
    const reviewerName = data.reviewerName || data.personaName || "Người phê duyệt";
    const reviewerRole = data.reviewerRole || data.personaRole || (level === 2 ? "Giám sát KCS" : level === 3 ? "Chỉ huy trưởng" : "Ban Giám Đốc");
    const reviewNotes = data.reviewNotes || data.notes || null;

    if (approvalMethod === "pki_ca") {
      pkiCertificateSerial =
        pkiCertificateSerial ||
        `PKI-GP-CA-${level === 2 ? "KCS" : level === 3 ? "PM" : "DIR"}-${Date.now().toString().slice(-6)}`;
      const crypto = await import("crypto");
      pkiSignatureHash = crypto
        .createHash("sha256")
        .update(`${taskId}-${level}-${reviewerName}-${Date.now()}`)
        .digest("hex");
    }

    const approvalCode =
      data.approvalCode ||
      `NT-${new Date().getFullYear()}-${level === 2 ? "KCS" : level === 3 ? "PM" : "DIR"}-${Date.now().toString().slice(-4)}`;

    const levelName =
      level === 2
        ? "Cấp 2 - Giám sát KCS / QA-QC"
        : level === 3
        ? "Cấp 3 - Quản lý dự án / Chỉ huy trưởng"
        : "Cấp 4 - Giám đốc / Ban Lãnh Đạo";

    const approval = await ProjectsService.insertTaskApproval({
      taskId,
      approvalCode,
      level,
      levelName,
      reviewerId: data.reviewerId || null,
      reviewerName,
      reviewerRole,
      status: isApproved ? "approved" : "rejected",
      qualityRating: data.qualityRating ? Number(data.qualityRating) : 5,
      reviewNotes,
      punchList: punchListString || null,
      signatureData: data.signatureData || null,
      approvalMethod,
      pinCodeVerified,
      pkiCertificateSerial,
      pkiSignatureHash,
    });

    // LOGIC TRẠNG THÁI CÔNG VIỆC THEO KẾT QUẢ KÝ DUYỆT
    if (!isApproved) {
      // Từ chối nghiệm thu -> Yêu cầu sửa chữa (Rework Required)
      await prisma.projectTask.updateMany({
        where: { id: taskId },
        data: {
          status: "rework_required",
          reworkReason: punchListString || reviewNotes || "Không đạt tiêu chuẩn kiểm tra kỹ thuật.",
        },
      });

      await ProjectsService.insertProgressLog({
        taskId,
        updatedBy: reviewerName,
        previousPercent: task.progressPercent,
        newPercent: task.progressPercent,
        statusChange: "rework_required",
        workLogContent: `[TỪ CHỐI BỞI ${levelName}] Yêu cầu sửa chữa (Punch List): ${punchListString || reviewNotes}`,
      });
    } else {
      // Duyệt thành công
      if (level === 2) {
        // KCS duyệt xong
        await prisma.projectTask.updateMany({
          where: { id: taskId },
          data: {
            status: "review_pending", // Chờ tiếp cấp 3 Chỉ huy trưởng duyệt
            reworkReason: null,
          },
        });
      } else if (level === 3) {
        // Chỉ huy trưởng duyệt xong
        await prisma.projectTask.updateMany({
          where: { id: taskId },
          data: {
            status: "approved", // Đã duyệt kỹ thuật toàn diện, chờ Giám đốc nghiệm thu đóng
            reworkReason: null,
          },
        });
      } else if (level === 4) {
        // Giám đốc duyệt đóng công việc hoàn tất 100%
        await prisma.projectTask.updateMany({
          where: { id: taskId },
          data: {
            status: "completed",
            progressPercent: 100,
            completedDate: new Date(),
            reworkReason: null,
          },
        });
      }

      await ProjectsService.insertProgressLog({
        taskId,
        updatedBy: reviewerName,
        previousPercent: task.progressPercent,
        newPercent: level === 4 ? 100 : task.progressPercent,
        statusChange: level === 4 ? "completed" : level === 3 ? "approved" : "review_pending",
        workLogContent: `[KÝ DUYỆT THÀNH CÔNG] ${levelName} xác nhận đạt chuẩn chất lượng (${approvalMethod === "pin" ? "Mã PIN" : approvalMethod === "pki_ca" ? "PKI-CA Hash: " + pkiSignatureHash?.slice(0, 16) + "..." : "Chữ ký tay"}).`,
      });
    }

    return approval;
  }

  /**
   * 5. VẬT TƯ CÔNG TRÌNH (PHIẾU MƯỢN / TRẢ / QUYẾT TOÁN)
   */
  static async getMaterialTickets(projectId?: string) {
    const [tickets, ticketItems, projects, tasks] = await Promise.all([
      projectId
        ? prisma.projectMaterialTicket.findMany({ where: { projectId } })
        : prisma.projectMaterialTicket.findMany({}),
      prisma.projectMaterialTicketItem.findMany({}),
      prisma.enterpriseProject.findMany({}),
      prisma.projectTask.findMany({}),
    ]);

    tickets.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return tickets.map((tk) => {
      const proj = projects.find((p) => p.id === tk.projectId);
      const task = tasks.find((t) => t.id === tk.taskId);
      const items = ticketItems.filter((i) => i.ticketId === tk.id);

      return {
        ...tk,
        project: proj ? { id: proj.id, code: proj.code, name: proj.name, customerName: proj.customerName } : undefined,
        task: task ? { id: task.id, code: task.code, title: task.title } : undefined,
        items,
      };
    });
  }

  static async createMaterialTicket(data: any) {
    const id = data.id || `tk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const code =
      data.code ||
      `VT-DA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const totalCost = Array.isArray(data.items)
      ? data.items.reduce((s: number, it: any) => s + (Number(it.costPrice || 0) * Number(it.requestedQty || it.quantity || 1)), 0)
      : Number(data.totalCost) || 0;
    const totalAmount = Array.isArray(data.items)
      ? data.items.reduce((s: number, it: any) => s + (Number(it.salePrice || 0) * Number(it.requestedQty || it.quantity || 1)), 0)
      : Number(data.totalAmount) || 0;

    const ticket = await ProjectsService.insertMaterialTicket({
      id,
      code,
      projectId: data.projectId,
      taskId: data.taskId || null,
      ticketType: data.ticketType || "borrow",
      warehouseId: data.warehouseId || null,
      warehouseName: data.warehouseName || "Kho Chính",
      requesterName: data.requesterName,
      requesterId: data.requesterId || null,
      approverName: data.approverName || null,
      status: data.status || "in_use",
      totalItems: Array.isArray(data.items) ? data.items.length : 0,
      totalCost,
      totalAmount,
      borrowDate: data.borrowDate ? new Date(data.borrowDate) : new Date(),
      expectedReturnDate: data.expectedReturnDate
        ? new Date(data.expectedReturnDate)
        : null,
      notes: data.notes || null,
    });

    if (Array.isArray(data.items) && data.items.length > 0) {
      for (const it of data.items) {
        const serialsStr = it.serials
          ? typeof it.serials === "string"
            ? it.serials
            : JSON.stringify(it.serials)
          : null;

        await ProjectsService.insertTicketItem({
          ticketId: ticket.id,
          productId: it.productId,
          sku: it.sku,
          name: it.name,
          unit: it.unit || "Cái",
          requestedQty: Number(it.requestedQty || it.quantity) || 1,
          dispatchedQty: Number(it.dispatchedQty || it.quantity) || 1,
          returnedQty: 0,
          installedQty: Number(it.installedQty) || 0,
          costPrice: Number(it.costPrice) || 0,
          salePrice: Number(it.salePrice) || 0,
          serials: serialsStr,
        });
      }
    }

    // Nếu là phiếu mượn (borrow), trừ tồn kho khả dụng và ghi log kho
    if (data.ticketType === "borrow" && Array.isArray(data.items)) {
      for (const it of data.items) {
        const qty = Number(it.requestedQty || it.quantity) || 1;
        try {
          const prodList = await prisma.product.findMany({ where: { id: it.productId } });
          const currentProd = prodList[0];
          const oldStock = currentProd ? Number(currentProd.stock) : 0;
          const newStock = oldStock - qty;

          await prisma.product.updateMany({
            where: { id: it.productId },
            data: { stock: { decrement: qty } },
          });

          await ProjectsService.insertInventoryLog({
            productId: it.productId,
            productName: it.name,
            sku: it.sku,
            type: "export",
            quantityChange: -qty,
            oldStock,
            newStock,
            reason: `Xuất mượn thi công dự án: ${code}`,
            performedBy: data.requesterName || "Kỹ thuật viên",
          });
        } catch (err) {
          console.warn("Lỗi trừ kho khi mượn vật tư:", err);
        }
      }
    }

    const createdItems = await prisma.projectMaterialTicketItem.findMany({
      where: { ticketId: ticket.id },
    });

    return { ...ticket, items: createdItems };
  }

  /**
   * 6. HOÀN TRẢ VẬT TƯ THỪA VỀ KHO (RETURN)
   */
  static async returnMaterials(ticketId: string, data: any) {
    const tickets = await prisma.projectMaterialTicket.findMany({
      where: { id: ticketId },
    });
    const ticket = tickets[0];
    if (!ticket) throw new NotFoundError("Không tìm thấy phiếu vật tư");

    const items = await prisma.projectMaterialTicketItem.findMany({
      where: { ticketId },
    });

    const returnItems = data.items || [];
    for (const ret of returnItems) {
      const dbItem = items.find((i) => i.id === ret.itemId || i.productId === ret.productId);
      if (dbItem) {
        const returnQty = Number(ret.returnedQty) || 0;
        await prisma.projectMaterialTicketItem.updateMany({
          where: { id: dbItem.id },
          data: {
            returnedQty: { increment: returnQty },
            installedQty: dbItem.dispatchedQty.toNumber() - returnQty,
          },
        });

        if (returnQty > 0) {
          const prodList = await prisma.product.findMany({ where: { id: dbItem.productId } });
          const currentProd = prodList[0];
          const oldStock = currentProd ? Number(currentProd.stock) : 0;
          const newStock = oldStock + returnQty;

          await prisma.product.updateMany({
            where: { id: dbItem.productId },
            data: { stock: { increment: returnQty } },
          });

          await ProjectsService.insertInventoryLog({
            productId: dbItem.productId,
            productName: dbItem.name,
            sku: dbItem.sku,
            type: "import",
            quantityChange: returnQty,
            oldStock,
            newStock,
            reason: `Hoàn kho vật tư thi công thừa từ phiếu: ${ticket.code}`,
            performedBy: data.returneeName || "Kỹ thuật viên",
          });
        }
      }
    }

    await prisma.projectMaterialTicket.updateMany({
      where: { id: ticketId },
      data: {
        status: "returned",
        actualReturnDate: new Date(),
        notes: data.notes
          ? `${ticket.notes || ""}\n[Hoàn trả kho]: ${data.notes}`
          : ticket.notes,
      },
    });

    const updatedTickets = await prisma.projectMaterialTicket.findMany({
      where: { id: ticketId },
    });
    const updatedTicket = updatedTickets[0];

    const finalItems = await prisma.projectMaterialTicketItem.findMany({
      where: { ticketId },
    });

    return { ...updatedTicket, items: finalItems };
  }

  /**
   * 7. 1-CLICK QUYẾT TOÁN BÁN HÀNG POS TỪ VẬT TƯ ĐÃ LẮP ĐẶT
   */
  static async convertInstalledMaterialsToOrder(ticketId: string, data: any) {
    const tickets = await prisma.projectMaterialTicket.findMany({
      where: { id: ticketId },
    });
    const ticket = tickets[0];
    if (!ticket) throw new NotFoundError("Không tìm thấy phiếu vật tư");

    const [projectsList, items] = await Promise.all([
      prisma.enterpriseProject.findMany({ where: { id: ticket.projectId } }),
      prisma.projectMaterialTicketItem.findMany({ where: { ticketId } }),
    ]);
    const project = projectsList[0];

    if (ticket.taskId) {
      const taskList = await prisma.projectTask.findMany({ where: { id: ticket.taskId } });
      const linkedTask = taskList[0];
      if (
        linkedTask &&
        linkedTask.status !== "approved" &&
        linkedTask.status !== "completed" &&
        data.forceSettle !== true &&
        Number(data.userLevel || 1) < 4
      ) {
        throw new BadRequestError(
          `Công việc [${linkedTask.code} - ${linkedTask.title}] chưa hoàn tất nghiệm thu kỹ thuật (Trạng thái: ${linkedTask.status}). Chỉ Ban Giám Đốc (Cấp 4) mới có quyền quyết toán sớm.`
        );
      }
    }

    const orderCode =
      data.orderCode ||
      `DH-DA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const installedItems = items.filter(
      (it) =>
        it.installedQty.toNumber() > 0 ||
        it.dispatchedQty.toNumber() - it.returnedQty.toNumber() > 0
    );

    if (installedItems.length === 0) {
      throw new BadRequestError("Không có vật tư nào được ghi nhận đã lắp đặt để quyết toán");
    }

    let subtotal = 0;
    const orderItemsData = installedItems.map((it) => {
      const qty =
        it.installedQty.toNumber() > 0
          ? it.installedQty.toNumber()
          : it.dispatchedQty.toNumber() - it.returnedQty.toNumber();
      const price = it.salePrice.toNumber();
      const lineTotal = qty * price;
      subtotal += lineTotal;

      return {
        productId: it.productId,
        productName: it.name,
        sku: it.sku,
        unit: it.unit,
        quantity: qty,
        price,
        discount: 0,
        total: lineTotal,
      };
    });

    const customerName = data.customerName || project?.customerName || "Khách Hàng Dự Án";
    let validCustomerId: string | null = null;
    const targetCustomerId = data.customerId || project?.customerId;
    if (targetCustomerId) {
      const dbCust = await prisma.customer.findMany({ where: { id: targetCustomerId } });
      if (dbCust.length > 0) {
        validCustomerId = dbCust[0].id;
      }
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const orderNote = `Quyết toán vật tư thi công dự án [${project?.code || ""} - ${project?.name || ""}], Phiếu vật tư: ${ticket.code}`;

    await prisma.$executeRaw`
      INSERT INTO [HoaDon] (id, code, channel, status, customerId, customerName, customerPhone, subtotal, discountAmount, taxAmount, shippingFee, total, totalCost, profit, paymentMethod, paymentStatus, paidAmount, changeAmount, note, createdAt, completedAt)
      VALUES (${orderId}, ${orderCode}, N'Dự Án Công Trình', 'completed', ${validCustomerId}, ${customerName}, ${data.customerPhone || "0900000000"}, ${subtotal}, 0, 0, 0, ${subtotal}, 0, ${subtotal}, ${data.paymentMethod || "transfer"}, ${data.paymentStatus || "paid"}, ${subtotal}, 0, ${orderNote}, ${dt}, ${dt})
    `;

    for (const oi of orderItemsData) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietHoaDon] (id, orderId, productId, productName, sku, unit, ratioToBase, quantity, returnedQuantity, unitPrice, costPrice, discountPercent, total)
        VALUES (${itemId}, ${orderId}, ${oi.productId}, ${oi.productName}, ${oi.sku}, ${oi.unit}, 1, ${oi.quantity}, 0, ${oi.price}, 0, 0, ${oi.total})
      `;
    }

    for (const it of installedItems) {
      if (it.serials) {
        try {
          const serialList = JSON.parse(it.serials);
          if (Array.isArray(serialList)) {
            for (const sn of serialList) {
              const existingDev = await prisma.serialDeviceRecord.findMany({
                where: { serialNumber: sn },
              });
              if (existingDev.length === 0) {
                const serId = `ser-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                await prisma.$executeRaw`
                  INSERT INTO [SoSerialThietBi] (id, serialNumber, productId, productName, sku, status, warehouseName, soldOrderCode, soldDate, customerName, customerPhone, warrantyPeriodMonths)
                  VALUES (${serId}, ${sn}, ${it.productId}, ${it.name}, ${it.sku}, 'sold', ${ticket.warehouseName}, ${orderCode}, ${dt}, ${customerName}, ${data.customerPhone || null}, 24)
                `;
              } else {
                await prisma.serialDeviceRecord.updateMany({
                  where: { serialNumber: sn },
                  data: {
                    status: "sold",
                    soldOrderCode: orderCode,
                    customerName,
                    soldDate: new Date(),
                  },
                });
              }
            }
          }
        } catch (e) {
          console.warn("Lỗi kích hoạt serial khi quyết toán:", e);
        }
      }
    }

    await prisma.projectMaterialTicket.updateMany({
      where: { id: ticketId },
      data: {
        status: "converted_order",
        linkedOrderCode: orderCode,
      },
    });

    return {
      order: {
        id: orderId,
        code: orderCode,
        total: subtotal,
        totalAmount: subtotal,
        customerName,
        paymentStatus: data.paymentStatus || "paid",
      },
      ticketCode: ticket.code,
    };
  }

  /**
   * 8. SAO LƯU & XUẤT DỮ LIỆU DỰ ÁN (BACKUP / EXPORT)
   */
  static async exportAllProjectData() {
    const [projects, members, tasks, logs, approvals, demands, tickets, ticketItems] =
      await Promise.all([
        prisma.enterpriseProject.findMany({}),
        prisma.projectMember.findMany({}),
        prisma.projectTask.findMany({}),
        prisma.taskProgressLog.findMany({}),
        prisma.taskApproval.findMany({}),
        prisma.taskMaterialDemand.findMany({}),
        prisma.projectMaterialTicket.findMany({}),
        prisma.projectMaterialTicketItem.findMany({}),
      ]);

    const structuredProjects = projects.map((p) => {
      const pTasks = tasks
        .filter((t) => t.projectId === p.id)
        .map((t) => ({
          ...t,
          progressLogs: logs.filter((l) => l.taskId === t.id),
          approvals: approvals.filter((a) => a.taskId === t.id),
          materialDemands: demands.filter((d) => d.taskId === t.id),
        }));

      const pTickets = tickets
        .filter((tk) => tk.projectId === p.id)
        .map((tk) => ({
          ...tk,
          items: ticketItems.filter((it) => it.ticketId === tk.id),
        }));

      return {
        ...p,
        members: members.filter((m) => m.projectId === p.id),
        tasks: pTasks,
        materialTickets: pTickets,
      };
    });

    return {
      backupType: "GP_ERP_PROJECTS_BACKUP",
      version: "2.0.0-enterprise",
      exportedAt: new Date().toISOString(),
      totalProjects: projects.length,
      data: structuredProjects,
    };
  }

  /**
   * 9. PHỤC HỒI DỮ LIỆU TỪ BẢN SAO LƯU (RESTORE / IMPORT)
   */
  static async restoreProjectData(backupPayload: any) {
    if (!backupPayload || !Array.isArray(backupPayload.data)) {
      throw new BadRequestError("Tệp sao lưu không đúng định dạng dữ liệu dự án GP-ERP");
    }

    let restoredCount = 0;
    for (const proj of backupPayload.data) {
      await prisma.enterpriseProject.upsert({
        where: { code: proj.code },
        update: {
          name: proj.name,
          status: proj.status,
          customerName: proj.customerName,
          budget: Number(proj.budget) || 0,
          startDate: proj.startDate,
          endDate: proj.endDate,
          sector: proj.sector,
          description: proj.description,
        },
        create: {
          code: proj.code,
          name: proj.name,
          status: proj.status,
          customerName: proj.customerName,
          managerName: proj.managerName,
          budget: Number(proj.budget) || 0,
          startDate: proj.startDate,
          endDate: proj.endDate,
          sector: proj.sector,
          description: proj.description,
        },
      });
      restoredCount++;
    }

    return {
      success: true,
      restoredProjects: restoredCount,
      restoredAt: new Date().toISOString(),
    };
  }

  /**
   * 10. DỰ TOÁN CHI PHÍ (CBS) & CHI PHÍ THỰC TẾ (PHASE 3)
   */
  static async addBudgetItem(projectId: string, data: any) {
    const id = `cbs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const estQty = Number(data.estimatedQty) || 1;
    const rate = Number(data.unitRate) || 0;
    const totalEst = Number(data.totalEstimatedCost) || estQty * rate;

    await prisma.$executeRaw`
      INSERT INTO [DuAnDuToanChiPhi] (id, projectId, category, itemName, unit, estimatedQty, unitRate, totalEstimatedCost, notes, createdAt, updatedAt)
      VALUES (${id}, ${projectId}, ${data.category || "material"}, ${data.itemName}, ${data.unit || "Cái"}, ${estQty}, ${rate}, ${totalEst}, ${data.notes || null}, ${dt}, ${dt})
    `;
    return { id, projectId, ...data, estimatedQty: estQty, unitRate: rate, totalEstimatedCost: totalEst };
  }

  static async deleteBudgetItem(id: string) {
    await prisma.$executeRaw`DELETE FROM [DuAnDuToanChiPhi] WHERE id = ${id}`;
    return { success: true, id };
  }

  static async addActualExpense(projectId: string, data: any) {
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = data.spentDate ? new Date(data.spentDate) : new Date();
    const code = data.expenseCode || `CP-DA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const amt = Number(data.amount) || 0;

    await prisma.$executeRaw`
      INSERT INTO [DuAnChiPhiThucTe] (id, projectId, budgetItemId, expenseCode, category, amount, spentDate, payee, invoiceRef, description, recordedBy, createdAt)
      VALUES (${id}, ${projectId}, ${data.budgetItemId || null}, ${code}, ${data.category || "material"}, ${amt}, ${dt}, ${data.payee || "Người thụ hưởng"}, ${data.invoiceRef || null}, ${data.description || ""}, ${data.recordedBy || "Quản lý dự án"}, ${new Date()})
    `;
    return { id, projectId, expenseCode: code, amount: amt, ...data };
  }

  /**
   * 11. PHỤ THUỘC CÔNG VIỆC GANTT (PHASE 4)
   */
  static async addTaskDependency(taskId: string, dependsOnTaskId: string, type = "FS", lagDays = 0) {
    if (taskId === dependsOnTaskId) {
      throw new BadRequestError("Công việc không thể tự phụ thuộc vào chính mình");
    }
    const id = `dep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    await prisma.$executeRaw`
      INSERT INTO [PhuThuocCongViec] (id, taskId, dependsOnTaskId, type, lagDays, createdAt)
      VALUES (${id}, ${taskId}, ${dependsOnTaskId}, ${type}, ${lagDays}, ${dt})
    `;
    return { id, taskId, dependsOnTaskId, type, lagDays };
  }

  static async deleteTaskDependency(depId: string) {
    await prisma.$executeRaw`DELETE FROM [PhuThuocCongViec] WHERE id = ${depId}`;
    return { success: true, id: depId };
  }

  /**
   * 12. TẠO ĐƠN ĐẶT HÀNG MUA TỪ VẬT TƯ THIẾU CỦA DỰ ÁN (PHASE 5)
   */
  static async createPoFromDemands(projectId: string, data: any) {
    const projectList = await prisma.enterpriseProject.findMany({ where: { id: projectId } });
    const project = projectList[0];
    if (!project) throw new NotFoundError("Không tìm thấy dự án");

    const poId = `po-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const poCode = data.poCode || `PO-DA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const dt = new Date();
    const deliveryDate = data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : new Date(Date.now() + 7 * 86400000);

    const items = Array.isArray(data.items) ? data.items : [];
    let subtotal = 0;
    for (const it of items) {
      const q = Number(it.quantity) || 1;
      const p = Number(it.unitCost || it.costPrice) || 0;
      subtotal += q * p;
    }
    const vatRate = 10;
    const vatAmount = Math.round(subtotal * 0.1);
    const totalAmount = subtotal + vatAmount;

    await prisma.$executeRaw`
      INSERT INTO [DonDatHangMua] (id, code, supplierId, supplierName, supplierPhone, supplierAddress, supplierTaxCode, warehouseId, warehouseName, orderDate, expectedDeliveryDate, status, subtotal, vatRate, vatAmount, shippingFee, discountAmount, totalAmount, paidAmount, paymentStatus, paymentMethod, notes, projectId, projectCode, projectName, createdAt, updatedAt)
      VALUES (${poId}, ${poCode}, ${data.supplierId || "sup-01"}, ${data.supplierName || "Nhà Cung Cấp Phân Phối"}, ${data.supplierPhone || null}, ${data.supplierAddress || null}, ${data.supplierTaxCode || null}, ${data.warehouseId || "wh-main"}, ${data.warehouseName || "Kho Chính"}, ${dt}, ${deliveryDate}, 'confirmed', ${subtotal}, ${vatRate}, ${vatAmount}, 0, 0, ${totalAmount}, 0, 'unpaid', 'transfer', ${data.notes || `Đặt hàng phục vụ thi công dự án [${project.code} - ${project.name}]`}, ${project.id}, ${project.code}, ${project.name}, ${dt}, ${dt})
    `;

    for (const it of items) {
      const itemId = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const q = Number(it.quantity) || 1;
      const p = Number(it.unitCost || it.costPrice) || 0;
      await prisma.$executeRaw`
        INSERT INTO [ChiTietDonDatHangMua] (id, purchaseOrderId, productId, productName, sku, unit, quantity, receivedQuantity, unitCost, taxRate, totalAmount, notes)
        VALUES (${itemId}, ${poId}, ${it.productId || `prod-${Date.now()}`}, ${it.productName || it.name}, ${it.sku || "SKU-PO"}, ${it.unit || "Cái"}, ${q}, 0, ${p}, 10, ${q * p}, ${it.notes || null})
      `;

      // Giữ hàng kho dự án
      const resId = `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await prisma.$executeRaw`
        INSERT INTO [GiuHangKhoDuAn] (id, projectId, productId, sku, productName, reservedQty, status, notes, createdAt, updatedAt)
        VALUES (${resId}, ${project.id}, ${it.productId || itemId}, ${it.sku || "SKU-PO"}, ${it.productName || it.name}, ${q}, 'reserved', N'Đặt hàng PO giữ chỗ cho dự án', ${dt}, ${dt})
      `;
    }

    return {
      id: poId,
      code: poCode,
      projectId: project.id,
      totalAmount,
      totalItems: items.length,
    };
  }

  /**
   * 13. TIẾN ĐỘ THU TIỀN & BIÊN BẢN A-B (PHASE 6)
   */
  static async addBillingMilestone(projectId: string, data: any) {
    const id = `ms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = new Date();
    const dDue = data.dueDate ? new Date(data.dueDate) : null;
    const isRet = data.isRetention ? 1 : 0;
    const dRet = data.retentionReleaseDate ? new Date(data.retentionReleaseDate) : null;

    await prisma.$executeRaw`
      INSERT INTO [TienDoThanhToanDuAn] (id, projectId, milestoneCode, milestoneName, percentage, plannedAmount, actualInvoicedAmount, paidAmount, dueDate, status, isRetention, retentionReleaseDate, notes, createdAt, updatedAt)
      VALUES (${id}, ${projectId}, ${data.milestoneCode || "MS-NEW"}, ${data.milestoneName}, ${Number(data.percentage) || 0}, ${Number(data.plannedAmount) || 0}, ${Number(data.actualInvoicedAmount) || 0}, ${Number(data.paidAmount) || 0}, ${dDue}, ${data.status || "pending"}, ${isRet}, ${dRet}, ${data.notes || null}, ${dt}, ${dt})
    `;
    return { id, projectId, ...data };
  }

  static async updateBillingMilestone(id: string, data: any) {
    const dt = new Date();
    await prisma.$executeRaw`
      UPDATE [TienDoThanhToanDuAn]
      SET actualInvoicedAmount = ${Number(data.actualInvoicedAmount) || 0},
          paidAmount = ${Number(data.paidAmount) || 0},
          status = ${data.status || "paid"},
          updatedAt = ${dt}
      WHERE id = ${id}
    `;
    return { id, ...data };
  }

  static async addHandoverCertificate(projectId: string, data: any) {
    const id = `cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = data.handoverDate ? new Date(data.handoverDate) : new Date();
    const code = data.certificateCode || `BB-AB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    await prisma.$executeRaw`
      INSERT INTO [BienBanNghiemThuAB] (id, projectId, certificateCode, title, handoverDate, partyARepresentative, partyAPosition, partyBRepresentative, partyBPosition, content, acceptedValue, status, signatureA, signatureB, notes, createdAt)
      VALUES (${id}, ${projectId}, ${code}, ${data.title}, ${dt}, ${data.partyARepresentative}, ${data.partyAPosition || null}, ${data.partyBRepresentative}, ${data.partyBPosition || null}, ${data.content}, ${Number(data.acceptedValue) || 0}, ${data.status || "approved"}, ${data.signatureA || null}, ${data.signatureB || null}, ${data.notes || null}, ${new Date()})
    `;
    return { id, projectId, certificateCode: code, ...data };
  }

  /**
   * 14. NHẬT KÝ CÔNG TRƯỜNG & PHÁT SINH VO (PHASE 7)
   */
  static async addDailySiteDiary(projectId: string, data: any) {
    const id = `diary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dt = data.diaryDate ? new Date(data.diaryDate) : new Date();
    const photosStr = data.photos ? (typeof data.photos === "string" ? data.photos : JSON.stringify(data.photos)) : null;

    await prisma.$executeRaw`
      INSERT INTO [NhatKyCongTruong] (id, projectId, diaryDate, weather, temperature, workforceCount, machineryOnSite, tasksExecuted, issuesFaced, safetyHseStatus, photos, recordedBy, createdAt)
      VALUES (${id}, ${projectId}, ${dt}, ${data.weather || "Nắng ráo"}, ${data.temperature || "32°C"}, ${Number(data.workforceCount) || 1}, ${data.machineryOnSite || null}, ${data.tasksExecuted}, ${data.issuesFaced || null}, ${data.safetyHseStatus || "An toàn 100%"}, ${photosStr}, ${data.recordedBy || "Kỹ thuật trưởng"}, ${new Date()})
    `;
    return { id, projectId, ...data };
  }

  static async addVariationOrder(projectId: string, data: any) {
    const id = `vo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const code = data.voCode || `VO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const dt = new Date();
    const cost = Number(data.costAdjustment) || 0;
    const days = Number(data.timeAdjustmentDays) || 0;

    await prisma.$executeRaw`
      INSERT INTO [PhatSinhCongTrinhVO] (id, projectId, voCode, title, reason, requestedBy, costAdjustment, timeAdjustmentDays, status, approvedDate, approvedBy, createdAt, updatedAt)
      VALUES (${id}, ${projectId}, ${code}, ${data.title}, ${data.reason}, ${data.requestedBy || "Chủ đầu tư"}, ${cost}, ${days}, ${data.status || "submitted"}, NULL, NULL, ${dt}, ${dt})
    `;
    return { id, projectId, voCode: code, costAdjustment: cost, timeAdjustmentDays: days, ...data };
  }

  static async approveVariationOrder(voId: string, approvedBy = "Ban Giám Đốc") {
    const voList: any[] = await prisma.$queryRaw`SELECT * FROM [PhatSinhCongTrinhVO] WHERE id = ${voId}`;
    const vo = voList[0];
    if (!vo) throw new NotFoundError("Không tìm thấy phiếu phát sinh VO");

    const dt = new Date();
    await prisma.$executeRaw`
      UPDATE [PhatSinhCongTrinhVO]
      SET status = 'approved', approvedDate = ${dt}, approvedBy = ${approvedBy}, updatedAt = ${dt}
      WHERE id = ${voId}
    `;

    // Cập nhật ngân sách và ngày kết thúc của dự án
    if (vo.costAdjustment) {
      await prisma.$executeRaw`
        UPDATE [DuAnDoanhNghiep]
        SET budget = budget + ${Number(vo.costAdjustment)}
        WHERE id = ${vo.projectId}
      `;
    }

    return { ...vo, status: "approved", approvedBy, approvedDate: dt };
  }
}
