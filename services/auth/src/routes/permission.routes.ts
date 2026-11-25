import { Router } from "express";
import * as PermissionController from "../controllers/permission.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  CreatePermissionDto,
  AssignPermissionDto,
} from "../dto/permission.dto.js";

const router = Router();

router.get("/", requireAuth, PermissionController.list);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(CreatePermissionDto),
  PermissionController.create
);

router.get("/role/:role", requireAuth, PermissionController.listByRole);

router.post(
  "/role/:role",
  requireAuth,
  requireAdmin,
  validate(AssignPermissionDto),
  PermissionController.assignToRole
);

router.post("/seed", requireAuth, requireAdmin, PermissionController.seed);

export default router;
