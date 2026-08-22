import { Request, Response, NextFunction } from "express";
import { SuppliersService } from "./suppliers.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class SuppliersController {
  // --- SUPPLIERS ---
  static async getSuppliers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuppliersService.getSuppliers(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách nhà cung cấp thành công", 200, {
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

  static async getSupplierById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplier = await SuppliersService.getSupplierById(id);
      return sendSuccess(res, supplier, "Lấy thông tin nhà cung cấp thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SuppliersService.createSupplier(req.body);
      return sendCreated(res, supplier, "Thêm mới nhà cung cấp thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplier = await SuppliersService.updateSupplier(id, req.body);
      return sendSuccess(res, supplier, "Cập nhật nhà cung cấp thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteSupplier(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SuppliersService.deleteSupplier(id);
      return sendSuccess(res, result, "Xóa nhà cung cấp thành công");
    } catch (error) {
      return next(error);
    }
  }

  // --- PURCHASE ORDERS ---
  static async getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SuppliersService.getPurchaseOrders(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách đơn mua hàng thành công", 200, {
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

  static async getPurchaseOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const po = await SuppliersService.getPurchaseOrderById(id);
      return sendSuccess(res, po, "Lấy chi tiết đơn mua hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createPurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const po = await SuppliersService.createPurchaseOrder(req.body);
      return sendCreated(res, po, "Tạo đơn đặt hàng mua thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updatePurchaseOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const po = await SuppliersService.updatePurchaseOrderStatus(id, req.body);
      return sendSuccess(res, po, "Cập nhật trạng thái đơn mua hàng thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deletePurchaseOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SuppliersService.deletePurchaseOrder(id);
      return sendSuccess(res, result, "Xóa đơn đặt hàng mua thành công");
    } catch (error) {
      return next(error);
    }
  }
}
