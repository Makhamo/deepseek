import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";

type Target = "body" | "query" | "params";

/**
 * Validate req.body / req.query / req.params against a Zod schema.
 * On failure returns 400 with field-level errors.
 */
export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const error = result.error as ZodError;
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }

    // Replace with parsed (coerced / stripped) data
    req[target] = result.data;
    next();
  };
}
