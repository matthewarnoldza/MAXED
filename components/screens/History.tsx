"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { historyFor } from "@/lib/derive";
import { num } from "@/lib/format";
import { useApp } from "@/store/useApp";

export function History() {
  const go = useApp((s) => s.go);
  const name = useApp((s) => s.historyExercise);
  const sessions = useApp((s) => s.sessions);
  const liveActive = useApp((s) => s.live.active);

  const h = historyFor(sessions, name);
  const back = () => go(liveActive ? "logger" : "home");

  return (
    <ScreenBody>
      <BackRow left="‹ BACK" right="HISTORY" onBack={back} />

      <div style={{ padding: "10px 22px 14px", borderBottom: `2px solid ${T.ink}`, flex: "none" }}>
        <div style={{ font: `400 36px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
          {name}
        </div>
      </div>

      {!h.hasData ? (
        <div style={{ margin: "auto", textAlign: "center", padding: "0 28px" }}>
          <div style={{ font: `700 12px/1.7 ${FONT.mono}`, color: T.sub, letterSpacing: 1 }}>
            NO SETS LOGGED FOR
            <br />
            <span style={{ color: T.ink, font: `400 22px/1.2 ${FONT.anton}` }}>{name.toUpperCase()}</span>
            <br />
            <br />
            Log a few sets and your PB, trend and history appear here.
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* PB callout + stats */}
          <div style={{ display: "flex", borderBottom: `2px solid ${T.ink}` }}>
            <div style={{ flex: 1, padding: "16px 22px", borderRight: `2px solid ${T.ink}` }}>
              <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.accent }}>CURRENT PB</div>
              <div style={{ font: `400 56px/.82 ${FONT.anton}`, marginTop: 8, color: T.accent }}>{num(h.pb)}</div>
              <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 6 }}>
                ×{h.pbReps} · {h.pbDateLabel}
              </div>
            </div>
            <div style={{ flex: "none", width: 128, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, padding: "12px 16px", borderBottom: `1px solid ${T.line}` }}>
                <div style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>BEST E1RM</div>
                <div style={{ font: `400 24px/1 ${FONT.anton}`, marginTop: 5 }}>{h.e1rmBest}</div>
              </div>
              <div style={{ flex: 1, padding: "12px 16px" }}>
                <div style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>SESSIONS</div>
                <div style={{ font: `400 24px/1 ${FONT.anton}`, marginTop: 5 }}>{h.sessionsCount}</div>
              </div>
            </div>
          </div>

          {/* trend chart from real top sets */}
          {h.topSets.length >= 2 && <Chart topSets={h.topSets} delta={h.deltaKg} />}

          {/* session ledger */}
          <div style={{ padding: "6px 22px 0" }}>
            {h.recent.map((s, i) => {
              const top = s.sets.reduce((a, b) => (b.w > a.w ? b : a), s.sets[0]);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px 0",
                    borderBottom: `1px solid ${T.line}`,
                  }}
                >
                  <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.sub, letterSpacing: 1 }}>{s.label}</span>
                  <span style={{ font: `700 13px/1 ${FONT.mono}` }}>
                    {s.sets.map((st, j) => {
                      const isTop = st.w === top.w && st.r === top.r;
                      // heaviest set of the session reads in full ink; the rest are muted
                      return (
                        <span key={j} style={{ color: st.pb ? T.accent : isTop ? T.ink : T.sub }}>
                          {num(st.w)}
                          {st.pb && "★"}
                          {j < s.sets.length - 1 && <span style={{ color: T.sub }}> · </span>}
                        </span>
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ height: 14 }} />
        </div>
      )}
    </ScreenBody>
  );
}

function Chart({ topSets, delta }: { topSets: { w: number; label: string; pb: boolean }[]; delta: number }) {
  const max = Math.max(...topSets.map((t) => t.w));
  const min = Math.min(...topSets.map((t) => t.w));
  const span = Math.max(1, max - min);
  const height = (w: number) => `${30 + ((w - min) / span) * 70}%`;

  return (
    <div style={{ padding: "16px 22px", borderBottom: `2px solid ${T.ink}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}>
          TOP SET · {topSets.length} SESSIONS
        </span>
        <span style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1, color: delta >= 0 ? T.accent : T.sub }}>
          {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}{num(delta)}KG
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 118, marginTop: 14, borderBottom: `2px solid ${T.ink}` }}>
        {topSets.map((b, i) => (
          <div
            key={i}
            title={`${num(b.w)}kg · ${b.label}`}
            style={{
              flex: 1,
              height: height(b.w),
              background: b.pb ? T.accent : T.line,
              boxShadow: b.pb ? "none" : `inset 0 0 0 2px ${T.line}`,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 8 }}>
        <span>{topSets[0].label}</span>
        <span>{topSets[topSets.length - 1].label}</span>
      </div>
    </div>
  );
}
