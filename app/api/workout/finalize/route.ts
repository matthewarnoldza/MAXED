import { NextResponse } from "next/server";
import { getDb, ensureExerciseId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FinalizeBody {
  focus?: string;
  source?: "manual" | "assistant";
  lifts?: { name: string; sets: number; reps: number; load?: string }[];
  // preference deltas — the "it learns me" write-back
  banned?: string[];
  loved?: string[];
  avoid?: string[];
}

/**
 * Close the loop: persist the accepted workout + its exercises, and write back
 * any preference deltas (banned / loved / avoid). Next context build reflects them.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FinalizeBody;
    const db = getDb();
    if (!db) return NextResponse.json({ ok: true, persisted: false });

    // 1. workout + workout_exercises
    let workoutId: number | null = null;
    if (body.lifts?.length) {
      const w = await db.execute({
        sql: "INSERT INTO workouts (focus, status, source) VALUES (?, 'planned', ?)",
        args: [body.focus ?? null, body.source ?? "assistant"],
      });
      workoutId = Number(w.lastInsertRowid);

      let pos = 0;
      for (const lift of body.lifts) {
        const exId = await ensureExerciseId(db, lift.name);
        const weight = lift.load && !Number.isNaN(parseFloat(lift.load)) ? parseFloat(lift.load) : null;
        await db.execute({
          sql: `INSERT INTO workout_exercises
                  (workout_id, exercise_id, position, target_sets, target_reps, target_weight)
                VALUES (?, ?, ?, ?, ?, ?)`,
          args: [workoutId, exId, pos++, lift.sets ?? null, lift.reps ?? null, weight],
        });
      }
    }

    // 2. preference write-back
    await Promise.all([
      ...(body.banned ?? []).map((n) => setStance(db, n, "banned", "user request")),
      ...(body.avoid ?? []).map((n) => setStance(db, n, "avoid")),
      ...(body.loved ?? []).map((n) => setStance(db, n, "love")),
    ]);

    return NextResponse.json({ ok: true, persisted: true, workoutId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "finalize failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function setStance(
  db: NonNullable<ReturnType<typeof getDb>>,
  name: string,
  stance: "love" | "like" | "avoid" | "banned",
  note?: string
) {
  const exId = await ensureExerciseId(db, name);
  await db.execute({
    sql: `INSERT INTO exercise_prefs (exercise_id, stance, note) VALUES (?, ?, ?)
          ON CONFLICT(exercise_id) DO UPDATE SET stance = excluded.stance,
            note = COALESCE(excluded.note, exercise_prefs.note), updated_at = datetime('now')`,
    args: [exId, stance, note ?? null],
  });
}
