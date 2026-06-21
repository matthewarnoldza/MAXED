"use client";

import { T } from "@/lib/tokens";

/**
 * App viewport. On a phone (or installed PWA) it fills the screen; on desktop it
 * centres a phone-sized frame. This is NOT the design's presentation bezel —
 * it's the real app surface, with the iOS status bar, Dynamic Island and home
 * indicator that appear on every screen.
 */
export function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--mx-frame, #1b1b1b)",
        padding: "var(--mx-frame-pad, 0px)",
      }}
    >
      <div
        className="mx-phone"
        style={{
          position: "relative",
          width: "min(100vw, 420px)",
          height: "min(100dvh, 880px)",
          background: T.bg,
          color: T.ink,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
}
