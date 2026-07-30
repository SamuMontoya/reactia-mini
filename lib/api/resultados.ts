import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { ScoringResult } from '@/lib/schemas';

type ScoringResultWithModel = ScoringResult & { modelo_usado: string };

export const saveResultado = async (
  diagnosticoId: string,
  scoringResult: ScoringResultWithModel
) => {
  const { data: diagnostico, error: diagnosticoError } = await supabaseAdmin
    .from('diagnosticos')
    .select('id')
    .eq('id', diagnosticoId)
    .single();

  if (diagnosticoError || !diagnostico) {
    throw new Error('Diagnóstico no encontrado');
  }

  const { data: resultado, error } = await supabaseAdmin
    .from('resultados')
    .insert({
      diagnostico_id: diagnosticoId,
      scores: scoringResult.scores,
      cuello_botella: scoringResult.cuello_botella,
      proximo_paso: scoringResult.proximo_paso,
      benchmark: scoringResult.benchmark,
      kpis_starter: scoringResult.kpis_starter,
      modelo_usado: scoringResult.modelo_usado,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  const { error: deviceDiagError } = await supabaseAdmin
    .from('device_diagnostics')
    .update({ resultado_id: resultado.id })
    .eq('diagnostico_id', diagnosticoId);

  if (deviceDiagError) throw new Error(deviceDiagError.message);

  return { resultadoId: resultado.id };
};
