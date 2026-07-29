'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useLead } from '@/lib/hooks/useLead';
import { supabase } from '@/lib/supabase';
import { getErrorMessage } from '@/lib/getErrorMessage';
import Spinner from '@/components/ui/Spinner';
import type { Diagnostico } from '@/lib/schemas';

const ROTATING_MESSAGES = [
  'Leyendo lo que nos contaste...',
  'Comparando con otros negocios como el tuyo...',
  'Buscando tu freno principal...',
  'Preparando tu resultado...',
];

type DiagnosticoRow = {
  id: string;
  respuestas: Diagnostico;
};

function GenerandoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lead = useLead();

  const diagnosticoIdParam = searchParams.get('diagnosticoId');

  const [diagnostico, setDiagnostico] = useState<DiagnosticoRow | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    trackEvent('generando_view');
  }, []);

  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [error]);

  // Paso 1: resolver el diagnóstico (id + respuestas) desde la URL o, si no
  // vino, buscando el más reciente del lead en localStorage.
  useEffect(() => {
    if (diagnostico) return;

    if (!diagnosticoIdParam && !lead) {
      router.replace('/reactia-mini/gatekeeping');
      return;
    }

    let cancelled = false;

    const fetchDiagnostico = async () => {
      setError(null);

      const query = diagnosticoIdParam
        ? supabase
            .from('diagnosticos')
            .select('id, respuestas')
            .eq('id', diagnosticoIdParam)
            .single()
        : supabase
            .from('diagnosticos')
            .select('id, respuestas')
            .eq('lead_id', lead!.leadId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

      const { data, error: queryError } = await query;

      if (cancelled) return;

      if (queryError || !data) {
        setError('No encontramos tu diagnóstico.');
        trackEvent('generando_error', { message: 'diagnostico_no_encontrado' });
        return;
      }

      setDiagnostico(data as DiagnosticoRow);
    };

    fetchDiagnostico();

    return () => {
      cancelled = true;
    };
  }, [diagnostico, diagnosticoIdParam, lead, router, attempt]);

  // Paso 2: una vez tenemos el diagnóstico, generar el resultado con IA.
  useEffect(() => {
    if (!diagnostico) return;

    let cancelled = false;

    const generarResultado = async () => {
      try {
        const response = await fetch('/api/mini/resultado/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagnosticoId: diagnostico.id,
            respuestas: diagnostico.respuestas,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'Error al generar tu resultado');
        }

        if (cancelled) return;

        const { resultadoId } = await response.json();
        trackEvent('generando_success');
        router.push(`/reactia-mini/resultado?resultadoId=${resultadoId}`);
      } catch (err) {
        if (cancelled) return;
        const message = getErrorMessage(err);
        setError(message);
        trackEvent('generando_error', { message });
      }
    };

    generarResultado();

    return () => {
      cancelled = true;
    };
  }, [diagnostico, router]);

  const handleRetry = () => {
    setError(null);
    setDiagnostico(null);
    setAttempt((a) => a + 1);
  };

  return (
    // Full-bleed ink. This is the one screen in the funnel that is pure waiting,
    // and the change of register does two things: it signals that work is
    // happening rather than that the page stalled, and it makes arriving at the
    // light result page feel like a payoff. Ink is the brand's own treatment for
    // its "voice" moments, so it reads as intentional rather than as a loader
    // someone dropped in.
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-ink">
      <div
        aria-hidden
        className="ds-float pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(200,134,10,.22) 0%, rgba(200,134,10,.06) 42%, transparent 70%)',
        }}
      />

      <div className="ds-container relative">
        <div className="mx-auto max-w-md text-center">
          {error ? (
            <>
              <h1 className="font-display text-3xl font-bold text-white">
                Algo salió mal
              </h1>
              <p className="mt-3 text-lg text-dust">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="ds-btn ds-btn-amber ds-btn-lg mt-8 w-full sm:w-auto"
              >
                Reintentar
              </button>
            </>
          ) : (
            <>
              <Spinner className="h-14 w-14" />

              <h1 className="mt-8 font-display text-section font-extrabold leading-tight tracking-tight text-white">
                Estamos armando tu diagnóstico
              </h1>

              {/* `key` on the message forces a remount each rotation, which is
                  what lets the fade replay — without it React reuses the node and
                  the animation only ever runs once. Fixed height so the block
                  below doesn't jump when the line length changes. */}
              <p
                aria-live="polite"
                className="mt-4 flex min-h-[3.5rem] items-center justify-center text-lg text-dust"
              >
                <span key={messageIndex} className="ds-fade-in">
                  {ROTATING_MESSAGES[messageIndex]}
                </span>
              </p>

              <p className="mt-4 text-sm text-stone">
                Toma unos segundos. No cierres la página.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GenerandoPage() {
  return (
    <Suspense fallback={null}>
      <GenerandoContent />
    </Suspense>
  );
}
