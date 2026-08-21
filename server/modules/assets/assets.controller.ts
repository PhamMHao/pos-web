import { Request, Response, NextFunction } from "express";
import { AssetsService } from "./assets.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class AssetsController {
  static async getAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AssetsService.getAssets(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách tài sản thành công", 200, {
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

  static async getAssetById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const asset = await AssetsService.getAssetById(id);
      return sendSuccess(res, asset, "Lấy chi tiết tài sản thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await AssetsService.createAsset(req.body);
      return sendCreated(res, asset, "Thêm mới tài sản thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const asset = await AssetsService.updateAsset(id, req.body);
      return sendSuccess(res, asset, "Cập nhật tài sản thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AssetsService.deleteAsset(id);
      return sendSuccess(res, result, "Xóa tài sản thành công");
    } catch (error) {
      return next(error);
    }
  }
}
