import { Router } from "express";
import { ReturnsController } from "./returns.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createReturnOrderSchema,
  returnOrderQuerySchema,
  cancelReturnOrderSchema,
} from "./returns.schema";

const router = Router();

router.get(
  "/",
  validateRequest({ query: returnOrderQuerySchema }),
  ReturnsController.getReturnOrders
);

router.get("/:id", ReturnsController.getReturnOrderById);

router.post(
  "/",
  validateRequest({ body: createReturnOrderSchema }),
  ReturnsController.createReturnOrder
);

router.post("/:id/commit", ReturnsController.commitReturnOrder);

router.post(
  "/:id/cancel",
  validateRequest({ body: cancelReturnOrderSchema }),
  ReturnsController.cancelReturnOrder
);

router.delete("/:id", ReturnsController.deleteReturnOrder);

export default router;
