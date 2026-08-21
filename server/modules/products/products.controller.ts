import { Request, Response, NextFunction } from "express";
import { ProductsService } from "./products.service";
import { sendSuccess, sendCreated } from "../../core/utils/responseFormatter";

export class ProductsController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductsService.getProducts(req.query as any);
      return sendSuccess(res, result.items, "Lấy danh sách sản phẩm thành công", 200, {
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

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductsService.getProductById(id);
      return sendSuccess(res, product, "Lấy chi tiết sản phẩm thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getProductByBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const product = await ProductsService.getProductByBarcode(code);
      return sendSuccess(res, product, "Tìm sản phẩm theo mã quét thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductsService.createProduct(req.body);
      return sendCreated(res, product, "Tạo mới sản phẩm thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductsService.updateProduct(id, req.body);
      return sendSuccess(res, product, "Cập nhật sản phẩm thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProductsService.deleteProduct(id);
      return sendSuccess(res, result, "Xóa sản phẩm thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const { products } = req.body;
      const result = await ProductsService.bulkImport(products);
      return sendSuccess(res, result, "Import danh sách sản phẩm hoàn tất");
    } catch (error) {
      return next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductsService.getCategories();
      return sendSuccess(res, categories, "Lấy danh mục sản phẩm thành công");
    } catch (error) {
      return next(error);
    }
  }
}
