import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { buildAthleteContext } from "@/lib/context";
import { generateWorkout, type RawWorkout } from "@/lib/openrouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_CONTEXT = `# ATHLETE PROFILE
(no database connected — generating without memory)
- Goal: general strength + muscle
- Banned: none`;

export async function POST(req: Request) {
  try {
    const { prompt, draft } = (await req.json()) as {
      prompt?: string;
      draft?: RawWorkout;
    };
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // 1. Assemble the memory packet from Turso (server-side).
    const db = getDb();
    const context = db ? await buildAthleteContext(db) : FALLBACK_CONTEXT;

    // 2. Packet + request → OpenRouter, forced JSON out.
    const raw = await generateWorkout(context, prompt.trim(), draft);

    // 3. Shape for the preview UI.
    return NextResponse.json({ plan: toPlan(raw, prompt.trim()), raw });
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

function toPlan(raw: RawWorkout, prompt: string) {
  const totalSets = raw.exercises.reduce((a, b) => a + (b.sets || 0), 0);
  const focus = (raw.focus || "").toUpperCase();
  const meta = `${raw.exercises.length} LIFTS · ${totalSets} SETS · ~${raw.duration_min} MIN${
    focus ? ` · ${focus}` : ""
  }`;
  return {
    title: stack(raw.title),
    focus,
    meta,
    prompt,
    lifts: raw.exercises.map((e) => ({
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      load: e.load,
      note: e.note || undefined,
    })),
  };
}

/** Stack the title onto two lines (brutalist) by breaking before the last word. */
function stack(title: string): string {
  const t = (title || "Workout").trim();
  const i = t.lastIndexOf(" ");
  return i > 0 ? `${t.slice(0, i)}\n${t.slice(i + 1)}` : t;
}
