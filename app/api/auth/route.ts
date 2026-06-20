import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { mem } from "@/lib/devstore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a person. Name-only sign-in: each tap-to-switch profile is one row.
 *  The id is random and unguessable so a profile isn't reachable by enumeration. */
export async function POST(req: Request) {
  try {
    const { name } = (await req.json()) as { name?: string };
    const clean = (name || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (!clean) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const id = randomId();
    const db = getDb();
    if (db) {
      await db.execute({ sql: "INSERT INTO users (id, name) VALUES (?, ?)", args: [id, clean] });
      await db.execute({ sql: "INSERT INTO user_state (user_id, data) VALUES (?, '{}')", args: [id] });
    } else {
      mem.users.set(id, { id, name: clean });
      mem.state.set(id, "{}");
    }
    return NextResponse.json({ id, name: clean });
  } catch (err) {
    const message = err instanceof Error ? err.message : "auth failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function randomId(): string {
  try {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  } catch {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }
}
