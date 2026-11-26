import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.AUTH_SERVICE_URL ||
  'http://localhost:4001';

/**
 * Same-origin proxy → auth service.
 * Avoids CSP connect-src blocks and browser CORS when calling :4001 from :3000.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${AUTH_URL}/api/register/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: text || 'Upstream error' };
    }

    const res = NextResponse.json(data, { status: upstream.status });
    const setCookie = upstream.headers.get('set-cookie');
    if (setCookie) {
      res.headers.set('set-cookie', setCookie);
    }
    return res;
  } catch (err: any) {
    console.error('[api/register/patient] proxy failed', err);
    return NextResponse.json(
      {
        error: `Cannot reach auth server at ${AUTH_URL}. Is services/auth running on port 4001?`,
        detail: err?.message || String(err),
      },
      { status: 502 }
    );
  }
}
