import { Router } from "express";
import { TransfersController } from "./transfers.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createStockTransferSchema,
  stockTransferQuerySchema,
  updateStockTransferStatusSchema,
} from "./transfers.schema";

const router = Router();

router.get(
  "/",
  validateRequest({ query: stockTransferQuerySchema }),
  TransfersController.getTransfers
);

router.get("/:id", TransfersController.getTransferById);

router.post(
  "/",
  validateRequest({ body: createStockTransferSchema }),
  TransfersController.createTransfer
);

router.patch(
  "/:id/status",
  validateRequest({ body: updateStockTransferStatusSchema }),
  TransfersController.updateTransferStatus
);

router.delete("/:id", TransfersController.deleteTransfer);

export default router;
