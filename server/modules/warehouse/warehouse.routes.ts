import { Router } from "express";
import { WarehouseController } from "./warehouse.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createGoodsReceiptSchema,
  createGoodsIssueSchema,
  goodsReceiptQuerySchema,
  goodsIssueQuerySchema,
  adjustStockSchema,
  inventoryLogQuerySchema,
} from "./warehouse.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

// 1. Goods Receipt Routes (Phiếu Nhập Kho)
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

// 2. Goods Issue Routes (Phiếu Xuất Kho)
router.get(
  "/issues",
  validateRequest({ query: goodsIssueQuerySchema }),
  WarehouseController.getGoodsIssues
);
router.get("/issues/:id", WarehouseController.getGoodsIssueById);
router.post(
  "/issues",
  authenticate,
  validateRequest({ body: createGoodsIssueSchema }),
  WarehouseController.createGoodsIssue
);

// 3. Stock Adjustments & Logs (Điều Chỉnh & Sổ Nhật Ký Kho)
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
