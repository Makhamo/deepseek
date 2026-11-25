import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

/** New identifiers are UUIDv7, generated in application code (spec §2). */
export function newId(): string {
  return uuidv7();
}

export const Uuid = z.uuid();
export const Uuidv7 = z.uuid().refine((value) => value.charAt(14) === '7', {
  message: 'expected a UUIDv7 identifier',
});

/** ISO 8601 with an explicit offset, stored as timestamptz (spec §10.3). */
export const IsoDateTime = z.iso.datetime({ offset: true });

export const TenantId = z.uuid();
export const UserId = z.string().min(1);
