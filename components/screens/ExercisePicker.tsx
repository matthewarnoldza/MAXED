"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { SearchIcon } from "@/components/ui/icons";
import { EXERCISES, GROUP_ORDER } from "@/lib/exercises";
import { useApp } from "@/store/useApp";

/** Full-screen overlay to pick an exercise (search, grouped list, or add your own).
 *  Reused for swapping / adding a lift mid-workout. */
export function ExercisePicker({
  title,
  onPick,
  onClose,
}: {
  title: string;
  onPick: (name: string) => void;
  onClose: () => void;
}) {
  const customExercises = useApp((s) => s.customExercises);
  const registerCustom = useApp((s) => s.registerCustomExercise);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");

  const query = q.trim().toUpperCase();
  const all = [
    ...EXERCISES.map((e) => ({ name: e.name, group: e.group, m: e.m })),
    ...customExercises.map((c) => ({ name: c.name, group: c.group || "Your exercises", m: "CUSTOM" })),
  ];
  const filtered = all.filter((e) => !query || e.name.toUpperCase().includes(query));
  const groups = [...GROUP_ORDER, "Your exercises"]
    .map((g) => ({ g, items: filtered.filter((e) => e.group === g) }))
    .filter((x) => x.items.length);

  const addCustom = () => {
    const c = custom.trim();
    if (!c) return;
    registerCustom(c);
    onPick(c);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        animation: "screenIn .2s ease-out",
        padding: "calc(env(safe-area-inset-top, 0px) + 12px) 0 calc(env(safe-area-inset-bottom, 0px) + 12px)",
      }}
    >
      <div style={{ padding: "0 22px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <span style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 2, color: T.accent }}>{title}</span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ border: "none", background: "transparent", color: T.sub, font: `400 28px/1 ${FONT.anton}`, cursor: "pointer", width: 44, height: 36, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "0 22px 12px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, border: `2px solid ${T.ink}`, padding: "11px 13px", color: T.sub }}>
          <SearchIcon />
          <input className="mxin" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH" style={inp} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${T.line}`, padding: "9px 11px", marginTop: 10 }}>
          <span style={{ color: T.accent, font: `400 22px/1 ${FONT.anton}`, lineHeight: 0 }}>+</span>
          <input
            className="mxin"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="ADD YOUR OWN"
            maxLength={40}
            style={{ ...inp, color: T.ink }}
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim()}
            style={{ flex: "none", border: "none", background: custom.trim() ? T.accent : T.line, color: "#fff", font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, padding: "9px 12px", cursor: custom.trim() ? "pointer" : "default" }}
          >
            ADD
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", borderTop: `2px solid ${T.ink}` }}>
        {groups.map(({ g, items }) => (
          <div key={g}>
            <div style={{ position: "sticky", top: 0, background: T.bg, padding: "10px 22px 6px", font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.accent, borderBottom: `1px solid ${T.line}`, zIndex: 2 }}>
              {g.toUpperCase()}
            </div>
            {items.map((ex) => (
              <button key={ex.name} onClick={() => onPick(ex.name)} style={row}>
                <span style={{ font: `700 15px/1.1 ${FONT.archivo}` }}>{ex.name}</span>
                <span style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub }}>{ex.m}</span>
              </button>
            ))}
          </div>
        ))}
        {groups.length === 0 && (
          <div style={{ padding: "30px 22px", textAlign: "center", font: `700 12px/1.6 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>
            NO MATCH — use ADD YOUR OWN above.
          </div>
        )}
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  border: "none",
  background: "transparent",
  outline: "none",
  font: `700 13px/1 ${FONT.mono}`,
  letterSpacing: 1,
  color: "var(--mx-ink)",
  width: "100%",
  textTransform: "uppercase",
};
const row: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 10,
  padding: "12px 22px",
  border: "none",
  borderBottom: `1px solid ${T.line}`,
  background: "transparent",
  color: T.ink,
  cursor: "pointer",
  textAlign: "left",
};
