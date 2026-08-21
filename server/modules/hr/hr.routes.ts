import { Router } from "express";
import { HrController } from "./hr.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  createLaborContractSchema,
  updateLaborContractSchema,
  laborContractQuerySchema,
} from "./hr.schema";
import { authenticate } from "../../core/middlewares/authMiddleware";

const router = Router();

// Employees
router.get("/employees", validateRequest({ query: employeeQuerySchema }), HrController.getEmployees);
router.get("/employees/:id", HrController.getEmployeeById);
router.post(
  "/employees",
  authenticate,
  validateRequest({ body: createEmployeeSchema }),
  HrController.createEmployee
);
router.put(
  "/employees/:id",
  authenticate,
  validateRequest({ body: updateEmployeeSchema }),
  HrController.updateEmployee
);
router.delete("/employees/:id", authenticate, HrController.deleteEmployee);

// Labor Contracts
router.get(
  "/contracts",
  validateRequest({ query: laborContractQuerySchema }),
  HrController.getLaborContracts
);
router.get("/contracts/:id", HrController.getLaborContractById);
router.post(
  "/contracts",
  authenticate,
  validateRequest({ body: createLaborContractSchema }),
  HrController.createLaborContract
);
router.put(
  "/contracts/:id",
  authenticate,
  validateRequest({ body: updateLaborContractSchema }),
  HrController.updateLaborContract
);
router.delete("/contracts/:id", authenticate, HrController.deleteLaborContract);

export default router;
