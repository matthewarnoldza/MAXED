"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, ThemeToggle } from "@/components/screens/Frame";
import { useApp } from "@/store/useApp";

export function Home() {
  const go = useApp((s) => s.go);
  const plan = useApp((s) => s.plan);

  return (
    <ScreenBody>
      {/* top bar */}
      <div
        style={{
          padding: "0 22px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${T.ink}`,
        }}
      >
        <span style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1 }}>DAY 214</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1 }}>STREAK 12🔥</span>
          <ThemeToggle />
        </div>
      </div>

      {/* title */}
      <button
        onClick={() => go("plan")}
        style={{
          padding: "22px 22px 0",
          border: "none",
          background: "transparent",
          color: T.ink,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ font: `700 13px/1 ${FONT.mono}`, color: T.accent, letterSpacing: 2 }}>
          TODAY · WED 12 MAR
        </div>
        <div
          style={{
            font: `400 72px/.82 ${FONT.anton}`,
            textTransform: "uppercase",
            letterSpacing: -1,
            marginTop: 12,
          }}
        >
          Squat
          <br />
          Day
        </div>
      </button>

      {/* stat strip */}
      <div
        style={{
          display: "flex",
          marginTop: 22,
          borderTop: `2px solid ${T.ink}`,
          borderBottom: `2px solid ${T.ink}`,
        }}
      >
        <Stat label="VOLUME" value="14.2" unit="T" />
        <Stat label="E1RM" value="154" />
        <Stat label="PBs/MO" value="5" accent last />
      </div>

      {/* exercise list */}
      <div>
        {plan.slice(0, 3).map((p, i) => (
          <button
            key={p.id}
            onClick={() => go("history")}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 22px",
              border: "none",
              borderBottom: `1px solid ${T.line}`,
              background: "transparent",
              color: T.ink,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ font: `700 17px/1 ${FONT.archivo}` }}>
              {String(i + 1).padStart(2, "0")} {p.name}
            </span>
            <span style={{ font: `700 13px/1 ${FONT.mono}`, color: T.sub }}>
              {p.sets}×{p.reps} · {p.kg}
            </span>
          </button>
        ))}
      </div>

      {/* start */}
      <div style={{ marginTop: "auto", padding: "0 22px" }}>
        <button
          onClick={() => go("logger")}
          style={{
            width: "100%",
            border: "none",
            background: T.ink,
            color: T.bg,
            padding: 24,
            font: `400 32px/1 ${FONT.anton}`,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Start<span style={{ color: T.accent }}>▶</span>
        </button>
      </div>
    </ScreenBody>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
  last,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "12px 18px",
        borderRight: last ? "none" : `1px solid ${T.line}`,
      }}
    >
      <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>{label}</div>
      <div
        style={{
          font: `400 26px/1 ${FONT.anton}`,
          marginTop: 6,
          color: accent ? T.accent : T.ink,
        }}
      >
        {value}
        {unit && <span style={{ font: `700 11px/1 ${FONT.mono}`, color: T.sub }}>{unit}</span>}
      </div>
    </div>
  );
}
