'use client';
import Link from 'next/link';
import { ArrowRight, Pencil } from '@/components/icons';
import TiempoRelativo from '@/components/TiempoRelativo';

type DraftDiagnosticCardProps = {
  leadId: string;
  nombre: string;
  empresa: string;
  guardadoEn: number;
};

/**
 * A diagnóstico still sitting in localStorage, never submitted.
 *
 * Deliberately styled apart from DiagnosticCard rather than as a variant of
 * it: a dashed amber border and "Borrador" reads as unfinished at a glance,
 * the way DiagnosticCard's solid border and red bottleneck box read as a
 * finished result. Same identity block and layout otherwise, so it still
 * belongs in the same grid as a family member, not a different kind of card.
 */
export function DraftDiagnosticCard({
  leadId,
  nombre,
  empresa,
  guardadoEn,
}: DraftDiagnosticCardProps) {
  return (
    <Link
      href={`/reactia-mini/diagnostico?leadId=${leadId}`}
      // `min-w-0` is load-bearing, not cosmetic: a grid item defaults to
      // `min-width: auto`, i.e. it refuses to shrink below its own min-content
      // — and the `truncate` further down sets `white-space: nowrap`, which
      // makes that min-content the FULL untruncated string. Without this the
      // card stayed ~321px wide inside a 280px column on a 320px phone and
      // took the whole page into horizontal scroll, with the truncation never
      // kicking in at all.
      className="group ds-card relative flex h-full min-w-0 flex-col overflow-hidden border-dashed border-amber/40 bg-gradient-to-br from-white to-amber/[0.03] p-5 transition-all duration-300 ease-[var(--ease-brand)] hover:-translate-y-1 hover:border-amber hover:shadow-[var(--shadow-lg)]"
    >
      <span className="ds-label absolute right-4 top-4 rounded-full bg-amber/10 px-3 py-1 font-semibold text-amber">
        Borrador
      </span>

      {/* ── Identity ── */}
      <p className="pr-20 font-display text-lg font-bold leading-snug text-ink">
        {empresa || 'Tu negocio'}
      </p>
      {nombre && <p className="mt-0.5 text-sm text-stone">{nombre}</p>}

      {/* ── The finding, or lack of one yet ── */}
      <div className="mt-4 flex items-center gap-2.5 rounded-[var(--radius-btn)] border border-dust bg-dust/10 px-3 py-2.5">
        <Pencil className="h-4 w-4 shrink-0 text-stone" />
        <span className="min-w-0">
          <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-stone">
            Diagnóstico incompleto
          </span>
          <span className="mt-0.5 block truncate font-display text-base font-semibold text-ink">
            Te faltan algunas preguntas
          </span>
        </span>
      </div>

      {/* ── Footer: metadata + the affordance, both reacting to the card ── */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <TiempoRelativo iso={new Date(guardadoEn).toISOString()} />

        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-amber transition-colors group-hover:text-amber-dim">
          Continuar
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
