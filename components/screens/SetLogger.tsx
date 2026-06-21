"use client";

import { useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { num, fmtClock } from "@/lib/format";
import { pbFor, lastTopFor } from "@/lib/derive";
import { PlayTriangle } from "@/components/ui/icons";
import { ExercisePicker } from "@/components/screens/ExercisePicker";
import { useApp } from "@/store/useApp";

export function SetLogger() {
  const go = useApp((s) => s.go);
  const live = useApp((s) => s.live);
  const sessions = useApp((s) => s.sessions);
  const incW = useApp((s) => s.incW);
  const decW = useApp((s) => s.decW);
  const incR = useApp((s) => s.incR);
  const decR = useApp((s) => s.decR);
  const cycleInc = useApp((s) => s.cycleInc);
  const logSet = useApp((s) => s.logSet);
  const skipRest = useApp((s) => s.skipRest);
  const prevLift = useApp((s) => s.prevLift);
  const nextLift = useApp((s) => s.nextLift);
  const finishWorkout = useApp((s) => s.finishWorkout);
  const startWorkout = useApp((s) => s.startWorkout);
  const openHistory = useApp((s) => s.openHistory);
  const liveSwapLift = useApp((s) => s.liveSwapLift);
  const liveAddLift = useApp((s) => s.liveAddLift);
  const liveRemoveLift = useApp((s) => s.liveRemoveLift);
  const [picker, setPicker] = useState<null | "swap" | "add">(null);

  const lift = live.lifts[live.liftIndex];

  if (!live.active || !lift) {
    return (
      <Shell>
        <div style={{ margin: "auto", textAlign: "center", padding: "0 28px" }}>
          <div style={{ font: `400 40px/.9 ${FONT.anton}`, textTransform: "uppercase" }}>No active workout</div>
          <div style={{ font: `700 12px/1.6 ${FONT.mono}`, color: T.sub, margin: "14px 0 22px", letterSpacing: 1 }}>
            Start today&apos;s plan to begin logging sets.
          </div>
          <button onClick={startWorkout} style={primaryBtn}>
            Start workout <PlayTriangle s={16} color="#fff" />
          </button>
          <button onClick={() => go("home")} style={ghostLink}>
            ‹ BACK HOME
          </button>
        </div>
      </Shell>
    );
  }

  const name = lift.name;
  const sets = live.entries[name] ?? [];
  const pb = pbFor(sessions, name, sets);
  const last = lastTopFor(sessions, name);
  const delta = last ? live.w - last.w : 0;
  const deltaStr = (delta > 0 ? "+" : "") + num(delta);
  const nextSet = sets.length + 1;
  const total = live.lifts.length;
  const isLast = live.liftIndex >= total - 1;

  return (
    <Shell>
      {/* progress segments — one per lift, accent = has logged sets */}
      <div style={{ padding: "0 22px", display: "flex", alignItems: "center", gap: 6 }}>
        {live.lifts.map((l, i) => {
          const done = (live.entries[l.name]?.length ?? 0) > 0;
          const isCur = i === live.liftIndex;
          return (
            <div
              key={l.id}
              style={{ flex: 1, height: 6, background: done ? T.accent : isCur ? T.sub : T.line }}
            />
          );
        })}
      </div>

      {/* counter + finish */}
      <div style={{ padding: "12px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={prevLift} style={monoBtn(T.sub)} disabled={live.liftIndex === 0}>
          ‹ EXERCISE {String(live.liftIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </button>
        <button onClick={finishWorkout} style={monoBtn(T.accent)}>
          FINISH ✓
        </button>
      </div>

      {/* name + PB + delta */}
      <div style={{ padding: "4px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <button
          onClick={() => openHistory(name)}
          style={{
            border: "none",
            background: "transparent",
            color: T.ink,
            font: `400 30px/1 ${FONT.anton}`,
            textTransform: "uppercase",
            letterSpacing: -0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            padding: 0,
            minWidth: 0,
          }}
        >
          {name}
        </button>
        <span style={{ flex: "none", font: `700 13px/1 ${FONT.mono}`, color: T.accent, letterSpacing: 1 }}>
          PB {num(pb)}
        </span>
      </div>
      <div style={{ padding: "4px 22px 0", font: `700 12px/1 ${FONT.mono}`, color: T.sub }}>
        {last ? (
          <>
            vs LAST <span style={{ color: delta >= 0 ? T.accent : T.sub }}>{deltaStr}</span> · target {num(last.w)}×{last.r}
          </>
        ) : (
          <>FIRST TIME LOGGING THIS LIFT</>
        )}
      </div>

      {/* edit the workout on the fly */}
      <div style={{ padding: "8px 22px 0", display: "flex", gap: 8 }}>
        <EditBtn onClick={() => setPicker("swap")}>⇄ SWAP</EditBtn>
        <EditBtn onClick={() => setPicker("add")}>＋ ADD</EditBtn>
        <EditBtn onClick={liveRemoveLift} disabled={live.lifts.length <= 1}>✕ REMOVE</EditBtn>
      </div>

      {/* hero weight row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px 6px" }}>
        <StepBtn onClick={decW} filled={false}>−</StepBtn>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ font: `400 90px/.78 ${FONT.anton}`, letterSpacing: -3, fontVariantNumeric: "tabular-nums" }}>
            {num(live.w)}
          </div>
          <button
            onClick={cycleInc}
            aria-label={`Change weight step, currently ${num(live.inc)} kg`}
            style={{
              border: "none",
              background: "transparent",
              color: T.accent,
              font: `700 13px/1 ${FONT.mono}`,
              letterSpacing: 2,
              margin: "2px 0 0",
              cursor: "pointer",
              padding: "6px 10px",
              whiteSpace: "nowrap",
            }}
          >
            KILOS · STEP {num(live.inc)}
          </button>
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
        <button onClick={decR} style={repBtn("right")}>−</button>
        <div style={{ flex: 1, textAlign: "center", padding: "9px 0" }}>
          <span style={{ font: `400 38px/1 ${FONT.anton}` }}>{live.r}</span>
          <span style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}> REPS</span>
        </div>
        <button onClick={incR} style={repBtn("left")}>+</button>
      </div>

      {/* set ledger */}
      <div style={{ padding: "10px 22px 0", flex: 1, minHeight: 0, overflowY: "auto" }}>
        {sets.map((s, i) => (
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
              {num(s.w)}
              <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.sub }}> × {s.r}</span>
            </span>
            {s.pb ? (
              <span style={{ font: `700 10px/1 ${FONT.mono}`, color: "#fff", background: T.accent, padding: "4px 6px", letterSpacing: 1 }}>
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
            {last ? `TARGET ${num(last.w)} × ${last.r}` : `TARGET ${num(live.w)} × ${lift.reps}`}
          </span>
        </div>
      </div>

      {/* footer: rest + log + nav */}
      <div style={{ padding: "0 22px" }}>
        {live.restOn && (
          <div style={{ display: "flex", alignItems: "center", background: T.ink, color: T.bg, marginBottom: 10 }}>
            <span style={{ flex: 1, font: `700 12px/1 ${FONT.mono}`, letterSpacing: 2, padding: "0 16px" }}>REST</span>
            <span style={{ font: `400 38px/1 ${FONT.anton}`, padding: "9px 16px", fontVariantNumeric: "tabular-nums" }}>
              {fmtClock(live.rest)}
            </span>
            <button
              onClick={skipRest}
              style={{ border: "none", background: T.accent, color: "#fff", font: `700 13px/1 ${FONT.mono}`, padding: "0 18px", alignSelf: "stretch", cursor: "pointer", letterSpacing: 1 }}
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
            padding: 18,
            font: `400 28px/1 ${FONT.anton}`,
            letterSpacing: 1,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Log set {nextSet}
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 2px 0" }}>
          <button onClick={prevLift} style={monoBtn(live.liftIndex === 0 ? T.line : T.sub)} disabled={live.liftIndex === 0}>
            ‹ PREV
          </button>
          {isLast ? (
            <button onClick={finishWorkout} style={monoBtn(T.accent)}>
              FINISH WORKOUT ✓
            </button>
          ) : (
            <button onClick={nextLift} style={monoBtn(T.ink)}>
              NEXT: {live.lifts[live.liftIndex + 1].name.toUpperCase()} ›
            </button>
          )}
        </div>
      </div>

      {/* PB flash + celebration */}
      {live.flash && (
        <div style={{ position: "absolute", inset: 0, background: T.accent, animation: "flashfade .6s ease-out", pointerEvents: "none" }} />
      )}
      {live.pbFire && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ background: T.accent, color: "#fff", padding: "24px 32px", animation: "pbpop .5s ease-out", textAlign: "center" }}>
            <div style={{ font: `400 44px/.9 ${FONT.anton}`, letterSpacing: 1 }}>NEW PB</div>
            <div style={{ font: `700 14px/1 ${FONT.mono}`, marginTop: 6 }}>{num(live.w)} KG · {name.toUpperCase()}</div>
          </div>
        </div>
      )}

      {picker && (
        <ExercisePicker
          title={picker === "swap" ? "SWAP EXERCISE" : "ADD EXERCISE"}
          onClose={() => setPicker(null)}
          onPick={(n) => {
            if (picker === "swap") liveSwapLift(n);
            else liveAddLift(n);
            setPicker(null);
          }}
        />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "calc(env(safe-area-inset-top, 0px) + 10px) 0 calc(env(safe-area-inset-bottom, 0px) + 12px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.archivo,
        color: T.ink,
        background: T.bg,
        overflow: "hidden",
        animation: "screenIn .28s ease-out",
      }}
    >
      {children}
    </div>
  );
}

function EditBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        border: `1.5px solid ${disabled ? T.line : T.ink}`,
        background: "transparent",
        color: disabled ? T.line : T.ink,
        font: `700 11px/1 ${FONT.mono}`,
        letterSpacing: 0.5,
        padding: "9px 0",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function monoBtn(color: string): React.CSSProperties {
  return {
    border: "none",
    background: "transparent",
    color,
    font: `700 13px/1 ${FONT.mono}`,
    letterSpacing: 1,
    cursor: "pointer",
    padding: 0,
    maxWidth: "60%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };
}

const primaryBtn: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: T.accent,
  color: "#fff",
  padding: 18,
  font: `400 26px/1 ${FONT.anton}`,
  letterSpacing: 1,
  textTransform: "uppercase",
  cursor: "pointer",
};

const ghostLink: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: T.sub,
  font: `700 12px/1 ${FONT.mono}`,
  letterSpacing: 1,
  cursor: "pointer",
  padding: "16px 0 0",
};

function StepBtn({ children, onClick, filled }: { children: React.ReactNode; onClick: () => void; filled: boolean }) {
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
