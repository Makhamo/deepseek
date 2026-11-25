import { Router } from "express";
import * as StaffController from "../controllers/staff.controller.js";
import { requireAuth, requireAdmin, requireStaff } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { UpsertStaffDto } from "../dto/staff.dto.js";

const router = Router();

router.get("/", requireAuth, requireStaff, StaffController.list);
router.get("/user/:userId", requireAuth, StaffController.getByUserId);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(UpsertStaffDto),
  StaffController.upsert
);

export default router;
