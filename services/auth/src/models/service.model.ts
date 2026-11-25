import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { service, organizationService } from "../db/schema.js";

export async function findAllActive() {
  return db.select().from(service).where(eq(service.isActive, true));
}

export async function findById(id: string) {
  const [row] = await db.select().from(service).where(eq(service.id, id));
  return row ?? null;
}

export async function create(data: {
  name: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
}) {
  const id = randomUUID();
  await db.insert(service).values({
    id,
    name: data.name,
    code: data.code ?? null,
    description: data.description ?? null,
    category: data.category ?? null,
  });
  return findById(id);
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    code: string | null;
    description: string | null;
    category: string | null;
    isActive: boolean;
  }>
) {
  await db
    .update(service)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(service.id, id));
  return findById(id);
}

export async function linkToOrganization(data: {
  organizationId: string;
  serviceId: string;
  price?: string | null;
  currency?: string;
  isAvailable?: boolean;
}) {
  const id = randomUUID();
  await db.insert(organizationService).values({
    id,
    organizationId: data.organizationId,
    serviceId: data.serviceId,
    price: data.price ?? null,
    currency: data.currency || "ZAR",
    isAvailable: data.isAvailable !== false,
  });
  const [row] = await db
    .select()
    .from(organizationService)
    .where(eq(organizationService.id, id));
  return row;
}

export async function findByOrganization(orgId: string) {
  return db
    .select({
      id: organizationService.id,
      price: organizationService.price,
      currency: organizationService.currency,
      isAvailable: organizationService.isAvailable,
      serviceId: service.id,
      name: service.name,
      code: service.code,
      category: service.category,
      description: service.description,
    })
    .from(organizationService)
    .innerJoin(service, eq(organizationService.serviceId, service.id))
    .where(eq(organizationService.organizationId, orgId));
}
