import { Router } from "express";
import { SignaturesController } from "./signatures.controller";

const router = Router();

router.get("/pending-documents", SignaturesController.getSignableDocuments);
router.post("/batch-sign", SignaturesController.batchSign);
router.get("/gateways", SignaturesController.getCaGateways);
router.put("/gateways/:provider", SignaturesController.updateCaGateway);

export default router;
