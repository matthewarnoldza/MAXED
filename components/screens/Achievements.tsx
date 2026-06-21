"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { ExercisePicker } from "@/components/screens/ExercisePicker";
import { num } from "@/lib/format";
import { historyFor } from "@/lib/derive";
import { useApp } from "@/store/useApp";

export function Achievements() {
  const go = useApp((s) => s.go);
  const pinned = useApp((s) => s.pinned);
  const sessions = useApp((s) => s.sessions);
  const togglePin = useApp((s) => s.togglePin);
  const openHistory = useApp((s) => s.openHistory);
  const [pick, setPick] = useState(false);

  return (
    <ScreenBody>
      <BackRow left="‹ HOME" right="MAX BOARD" onBack={() => go("home")} />

      <div style={{ padding: "12px 22px 16px", borderBottom: `2px solid ${T.ink}`, flex: "none" }}>
        <div style={{ font: `400 40px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>Maxes</div>
        <div style={{ font: `700 10px/1.5 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 8 }}>
          YOUR HEAVIEST LIFTS · PIN TARGETS TO CHASE
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {pinned.map((name) => {
          const h = historyFor(sessions, name);
          return (
            <div key={name} style={{ borderBottom: `1px solid ${T.line}`, padding: "16px 22px", display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => openHistory(name)}
                style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", color: T.ink, textAlign: "left", cursor: "pointer", padding: 0 }}
              >
                <div style={{ font: `700 12px/1.2 ${FONT.mono}`, letterSpacing: 1, color: T.sub, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                  <span style={{ font: `400 54px/.85 ${FONT.anton}`, color: h.hasData ? T.accent : T.line }}>{h.hasData ? num(h.pb) : "—"}</span>
                  <span style={{ font: `700 15px/1 ${FONT.mono}`, color: T.sub }}>KG</span>
                </div>
                <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 6 }}>
                  {h.hasData ? `×${h.pbReps} · ${h.pbDateLabel} · EST 1RM ${h.e1rmBest}` : "NOT LOGGED YET — GO SET IT"}
                </div>
              </button>
              <button onClick={() => togglePin(name)} aria-label={`Unpin ${name}`} style={unpinBtn}>
                ×
              </button>
            </div>
          );
        })}

        {pinned.length === 0 && (
          <div style={{ padding: "32px 22px 12px", textAlign: "center", font: `700 12px/1.7 ${FONT.mono}`, color: T.sub, letterSpacing: 1 }}>
            NO MAXES PINNED.
            <br />
            Pin a lift to track your heaviest.
          </div>
        )}

        <div style={{ padding: "14px 22px" }}>
          <button
            onClick={() => setPick(true)}
            style={{ width: "100%", border: `2px dashed ${T.line}`, background: "transparent", color: T.sub, padding: 16, font: `700 12px/1 ${FONT.mono}`, letterSpacing: 1.5, cursor: "pointer" }}
          >
            ＋ PIN AN EXERCISE
          </button>
        </div>
        <div style={{ height: 8 }} />
      </div>

      {pick && (
        <ExercisePicker
          title="PIN AN EXERCISE"
          onClose={() => setPick(false)}
          onPick={(n) => {
            if (!pinned.includes(n)) togglePin(n);
            setPick(false);
          }}
        />
      )}
    </ScreenBody>
  );
}

const unpinBtn: React.CSSProperties = {
  flex: "none",
  width: 34,
  height: 34,
  border: `1.5px solid ${T.line}`,
  background: "transparent",
  color: T.sub,
  font: `400 20px/1 ${FONT.anton}`,
  cursor: "pointer",
  lineHeight: 0,
};
