import { NextResponse } from "next/server";
import { generateWorkout, type RawWorkout } from "@/lib/openrouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight capability probe: does the server have an OpenRouter key?
 *  Lets the UI show "live AI" vs "offline coach" honestly without exposing the key. */
export async function GET() {
  return NextResponse.json({ hasServerKey: !!process.env.OPENROUTER_API_KEY });
}

const FALLBACK_CONTEXT = `# ATHLETE PROFILE
(no profile provided — generating without memory)
- Goal: general strength + muscle
- Banned: none`;

/**
 * The memory packet is built on the client (lib/profile.ts) from the signed-in
 * user's own logged history and sent here as `context`. The key may come from the
 * server env (deploys) or the user's own key from the client; it's used only for
 * this request. When there's no key at all we return `no-key` so the client falls
 * back to its on-device coach.
 */
export async function POST(req: Request) {
  try {
    const { prompt, draft, context: clientContext, apiKey: clientKey, model: clientModel } =
      (await req.json()) as {
        prompt?: string;
        draft?: RawWorkout;
        context?: string;
        apiKey?: string;
        model?: string;
      };
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || clientKey;
    if (!apiKey) {
      return NextResponse.json({ error: "no-key" }, { status: 400 });
    }

    const context = clientContext || FALLBACK_CONTEXT;
    const model = clientModel || process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.6";

    const raw = await generateWorkout({ apiKey, model, context, request: prompt.trim(), draft });
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
