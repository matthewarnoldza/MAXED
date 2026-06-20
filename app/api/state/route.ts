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

/** Upsert a user's state document. Last-write-wins (one device per person). */
export async function POST(req: Request) {
  try {
    const { userId, data } = (await req.json()) as { userId?: string; data?: unknown };
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const json = JSON.stringify(data ?? {});
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
