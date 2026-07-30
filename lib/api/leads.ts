import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const updateLeadEmail = async (leadId: string, email: string) => {
  const { data: lead, error: fetchError } = await supabaseAdmin
    .from('leads')
    .select('id, estado')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    throw new Error('Lead no encontrado');
  }

  if (lead.estado !== 'no_calificado') {
    throw new Error('El lead no está en estado no_calificado');
  }

  const { error: updateError } = await supabaseAdmin
    .from('leads')
    .update({ email })
    .eq('id', leadId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { success: true };
};
