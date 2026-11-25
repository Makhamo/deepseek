import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { serviceRegistry } from "../db/schema.js";

export async function findAll() {
  return db.select().from(serviceRegistry).where(eq(serviceRegistry.isActive, true));
}

export async function findByKey(key: string) {
  const [row] = await db
    .select()
    .from(serviceRegistry)
    .where(eq(serviceRegistry.key, key));
  return row ?? null;
}

export async function upsert(data: {
  key: string;
  name: string;
  baseUrl?: string | null;
  description?: string | null;
}) {
  const existing = await findByKey(data.key);
  if (existing) {
    await db
      .update(serviceRegistry)
      .set({
        name: data.name,
        baseUrl: data.baseUrl ?? existing.baseUrl,
        description: data.description ?? existing.description,
        updatedAt: new Date(),
      })
      .where(eq(serviceRegistry.key, data.key));
    return findByKey(data.key);
  }
  const id = randomUUID();
  await db.insert(serviceRegistry).values({
    id,
    key: data.key,
    name: data.name,
    baseUrl: data.baseUrl ?? null,
    description: data.description ?? null,
  });
  return findByKey(data.key);
}

export async function seedRegistry() {
  const services = [
    {
      key: "auth",
      name: "Auth Hub",
      description: "Central identity, roles, permissions, organizations",
    },
    {
      key: "appointment",
      name: "Book Appointment",
      description: "Scheduling and appointments",
    },
    {
      key: "lab",
      name: "Laboratory",
      description: "Lab orders and results",
    },
    {
      key: "pharmacy",
      name: "Pharmacy",
      description: "Prescriptions, dispensing, inventory",
    },
    {
      key: "nice",
      name: "NICE",
      description: "Clinical notes and care pathways",
    },
    {
      key: "triage",
      name: "Triage",
      description: "Triage assessments and queue",
    },
    {
      key: "claims",
      name: "Claims",
      description: "Medical aid / insurance claims",
    },
  ];

  const created: string[] = [];
  for (const s of services) {
    const before = await findByKey(s.key);
    await upsert(s);
    if (!before) created.push(s.key);
  }
  return { seeded: created };
}
