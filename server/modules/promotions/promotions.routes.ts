import { Router } from "express";
import { PromotionsController } from "./promotions.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionQuerySchema,
  validatePromoCodeSchema,
} from "./promotions.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get("/", validateRequest({ query: promotionQuerySchema }), PromotionsController.getPromotions);
router.get("/code/:code", PromotionsController.getPromotionByCode);
router.post("/validate", validateRequest({ body: validatePromoCodeSchema }), PromotionsController.validatePromoCode);
router.get("/:id", PromotionsController.getPromotionById);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createPromotionSchema }),
  PromotionsController.createPromotion
);
router.put(
  "/:id",
  authenticate,
  validateRequest({ body: updatePromotionSchema }),
  PromotionsController.updatePromotion
);
router.delete("/:id", authenticate, PromotionsController.deletePromotion);

export default router;
