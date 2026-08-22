import { Request, Response, NextFunction } from "express";
import { TransfersService } from "./transfers.service";
import { sendCreated, sendPaginated, sendSuccess } from "../../core/utils/responseFormatter";

export class TransfersController {
  static async getTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.getTransfers(req.query as any);
      return sendPaginated(
        res,
        result.items,
        result.total,
        result.page,
        result.limit,
        "Lấy danh sách phiếu chuyển kho thành công"
      );
    } catch (err) {
      next(err);
    }
  }

  static async getTransferById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.getTransferById(req.params.id);
      return sendSuccess(res, result, "Lấy thông tin phiếu chuyển kho thành công");
    } catch (err) {
      next(err);
    }
  }

  static async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.createStockTransfer(req.body);
      return sendCreated(res, result, "Tạo phiếu chuyển kho thành công");
    } catch (err) {
      next(err);
    }
  }

  static async updateTransferStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.updateTransferStatus(req.params.id, req.body);
      return sendSuccess(res, result, "Cập nhật trạng thái phiếu chuyển kho thành công");
    } catch (err) {
      next(err);
    }
  }

  static async deleteTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TransfersService.deleteTransfer(req.params.id);
      return sendSuccess(res, result, "Xóa phiếu chuyển kho thành công");
    } catch (err) {
      next(err);
    }
  }
}
