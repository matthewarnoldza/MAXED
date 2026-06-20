"use client";

import { T } from "@/lib/tokens";
import { StatusBar } from "@/components/chrome/StatusBar";

/**
 * App viewport. On a phone (or installed PWA) it fills the screen; on desktop it
 * centres a phone-sized frame. This is NOT the design's presentation bezel —
 * it's the real app surface, with the iOS status bar, Dynamic Island and home
 * indicator that appear on every screen.
 */
export function Phone({
  children,
  showChrome = true,
}: {
  children: React.ReactNode;
  showChrome?: boolean;
}) {
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

        {showChrome && (
          <>
            <StatusBar />
            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute",
                top: 11,
                left: "50%",
                transform: "translateX(-50%)",
                width: 124,
                height: 36,
                background: "#000",
                borderRadius: 20,
                zIndex: 60,
                pointerEvents: "none",
              }}
            />
            {/* Home indicator */}
            <div
              style={{
                position: "absolute",
                bottom: 9,
                left: "50%",
                transform: "translateX(-50%)",
                width: 138,
                height: 5,
                borderRadius: 3,
                background: T.ink,
                opacity: 0.85,
                zIndex: 60,
                pointerEvents: "none",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
