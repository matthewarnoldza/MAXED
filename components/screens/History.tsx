"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { useApp } from "@/store/useApp";

const BARS = [
  { h: "46%", kind: "line" },
  { h: "54%", kind: "line" },
  { h: "54%", kind: "line" },
  { h: "70%", kind: "out" },
  { h: "70%", kind: "line" },
  { h: "84%", kind: "out" },
  { h: "78%", kind: "line" },
  { h: "92%", kind: "out" },
  { h: "100%", kind: "pb" },
] as const;

export function History() {
  const go = useApp((s) => s.go);

  return (
    <ScreenBody>
      <BackRow left="‹ BACK" right="HISTORY" onBack={() => go("home")} />

      <div style={{ padding: "10px 22px 14px", borderBottom: `2px solid ${T.ink}`, flex: "none" }}>
        <div style={{ font: `400 36px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
          Back Squat
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* PB callout + stats */}
        <div style={{ display: "flex", borderBottom: `2px solid ${T.ink}` }}>
          <div style={{ flex: 1, padding: "16px 22px", borderRight: `2px solid ${T.ink}` }}>
            <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.accent }}>CURRENT PB</div>
            <div style={{ font: `400 56px/.82 ${FONT.anton}`, marginTop: 8, color: T.accent }}>140</div>
            <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 6 }}>
              ×3 · 12 MAR
            </div>
          </div>
          <div style={{ flex: "none", width: 128, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, padding: "12px 16px", borderBottom: `1px solid ${T.line}` }}>
              <div style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>E1RM</div>
              <div style={{ font: `400 24px/1 ${FONT.anton}`, marginTop: 5 }}>154</div>
            </div>
            <div style={{ flex: 1, padding: "12px 16px" }}>
              <div style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>SESSIONS</div>
              <div style={{ font: `400 24px/1 ${FONT.anton}`, marginTop: 5 }}>24</div>
            </div>
          </div>
        </div>

        {/* chart */}
        <div style={{ padding: "16px 22px", borderBottom: `2px solid ${T.ink}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}>TOP SET · 9 WEEKS</span>
            <span style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1, color: T.accent }}>▲ +18KG</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: 118,
              marginTop: 14,
              borderBottom: `2px solid ${T.ink}`,
            }}
          >
            {BARS.map((b, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: b.h,
                  background: b.kind === "pb" ? T.accent : b.kind === "out" ? T.soft : T.line,
                  boxShadow: b.kind === "out" ? `inset 0 0 0 2px ${T.ink}` : "none",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              font: `700 9px/1 ${FONT.mono}`,
              letterSpacing: 1,
              color: T.sub,
              marginTop: 8,
            }}
          >
            <span>JAN</span>
            <span>FEB</span>
            <span>NOW</span>
          </div>
        </div>

        {/* session history */}
        <div style={{ padding: "6px 22px 0" }}>
          <SessionRow date="12 MAR" sets={["140★", "135", "130"]} />
          <SessionRow date="05 MAR" sets={["135", "132", "130"]} />
          <SessionRow date="26 FEB" sets={["132", "130", "128"]} />
        </div>

        {/* notes */}
        <div style={{ padding: "16px 22px 8px" }}>
          <div style={{ border: `1.5px solid ${T.line}`, padding: "13px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}>NOTES</span>
              <span style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1, color: T.accent, cursor: "pointer" }}>
                + ADD
              </span>
            </div>
            <div style={{ font: `700 14px/1.45 ${FONT.archivo}`, marginTop: 9 }}>
              Belt on from set 2. Depth felt clean — push 142.5 next week.
            </div>
          </div>
        </div>
      </div>
    </ScreenBody>
  );
}

function SessionRow({ date, sets }: { date: string; sets: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "13px 0",
        borderBottom: `1px solid ${T.line}`,
      }}
    >
      <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.sub, letterSpacing: 1 }}>{date}</span>
      <span style={{ font: `700 13px/1 ${FONT.mono}` }}>
        {sets.map((s, i) => {
          const star = s.endsWith("★");
          return (
            <span key={i}>
              {star ? s.slice(0, -1) : s}
              {star && <span style={{ color: T.accent }}>★</span>}
              {i < sets.length - 1 && " · "}
            </span>
          );
        })}
      </span>
    </div>
  );
}
