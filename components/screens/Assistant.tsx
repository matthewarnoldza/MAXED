"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { ScreenBody } from "@/components/screens/Frame";
import { useApp } from "@/store/useApp";

export function Assistant() {
  const go = useApp((s) => s.go);
  const a = useApp((s) => s.assistant);
  const generate = useApp((s) => s.generate);
  const accept = useApp((s) => s.acceptPlan);
  const discard = useApp((s) => s.discardPlan);
  const reset = useApp((s) => s.resetAssistant);

  const [draft, setDraft] = useState(a.prompt);
  const loading = a.status === "loading";
  const plan = a.plan;

  return (
    <ScreenBody>
      {/* header row */}
      <div
        style={{
          padding: "0 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => go("home")}
          style={{
            border: "none",
            background: "transparent",
            color: T.sub,
            font: `700 13px/1 ${FONT.mono}`,
            letterSpacing: 1,
            cursor: "pointer",
            padding: "6px 6px 6px 0",
          }}
        >
          ‹ HOME
        </button>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            font: `700 12px/1 ${FONT.mono}`,
            letterSpacing: 1,
            color: T.accent,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: T.accent,
              borderRadius: "50%",
              animation: loading ? "glowpulse .6s infinite" : "glowpulse 1.1s infinite",
            }}
          />
          {loading ? "THINKING" : "INCOMING"}
        </span>
      </div>

      {plan && (
        <div style={{ padding: "14px 22px 16px", borderBottom: `2px solid ${T.ink}` }}>
          <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}>
            COACH AI · GENERATED A PLAN
          </div>
          <div
            style={{
              font: `400 44px/.88 ${FONT.anton}`,
              textTransform: "uppercase",
              letterSpacing: -0.5,
              marginTop: 10,
            }}
          >
            {plan.title.split("\n").map((l, i) => (
              <span key={i}>
                {l}
                {i < plan.title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
          <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginTop: 12 }}>
            {plan.meta}
          </div>
        </div>
      )}

      {/* you asked */}
      <div style={{ padding: "14px 22px 0" }}>
        <div style={{ border: `1.5px solid ${T.line}`, padding: "12px 14px" }}>
          <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub }}>YOU ASKED</div>
          <div style={{ font: `700 14px/1.4 ${FONT.archivo}`, marginTop: 7 }}>“{a.prompt}”</div>
        </div>
      </div>

      {/* lift preview */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0" }}>
        {plan?.lifts.map((l, i) => {
          const isProg = l.load.trim().startsWith("+");
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "11px 0",
                borderBottom: `1px solid ${T.line}`,
              }}
            >
              <span style={{ font: `700 15px/1 ${FONT.archivo}` }}>{l.name}</span>
              <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.sub }}>
                {l.sets}×{l.reps} ·{" "}
                <span style={{ color: isProg ? T.accent : T.sub }}>{l.load}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* refine prompt */}
      <div style={{ padding: "12px 22px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `2px solid ${T.line}`,
            padding: "10px 12px",
          }}
        >
          <input
            className="mxin"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim() && !loading) generate(draft.trim());
            }}
            placeholder="ASK FOR A PLAN…"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              font: `700 12px/1.3 ${FONT.mono}`,
              letterSpacing: 0.5,
              color: T.ink,
              width: "100%",
            }}
          />
          <button
            onClick={() => draft.trim() && !loading && generate(draft.trim())}
            disabled={loading}
            style={{
              flex: "none",
              border: "none",
              background: T.ink,
              color: T.bg,
              font: `700 11px/1 ${FONT.mono}`,
              letterSpacing: 1,
              padding: "9px 11px",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "···" : "SEND"}
          </button>
        </div>
      </div>

      {/* actions */}
      <div style={{ padding: "12px 22px 0" }}>
        {a.status === "pending" || a.status === "loading" || a.status === "error" ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={discard}
              style={{
                flex: "none",
                width: 104,
                border: `2px solid ${T.ink}`,
                background: "transparent",
                color: T.ink,
                padding: "18px 0",
                font: `700 13px/1 ${FONT.mono}`,
                letterSpacing: 1,
                cursor: "pointer",
              }}
            >
              DISCARD
            </button>
            <button
              onClick={accept}
              style={{
                flex: 1,
                border: "none",
                background: T.accent,
                color: "#fff",
                padding: 18,
                font: `400 26px/1 ${FONT.anton}`,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Accept plan
            </button>
          </div>
        ) : a.status === "accepted" ? (
          <div
            style={{
              background: T.ink,
              color: T.bg,
              padding: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ font: `400 24px/1 ${FONT.anton}`, letterSpacing: 1 }}>ADDED TO PLAN ✓</span>
            <div style={{ display: "flex", gap: 14 }}>
              <UnderlineBtn color={T.bg} onClick={reset}>
                UNDO
              </UnderlineBtn>
              <UnderlineBtn color={T.accent} onClick={() => go("plan")}>
                VIEW
              </UnderlineBtn>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: `2px solid ${T.line}`,
              color: T.sub,
              padding: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1 }}>PLAN DISCARDED</span>
            <UnderlineBtn color={T.accent} onClick={reset}>
              UNDO
            </UnderlineBtn>
          </div>
        )}
      </div>
    </ScreenBody>
  );
}

function UnderlineBtn({
  children,
  color,
  onClick,
}: {
  children: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        color,
        font: `700 11px/1 ${FONT.mono}`,
        letterSpacing: 1,
        cursor: "pointer",
        textDecoration: "underline",
      }}
    >
      {children}
    </button>
  );
}
