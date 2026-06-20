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
