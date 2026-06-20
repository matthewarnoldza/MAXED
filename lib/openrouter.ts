import "server-only";
import { WORKOUT_SCHEMA, SYSTEM_PROMPT } from "@/lib/schema";

export interface RawWorkout {
  title: string;
  focus: string;
  duration_min: number;
  exercises: { name: string; sets: number; reps: number; load: string; note: string }[];
}

/**
 * Call OpenRouter with the athlete context packet + the user's request, forcing
 * JSON out via response_format json_schema. The key never leaves the server.
 */
export async function generateWorkout(
  athleteContext: string,
  userRequest: string,
  draft?: RawWorkout
): Promise<RawWorkout> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not set");
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.6";

  const messages: { role: string; content: string }[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${athleteContext}` },
  ];
  if (draft) {
    messages.push({
      role: "assistant",
      content: JSON.stringify(draft),
    });
    messages.push({
      role: "user",
      content: `Refine the workout above. ${userRequest}`,
    });
  } else {
    messages.push({ role: "user", content: userRequest });
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_TITLE || "MAXED",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      response_format: { type: "json_schema", json_schema: WORKOUT_SCHEMA },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return parseWorkout(content);
}

/** Models occasionally wrap JSON in prose/fences — extract the object defensively. */
function parseWorkout(content: string): RawWorkout {
  let text = content.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  if (text[0] !== "{") {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
  }
  const parsed = JSON.parse(text) as RawWorkout;
  if (!parsed?.exercises?.length) throw new Error("Model returned no exercises");
  return parsed;
}
