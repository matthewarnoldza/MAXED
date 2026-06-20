/** Forced-JSON contract for AI workout generation. Lock this early — everything downstream depends on it. */
export const WORKOUT_SCHEMA = {
  name: "workout",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "focus", "duration_min", "exercises"],
    properties: {
      title: { type: "string", description: "Short workout name, e.g. 'Push Day A'." },
      focus: { type: "string", description: "One word, uppercase, e.g. HYPERTROPHY | STRENGTH | POWER." },
      duration_min: { type: "integer", description: "Estimated total minutes." },
      exercises: {
        type: "array",
        minItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "sets", "reps", "load", "note"],
          properties: {
            name: { type: "string" },
            sets: { type: "integer" },
            reps: { type: "integer" },
            load: {
              type: "string",
              description:
                "Display load: a target kg ('26'), a progression delta ('+2.5'), or 'BW' for bodyweight.",
            },
            note: { type: "string", description: "Optional short cue; empty string if none." },
          },
        },
      },
    },
  },
} as const;

export const SYSTEM_PROMPT = `You are MAXED COACH, a no-nonsense strength coach inside a brutalist workout app.
You receive an ATHLETE PROFILE (their goals, banned movements, PBs, recent sessions) and a request.
Design ONE workout that fits the request and the profile.

Hard rules:
- NEVER program a banned movement. Minimise "avoid" movements.
- Bias every applicable lift toward progressive overload vs the athlete's last top set;
  express that as a "+x.x" delta in the load field when you're nudging a PB lift up.
- Favour "loved" movements when they fit the requested focus.
- Keep the session within the requested time budget; pick a realistic number of lifts.
- Use kg. Bodyweight movements use "BW" for load.
- Output ONLY the JSON object matching the provided schema. No prose.`;
