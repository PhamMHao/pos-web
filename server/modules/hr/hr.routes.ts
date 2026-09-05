import { Router } from "express";
import { HrController } from "./hr.controller";
import { KpiController } from "./kpi.controller";
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

// KPI Evaluations
router.get("/kpi-evaluations", KpiController.getEvaluations);
router.get("/kpi-evaluations/:id", KpiController.getEvaluationById);
router.post("/kpi-evaluations", KpiController.createEvaluation);
router.put("/kpi-evaluations/:id", KpiController.updateEvaluation);
router.post("/kpi-evaluations/:id/approve", KpiController.approveEvaluation);
router.post("/kpi-evaluations/batch-approve", KpiController.batchApprove);
router.post("/kpi-evaluations/seed", KpiController.seedEvaluations);

export default router;
