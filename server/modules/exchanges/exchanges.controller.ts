import { Request, Response, NextFunction } from "express";
import { ExchangesService } from "./exchanges.service";
import { sendCreated, sendPaginated, sendSuccess } from "../../core/utils/responseFormatter";

export class ExchangesController {
  static async getExchanges(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExchangesService.getExchanges(req.query as any);
      return sendPaginated(
        res,
        result.items,
        result.total,
        result.page,
        result.limit,
        "Lấy danh sách phiếu đổi hàng thành công"
      );
    } catch (err) {
      next(err);
    }
  }

  static async getExchangeById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExchangesService.getExchangeById(req.params.id);
      return sendSuccess(res, result, "Lấy thông tin phiếu đổi hàng thành công");
    } catch (err) {
      next(err);
    }
  }

  static async createExchange(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExchangesService.createExchange(req.body);
      return sendCreated(res, result, "Tạo phiếu đổi hàng thành công");
    } catch (err) {
      next(err);
    }
  }

  static async commitExchange(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || "usr-admin-01";
      const result = await ExchangesService.commitExchange(req.params.id, userId);
      return sendSuccess(res, result, "Hoàn tất & Nhập/Xuất kho phiếu đổi hàng thành công");
    } catch (err) {
      next(err);
    }
  }

  static async cancelExchange(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExchangesService.cancelExchange(req.params.id, req.body);
      return sendSuccess(res, result, "Hủy phiếu đổi hàng và hoàn kho thành công");
    } catch (err) {
      next(err);
    }
  }

  static async getReturnPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExchangesService.getReturnPolicy();
      return sendSuccess(res, result, "Lấy cấu hình chính sách đổi trả thành công");
    } catch (err) {
      next(err);
    }
  }

  static async updateReturnPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExchangesService.updateReturnPolicy(req.body);
      return sendSuccess(res, result, "Cập nhật chính sách đổi trả thành công");
    } catch (err) {
      next(err);
    }
  }
}
