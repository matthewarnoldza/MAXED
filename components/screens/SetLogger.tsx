"use client";

import { FONT, T } from "@/lib/tokens";
import { num, fmtClock } from "@/lib/format";
import { useApp } from "@/store/useApp";

export function SetLogger() {
  const go = useApp((s) => s.go);
  const L = useApp((s) => s.log);
  const incW = useApp((s) => s.incW);
  const decW = useApp((s) => s.decW);
  const incR = useApp((s) => s.incR);
  const decR = useApp((s) => s.decR);
  const logSet = useApp((s) => s.logSet);
  const skipRest = useApp((s) => s.skipRest);

  const delta = L.w - L.last.w;
  const deltaStr = (delta > 0 ? "+" : "") + num(delta);
  const nextSet = L.sets.length + 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "54px 0 30px",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.archivo,
        color: T.ink,
        background: T.bg,
        overflow: "hidden",
        animation: "screenIn .28s ease-out",
      }}
    >
      {/* progress segments */}
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 6, background: T.accent }} />
        <div style={{ flex: 1, height: 6, background: T.line }} />
        <div style={{ flex: 1, height: 6, background: T.line }} />
      </div>

      <div style={{ padding: "12px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => go("plan")}
          style={{
            border: "none",
            background: "transparent",
            color: T.sub,
            font: `700 13px/1 ${FONT.mono}`,
            letterSpacing: 1,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ‹ EXERCISE 01 / 03
        </button>
        <span style={{ font: `700 13px/1 ${FONT.mono}`, color: T.accent, letterSpacing: 1 }}>
          PB {num(L.pb)}
        </span>
      </div>

      <div style={{ padding: "4px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <button
          onClick={() => go("history")}
          style={{
            border: "none",
            background: "transparent",
            color: T.ink,
            font: `400 30px/1 ${FONT.anton}`,
            textTransform: "uppercase",
            letterSpacing: -0.5,
            whiteSpace: "nowrap",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {L.exercise}
        </button>
        <div style={{ flex: "none", font: `700 12px/1 ${FONT.mono}`, color: T.sub, whiteSpace: "nowrap" }}>
          vs LAST <span style={{ color: T.accent }}>{deltaStr}</span>
        </div>
      </div>

      {/* hero weight row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px 6px" }}>
        <StepBtn onClick={decW} filled={false}>−</StepBtn>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              font: `400 94px/.78 ${FONT.anton}`,
              letterSpacing: -3,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {num(L.w)}
          </div>
          <div style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 3, color: T.accent, marginTop: 4 }}>
            KILOS · +{L.inc}
          </div>
        </div>
        <StepBtn onClick={incW} filled>+</StepBtn>
      </div>

      {/* reps row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: `2px solid ${T.ink}`,
          borderBottom: `2px solid ${T.ink}`,
        }}
      >
        <button onClick={decR} style={repBtn("right")}>
          −
        </button>
        <div style={{ flex: 1, textAlign: "center", padding: "9px 0" }}>
          <span style={{ font: `400 38px/1 ${FONT.anton}` }}>{L.r}</span>
          <span style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}> REPS</span>
        </div>
        <button onClick={incR} style={repBtn("left")}>
          +
        </button>
      </div>

      {/* set ledger */}
      <div style={{ padding: "10px 22px 0", flex: 1, minHeight: 0, overflowY: "auto" }}>
        {L.sets.map((set, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            <span style={{ font: `700 13px/1 ${FONT.mono}`, color: T.sub }}>SET {i + 1}</span>
            <span style={{ font: `400 24px/1 ${FONT.anton}` }}>
              {num(set.w)}
              <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.sub }}> × {set.r}</span>
            </span>
            {set.pb ? (
              <span
                style={{
                  font: `700 10px/1 ${FONT.mono}`,
                  color: "#fff",
                  background: T.accent,
                  padding: "4px 6px",
                  letterSpacing: 1,
                }}
              >
                PB
              </span>
            ) : (
              <span style={{ width: 26 }} />
            )}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", opacity: 0.5 }}>
          <span style={{ font: `700 13px/1 ${FONT.mono}`, color: T.sub }}>SET {nextSet}</span>
          <span style={{ font: `700 13px/1 ${FONT.mono}`, color: T.sub }}>
            TARGET {num(L.last.w)} × {L.last.r}
          </span>
        </div>
      </div>

      {/* footer: rest bar + log + advance */}
      <div style={{ padding: "0 22px" }}>
        {L.restOn && (
          <div style={{ display: "flex", alignItems: "center", background: T.ink, color: T.bg, marginBottom: 10 }}>
            <span style={{ flex: 1, font: `700 12px/1 ${FONT.mono}`, letterSpacing: 2, padding: "0 16px" }}>REST</span>
            <span style={{ font: `400 38px/1 ${FONT.anton}`, padding: "9px 16px", fontVariantNumeric: "tabular-nums" }}>
              {fmtClock(L.rest)}
            </span>
            <button
              onClick={skipRest}
              style={{
                border: "none",
                background: T.accent,
                color: "#fff",
                font: `700 13px/1 ${FONT.mono}`,
                padding: "0 18px",
                alignSelf: "stretch",
                cursor: "pointer",
                letterSpacing: 1,
              }}
            >
              SKIP
            </button>
          </div>
        )}
        <button
          onClick={logSet}
          style={{
            width: "100%",
            border: "none",
            background: T.accent,
            color: "#fff",
            padding: 20,
            font: `400 28px/1 ${FONT.anton}`,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Log set {nextSet}
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 2px 0",
            font: `700 12px/1 ${FONT.mono}`,
            letterSpacing: 1,
            color: T.sub,
          }}
        >
          <span>SWIPE TO ADVANCE</span>
          <button
            onClick={() => go("history")}
            style={{
              border: "none",
              background: "transparent",
              color: T.ink,
              font: `700 12px/1 ${FONT.mono}`,
              letterSpacing: 1,
              cursor: "pointer",
              padding: 0,
            }}
          >
            NEXT: ROMANIAN DL ›
          </button>
        </div>
      </div>

      {/* PB flash + celebration */}
      {L.flash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: T.accent,
            animation: "flashfade .6s ease-out",
            pointerEvents: "none",
          }}
        />
      )}
      {L.pbFire && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: T.accent,
              color: "#fff",
              padding: "24px 32px",
              animation: "pbpop .5s ease-out",
              textAlign: "center",
            }}
          >
            <div style={{ font: `400 44px/.9 ${FONT.anton}`, letterSpacing: 1 }}>NEW PB</div>
            <div style={{ font: `700 14px/1 ${FONT.mono}`, marginTop: 6 }}>{num(L.w)} KG</div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBtn({
  children,
  onClick,
  filled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  filled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 74,
        height: 74,
        border: `3px solid ${T.ink}`,
        background: filled ? T.ink : T.bg,
        color: filled ? T.bg : T.ink,
        font: `400 46px/1 ${FONT.anton}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
      }}
    >
      {children}
    </button>
  );
}

function repBtn(borderSide: "left" | "right"): React.CSSProperties {
  return {
    width: 60,
    padding: "13px 0",
    border: "none",
    [borderSide === "right" ? "borderRight" : "borderLeft"]: `2px solid ${T.ink}`,
    background: T.bg,
    color: T.ink,
    font: `400 30px/1 ${FONT.anton}`,
    cursor: "pointer",
  } as React.CSSProperties;
}
