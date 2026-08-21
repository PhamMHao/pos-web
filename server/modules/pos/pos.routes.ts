import { Router } from "express";
import { PosController } from "./pos.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
  openShiftSchema,
  closeShiftSchema,
} from "./pos.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

// Order routes
router.get("/orders", validateRequest({ query: orderQuerySchema }), PosController.getOrders);
router.get("/orders/:id", PosController.getOrderById);
router.post("/orders", validateRequest({ body: createOrderSchema }), PosController.createOrder);
router.put(
  "/orders/:id/status",
  authenticate,
  validateRequest({ body: updateOrderStatusSchema }),
  PosController.updateOrderStatus
);

// Cash Shift routes
router.get("/shifts/current", PosController.getCurrentShift);
router.get("/shifts/history", PosController.getShiftHistory);
router.post("/shifts/open", validateRequest({ body: openShiftSchema }), PosController.openShift);
router.post("/shifts/:id/close", validateRequest({ body: closeShiftSchema }), PosController.closeShift);

export default router;
