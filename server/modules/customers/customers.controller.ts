import { Request, Response, NextFunction } from "express";
import { CustomersService } from "./customers.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class CustomersController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomersService.getCustomers(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách khách hàng thành công", 200, {
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

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomersService.getCustomerById(id);
      return sendSuccess(res, customer, "Lấy thông tin chi tiết khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getCustomerByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.params;
      const customer = await CustomersService.getCustomerByPhone(phone);
      return sendSuccess(res, customer, "Tra cứu khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomersService.createCustomer(req.body);
      return sendCreated(res, customer, "Thêm mới khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomersService.updateCustomer(id, req.body);
      return sendSuccess(res, customer, "Cập nhật thông tin khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CustomersService.deleteCustomer(id);
      return sendSuccess(res, result, "Xóa khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async adjustPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CustomersService.adjustPoints(id, req.body);
      return sendSuccess(res, result, "Điều chỉnh điểm thưởng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async adjustDebt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CustomersService.adjustDebt(id, req.body);
      return sendSuccess(res, result, "Điều chỉnh công nợ thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const { customers } = req.body;
      const result = await CustomersService.bulkImport(customers);
      return sendSuccess(res, result, "Nhập danh sách khách hàng thành công");
    } catch (error) {
      return next(error);
    }
  }
}
