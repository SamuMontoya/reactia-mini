import { AREA_DESCRIPCIONES, AREA_LABELS } from '@/content/diagnostico-config';
import {
  AREA_ICONS,
  Alert,
  CircleCheck,
  CircleX,
  MarkCheck,
  MarkX,
} from '@/components/icons';
import type { Area } from './scoreScale';

type BottleneckCardProps = {
  cuelloBotella: Area;
  proximoPaso: string;
};

/**
 * The one thing the reader has to leave with: the problem, and the fix.
 *
 * Colour does the emotional work here, and it is the one place in the product
 * allowed to be loud: blood red for the diagnosis, traffic-light green for the
 * answer (--color-alerta / --color-exito). Both are separate tokens from the
 * muted signal-* trio, which stays the form-validation palette — a red this
 * strong on a "campo requerido" message would read as punishment.
 *
 * Both panels share one structure — glyph + heading, a rule, then the text —
 * top-aligned so the leftover space falls at the bottom of a filled panel rather
 * than opening a hole between the heading and the paragraph.
 *
 * Hover lifts the panel and blooms a coloured glow behind it, so the pair
 * responds to the cursor instead of sitting inert.
 */
export default function BottleneckCard({
  cuelloBotella,
  proximoPaso,
}: BottleneckCardProps) {
  const AreaIcon = AREA_ICONS[cuelloBotella];

  return (
    <div className="ds-card flex h-full flex-col bg-gradient-to-br from-white to-amber/[0.04] p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-alerta">
        <Alert className="h-4 w-4 shrink-0" />
        Tu freno principal
      </p>

      <div className="mt-4 grid flex-1 gap-4 md:grid-cols-2">
        {/* ── The problem ── */}
        <div className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-alerta/60 bg-gradient-to-br from-alerta/[0.10] via-white to-alerta/[0.04] p-5 transition-all duration-300 ease-[var(--ease-brand)] hover:-translate-y-1 hover:border-alerta hover:shadow-[0_16px_36px_rgba(208,2,27,0.20)]">
          {/* Bare ✕ rather than the enclosed disc: at watermark scale a circle
              reads as a stray blob. Grows and brightens with the cursor. */}
          <MarkX
            className="pointer-events-none absolute -bottom-10 -right-8 h-48 w-48 text-alerta/[0.09] transition-all duration-500 ease-[var(--ease-brand)] group-hover:scale-110 group-hover:text-alerta/[0.16]"
          />

          <h2 className="relative flex items-center gap-2.5 font-display text-3xl font-extrabold leading-none tracking-tight text-alerta">
            <CircleX className="h-8 w-8 shrink-0" />
            El problema
          </h2>

          <span
            aria-hidden
            className="relative mt-4 h-px bg-gradient-to-r from-alerta/50 to-transparent"
          />

          <p className="relative mt-4 flex items-center gap-2 font-display text-xl font-bold leading-snug text-ink">
            <AreaIcon className="h-5 w-5 shrink-0 text-alerta" />
            {AREA_LABELS[cuelloBotella]}
          </p>

          <p className="relative mt-2 text-base leading-relaxed text-stone">
            {AREA_DESCRIPCIONES[cuelloBotella]}
          </p>
        </div>

        {/* ── The solution ── */}
        <div className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border-2 border-exito/60 bg-gradient-to-br from-exito/[0.10] via-white to-exito/[0.04] p-5 transition-all duration-300 ease-[var(--ease-brand)] hover:-translate-y-1 hover:border-exito hover:shadow-[0_16px_36px_rgba(20,194,90,0.22)]">
          <MarkCheck
            className="pointer-events-none absolute -bottom-10 -right-8 h-48 w-48 text-exito/[0.11] transition-all duration-500 ease-[var(--ease-brand)] group-hover:scale-110 group-hover:text-exito/[0.20]"
          />

          <h2 className="relative flex items-center gap-2.5 font-display text-3xl font-extrabold leading-none tracking-tight text-exito-dim">
            <CircleCheck className="h-8 w-8 shrink-0 text-exito" />
            La solución
          </h2>

          <span
            aria-hidden
            className="relative mt-4 h-px bg-gradient-to-r from-exito/50 to-transparent"
          />

          <p className="relative mt-4 text-lg leading-relaxed text-ink">{proximoPaso}</p>
        </div>
      </div>
    </div>
  );
}
