import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  [key: string]: unknown;
};

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
      session?: unknown;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user as SessionUser;
    req.session = session.session;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user?.role || "").toLowerCase();
    if (!roles.map((r) => r.toLowerCase()).includes(role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Requires one of: ${roles.join(", ")}`,
      });
    }
    next();
  };
}

export const requireAdmin = requireRoles("admin", "superadmin");

export const requireStaff = requireRoles(
  "doctor",
  "pharmacist",
  "nurse",
  "labtech",
  "admin",
  "superadmin"
);
