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

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AuthService.updateUser(id, req.body);
      return sendSuccess(res, user, "Cập nhật người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AuthService.deleteUser(id);
      return sendSuccess(res, result, "Xóa người dùng thành công");
    } catch (error) {
      return next(error);
    }
  }

  // ===================== RBAC CONTROLLER METHODS =====================

  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AuthService.getRoles();
      return sendSuccess(res, roles, "Lấy danh sách vai trò hệ thống từ DB thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getModules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await AuthService.getModules();
      return sendSuccess(res, modules, "Lấy danh sách phân hệ hệ thống từ DB thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const matrix = await AuthService.getMatrix();
      return sendSuccess(res, matrix, "Lấy ma trận phân quyền từ DB thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async saveMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.saveMatrix(req.body);
      return sendSuccess(res, result, "Lưu ma trận phân quyền vào CSDL thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async saveRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.saveRole(req.body);
      return sendSuccess(res, result, "Lưu cấu hình vai trò vào CSDL thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleKey } = req.params;
      const result = await AuthService.deleteRole(roleKey);
      return sendSuccess(res, result, "Xóa vai trò thành công");
    } catch (error) {
      return next(error);
    }
  }
}
