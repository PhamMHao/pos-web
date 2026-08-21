import { Request, Response, NextFunction } from "express";
import { WarrantiesService } from "./warranties.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class WarrantiesController {
  // --- TICKETS ---
  static async createWarrantyTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await WarrantiesService.createWarrantyTicket(req.body);
      return sendCreated(res, ticket, "Tạo phiếu tiếp nhận bảo hành thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getWarrantyTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WarrantiesService.getWarrantyTickets(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách phiếu bảo hành thành công", 200, {
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

  static async getWarrantyTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ticket = await WarrantiesService.getWarrantyTicketById(id);
      return sendSuccess(res, ticket, "Lấy chi tiết phiếu bảo hành thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateWarrantyTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ticket = await WarrantiesService.updateWarrantyTicket(id, req.body);
      return sendSuccess(res, ticket, "Cập nhật phiếu bảo hành thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteWarrantyTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await WarrantiesService.deleteWarrantyTicket(id);
      return sendSuccess(res, result, "Xóa phiếu bảo hành thành công");
    } catch (error) {
      return next(error);
    }
  }

  // --- SERIAL DEVICES ---
  static async getSerialDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WarrantiesService.getSerialDevices(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách thiết bị serial thành công", 200, {
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

  static async getSerialDeviceByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { serial } = req.params;
      const device = await WarrantiesService.getSerialDeviceByCode(serial);
      return sendSuccess(res, device, "Tra cứu thiết bị serial thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createOrUpdateSerialDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const device = await WarrantiesService.createOrUpdateSerialDevice(req.body);
      return sendSuccess(res, device, "Lưu thông tin thiết bị serial thành công");
    } catch (error) {
      return next(error);
    }
  }
}
