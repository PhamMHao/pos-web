import { Request, Response, NextFunction } from "express";
import { ProjectsService } from "./projects.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class ProjectsController {
  // 1. Projects
  static async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectsService.getAllProjects();
      return sendSuccess(res, projects, "Lấy danh sách dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await ProjectsService.getProjectById(id);
      return sendSuccess(res, project, "Lấy chi tiết dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await ProjectsService.createProject(req.body);
      return sendCreated(res, created, "Tạo dự án mới thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.updateProject(id, req.body);
      return sendSuccess(res, updated, "Cập nhật dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProjectsService.deleteProject(id);
      return sendSuccess(res, { id }, "Xóa dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 2. Tasks
  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;
      const tasks = await ProjectsService.getTasks(projectId as string);
      return sendSuccess(res, tasks, "Lấy danh sách công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await ProjectsService.createTask(req.body);
      return sendCreated(res, task, "Giao công việc mới thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.updateTask(id, req.body);
      return sendSuccess(res, updated, "Cập nhật công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProjectsService.deleteTask(id);
      return sendSuccess(res, { id }, "Xóa công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 3. Progress & Steps
  static async updateTaskSteps(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { steps, updatedBy } = req.body;
      const updated = await ProjectsService.updateTaskSteps(id, steps, updatedBy);
      return sendSuccess(res, updated, "Cập nhật tiến độ theo trọng số từng bước thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async submitTaskForReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { updatedBy } = req.body;
      const updated = await ProjectsService.submitTaskForReview(id, updatedBy);
      return sendSuccess(res, updated, "Đã nộp biên bản đề nghị KCS nghiệm thu thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async resubmitTaskAfterRework(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.resubmitTaskAfterRework(id, req.body);
      return sendSuccess(res, updated, "Đã nộp lại biên bản sau khi khắc phục thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addProgressLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const log = await ProjectsService.addProgressLog(id, req.body);
      return sendCreated(res, log, "Cập nhật báo cáo tiến độ thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 4. Approval
  static async approveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const approval = await ProjectsService.approveTask(id, req.body);
      return sendCreated(res, approval, "Nghiệm thu & ký duyệt công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 4.1 Task Acceptance & Workflow Actions
  static async acceptTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.acceptTask(id, req.body);
      return sendSuccess(res, updated, "Tiếp nhận công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async reassignTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.reassignTask(id, req.body);
      return sendSuccess(res, updated, "Chuyển giao công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async blockTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.blockTask(id, req.body);
      return sendSuccess(res, updated, "Đã tạm dừng công việc");
    } catch (error) {
      return next(error);
    }
  }

  static async unblockTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await ProjectsService.unblockTask(id, req.body);
      return sendSuccess(res, updated, "Đã khôi phục triển khai công việc");
    } catch (error) {
      return next(error);
    }
  }

  // 4.2 Task BOM (Material Demands)
  static async addTaskMaterialDemand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const demand = await ProjectsService.addTaskMaterialDemand(id, req.body);
      return sendCreated(res, demand, "Thêm định mức vật tư công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteTaskMaterialDemand(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, materialId } = req.params;
      await ProjectsService.deleteTaskMaterialDemand(id, materialId);
      return sendSuccess(res, { materialId }, "Xóa định mức vật tư thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async borrowMaterialsFromBom(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ticket = await ProjectsService.borrowMaterialsFromBom(id, req.body);
      return sendCreated(res, ticket, "1-Click lập phiếu mượn kho từ định mức BOM thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 5. Materials
  static async getMaterialTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;
      const tickets = await ProjectsService.getMaterialTickets(projectId as string);
      return sendSuccess(res, tickets, "Lấy danh sách phiếu vật tư công trình thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createMaterialTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ProjectsService.createMaterialTicket(req.body);
      return sendCreated(res, ticket, "Lập phiếu xuất mượn vật tư thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async returnMaterials(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ticket = await ProjectsService.returnMaterials(id, req.body);
      return sendSuccess(res, ticket, "Hoàn trả vật tư thừa về kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async convertInstalledMaterialsToOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProjectsService.convertInstalledMaterialsToOrder(id, req.body);
      return sendCreated(res, result, "Quyết toán vật tư thi công thành Đơn bán hàng POS thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 6. Backup & Restore
  static async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const backup = await ProjectsService.exportAllProjectData();
      return sendSuccess(res, backup, "Sao lưu dữ liệu dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async restoreData(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProjectsService.restoreProjectData(req.body);
      return sendSuccess(res, result, "Phục hồi dữ liệu dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 7. ERP Extensions (CBS, Gantt, PO, Billing, Site Diary, VO)
  static async addBudgetItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await ProjectsService.addBudgetItem(id, req.body);
      return sendCreated(res, item, "Thêm dự toán chi phí thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteBudgetItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const result = await ProjectsService.deleteBudgetItem(itemId);
      return sendSuccess(res, result, "Xóa khoản mục dự toán thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addActualExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const expense = await ProjectsService.addActualExpense(id, req.body);
      return sendCreated(res, expense, "Ghi nhận chi phí phát sinh thực tế thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addTaskDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { dependsOnTaskId, type, lagDays } = req.body;
      const dep = await ProjectsService.addTaskDependency(id, dependsOnTaskId, type, lagDays);
      return sendCreated(res, dep, "Thiết lập phụ thuộc công việc Gantt thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteTaskDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const { depId } = req.params;
      const result = await ProjectsService.deleteTaskDependency(depId);
      return sendSuccess(res, result, "Xóa phụ thuộc công việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createPoFromDemands(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProjectsService.createPoFromDemands(id, req.body);
      return sendCreated(res, result, "Tạo đơn đặt hàng mua PO gắn dự án thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addBillingMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const milestone = await ProjectsService.addBillingMilestone(id, req.body);
      return sendCreated(res, milestone, "Thêm mốc thu tiền hợp đồng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateBillingMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;
      const result = await ProjectsService.updateBillingMilestone(milestoneId, req.body);
      return sendSuccess(res, result, "Cập nhật tiến độ thu tiền thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addHandoverCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const cert = await ProjectsService.addHandoverCertificate(id, req.body);
      return sendCreated(res, cert, "Tạo biên bản nghiệm thu khối lượng A-B thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addDailySiteDiary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const diary = await ProjectsService.addDailySiteDiary(id, req.body);
      return sendCreated(res, diary, "Ghi nhật ký công trường thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async addVariationOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vo = await ProjectsService.addVariationOrder(id, req.body);
      return sendCreated(res, vo, "Tạo đề xuất phát sinh công trình VO thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async approveVariationOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { voId } = req.params;
      const { approvedBy } = req.body;
      const result = await ProjectsService.approveVariationOrder(voId, approvedBy);
      return sendSuccess(res, result, "Phê duyệt phát sinh VO và cập nhật ngân sách thành công");
    } catch (error) {
      return next(error);
    }
  }
}
