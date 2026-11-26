import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { patientProfile, users } from "../db/schema.js";

export async function findAll() {
  return db
    .select({
      id: patientProfile.id,
      userId: patientProfile.userId,
      dateOfBirth: patientProfile.dateOfBirth,
      gender: patientProfile.gender,
      bloodType: patientProfile.bloodType,
      phone: patientProfile.phone,
      address: patientProfile.address,
      medicalAidNumber: patientProfile.medicalAidNumber,
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as("name"),
      email: users.email,
    })
    .from(patientProfile)
    .innerJoin(users, eq(patientProfile.userId, users.id));
}

export async function findByUserId(userId: string) {
  const [row] = await db
    .select({
      id: patientProfile.id,
      userId: patientProfile.userId,
      dateOfBirth: patientProfile.dateOfBirth,
      gender: patientProfile.gender,
      bloodType: patientProfile.bloodType,
      phone: patientProfile.phone,
      address: patientProfile.address,
      emergencyContactName: patientProfile.emergencyContactName,
      emergencyContactPhone: patientProfile.emergencyContactPhone,
      medicalAidNumber: patientProfile.medicalAidNumber,
      createdAt: patientProfile.createdAt,
      updatedAt: patientProfile.updatedAt,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as("name"),
    })
    .from(patientProfile)
    .innerJoin(users, eq(patientProfile.userId, users.id))
    .where(eq(patientProfile.userId, userId));
  return row ?? null;
}

export async function upsert(
  userId: string,
  data: {
    dateOfBirth?: string | Date | null;
    gender?: string | null;
    bloodType?: string | null;
    phone?: string | null;
    address?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    medicalAidNumber?: string | null;
  }
) {
  const existing = await findByUserId(userId);
  const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : null;

  if (existing) {
    await db
      .update(patientProfile)
      .set({
        dateOfBirth: dob ?? existing.dateOfBirth,
        gender: data.gender ?? existing.gender,
        bloodType: data.bloodType ?? existing.bloodType,
        phone: data.phone ?? existing.phone,
        address: data.address ?? existing.address,
        emergencyContactName:
          data.emergencyContactName ?? existing.emergencyContactName,
        emergencyContactPhone:
          data.emergencyContactPhone ?? existing.emergencyContactPhone,
        medicalAidNumber: data.medicalAidNumber ?? existing.medicalAidNumber,
        updatedAt: new Date(),
      })
      .where(eq(patientProfile.userId, userId));
    return findByUserId(userId);
  }

  await db.insert(patientProfile).values({
    id: userId,
    userId,
    dateOfBirth: dob,
    gender: data.gender ?? null,
    bloodType: data.bloodType ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    emergencyContactName: data.emergencyContactName ?? null,
    emergencyContactPhone: data.emergencyContactPhone ?? null,
    medicalAidNumber: data.medicalAidNumber ?? null,
  });
  return findByUserId(userId);
}
