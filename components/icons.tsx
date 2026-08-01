/**
 * Inline SVG icons.
 *
 * The Kreanding system flags Lucide as an acceptable substitution, but pulling
 * a runtime icon package in for ~12 glyphs is not worth the bytes on a funnel
 * that has to load fast on mobile data. These are hand-drawn on Lucide's
 * conventions: 24x24 box, currentColor stroke, 1.75 stroke-width, round caps.
 */
type IconProps = {
  className?: string;
  strokeWidth?: number;
};

const base = (className?: string) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className,
});

export function ArrowRight({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeft({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

export function Check({ className, strokeWidth = 2.25 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function ChevronDown({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

/* ── Circular status glyphs ──
 * Filled discs with the mark knocked out in the surface colour, rather than a
 * bare two-stroke ✕ / ✓. The bare strokes read as flat and angular next to the
 * rounded cards; a disc is the roundest shape there is, and the solid fill lets
 * the mark carry real colour weight. `holeColor` is the page surface showing
 * through, so it has to match whatever the glyph sits on.
 */
export function CircleX({
  className,
  holeColor = 'var(--color-white)',
}: {
  className?: string;
  holeColor?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M8.4 8.4l7.2 7.2M15.6 8.4l-7.2 7.2"
        stroke={holeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CircleCheck({
  className,
  holeColor = 'var(--color-white)',
}: {
  className?: string;
  holeColor?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M7.3 12.4l3.1 3.1 6.3-6.6"
        stroke={holeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Bare marks, for oversized background watermarks ──
 * Just the stroke — no enclosing disc. The circular CircleX/CircleCheck read as
 * a blob when blown up to watermark size behind a panel; a bare ✕ or ✓ keeps its
 * silhouette at any scale. Butt-capped and heavy so they stay legible at 5%
 * opacity, where a thin round-capped stroke disappears.
 */
export function MarkX({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function MarkCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M4 12.5l5.5 5.5L20 6" />
    </svg>
  );
}

export function Close({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Pencil({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z" />
    </svg>
  );
}

export function Clock({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function Lock({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

/** The one glyph that has to be recognisable rather than generic. */
export function WhatsApp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.11.82.83-3.04-.19-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.23-8.24Zm-3.2 4.4c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.2.87 2.35.99 2.5.12.17 1.7 2.6 4.12 3.55 2.01.79 2.42.63 2.86.59.44-.04 1.42-.58 1.62-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.37.1-.49.1-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.47-.54-.47h-.4Z" />
    </svg>
  );
}

/* ── Area glyphs — one per diagnostic area, used on the result dashboard ── */

export function AreaModelo({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M3.5 20V9l8.5-5 8.5 5v11" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function AreaOferta({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.3 9.4l6.1-.8L12 3z" />
    </svg>
  );
}

export function AreaClientes({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 20c0-2.4-.9-4.2-2.3-5.2" />
    </svg>
  );
}

export function AreaOperaciones({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  );
}

export function AreaProcesos({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <rect x="3.5" y="4" width="6" height="5" rx="1" />
      <rect x="14.5" y="4" width="6" height="5" rx="1" />
      <rect x="9" y="15" width="6" height="5" rx="1" />
      <path d="M6.5 9v3h11V9M12 12v3" />
    </svg>
  );
}

export function AreaMetricas({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M3.5 20h17" />
      <path d="M7 20v-5M12 20V8M17 20v-8" />
    </svg>
  );
}

export function Alert({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <path d="M12 4.5l8.5 15H3.5L12 4.5z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

/** AI sparkles — one large four-point star plus two small ones. */
/**
 * Decorative quotation mark, hand-drawn rather than a font glyph. A real
 * typographic “ character sits high and thin in its em-box — fine at body
 * size, but oversized as a background ghost-motif it clips to an odd fragment
 * against `overflow-hidden`, since almost none of the glyph's own bounding box
 * is inked. This fills its viewBox the way the rest of this file's icons do, so
 * it scales predictably at any size.
 */
export function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M7.17 5.5C4.65 7.9 3.2 10.8 3.2 14.6c0 3.5 1.9 5.8 4.7 5.8 2.25 0 3.75-1.7 3.75-3.7 0-1.85-1.25-3.25-2.9-3.55-.1-2.25.9-4.3 2.35-5.9L7.17 5.5Zm10.6 0C15.25 7.9 13.8 10.8 13.8 14.6c0 3.5 1.9 5.8 4.7 5.8 2.25 0 3.75-1.7 3.75-3.7 0-1.85-1.25-3.25-2.9-3.55-.1-2.25.9-4.3 2.35-5.9l-3.93-1.75Z" />
    </svg>
  );
}

export function Sparkles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M11.2 2.6a.55.55 0 0 1 1.04 0l1.19 3.3a3.3 3.3 0 0 0 1.97 1.98l3.3 1.19a.55.55 0 0 1 0 1.04l-3.3 1.19a3.3 3.3 0 0 0-1.97 1.97l-1.19 3.3a.55.55 0 0 1-1.04 0l-1.19-3.3a3.3 3.3 0 0 0-1.97-1.97l-3.3-1.19a.55.55 0 0 1 0-1.04l3.3-1.19a3.3 3.3 0 0 0 1.97-1.98l1.19-3.3Z" />
      <path d="M18.6 15.1a.4.4 0 0 1 .76 0l.5 1.4c.16.44.5.79.95.95l1.39.5a.4.4 0 0 1 0 .76l-1.4.5c-.44.16-.78.5-.94.95l-.5 1.39a.4.4 0 0 1-.76 0l-.5-1.4a1.65 1.65 0 0 0-.95-.94l-1.39-.5a.4.4 0 0 1 0-.76l1.4-.5c.44-.16.78-.5.94-.95l.5-1.4Z" />
      <path d="M5 14.3a.35.35 0 0 1 .66 0l.36 1a1.4 1.4 0 0 0 .84.84l1 .36a.35.35 0 0 1 0 .66l-1 .36a1.4 1.4 0 0 0-.84.84l-.36 1a.35.35 0 0 1-.66 0l-.36-1a1.4 1.4 0 0 0-.84-.84l-1-.36a.35.35 0 0 1 0-.66l1-.36a1.4 1.4 0 0 0 .84-.84l.36-1Z" />
    </svg>
  );
}

export function Compass({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.2 8.8l-1.7 4.7-4.7 1.7 1.7-4.7 4.7-1.7z" />
    </svg>
  );
}

/** Settings gear — points at the iOS Ajustes app in the dictation hint. */
export function Gear({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9.1 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.47-1.06 1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 1-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.47 1z" />
    </svg>
  );
}

export function Mic({ className, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg {...base(className)} strokeWidth={strokeWidth}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M9 22h6" />
    </svg>
  );
}

export const AREA_ICONS = {
  modelo: AreaModelo,
  oferta: AreaOferta,
  clientes: AreaClientes,
  operaciones: AreaOperaciones,
  procesos: AreaProcesos,
  metricas: AreaMetricas,
} as const;
