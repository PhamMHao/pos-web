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
}
