import type { Diagnostico } from '@/lib/schemas';

/**
 * The 11 diagnóstico questions.
 *
 * Copy rules applied throughout: no English, no business jargon, no words a
 * shop owner would have to look up. "avatar" → "cliente ideal", "outbound" →
 * "yo los busco", "ads" → "anuncios pagados", "KPI/métrica" → "el número más
 * importante", "rituales" → "reuniones", "mix" → "otro" with a text box.
 * Everything is second-person and asks about one thing at a time.
 */

export type AreaKey =
  | 'modelo'
  | 'oferta'
  | 'clientes'
  | 'operaciones'
  | 'procesos'
  | 'metricas';

/** Area names shown to the user — the technical keys stay for scoring. */
export const AREA_LABELS: Record<AreaKey, string> = {
  modelo: 'Tu negocio',
  oferta: 'Lo que ofreces',
  clientes: 'Tus clientes',
  operaciones: 'Tu equipo',
  procesos: 'Tu forma de trabajar',
  metricas: 'Tus números',
};

/**
 * What each area actually covers, in one plain sentence.
 *
 * Shown next to the area name on the result page: "Lo que ofreces" on its own
 * doesn't tell the reader what was measured, so the name needs a line under it
 * explaining what it means. Deliberately describes the area, not a programme —
 * no months, no phases, no product names.
 */
export const AREA_DESCRIPCIONES: Record<AreaKey, string> = {
  modelo: 'Qué vendes, a cuánto lo vendes y cuánto te queda de cada venta.',
  oferta:
    'Qué tan claro y distinto es lo que ofreces, y qué tan bien sabes a quién le sirve.',
  clientes:
    'De dónde llegan tus clientes y qué pasa desde que preguntan hasta que te pagan.',
  operaciones: 'Quién saca adelante el trabajo del día a día y qué tanto depende de ti.',
  procesos:
    'Si está escrito cómo se hacen las cosas y si revisas cómo va el negocio cada semana.',
  metricas: 'Qué tan claros tienes los números con los que tomas decisiones.',
};

/**
 * One-word area names, for places where the full label doesn't fit — the radar
 * chart axes, where "Tu forma de trabajar" ran off the edge of the SVG.
 */
export const AREA_LABELS_CORTOS: Record<AreaKey, string> = {
  modelo: 'Negocio',
  oferta: 'Oferta',
  clientes: 'Clientes',
  operaciones: 'Equipo',
  procesos: 'Procesos',
  metricas: 'Números',
};

export type QuestionType = 'opciones' | 'moneda' | 'escala' | 'texto';

export type QuestionOption = {
  value: string;
  label: string;
  hint?: string;
};

/** Companion free-text field, shown only when its trigger option is chosen. */
export type OtroConfig = {
  cuando: string;
  campo: 'modelo_tipo_negocio_otro' | 'origen_clientes_otro';
  label: string;
  placeholder: string;
};

export type DiagnosticoQuestion = {
  id: keyof Diagnostico;
  area: AreaKey;
  titulo: string;
  ayuda?: string;
  tipo: QuestionType;
  opciones?: readonly QuestionOption[];
  columnas?: 1 | 2;
  placeholder?: string;
  escala?: { bajo: string; alto: string };
  otro?: OtroConfig;
  /** Hard character cap for 'texto' questions; also shows a live counter. */
  maxLength?: number;
  /** Rows for the textarea. */
  filas?: number;
  /**
   * Blocks paste on a 'texto' question. Used where the answer is only useful if
   * it is the owner's own words — a pasted block (a website blurb, something
   * generated elsewhere) tells the scoring model nothing about them.
   */
  sinPegar?: boolean;
};

const SI_PARCIAL_NO: readonly QuestionOption[] = [
  { value: 'si', label: 'Sí, lo tengo' },
  { value: 'parcial', label: 'A medias' },
  { value: 'no', label: 'No' },
];

export const diagnosticoConfig: readonly DiagnosticoQuestion[] = [
  {
    id: 'modelo_tipo_negocio',
    area: 'modelo',
    titulo: '¿Qué vende tu negocio?',
    tipo: 'opciones',
    opciones: [
      {
        value: 'producto',
        label: 'Producto',
        hint: 'Algo que se entrega: físico o digital',
      },
      { value: 'servicio', label: 'Servicio', hint: 'Tu trabajo o el de tu equipo' },
      { value: 'otro', label: 'Otro', hint: 'Ninguna de las dos lo describe bien' },
    ],
    otro: {
      cuando: 'otro',
      campo: 'modelo_tipo_negocio_otro',
      label: 'Cuéntanos qué vendes',
      placeholder: 'Ej: alquilo maquinaria por días',
    },
  },
  {
    id: 'descripcion_negocio',
    area: 'modelo',
    titulo: 'Cuéntanos sobre tu negocio',
    ayuda: 'Con dos o tres frases basta: ¿qué hace tu empresa y a quién le sirve?',
    tipo: 'texto',
    maxLength: 280,
    filas: 4,
    sinPegar: true,
    placeholder:
      'Ej: Vendemos software para restaurantes pequeños en Bogotá. Les ayudamos a controlar inventario y no perder plata en desperdicio.',
  },
  {
    id: 'ticket_promedio_cop',
    area: 'modelo',
    titulo: 'En promedio, ¿cuánto te paga un cliente?',
    ayuda: 'Lo que deja una compra o un contrato típico, en pesos.',
    tipo: 'moneda',
    placeholder: '$5.000.000',
  },
  {
    id: 'oferta_escrita',
    area: 'oferta',
    titulo: '¿Tienes escrito qué ofreces y por qué eres distinto?',
    ayuda: 'Algo que le puedas mostrar a un cliente o pasarle a alguien de tu equipo.',
    tipo: 'opciones',
    opciones: SI_PARCIAL_NO,
  },
  {
    id: 'avatar_claridad',
    area: 'oferta',
    titulo:
      '¿Qué tan claro tienes quién es tu cliente ideal y qué problema le resuelves?',
    tipo: 'escala',
    escala: { bajo: 'Nada claro', alto: 'Muy claro' },
  },
  {
    id: 'origen_clientes',
    area: 'clientes',
    titulo: '¿De dónde llegan hoy la mayoría de tus clientes?',
    tipo: 'opciones',
    columnas: 2,
    opciones: [
      {
        value: 'referidos',
        label: 'Me recomiendan',
        hint: 'Clientes o conocidos me pasan gente',
      },
      { value: 'organico', label: 'Me encuentran solos', hint: 'Redes o Google, sin pagar' },
      { value: 'anuncios', label: 'Anuncios pagados', hint: 'Pago para que me vean' },
      { value: 'yo_los_busco', label: 'Yo los busco', hint: 'Los contacto uno por uno' },
      { value: 'otro', label: 'Otro', hint: 'Llegan por otro lado' },
    ],
    otro: {
      cuando: 'otro',
      campo: 'origen_clientes_otro',
      label: '¿Por dónde llegan?',
      placeholder: 'Ej: una alianza con otra empresa',
    },
  },
  {
    id: 'proceso_conversion',
    area: 'clientes',
    titulo: '¿Tienes pasos claros para pasar de interesado a cliente?',
    ayuda: 'Desde que alguien pregunta hasta que te paga.',
    tipo: 'opciones',
    opciones: SI_PARCIAL_NO,
  },
  {
    id: 'operacion_dueño',
    area: 'operaciones',
    titulo: '¿Quién saca adelante el día a día del negocio?',
    tipo: 'opciones',
    opciones: [
      { value: 'yo_todo', label: 'Yo hago todo' },
      { value: 'yo_ayudante', label: 'Yo con un ayudante' },
      { value: 'equipo_pequeno', label: 'Un equipo pequeño' },
      { value: 'equipo_lideres', label: 'Un equipo con jefes de área' },
    ],
  },
  {
    id: 'procesos_documentados',
    area: 'operaciones',
    titulo: '¿Qué tanto está escrito cómo se hacen las cosas en tu negocio?',
    ayuda: 'Si entra alguien nuevo mañana, ¿tiene dónde leer cómo se hace su trabajo?',
    tipo: 'escala',
    escala: { bajo: 'Nada escrito', alto: 'Todo escrito' },
  },
  {
    id: 'rituales_metricas',
    area: 'procesos',
    titulo: '¿Tienes reuniones semanales para revisar cómo va el negocio?',
    tipo: 'opciones',
    opciones: [
      { value: 'si', label: 'Sí, todas las semanas' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'kpi_norte_definido',
    area: 'procesos',
    titulo: '¿Sabes cuál es el número más importante para tu negocio ahora mismo?',
    ayuda: 'El que te dice si vas bien o vas mal sin tener que mirar nada más.',
    tipo: 'opciones',
    opciones: [
      { value: 'si', label: 'Sí, sé cuál es' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'mayor_frustracion',
    area: 'metricas',
    titulo: '¿Qué es lo que más te frustra hoy cuando piensas en crecer?',
    ayuda:
      'Escríbelo con tus palabras. Esto es lo que hace que tu diagnóstico hable de tu negocio y no de un negocio cualquiera.',
    tipo: 'texto',
    placeholder:
      'Ej: consigo clientes nuevos pero no vuelven a comprar, y yo termino metido en todo.',
  },
] as const;

export const TOTAL_PREGUNTAS = diagnosticoConfig.length;

/* ───────────────────────── Answer → readable text ─────────────────────────
 * Used by the review screen and by the scoring prompt, so a stored value like
 * "yo_los_busco" is only ever turned into words in one place.
 * ----------------------------------------------------------------------- */

const optionLabel = (question: DiagnosticoQuestion, value: unknown): string => {
  const match = question.opciones?.find((option) => option.value === value);
  return match?.label ?? String(value ?? '');
};

export const describeAnswer = (
  question: DiagnosticoQuestion,
  values: Partial<Diagnostico>
): string => {
  const value = values[question.id];
  if (value === undefined || value === null || value === '') return '';

  switch (question.tipo) {
    case 'moneda':
      return `$${Math.trunc(Number(value)).toLocaleString('es-CO')}`;
    case 'escala': {
      const n = Number(value);
      const matiz =
        n <= 2 ? question.escala?.bajo : n >= 4 ? question.escala?.alto : 'A medias';
      return `${n} de 5 — ${matiz}`;
    }
    case 'texto':
      return String(value);
    case 'opciones': {
      const label = optionLabel(question, value);
      const otro = question.otro;
      if (otro && value === otro.cuando) {
        const detalle = values[otro.campo];
        return detalle ? `${label}: ${detalle}` : label;
      }
      return label;
    }
    default:
      return String(value);
  }
};
