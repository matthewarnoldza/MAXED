/** Inline SVG glyphs — all marks are CSS/SVG, no raster assets. */

export const MoonIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const SunIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="4.4" />
    <path
      d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2 2M17.4 17.4l2 2M19.4 4.6l-2 2M6.6 17.4l-2 2"
      strokeLinecap="round"
    />
  </svg>
);

export const ChevronUp = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronDown = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    style={{ flex: "none" }}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
  </svg>
);

export const SparkIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
  </svg>
);

/** Settings — sliders/adjustments. Deliberately distinct from the sun/moon toggle. */
export const SlidersIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
    <circle cx="16" cy="6" r="2.5" fill="var(--mx-bg)" />
    <circle cx="8" cy="12" r="2.5" fill="var(--mx-bg)" />
    <circle cx="17" cy="18" r="2.5" fill="var(--mx-bg)" />
  </svg>
);

/** Achievements / max board. */
export const TrophyIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4z" />
    <path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3" />
    <path d="M12 12v4M9.5 20h5M10.5 16h3" />
  </svg>
);

/** Training-log / history list. */
export const ListIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 6h12M9 12h12M9 18h12" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** Right-pointing "play" triangle — the logo delta rotated to start orientation. */
export const PlayTriangle = ({ s = 16, color = "var(--mx-accent)" }: { s?: number; color?: string }) => (
  <span
    aria-hidden
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      width: 0,
      height: 0,
      borderTop: `${s * 0.58}px solid transparent`,
      borderBottom: `${s * 0.58}px solid transparent`,
      borderLeft: `${s}px solid ${color}`,
    }}
  />
);

/** The OVERLOAD progressive-overload arrow (red up-triangle). Scales with the wordmark. */
export const OverloadArrow = ({
  w = 17,
  h = 30,
  ml = 8,
  mt = 4,
}: {
  w?: number;
  h?: number;
  ml?: number;
  mt?: number;
}) => (
  <div
    style={{
      width: 0,
      height: 0,
      borderLeft: `${w}px solid transparent`,
      borderRight: `${w}px solid transparent`,
      borderBottom: `${h}px solid var(--mx-accent)`,
      margin: `${mt}px 0 0 ${ml}px`,
    }}
  />
);
