'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { buildWhatsAppUrl } from '@/config';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Close, Lock, WhatsApp } from '@/components/icons';

type LimiteDiagnosticosModalProps = {
  onClose: () => void;
};

const MENSAJE_WHATSAPP =
  'Hola, ya usé mis 3 diagnósticos gratuitos en Reactia y quiero hablar con un experto.';

/**
 * Shown instead of navigating to gatekeeping once a device has used up its
 * free diagnósticos. Same dark full-screen treatment as ContactoPopup and
 * ExpiradoModal, but dismissible (unlike ExpiradoModal): the landing page
 * underneath is still a valid place to be, this is just telling the reader
 * why the button they tapped didn't go anywhere.
 */
export default function LimiteDiagnosticosModal({
  onClose,
}: LimiteDiagnosticosModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="limite-diagnosticos-titulo"
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

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-dust transition-colors hover:bg-white/10 hover:text-white"
        >
          <Close className="h-5 w-5" />
        </button>

        <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber/15 text-amber ring-1 ring-amber/30">
          <Lock className="h-10 w-10" />
        </span>

        <p className="relative mt-5 text-xs font-medium uppercase tracking-[0.2em] text-amber">
          Ya usaste tus diagnósticos gratuitos
        </p>

        <h2
          id="limite-diagnosticos-titulo"
          className="relative mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"
        >
          No puedes hacer más diagnósticos gratuitos
        </h2>

        <p className="relative mx-auto mt-3 max-w-sm text-lg text-dust">
          Ya completaste el máximo de diagnósticos gratuitos. Escríbenos por WhatsApp y
          seguimos contigo directamente.
        </p>

        <a
          href={buildWhatsAppUrl(MENSAJE_WHATSAPP)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackEvent('cta_experto_click', { canal: 'whatsapp', origen: 'limite_diagnosticos' });
            onClose();
          }}
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
