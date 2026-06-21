"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { SearchIcon } from "@/components/ui/icons";
import { EXERCISES, CATEGORIES, GROUP_ORDER, type Category } from "@/lib/exercises";
import { useApp } from "@/store/useApp";

interface Row {
  name: string;
  cat: Category | null;
  group: string;
  m: string;
}

export function Library() {
  const go = useApp((s) => s.go);
  const query = useApp((s) => s.library.query);
  const category = useApp((s) => s.library.category);
  const stances = useApp((s) => s.stances);
  const plan = useApp((s) => s.plan);
  const customExercises = useApp((s) => s.customExercises);
  const setQuery = useApp((s) => s.setQuery);
  const setCategory = useApp((s) => s.setCategory);
  const setStance = useApp((s) => s.setStance);
  const togglePlan = useApp((s) => s.togglePlan);
  const addCustomExercise = useApp((s) => s.addCustomExercise);

  const [custom, setCustom] = useState("");

  const inPlan = new Set(plan.map((p) => p.name.toLowerCase()));
  const q = query.trim().toUpperCase();

  const all: Row[] = [
    ...EXERCISES.map((e) => ({ name: e.name, cat: e.cat, group: e.group, m: e.m })),
    ...customExercises.map((c) => ({ name: c.name, cat: null, group: c.group || "Your exercises", m: "CUSTOM" })),
  ];
  const filtered = all.filter(
    (e) => (category === "ALL" || e.cat === category) && (!q || e.name.toUpperCase().includes(q))
  );
  const order = [...GROUP_ORDER, "Your exercises"];
  const groups = order
    .map((g) => ({ g, items: filtered.filter((e) => e.group === g) }))
    .filter((x) => x.items.length);

  const addCustom = () => {
    const c = custom.trim();
    if (!c) return;
    addCustomExercise(c);
    setCustom("");
  };

  return (
    <ScreenBody>
      <BackRow left="‹ BACK" right="BUILD" onBack={() => go("plan")} />

      <div style={{ padding: "12px 22px 0", flex: "none" }}>
        <div style={{ font: `400 36px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
          Build workout
        </div>
        <div style={{ font: `700 10px/1.5 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 8 }}>
          {plan.length} EXERCISE{plan.length === 1 ? "" : "S"} IN YOUR WORKOUT · TAP + TO ADD
        </div>
      </div>

      {/* search + custom add + filters */}
      <div style={{ padding: "12px 22px 12px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, border: `2px solid ${T.ink}`, padding: "11px 13px", color: T.sub }}>
          <SearchIcon />
          <input
            className="mxin"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH LIFTS"
            style={inputStyle}
          />
        </div>

        {/* free-text: add your own */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${T.line}`, padding: "9px 11px", marginTop: 10 }}>
          <span style={{ color: T.accent, font: `400 22px/1 ${FONT.anton}`, lineHeight: 0 }}>+</span>
          <input
            className="mxin"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="ADD YOUR OWN EXERCISE"
            maxLength={40}
            style={{ ...inputStyle, color: T.ink }}
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim()}
            style={{
              flex: "none",
              border: "none",
              background: custom.trim() ? T.accent : T.line,
              color: "#fff",
              font: `700 11px/1 ${FONT.mono}`,
              letterSpacing: 1,
              padding: "9px 12px",
              cursor: custom.trim() ? "pointer" : "default",
            }}
          >
            ADD
          </button>
        </div>

        <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  border: `2px solid ${active ? T.ink : T.line}`,
                  background: active ? T.ink : "transparent",
                  color: active ? T.bg : T.sub,
                  padding: "7px 11px",
                  font: `700 11px/1 ${FONT.mono}`,
                  letterSpacing: 1,
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* grouped list */}
      <div style={{ flex: 1, overflowY: "auto", borderTop: `2px solid ${T.ink}` }}>
        {groups.map(({ g, items }) => (
          <div key={g}>
            <div
              style={{
                position: "sticky",
                top: 0,
                background: T.bg,
                padding: "10px 22px 6px",
                font: `700 10px/1 ${FONT.mono}`,
                letterSpacing: 2,
                color: T.accent,
                borderBottom: `1px solid ${T.line}`,
                zIndex: 2,
              }}
            >
              {g.toUpperCase()} · {items.length}
            </div>
            {items.map((ex) => {
              const stance = stances[ex.name];
              const banned = stance === "banned";
              const loved = stance === "love";
              const added = inPlan.has(ex.name.toLowerCase());
              return (
                <div
                  key={ex.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 22px",
                    borderBottom: `1px solid ${T.line}`,
                    opacity: banned ? 0.45 : 1,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: `700 15px/1.1 ${FONT.archivo}`, textDecoration: banned ? "line-through" : "none" }}>
                      {ex.name}
                    </div>
                    <div style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1.5, color: loved ? T.accent : T.sub, marginTop: 5 }}>
                      {banned ? "BANNED" : loved ? "♥ FAVOURITE" : ex.m}
                    </div>
                  </div>
                  <StanceBtn active={loved} onClick={() => setStance(ex.name, loved ? null : "love")} label={`Favour ${ex.name}`}>
                    ♥
                  </StanceBtn>
                  <StanceBtn active={banned} onClick={() => setStance(ex.name, banned ? null : "banned")} label={`Ban ${ex.name}`}>
                    ⊘
                  </StanceBtn>
                  <button
                    onClick={() => togglePlan(ex.name)}
                    aria-label={added ? `Remove ${ex.name}` : `Add ${ex.name}`}
                    style={{
                      width: 38,
                      height: 38,
                      border: `2px solid ${added ? T.accent : T.ink}`,
                      background: added ? T.accent : "transparent",
                      color: added ? "#fff" : T.ink,
                      font: `400 24px/1 ${FONT.anton}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 0,
                      flex: "none",
                    }}
                  >
                    {added ? "✓" : "+"}
                  </button>
                </div>
              );
            })}
          </div>
        ))}

        {groups.length === 0 && (
          <div style={{ padding: "40px 22px", textAlign: "center", font: `700 12px/1.6 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>
            NO LIFTS MATCH “{query}”.
            <br />
            Use <span style={{ color: T.accent }}>ADD YOUR OWN</span> above to create it.
          </div>
        )}
      </div>

      {/* done */}
      <div style={{ padding: "12px 22px 0", flex: "none" }}>
        <button
          onClick={() => go("plan")}
          style={{
            width: "100%",
            border: "none",
            background: T.ink,
            color: T.bg,
            padding: 18,
            font: `400 26px/1 ${FONT.anton}`,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Done
          <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.accent, letterSpacing: 1 }}>
            {plan.length} IN WORKOUT ›
          </span>
        </button>
      </div>
    </ScreenBody>
  );
}

const inputStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  outline: "none",
  font: `700 13px/1 ${FONT.mono}`,
  letterSpacing: 1,
  color: "var(--mx-ink)",
  width: "100%",
  textTransform: "uppercase",
};

function StanceBtn({ children, active, onClick, label }: { children: React.ReactNode; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 32,
        height: 38,
        border: `2px solid ${active ? T.accent : T.line}`,
        background: active ? T.accent : "transparent",
        color: active ? "#fff" : T.sub,
        font: `700 14px/1 ${FONT.archivo}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        flex: "none",
      }}
    >
      {children}
    </button>
  );
}
