import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mem } from "@/lib/devstore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Load a user's whole state document (or null if they're brand new). */
export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId") || "";
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  try {
    const db = getDb();
    let raw: string | undefined;
    if (db) {
      const r = await db.execute({ sql: "SELECT data FROM user_state WHERE user_id = ?", args: [userId] });
      raw = r.rows[0]?.data as string | undefined;
    } else {
      raw = mem.state.get(userId);
    }
    const data = raw && raw !== "{}" ? JSON.parse(raw) : null;
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type Doc = Record<string, unknown> & { sessions?: { dateISO?: string }[] };

/** Union completed sessions by timestamp so a stale write from a second device
 *  can't drop the other device's logged workouts (the irreplaceable asset).
 *  Plan/prefs/stances are last-write-wins (incoming). */
function mergeDoc(prev: Doc | null, incoming: Doc): Doc {
  if (!prev || !Array.isArray(prev.sessions)) return incoming;
  const incSessions = Array.isArray(incoming.sessions) ? incoming.sessions : [];
  const byKey = new Map<string, { dateISO?: string }>();
  for (const s of prev.sessions) if (s?.dateISO) byKey.set(s.dateISO, s);
  for (const s of incSessions) if (s?.dateISO) byKey.set(s.dateISO, s); // incoming wins on the same session
  const sessions = [...byKey.values()].sort((a, b) => (a.dateISO! < b.dateISO! ? 1 : -1));
  return { ...incoming, sessions };
}

async function readDoc(userId: string): Promise<Doc | null> {
  const db = getDb();
  const raw = db
    ? ((await db.execute({ sql: "SELECT data FROM user_state WHERE user_id = ?", args: [userId] })).rows[0]?.data as
        | string
        | undefined)
    : mem.state.get(userId);
  if (!raw || raw === "{}") return null;
  try {
    return JSON.parse(raw) as Doc;
  } catch {
    return null;
  }
}

/** Upsert a user's state document. Normal saves union-merge sessions with the
 *  stored doc; `replace:true` (a deliberate reset) overwrites wholesale. */
export async function POST(req: Request) {
  try {
    const { userId, data, replace } = (await req.json()) as {
      userId?: string;
      data?: Doc;
      replace?: boolean;
    };
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const incoming = (data ?? {}) as Doc;
    const toStore = replace ? incoming : mergeDoc(await readDoc(userId), incoming);
    const json = JSON.stringify(toStore);

    const db = getDb();
    if (db) {
      await db.execute({
        sql: `INSERT INTO user_state (user_id, data, updated_at) VALUES (?, ?, datetime('now'))
              ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`,
        args: [userId, json],
      });
    } else {
      mem.state.set(userId, json);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
