import { Router } from "express";
import { WarrantiesController } from "./warranties.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createWarrantyTicketSchema,
  updateWarrantyTicketSchema,
  warrantyTicketQuerySchema,
  createSerialDeviceRecordSchema,
  serialDeviceQuerySchema,
} from "./warranties.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

// Warranty Tickets
router.get(
  "/tickets",
  validateRequest({ query: warrantyTicketQuerySchema }),
  WarrantiesController.getWarrantyTickets
);
router.get("/tickets/:id", WarrantiesController.getWarrantyTicketById);
router.post(
  "/tickets",
  authenticate,
  validateRequest({ body: createWarrantyTicketSchema }),
  WarrantiesController.createWarrantyTicket
);
router.put(
  "/tickets/:id",
  authenticate,
  validateRequest({ body: updateWarrantyTicketSchema }),
  WarrantiesController.updateWarrantyTicket
);
router.delete("/tickets/:id", authenticate, WarrantiesController.deleteWarrantyTicket);

// Serial Device Records
router.get(
  "/devices",
  validateRequest({ query: serialDeviceQuerySchema }),
  WarrantiesController.getSerialDevices
);
router.get("/devices/:serial", WarrantiesController.getSerialDeviceByCode);
router.post(
  "/devices",
  authenticate,
  validateRequest({ body: createSerialDeviceRecordSchema }),
  WarrantiesController.createOrUpdateSerialDevice
);

export default router;
