import type { Request, Response } from "express";
import * as PermissionModel from "../models/permission.model.js";

export async function list(_req: Request, res: Response) {
  try {
    const permissions = await PermissionModel.findAll();
    res.json({ permissions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list permissions" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { key, name, description } = req.body;
    if (!key || !name) {
      return res.status(400).json({ error: "key and name are required" });
    }
    const created = await PermissionModel.create({ key, name, description });
    res.status(201).json({ permission: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create permission" });
  }
}

export async function listByRole(req: Request, res: Response) {
  try {
    const permissions = await PermissionModel.findByRole(req.params.role);
    res.json({ role: req.params.role, permissions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list role permissions" });
  }
}

export async function assignToRole(req: Request, res: Response) {
  try {
    const { permissionId } = req.body;
    if (!permissionId) {
      return res.status(400).json({ error: "permissionId is required" });
    }
    const result = await PermissionModel.assignToRole(
      req.params.role,
      permissionId
    );
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to assign permission" });
  }
}

export async function seed(_req: Request, res: Response) {
  try {
    const result = await PermissionModel.seedDefaults();
    res.json({ ...result, message: "Default permissions ready" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to seed permissions" });
  }
}
