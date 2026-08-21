import { Router } from "express";
import { EInvoicesController } from "./einvoices.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createEInvoiceSchema,
  eInvoiceQuerySchema,
} from "./einvoices.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get("/", validateRequest({ query: eInvoiceQuerySchema }), EInvoicesController.getInvoices);
router.get("/:id", EInvoicesController.getInvoiceById);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createEInvoiceSchema }),
  EInvoicesController.createInvoice
);
router.put("/:id/status", authenticate, EInvoicesController.updateInvoiceStatus);
router.delete("/:id", authenticate, EInvoicesController.deleteInvoice);

export default router;
