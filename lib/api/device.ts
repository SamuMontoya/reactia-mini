import { supabase } from '@/lib/supabase';
import type { ScoringResult } from '@/lib/schemas';

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

export const getDiagnosticosByDeviceId = async (
  deviceId: string
): Promise<DiagnosticoPorDispositivo[]> => {
  const { data, error } = await supabase
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