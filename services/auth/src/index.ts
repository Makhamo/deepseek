
import "./env.js";

import express, { Router, type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./auth.js";
import { db, pool } from "./db/index.js";
import { user as userTable } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { ensureSchema } from "./db/ensure-schema.js";
import serviceRoutes from "./routes/service.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import permissionRoutes from "./routes/permission.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import registryRoutes from "./routes/service-registry.routes.js";
import meRoutes from "./routes/me.routes.js";
import registerRoutes from "./routes/register.routes.js";
import adminRoutes from "./routes/admin.routes.js";

/* ------------------------------------------------------------------ */
/*  Env guards — fail loudly if a required var is missing             */
/* ------------------------------------------------------------------ */

if (!process.env.BETTER_AUTH_SECRET) {
  console.error("FATAL: BETTER_AUTH_SECRET is not set");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not set");
  process.exit(1);
}
if (!process.env.BETTER_AUTH_URL) {
  console.error("FATAL: BETTER_AUTH_URL is not set");
  process.exit(1);
}

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL; // now guaranteed string
const PORT = Number(process.env.PORT) || 4001;

const app = express();

/* ------------------------------------------------------------------ */
/*  Domain router                                                     */
/* ------------------------------------------------------------------ */

const apiRoutes = Router();
apiRoutes.use("/services", serviceRoutes);
apiRoutes.use("/organizations", organizationRoutes);
apiRoutes.use("/departments", departmentRoutes);
apiRoutes.use("/permissions", permissionRoutes);
apiRoutes.use("/staff", staffRoutes);
apiRoutes.use("/patients", patientRoutes);
apiRoutes.use("/registry", registryRoutes);
apiRoutes.use("/me", meRoutes);
apiRoutes.use("/register", registerRoutes);
apiRoutes.use("/admin", adminRoutes);

/* ------------------------------------------------------------------ */
/*  Security & logging                                                */
/* ------------------------------------------------------------------ */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  "http://localhost:3000,http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        cb(null, true);
      } else {
        cb(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

/* ------------------------------------------------------------------ */
/*  Better Auth handler — MUST be before express.json()               */
/* ------------------------------------------------------------------ */

app.all("/api/auth/*", toNodeHandler(auth));
app.all("/auth/*", toNodeHandler(auth));

/* ------------------------------------------------------------------ */
/*  Body parsers                                                      */
/* ------------------------------------------------------------------ */

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

/* ------------------------------------------------------------------ */
/*  Health + root                                                     */
/* ------------------------------------------------------------------ */

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "unitac-auth-hub",
    time: new Date().toISOString(),
  });
});

app.get("/health/live", (_req, res) => {
  res.json({ status: "live", service: "unitac-auth-hub" });
});

app.get("/", (_req, res) => {
  // Prefer constructing the URLs from a single base so they can never
  // become "undefined/..." again.
  const jwksUrl = new URL("/api/auth/jwks", BETTER_AUTH_URL).toString();
  const authUrl = new URL("/api/auth", BETTER_AUTH_URL).toString();
  const meUrl = new URL("/api/me/access", BETTER_AUTH_URL).toString();
  const checkUrl = new URL(
    "/api/me/check?permission=appointment:book",
    BETTER_AUTH_URL
  ).toString();

  res.json({
    name: "Unitac Auth Hub",
    version: "3.1.0",
    role: "Central identity & authorization for all healthcare services",
    endpoints: {
      health: "/health",
      auth: "/api/auth/*",
      meAccess: "/api/me/access",
      meCheck: "/api/me/check?permission=appointment:book",
      permissions: "/api/permissions",
      registry: "/api/registry",
      organizations: "/api/organizations",
      staff: "/api/staff",
      patients: "/api/patients",
      jwks: "/api/auth/jwks",
      // absolute URLs, handy for smoke tests
      absolute: { authUrl, jwksUrl, meUrl, checkUrl },
    },
  });
});

/* ------------------------------------------------------------------ */
/*  Domain API                                                        */
/* ------------------------------------------------------------------ */

app.use("/api", apiRoutes);

/* ------------------------------------------------------------------ */
/*  404 + error handler                                               */
/* ------------------------------------------------------------------ */

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
};
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/*  Start                                                             */
/* ------------------------------------------------------------------ */

const httpServer = http.createServer(app);

async function start() {
  // Create any missing tables BEFORE accepting signups. An empty database used to
  // surface as `relation "user" does not exist` on the signup form.
  try {
    await ensureSchema();
    console.log("[db] schema verified");
  } catch (err) {
    console.error(
      "[db] could not verify/create the auth schema:",
      (err as Error).message,
      "\n     Check DATABASE_URL, or run: npm run db:bootstrap"
    );
  }

  await seedDefaultAdmin();

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Auth Hub running on port ${PORT}`);
    console.log(`  Base URL: ${BETTER_AUTH_URL}`);
    console.log(`  Auth:     ${BETTER_AUTH_URL}/api/auth`);
    console.log(`  JWKS:     ${BETTER_AUTH_URL}/api/auth/jwks`);
    console.log(`  Me:       ${BETTER_AUTH_URL}/api/me/access`);
    console.log(`  Health:   http://localhost:${PORT}/health`);
  });
}



/* ------------------------------------------------------------------ */
/*  Seed default admin if missing                                     */
/* ------------------------------------------------------------------ */
async function seedDefaultAdmin() {
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "password123";
  try {
    const existing = await db.query.user.findFirst({
      where: eq(userTable.email, ADMIN_EMAIL),
    });
    if (existing) {
      console.log("[seed] admin already exists");
      return;
    }
    console.log("[seed] creating default admin...");
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: "System Admin",
      },
    });
    if (!result?.user?.id) {
      console.warn("[seed] signUpEmail returned no user");
      return;
    }
    const userId = result.user.id;
    await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, status, is_active)
       VALUES ($1, $2, 'System', 'Admin', 'active', true)
       ON CONFLICT (id) DO NOTHING`,
      [userId, ADMIN_EMAIL]
    );
    await pool.query(`UPDATE "user" SET role = 'admin' WHERE id = $1`, [userId]);
    await pool.query(
      `INSERT INTO staff_profile (id, user_id, is_active)
       VALUES ($1, $1, true)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    console.log("[seed] default admin created: admin@gmail.com / password123");
  } catch (err) {
    console.warn("[seed] admin seed failed:", (err as Error).message);
  }
}

await seedDefaultAdmin();

void start();
