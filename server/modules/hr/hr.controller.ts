import { Request, Response, NextFunction } from "express";
import { HrService } from "./hr.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class HrController {
  // --- EMPLOYEES ---
  static async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HrService.getEmployees(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách nhân viên thành công", 200, {
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

  static async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await HrService.getEmployeeById(id);
      return sendSuccess(res, employee, "Lấy thông tin nhân viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await HrService.createEmployee(req.body);
      return sendCreated(res, employee, "Thêm mới nhân viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await HrService.updateEmployee(id, req.body);
      return sendSuccess(res, employee, "Cập nhật nhân viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await HrService.deleteEmployee(id);
      return sendSuccess(res, result, "Xóa nhân viên thành công");
    } catch (error) {
      return next(error);
    }
  }

  // --- LABOR CONTRACTS ---
  static async getLaborContracts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HrService.getLaborContracts(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách hợp đồng lao động thành công", 200, {
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

  static async getLaborContractById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await HrService.getLaborContractById(id);
      return sendSuccess(res, contract, "Lấy chi tiết hợp đồng lao động thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createLaborContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await HrService.createLaborContract(req.body);
      return sendCreated(res, contract, "Tạo hợp đồng lao động thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateLaborContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await HrService.updateLaborContract(id, req.body);
      return sendSuccess(res, contract, "Cập nhật hợp đồng lao động thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteLaborContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await HrService.deleteLaborContract(id);
      return sendSuccess(res, result, "Xóa hợp đồng lao động thành công");
    } catch (error) {
      return next(error);
    }
  }
}
