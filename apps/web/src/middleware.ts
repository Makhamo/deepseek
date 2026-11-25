import { NextResponse, type NextRequest } from 'next/server';

const PLATFORM_HOSTS = new Set(['platform.localhost', 'admin.localhost']);
const PATIENT_HOST_PREFIXES = ['patient.', 'app.'];

function areaForHost(host: string): 'staff' | 'patient' | 'platform' {
  if (PLATFORM_HOSTS.has(host)) return 'platform';
  if (PATIENT_HOST_PREFIXES.some((prefix) => host.startsWith(prefix))) return 'patient';
  return 'staff';
}

/**
 * Hostname decides the area; this middleware only annotates the request.
 *
 * It deliberately does not authorize anything: every service enforces
 * permissions, and hiding a route here is a convenience, not a control
 * (spec §14, §16).
 */
export function middleware(request: NextRequest): NextResponse {
  const host = (request.headers.get('host') ?? 'localhost').split(':')[0] ?? 'localhost';
  const headers = new Headers(request.headers);
  headers.set('x-uhs-area', areaForHost(host));
  headers.set('x-uhs-host', host);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
