"use client";

import { FONT, T } from "@/lib/tokens";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useApp } from "@/store/useApp";

/** Standard screen body: fills the phone, clears status bar + home indicator. */
export function ScreenBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "calc(env(safe-area-inset-top, 0px) + 14px) 0 calc(env(safe-area-inset-bottom, 0px) + 18px)",
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

/** Back row used on Plan / Library / Assistant / History. */
export function BackRow({
  left,
  right,
  onBack,
  rightColor = T.accent,
}: {
  left: string;
  right: string;
  onBack: () => void;
  rightColor?: string;
}) {
  return (
    <div
      style={{
        padding: "0 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flex: "none",
      }}
    >
      <button
        onClick={onBack}
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
        {left}
      </button>
      <span style={{ font: `700 12px/1 ${FONT.mono}`, letterSpacing: 1, color: rightColor }}>
        {right}
      </span>
    </div>
  );
}

/** 34×28 bordered sun/moon toggle (Home top bar). */
export function ThemeToggle() {
  const theme = useApp((s) => s.theme);
  const toggle = useApp((s) => s.toggleTheme);
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      style={{
        width: 34,
        height: 28,
        border: `2px solid ${T.ink}`,
        background: "transparent",
        color: T.ink,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
