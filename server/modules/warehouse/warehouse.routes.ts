import { Router } from "express";
import { WarehouseController } from "./warehouse.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createGoodsReceiptSchema,
  adjustStockSchema,
  goodsReceiptQuerySchema,
  inventoryLogQuerySchema,
} from "./warehouse.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

// Goods Receipt Routes
router.get(
  "/receipts",
  validateRequest({ query: goodsReceiptQuerySchema }),
  WarehouseController.getGoodsReceipts
);
router.get("/receipts/:id", WarehouseController.getGoodsReceiptById);
router.post(
  "/receipts",
  authenticate,
  validateRequest({ body: createGoodsReceiptSchema }),
  WarehouseController.createGoodsReceipt
);

// Stock Adjustments & Logs
router.post(
  "/adjust-stock",
  authenticate,
  validateRequest({ body: adjustStockSchema }),
  WarehouseController.adjustStock
);

router.get(
  "/logs",
  validateRequest({ query: inventoryLogQuerySchema }),
  WarehouseController.getInventoryLogs
);

export default router;
