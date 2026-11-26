import type { Request, Response } from "express";
import { param } from "../lib/params.js";
import * as StaffModel from "../models/staff.model.js";

export async function list(_req: Request, res: Response) {
  try {
    const staff = await StaffModel.findAll();
    res.json({ staff });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list staff" });
  }
}

export async function getByUserId(req: Request, res: Response) {
  try {
    const row = await StaffModel.findByUserId(param(req, "userId"));
    if (!row) return res.status(404).json({ error: "Staff profile not found" });
    res.json({ staffProfile: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get staff profile" });
  }
}

export async function upsert(req: Request, res: Response) {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const profile = await StaffModel.upsert({ userId, ...rest });
    res.status(201).json({ staffProfile: profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save staff profile" });
  }
}
