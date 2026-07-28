'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { landingCopy } from '@/content/landing-copy';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { ArrowRight, Check, Clock } from '@/components/icons';

/**
 * One-screen landing.
 *
 * Everything above the fold on a laptop: promise, GRATIS, three steps, one CTA.
 * The old page had a second and third screenful (a free-vs-paid feature table)
 * that argued with the reader before they had tried anything.
 */
export default function ReactiaMiniLandingPage() {
  useEffect(() => {
    trackEvent('landing_view');
  }, []);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* The brand's amber halo, the only soft-light element in the system. */}
      <div
        className="ds-halo left-1/2 top-[-14rem] h-[38rem] w-[38rem] -translate-x-1/2"
        aria-hidden
      />

      <div className="ds-container relative flex flex-1 flex-col justify-center gap-12 py-12 lg:gap-14 lg:py-10">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-3xl text-center">
          <p className="ds-eyebrow ds-animate-up">{landingCopy.eyebrow}</p>

          <h1
            className="ds-animate-up mt-5 font-display text-display font-semibold text-ink"
            style={{ animationDelay: '0.08s' }}
          >
            {landingCopy.headline.antes}
            <span className="text-amber">{landingCopy.headline.enfasis}</span>
            {landingCopy.headline.despues}
          </h1>

          <p
            className="ds-animate-up mx-auto mt-5 max-w-2xl text-lg text-stone lg:text-xl"
            style={{ animationDelay: '0.16s' }}
          >
            {landingCopy.subheadline}
          </p>

          {/* GRATIS gets the loudest typographic treatment on the page — it is
              the offer, so it is set in display weight at hero scale rather than
              tucked into a small badge. */}
          <div
            className="ds-animate-up mt-8 flex flex-col items-center gap-2"
            style={{ animationDelay: '0.24s' }}
          >
            <span className="font-display text-5xl font-extrabold uppercase tracking-tight text-amber lg:text-6xl">
              {landingCopy.gratis.palabra}
            </span>
            <p className="text-base text-stone">{landingCopy.gratis.apoyo}</p>
          </div>

          <div
            className="ds-animate-up mt-8 flex flex-col items-center gap-4"
            style={{ animationDelay: '0.32s' }}
          >
            <Link
              href="/reactia-mini/gatekeeping"
              onClick={() => trackEvent('cta_iniciar_click')}
              className="ds-btn ds-btn-amber ds-btn-lg w-full sm:w-auto"
            >
              {landingCopy.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-stone">
              {landingCopy.reassurances.map((item, index) => (
                <li key={item} className="flex items-center gap-1.5">
                  {index === 1 ? (
                    <Clock className="h-4 w-4 text-amber" />
                  ) : (
                    <Check className="h-4 w-4 text-amber" />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section
          className="ds-animate-up border-t border-dust pt-10"
          style={{ animationDelay: '0.4s' }}
          aria-labelledby="como-funciona"
        >
          <h2
            id="como-funciona"
            className="text-center font-display text-2xl font-bold text-ink"
          >
            {landingCopy.howItWorksTitulo}
          </h2>

          <ol className="mt-7 grid gap-4 sm:grid-cols-3">
            {landingCopy.howItWorks.map((step, index) => (
              <li key={step.titulo} className="ds-card p-6">
                <span className="ds-label block">Paso {index + 1}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink">
                  {step.titulo}
                </h3>
                <p className="mt-1.5 text-base text-stone">{step.descripcion}</p>
              </li>
            ))}
          </ol>

          <p className="mt-7 text-center text-base text-stone">
            {landingCopy.cierre}{' '}
            <span className="text-ink">{landingCopy.ctaNota}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
