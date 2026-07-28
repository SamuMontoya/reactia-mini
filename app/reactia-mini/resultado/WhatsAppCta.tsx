'use client';
import { AREA_LABELS } from '@/content/diagnostico-config';
import { buildWhatsAppUrl, isWhatsAppConfigured } from '@/config';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useLead } from '@/lib/hooks/useLead';
import { WhatsApp } from '@/components/icons';
import type { Area } from './scoreScale';

type WhatsAppCtaProps = {
  cuelloBotella: Area;
  score: number;
  resultadoId: string;
};

/**
 * Result-page CTA — straight into WhatsApp.
 *
 * The previous version opened a form asking for a name and an email, both of
 * which were already collected in gatekeeping. Asking a second time for data we
 * hold is friction that buys nothing, so the button now goes to wa.me with the
 * conversation already started, carrying the context the person on the other end
 * needs (who, which company, what came out, and the result id to look it up).
 *
 * With no number configured the button is disabled rather than pointing at a
 * broken wa.me link — a dead CTA on the highest-intent screen is worse than an
 * obviously unfinished one.
 */
export default function WhatsAppCta({
  cuelloBotella,
  score,
  resultadoId,
}: WhatsAppCtaProps) {
  const lead = useLead();
  const configurado = isWhatsAppConfigured();

  const mensaje = [
    `Hola, acabo de hacer el diagnóstico de Reactia Mini.`,
    lead?.nombre && `Soy ${lead.nombre}${lead.empresa ? ` de ${lead.empresa}` : ''}.`,
    `Me salió ${score} de 100 y mi freno principal es "${AREA_LABELS[cuelloBotella]}".`,
    `Quiero que me ayuden a resolverlo.`,
    `(Diagnóstico: ${resultadoId})`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sticky bottom-0 border-t border-dust bg-paper/95 backdrop-blur-md">
      <div className="ds-container py-4">
        {configurado ? (
          <a
            href={buildWhatsAppUrl(mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('cta_experto_click', { canal: 'whatsapp' })}
            className="ds-btn ds-btn-amber ds-btn-lg w-full"
          >
            <WhatsApp className="h-5 w-5" />
            Hablar con un experto por WhatsApp
          </a>
        ) : (
          <>
            <button
              type="button"
              disabled
              className="ds-btn ds-btn-amber ds-btn-lg w-full"
            >
              <WhatsApp className="h-5 w-5" />
              Hablar con un experto por WhatsApp
            </button>
            <p className="mt-2 text-center text-sm text-signal-low">
              Falta configurar <code>NEXT_PUBLIC_WHATSAPP_NUMBER</code> para activar este
              botón.
            </p>
          </>
        )}

        {configurado && (
          <p className="mt-2 text-center text-sm text-stone">
            Te respondemos en el mismo chat. Sin formularios.
          </p>
        )}
      </div>
    </div>
  );
}
