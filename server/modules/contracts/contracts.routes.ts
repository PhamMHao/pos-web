import { Router } from "express";
import { ContractsController } from "./contracts.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createCustomerContractSchema,
  createFromQuoteSchema,
  signCustomerContractSchema,
  createHandoverNoteSchema,
  createLiquidationSchema,
  contractQuerySchema,
} from "./contracts.schema";

const router = Router();

router.get(
  "/",
  validateRequest({ query: contractQuerySchema }),
  ContractsController.getContracts
);

router.get("/:id", ContractsController.getContractById);

router.post(
  "/",
  validateRequest({ body: createCustomerContractSchema }),
  ContractsController.createContract
);

router.post(
  "/from-quote",
  validateRequest({ body: createFromQuoteSchema }),
  ContractsController.createFromQuote
);

router.put(
  "/:id/sign",
  validateRequest({ body: signCustomerContractSchema }),
  ContractsController.signContract
);
router.post(
  "/:id/sign",
  validateRequest({ body: signCustomerContractSchema }),
  ContractsController.signContract
);

router.post(
  "/:id/handover",
  validateRequest({ body: createHandoverNoteSchema }),
  ContractsController.createHandover
);
router.post(
  "/:id/handovers",
  validateRequest({ body: createHandoverNoteSchema }),
  ContractsController.createHandover
);

router.post(
  "/:id/liquidation",
  validateRequest({ body: createLiquidationSchema }),
  ContractsController.createLiquidation
);
router.post(
  "/:id/liquidations",
  validateRequest({ body: createLiquidationSchema }),
  ContractsController.createLiquidation
);

router.delete("/:id", ContractsController.deleteContract);

export default router;
