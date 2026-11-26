import { Router } from "express";
import { requireAuth, requireStaff } from "../middleware/auth.js";
import { db, pool } from "../db/index.js";
import { users, user as userTable, organization, member, permission, rolePermission } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { auth } from "../auth.js";

const router = Router();

// List all users with role
router.get("/users", requireAuth, requireStaff, async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        status: users.status,
        role: userTable.role,
      })
      .from(users)
      .leftJoin(userTable, eq(users.id, userTable.id))
      .orderBy(users.createdAt);
    res.json({ users: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// List organizations
router.get("/organizations", requireAuth, requireStaff, async (_req, res) => {
  try {
    const rows = await db.select().from(organization);
    res.json({ organizations: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list organizations" });
  }
});

// List permissions
router.get("/permissions", requireAuth, requireStaff, async (_req, res) => {
  try {
    const rows = await db.select().from(permission);
    res.json({ permissions: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list permissions" });
  }
});

// Change user role
router.post("/users/:id/role", requireAuth, requireStaff, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ error: "role is required" });
  try {
    await pool.query(`UPDATE "user" SET role = $2, updated_at = now() WHERE id = $1`, [id, role]);
    res.json({ ok: true, userId: id, role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Admin set password (updates Better Auth account password hash)
router.post("/users/:id/password", requireAuth, requireStaff, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  try {
    // Use Better Auth internal hash if available, otherwise store via API
    // Better Auth stores hashed password in account table
    const hash = await (auth as any).$context?.password?.hash?.(password);
    if (!hash) {
      // Fallback: create a temporary session and use changePassword if possible
      return res.status(501).json({
        error: "Password hashing not available in this context",
        hint: "Use the user's own change-password flow or re-register.",
      });
    }
    await pool.query(
      `UPDATE account SET password = $2, updated_at = now() WHERE user_id = $1 AND provider_id = 'credential'`,
      [id, hash]
    );
    res.json({ ok: true, userId: id, message: "Password updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Assign user to organization (create member row)
router.post("/users/:id/organization", requireAuth, requireStaff, async (req, res) => {
  const { id } = req.params;
  const { organizationId, role = "member" } = req.body || {};
  if (!organizationId) return res.status(400).json({ error: "organizationId is required" });
  try {
    await pool.query(
      `INSERT INTO member (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [`mem_${id}_${organizationId}`, organizationId, id, role]
    );
    res.json({ ok: true, userId: id, organizationId, role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to assign organization" });
  }
});

// List members of an organization
router.get("/organizations/:orgId/members", requireAuth, requireStaff, async (req, res) => {
  const { orgId } = req.params;
  try {
    const rows = await db
      .select({
        id: member.id,
        userId: member.userId,
        role: member.role,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(member)
      .leftJoin(users, eq(member.userId, users.id))
      .where(eq(member.organizationId, orgId));
    res.json({ members: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list members" });
  }
});

export default router;
