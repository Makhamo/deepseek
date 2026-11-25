import type { Request, Response } from "express";
import * as ServiceModel from "../models/service.model.js";

export async function list(_req: Request, res: Response) {
  try {
    const services = await ServiceModel.findAllActive();
    res.json({ services });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list services" });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const row = await ServiceModel.findById(req.params.id);
    if (!row) return res.status(404).json({ error: "Service not found" });
    res.json({ service: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get service" });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, code, description, category } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const created = await ServiceModel.create({
      name,
      code,
      description,
      category,
    });
    res.status(201).json({ service: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create service" });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const updated = await ServiceModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Service not found" });
    res.json({ service: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update service" });
  }
}

export async function linkToOrg(req: Request, res: Response) {
  try {
    const row = await ServiceModel.linkToOrganization({
      serviceId: req.params.serviceId,
      organizationId: req.params.orgId,
      price: req.body.price,
      currency: req.body.currency,
      isAvailable: req.body.isAvailable,
    });
    res.status(201).json({ organizationService: row });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to link service to organization" });
  }
}

export async function listByOrg(req: Request, res: Response) {
  try {
    const services = await ServiceModel.findByOrganization(req.params.orgId);
    res.json({ services });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list organization services" });
  }
}
