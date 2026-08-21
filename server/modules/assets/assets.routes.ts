import { Router } from "express";
import { AssetsController } from "./assets.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createEnterpriseAssetSchema,
  updateEnterpriseAssetSchema,
  enterpriseAssetQuerySchema,
} from "./assets.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

router.get("/", validateRequest({ query: enterpriseAssetQuerySchema }), AssetsController.getAssets);
router.get("/:id", AssetsController.getAssetById);
router.post(
  "/",
  authenticate,
  validateRequest({ body: createEnterpriseAssetSchema }),
  AssetsController.createAsset
);
router.put(
  "/:id",
  authenticate,
  validateRequest({ body: updateEnterpriseAssetSchema }),
  AssetsController.updateAsset
);
router.delete("/:id", authenticate, AssetsController.deleteAsset);

export default router;
