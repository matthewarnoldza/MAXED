import { NextResponse } from "next/server";
import { getDb, ensureExerciseId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Log a set. Offline-first: the client has already updated the UI, so a failure
 * here is non-fatal. Returns whether the set is a new PB for that lift.
 */
export async function POST(req: Request) {
  try {
    const { exercise, weight, reps, workoutId } = (await req.json()) as {
      exercise?: string;
      weight?: number;
      reps?: number;
      workoutId?: number;
    };
    if (!exercise || typeof weight !== "number" || typeof reps !== "number") {
      return NextResponse.json({ error: "Missing exercise/weight/reps" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      // No DB configured — accept optimistically so logging never blocks.
      return NextResponse.json({ ok: true, persisted: false });
    }

    const exId = await ensureExerciseId(db, exercise);

    const prev = await db.execute({
      sql: "SELECT MAX(weight) AS top FROM sets WHERE exercise_id = ?",
      args: [exId],
    });
    const prevTop = Number(prev.rows[0]?.top ?? 0);
    const isPb = weight > prevTop;

    await db.execute({
      sql: "INSERT INTO sets (exercise_id, workout_id, weight, reps) VALUES (?, ?, ?, ?)",
      args: [exId, workoutId ?? null, weight, reps],
    });

    return NextResponse.json({ ok: true, persisted: true, pb: isPb });
  } catch (err) {
    const message = err instanceof Error ? err.message : "log failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
