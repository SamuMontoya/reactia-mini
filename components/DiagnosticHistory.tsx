'use client';
import Link from 'next/link';
import { Clock, Sparkles } from '@/components/icons';
import { DiagnosticCard } from '@/components/DiagnosticCard';
import { DraftDiagnosticCard } from '@/components/DraftDiagnosticCard';
import Reveal from '@/components/ui/Reveal';
import type { DiagnosticoPorDispositivo } from '@/lib/api/device';

export type DraftPendienteInfo = {
  leadId: string;
  nombre: string;
  empresa: string;
  guardadoEn: number;
};

interface DiagnosticHistoryProps {
  diagnosticos: DiagnosticoPorDispositivo[];
  /** An in-progress diagnóstico still only in localStorage, never submitted
   *  — shown as its own card ahead of the real history, not folded into it,
   *  so "borrador" reads as a different kind of thing than a finished
   *  result rather than a variant of one. */
  draft?: DraftPendienteInfo | null;
}

/** Columns the grid resolves to at lg and up — see the padding note below. */
const COLUMNAS = 3;

/**
 * Ghost slot that fills the rest of a partially-filled row.
 *
 * Desktop only (`hidden lg:flex`). On a phone the grid is a single column, so
 * there is no "rest of the row" to fill — a placeholder there would just be an
 * empty card the user has to scroll past. Dashed, unfilled, and it invites the
 * next diagnóstico rather than pretending to be data.
 */
function PlaceholderCard() {
  return (
    <Link
      href="/reactia-mini/gatekeeping"
      aria-hidden
      tabIndex={-1}
      className="group hidden rounded-[var(--radius-card)] border border-dashed border-dust transition-colors duration-300 ease-[var(--ease-brand)] hover:border-amber/60 hover:bg-amber/[0.03] lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-2 lg:p-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-dust/20 text-stone/60 transition-colors group-hover:bg-amber/12 group-hover:text-amber">
        <Sparkles className="h-5 w-5" />
      </span>
      <span className="text-center text-sm text-stone/70 transition-colors group-hover:text-stone">
        Espacio para tu próximo diagnóstico
      </span>
    </Link>
  );
}

export function DiagnosticHistory({ diagnosticos, draft }: DiagnosticHistoryProps) {
  const totalCards = diagnosticos.length + (draft ? 1 : 0);

  if (totalCards === 0) {
    return (
      <div className="py-16 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-dust/50" />
        <h2 className="mb-2 font-display text-xl font-semibold text-ink">
          No hay diagnósticos previos
        </h2>
        <p className="mx-auto max-w-md text-stone">
          Cuando completes un diagnóstico, aparecerá aquí con su resultado y cuello de
          botella detectado.
        </p>
      </div>
    );
  }

  // Pad only up to the end of the current row, not to a fixed count: with 1
  // diagnóstico that's 2 ghosts (a complete row of 3); with 4 it's 2 again, so
  // the second row doesn't trail off with a single orphan card. A fixed 3 would
  // leave 4 items in a 3-column grid — one orphan on its own row, which is the
  // gap this is meant to remove. The draft counts as one of the cards for this
  // math, same as any other.
  const resto = totalCards % COLUMNAS;
  const placeholders = resto === 0 ? 0 : COLUMNAS - resto;

  return (
    <div>
      <h2 className="mb-6 text-center font-display text-2xl font-bold text-ink lg:text-left">
        Tus diagnósticos previos
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {draft && (
          <Reveal className="h-full">
            <div role="listitem" className="h-full">
              <DraftDiagnosticCard {...draft} />
            </div>
          </Reveal>
        )}
        {diagnosticos.map((diagnostico, index) => (
          <Reveal
            key={diagnostico.diagnosticoId}
            delay={(index + (draft ? 1 : 0)) * 80}
            className="h-full"
          >
            <div role="listitem" className="h-full">
              <DiagnosticCard diagnostico={diagnostico} />
            </div>
          </Reveal>
        ))}
        {Array.from({ length: placeholders }, (_, i) => (
          <PlaceholderCard key={`placeholder-${i}`} />
        ))}
      </div>
    </div>
  );
}
