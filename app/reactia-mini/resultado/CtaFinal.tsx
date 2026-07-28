'use client';
import { AREA_LABELS } from '@/content/diagnostico-config';
import { buildWhatsAppUrl } from '@/config';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useInView } from '@/lib/hooks/useInView';
import { useLead } from '@/lib/hooks/useLead';
import { WhatsApp } from '@/components/icons';
import { buildMensajeDiagnostico } from './mensajeWhatsApp';
import type { Area } from './scoreScale';

type CtaFinalProps = {
  cuelloBotella: Area;
  score: number;
  resultadoId: string;
};

/**
 * Closing call to action.
 *
 * The whole free diagnóstico exists to find people who need help, so the page
 * cannot end on a statistic. This is the one place that breaks the paper
 * background: full-bleed ink, which is the brand's own treatment for its "voice"
 * sections, so it reads as a deliberate change of register rather than a banner
 * bolted on.
 *
 * The dark panel wipes upward over the page as it scrolls into view, then the
 * heading, button and reasons arrive in sequence. The button keeps pulsing after
 * that — it is the only animated element left once the entrance finishes, which
 * is what makes the eye settle on it.
 */
export default function CtaFinal({ cuelloBotella, score, resultadoId }: CtaFinalProps) {
  const lead = useLead();
  // Shares useInView so this section inherits the same "never leave content
  // invisible" fallback as the rest of the page. Its own observer had no such
  // guard, so in a background tab the heading and button stayed at opacity 0.
  const { ref, inView: shown } = useInView<HTMLElement>('0px 0px -15% 0px');

  const mensaje = buildMensajeDiagnostico({ lead, cuelloBotella, score, resultadoId });
  const step = (index: number) => ({ transitionDelay: `${260 + index * 110}ms` });

  return (
    <section ref={ref} className="relative mt-4 overflow-hidden">
      {/* The ink surface, wiping up over the paper. Separate from the content so
          the background animates while the text does its own thing. */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-ink ${shown ? 'ds-wipe ds-wipe-in' : 'ds-wipe'}`}
      />

      {/* Amber halo, drifting. The brand's only soft-light element. */}
      <div
        aria-hidden
        className="ds-float pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(200,134,10,.20) 0%, rgba(200,134,10,.06) 42%, transparent 70%)',
        }}
      />

      <div className="ds-container relative py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className={`ds-reveal ${shown ? 'ds-reveal-in' : ''} ds-eyebrow`}
            style={{ transitionDelay: '200ms' }}
          >
            Aquí es donde entramos nosotros
          </p>

          <h2
            className={`ds-reveal ${shown ? 'ds-reveal-in' : ''} mt-5 font-display text-display font-extrabold leading-[1.02] tracking-tight text-white`}
            style={step(0)}
          >
            ¿Necesitas ayuda?
          </h2>

          <p
            className={`ds-reveal ${shown ? 'ds-reveal-in' : ''} mx-auto mt-5 max-w-xl text-lg text-dust`}
            style={step(1)}
          >
            Tu freno principal es{' '}
            <span className="font-semibold text-amber">
              {AREA_LABELS[cuelloBotella]}
            </span>
            . No tienes que resolverlo solo.
          </p>

          <div
            className={`ds-reveal ${shown ? 'ds-reveal-in' : ''} mt-10`}
            style={step(2)}
          >
            <a
              href={buildWhatsAppUrl(mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('cta_experto_click', { canal: 'whatsapp', origen: 'cta_final' })
              }
              className="ds-shine ds-pulse relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-amber px-9 py-6 font-display text-xl font-extrabold tracking-tight text-white transition-transform duration-200 ease-[var(--ease-brand)] hover:scale-[1.03] hover:bg-amber-dim active:scale-100 sm:w-auto sm:px-14 sm:text-2xl"
            >
              <WhatsApp className="h-7 w-7 shrink-0" />
              Hablemos por WhatsApp
            </a>

            <p className="mt-4 text-base text-stone">
              Te respondemos en el mismo chat. La primera conversación no cuesta nada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
