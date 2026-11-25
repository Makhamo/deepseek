import { Router } from "express";
import * as MeController from "../controllers/me.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/access", requireAuth, MeController.getAccess);
router.get("/check", requireAuth, MeController.checkPermission);
router.post("/check", requireAuth, MeController.checkPermission);

export default router;
