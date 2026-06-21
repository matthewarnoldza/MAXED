"use client";

import { useEffect, useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { ScreenBody } from "@/components/screens/Frame";
import { shortDate } from "@/lib/derive";
import { useApp } from "@/store/useApp";

const QUICK = [
  "45-minute push day, hypertrophy — push my bench up",
  "Legs, 50 minutes, no back squats",
  "Quick 30-minute arms session",
  "Full body strength, heavy, 60 minutes",
];

export function Assistant() {
  const go = useApp((s) => s.go);
  const a = useApp((s) => s.assistant);
  const sessions = useApp((s) => s.sessions);
  const stances = useApp((s) => s.stances);
  const apiKey = useApp((s) => s.apiKey);
  const serverHasKey = useApp((s) => s.serverHasKey);
  const aiActive = !!apiKey || serverHasKey;
  const generate = useApp((s) => s.generate);
  const accept = useApp((s) => s.acceptPlan);
  const discard = useApp((s) => s.discardPlan);
  const reset = useApp((s) => s.resetAssistant);

  const [draft, setDraft] = useState("");
  const [marked, setMarked] = useState<string[]>([]);
  const loading = a.status === "loading";

  // Re-opening the coach after accept/discard should land on a fresh prompt,
  // not the stale "PLAN SET ✓" / "DISCARDED" card.
  useEffect(() => {
    if (a.status === "accepted" || a.status === "discarded") reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const plan = a.plan;

  // visible memory — what the coach "knows" about you
  const pbCount = new Set(sessions.flatMap((s) => s.entries.map((e) => e.name))).size;
  const bannedCount = Object.values(stances).filter((v) => v === "banned").length;
  const last = sessions[0];

  const toggleMark = (name: string) =>
    setMarked((m) => (m.includes(name) ? m.filter((n) => n !== name) : [...m, name]));

  const submit = () => {
    if (loading) return;
    const note = draft.trim();
    if (plan && marked.length) {
      // targeted edit — swap only the marked lifts, keep the rest (draft carries the plan)
      const what = note ? `: ${note}` : " with a good alternative";
      generate(`Keep the rest of the workout the same, but replace ${marked.join(", ")}${what}.`);
      setMarked([]);
      setDraft("");
      return;
    }
    if (note) {
      generate(note);
      setDraft("");
    }
  };
  const canSubmit = !loading && (draft.trim().length > 0 || (!!plan && marked.length > 0));

  return (
    <ScreenBody>
      {/* header */}
      <div style={{ padding: "0 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => go("home")}
          style={{ border: "none", background: "transparent", color: T.sub, font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1, cursor: "pointer", padding: "6px 6px 6px 0" }}
        >
          ‹ HOME
        </button>
        <span style={{ display: "flex", alignItems: "center", gap: 7, font: `700 12px/1 ${FONT.mono}`, letterSpacing: 1, color: T.accent }}>
          <span style={{ width: 8, height: 8, background: T.accent, borderRadius: "50%", animation: loading ? "glowpulse .6s infinite" : "glowpulse 1.1s infinite" }} />
          {loading ? "THINKING" : aiActive ? "COACH AI" : "COACH · LOCAL"}
        </span>
      </div>

      {/* generated plan header (only once we have one) */}
      {plan ? (
        <div style={{ padding: "12px 22px 14px", borderBottom: `2px solid ${T.ink}` }}>
          <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}>
            {a.error ? "GENERATED ON-DEVICE" : "COACH AI · GENERATED A PLAN"}
          </div>
          <div style={{ font: `400 42px/.88 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5, marginTop: 8 }}>
            {plan.title.split("\n").map((l, i, arr) => (
              <span key={i}>
                {l}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </div>
          <div style={{ font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginTop: 10 }}>{plan.meta}</div>
        </div>
      ) : (
        <div style={{ padding: "10px 22px 0" }}>
          <div style={{ font: `400 40px/.9 ${FONT.anton}`, textTransform: "uppercase", letterSpacing: -0.5 }}>
            Ask your
            <br />
            coach
          </div>
          <div style={{ font: `700 10px/1.6 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginTop: 12 }}>
            COACH KNOWS · {pbCount} LIFTS LOGGED · {bannedCount} BANNED
            {last && <> · LAST {last.focus} {shortDate(last.dateISO)}</>}
          </div>
        </div>
      )}

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0" }}>
        {plan ? (
          <>
            <div style={{ border: `1.5px solid ${T.line}`, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub }}>YOU ASKED</div>
              <div style={{ font: `700 14px/1.4 ${FONT.archivo}`, marginTop: 7 }}>“{a.prompt}”</div>
            </div>
            <div style={{ font: `700 9px/1 ${FONT.mono}`, letterSpacing: 1, color: T.sub, marginBottom: 6 }}>
              TAP A LIFT TO MARK IT FOR A SWAP, THEN SAY WHAT INSTEAD
            </div>
            {plan.lifts.map((l, i) => {
              const isProg = l.load.trim().startsWith("+");
              const mk = marked.includes(l.name);
              return (
                <button
                  key={i}
                  onClick={() => toggleMark(l.name)}
                  style={{
                    width: "100%",
                    display: "block",
                    textAlign: "left",
                    border: "none",
                    borderBottom: `1px solid ${T.line}`,
                    background: mk ? "var(--mx-soft)" : "transparent",
                    color: T.ink,
                    padding: "11px 8px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ font: `700 15px/1 ${FONT.archivo}`, textDecoration: mk ? "line-through" : "none", color: mk ? T.sub : T.ink }}>
                      {l.name}
                    </span>
                    <span style={{ font: `700 12px/1 ${FONT.mono}`, color: T.sub, whiteSpace: "nowrap" }}>
                      {mk ? (
                        <span style={{ color: T.accent }}>↻ CHANGE</span>
                      ) : (
                        <>
                          {l.sets}×{l.reps} · <span style={{ color: isProg ? T.accent : T.sub }}>{l.load}</span>
                        </>
                      )}
                    </span>
                  </div>
                  {l.note && !mk && <div style={{ font: `700 10px/1.4 ${FONT.mono}`, color: T.accent, marginTop: 5, letterSpacing: 0.5 }}>↳ {l.note}</div>}
                </button>
              );
            })}
          </>
        ) : (
          <>
            <div style={{ font: `700 10px/1 ${FONT.mono}`, letterSpacing: 1.5, color: T.sub, marginBottom: 10 }}>QUICK STARTS</div>
            {QUICK.map((qp) => (
              <button
                key={qp}
                onClick={() => setDraft(qp)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: `1.5px solid ${draft === qp ? T.ink : T.line}`,
                  background: "transparent",
                  color: T.ink,
                  padding: "12px 14px",
                  marginBottom: 8,
                  font: `700 13px/1.3 ${FONT.archivo}`,
                  cursor: "pointer",
                }}
              >
                {qp}
              </button>
            ))}
          </>
        )}
      </div>

      {/* prompt / refine input */}
      <div style={{ padding: "12px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `2px solid ${T.line}`, padding: "10px 12px" }}>
          <input
            className="mxin"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={
              marked.length
                ? `WHAT INSTEAD OF ${marked.length} LIFT${marked.length > 1 ? "S" : ""}? (OPTIONAL)`
                : plan
                ? "REFINE: e.g. give me an extra leg set"
                : "DESCRIBE YOUR WORKOUT…"
            }
            style={{ border: "none", background: "transparent", outline: "none", font: `700 12px/1.3 ${FONT.mono}`, letterSpacing: 0.5, color: T.ink, width: "100%" }}
          />
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{ flex: "none", border: "none", background: canSubmit ? (marked.length ? T.accent : T.ink) : T.line, color: marked.length ? "#fff" : T.bg, font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, padding: "9px 11px", cursor: canSubmit ? "pointer" : "default" }}
          >
            {loading ? "···" : marked.length ? "SWAP" : plan ? "REFINE" : "SEND"}
          </button>
        </div>
      </div>

      {/* actions */}
      <div style={{ padding: "12px 22px 0" }}>
        {!plan ? (
          <button
            onClick={submit}
            disabled={loading || !draft.trim()}
            style={{ width: "100%", border: "none", background: draft.trim() ? T.accent : T.line, color: "#fff", padding: 18, font: `400 28px/1 ${FONT.anton}`, letterSpacing: 1, textTransform: "uppercase", cursor: loading || !draft.trim() ? "default" : "pointer" }}
          >
            {loading ? "Thinking…" : "Generate workout"}
          </button>
        ) : a.status === "accepted" ? (
          <div style={{ background: T.ink, color: T.bg, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: `400 24px/1 ${FONT.anton}`, letterSpacing: 1 }}>PLAN SET ✓</span>
            <div style={{ display: "flex", gap: 14 }}>
              <UnderlineBtn color={T.bg} onClick={reset}>NEW</UnderlineBtn>
              <UnderlineBtn color={T.accent} onClick={() => go("plan")}>VIEW PLAN</UnderlineBtn>
            </div>
          </div>
        ) : a.status === "discarded" ? (
          <div style={{ border: `2px solid ${T.line}`, color: T.sub, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1 }}>DISCARDED</span>
            <UnderlineBtn color={T.accent} onClick={reset}>START OVER</UnderlineBtn>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={discard}
              style={{ flex: "none", width: 104, border: `2px solid ${T.ink}`, background: "transparent", color: T.ink, padding: "18px 0", font: `700 13px/1 ${FONT.mono}`, letterSpacing: 1, cursor: "pointer" }}
            >
              DISCARD
            </button>
            <button
              onClick={accept}
              style={{ flex: 1, border: "none", background: T.accent, color: "#fff", padding: 18, font: `400 26px/1 ${FONT.anton}`, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
            >
              Use this plan
            </button>
          </div>
        )}
      </div>
    </ScreenBody>
  );
}

function UnderlineBtn({ children, color, onClick }: { children: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "transparent", color, font: `700 11px/1 ${FONT.mono}`, letterSpacing: 1, cursor: "pointer", textDecoration: "underline" }}
    >
      {children}
    </button>
  );
}
