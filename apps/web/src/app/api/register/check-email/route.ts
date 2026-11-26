import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.AUTH_SERVICE_URL ||
  'http://localhost:4001';

/**
 * Proxy GET /api/register/check-email?email= → auth service
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email') || '';
  if (!email) {
    return NextResponse.json(
      { error: 'email query parameter is required', code: 'MISSING_EMAIL' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(
      `${AUTH_URL}/api/register/check-email?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: { cookie: req.headers.get('cookie') || '' },
        cache: 'no-store',
      }
    );

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: text || 'Upstream error', code: 'UPSTREAM_PARSE' };
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    console.error('[api/register/check-email] proxy failed', err);
    return NextResponse.json(
      {
        error: `Cannot reach auth server at ${AUTH_URL}`,
        code: 'AUTH_UNREACHABLE',
        detail: err?.message || String(err),
      },
      { status: 502 }
    );
  }
}
