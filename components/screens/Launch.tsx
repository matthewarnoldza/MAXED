"use client";

import { useEffect } from "react";
import { FONT, T } from "@/lib/tokens";
import { OverloadArrow } from "@/components/ui/icons";
import { useApp } from "@/store/useApp";

export function Launch() {
  const go = useApp((s) => s.go);

  // Static splash, not a loading gate — advance after the load bar finishes.
  useEffect(() => {
    const t = setTimeout(() => go("home"), 1900);
    return () => clearTimeout(t);
  }, [go]);

  return (
    <button
      onClick={() => go("home")}
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
        padding: "80px 30px 40px",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      <div style={{ margin: "auto 0", textAlign: "center" }}>
        <div style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 4, color: T.sub }}>
          EST. 2024 · DAY 214
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <div
            style={{
              font: `400 92px/.82 ${FONT.anton}`,
              letterSpacing: -3,
              textTransform: "uppercase",
            }}
          >
            Maxed
          </div>
          <OverloadArrow />
        </div>
        <div style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 5, color: T.accent, marginTop: 22 }}>
          PROGRESSIVE OVERLOAD
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <div
          style={{
            height: 4,
            background: T.line,
            position: "relative",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              background: T.accent,
              animation: "loadbar 1.6s ease-out forwards",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            font: `700 10px/1 ${FONT.mono}`,
            letterSpacing: 2,
            color: T.sub,
          }}
        >
          <span>OFFLINE READY</span>
          <span>v2.0</span>
        </div>
      </div>
    </button>
  );
}
