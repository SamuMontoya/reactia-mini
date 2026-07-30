'use client';
import { createPortal } from 'react-dom';
import { buildWhatsAppUrl } from '@/config';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Lock, WhatsApp } from '@/components/icons';

type ExpiradoModalProps = {
  mensajeWhatsApp: string;
};

/**
 * Replaces the old blur-plus-inline-card treatment for a result past its
 * 7-day window.
 *
 * That version left the blurred charts sitting in normal page flow with a
 * small card below them — easy to miss, and it read as a secondary notice
 * rather than the reason the page looks the way it does. This is the same
 * full-screen dark treatment as ContactoPopup ("¿Necesitas ayuda?"): it's the
 * one thing on screen, with a single action, because there's nothing else to
 * do here — the numbers underneath aren't coming back without talking to us.
 * No close button: unlike ContactoPopup this isn't an interruption of
 * content the reader can still get to, it *is* the content now.
 */
export default function ExpiradoModal({ mensajeWhatsApp }: ExpiradoModalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expirado-titulo"
        className="ds-animate-up relative w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-ink p-7 text-center shadow-[0_28px_64px_rgba(0,0,0,0.45)] sm:p-10"
      >
        <div
          aria-hidden
          className="ds-float pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(200,134,10,.28) 0%, rgba(200,134,10,.06) 45%, transparent 72%)',
          }}
        />

        <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber/15 text-amber ring-1 ring-amber/30">
          <Lock className="h-8 w-8" />
        </span>

        <h2
          id="expirado-titulo"
          className="relative mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"
        >
          Tu diagnóstico expiró
        </h2>

        <p className="relative mx-auto mt-3 max-w-sm text-lg text-dust">
          Pasaron más de 7 días, así que este resultado ya no se puede ver. Escríbenos
          y seguimos el proceso contigo directamente.
        </p>

        <a
          href={buildWhatsAppUrl(mensajeWhatsApp)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent('cta_experto_click', { canal: 'whatsapp', origen: 'resultado_expirado' })
          }
          className="ds-shine ds-pulse relative mt-7 inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-amber px-8 py-5 font-display text-lg font-extrabold tracking-tight text-white transition-transform duration-200 ease-[var(--ease-brand)] hover:scale-[1.03] hover:bg-amber-dim active:scale-100 sm:text-xl"
        >
          <WhatsApp className="h-6 w-6 shrink-0" />
          Escribirnos por WhatsApp
        </a>

        <p className="relative mt-4 text-sm text-stone">
          Te respondemos en el mismo chat. No cuesta nada escribir.
        </p>
      </div>
    </div>,
    document.body
  );
}
