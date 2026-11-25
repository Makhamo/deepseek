import { Router } from "express";
import * as RegistryController from "../controllers/service-registry.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, RegistryController.list);
router.post("/seed", requireAuth, requireAdmin, RegistryController.seed);

export default router;
