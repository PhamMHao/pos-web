import { Router } from "express";
import { ReturnsController } from "./returns.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createReturnOrderSchema,
  returnOrderQuerySchema,
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

router.delete("/:id", ReturnsController.deleteReturnOrder);

export default router;
