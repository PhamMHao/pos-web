import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../core/middlewares/validateRequest";
import { loginSchema, registerSchema, changePasswordSchema } from "./auth.schema";
import { authenticate, requireRole } from "../../core/middlewares/authMiddleware";

const router = Router();

// Public routes
router.post("/login", validateRequest({ body: loginSchema }), AuthController.login);
router.post("/register", validateRequest({ body: registerSchema }), AuthController.register);

// Protected routes
router.get("/me", authenticate, AuthController.getMe);
router.post("/change-password", authenticate, validateRequest({ body: changePasswordSchema }), AuthController.changePassword);

// Admin only routes
router.get("/users", authenticate, requireRole(["admin"]), AuthController.listUsers);

export default router;
