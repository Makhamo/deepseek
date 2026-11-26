import { NextRequest, NextResponse } from 'next/server';
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const upstream = await fetch(`${AUTH_URL}/api/staff/user/${params.userId}`, {
      headers: { cookie: req.headers.get('cookie') || '' },
    });
    const text = await upstream.text();
    let data: unknown = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 502 });
  }
}
