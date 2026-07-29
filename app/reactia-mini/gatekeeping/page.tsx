'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gatekeepingSchema, type Gatekeeping } from '@/lib/schemas';
import { FACTURACION_RANGOS } from '@/content/facturacion-rangos';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { saveLead } from '@/lib/storage/leadStorage';
import { getErrorMessage } from '@/lib/getErrorMessage';
import Field from '@/components/ui/Field';
import Dropdown from '@/components/ui/Dropdown';
import PhoneInput from '@/components/ui/PhoneInput';
import { ArrowRight, Lock } from '@/components/icons';

const ROLES = [
  { value: 'dueño_ceo', label: 'Dueño o dueña', hint: 'El negocio es mío' },
  { value: 'socio_no_operativo', label: 'Socio', hint: 'Soy dueño pero no opero' },
  { value: 'empleado', label: 'Trabajo aquí', hint: 'Soy parte del equipo' },
  { value: 'otro', label: 'Otro' },
] as const;

const RANGOS_DROPDOWN = FACTURACION_RANGOS.map((rango) => ({
  value: rango.value,
  label: rango.label,
  hint: rango.hint,
}));

export default function GatekeepingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Gatekeeping>({
    resolver: zodResolver(gatekeepingSchema),
    defaultValues: { nombre: '', empresa: '', whatsapp: '' },
  });

  const onSubmit = async (data: Gatekeeping) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/mini/gatekeeping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'No pudimos guardar tus datos. Intenta de nuevo.');
      }

      const { leadId, califica } = await response.json();
      trackEvent('gatekeeping_submit', { califica });

      saveLead({
        leadId,
        nombre: data.nombre,
        empresa: data.empresa,
        whatsapp: data.whatsapp,
      });

      router.push(`/reactia-mini/diagnostico?leadId=${leadId}`);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      trackEvent('gatekeeping_error', { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-1">
      {/* Left dark panel - 1/3 width with subtle diagonal line pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink lg:absolute lg:inset-y-0 lg:left-0 lg:w-1/3"
      >
        {/* Diagonal line pattern - subtle diagnostic/scan aesthetic */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--color-dust) 0, var(--color-dust) 1px, transparent 1px, transparent 40px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="ds-halo left-1/2 top-[-18rem] h-[32rem] w-[32rem] -translate-x-1/2"
          style={{
            background:
              'radial-gradient(circle, rgba(200,134,10,.18) 0%, rgba(200,134,10,.04) 45%, transparent 72%)',
          }}
        />
      </div>

      <div className="ds-container relative flex h-full items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_2fr] lg:gap-0">
          {/* Left: Copy on dark background */}
          <div className="relative z-10 flex flex-col justify-center p-6 lg:p-12 text-center lg:text-left">
            <p className="ds-wash ds-animate-up inline-block py-1.5 pl-3 pr-3.5">
              <span className="ds-eyebrow">Paso 1 de 3</span>
            </p>
            <h1
              className="ds-animate-up mt-4 font-display text-section font-bold text-white"
              style={{ animationDelay: '80ms' }}
            >
              Cuéntanos de ti
            </h1>
            <p
              className="ds-animate-up mt-3 text-lg text-dust max-w-md"
              style={{ animationDelay: '160ms' }}
            >
              Cinco datos para entender de qué negocio estamos hablando. Toma menos de un
              minuto.
            </p>
          </div>

          {/* Right: Form on white background, centered */}
          <div className="relative z-10 flex h-full items-center justify-center p-6 lg:p-12 bg-white">
            <div className="ds-animate-up w-full max-w-md" style={{ animationDelay: '240ms' }}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="ds-card space-y-4 p-6"
              >
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <Field
                    id="nombre"
                    label="Tu nombre"
                    hint="Para saber cómo llamarte."
                    error={errors.nombre?.message}
                  >
                    <input
                      id="nombre"
                      type="text"
                      autoComplete="name"
                      placeholder="Ej: María Fernanda Gómez"
                      aria-invalid={errors.nombre ? true : undefined}
                      {...register('nombre')}
                      className="ds-input"
                    />
                  </Field>

                  <Field
                    id="empresa"
                    label="Nombre de la empresa"
                    hint="El nombre con el que te conocen."
                    error={errors.empresa?.message}
                  >
                    <input
                      id="empresa"
                      type="text"
                      autoComplete="organization"
                      placeholder="Ej: Tech Solutions SAS"
                      aria-invalid={errors.empresa ? true : undefined}
                      {...register('empresa')}
                      className="ds-input"
                    />
                  </Field>

                  <Field
                    id="facturacion_rango"
                    label="¿Cuánto factura tu negocio al mes?"
                    hint="Un rango aproximado basta."
                    error={errors.facturacion_rango?.message}
                    asGroup
                  >
                    <Controller
                      name="facturacion_rango"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={RANGOS_DROPDOWN}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          labelId="facturacion_rango-label"
                          placeholder="Elige un rango"
                          invalid={!!errors.facturacion_rango}
                        />
                      )}
                    />
                  </Field>

                  <Field
                    id="rol"
                    label="¿Cuál es tu rol en el negocio?"
                    hint="Qué haces dentro del negocio."
                    error={errors.rol?.message}
                    asGroup
                  >
                    <Controller
                      name="rol"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={ROLES}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          labelId="rol-label"
                          placeholder="Elige tu rol"
                          invalid={!!errors.rol}
                        />
                      )}
                    />
                  </Field>

                  <Field
                    id="anios_operacion"
                    label="¿Cuántos años lleva funcionando?"
                    hint="Si arrancaste este año, escribe 0."
                    error={errors.anios_operacion?.message}
                  >
                    <input
                      id="anios_operacion"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      placeholder="Ej: 3"
                      aria-invalid={errors.anios_operacion ? true : undefined}
                      {...register('anios_operacion', {
                        setValueAs: (value) =>
                          value === '' || value === null ? undefined : Number(value),
                      })}
                      className="ds-input"
                    />
                  </Field>

                  <Field
                    id="whatsapp"
                    label="Tu WhatsApp"
                    hint="Para enviarte tu diagnóstico."
                    error={errors.whatsapp?.message}
                  >
                    <Controller
                      name="whatsapp"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          id="whatsapp"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          invalid={!!errors.whatsapp}
                          describedBy="whatsapp-hint"
                        />
                      )}
                    />
                  </Field>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-[var(--radius-field)] border border-signal-low/30 bg-signal-low/5 p-4 text-base text-signal-low"
                  >
                    {error}
                  </p>
                )}

                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ds-btn ds-btn-amber ds-btn-lg w-full"
                  >
                    {isSubmitting ? 'Guardando...' : 'Continuar a las preguntas'}
                    {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                  </button>

                  <p className="flex items-start justify-center gap-1.5 text-sm text-stone">
                    <Lock className="mt-[0.2em] h-4 w-4 shrink-0" />
                    <span>
                      No compartimos tus datos con nadie. Al continuar autorizas su manejo
                      según nuestra política de privacidad.
                    </span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}