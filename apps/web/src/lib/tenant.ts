import { headers } from 'next/headers';

export type Area = 'staff' | 'patient' | 'platform';

export interface AreaContext {
  area: Area;
  host: string;
}

/**
 * The area comes from the hostname (spec §14). The tenant itself is resolved by
 * core (GET /internal/tenants/resolve?host=) and cached; that call is added with
 * the login flow.
 */
export async function resolveArea(): Promise<AreaContext> {
  const requestHeaders = await headers();
  const host = (requestHeaders.get('host') ?? 'localhost').split(':')[0] ?? 'localhost';
  const area = requestHeaders.get('x-uhs-area');

  if (area === 'patient' || area === 'platform') {
    return { area, host };
  }
  return { area: 'staff', host };
}
