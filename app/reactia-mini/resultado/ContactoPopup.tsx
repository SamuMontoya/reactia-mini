'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AREA_LABELS } from '@/content/diagnostico-config';
import { buildWhatsAppUrl, isWhatsAppConfigured } from '@/config';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useLead } from '@/lib/hooks/useLead';
import { Close, WhatsApp } from '@/components/icons';
import { buildMensajeDiagnostico } from './mensajeWhatsApp';
import type { Area } from './scoreScale';

type ContactoPopupProps = {
  cuelloBotella: Area;
  score: number;
  resultadoId: string;
};

/** Fixed wait after the result page opens, not after any scroll gesture. */
const DELAY_MS = 30_000;

const vistoKey = (resultadoId: string) => `reactia_contacto_visto:${resultadoId}`;

/**
 * Invitation to talk, shown once per visit to this result.
 *
 * Fires on a plain 30-second timer from the moment the page opens — no
 * longer gated on scrolling to the bottom first, so it shows up on every
 * visit rather than only for readers who scroll all the way down.
 *
 * "Per visit", not "ever": tracked in sessionStorage, not localStorage, so
 * closing the tab/browser and coming back to the same result later shows it
 * again — only re-opening or reloading *within* the same session is
 * suppressed. Still never shown when no WhatsApp number is configured, so it
 * can't offer a dead link.
 */
export default function ContactoPopup({
  cuelloBotella,
  score,
  resultadoId,
}: ContactoPopupProps) {
  const lead = useLead();
  const [visible, setVisible] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const yaVisto = useCallback(() => {
    try {
      return sessionStorage.getItem(vistoKey(resultadoId)) === '1';
    } catch {
      return false;
    }
  }, [resultadoId]);

  const marcarVisto = useCallback(() => {
    try {
      sessionStorage.setItem(vistoKey(resultadoId), '1');
    } catch {
      // sessionStorage no disponible: se mostrará de nuevo, no es grave.
    }
  }, [resultadoId]);

  /* ── Wait a fixed 30s from mount, then show once ── */
  useEffect(() => {
    if (!isWhatsAppConfigured() || yaVisto()) return;

    const timer = setTimeout(() => {
      if (yaVisto()) return;
      setVisible(true);
      marcarVisto();
      trackEvent('contacto_popup_view');
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [yaVisto, marcarVisto]);

  const cerrar = useCallback((motivo: string) => {
    setVisible(false);
    trackEvent('contacto_popup_close', { motivo });
    previouslyFocused.current?.focus();
  }, []);

  /* ── Modal behaviour: focus in, Escape out, focus restored ── */
  useEffect(() => {
    if (!visible) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cerrar('escape');
        return;
      }

      // Keep Tab inside the dialog while it is open.
      if (event.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, cerrar]);

  if (!visible) return null;

  const mensaje = buildMensajeDiagnostico({ lead, cuelloBotella, score, resultadoId });

  return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          aria-label="Cerrar"
          tabIndex={-1}
          onClick={() => cerrar('backdrop')}
          className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
        />

        {/* Bigger than the old modal (max-w-lg, more padding) and dark rather
            than a paper-tinted card — the same register the closing CTA and
            "generando" use for their big moments, so this reads as the funnel's
            other high-stakes screen rather than a small dismissible toast. */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contacto-popup-titulo"
          className="ds-animate-up relative w-full max-w-lg overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-ink p-7 text-center shadow-[0_28px_64px_rgba(0,0,0,0.45)] sm:p-10"
        >
          {/* Drifting amber halo, same treatment as CtaFinal/generando. */}
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
            onClick={() => cerrar('boton_x')}
            aria-label="Cerrar"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-dust transition-colors hover:bg-white/10 hover:text-white"
          >
            <Close className="h-5 w-5" />
          </button>

          {/* Big WhatsApp badge — an icon this size is what makes the modal
              read as "grande y atractivo" rather than a resized version of the
              old card; everything below is built around it. */}
          <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber/15 text-amber ring-1 ring-amber/30">
            <WhatsApp className="h-10 w-10" />
          </span>

          <p className="relative mt-5 text-xs font-medium uppercase tracking-[0.2em] text-amber">
            Ya viste tu diagnóstico
          </p>

          <h2
            id="contacto-popup-titulo"
            className="relative mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"
          >
            ¿Quieres que te ayudemos con{' '}
            <span className="text-amber">{AREA_LABELS[cuelloBotella]}</span>?
          </h2>

          <p className="relative mx-auto mt-3 max-w-sm text-lg text-dust">
            Escríbenos por WhatsApp. Ya tenemos tu diagnóstico a mano, así que no vas a
            tener que repetir nada.
          </p>

          {/* One action only. A "no thanks" button gives the reflex-dismisser a
              target and adds nothing — the X and the backdrop already close it.
              Same shiny, pulsing treatment as the closing CTA and the landing's
              hero button: rounded-full, ds-shine's light sweep, ds-pulse's
              expanding ring — the eye should land here without a second look
              anywhere else on the screen. */}
          <a
            href={buildWhatsAppUrl(mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('cta_experto_click', { canal: 'whatsapp', origen: 'popup' });
              setVisible(false);
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
      </div>
  );
}
