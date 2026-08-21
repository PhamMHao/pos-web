import { Router } from "express";
import { CustomersController } from "./customers.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createCustomerSchema,
  updateCustomerSchema,
  bulkImportCustomerSchema,
  customerQuerySchema,
  adjustPointsSchema,
  adjustDebtSchema,
} from "./customers.schema";
import { authenticate, requireRole } from "../../core/middlewares/authMiddleware";

const router = Router();

// Public / Authenticated read routes
router.get("/", validateRequest({ query: customerQuerySchema }), CustomersController.getCustomers);
router.get("/phone/:phone", CustomersController.getCustomerByPhone);
router.get("/:id", CustomersController.getCustomerById);

// Write routes
router.post(
  "/bulk-import",
  authenticate,
  validateRequest({ body: bulkImportCustomerSchema }),
  CustomersController.bulkImport
);

router.post(
  "/",
  authenticate,
  validateRequest({ body: createCustomerSchema }),
  CustomersController.createCustomer
);

router.put(
  "/:id",
  authenticate,
  validateRequest({ body: updateCustomerSchema }),
  CustomersController.updateCustomer
);

router.delete(
  "/:id",
  authenticate,
  requireRole(["admin", "manager"]),
  CustomersController.deleteCustomer
);

router.post(
  "/:id/adjust-points",
  authenticate,
  validateRequest({ body: adjustPointsSchema }),
  CustomersController.adjustPoints
);

router.post(
  "/:id/adjust-debt",
  authenticate,
  validateRequest({ body: adjustDebtSchema }),
  CustomersController.adjustDebt
);

export default router;
