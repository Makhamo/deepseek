import type { Request } from "express";

/** Express 5 types params as string | string[]; always take the first value. */
export function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}
