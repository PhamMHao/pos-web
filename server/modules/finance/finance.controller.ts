import { Request, Response, NextFunction } from "express";
import { FinanceService } from "./finance.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class FinanceController {
  static async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await FinanceService.createRecord(req.body);
      return sendCreated(res, record, "Tạo chứng từ thu chi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FinanceService.getRecords(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách thu chi thành công", 200, {
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

  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await FinanceService.getSummary();
      return sendSuccess(res, summary, "Lấy tổng kết thu chi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await FinanceService.getRecordById(id);
      return sendSuccess(res, record, "Lấy chi tiết chứng từ thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const record = await FinanceService.updateRecord(id, req.body);
      return sendSuccess(res, record, "Cập nhật chứng từ thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await FinanceService.deleteRecord(id);
      return sendSuccess(res, result, "Xóa chứng từ thành công");
    } catch (error) {
      return next(error);
    }
  }
}
