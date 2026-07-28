import { z } from 'zod';
import { FACTURACION_RANGO_VALUES } from '@/content/facturacion-rangos';

/* ──────────────────────────────── Gatekeeping ──────────────────────────────── */

export const gatekeepingSchema = z.object({
  // A band, not a figure. The COP value stored on the lead is derived from this
  // server-side (see lib/api/gatekeeping.ts) so the client can't submit a
  // revenue number that disagrees with the band it picked.
  facturacion_rango: z.enum(FACTURACION_RANGO_VALUES, {
    message: 'Selecciona tu rango de facturación',
  }),
  // 0 is valid and must never block the flow — a business in its first year
  // still gets the diagnóstico, it just doesn't qualify for the paid program.
  anios_operacion: z
    .number({ message: 'Escribe cuántos años llevas operando' })
    .int('Escribe un número entero de años')
    .min(0, 'No puede ser negativo')
    .max(100, 'Revisa ese número de años'),
  rol: z.enum(['dueño_ceo', 'empleado', 'socio_no_operativo', 'otro'], {
    message: 'Selecciona tu rol',
  }),
  nombre: z.string().min(2, 'Escribe tu nombre'),
  empresa: z.string().min(2, 'Escribe el nombre de tu empresa'),
  whatsapp: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Escribe tu número de WhatsApp completo'),
});

export type Gatekeeping = z.infer<typeof gatekeepingSchema>;

/* ──────────────────────────────── Diagnóstico ────────────────────────────────
 * 11 questions. Monthly revenue used to be question 11 and was dropped: it is
 * already captured in gatekeeping, and asking twice reads as a form that isn't
 * paying attention.
 *
 * Field keys are unchanged from the 12-question version wherever the meaning is
 * the same (`avatar_claridad`, `rituales_metricas`, `kpi_norte_definido`) even
 * though their user-facing wording no longer uses that vocabulary — keeping the
 * keys stable means diagnósticos already stored in Supabase stay readable.
 * `origen_clientes` values ARE renamed, because those values are fed verbatim to
 * the scoring model and "ads"/"outbound"/"mix" are exactly the jargon we're
 * removing from the product.
 * ------------------------------------------------------------------------- */

const otroTexto = z
  .string()
  .trim()
  .min(2, 'Cuéntanos en pocas palabras')
  .max(120, 'Máximo 120 caracteres');

export const diagnosticoSchema = z
  .object({
    // Modelo
    modelo_tipo_negocio: z.enum(['producto', 'servicio', 'otro'], {
      message: 'Selecciona una opción',
    }),
    modelo_tipo_negocio_otro: otroTexto.optional(),
    descripcion_negocio: z
      .string()
      .trim()
      .min(10, 'Cuéntanos un poco más — con una o dos frases basta')
      .max(280, 'Máximo 280 caracteres'),
    ticket_promedio_cop: z
      .number({ message: 'Escribe cuánto te paga un cliente' })
      .min(1, 'Debe ser mayor a cero'),

    // Oferta
    oferta_escrita: z.enum(['si', 'no', 'parcial'], { message: 'Selecciona una opción' }),
    avatar_claridad: z
      .number({ message: 'Elige un número del 1 al 5' })
      .min(1, 'Elige un número del 1 al 5')
      .max(5, 'Elige un número del 1 al 5'),

    // Clientes
    origen_clientes: z.enum(
      ['referidos', 'organico', 'anuncios', 'yo_los_busco', 'otro'],
      { message: 'Selecciona una opción' }
    ),
    origen_clientes_otro: otroTexto.optional(),
    proceso_conversion: z.enum(['si', 'no', 'parcial'], {
      message: 'Selecciona una opción',
    }),

    // Operaciones
    operacion_dueño: z.enum(
      ['yo_todo', 'yo_ayudante', 'equipo_pequeno', 'equipo_lideres'],
      { message: 'Selecciona una opción' }
    ),
    procesos_documentados: z
      .number({ message: 'Elige un número del 1 al 5' })
      .min(1, 'Elige un número del 1 al 5')
      .max(5, 'Elige un número del 1 al 5'),

    // Procesos
    rituales_metricas: z.enum(['si', 'no'], { message: 'Selecciona una opción' }),
    kpi_norte_definido: z.enum(['si', 'no'], { message: 'Selecciona una opción' }),

    // Cualitativo
    mayor_frustracion: z
      .string()
      .trim()
      .min(10, 'Cuéntanos un poco más — con una o dos frases basta')
      .max(600, 'Máximo 600 caracteres'),
  })
  // "Otro" is only meaningful when it was actually chosen, and when it was
  // chosen the free text carries the whole answer — so require it.
  .refine(
    (data) => data.modelo_tipo_negocio !== 'otro' || !!data.modelo_tipo_negocio_otro,
    { path: ['modelo_tipo_negocio_otro'], message: 'Cuéntanos qué vendes' }
  )
  .refine((data) => data.origen_clientes !== 'otro' || !!data.origen_clientes_otro, {
    path: ['origen_clientes_otro'],
    message: 'Cuéntanos de dónde vienen',
  });

export type Diagnostico = z.infer<typeof diagnosticoSchema>;

/* ───────────────────────────────── Scoring ───────────────────────────────── */

export const scoringResultSchema = z.object({
  scores: z.object({
    modelo: z.number().min(0).max(100),
    oferta: z.number().min(0).max(100),
    clientes: z.number().min(0).max(100),
    operaciones: z.number().min(0).max(100),
    procesos: z.number().min(0).max(100),
    metricas: z.number().min(0).max(100),
  }),
  cuello_botella: z.enum(
    ['modelo', 'oferta', 'clientes', 'operaciones', 'procesos', 'metricas'],
    { message: 'Cuello de botella inválido' }
  ),
  proximo_paso: z.string().min(1, 'proximo_paso es requerido'),
  benchmark: z.string().min(1, 'benchmark es requerido'),
  kpis_starter: z
    .array(z.string())
    .length(4, 'kpis_starter debe tener exactamente 4 elementos'),
});

export type ScoringResult = z.infer<typeof scoringResultSchema>;
