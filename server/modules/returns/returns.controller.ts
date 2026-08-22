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

  static async deleteReturnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ReturnsService.deleteReturnOrder(req.params.id);
      return sendSuccess(res, result, "Xóa phiếu trả hàng thành công");
    } catch (err) {
      next(err);
    }
  }
}
