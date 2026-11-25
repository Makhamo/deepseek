import { Router } from "express";
import * as OrgController from "../controllers/organization.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "../dto/organization.dto.js";

const router = Router();

router.get("/", requireAuth, OrgController.list);
router.get("/:id", requireAuth, OrgController.getById);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(CreateOrganizationDto),
  OrgController.create
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(UpdateOrganizationDto),
  OrgController.update
);

router.get("/:id/members", requireAuth, OrgController.listMembers);
router.get("/:id/departments", requireAuth, OrgController.listDepartments);

export default router;
