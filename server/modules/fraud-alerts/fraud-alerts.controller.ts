import { Request, Response, NextFunction } from "express";
import { FraudAlertsService } from "./fraud-alerts.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class FraudAlertsController {
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FraudAlertsService.getAlerts(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách cảnh báo gian lận thành công", 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getAlertById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await FraudAlertsService.getAlertById(id);
      return sendSuccess(res, alert, "Lấy chi tiết cảnh báo thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await FraudAlertsService.createAlert(req.body);
      return sendCreated(res, alert, "Tạo cảnh báo gian lận thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await FraudAlertsService.updateAlert(id, req.body);
      return sendSuccess(res, alert, "Cập nhật cảnh báo thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const alert = await FraudAlertsService.resolveAlert(id);
      return sendSuccess(res, alert, "Đã đánh dấu cảnh báo là đã giải quyết");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await FraudAlertsService.deleteAlert(id);
      return sendSuccess(res, result, "Xóa cảnh báo thành công");
    } catch (error) {
      return next(error);
    }
  }
}
