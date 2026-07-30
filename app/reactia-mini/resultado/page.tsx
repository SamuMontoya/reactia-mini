'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics/trackEvent';
import type { ScoringResult } from '@/lib/schemas';
import type { StoredLead } from '@/lib/storage/leadStorage';
import Spinner from '@/components/ui/Spinner';
import { AreaMetricas, Clock, Compass } from '@/components/icons';
import Reveal from '@/components/ui/Reveal';
import ScoreGauge from './ScoreGauge';
import BottleneckCard from './BottleneckCard';
import AreaRadar from './AreaRadar';
import AreaBars from './AreaBars';
import ContactoPopup from './ContactoPopup';
import CtaFinal from './CtaFinal';
import ExpiradoModal from './ExpiradoModal';
import { buildMensajeDiagnostico } from './mensajeWhatsApp';
import { computeOverallScore } from './scoreScale';

type ResultadoRow = ScoringResult & {
  id: string;
  created_at: string;
  /** The lead this specific result belongs to — never the device's locally
   *  cached lead, which is whichever gatekeeping form was submitted most
   *  recently and has nothing to do with which result is on screen. */
  nombre: string;
  empresa: string;
};

type ResultadoJoinRow = {
  id: string;
  scores: ScoringResult['scores'];
  cuello_botella: ScoringResult['cuello_botella'];
  proximo_paso: ScoringResult['proximo_paso'];
  benchmark: ScoringResult['benchmark'];
  kpis_starter: ScoringResult['kpis_starter'];
  modelo_usado: string;
  created_at: string;
  diagnosticos: { leads: { nombre: string; empresa: string } | { nombre: string; empresa: string }[] | null } | { leads: { nombre: string; empresa: string } | { nombre: string; empresa: string }[] | null }[] | null;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function ResultadoContent() {
  const searchParams = useSearchParams();
  const resultadoId = searchParams.get('resultadoId');

  const [resultado, setResultado] = useState<ResultadoRow | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    trackEvent('resultado_view');
  }, []);

  useEffect(() => {
    if (!resultadoId) return;

    let cancelled = false;

    const fetchResultado = async () => {
      const { data, error } = await supabase
        .from('resultados')
        .select(
          'id, scores, cuello_botella, proximo_paso, benchmark, kpis_starter, modelo_usado, created_at, diagnosticos!inner(leads(nombre, empresa))'
        )
        .eq('id', resultadoId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        return;
      }

      const joined = data as ResultadoJoinRow;
      const diagnostico = Array.isArray(joined.diagnosticos)
        ? joined.diagnosticos[0]
        : joined.diagnosticos;
      const lead = diagnostico
        ? Array.isArray(diagnostico.leads)
          ? diagnostico.leads[0]
          : diagnostico.leads
        : null;

      const row: ResultadoRow = {
        id: joined.id,
        scores: joined.scores,
        cuello_botella: joined.cuello_botella,
        proximo_paso: joined.proximo_paso,
        benchmark: joined.benchmark,
        kpis_starter: joined.kpis_starter,
        created_at: joined.created_at,
        nombre: lead?.nombre ?? '',
        empresa: lead?.empresa ?? '',
      };
      setResultado(row);
      setIsBlocked(Date.now() - new Date(row.created_at).getTime() > SEVEN_DAYS_MS);
    };

    fetchResultado();

    return () => {
      cancelled = true;
    };
  }, [resultadoId]);

  if (notFound || !resultadoId) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="ds-container">
          <div className="ds-card mx-auto max-w-md p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-ink">
              No encontramos ese diagnóstico
            </h1>
            <p className="mt-2 text-base text-stone">
              El enlace puede estar incompleto o haber expirado.
            </p>
            <Link
              href="/reactia-mini/gatekeeping"
              className="ds-btn ds-btn-amber mt-6 w-full"
            >
              Empezar de nuevo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner label="Abriendo tu diagnóstico..." />
      </div>
    );
  }

  const overallScore = computeOverallScore(resultado.scores);

  return (
    <div className="flex flex-1 flex-col">
      <div className="ds-container py-10 sm:py-12">
        <header className="relative text-center">
          {/* Halo behind the title — the page's headline deserves the same
              soft-light treatment the hero and the closing CTA get.
              `w-full max-w-` rather than a fixed 34rem: at a fixed width this is
              wider than a phone viewport, and since it is absolutely positioned
              in a header that doesn't clip, it added ~84px of horizontal scroll
              to the whole page on mobile. Capping at the parent's width keeps
              the desktop size and removes the overflow. */}
          <div
            aria-hidden
            className="ds-halo pointer-events-none left-1/2 top-1/2 h-72 w-full max-w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-80"
          />

          <p className="relative ds-eyebrow">
            Listo{resultado.nombre ? `, ${resultado.nombre}` : ''}
          </p>

          {/* Display-scale and gradient-filled instead of flat ink at section
              size: this is the payoff headline of the whole funnel and it was
              reading like a form label. bg-clip-text needs a transparent text
              colour, hence text-transparent + the gradient on the background. */}
          <h1 className="relative mt-3 bg-gradient-to-br from-ink via-ink to-amber bg-clip-text font-display text-display font-extrabold leading-[1.02] tracking-tight text-transparent">
            Tu diagnóstico
          </h1>

          <p className="relative mt-3 text-lg text-stone">
            {resultado.empresa ? (
              <span className="font-semibold text-ink">{resultado.empresa}</span>
            ) : null}
            {resultado.empresa ? ' · ' : ''}Todo lo que encontramos, en una sola pantalla.
          </p>
        </header>

        <div
          className={`mt-10 ${
            isBlocked ? 'pointer-events-none select-none blur-[5px]' : ''
          }`}
          aria-hidden={isBlocked}
        >
          {/* Three bands, alternating proportions so the page doesn't read as a
              stack of identical rows:
                1. bottleneck 2/3 + score 1/3  — the finding leads, because it is
                                                 the reason the reader is here
                2. numbers 1/3 + area chart 2/3
                3. benchmark, full width, with the ask on its right third
              Placement is automatic; no explicit row starts to keep in sync. */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Bottleneck — styled as an alert, see BottleneckCard */}
            <Reveal className="lg:col-span-2">
              <BottleneckCard
                cuelloBotella={resultado.cuello_botella}
                proximoPaso={resultado.proximo_paso}
              />
            </Reveal>

            {/* Overall score — the payoff number gets the same tinted-card
                treatment as the rest of the redesign (KPI tiles, landing steps)
                plus a contained halo, so it doesn't sit flatter than everything
                around it. */}
            <Reveal delay={90}>
            <section className="ds-card relative flex h-full flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-white to-amber/[0.08] p-5 sm:p-6">
              <div
                aria-hidden
                className="ds-halo pointer-events-none left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 opacity-80"
              />
              <p className="relative ds-eyebrow text-center">Puntaje general</p>
              <div className="relative mt-3 flex justify-center">
                <ScoreGauge score={overallScore} />
              </div>
              <p className="relative mt-3 text-center text-sm text-stone">
                Promedio ponderado de las seis áreas. Lo que ofreces pesa más porque es
                lo que más mueve el crecimiento.
              </p>
            </section>
            </Reveal>

            {/* The four numbers to watch. Flex column with a flex-1 grid and
                auto-rows-fr so the tiles stretch to whatever height the taller
                card in this row sets, instead of leaving a gap underneath. */}
            <Reveal>
            <section className="ds-card flex h-full flex-col bg-gradient-to-br from-white to-amber/[0.04] p-5 sm:p-6">
              <p className="ds-eyebrow">Los números que deberías mirar</p>
              <ul className="mt-3 grid flex-1 auto-rows-fr gap-2.5">
                {resultado.kpis_starter.map((kpi, index) => (
                  <li
                    key={kpi}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-btn)] border border-dust bg-gradient-to-br from-white to-amber/[0.06] p-3.5 transition-all duration-300 ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:border-amber/60 hover:shadow-[var(--shadow-md)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-4 right-1 select-none font-display text-6xl font-extrabold leading-none text-dust/30 transition-all duration-300 ease-[var(--ease-brand)] group-hover:scale-110 group-hover:text-amber/25"
                    >
                      {index + 1}
                    </span>
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber/12 text-amber-dim transition-colors duration-300 group-hover:bg-amber group-hover:text-white"
                    >
                      <AreaMetricas className="h-4 w-4" />
                    </span>
                    <span className="relative text-base leading-snug text-ink">{kpi}</span>
                  </li>
                ))}
              </ul>
              <p className="ds-wash mt-3.5 flex items-center gap-2 py-2 pl-3 pr-3.5 text-sm text-ink">
                <AreaMetricas className="h-4 w-4 shrink-0 text-amber" />
                Empieza mirando uno. Solo uno.
              </p>
            </section>
            </Reveal>

            {/* Six areas — radar plus the exact numbers beside it.
                The radar sits on its own inset panel rather than floating on the
                card: at this size a bare hexagon on a flat surface read as small
                and lost, with dead space around it. Giving it a bounded surface
                (and a hairline splitting it from the bars) makes the two halves
                read as chart + legend instead of one sparse column. */}
            <Reveal delay={90} className="lg:col-span-2">
            <section className="ds-card h-full bg-gradient-to-br from-white to-amber/[0.04] p-5 sm:p-6">
              <p className="ds-eyebrow">Cómo estás en cada área</p>
              <div className="mt-3 grid gap-5 sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] sm:gap-6">
                <div className="relative flex items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-dust/60 bg-white/70 p-3 sm:border-0 sm:border-r sm:border-dust/60 sm:bg-transparent sm:pr-6">
                  <div
                    aria-hidden
                    className="ds-halo pointer-events-none left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 opacity-70"
                  />
                  <div className="relative w-full">
                    <AreaRadar
                      scores={resultado.scores}
                      cuelloBotella={resultado.cuello_botella}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-full">
                    <AreaBars
                      scores={resultado.scores}
                      cuelloBotella={resultado.cuello_botella}
                    />
                  </div>
                </div>
              </div>
            </section>
            </Reveal>

            {/* Benchmark, full width. No CTA in here any more — the closing
                section below carries the ask, and two competing asks on one
                screen split the attention that section is built to concentrate. */}
            <Reveal delay={120} className="lg:col-span-3">
              <section className="ds-card bg-gradient-to-br from-white to-amber/[0.04] p-5 sm:p-6">
                <p className="ds-eyebrow">Cómo te ves frente a otros</p>
                <div className="mt-3 flex items-start gap-3">
                  <Compass className="mt-0.5 h-6 w-6 shrink-0 text-amber" />
                  <p className="text-lg leading-relaxed text-ink">
                    {resultado.benchmark}
                  </p>
                </div>
              </section>
            </Reveal>
          </div>
        </div>

        {/* Icon set inline with the text rather than as a flex sibling: with
            `items-center` on a flex row, a two-line wrap centred vertically
            against the *whole* text block instead of sitting next to the
            first line, which read as the icon floating oddly far from the
            words. Inline, it just sits before the first character like a
            normal glyph, and a wrapped second line falls in as an ordinary
            full-width line under it. */}
        <p className="mt-8 text-center text-sm text-stone">
          <Clock className="mr-1.5 inline-block h-4 w-4 shrink-0 align-text-bottom" />
          Este diagnóstico queda disponible 7 días. Guarda el enlace.
        </p>
      </div>

      {isBlocked && (
        <ExpiradoModal
          mensajeWhatsApp={buildMensajeDiagnostico({
            // The lead this specific result belongs to, from the query
            // above — not the device's locally cached lead, which is
            // whichever gatekeeping form was submitted most recently and
            // may not be this visitor at all.
            lead: { nombre: resultado.nombre, empresa: resultado.empresa } as StoredLead,
            cuelloBotella: resultado.cuello_botella,
            score: overallScore,
            resultadoId: resultado.id,
          })}
        />
      )}

      {/* Outside the container so the ink surface runs full-bleed. */}
      <CtaFinal
        cuelloBotella={resultado.cuello_botella}
        score={overallScore}
        resultadoId={resultado.id}
      />

      {/* Fires 30s after the result page opens, once per session — see ContactoPopup. */}
      <ContactoPopup
        cuelloBotella={resultado.cuello_botella}
        score={overallScore}
        resultadoId={resultado.id}
      />
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24">
          <Spinner label="Abriendo tu diagnóstico..." />
        </div>
      }
    >
      <ResultadoContent />
    </Suspense>
  );
}
