// app/api/signal/route.ts
import { NextRequest, NextResponse } from 'next/server';

/* ────────────────────────────────────────────────────────────────
 * Storage layer
 * - Production: Upstash Redis (shared across Serverless instances)
 * - Dev/no-Redis: in-memory Map (single process only)
 * ──────────────────────────────────────────────────────────────── */

type PeerMeta = { name: string; role: string };

// In-memory fallback (used only when UPSTASH_* env vars are missing)
const memRooms = new Map<string, Map<string, PeerMeta>>();

let redis: {
  hset: (key: string, value: Record<string, string>) => Promise<unknown>;
  hdel: (key: string, field: string) => Promise<unknown>;
  hgetall: <T>(key: string) => Promise<T | null>;
  expire: (key: string, seconds: number) => Promise<unknown>;
} | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Lazy import so dev without Upstash doesn't crash on build
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Redis } = require('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const roomKey = (roomId: string) => `room:${roomId}`;
const ROOM_TTL_SECONDS = 60 * 60 * 2; // 2h — auto-cleanup abandoned rooms

/* ────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────── */

async function getRoomMembers(roomId: string): Promise<Record<string, PeerMeta>> {
  if (redis) {
    const raw = await redis.hgetall<Record<string, string>>(roomKey(roomId));
    const out: Record<string, PeerMeta> = {};
    for (const [id, meta] of Object.entries(raw || {})) {
      try {
        out[id] = JSON.parse(meta) as PeerMeta;
      } catch {
        out[id] = { name: id, role: 'Participant' };
      }
    }
    return out;
  }
  const mem = memRooms.get(roomId);
  if (!mem) return {};
  return Object.fromEntries(mem);
}

async function setMember(roomId: string, peerId: string, meta: PeerMeta): Promise<void> {
  if (redis) {
    await redis.hset(roomKey(roomId), { [peerId]: JSON.stringify(meta) });
    await redis.expire(roomKey(roomId), ROOM_TTL_SECONDS);
    return;
  }
  if (!memRooms.has(roomId)) memRooms.set(roomId, new Map());
  memRooms.get(roomId)!.set(peerId, meta);
}

async function removeMember(roomId: string, peerId: string): Promise<void> {
  if (redis) {
    await redis.hdel(roomKey(roomId), peerId);
    return;
  }
  const mem = memRooms.get(roomId);
  if (!mem) return;
  mem.delete(peerId);
  if (mem.size === 0) memRooms.delete(roomId);
}

/* ────────────────────────────────────────────────────────────────
 * POST /api/signal
 * body: { roomId, peerId, name?, role?, action?: 'leave' }
 * ──────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, peerId, name, role, action } = body as {
      roomId?: string;
      peerId?: string;
      name?: string;
      role?: string;
      action?: 'join' | 'leave';
    };

    if (!roomId || !peerId) {
      return NextResponse.json({ error: 'Missing roomId or peerId' }, { status: 400 });
    }

    if (action === 'leave') {
      await removeMember(roomId, peerId);
      return NextResponse.json({ ok: true });
    }

    // Join / heartbeat
    await setMember(roomId, peerId, {
      name: name || peerId,
      role: role || 'Participant',
    });

    const members = await getRoomMembers(roomId);
    const peers = Object.entries(members)
      .filter(([id]) => id !== peerId)
      .map(([id, meta]) => ({ id, name: meta.name, role: meta.role }));

    return NextResponse.json({ ok: true, peers });
  } catch (err) {
    console.error('[POST /api/signal]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────────────────────
 * GET /api/signal?roomId=XYZ
 * ──────────────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ peers: [] });

    const members = await getRoomMembers(roomId);
    const peers = Object.entries(members).map(([id, meta]) => ({
      id,
      name: meta.name,
      role: meta.role,
    }));

    return NextResponse.json({ peers });
  } catch (err) {
    console.error('[GET /api/signal]', err);
    return NextResponse.json({ peers: [] });
  }
}