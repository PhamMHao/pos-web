import { Router } from "express";
import { ProjectsController } from "./projects.controller";

const router = Router();

// 1. Tasks
router.get("/tasks", ProjectsController.getTasks);
router.get("/tasks/list", ProjectsController.getTasks);
router.post("/tasks", ProjectsController.createTask);
router.put("/tasks/:id", ProjectsController.updateTask);
router.delete("/tasks/:id", ProjectsController.deleteTask);
router.put("/tasks/:id/steps", ProjectsController.updateTaskSteps);
router.post("/tasks/:id/submit-review", ProjectsController.submitTaskForReview);
router.post("/tasks/:id/resubmit", ProjectsController.resubmitTaskAfterRework);
router.post("/tasks/:id/progress", ProjectsController.addProgressLog);
router.post("/tasks/:id/approve", ProjectsController.approveTask);
router.post("/tasks/:id/accept", ProjectsController.acceptTask);
router.post("/tasks/:id/reassign", ProjectsController.reassignTask);
router.post("/tasks/:id/block", ProjectsController.blockTask);
router.post("/tasks/:id/unblock", ProjectsController.unblockTask);
router.post("/tasks/:id/materials", ProjectsController.addTaskMaterialDemand);
router.delete("/tasks/:id/materials/:materialId", ProjectsController.deleteTaskMaterialDemand);
router.post("/tasks/:id/borrow-from-bom", ProjectsController.borrowMaterialsFromBom);
router.post("/tasks/:id/dependencies", ProjectsController.addTaskDependency);
router.delete("/tasks/dependencies/:depId", ProjectsController.deleteTaskDependency);

// 2. Materials
router.get("/materials/tickets", ProjectsController.getMaterialTickets);
router.post("/materials/tickets", ProjectsController.createMaterialTicket);
router.post("/materials/tickets/:id/return", ProjectsController.returnMaterials);
router.post("/materials/tickets/:id/convert-to-order", ProjectsController.convertInstalledMaterialsToOrder);

// 3. Projects Root & Parametric routes
router.get("/", ProjectsController.getAllProjects);
router.post("/", ProjectsController.createProject);
router.get("/export", ProjectsController.exportData);
router.post("/restore", ProjectsController.restoreData);
router.get("/:id", ProjectsController.getProjectById);
router.put("/:id", ProjectsController.updateProject);
router.delete("/:id", ProjectsController.deleteProject);

// ERP Extensions (CBS, Gantt, PO, Billing, Site Diary, VO)
router.post("/:id/budget-items", ProjectsController.addBudgetItem);
router.delete("/:id/budget-items/:itemId", ProjectsController.deleteBudgetItem);
router.post("/:id/actual-expenses", ProjectsController.addActualExpense);
router.post("/:id/create-po-from-demands", ProjectsController.createPoFromDemands);
router.post("/:id/billing-milestones", ProjectsController.addBillingMilestone);
router.put("/:id/billing-milestones/:milestoneId", ProjectsController.updateBillingMilestone);
router.post("/:id/handover-certificates", ProjectsController.addHandoverCertificate);
router.post("/:id/site-diaries", ProjectsController.addDailySiteDiary);
router.post("/:id/variation-orders", ProjectsController.addVariationOrder);
router.put("/:id/variation-orders/:voId/approve", ProjectsController.approveVariationOrder);

export default router;
