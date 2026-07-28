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
import ScoreGauge from './ScoreGauge';
import BottleneckCard from './BottleneckCard';
import AreaRadar from './AreaRadar';
import AreaBars from './AreaBars';
import WhatsAppCta from './WhatsAppCta';
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
  const cuelloScore = resultado.scores[resultado.cuello_botella] ?? 0;

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

        {/* Everything below is one grid — no tabs. The old version hid three of
            four sections behind clicks, so most people only ever saw the gauge. */}
        <div
          className={`mt-10 ${
            isBlocked ? 'pointer-events-none select-none blur-[5px]' : ''
          }`}
          aria-hidden={isBlocked}
        >
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Overall score */}
            <section className="ds-card flex flex-col justify-center p-6 lg:col-span-2">
              <p className="ds-eyebrow text-center">Puntaje general</p>
              <div className="mt-5">
                <ScoreGauge score={overallScore} />
              </div>
              <p className="mt-4 text-center text-sm text-stone">
                Promedio ponderado de las seis áreas. Lo que ofreces pesa más porque es
                lo que más mueve el crecimiento.
              </p>
            </section>

            {/* Bottleneck — the headline of the whole page */}
            <section className="ds-card p-6 sm:p-8 lg:col-span-3">
              <BottleneckCard
                cuelloBotella={resultado.cuello_botella}
                proximoPaso={resultado.proximo_paso}
                score={cuelloScore}
              />
            </section>

            {/* Six areas: shape + exact numbers side by side */}
            <section className="ds-card p-6 sm:p-8 lg:col-span-3">
              <p className="ds-eyebrow">Cómo estás en cada área</p>
              <div className="mt-4 grid items-center gap-6 sm:grid-cols-2">
                <div className="mx-auto aspect-square w-full max-w-[19rem]">
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

            <div className="flex flex-col gap-4 lg:col-span-2">
              {/* Benchmark */}
              <section className="ds-card flex-1 p-6">
                <p className="ds-eyebrow">Cómo te ves frente a otros</p>
                <div className="mt-4 flex items-start gap-3">
                  <Compass className="mt-1 h-6 w-6 shrink-0 text-amber" />
                  <p className="text-lg leading-relaxed text-ink">
                    {resultado.benchmark}
                  </p>
                </div>
              </section>

              {/* The four numbers to watch */}
              <section className="ds-card p-6">
                <p className="ds-eyebrow">Los números que deberías mirar</p>
                <ul className="mt-4 space-y-2.5">
                  {resultado.kpis_starter.map((kpi, index) => (
                    <li
                      key={kpi}
                      className="flex items-start gap-3 border-b border-dust pb-2.5 last:border-0 last:pb-0"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/12 font-display text-xs font-bold text-amber-dim"
                      >
                        {index + 1}
                      </span>
                      <span className="text-base text-ink">{kpi}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-center gap-2 text-sm text-stone">
                  <AreaMetricas className="h-4 w-4 text-amber" />
                  Empieza mirando uno. Solo uno.
                </p>
              </section>
            </div>
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

      <WhatsAppCta
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
