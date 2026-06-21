"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, ThemeToggle } from "@/components/screens/Frame";
import { SlidersIcon, SparkIcon, PlayTriangle } from "@/components/ui/icons";
import { homeStats, pbFor } from "@/lib/derive";
import { useApp } from "@/store/useApp";

export function Home() {
  const go = useApp((s) => s.go);
  const plan = useApp((s) => s.plan);
  const planTitle = useApp((s) => s.planTitle);
  const planFocus = useApp((s) => s.planFocus);
  const sessions = useApp((s) => s.sessions);
  const startDateISO = useApp((s) => s.startDateISO);
  const startWorkout = useApp((s) => s.startWorkout);
  const openHistory = useApp((s) => s.openHistory);

  const stats = homeStats(sessions, startDateISO, new Date());
  const [line1, line2] = stackTitle(planTitle);

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
        <span style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1 }}>DAY {stats.dayNumber}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1 }}>
            STREAK {stats.streak}🔥
          </span>
          <IconBtn label="Settings" onClick={() => go("settings")}>
            <SlidersIcon />
          </IconBtn>
          <ThemeToggle />
        </div>
      </div>

      {/* title → plan */}
      <button
        onClick={() => go("plan")}
        style={{ padding: "20px 22px 0", border: "none", background: "transparent", color: T.ink, textAlign: "left", cursor: "pointer" }}
      >
        <div style={{ font: `700 13px/1 ${FONT.mono}`, color: T.accent, letterSpacing: 2 }}>
          TODAY · {stats.todayLabel} · {planFocus}
        </div>
        <div style={{ font: `400 68px/.82 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -1, marginTop: 12 }}>
          {line1}
          {line2 && (
            <>
              <br />
              {line2}
            </>
          )}
        </div>
      </button>

      {/* stat strip — all computed from your logged sessions */}
      <div style={{ display: "flex", marginTop: 20, borderTop: `2px solid ${T.ink}`, borderBottom: `2px solid ${T.ink}` }}>
        <Stat label="VOL · 7D" value={stats.volumeWeekT} unit="T" />
        <Stat label="BEST E1RM" value={stats.e1rmTop ? String(stats.e1rmTop) : "—"} />
        <Stat label="PBs/MO" value={String(stats.pbsThisMonth)} accent last />
      </div>

      {/* today's lifts → tap for history */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {plan.slice(0, 4).map((p, i) => (
          <button
            key={p.id}
            onClick={() => openHistory(p.name)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 22px",
              border: "none",
              borderBottom: `1px solid ${T.line}`,
              background: "transparent",
              color: T.ink,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ font: `700 16px/1 ${FONT.archivo}` }}>
              {String(i + 1).padStart(2, "0")} {p.name}
            </span>
            <span style={{ font: `700 13px/1 ${FONT.mono}`, color: T.sub }}>
              {p.sets}×{p.reps}
              {pbFor(sessions, p.name) > 0 && <span style={{ color: T.accent }}> · PB {pbFor(sessions, p.name)}</span>}
            </span>
          </button>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ padding: "12px 22px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => go("assistant")} style={pickBtn}>
            <span style={{ color: T.accent, display: "inline-flex" }}>
              <SparkIcon />
            </span>
            ASK COACH
          </button>
          <button onClick={() => go("library")} style={pickBtn}>
            <span style={{ color: T.accent, font: `400 18px/0 ${FONT.anton}` }}>+</span>
            BUILD OWN
          </button>
        </div>
        <button
          onClick={plan.length ? startWorkout : () => go("library")}
          style={{
            width: "100%",
            border: "none",
            background: plan.length ? T.ink : T.line,
            color: T.bg,
            padding: 22,
            font: `400 32px/1 ${FONT.anton}`,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {plan.length ? "Start workout" : "Add lifts first"}
          <PlayTriangle s={20} color={T.accent} />
        </button>
      </div>
    </ScreenBody>
  );
}

function stackTitle(title: string): [string, string | null] {
  const t = (title || "Workout").trim();
  const i = t.lastIndexOf(" ");
  return i > 0 ? [t.slice(0, i), t.slice(i + 1)] : [t, null];
}

const pickBtn: React.CSSProperties = {
  flex: 1,
  border: `2px solid ${T.ink}`,
  background: "transparent",
  color: T.ink,
  padding: "14px 8px",
  font: `700 12px/1 ${FONT.mono}`,
  letterSpacing: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
};

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 28,
        border: `2px solid ${T.ink}`,
        background: "transparent",
        color: T.ink,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, unit, accent, last }: { label: string; value: string; unit?: string; accent?: boolean; last?: boolean }) {
  return (
    <div style={{ flex: 1, padding: "12px 18px", borderRight: last ? "none" : `1px solid ${T.line}` }}>
      <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>{label}</div>
      <div style={{ font: `400 26px/1 ${FONT.anton}`, marginTop: 6, color: accent ? T.accent : T.ink }}>
        {value}
        {unit && <span style={{ font: `700 11px/1 ${FONT.mono}`, color: T.sub }}>{unit}</span>}
      </div>
    </div>
  );
}
