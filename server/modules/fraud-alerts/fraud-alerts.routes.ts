import { Router } from "express";
import { FraudAlertsController } from "./fraud-alerts.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createFraudAlertSchema,
  updateFraudAlertSchema,
  fraudAlertQuerySchema,
} from "./fraud-alerts.schema";

const router = Router();

router.get("/", validateRequest({ query: fraudAlertQuerySchema }), FraudAlertsController.getAlerts);
router.get("/:id", FraudAlertsController.getAlertById);
router.post(
  "/",
  validateRequest({ body: createFraudAlertSchema }),
  FraudAlertsController.createAlert
);
router.put(
  "/:id",
  validateRequest({ body: updateFraudAlertSchema }),
  FraudAlertsController.updateAlert
);
router.patch("/:id/resolve", FraudAlertsController.resolveAlert);
router.delete("/:id", FraudAlertsController.deleteAlert);

export default router;
