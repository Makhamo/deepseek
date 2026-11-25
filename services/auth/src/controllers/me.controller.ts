import type { Request, Response } from "express";
import * as PermissionModel from "../models/permission.model.js";
import * as StaffModel from "../models/staff.model.js";
import * as PatientModel from "../models/patient.model.js";

/**
 * Unified identity payload for all microservices.
 * Other services call this (or trust JWT) to know what the user can do.
 */
export async function getAccess(req: Request, res: Response) {
  try {
    const user = req.user!;
    const role = (user.role || "patient").toLowerCase();
    const permissions = await PermissionModel.findByRole(role);
    const keys = permissions.map((p) => p.key);

    // Group by service for portals
    const byService: Record<string, string[]> = {};
    for (const p of permissions) {
      const sk = p.serviceKey || "auth";
      if (!byService[sk]) byService[sk] = [];
      byService[sk].push(p.key);
    }

    const staffProfile =
      role !== "patient" ? await StaffModel.findByUserId(user.id) : null;
    const patientProfile =
      role === "patient" ? await PatientModel.findByUserId(user.id) : null;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
      permissions: keys,
      services: byService,
      staffProfile,
      patientProfile,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to resolve access" });
  }
}

export async function checkPermission(req: Request, res: Response) {
  try {
    const needed = String(req.query.permission || req.body?.permission || "");
    if (!needed) {
      return res.status(400).json({ error: "permission query/body required" });
    }
    const role = (req.user?.role || "patient").toLowerCase();
    const permissions = await PermissionModel.findByRole(role);
    const allowed = permissions.some((p) => p.key === needed);
    res.json({ permission: needed, allowed, role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to check permission" });
  }
}
