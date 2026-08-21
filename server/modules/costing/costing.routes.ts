import { Router } from "express";
import { CostingController } from "./costing.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createProductCostingSchema,
  updateProductCostingSchema,
  productCostingQuerySchema,
  assembleProductSchema,
} from "./costing.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get("/", validateRequest({ query: productCostingQuerySchema }), CostingController.getCostings);
router.get("/:id", CostingController.getCostingById);
router.post(
  "/assemble",
  authenticate,
  validateRequest({ body: assembleProductSchema }),
  CostingController.assembleProduct
);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createProductCostingSchema }),
  CostingController.createCosting
);
router.put(
  "/:id",
  authenticate,
  validateRequest({ body: updateProductCostingSchema }),
  CostingController.updateCosting
);
router.delete("/:id", authenticate, CostingController.deleteCosting);

export default router;
