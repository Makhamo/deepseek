import { z } from 'zod';

/**
 * Money is NUMERIC(14,2) in the database and a decimal string in JSON. No
 * JavaScript floats, ever (spec §10.3). Arithmetic uses decimal.js.
 */
export const DecimalAmount = z
  .string()
  .regex(/^-?\d{1,12}(\.\d{1,2})?$/, 'amount must be a decimal string with at most 2 places');

export const Currency = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'ISO 4217 alphabetic code');

export const Money = z.object({
  amount: DecimalAmount,
  currency: Currency.default('ZAR'),
});
export type Money = z.infer<typeof Money>;

export const DEFAULT_CURRENCY = 'ZAR';
