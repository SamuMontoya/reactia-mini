import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { diagnosticoSchema, type Diagnostico } from '@/lib/schemas';
import { asegurarLimiteDiagnosticosNoAlcanzado } from '@/lib/api/device';

export const saveDiagnostico = async (
  leadId: string,
  respuestas: Diagnostico,
  deviceId: string
) => {
  const validRespuestas = diagnosticoSchema.parse(respuestas);

  // Defense in depth, not the primary gate (that's submitGatekeeping, which
  // runs first in the normal flow): catches a device that only crossed the
  // limit after its lead was already created — two tabs open at once, or a
  // 3rd diagnóstico started right as a 2nd finishes elsewhere.
  await asegurarLimiteDiagnosticosNoAlcanzado(deviceId);

  const { data: lead, error: leadError } = await supabaseAdmin
    .from('leads')
    .select('id')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    throw new Error('Lead no encontrado');
  }

  const { data: diagnostico, error } = await supabaseAdmin
    .from('diagnosticos')
    .insert({
      lead_id: leadId,
      respuestas: validRespuestas,
      estado: 'completo',
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  const diagnosticoId = diagnostico.id;

  const { error: deviceDiagError } = await supabaseAdmin
    .from('device_diagnostics')
    .insert({
      device_id: deviceId,
      lead_id: leadId,
      diagnostico_id: diagnosticoId,
    });

  if (deviceDiagError) throw new Error(deviceDiagError.message);

  return { diagnosticoId };
};
