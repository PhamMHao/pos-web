import { Request, Response, NextFunction } from "express";
import { QuotesService } from "./quotes.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class QuotesController {
  static async createQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const quote = await QuotesService.createQuote(req.body);
      return sendCreated(res, quote, "Tạo bảng báo giá thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getQuotes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await QuotesService.getQuotes(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách báo giá thành công", 200, {
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

  static async getQuoteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quote = await QuotesService.getQuoteById(id);
      return sendSuccess(res, quote, "Lấy chi tiết báo giá thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quote = await QuotesService.updateQuote(id, req.body);
      return sendSuccess(res, quote, "Cập nhật bảng báo giá thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await QuotesService.deleteQuote(id);
      return sendSuccess(res, result, "Xóa bảng báo giá thành công");
    } catch (error) {
      return next(error);
    }
  }
}
