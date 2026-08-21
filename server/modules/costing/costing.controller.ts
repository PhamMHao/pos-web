import { Request, Response, NextFunction } from "express";
import { CostingService } from "./costing.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class CostingController {
  static async createCosting(req: Request, res: Response, next: NextFunction) {
    try {
      const costing = await CostingService.createCosting(req.body);
      return sendCreated(res, costing, "Tạo định mức BOM giá thành thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getCostings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CostingService.getCostings(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách định mức BOM thành công", 200, {
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

  static async getCostingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const costing = await CostingService.getCostingById(id);
      return sendSuccess(res, costing, "Lấy chi tiết định mức BOM thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateCosting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const costing = await CostingService.updateCosting(id, req.body);
      return sendSuccess(res, costing, "Cập nhật định mức BOM thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCosting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CostingService.deleteCosting(id);
      return sendSuccess(res, result, "Xóa định mức BOM thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async assembleProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CostingService.assembleProduct(req.body);
      return sendSuccess(res, result, "Thực hiện lệnh lắp ráp sản xuất thành công");
    } catch (error) {
      return next(error);
    }
  }
}
