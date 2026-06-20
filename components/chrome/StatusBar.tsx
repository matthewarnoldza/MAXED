import { FONT, T } from "@/lib/tokens";

/** iOS status bar (time + signal/wifi/battery), ported from IPhone.dc.html chrome. */
export function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px 0 34px",
        zIndex: 50,
        pointerEvents: "none",
        color: T.ink,
      }}
    >
      <div
        style={{
          font: `600 16px/1 ${FONT.archivo}`,
          letterSpacing: ".2px",
          minWidth: 54,
        }}
      >
        {time}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.2c2.6 0 5 1 6.8 2.7l1.4-1.5C14.6 1.2 11.7 0 8.5 0 5.3 0 2.4 1.2 .3 3.4l1.4 1.5C3.5 3.2 5.9 2.2 8.5 2.2z" />
          <path d="M8.5 6c1.4 0 2.7.5 3.7 1.5l1.4-1.5C12.2 4.7 10.4 4 8.5 4 6.6 4 4.8 4.7 3.4 6l1.4 1.5C5.8 6.5 7.1 6 8.5 6z" />
          <circle cx="8.5" cy="10" r="1.8" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="12"
            rx="3.5"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="18" height="9" rx="1.8" fill="currentColor" />
          <path
            d="M24 4.6v3.8c.9-.3 1.4-.95 1.4-1.9s-.5-1.6-1.4-1.9z"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
}
