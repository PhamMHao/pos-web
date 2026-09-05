import { Request, Response, NextFunction } from "express";
import { KpiService } from "./kpi.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class KpiController {
  static async getEvaluations(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, department, rank, search } = req.query;
      const evaluations = await KpiService.getEvaluations({
        period: period as string,
        department: department as string,
        rank: rank as string,
        search: search as string,
      });
      return sendSuccess(res, evaluations, "Lấy danh sách đánh giá KPI thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getEvaluationById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const evaluation = await KpiService.getEvaluationById(id);
      return sendSuccess(res, evaluation, "Lấy thông tin phiếu đánh giá KPI thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const evaluation = await KpiService.createEvaluation(req.body);
      return sendCreated(res, evaluation, "Tạo phiếu đánh giá KPI thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await KpiService.updateEvaluation(id, req.body);
      return sendSuccess(res, updated, "Cập nhật đánh giá KPI thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async approveEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { approvedBy, digitalSignature } = req.body;
      const approved = await KpiService.approveEvaluation(id, approvedBy, digitalSignature);
      return sendSuccess(res, approved, "Phê duyệt đánh giá KPI thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async batchApprove(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, approvedBy, digitalSignature } = req.body;
      const result = await KpiService.batchApprove(period || "Tháng 02/2026", approvedBy, digitalSignature);
      return sendSuccess(res, result, "Phê duyệt hàng loạt kỳ đánh giá KPI thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async seedEvaluations(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = "Tháng 02/2026" } = req.body;
      const prisma = (await import("../../config/db")).default;
      const employees = await prisma.employee.findMany({ where: { status: "active" } });
      await KpiService.seedEvaluationsForEmployees(employees, period);
      const data = await KpiService.getEvaluations({ period });
      return sendSuccess(res, data, `Đồng bộ dữ liệu mẫu ${data.length} nhân viên thành công`);
    } catch (error) {
      return next(error);
    }
  }
}
