import { Router } from "express";
import * as DepartmentController from "../controllers/department.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../dto/department.dto.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(CreateDepartmentDto),
  DepartmentController.create
);

router.get("/:id", requireAuth, DepartmentController.getById);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(UpdateDepartmentDto),
  DepartmentController.update
);

export default router;
