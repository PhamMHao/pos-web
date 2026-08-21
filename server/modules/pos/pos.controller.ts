import { Request, Response, NextFunction } from "express";
import { PosService } from "./pos.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class PosController {
  // --- ORDERS ---
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await PosService.createOrder(req.body);
      return sendCreated(res, order, "Tạo đơn hàng POS thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PosService.getOrders(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách đơn hàng thành công", 200, {
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

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await PosService.getOrderById(id);
      return sendSuccess(res, order, "Lấy chi tiết đơn hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await PosService.updateOrderStatus(id, req.body);
      return sendSuccess(res, order, "Cập nhật trạng thái đơn hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  // --- CASH SHIFTS ---
  static async openShift(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await PosService.openShift(req.body);
      return sendCreated(res, shift, "Mở ca làm việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async closeShift(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shift = await PosService.closeShift(id, req.body);
      return sendSuccess(res, shift, "Kết ca làm việc thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getCurrentShift(req: Request, res: Response, next: NextFunction) {
    try {
      const shift = await PosService.getCurrentShift();
      return sendSuccess(res, shift, "Lấy thông tin ca làm việc hiện tại thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getShiftHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const shifts = await PosService.getShiftHistory(limit);
      return sendSuccess(res, shifts, "Lấy lịch sử ca làm việc thành công");
    } catch (error) {
      return next(error);
    }
  }
}
