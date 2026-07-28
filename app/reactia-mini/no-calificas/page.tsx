'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { getErrorMessage } from '@/lib/getErrorMessage';
import Field from '@/components/ui/Field';
import { ArrowRight } from '@/components/icons';

const emailSchema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type EmailForm = z.infer<typeof emailSchema>;

function NoCualificasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadId = searchParams.get('leadId');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  useEffect(() => {
    trackEvent('no_calificas_view', { leadId });
  }, [leadId]);

  const onSubmit = async (data: EmailForm) => {
    if (!leadId) {
      setError('Error: leadId no encontrado');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (data.email) {
        const response = await fetch(`/api/mini/leads/${leadId}/email`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email }),
        });

        if (!response.ok) {
          throw new Error('Error al guardar el email');
        }
        trackEvent('no_calificas_email_submit', { email: data.email });
      }

      router.push(`/reactia-mini/diagnostico?leadId=${leadId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="ds-container">
        <div className="ds-card mx-auto max-w-md p-8 sm:p-10">
          <h1 className="font-display text-2xl font-bold text-ink">
            Todavía estás empezando
          </h1>
          <p className="mt-3 text-base text-stone">
            Nuestro programa pago está pensado para negocios que ya llevan un tiempo
            andando.{' '}
            <span className="font-semibold text-ink">
              El diagnóstico igual es tuyo, y es gratis
            </span>{' '}
            — te va a mostrar qué ordenar primero.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
            <Field
              id="email"
              label="Tu correo"
              hint="Opcional. Solo si quieres que te escribamos más adelante."
              error={errors.email?.message}
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tunombre@tuempresa.com"
                aria-invalid={errors.email ? true : undefined}
                {...register('email')}
                className="ds-input"
              />
            </Field>

            {error && (
              <p
                role="alert"
                className="rounded-[var(--radius-field)] border border-signal-low/30 bg-signal-low/5 p-4 text-base text-signal-low"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="ds-btn ds-btn-amber ds-btn-lg w-full"
            >
              {isSubmitting ? 'Guardando...' : 'Continuar al diagnóstico'}
              {!isSubmitting && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NoCualificasPage() {
  return (
    <Suspense fallback={null}>
      <NoCualificasContent />
    </Suspense>
  );
}
