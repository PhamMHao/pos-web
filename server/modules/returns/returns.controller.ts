import { Request, Response, NextFunction } from "express";
import { ReturnsService } from "./returns.service";
import { sendCreated, sendPaginated, sendSuccess } from "../../core/utils/responseFormatter";

export class ReturnsController {
  static async getReturnOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReturnsService.getReturnOrders(req.query as any);
      return sendPaginated(
        res,
        result.items,
        result.total,
        result.page,
        result.limit,
        "Lấy danh sách phiếu trả hàng thành công"
      );
    } catch (err) {
      next(err);
    }
  }

  static async getReturnOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReturnsService.getReturnOrderById(req.params.id);
      return sendSuccess(res, result, "Lấy thông tin phiếu trả hàng thành công");
    } catch (err) {
      next(err);
    }
  }

  static async createReturnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReturnsService.createReturnOrder(req.body);
      return sendCreated(res, result, "Tạo phiếu trả hàng thành công");
    } catch (err) {
      next(err);
    }
  }

  static async commitReturnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "usr-admin-01";
      const result = await ReturnsService.commitReturnOrder(req.params.id, userId);
      return sendSuccess(res, result, "Hoàn tất & Nhập kho phiếu trả hàng thành công");
    } catch (err) {
      next(err);
    }
  }

  static async cancelReturnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReturnsService.cancelReturnOrder(req.params.id, req.body);
      return sendSuccess(res, result, "Hủy phiếu trả hàng và hoàn kho thành công");
    } catch (err) {
      next(err);
    }
  }

  static async deleteReturnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReturnsService.deleteReturnOrder(req.params.id);
      return sendSuccess(res, result, "Xóa phiếu trả hàng draft thành công");
    } catch (err) {
      next(err);
    }
  }
}
