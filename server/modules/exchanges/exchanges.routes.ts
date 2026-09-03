import { Router } from "express";
import { ExchangesController } from "./exchanges.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createProductExchangeSchema,
  exchangeQuerySchema,
  cancelExchangeSchema,
  updatePolicySchema,
} from "./exchanges.schema";

const router = Router();

// Lấy / Cập nhật cấu hình chính sách đổi trả
router.get("/policy/config", ExchangesController.getReturnPolicy);
router.put(
  "/policy/config",
  validateRequest({ body: updatePolicySchema }),
  ExchangesController.updateReturnPolicy
);

// Danh sách & Chi tiết đổi hàng
router.get(
  "/",
  validateRequest({ query: exchangeQuerySchema }),
  ExchangesController.getExchanges
);

router.get("/:id", ExchangesController.getExchangeById);

// Tạo mới phiếu đổi hàng
router.post(
  "/",
  validateRequest({ body: createProductExchangeSchema }),
  ExchangesController.createExchange
);

// Duyệt / Commit phiếu đổi hàng từ Draft sang Completed
router.post("/:id/commit", ExchangesController.commitExchange);

// Hủy phiếu đổi hàng
router.post(
  "/:id/cancel",
  validateRequest({ body: cancelExchangeSchema }),
  ExchangesController.cancelExchange
);

export default router;
