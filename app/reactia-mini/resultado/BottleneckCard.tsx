import { AREA_DESCRIPCIONES, AREA_LABELS } from '@/content/diagnostico-config';
import { Alert, CircleCheck, CircleX } from '@/components/icons';
import type { Area } from './scoreScale';

type BottleneckCardProps = {
  cuelloBotella: Area;
  proximoPaso: string;
};

/**
 * The one thing the reader has to leave with: the problem, and the fix.
 *
 * Two tinted panels rather than one red card. The whole card being red made the
 * fix look like part of the bad news; splitting it means the diagnosis reads as
 * the warning (red, ✕) and the answer reads as the answer (amber surface, green
 * heading, ✓). Both panels share the same shape — glyph + large heading, then
 * text — so the pair reads as one before/after rather than two unrelated boxes.
 */
export default function BottleneckCard({
  cuelloBotella,
  proximoPaso,
}: BottleneckCardProps) {
  return (
    <div className="ds-card flex h-full flex-col p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-signal-low">
        <Alert className="h-4 w-4 shrink-0" />
        Tu freno principal
      </p>

      <div className="mt-4 grid flex-1 gap-4 md:grid-cols-2">
        {/* ── The problem ── */}
        <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-signal-low/70 bg-gradient-to-br from-signal-low/[0.09] to-signal-low/[0.02] p-5">
          {/* Oversized echo of the panel's own glyph, the same trick the KPI
              tiles use with their index number: fills the surface and reinforces
              which half you're reading without competing with the text. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -right-6 select-none text-signal-low/[0.09]"
          >
            <CircleX className="h-48 w-48" holeColor="transparent" />
          </span>

          <h2 className="relative flex items-center gap-2.5 font-display text-3xl font-extrabold leading-none tracking-tight text-signal-low">
            <CircleX className="h-8 w-8 shrink-0" />
            El problema
          </h2>

          {/* One paragraph, one style: the area name runs straight into its
              explanation with no weight or colour change, so it reads as prose
              rather than as a label with a caption. `mt-auto` matches the
              solution panel — both paragraphs sit on the floor of the card. */}
          <p className="relative mt-auto pt-4 text-lg leading-relaxed text-ink">
            {AREA_LABELS[cuelloBotella]}. {AREA_DESCRIPCIONES[cuelloBotella]}
          </p>
        </div>

        {/* ── The solution ── */}
        <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-signal-high/70 bg-gradient-to-br from-amber/[0.14] to-amber/[0.04] p-5">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -right-6 select-none text-signal-high/[0.09]"
          >
            <CircleCheck className="h-48 w-48" holeColor="transparent" />
          </span>

          <h2 className="relative flex items-center gap-2.5 font-display text-3xl font-extrabold leading-none tracking-tight text-signal-high">
            <CircleCheck className="h-8 w-8 shrink-0" />
            La solución
          </h2>

          <p className="relative mt-auto pt-4 text-lg leading-relaxed text-ink">
            {proximoPaso}
          </p>
        </div>
      </div>
    </div>
  );
}
