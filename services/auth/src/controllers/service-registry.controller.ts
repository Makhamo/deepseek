import type { Request, Response } from "express";
import * as RegistryModel from "../models/service-registry.model.js";

export async function list(_req: Request, res: Response) {
  try {
    const services = await RegistryModel.findAll();
    res.json({ services });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list services" });
  }
}

export async function seed(_req: Request, res: Response) {
  try {
    const result = await RegistryModel.seedRegistry();
    res.json({ ...result, message: "Service registry ready" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to seed service registry" });
  }
}
