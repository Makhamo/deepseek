import type { Request, Response } from "express";
import * as OrgModel from "../models/organization.model.js";

export async function list(_req: Request, res: Response) {
  try {
    const organizations = await OrgModel.findAll();
    res.json({ organizations });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list organizations" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const row = await OrgModel.findById(req.params.id);
    if (!row) return res.status(404).json({ error: "Organization not found" });
    res.json({ organization: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get organization" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, slug, logo, metadata } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "name and slug are required" });
    }
    const created = await OrgModel.create({ name, slug, logo, metadata });
    res.status(201).json({ organization: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create organization" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const updated = await OrgModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Organization not found" });
    res.json({ organization: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update organization" });
  }
}

export async function listMembers(req: Request, res: Response) {
  try {
    const members = await OrgModel.findMembers(req.params.id);
    res.json({ members });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list members" });
  }
}

export async function listDepartments(req: Request, res: Response) {
  try {
    const departments = await OrgModel.findDepartments(req.params.id);
    res.json({ departments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list departments" });
  }
}
