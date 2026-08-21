import { Request, Response, NextFunction } from "express";
import { SettingsService } from "./settings.service";
import { sendSuccess } from "../../core/utils/responseFormatter";

export class SettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings();
      return sendSuccess(res, settings, "Lấy cài đặt hệ thống thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return sendSuccess(res, settings, "Cập nhật cài đặt hệ thống thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async backupDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      const backupData = await SettingsService.backupDatabase();
      return sendSuccess(res, backupData, "Xuất dữ liệu sao lưu CSDL thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async restoreDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SettingsService.restoreDatabase(req.body);
      return sendSuccess(res, result, "Khôi phục dữ liệu CSDL thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async wipeAllData(req: Request, res: Response, next: NextFunction) {
    try {
      const { confirmation } = req.body;
      const result = await SettingsService.wipeAllData(confirmation);
      return sendSuccess(res, result, "Đã xóa sạch toàn bộ dữ liệu CSDL thành công");
    } catch (error) {
      return next(error);
    }
  }
}

