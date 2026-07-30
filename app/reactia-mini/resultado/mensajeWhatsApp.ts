import { AREA_LABELS } from '@/content/diagnostico-config';
import type { StoredLead } from '@/lib/storage/leadStorage';
import type { Area } from './scoreScale';

type Args = {
  // `undefined` covers useLead()'s brief "still checking localStorage"
  // state — treated the same as `null` here, since the message just omits
  // the name either way.
  lead: StoredLead | null | undefined;
  cuelloBotella: Area;
  score: number;
  resultadoId: string;
};

/**
 * The pre-filled WhatsApp message.
 *
 * Lives in one place because two entry points open the same conversation (the
 * "¿Necesitas ayuda?" button on the result page and the popup that appears after
 * the reader finishes it) and whoever answers should get identical context
 * regardless of which one was used.
 *
 * The result id goes last, in parentheses: it lets the team pull the full
 * diagnóstico up without asking the person to describe it again.
 */
export const buildMensajeDiagnostico = ({
  lead,
  cuelloBotella,
  score,
  resultadoId,
}: Args): string =>
  [
    'Hola, acabo de hacer el diagnóstico de Reactia Mini.',
    lead?.nombre && `Soy ${lead.nombre}${lead.empresa ? ` de ${lead.empresa}` : ''}.`,
    `Me salió ${score} de 100 y mi freno principal es "${AREA_LABELS[cuelloBotella]}".`,
    'Quiero que me ayuden a resolverlo.',
    `(Diagnóstico: ${resultadoId})`,
  ]
    .filter(Boolean)
    .join(' ');
