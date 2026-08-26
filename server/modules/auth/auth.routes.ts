import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import { loginSchema, registerSchema, changePasswordSchema } from "./auth.schema";
import { authenticate, requireRole } from "../../core/middlewares/authMiddleware";

const router = Router();

// Public routes
router.post("/login", validateRequest({ body: loginSchema }), AuthController.login);
router.post("/register", validateRequest({ body: registerSchema }), AuthController.register);

// RBAC DB endpoints
router.get("/rbac/roles", AuthController.getRoles);
router.get("/rbac/modules", AuthController.getModules);
router.get("/rbac/matrix", AuthController.getMatrix);
router.put("/rbac/matrix", AuthController.saveMatrix);
router.post("/rbac/roles", AuthController.saveRole);
router.delete("/rbac/roles/:roleKey", AuthController.deleteRole);

// Protected routes
router.get("/me", authenticate, AuthController.getMe);
router.post("/change-password", authenticate, validateRequest({ body: changePasswordSchema }), AuthController.changePassword);

// Users management routes
router.get("/users", AuthController.listUsers);
router.put("/users/:id", AuthController.updateUser);
router.delete("/users/:id", AuthController.deleteUser);

export default router;
