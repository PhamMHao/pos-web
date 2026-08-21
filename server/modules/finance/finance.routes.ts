import { Router } from "express";
import { FinanceController } from "./finance.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createAccountingRecordSchema,
  updateAccountingRecordSchema,
  accountingRecordQuerySchema,
} from "./finance.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get("/summary", FinanceController.getSummary);
router.get("/records", validateRequest({ query: accountingRecordQuerySchema }), FinanceController.getRecords);
router.get("/", validateRequest({ query: accountingRecordQuerySchema }), FinanceController.getRecords);
router.get("/:id", FinanceController.getRecordById);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createAccountingRecordSchema }),
  FinanceController.createRecord
);
router.put(
  "/:id",
  authenticate,
  validateRequest({ body: updateAccountingRecordSchema }),
  FinanceController.updateRecord
);
router.delete("/:id", authenticate, FinanceController.deleteRecord);

export default router;
