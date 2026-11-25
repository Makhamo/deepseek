import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { permission, rolePermission } from "../db/schema.js";

export async function findAll() {
  return db.select().from(permission);
}

export async function findById(id: string) {
  const [row] = await db
    .select()
    .from(permission)
    .where(eq(permission.id, id));
  return row ?? null;
}

export async function findByKey(key: string) {
  const [row] = await db
    .select()
    .from(permission)
    .where(eq(permission.key, key));
  return row ?? null;
}

export async function create(data: {
  key: string;
  name: string;
  description?: string | null;
  serviceKey?: string | null;
}) {
  const id = randomUUID();
  await db.insert(permission).values({
    id,
    key: data.key,
    name: data.name,
    description: data.description ?? null,
    serviceKey: data.serviceKey ?? null,
  });
  return findById(id);
}

export async function findByRole(role: string) {
  return db
    .select({
      id: permission.id,
      key: permission.key,
      name: permission.name,
      description: permission.description,
      serviceKey: permission.serviceKey,
    })
    .from(rolePermission)
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(eq(rolePermission.role, role.toLowerCase()));
}

export async function assignToRole(role: string, permissionId: string) {
  const id = randomUUID();
  await db.insert(rolePermission).values({
    id,
    role: role.toLowerCase(),
    permissionId,
  });
  return { id, role: role.toLowerCase(), permissionId };
}

/** Full healthcare multi-service permission catalog + role matrix */
export async function seedDefaults() {
  const catalog: Array<{
    key: string;
    name: string;
    serviceKey: string;
  }> = [
    // Auth / platform
    { key: "auth:session", name: "Use session", serviceKey: "auth" },
    { key: "auth:admin", name: "Admin console", serviceKey: "auth" },

    // Appointment
    { key: "appointment:read", name: "View appointments", serviceKey: "appointment" },
    { key: "appointment:book", name: "Book appointments", serviceKey: "appointment" },
    { key: "appointment:manage", name: "Manage all appointments", serviceKey: "appointment" },
    { key: "appointment:cancel", name: "Cancel appointments", serviceKey: "appointment" },

    // Lab
    { key: "lab:orders:read", name: "View lab orders", serviceKey: "lab" },
    { key: "lab:orders:create", name: "Create lab orders", serviceKey: "lab" },
    { key: "lab:results:read", name: "View lab results", serviceKey: "lab" },
    { key: "lab:results:write", name: "Enter lab results", serviceKey: "lab" },

    // Pharmacy
    { key: "pharmacy:prescriptions:read", name: "View prescriptions", serviceKey: "pharmacy" },
    { key: "pharmacy:prescriptions:write", name: "Write prescriptions", serviceKey: "pharmacy" },
    { key: "pharmacy:dispense", name: "Dispense medication", serviceKey: "pharmacy" },
    { key: "pharmacy:inventory", name: "Manage pharmacy inventory", serviceKey: "pharmacy" },

    // NICE (clinical / NICU notes & care)
    { key: "nice:read", name: "View clinical notes", serviceKey: "nice" },
    { key: "nice:write", name: "Write clinical notes", serviceKey: "nice" },
    { key: "nice:manage", name: "Manage NICE records", serviceKey: "nice" },

    // Triage
    { key: "triage:read", name: "View triage cases", serviceKey: "triage" },
    { key: "triage:assess", name: "Perform triage assessment", serviceKey: "triage" },
    { key: "triage:manage", name: "Manage triage queue", serviceKey: "triage" },

    // Claims
    { key: "claims:read", name: "View claims", serviceKey: "claims" },
    { key: "claims:submit", name: "Submit claims", serviceKey: "claims" },
    { key: "claims:manage", name: "Manage claims workflow", serviceKey: "claims" },

    // Patients (cross-cutting)
    { key: "patients:read", name: "View patients", serviceKey: "auth" },
    { key: "patients:write", name: "Update patient demographics", serviceKey: "auth" },
    { key: "patients:self", name: "Manage own patient profile", serviceKey: "auth" },

    // Staff / org
    { key: "staff:read", name: "View staff", serviceKey: "auth" },
    { key: "staff:write", name: "Manage staff", serviceKey: "auth" },
    { key: "organizations:read", name: "View organizations", serviceKey: "auth" },
    { key: "organizations:write", name: "Manage organizations", serviceKey: "auth" },
    { key: "services:read", name: "View service catalog", serviceKey: "auth" },
    { key: "services:write", name: "Manage service catalog", serviceKey: "auth" },
  ];

  const created: string[] = [];
  for (const p of catalog) {
    const existing = await findByKey(p.key);
    if (!existing) {
      await create(p);
      created.push(p.key);
    }
  }

  const allPerms = await findAll();
  const byKey = Object.fromEntries(allPerms.map((p) => [p.key, p.id]));

  const roleMap: Record<string, string[]> = {
    patient: [
      "auth:session",
      "patients:self",
      "appointment:read",
      "appointment:book",
      "appointment:cancel",
      "lab:results:read",
      "pharmacy:prescriptions:read",
      "claims:read",
      "claims:submit",
      "services:read",
    ],
    doctor: [
      "auth:session",
      "patients:read",
      "patients:write",
      "appointment:read",
      "appointment:book",
      "appointment:manage",
      "appointment:cancel",
      "lab:orders:read",
      "lab:orders:create",
      "lab:results:read",
      "pharmacy:prescriptions:read",
      "pharmacy:prescriptions:write",
      "nice:read",
      "nice:write",
      "triage:read",
      "triage:assess",
      "claims:read",
      "claims:submit",
      "services:read",
      "staff:read",
      "organizations:read",
    ],
    nurse: [
      "auth:session",
      "patients:read",
      "patients:write",
      "appointment:read",
      "appointment:book",
      "lab:orders:read",
      "lab:results:read",
      "pharmacy:prescriptions:read",
      "nice:read",
      "nice:write",
      "triage:read",
      "triage:assess",
      "triage:manage",
      "services:read",
    ],
    pharmacist: [
      "auth:session",
      "patients:read",
      "pharmacy:prescriptions:read",
      "pharmacy:prescriptions:write",
      "pharmacy:dispense",
      "pharmacy:inventory",
      "services:read",
    ],
    labtech: [
      "auth:session",
      "patients:read",
      "lab:orders:read",
      "lab:results:read",
      "lab:results:write",
      "services:read",
    ],
    admin: Object.keys(byKey),
    superadmin: Object.keys(byKey),
  };

  for (const [role, keys] of Object.entries(roleMap)) {
    const existingForRole = await db
      .select()
      .from(rolePermission)
      .where(eq(rolePermission.role, role));
    const existingIds = new Set(existingForRole.map((r) => r.permissionId));

    for (const key of keys) {
      const permissionId = byKey[key];
      if (!permissionId || existingIds.has(permissionId)) continue;
      await assignToRole(role, permissionId);
    }
  }

  return { seeded: created, roles: Object.keys(roleMap) };
}
