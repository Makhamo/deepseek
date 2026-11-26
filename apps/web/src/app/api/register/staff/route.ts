import { NextRequest, NextResponse } from 'next/server';

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.AUTH_SERVICE_URL ||
  'http://localhost:4001';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${AUTH_URL}/api/register/staff`, {
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
  } catch (err) {
    console.error('[proxy register/staff]', err);
    return NextResponse.json(
      { error: 'Auth service unavailable', detail: (err as Error).message },
      { status: 502 }
    );
  }
}
