import { Router } from "express";
import * as ServiceController from "../controllers/service.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  CreateServiceDto,
  UpdateServiceDto,
  LinkServiceToOrgDto,
} from "../dto/service.dto.js";

const router = Router();

router.get("/", requireAuth, ServiceController.list);
router.get("/organization/:orgId", requireAuth, ServiceController.listByOrg);
router.get("/:id", requireAuth, ServiceController.getById);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(CreateServiceDto),
  ServiceController.create
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(UpdateServiceDto),
  ServiceController.update
);

router.post(
  "/:serviceId/organizations/:orgId",
  requireAuth,
  requireAdmin,
  validate(LinkServiceToOrgDto),
  ServiceController.linkToOrg
);

export default router;
