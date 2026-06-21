"use client";

import { useEffect, useState } from "react";
import { FONT, T } from "@/lib/tokens";
import { OverloadArrow } from "@/components/ui/icons";
import { useApp } from "@/store/useApp";

const DAY = 86_400_000;

export function Launch() {
  const go = useApp((s) => s.go);
  const startDateISO = useApp((s) => s.startDateISO);

  // Computed after mount so the statically-prerendered HTML never disagrees with
  // the client's clock (which would be a hydration mismatch).
  const [day, setDay] = useState<number | null>(null);
  useEffect(() => {
    setDay(Math.max(1, Math.floor((Date.now() - new Date(startDateISO).getTime()) / DAY) + 1));
  }, [startDateISO]);

  // Static splash, not a loading gate. Route to sign-in, or resume where they were.
  const enter = () => {
    const st = useApp.getState();
    if (!st.currentUser) return go("login");
    go(st.live.active ? "logger" : "home");
  };

  useEffect(() => {
    const t = setTimeout(enter, 1700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go]);

  return (
    <button
      onClick={enter}
      aria-label="Enter MAXED"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.archivo,
        color: T.ink,
        background: T.bg,
        border: "none",
        padding: "calc(env(safe-area-inset-top, 0px) + 50px) 30px calc(env(safe-area-inset-bottom, 0px) + 30px)",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      <div style={{ margin: "auto 0", textAlign: "center" }}>
        <div style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 4, color: T.sub }}>
          EST. 2026{day !== null ? ` · DAY ${day}` : ""}
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginTop: 20 }}>
          <div style={{ font: `400 92px/.82 ${FONT.anton}`, letterSpacing: -3, textTransform: "uppercase" }}>
            Maxed
          </div>
          <OverloadArrow />
        </div>
        <div style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 5, color: T.accent, marginTop: 22 }}>
          PROGRESSIVE OVERLOAD
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <div style={{ height: 4, background: T.line, position: "relative", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ position: "absolute", inset: "0 auto 0 0", background: T.accent, animation: "loadbar 1.5s ease-out forwards" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", font: `700 10px/1 ${FONT.mono}`, letterSpacing: 2, color: T.sub }}>
          <span>CLOUD SYNCED</span>
          <span>v2.0</span>
        </div>
      </div>
    </button>
  );
}
