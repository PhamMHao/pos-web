import { Router } from "express";
import { QuotesController } from "./quotes.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createPriceQuoteSchema,
  updatePriceQuoteSchema,
  priceQuoteQuerySchema,
} from "./quotes.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get("/", validateRequest({ query: priceQuoteQuerySchema }), QuotesController.getQuotes);
router.get("/:id", QuotesController.getQuoteById);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createPriceQuoteSchema }),
  QuotesController.createQuote
);
router.put(
  "/:id",
  authenticate,
  validateRequest({ body: updatePriceQuoteSchema }),
  QuotesController.updateQuote
);
router.put("/:id/sign", QuotesController.signQuote);
router.delete("/:id", authenticate, QuotesController.deleteQuote);

export default router;
