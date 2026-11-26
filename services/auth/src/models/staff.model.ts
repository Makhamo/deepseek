import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { staffProfile, users } from "../db/schema.js";
import { sql } from "drizzle-orm";

export async function findAll() {
  return db
    .select({
      id: staffProfile.id,
      userId: staffProfile.userId,
      organizationId: staffProfile.organizationId,
      departmentId: staffProfile.departmentId,
      specialty: staffProfile.specialty,
      licenseNumber: staffProfile.licenseNumber,
      title: staffProfile.title,
      phone: staffProfile.phone,
      isActive: staffProfile.isActive,
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as("name"),
      email: users.email,
      role: sql<string>`'staff'`.as("role"),
    })
    .from(staffProfile)
    .innerJoin(users, eq(staffProfile.userId, users.id));
}

export async function findByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(staffProfile)
    .where(eq(staffProfile.userId, userId));
  return row ?? null;
}

export async function upsert(data: {
  userId: string;
  organizationId?: string | null;
  departmentId?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  title?: string | null;
  phone?: string | null;
}) {
  const existing = await findByUserId(data.userId);

  if (existing) {
    await db
      .update(staffProfile)
      .set({
        organizationId: data.organizationId ?? existing.organizationId,
        departmentId: data.departmentId ?? existing.departmentId,
        specialty: data.specialty ?? existing.specialty,
        licenseNumber: data.licenseNumber ?? existing.licenseNumber,
        title: data.title ?? existing.title,
        phone: data.phone ?? existing.phone,
        updatedAt: new Date(),
      })
      .where(eq(staffProfile.userId, data.userId));
    return findByUserId(data.userId);
  }

  await db.insert(staffProfile).values({
    id: data.userId,
    userId: data.userId,
    organizationId: data.organizationId ?? null,
    departmentId: data.departmentId ?? null,
    specialty: data.specialty ?? null,
    licenseNumber: data.licenseNumber ?? null,
    title: data.title ?? null,
    phone: data.phone ?? null,
  });
  return findByUserId(data.userId);
}
