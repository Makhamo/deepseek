// appointment-service/src/routes/internal.routes.ts
import { Router } from "express";
import { db } from "../db/index.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/users/sync", async (req, res) => {
  if (req.headers["x-internal-secret"] !== process.env.INTERNAL_SERVICE_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id, email, name, role } = req.body ?? {};
  if (!id || !email) return res.status(400).json({ error: "id and email required" });

  const existing = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (existing.length) {
    await db.update(user).set({ email, name, role }).where(eq(user.id, id));
  } else {
    await db.insert(user).values({ id, email, name, role });
  }
  res.json({ ok: true, userId: id });
});

export default router;