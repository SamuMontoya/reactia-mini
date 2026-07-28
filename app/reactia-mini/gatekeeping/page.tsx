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
    <div className="relative flex flex-1 items-center justify-center overflow-hidden py-12">
      <div
        className="ds-halo left-1/2 top-[-16rem] h-[32rem] w-[32rem] -translate-x-1/2"
        aria-hidden
      />

      <div className="ds-container relative">
        <div className="mx-auto max-w-xl">
          <header className="text-center">
            <p className="ds-eyebrow">Paso 1 de 3</p>
            <h1 className="mt-4 font-display text-section font-bold text-ink">
              Cuéntanos de ti
            </h1>
            <p className="mt-3 text-lg text-stone">
              Cinco datos para entender de qué negocio estamos hablando. Toma menos de un
              minuto.
            </p>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="ds-card mt-8 space-y-6 p-6 sm:p-8"
          >
            <Field id="nombre" label="Tu nombre" error={errors.nombre?.message}>
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
              error={errors.empresa?.message}
            >
              <input
                id="empresa"
                type="text"
                autoComplete="organization"
                placeholder="Ej: Muebles del Norte"
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
                  // An empty field would otherwise arrive as NaN and report the
                  // wrong error; undefined lets Zod say "escribe cuántos años".
                  setValueAs: (value) =>
                    value === '' || value === null ? undefined : Number(value),
                })}
                className="ds-input"
              />
            </Field>

            <Field id="rol" label="¿Cuál es tu rol en el negocio?" error={errors.rol?.message} asGroup>
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
              id="whatsapp"
              label="Tu WhatsApp"
              hint="Solo para enviarte el enlace de tu diagnóstico."
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

            {error && (
              <p
                role="alert"
                className="rounded-[var(--radius-field)] border border-signal-low/30 bg-signal-low/5 p-4 text-base text-signal-low"
              >
                {error}
              </p>
            )}

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="ds-btn ds-btn-amber ds-btn-lg w-full"
              >
                {isSubmitting ? 'Guardando...' : 'Continuar a las preguntas'}
                {!isSubmitting && <ArrowRight className="h-5 w-5" />}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-sm text-stone">
                <Lock className="h-4 w-4" />
                No compartimos tus datos con nadie.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
