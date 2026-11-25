import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { organization, member, department, user } from "../db/schema.js";

export async function findAll() {
  return db.select().from(organization);
}

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, id));
  return row ?? null;
}

export async function create(data: {
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: unknown;
}) {
  const id = randomUUID();
  await db.insert(organization).values({
    id,
    name: data.name,
    slug: data.slug,
    logo: data.logo ?? null,
    metadata: data.metadata
      ? typeof data.metadata === "string"
        ? data.metadata
        : JSON.stringify(data.metadata)
      : null,
  });
  return findById(id);
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    logo: string | null;
    metadata: unknown;
  }>
) {
  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.slug !== undefined) set.slug = data.slug;
  if (data.logo !== undefined) set.logo = data.logo;
  if (data.metadata !== undefined) {
    set.metadata =
      typeof data.metadata === "string"
        ? data.metadata
        : JSON.stringify(data.metadata);
  }
  await db.update(organization).set(set).where(eq(organization.id, id));
  return findById(id);
}

export async function findMembers(orgId: string) {
  return db
    .select({
      memberId: member.id,
      role: member.role,
      joinedAt: member.createdAt,
      userId: user.id,
      name: user.name,
      email: user.email,
      userRole: user.role,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, orgId));
}

export async function findDepartments(orgId: string) {
  return db
    .select()
    .from(department)
    .where(eq(department.organizationId, orgId));
}
