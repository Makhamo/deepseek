import { z } from 'zod';

/** Cursor pagination (spec §4.4): limit 1..200, default 50. */
export const PaginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

export const PageInfo = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});
export type PageInfo = z.infer<typeof PageInfo>;

export function pageOf<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: PageInfo,
  });
}

/** Idempotency-Key header value (spec §4.4). */
export const IdempotencyKey = z
  .string()
  .min(8)
  .max(255)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Idempotency-Key must be URL-safe');
export type IdempotencyKey = z.infer<typeof IdempotencyKey>;
