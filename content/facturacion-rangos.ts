/**
 * Monthly revenue bands for the gatekeeping form.
 *
 * The form asks for a band, not an exact figure — owners either don't know the
 * number or won't hand it to a stranger, and the qualification rule only needs
 * to know which side of 5M COP they're on.
 *
 * `copMinimo` is each band's LOWER bound, and that is the value persisted to
 * `leads.facturacion_mensual_cop`. Using the floor rather than a midpoint means
 * the stored number is a figure the business is guaranteed to clear, so the
 * existing ">= 5.000.000 COP" rule keeps its exact meaning and can never
 * qualify someone on an estimate. It also lands the 5-30M band precisely on the
 * threshold, which is where the qualifying tier is meant to start.
 */
export type FacturacionRango =
  | 'sin_facturacion'
  | '1_5m'
  | '5_30m'
  | '30_100m'
  | 'mas_100m';

type RangoDefinicion = {
  value: FacturacionRango;
  label: string;
  hint?: string;
  /** Lower bound of the band, in COP. */
  copMinimo: number;
};

export const FACTURACION_RANGOS: readonly RangoDefinicion[] = [
  {
    value: 'sin_facturacion',
    label: 'Sin facturación',
    hint: 'Aún no genero ingresos',
    copMinimo: 0,
  },
  {
    value: '1_5m',
    label: '$1 a $5 millones al mes',
    copMinimo: 1_000_000,
  },
  {
    value: '5_30m',
    label: '$5 a $30 millones al mes',
    copMinimo: 5_000_000,
  },
  {
    value: '30_100m',
    label: '$30 a $100 millones al mes',
    copMinimo: 30_000_000,
  },
  {
    value: 'mas_100m',
    label: 'Más de $100 millones al mes',
    copMinimo: 100_000_000,
  },
];

/** Tuple form for z.enum — kept literal so the schema type stays narrow. */
export const FACTURACION_RANGO_VALUES = [
  'sin_facturacion',
  '1_5m',
  '5_30m',
  '30_100m',
  'mas_100m',
] as const satisfies readonly FacturacionRango[];

const COP_POR_RANGO = Object.fromEntries(
  FACTURACION_RANGOS.map((r) => [r.value, r.copMinimo])
) as Record<FacturacionRango, number>;

/** Band → the COP figure stored on the lead (the band's floor). */
export const rangoACop = (rango: FacturacionRango): number => COP_POR_RANGO[rango];

const LABEL_POR_RANGO = Object.fromEntries(
  FACTURACION_RANGOS.map((r) => [r.value, r.label])
) as Record<FacturacionRango, string>;

export const rangoALabel = (rango: FacturacionRango): string => LABEL_POR_RANGO[rango];
