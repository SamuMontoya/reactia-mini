'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useLead } from '@/lib/hooks/useLead';
import type { ScoringResult } from '@/lib/schemas';
import Spinner from '@/components/ui/Spinner';
import { AreaMetricas, Clock, Compass, Lock } from '@/components/icons';
import Reveal from '@/components/ui/Reveal';
import ScoreGauge from './ScoreGauge';
import BottleneckCard from './BottleneckCard';
import AreaRadar from './AreaRadar';
import AreaBars from './AreaBars';
import ContactoPopup from './ContactoPopup';
import CtaFinal from './CtaFinal';
import { computeOverallScore } from './scoreScale';

type ResultadoRow = ScoringResult & {
  id: string;
  created_at: string;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function ResultadoContent() {
  const searchParams = useSearchParams();
  const resultadoId = searchParams.get('resultadoId');
  const lead = useLead();

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
          'id, scores, cuello_botella, proximo_paso, benchmark, kpis_starter, modelo_usado, created_at'
        )
        .eq('id', resultadoId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        return;
      }

      const row = data as ResultadoRow;
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
        <header className="text-center">
          <p className="ds-eyebrow">Listo{lead?.nombre ? `, ${lead.nombre}` : ''}</p>
          <h1 className="mt-4 font-display text-section font-bold text-ink">
            Tu diagnóstico
          </h1>
          <p className="mt-3 text-lg text-stone">
            {lead?.empresa ? `${lead.empresa} · ` : ''}Todo lo que encontramos, en una
            sola pantalla.
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

            {/* Overall score */}
            <Reveal delay={90}>
            <section className="ds-card flex h-full flex-col justify-center p-5 sm:p-6">
              <p className="ds-eyebrow text-center">Puntaje general</p>
              <div className="mt-3 flex justify-center">
                <ScoreGauge score={overallScore} />
              </div>
              <p className="mt-3 text-center text-sm text-stone">
                Promedio ponderado de las seis áreas. Lo que ofreces pesa más porque es
                lo que más mueve el crecimiento.
              </p>
            </section>
            </Reveal>

            {/* The four numbers to watch. Flex column with a flex-1 grid and
                auto-rows-fr so the tiles stretch to whatever height the taller
                card in this row sets, instead of leaving a gap underneath. */}
            <Reveal>
            <section className="ds-card flex h-full flex-col p-5 sm:p-6">
              <p className="ds-eyebrow">Los números que deberías mirar</p>
              <ul className="mt-3 grid flex-1 auto-rows-fr gap-2.5">
                {resultado.kpis_starter.map((kpi, index) => (
                  <li
                    key={kpi}
                    className="relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-btn)] border border-dust bg-gradient-to-br from-white to-amber/[0.06] p-3.5"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-4 right-1 select-none font-display text-6xl font-extrabold leading-none text-dust/30"
                    >
                      {index + 1}
                    </span>
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber/12 text-amber-dim"
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

            {/* Six areas — radar plus the exact numbers beside it */}
            <Reveal delay={90} className="lg:col-span-2">
            <section className="ds-card h-full p-5 sm:p-6">
              <p className="ds-eyebrow">Cómo estás en cada área</p>
              <div className="mt-3 grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
                <div className="mx-auto w-full max-w-[17rem]">
                  <AreaRadar
                    scores={resultado.scores}
                    cuelloBotella={resultado.cuello_botella}
                  />
                </div>
                <AreaBars
                  scores={resultado.scores}
                  cuelloBotella={resultado.cuello_botella}
                />
              </div>
            </section>
            </Reveal>

            {/* Benchmark, full width. No CTA in here any more — the closing
                section below carries the ask, and two competing asks on one
                screen split the attention that section is built to concentrate. */}
            <Reveal delay={120} className="lg:col-span-3">
              <section className="ds-card p-5 sm:p-6">
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

        {isBlocked && (
          <div className="ds-card mx-auto mt-8 max-w-md p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-amber" />
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">
              Tu diagnóstico se congeló
            </h2>
            <p className="mt-2 text-base text-stone">
              Pasaron más de 7 días. Escríbenos y lo retomamos contigo para llevarlo a
              acción.
            </p>
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-stone">
          <Clock className="h-4 w-4" />
          Este diagnóstico queda disponible 7 días. Guarda el enlace.
        </p>
      </div>

      {/* Outside the container so the ink surface runs full-bleed. */}
      <CtaFinal
        cuelloBotella={resultado.cuello_botella}
        score={overallScore}
        resultadoId={resultado.id}
      />

      {/* Fires 30s after the reader reaches the bottom — see ContactoPopup. */}
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
