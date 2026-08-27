import { Request, Response, NextFunction } from "express";
import { WarehouseService } from "./warehouse.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class WarehouseController {
  // 1. Goods Receipts (Phiếu Nhập Kho)
  static async createGoodsReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await WarehouseService.createGoodsReceipt(req.body);
      return sendCreated(res, receipt, "Tạo phiếu nhập kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getGoodsReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WarehouseService.getGoodsReceipts(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách phiếu nhập kho thành công", 200, {
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

  static async getGoodsReceiptById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const receipt = await WarehouseService.getGoodsReceiptById(id);
      return sendSuccess(res, receipt, "Lấy chi tiết phiếu nhập kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 2. Goods Issues (Phiếu Xuất Kho)
  static async createGoodsIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await WarehouseService.createGoodsIssue(req.body);
      return sendCreated(res, issue, "Tạo phiếu xuất kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getGoodsIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WarehouseService.getGoodsIssues(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách phiếu xuất kho thành công", 200, {
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

  static async getGoodsIssueById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const issue = await WarehouseService.getGoodsIssueById(id);
      return sendSuccess(res, issue, "Lấy chi tiết phiếu xuất kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  // 3. Stock Adjustments & Logs
  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await WarehouseService.adjustStock(req.body);
      return sendSuccess(res, log, "Điều chỉnh tồn kho thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getInventoryLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WarehouseService.getInventoryLogs(req.query as any);
      return sendSuccess(res, result.items, "Lấy sổ nhật ký kho thành công", 200, {
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
}
