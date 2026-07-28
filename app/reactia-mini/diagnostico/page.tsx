'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { diagnosticoSchema, type Diagnostico } from '@/lib/schemas';
import { diagnosticoConfig, TOTAL_PREGUNTAS } from '@/content/diagnostico-config';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useLead } from '@/lib/hooks/useLead';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { clearDraft, getDraft, saveDraft } from '@/lib/storage/diagnosticoDraft';
import QuestionRenderer from './QuestionRenderer';
import ResumenPaso from './ResumenPaso';
import { ArrowLeft, ArrowRight, Check } from '@/components/icons';

/** A question step, or the review screen that follows the last question. */
type Paso = { tipo: 'pregunta'; index: number } | { tipo: 'resumen' };

const RESUMEN: Paso = { tipo: 'resumen' };

export default function DiagnosticoPage() {
  const router = useRouter();
  const lead = useLead();

  const [paso, setPaso] = useState<Paso>({ tipo: 'pregunta', index: 0 });
  // Set when the user jumped into a question from the review screen, so
  // "Guardar" returns there instead of continuing forward through the wizard.
  const [volverAResumen, setVolverAResumen] = useState(false);
  // Which way the last step moved, so the entrance animation agrees with it.
  const [direccion, setDireccion] = useState<'adelante' | 'atras'>('adelante');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guardadoEn, setGuardadoEn] = useState<number | null>(null);
  const [draftCargado, setDraftCargado] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    setError,
    formState: { errors },
  } = useForm<Diagnostico>({
    resolver: zodResolver(diagnosticoSchema),
    // Default behaviour, stated explicitly because the whole wizard depends on
    // it: react-hook-form keeps values for unmounted fields, which is what lets
    // one form instance span all 11 steps.
    shouldUnregister: false,
  });
  const values = useWatch({ control });

  useEffect(() => {
    if (!lead) {
      router.replace('/reactia-mini/gatekeeping');
    }
  }, [lead, router]);

  useEffect(() => {
    trackEvent('diagnostico_iniciado');
  }, []);

  /* ── Restore a saved draft, once, as soon as we know which lead this is ── */
  useEffect(() => {
    if (!lead || draftCargado) return;

    const draft = getDraft(lead.leadId);
    if (draft) {
      queueMicrotask(() => {
        reset(draft.respuestas as Diagnostico, { keepDefaultValues: true });
        const contestadas = Object.keys(draft.respuestas).length;
        // Reopen on the saved step, but never past the end of the wizard.
        setPaso(
          contestadas >= TOTAL_PREGUNTAS
            ? RESUMEN
            : { tipo: 'pregunta', index: Math.min(draft.paso, TOTAL_PREGUNTAS - 1) }
        );
        setGuardadoEn(draft.guardadoEn || null);
        trackEvent('diagnostico_borrador_recuperado', { paso: draft.paso });
      });
    }
    queueMicrotask(() => setDraftCargado(true));
  }, [lead, draftCargado, reset]);

  /* ── Autosave: persist on every answer change, debounced ── */
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't write before the draft has been read, or the empty initial form
    // would overwrite the saved answers.
    if (!lead || !draftCargado) return;

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const respuestas = Object.fromEntries(
        Object.entries(values).filter(
          ([, value]) => value !== undefined && value !== null && value !== ''
        )
      ) as Partial<Diagnostico>;

      const pasoGuardado = paso.tipo === 'pregunta' ? paso.index : TOTAL_PREGUNTAS;
      
      setSaveStatus('saving');
      try {
        const timestamp = saveDraft(lead.leadId, { respuestas, paso: pasoGuardado });
        setGuardadoEn(timestamp);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 400);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [values, lead, draftCargado, paso]);

  const onSubmit = useCallback(
    async (data: Diagnostico) => {
      if (!lead) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await fetch('/api/mini/diagnostico/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: lead.leadId, respuestas: data }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? 'No pudimos guardar tus respuestas.');
        }

        const { diagnosticoId } = await response.json();

        // The answers are safely in Supabase now, so the local draft has done
        // its job. Leaving it would silently reopen a stale wizard next visit.
        clearDraft(lead.leadId);

        trackEvent('diagnostico_completado');
        router.push(`/reactia-mini/generando?diagnosticoId=${diagnosticoId}`);
      } catch (err) {
        setSubmitError(getErrorMessage(err));
        setIsSubmitting(false);
      }
    },
    [lead, router]
  );

  /**
   * Validates only the question on screen.
   *
   * The "otro" free-text requirement is checked here rather than left to the
   * schema's object-level refine: a refine only runs after the whole object
   * parses, so during step-by-step validation (where the other ten answers are
   * still missing) it would never fire. The refine stays in the schema as the
   * server-side guarantee.
   */
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    if (paso.tipo !== 'pregunta') return true;

    const question = diagnosticoConfig[paso.index];
    const ok = await trigger(question.id, { shouldFocus: true });
    if (!ok) return false;

    const otro = question.otro;
    if (otro && getValues(question.id) === otro.cuando) {
      const detalle = String(getValues(otro.campo) ?? '').trim();
      if (detalle.length < 2) {
        setError(otro.campo, {
          type: 'manual',
          message: 'Cuéntanos en pocas palabras',
        });
        return false;
      }
    }

    return true;
  }, [paso, trigger, getValues, setError]);

  const handleNext = async () => {
    if (!(await validarPasoActual())) return;

    setDireccion('adelante');

    if (volverAResumen) {
      setVolverAResumen(false);
      setPaso(RESUMEN);
      return;
    }

    if (paso.tipo === 'pregunta' && paso.index < TOTAL_PREGUNTAS - 1) {
      setPaso({ tipo: 'pregunta', index: paso.index + 1 });
    } else {
      setPaso(RESUMEN);
    }
  };

  const handlePrevious = () => {
    setDireccion('atras');

    if (volverAResumen) {
      setVolverAResumen(false);
      setPaso(RESUMEN);
      return;
    }
    if (paso.tipo === 'resumen') {
      setPaso({ tipo: 'pregunta', index: TOTAL_PREGUNTAS - 1 });
      return;
    }
    setPaso({ tipo: 'pregunta', index: Math.max(0, paso.index - 1) });
  };

  const handleEditFromResumen = (index: number) => {
    setVolverAResumen(true);
    // Jumping back into a question to change it is a step backwards, whichever
    // question it is.
    setDireccion('atras');
    setPaso({ tipo: 'pregunta', index });
  };

  // Subscribe to the two fields that toggle a conditional text box, so the
  // renderer re-renders as soon as the trigger option is picked.
  const tipoNegocio = values.modelo_tipo_negocio;
  const origenClientes = values.origen_clientes;

  const valorActual = useMemo(() => {
    if (paso.tipo !== 'pregunta') return undefined;
    const id = diagnosticoConfig[paso.index].id;
    if (id === 'modelo_tipo_negocio') return tipoNegocio;
    if (id === 'origen_clientes') return origenClientes;
    return undefined;
  }, [paso, tipoNegocio, origenClientes]);

  if (!lead) return null;

  const enResumen = paso.tipo === 'resumen';
  const numeroPaso = enResumen ? TOTAL_PREGUNTAS : paso.index + 1;
  const progreso = (numeroPaso / TOTAL_PREGUNTAS) * 100;

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Progress ── */}
      {/* No bottom rule: the progress bar itself is already a horizontal line,
          so a divider under it read as a second, redundant one. */}
      <div className="bg-paper/85 backdrop-blur-md">
        <div className="ds-container py-3.5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium text-stone">
              {enResumen
                ? 'Revisión final'
                : `Pregunta ${numeroPaso} de ${TOTAL_PREGUNTAS}`}
            </p>
            {guardadoEn && (
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && (
                  <span className="flex items-center gap-1.5 text-sm text-stone/80">
                    <svg className="h-4 w-4 animate-spin text-amber" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1.5 text-sm text-signal-high">
                    <Check className="h-4 w-4" />
                    Guardado
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="flex items-center gap-1.5 text-sm text-signal-low">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Error al guardar</span>
                    <button
                      type="button"
                      onClick={() => setSaveStatus('idle')}
                      className="text-xs underline hover:text-signal-low/80"
                    >
                      Reintentar
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuenow={numeroPaso}
            aria-valuemin={1}
            aria-valuemax={TOTAL_PREGUNTAS}
            aria-label="Avance del diagnóstico"
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-dust/60"
          >
            <div
              className="h-full rounded-full bg-amber transition-[width] duration-500 ease-[var(--ease-brand)]"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── The question fills the screen instead of sitting in a narrow card ── */}
      <div className="ds-container flex flex-1 flex-col justify-center py-4 sm:py-6">
        {enResumen ? (
          <ResumenPaso
            values={getValues()}
            onEdit={handleEditFromResumen}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        ) : (
          <div
            key={paso.index}
            className={`mx-auto w-full ${
              direccion === 'adelante' ? 'ds-in-right' : 'ds-in-left'
            }`}
          >
            <QuestionRenderer
              question={diagnosticoConfig[paso.index]}
              control={control}
              errors={errors}
              currentValue={valorActual}
            />
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      {!enResumen && (
        <div className="sticky bottom-0 bg-paper/90 backdrop-blur-md">
          <div className="ds-container flex items-center justify-between gap-4 py-4">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={paso.index === 0 && !volverAResumen}
              className="ds-btn ds-btn-outline"
            >
              <ArrowLeft className="h-5 w-5" />
              {volverAResumen ? 'Cancelar' : 'Anterior'}
            </button>

            <button type="button" onClick={handleNext} className="ds-btn ds-btn-amber">
              {volverAResumen
                ? 'Guardar y volver'
                : paso.index === TOTAL_PREGUNTAS - 1
                  ? 'Revisar respuestas'
                  : 'Siguiente'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
