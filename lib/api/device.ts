import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { ScoringResult } from '@/lib/schemas';
import { MAX_DIAGNOSTICOS_GRATIS } from '@/lib/constants/limits';

export type ResultadoResumen = Pick<
  ScoringResult,
  'scores' | 'cuello_botella' | 'proximo_paso' | 'benchmark' | 'kpis_starter'
>;

export type DiagnosticoPorDispositivo = {
  diagnosticoId: string;
  resultadoId: string | null;
  created_at: string;
  leadId: string;
  /** From the lead this diagnóstico belongs to. Empty if the row predates the field. */
  empresa: string;
  nombre: string;
  resultado: ResultadoResumen | null;
};

/** How many diagnósticos this device already has, straight from the count
 *  (`head: true` — no rows fetched), rather than reusing
 *  `getDiagnosticosByDeviceId` and taking `.length`, which would pull every
 *  joined column for rows the caller never looks at. */
export const countDiagnosticosByDeviceId = async (deviceId: string): Promise<number> => {
  const { count, error } = await supabaseAdmin
    .from('device_diagnostics')
    .select('*', { count: 'exact', head: true })
    .eq('device_id', deviceId);

  if (error) throw new Error(error.message);

  return count ?? 0;
};

/** Throws when a device has already used up its free diagnósticos — the
 *  server-side counterpart to the landing page's popup, called from both
 *  submitGatekeeping (blocks a new lead as early as possible) and
 *  saveDiagnostico (defense in depth against races, e.g. two tabs open at
 *  once, that a client-side check can't catch). A missing `deviceId` isn't
 *  blocked here — that's an existing, separate gap (no deviceId validation
 *  upstream), not something this check should paper over. */
export const asegurarLimiteDiagnosticosNoAlcanzado = async (
  deviceId: string | null | undefined
): Promise<void> => {
  if (!deviceId) return;

  const total = await countDiagnosticosByDeviceId(deviceId);
  if (total >= MAX_DIAGNOSTICOS_GRATIS) {
    throw new Error(
      'Ya usaste tus diagnósticos gratuitos en este dispositivo. Escríbenos por WhatsApp.'
    );
  }
};

export const getDiagnosticosByDeviceId = async (
  deviceId: string
): Promise<DiagnosticoPorDispositivo[]> => {
  const { data, error } = await supabaseAdmin
    .from('device_diagnostics')
    .select(
      `
      diagnostico_id,
      resultado_id,
      created_at,
      diagnosticos!inner (id, lead_id),
      leads (nombre, empresa),
      resultados!left (scores, cuello_botella, proximo_paso, benchmark, kpis_starter)
    `
    )
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const diagnostico = Array.isArray(row.diagnosticos)
      ? row.diagnosticos[0]
      : row.diagnosticos;
    const resultado = Array.isArray(row.resultados)
      ? row.resultados[0]
      : row.resultados;
    const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;

    return {
      diagnosticoId: diagnostico?.id ?? '',
      resultadoId: row.resultado_id,
      created_at: row.created_at,
      leadId: diagnostico?.lead_id ?? '',
      // `empresa` was added to leads after launch, so older rows have null.
      // Falling back to '' keeps the card's optional-chaining simple.
      empresa: lead?.empresa ?? '',
      nombre: lead?.nombre ?? '',
      resultado: row.resultado_id && resultado ? resultado : null,
    };
  });
};