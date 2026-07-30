import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { gatekeepingSchema, type Gatekeeping } from '@/lib/schemas';
import { rangoACop } from '@/content/facturacion-rangos';
import { asegurarLimiteDiagnosticosNoAlcanzado } from '@/lib/api/device';

/** Monthly revenue at or above this qualifies for the paid program. */
export const UMBRAL_FACTURACION_COP = 5_000_000;
/** Years operating at or above this qualifies. Below it, `califica` is false. */
export const MINIMO_ANIOS_OPERACION = 1;

export const submitGatekeeping = async (data: Gatekeeping, deviceId?: string) => {
  const validData = gatekeepingSchema.parse(data);

  // The real gate: the landing page's popup only stops the button click —
  // nothing prevented a bookmark, a typed URL, or the history grid's
  // desktop placeholder card from reaching this route directly and
  // creating another lead anyway. This is what actually enforces the limit.
  await asegurarLimiteDiagnosticosNoAlcanzado(deviceId);

  // Derived here, not sent by the client: the form only offers bands, so the
  // stored figure is always the band's floor (see content/facturacion-rangos.ts).
  const facturacionCop = rangoACop(validData.facturacion_rango);

  // Failing any of these means `califica: false` — it does NOT mean the lead is
  // turned away. Everyone continues to the diagnóstico; `califica` only records
  // who is ready for the paid program.
  const califica =
    facturacionCop >= UMBRAL_FACTURACION_COP &&
    validData.anios_operacion >= MINIMO_ANIOS_OPERACION &&
    validData.rol === 'dueño_ceo';

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .insert({
      facturacion_mensual_cop: facturacionCop,
      facturacion_rango: validData.facturacion_rango,
      anios_operacion: validData.anios_operacion,
      rol: validData.rol,
      nombre: validData.nombre,
      empresa: validData.empresa,
      whatsapp: validData.whatsapp,
      califica,
      estado: califica ? 'calificado_pendiente' : 'no_calificado',
      device_id: deviceId ?? null,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  return { leadId: lead.id, califica, deviceId: deviceId ?? null };
};
