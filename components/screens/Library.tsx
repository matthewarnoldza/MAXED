"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { SearchIcon, SparkIcon } from "@/components/ui/icons";
import { EXERCISES, CATEGORIES } from "@/lib/exercises";
import { useApp } from "@/store/useApp";

export function Library() {
  const go = useApp((s) => s.go);
  const query = useApp((s) => s.library.query);
  const category = useApp((s) => s.library.category);
  const stances = useApp((s) => s.stances);
  const setQuery = useApp((s) => s.setQuery);
  const setCategory = useApp((s) => s.setCategory);
  const setStance = useApp((s) => s.setStance);
  const addToPlan = useApp((s) => s.addToPlan);

  const q = query.trim().toUpperCase();
  const list = EXERCISES.filter(
    (e) => (category === "ALL" || e.cat === category) && (!q || e.name.toUpperCase().includes(q))
  );

  const add = (name: string) => {
    addToPlan(name);
    go("plan");
  };

  return (
    <ScreenBody>
      <BackRow left="‹ PLAN" right="LIBRARY" onBack={() => go("plan")} />

      <div style={{ padding: "12px 22px 0" }}>
        <div style={{ font: `400 36px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
          Add a lift
        </div>
        <div style={{ font: `700 10px/1.5 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 8 }}>
          TAP ♥ TO FAVOUR · ⊘ TO BAN — THE COACH REMEMBERS
        </div>
      </div>

      <div style={{ padding: "14px 22px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, border: `2px solid ${T.ink}`, padding: "13px 14px", color: T.sub }}>
          <SearchIcon />
          <input
            className="mxin"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH LIFTS"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              font: `700 13px/1 ${FONT.mono}`,
              letterSpacing: 1,
              color: T.ink,
              width: "100%",
              textTransform: "uppercase",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
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
                  padding: "8px 12px",
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

      <div style={{ flex: 1, overflowY: "auto", borderTop: `2px solid ${T.ink}` }}>
        {list.map((ex) => {
          const stance = stances[ex.name];
          const banned = stance === "banned";
          const loved = stance === "love";
          return (
            <div
              key={ex.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                borderBottom: `1px solid ${T.line}`,
                opacity: banned ? 0.5 : 1,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `700 16px/1.1 ${FONT.archivo}`, textDecoration: banned ? "line-through" : "none" }}>
                  {ex.name}
                </div>
                <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: loved ? T.accent : T.sub, marginTop: 5 }}>
                  {banned ? "BANNED" : loved ? "♥ FAVOURITE" : `${ex.cat} · ${ex.m}`}
                </div>
              </div>
              <StanceBtn active={loved} onClick={() => setStance(ex.name, loved ? null : "love")} label={`Favour ${ex.name}`}>
                ♥
              </StanceBtn>
              <StanceBtn active={banned} onClick={() => setStance(ex.name, banned ? null : "banned")} label={`Ban ${ex.name}`}>
                ⊘
              </StanceBtn>
              <button
                onClick={() => add(ex.name)}
                aria-label={`Add ${ex.name}`}
                style={{
                  width: 38,
                  height: 38,
                  border: `2px solid ${T.ink}`,
                  background: "transparent",
                  color: T.ink,
                  font: `400 26px/1 ${FONT.anton}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 0,
                  flex: "none",
                }}
              >
                +
              </button>
            </div>
          );
        })}

        {list.length === 0 && (
          <div style={{ padding: "40px 22px", textAlign: "center", font: `700 12px/1.6 ${FONT.mono}`, letterSpacing: 1, color: T.sub }}>
            NO LIFTS MATCH
            <br />“{query}”
          </div>
        )}
      </div>

      <div style={{ padding: "12px 22px 0" }}>
        <button
          onClick={() => go("assistant")}
          style={{
            width: "100%",
            border: `2px solid ${T.ink}`,
            background: "transparent",
            color: T.ink,
            padding: 16,
            font: `700 13px/1 ${FONT.mono}`,
            letterSpacing: 2,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ color: T.accent, display: "inline-flex" }}>
              <SparkIcon />
            </span>
            ASK COACH AI
          </span>
          <span style={{ color: T.accent }}>›</span>
        </button>
      </div>
    </ScreenBody>
  );
}

function StanceBtn({ children, active, onClick, label }: { children: React.ReactNode; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 38,
        border: `2px solid ${active ? T.accent : T.line}`,
        background: active ? T.accent : "transparent",
        color: active ? "#fff" : T.sub,
        font: `700 15px/1 ${FONT.archivo}`,
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
