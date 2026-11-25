import { Router } from "express";
import * as PatientController from "../controllers/patient.controller.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { UpsertPatientDto } from "../dto/patient.dto.js";

const router = Router();

router.get("/", requireAuth, requireStaff, PatientController.list);
router.get("/me", requireAuth, PatientController.getMe);

router.post(
  "/me",
  requireAuth,
  validate(UpsertPatientDto),
  PatientController.upsertMe
);

export default router;
