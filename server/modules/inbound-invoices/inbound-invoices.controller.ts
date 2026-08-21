import { Request, Response, NextFunction } from "express";
import { InboundInvoicesService } from "./inbound-invoices.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class InboundInvoicesController {
  static async createInboundInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InboundInvoicesService.createInboundInvoice(req.body);
      return sendCreated(res, invoice, "Lưu hóa đơn đầu vào thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getInboundInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InboundInvoicesService.getInboundInvoices(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách hóa đơn đầu vào thành công", 200, {
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

  static async getInboundInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await InboundInvoicesService.getInboundInvoiceById(id);
      return sendSuccess(res, invoice, "Lấy chi tiết hóa đơn đầu vào thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteInboundInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await InboundInvoicesService.deleteInboundInvoice(id);
      return sendSuccess(res, result, "Xóa hóa đơn đầu vào thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async importGoodsToInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { targetWarehouse, performedBy } = req.body || {};
      const result = await InboundInvoicesService.importGoodsToInventory(id, targetWarehouse, performedBy);
      return sendSuccess(res, result, "Nhập kho và tính lại giá vốn bình quân thành công");
    } catch (error) {
      return next(error);
    }
  }
}
