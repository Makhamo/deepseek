import type { ProblemDetails } from '@uhs/contracts';

/**
 * The browser only ever talks to this Next.js app. Service addresses live in
 * server-side environment variables and never reach client bundles (spec §1.2).
 */
export type ServiceName =
  | 'auth'
  | 'core'
  | 'doctor'
  | 'triage'
  | 'lab'
  | 'nicu'
  | 'pharmacy'
  | 'claims'
  | 'notifications';

const SERVICE_URLS: Record<ServiceName, string | undefined> = {
  auth: process.env.AUTH_SERVICE_URL,
  core: process.env.CORE_SERVICE_URL,
  doctor: process.env.DOCTOR_SERVICE_URL,
  triage: process.env.TRIAGE_SERVICE_URL,
  lab: process.env.LAB_SERVICE_URL,
  nicu: process.env.NICU_SERVICE_URL,
  pharmacy: process.env.PHARMACY_SERVICE_URL,
  claims: process.env.CLAIMS_SERVICE_URL,
  notifications: process.env.NOTIFICATIONS_SERVICE_URL,
};

export class ServiceError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail?: string,
    readonly correlationId?: string,
  ) {
    super(`${code}: ${detail ?? 'service call failed'}`);
    this.name = 'ServiceError';
  }
}

export interface ServiceCall {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  accessToken?: string;
  tenantId?: string;
  correlationId?: string;
  /** Required for POST (spec §4.4). */
  idempotencyKey?: string;
  /** Required for PUT/PATCH (spec §4.4). */
  ifMatch?: string;
  signal?: AbortSignal;
}

/**
 * Calls a service from server code. The access token is passed explicitly and
 * is never written to a log or forwarded to the browser.
 */
export async function callService<T>(service: ServiceName, call: ServiceCall): Promise<T> {
  const baseUrl = SERVICE_URLS[service];
  if (!baseUrl) {
    throw new Error(`No URL configured for the ${service} service`);
  }

  const headers: Record<string, string> = { accept: 'application/json' };
  if (call.body !== undefined) headers['content-type'] = 'application/json';
  if (call.accessToken) headers.authorization = `Bearer ${call.accessToken}`;
  if (call.tenantId) headers['x-tenant-id'] = call.tenantId;
  if (call.correlationId) headers['x-request-id'] = call.correlationId;
  if (call.idempotencyKey) headers['idempotency-key'] = call.idempotencyKey;
  if (call.ifMatch) headers['if-match'] = call.ifMatch;

  const response = await fetch(new URL(call.path, baseUrl), {
    method: call.method,
    headers,
    body: call.body === undefined ? undefined : JSON.stringify(call.body),
    signal: call.signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemDetails | null;
    throw new ServiceError(
      response.status,
      problem?.code ?? `HTTP-${response.status}`,
      problem?.detail,
      problem?.correlation_id,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
