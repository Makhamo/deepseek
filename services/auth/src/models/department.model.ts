import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { department } from "../db/schema.js";

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(department)
    .where(eq(department.id, id));
  return row ?? null;
}

export async function create(data: {
  organizationId: string;
  name: string;
  description?: string | null;
}) {
  const id = randomUUID();
  await db.insert(department).values({
    id,
    organizationId: data.organizationId,
    name: data.name,
    description: data.description ?? null,
  });
  return findById(id);
}

export async function update(
  id: string,
  data: Partial<{ name: string; description: string | null }>
) {
  await db
    .update(department)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(department.id, id));
  return findById(id);
}
