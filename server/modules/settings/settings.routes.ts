import { Router } from "express";
import { SettingsController } from "./settings.controller";

const router = Router();

router.get("/", SettingsController.getSettings);
router.put("/", SettingsController.updateSettings);

// Data Management Endpoints
router.get("/backup", SettingsController.backupDatabase);
router.post("/backup", SettingsController.backupDatabase);
router.post("/restore", SettingsController.restoreDatabase);
router.post("/wipe-data", SettingsController.wipeAllData);

export default router;

