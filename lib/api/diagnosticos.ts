import { supabase } from '@/lib/supabase';
import { diagnosticoSchema, type Diagnostico } from '@/lib/schemas';

export const saveDiagnostico = async (
  leadId: string,
  respuestas: Diagnostico,
  deviceId: string
) => {
  const validRespuestas = diagnosticoSchema.parse(respuestas);

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    throw new Error('Lead no encontrado');
  }

  const { data: diagnostico, error } = await supabase
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

  const { error: deviceDiagError } = await supabase
    .from('device_diagnostics')
    .insert({
      device_id: deviceId,
      lead_id: leadId,
      diagnostico_id: diagnosticoId,
    });

  if (deviceDiagError) throw new Error(deviceDiagError.message);

  return { diagnosticoId };
};
