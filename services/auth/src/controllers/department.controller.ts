import type { Request, Response } from "express";
import * as DepartmentModel from "../models/department.model.js";
import { param } from "../lib/params.js";

export async function create(req: Request, res: Response) {
  try {
    const { organizationId, name, description } = req.body;
    if (!organizationId || !name) {
      return res
        .status(400)
        .json({ error: "organizationId and name are required" });
    }
    const created = await DepartmentModel.create({
      organizationId,
      name,
      description,
    });
    res.status(201).json({ department: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create department" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const row = await DepartmentModel.findById(param(req, "id"));
    if (!row) return res.status(404).json({ error: "Department not found" });
    res.json({ department: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get department" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const updated = await DepartmentModel.update(param(req, "id"), req.body);
    if (!updated) return res.status(404).json({ error: "Department not found" });
    res.json({ department: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update department" });
  }
}
