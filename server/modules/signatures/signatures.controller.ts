import { Request, Response, NextFunction } from "express";
import { SignaturesService } from "./signatures.service";
import { sendSuccess } from "../../core/utils/responseFormatter";

export class SignaturesController {
  static async getSignableDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await SignaturesService.getSignableDocuments(req.query as any);
      return sendSuccess(res, documents, "Lấy danh sách chứng từ ký số thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async batchSign(req: Request, res: Response, next: NextFunction) {
    try {
      const { docIds, signature } = req.body;
      const results = await SignaturesService.batchSign(docIds || [], signature);
      return sendSuccess(res, results, "Ký số hàng loạt thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async getCaGateways(req: Request, res: Response, next: NextFunction) {
    try {
      const gateways = await SignaturesService.getCaGateways();
      return sendSuccess(res, gateways, "Lấy danh sách cổng CA thành công");
    } catch (error) {
      return next(error);
    }
  }

  static async updateCaGateway(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider } = req.params;
      const gateway = await SignaturesService.updateCaGateway(provider, req.body);
      return sendSuccess(res, gateway, "Cập nhật cấu hình cổng CA thành công");
    } catch (error) {
      return next(error);
    }
  }
}
