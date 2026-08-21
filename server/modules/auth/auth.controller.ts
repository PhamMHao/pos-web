import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, "Đăng nhập thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendCreated(res, result, "Đăng ký tài khoản người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getMe(userId);
      return sendSuccess(res, user, "Lấy thông tin người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await AuthService.changePassword(userId, req.body);
      return sendSuccess(res, result, "Đổi mật khẩu thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.listUsers();
      return sendSuccess(res, users, "Lấy danh sách người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }
}
