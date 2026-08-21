import { Router } from "express";
import {
  testDbConnectionHandler,
  saveDbConnectionHandler,
  getDbStatusHandler,
} from "./setup.controller";

const router = Router();

router.post("/test-db", testDbConnectionHandler);
router.post("/save-db", saveDbConnectionHandler);
router.get("/db-status", getDbStatusHandler);

export default router;
