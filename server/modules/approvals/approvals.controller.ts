import { Request, Response, NextFunction } from 'express';
import { ApprovalsService } from './approvals.service';
import { sendSuccess } from '../../core/utils/responseFormatter';

export class ApprovalsController {
  static async getProcesses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ApprovalsService.getProcesses(req.query as any);
      return sendSuccess(res, data, 'Lấy danh sách phiếu trình ký thành công');
    } catch (error) {
      return next(error);
    }
  }

  static async getProcessById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ApprovalsService.getProcessById(id);
      return sendSuccess(res, data, 'Lấy chi tiết phiếu trình ký thành công');
    } catch (error) {
      return next(error);
    }
  }

  static async createProcess(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ApprovalsService.createProcess(req.body);
      return sendSuccess(res, data, 'Khởi tạo phiếu trình ký phê duyệt thành công');
    } catch (error) {
      return next(error);
    }
  }

  static async executeAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ApprovalsService.executeAction(id, req.body);
      const actionText =
        req.body.action === 'approve'
          ? 'Ký duyệt'
          : req.body.action === 'reject'
          ? 'Từ chối'
          : 'Yêu cầu làm lại';
      return sendSuccess(res, data, `Thao tác ${actionText} thành công`);
    } catch (error) {
      return next(error);
    }
  }

  static async sendReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actorName = req.body.actorName || 'Quản trị viên';
      const data = await ApprovalsService.sendReminder(id, actorName);
      return sendSuccess(res, data, 'Gửi nhắc nhở duyệt hồ sơ thành công');
    } catch (error) {
      return next(error);
    }
  }

  static async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ApprovalsService.getTemplates();
      return sendSuccess(res, data, 'Lấy danh sách mẫu quy trình phê duyệt thành công');
    } catch (error) {
      return next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ApprovalsService.getAnalytics();
      return sendSuccess(res, data, 'Lấy dữ liệu phân tích KPI phê duyệt thành công');
    } catch (error) {
      return next(error);
    }
  }
}
