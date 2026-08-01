'use client';
import Link from 'next/link';
import { AREA_LABELS } from '@/content/diagnostico-config';
import { AREA_ICONS, ArrowRight, Clock } from '@/components/icons';
import TiempoRelativo from '@/components/TiempoRelativo';
import type { DiagnosticoPorDispositivo } from '@/lib/api/device';

type DiagnosticCardProps = {
  diagnostico: DiagnosticoPorDispositivo;
};

/**
 * One previous diagnóstico from this device.
 *
 * The whole card is the link, not just the footer action: a card with a single
 * destination that only responds on one small word inside it is a card people
 * click and nothing happens. The visible "Ver resultado" row stays as the
 * affordance and reacts to the card's hover via `group-hover`, so the hint and
 * the hit area are the same thing.
 *
 * Hierarchy is company → person → bottleneck, with the timestamp as quiet
 * metadata. The company is what identifies the diagnóstico when someone has
 * several; the "Completado" badge that used to sit up here was noise — every
 * finished card said the same word — so the relative time carries that slot
 * instead.
 */
export function DiagnosticCard({ diagnostico }: DiagnosticCardProps) {
  const { resultado, empresa, nombre } = diagnostico;

  const destino = resultado
    ? `/reactia-mini/resultado?resultadoId=${diagnostico.resultadoId}`
    : `/reactia-mini/generando?diagnosticoId=${diagnostico.diagnosticoId}`;

  const AreaIcon = resultado ? AREA_ICONS[resultado.cuello_botella] : null;

  return (
    <Link
      href={destino}
      // See DraftDiagnosticCard for why `min-w-0` matters here: grid items
      // won't shrink past their min-content, and the `truncate` below makes
      // that the full untruncated string.
      className="group ds-card relative flex h-full min-w-0 flex-col overflow-hidden bg-gradient-to-br from-white to-amber/[0.04] p-5 transition-all duration-300 ease-[var(--ease-brand)] hover:-translate-y-1 hover:border-amber hover:shadow-[var(--shadow-lg)]"
    >
      {/* Amber rule that draws itself along the top edge on hover — the same
          accent-on-action motif the landing's step cards use. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-amber to-amber/0 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:scale-x-100"
      />

      {/* ── Identity ── */}
      <p className="font-display text-lg font-bold leading-snug text-ink">
        {empresa || 'Tu negocio'}
      </p>
      {nombre && <p className="mt-0.5 text-sm text-stone">{nombre}</p>}

      {/* ── The finding ── */}
      {resultado && AreaIcon ? (
        // Same vivid alerta red as the bottleneck card on the result page
        // itself — this used to be the muted signal-low used for form
        // validation, which read as far less urgent than the "cortisol" red
        // the result page was deliberately redesigned to use.
        <div className="mt-4 flex items-center gap-2.5 rounded-[var(--radius-btn)] border border-alerta/25 bg-alerta/[0.06] px-3 py-2.5">
          <AreaIcon className="h-4 w-4 shrink-0 text-alerta" />
          <span className="min-w-0">
            <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-alerta">
              Freno principal
            </span>
            <span className="mt-0.5 block truncate font-display text-base font-semibold text-ink">
              {AREA_LABELS[resultado.cuello_botella]}
            </span>
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2.5 rounded-[var(--radius-btn)] border border-dust bg-dust/10 px-3 py-2.5">
          <Clock className="h-4 w-4 shrink-0 text-stone" />
          <span className="text-sm text-stone">Tu resultado se está preparando.</span>
        </div>
      )}

      {/* ── Footer: metadata + the affordance, both reacting to the card ── */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <TiempoRelativo iso={diagnostico.created_at} />

        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-amber transition-colors group-hover:text-amber-dim">
          {resultado ? 'Ver resultado' : 'Continuar'}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-brand)] group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
