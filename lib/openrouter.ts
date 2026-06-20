import "server-only";
import { WORKOUT_SCHEMA, SYSTEM_PROMPT } from "@/lib/schema";

export interface RawWorkout {
  title: string;
  focus: string;
  duration_min: number;
  exercises: { name: string; sets: number; reps: number; load: string; note: string }[];
}

export interface GenerateArgs {
  apiKey: string;
  model: string;
  context: string;
  request: string;
  draft?: RawWorkout;
}

/**
 * Call OpenRouter with the athlete context packet + the user's request, forcing
 * JSON out via response_format json_schema. The key is supplied by the caller
 * (server env var, or the user's own key passed from the client) and is used
 * only for this request — it is never logged or stored.
 */
export async function generateWorkout({ apiKey, model, context, request, draft }: GenerateArgs): Promise<RawWorkout> {
  const key = apiKey;
  if (!key) throw new Error("No OpenRouter API key");

  const messages: { role: string; content: string }[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${context}` },
  ];
  if (draft) {
    messages.push({
      role: "assistant",
      content: JSON.stringify(draft),
    });
    messages.push({
      role: "user",
      content: `Refine the workout above. ${request}`,
    });
  } else {
    messages.push({ role: "user", content: request });
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
