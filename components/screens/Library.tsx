"use client";

import { FONT, T } from "@/lib/tokens";
import { ScreenBody, BackRow } from "@/components/screens/Frame";
import { SearchIcon } from "@/components/ui/icons";
import { EXERCISES, CATEGORIES } from "@/lib/exercises";
import { useApp } from "@/store/useApp";

export function Library() {
  const go = useApp((s) => s.go);
  const query = useApp((s) => s.library.query);
  const category = useApp((s) => s.library.category);
  const setQuery = useApp((s) => s.setQuery);
  const setCategory = useApp((s) => s.setCategory);
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
      </div>

      <div style={{ padding: "16px 22px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: `2px solid ${T.ink}`,
            padding: "13px 14px",
            color: T.sub,
          }}
        >
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
        {list.map((ex) => (
          <div
            key={ex.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 22px",
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: `700 16px/1.1 ${FONT.archivo}` }}>{ex.name}</div>
              <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginTop: 5 }}>
                {ex.cat} · {ex.m}
              </div>
            </div>
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
              }}
            >
              +
            </button>
          </div>
        ))}

        {list.length === 0 && (
          <div
            style={{
              padding: "40px 22px",
              textAlign: "center",
              font: `700 12px/1.6 ${FONT.mono}`,
              letterSpacing: 1,
              color: T.sub,
            }}
          >
            NO LIFTS MATCH
            <br />“{query}”
          </div>
        )}
      </div>

      {/* entry to the AI assistant */}
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
          <span>✦ ASK COACH AI</span>
          <span style={{ color: T.accent }}>›</span>
        </button>
      </div>
    </ScreenBody>
  );
}
