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

/** How long to wait after the reader reaches the bottom before inviting them. */
const DELAY_MS = 30_000;
/** How close to the end counts as "reached it". */
const BOTTOM_MARGIN_PX = 120;

const sessionKey = (resultadoId: string) => `reactia_contacto_visto:${resultadoId}`;

/**
 * Invitation to talk, shown once the reader has actually finished the page.
 *
 * The trigger is deliberate: reaching the bottom means they read it, and the
 * 30-second wait after that means they sat with it rather than bouncing. Firing
 * on a timer alone, or immediately on scroll, would interrupt someone still
 * reading — which is how these end up dismissed on reflex.
 *
 * Shown at most once per result per session (sessionStorage), and never when no
 * WhatsApp number is configured, so it can't offer a dead link.
 */
export default function ContactoPopup({
  cuelloBotella,
  score,
  resultadoId,
}: ContactoPopupProps) {
  const lead = useLead();
  const [visible, setVisible] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const armed = useRef(false);

  const yaVisto = useCallback(() => {
    try {
      return sessionStorage.getItem(sessionKey(resultadoId)) === '1';
    } catch {
      return false;
    }
  }, [resultadoId]);

  const marcarVisto = useCallback(() => {
    try {
      sessionStorage.setItem(sessionKey(resultadoId), '1');
    } catch {
      // sessionStorage no disponible: se mostrará de nuevo, no es grave.
    }
  }, [resultadoId]);

  /* ── Arm when the end of the page comes into view, then wait ── */
  useEffect(() => {
    if (!isWhatsAppConfigured() || yaVisto()) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // An IntersectionObserver on a sentinel at the end of the content, rather
    // than a scroll listener doing the arithmetic. It doesn't care which element
    // actually scrolls, it still fires when the content is short enough that the
    // end is visible without scrolling, and it re-evaluates by itself when the
    // page height changes — none of which a scroll handler gets right for free.
    const observer = new IntersectionObserver(
      (entries) => {
        if (armed.current || !entries.some((entry) => entry.isIntersecting)) return;

        armed.current = true;
        observer.disconnect();
        trackEvent('resultado_fin_alcanzado');

        timer.current = setTimeout(() => {
          if (yaVisto()) return;
          setVisible(true);
          marcarVisto();
          trackEvent('contacto_popup_view');
        }, DELAY_MS);
      },
      { rootMargin: `0px 0px ${BOTTOM_MARGIN_PX}px 0px` }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
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

  // The sentinel is the last thing in the page flow, so it comes into view
  // exactly when the reader reaches the end. It must render whether or not the
  // dialog is open, otherwise there'd be nothing to observe.
  const sentinel = <div ref={sentinelRef} aria-hidden className="h-px w-full" />;

  if (!visible) return sentinel;

  const mensaje = buildMensajeDiagnostico({ lead, cuelloBotella, score, resultadoId });

  return (
    <>
      {sentinel}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={() => cerrar('backdrop')}
        className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contacto-popup-titulo"
        className="ds-animate-up relative w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-dust bg-gradient-to-br from-white via-white to-amber/[0.08] p-6 shadow-[var(--shadow-lg)] sm:p-7"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent"
        />

        <button
          ref={closeRef}
          type="button"
          onClick={() => cerrar('boton_x')}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-stone transition-colors hover:bg-paper-warm hover:text-ink"
        >
          <Close className="h-5 w-5" />
        </button>

        <p className="ds-eyebrow">Ya viste tu diagnóstico</p>

        <h2
          id="contacto-popup-titulo"
          className="mt-3 font-display text-2xl font-bold leading-tight text-ink"
        >
          ¿Quieres que te ayudemos con{' '}
          <span className="text-amber">{AREA_LABELS[cuelloBotella]}</span>?
        </h2>

        <p className="mt-2.5 text-base text-stone">
          Escríbenos por WhatsApp. Ya tenemos tu diagnóstico a mano, así que no vas a
          tener que repetir nada.
        </p>

        {/* One action only. A "no thanks" button gives the reflex-dismisser a
            target and adds nothing — the X and the backdrop already close it. */}
        <a
          href={buildWhatsAppUrl(mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackEvent('cta_experto_click', { canal: 'whatsapp', origen: 'popup' });
            setVisible(false);
          }}
          className="ds-btn ds-btn-amber ds-btn-lg mt-6 w-full"
        >
          <WhatsApp className="h-5 w-5" />
          Escribirnos por WhatsApp
        </a>
        </div>
      </div>
    </>
  );
}
