import { Request, Response, NextFunction } from "express";
import { PromotionsService } from "./promotions.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class PromotionsController {
  static async getPromotions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PromotionsService.getPromotions(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách mã khuyến mãi thành công", 200, {
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

  static async getPromotionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const promo = await PromotionsService.getPromotionById(id);
      return sendSuccess(res, promo, "Lấy thông tin mã khuyến mãi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getPromotionByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const promo = await PromotionsService.getPromotionByCode(code);
      return sendSuccess(res, promo, "Tra cứu mã khuyến mãi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createPromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const promo = await PromotionsService.createPromotion(req.body);
      return sendCreated(res, promo, "Thêm mới mã khuyến mãi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updatePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const promo = await PromotionsService.updatePromotion(id, req.body);
      return sendSuccess(res, promo, "Cập nhật mã khuyến mãi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deletePromotion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PromotionsService.deletePromotion(id);
      return sendSuccess(res, result, "Xóa mã khuyến mãi thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async validatePromoCode(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PromotionsService.validatePromoCode(req.body);
      return sendSuccess(res, result, "Áp dụng mã giảm giá thành công");
    } catch (error) {
      return next(error);
    }
  }
}
