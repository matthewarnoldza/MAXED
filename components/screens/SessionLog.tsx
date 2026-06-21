"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { num } from "@/lib/format";
import { useApp } from "@/store/useApp";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }).toUpperCase();
}

export function SessionLog() {
  const go = useApp((s) => s.go);
  const sessions = useApp((s) => s.sessions);
  const repeatSession = useApp((s) => s.repeatSession);
  const deleteSession = useApp((s) => s.deleteSession);
  const openHistory = useApp((s) => s.openHistory);
  const [open, setOpen] = useState<number | null>(sessions[0]?.id ?? null);

  return (
    <ScreenBody>
      <BackRow left="‹ HOME" right="TRAINING LOG" onBack={() => go("home")} />

      <div style={{ padding: "12px 22px 14px", borderBottom: `2px solid ${T.ink}`, flex: "none" }}>
        <div style={{ font: `400 36px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
          Training log
        </div>
        <div style={{ font: `700 10px/1.5 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 8 }}>
          {sessions.length} SESSION{sessions.length === 1 ? "" : "S"} · TAP TO EXPAND · ↻ REPEAT ANY WORKOUT
        </div>
      </div>

      {sessions.length === 0 ? (
        <div style={{ margin: "auto", textAlign: "center", padding: "0 30px" }}>
          <div style={{ font: `700 12px/1.7 ${FONT.mono}`, color: T.sub, letterSpacing: 1 }}>
            NO WORKOUTS LOGGED YET.
            <br />
            Finish a session and it lands here — ready to repeat.
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {sessions.map((s) => {
            const totalSets = s.entries.reduce((a, e) => a + e.sets.length, 0);
            let topName = "";
            let topW = 0;
            for (const e of s.entries) for (const st of e.sets) if (st.w > topW) { topW = st.w; topName = e.name; }
            const isOpen = open === s.id;
            return (
              <div key={s.id} style={{ borderBottom: `1px solid ${T.line}` }}>
                <button onClick={() => setOpen(isOpen ? null : s.id)} style={rowBtn}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={{ font: `700 11px/1 ${FONT.mono}`, color: T.accent, letterSpacing: 1 }}>{fmtDate(s.dateISO)}</span>
                      <span style={{ font: `700 10px/1 ${FONT.mono}`, color: T.sub, letterSpacing: 1 }}>{s.focus}</span>
                    </div>
                    <div style={{ font: `700 17px/1.1 ${FONT.archivo}`, marginTop: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.title}
                    </div>
                    <div style={{ font: `700 10px/1 ${FONT.mono}`, color: T.sub, letterSpacing: 1, marginTop: 5 }}>
                      {s.entries.length} LIFTS · {totalSets} SETS{topW ? ` · TOP ${topName.toUpperCase()} ${num(topW)}` : ""}
                    </div>
                  </div>
                  <span style={{ font: `400 24px/1 ${FONT.anton}`, color: T.sub, marginLeft: 10 }}>{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 22px 14px" }}>
                    {s.entries.map((e, i) => {
                      const top = e.sets.reduce((a, b) => (b.w > a.w ? b : a), e.sets[0]);
                      return (
                        <button key={i} onClick={() => openHistory(e.name)} style={liftRow}>
                          <span style={{ font: `700 13px/1.2 ${FONT.archivo}`, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                            {e.name}
                          </span>
                          <span style={{ font: `700 12px/1 ${FONT.mono}`, whiteSpace: "nowrap" }}>
                            {e.sets.map((st, j) => (
                              <span key={j} style={{ color: st.pb ? T.accent : st.w === top.w && st.r === top.r ? T.ink : T.sub }}>
                                {num(st.w)}×{st.r}
                                {st.pb ? "★" : ""}
                                {j < e.sets.length - 1 ? "  " : ""}
                              </span>
                            ))}
                          </span>
                        </button>
                      );
                    })}
                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button onClick={() => repeatSession(s.id)} style={repeatBtn}>↻ Repeat workout</button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete this session (${fmtDate(s.dateISO)} · ${s.title})? This can't be undone.`)) deleteSession(s.id);
                        }}
                        style={delBtn}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ height: 16 }} />
        </div>
      )}
    </ScreenBody>
  );
}

const rowBtn: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "14px 22px",
  border: "none",
  background: "transparent",
  color: T.ink,
  cursor: "pointer",
  textAlign: "left",
};
const liftRow: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
  padding: "9px 0",
  border: "none",
  borderBottom: `1px solid ${T.line}`,
  background: "transparent",
  color: T.ink,
  cursor: "pointer",
  textAlign: "left",
};
const repeatBtn: React.CSSProperties = {
  flex: 1,
  border: "none",
  background: T.accent,
  color: "#fff",
  padding: "14px 0",
  font: `400 20px/1 ${FONT.anton}`,
  letterSpacing: 1,
  textTransform: "uppercase",
  cursor: "pointer",
};
const delBtn: React.CSSProperties = {
  flex: "none",
  width: 96,
  border: `2px solid ${T.line}`,
  background: "transparent",
  color: T.sub,
  padding: "14px 0",
  font: `700 11px/1 ${FONT.mono}`,
  letterSpacing: 1,
  cursor: "pointer",
};
