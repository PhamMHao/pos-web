import { Router } from "express";
import { ProductsController } from "./products.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  bulkImportProductSchema,
} from "./products.schema";
import { authenticate, requireRole } from "../../core/middlewares/authMiddleware";

const router = Router();

// Public / Authenticated read routes
router.get("/", validateRequest({ query: productQuerySchema }), ProductsController.getProducts);
router.get("/categories/list", ProductsController.getCategories);
router.get("/barcode/:code", ProductsController.getProductByBarcode);
router.get("/:id", ProductsController.getProductById);

// Write routes (Require Auth or Role)
router.post(
  "/",
  authenticate,
  requireRole(["admin", "manager", "warehouse"]),
  validateRequest({ body: createProductSchema }),
  ProductsController.createProduct
);

router.put(
  "/:id",
  authenticate,
  requireRole(["admin", "manager", "warehouse"]),
  validateRequest({ body: updateProductSchema }),
  ProductsController.updateProduct
);

router.delete(
  "/:id",
  authenticate,
  requireRole(["admin", "manager"]),
  ProductsController.deleteProduct
);

router.post(
  "/bulk-import",
  authenticate,
  requireRole(["admin", "manager", "warehouse"]),
  validateRequest({ body: bulkImportProductSchema }),
  ProductsController.bulkImport
);

export default router;
