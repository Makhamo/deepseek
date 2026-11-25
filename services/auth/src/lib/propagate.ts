// src/lib/propagate.ts
const SERVICE_KEYS = [
  "lab",
  "appointment",
  "nice",
  "triage",
  "claims",
  "pharmacy",
] as const;

type ServiceKey = (typeof SERVICE_KEYS)[number];

/**
 * Called after a user is created (or updated). Each downstream service
 * exposes POST /internal/users/sync that upserts { id, email, name, role }.
 * The call is fire-and-forget: failures are logged, not fatal.
 */
export async function propagateUserToServices(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}) {
  const registryUrl = process.env.SERVICE_REGISTRY_URL; // e.g. http://localhost:4001/api/registry
  // For now, use env vars directly per service (simpler than DB lookup)
  const urls: Record<ServiceKey, string | undefined> = {
    lab: process.env.LAB_SERVICE_URL,
    appointment: process.env.APPOINTMENT_SERVICE_URL,
    nice: process.env.NICE_SERVICE_URL,
    triage: process.env.TRIAGE_SERVICE_URL,
    claims: process.env.CLAIMS_SERVICE_URL,
    pharmacy: process.env.PHARMACY_SERVICE_URL,
  };

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  await Promise.allSettled(
    (Object.keys(urls) as ServiceKey[]).map(async (key) => {
      const base = urls[key];
      if (!base) return;
      try {
        const res = await fetch(`${base}/internal/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Shared secret so downstream services trust the call
            "X-Internal-Secret": process.env.INTERNAL_SERVICE_SECRET || "",
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.warn(`[propagate] ${key} responded ${res.status}`);
        }
      } catch (err) {
        console.warn(`[propagate] ${key} unreachable:`, (err as Error).message);
      }
    })
  );
}