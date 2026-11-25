import type { Request, Response } from "express";
import * as PatientModel from "../models/patient.model.js";

export async function list(_req: Request, res: Response) {
  try {
    const patients = await PatientModel.findAll();
    res.json({ patients });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list patients" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const row = await PatientModel.findByUserId(req.user!.id);
    if (!row) return res.status(404).json({ error: "Patient profile not found" });
    res.json({ patientProfile: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get profile" });
  }
}

export async function upsertMe(req: Request, res: Response) {
  try {
    const profile = await PatientModel.upsert(req.user!.id, req.body);
    res.status(201).json({ patientProfile: profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save patient profile" });
  }
}
