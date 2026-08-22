import { Router } from "express";
import { SuppliersController } from "./suppliers.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  purchaseOrderQuerySchema,
} from "./suppliers.schema";

const router = Router();

// Purchase Orders Routes (Must be declared before /:id)
router.get(
  "/orders/list",
  validateRequest({ query: purchaseOrderQuerySchema }),
  SuppliersController.getPurchaseOrders
);
router.get("/orders/:id", SuppliersController.getPurchaseOrderById);
router.post(
  "/orders",
  validateRequest({ body: createPurchaseOrderSchema }),
  SuppliersController.createPurchaseOrder
);
router.patch(
  "/orders/:id/status",
  validateRequest({ body: updatePurchaseOrderStatusSchema }),
  SuppliersController.updatePurchaseOrderStatus
);
router.delete("/orders/:id", SuppliersController.deletePurchaseOrder);

// Suppliers Routes
router.get(
  "/",
  validateRequest({ query: supplierQuerySchema }),
  SuppliersController.getSuppliers
);
router.get("/:id", SuppliersController.getSupplierById);
router.post(
  "/",
  validateRequest({ body: createSupplierSchema }),
  SuppliersController.createSupplier
);
router.put(
  "/:id",
  validateRequest({ body: updateSupplierSchema }),
  SuppliersController.updateSupplier
);
router.delete("/:id", SuppliersController.deleteSupplier);

export default router;
