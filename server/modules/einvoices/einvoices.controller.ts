import { Request, Response, NextFunction } from "express";
import { EInvoicesService } from "./einvoices.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class EInvoicesController {
  static async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await EInvoicesService.createInvoice(req.body);
      return sendCreated(res, invoice, "Phát hành hóa đơn điện tử TT78 thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EInvoicesService.getInvoices(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách hóa đơn điện tử thành công", 200, {
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

  static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await EInvoicesService.getInvoiceById(id);
      return sendSuccess(res, invoice, "Lấy chi tiết hóa đơn điện tử thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const invoice = await EInvoicesService.updateInvoiceStatus(id, status);
      return sendSuccess(res, invoice, "Cập nhật trạng thái hóa đơn thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await EInvoicesService.deleteInvoice(id);
      return sendSuccess(res, result, "Xóa hóa đơn thành công");
    } catch (error) {
      return next(error);
    }
  }
}
