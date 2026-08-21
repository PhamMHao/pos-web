import { Router } from "express";
import { InboundInvoicesController } from "./inbound-invoices.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createInboundInvoiceSchema,
  inboundInvoiceQuerySchema,
} from "./inbound-invoices.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get(
  "/",
  validateRequest({ query: inboundInvoiceQuerySchema }),
  InboundInvoicesController.getInboundInvoices
);
router.get("/:id", InboundInvoicesController.getInboundInvoiceById);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createInboundInvoiceSchema }),
  InboundInvoicesController.createInboundInvoice
);
router.post(
  "/:id/import-to-inventory",
  authenticate,
  InboundInvoicesController.importGoodsToInventory
);
router.delete("/:id", authenticate, InboundInvoicesController.deleteInboundInvoice);

export default router;
