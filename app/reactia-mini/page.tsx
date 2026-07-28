'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { landingCopy } from '@/content/landing-copy';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { ArrowRight, Check, Clock } from '@/components/icons';

export default function ReactiaMiniLandingPage() {
  useEffect(() => {
    trackEvent('landing_view');
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* ══ HERO — full-bleed ink ══
          Dark here doesn't clash because it isn't a one-off: generando, the
          result page's closing CTA and the footer are all ink already, so the
          funnel now reads ink → paper → ink, which is the brand's own alternation
          rule. Full-bleed rather than a dark card, matching how every other ink
          surface in the product behaves. */}
      <section className="relative overflow-hidden bg-ink">
        {/* Technical grid, masked so it dissolves outward instead of ending on a
            hard edge. Drawn in dust at low opacity — the futuristic read comes
            from the structure, not from adding a colour the brand doesn't have. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--color-dust) 1px, transparent 1px), linear-gradient(to bottom, var(--color-dust) 1px, transparent 1px)',
            backgroundSize: '54px 54px',
            maskImage:
              'radial-gradient(ellipse 85% 75% at 50% 35%, #000 30%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 85% 75% at 50% 35%, #000 30%, transparent 78%)',
          }}
        />

        {/* Drifting amber halo, the brand's only soft-light element. */}
        <div
          aria-hidden
          className="ds-float pointer-events-none absolute left-1/2 top-[-10rem] h-[34rem] w-[34rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(200,134,10,.20) 0%, rgba(200,134,10,.05) 45%, transparent 72%)',
          }}
        />

        <div className="ds-container relative py-12 lg:py-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* ── Left: the promise ── */}
            <div className="text-center lg:text-left">
              <p className="ds-eyebrow ds-animate-up">{landingCopy.eyebrow}</p>

              <h1
                className="ds-animate-up mt-5 font-display text-display font-semibold text-white lg:text-5xl"
                style={{ animationDelay: '0.08s' }}
              >
                {landingCopy.headline.antes}
                <span className="text-amber">{landingCopy.headline.enfasis}</span>
                {landingCopy.headline.despues}
              </h1>

              <p
                className="ds-animate-up mx-auto mt-5 max-w-xl text-lg text-dust lg:mx-0 lg:text-xl"
                style={{ animationDelay: '0.16s' }}
              >
                {landingCopy.subheadline}
              </p>

              {/* Dark counterpart of .ds-wash: same idea (a panel, an amber rule
                  down its side, squared on the left) inverted for ink. The amber
                  wash itself would have burned as a bright block here. */}
              <ul
                className="ds-animate-up mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-r-[var(--radius-btn)] border border-white/10 border-l-2 border-l-amber bg-white/[0.05] py-2.5 pl-4 pr-5 text-sm text-dust lg:justify-start"
                style={{ animationDelay: '0.24s' }}
              >
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

            {/* ── Right: the offer ── */}
            <div
              className="ds-animate-up mt-10 flex flex-col items-center gap-5 lg:mt-0 lg:items-end"
              style={{ animationDelay: '0.32s' }}
            >
              {/* GRATIS, lit. The blurred duplicate underneath is the glow — a
                  real second copy rather than a text-shadow, because a shadow
                  can't bloom this wide without turning muddy. */}
              {/* inline-block, not a full-width block: the wrapper has to shrink
                  to the width of the word so the column's items-end can flush it
                  against the button's right edge. As a w-full block it spanned the
                  whole column and centred the text inside, leaving it short of
                  that edge. It also keeps the glow's inset-0 exactly on the text. */}
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-0 select-none font-display text-[clamp(3rem,22vw,5.1rem)] font-extrabold uppercase tracking-tight text-amber opacity-70 blur-2xl"
                >
                  {landingCopy.gratis.palabra}
                </span>
                <span className="relative font-display text-[clamp(3rem,22vw,5.1rem)] font-extrabold uppercase tracking-tight text-white">
                  {landingCopy.gratis.palabra}
                </span>
              </span>

              <Link
                href="/reactia-mini/gatekeeping"
                onClick={() => trackEvent('cta_iniciar_click')}
                // Same treatment as the closing CTA on the result page: pulse
                // ring plus the light sweep. `relative overflow-hidden` is
                // required by ds-shine — its sweep is an ::after that has to be
                // clipped to the button.
                className="ds-btn ds-btn-amber ds-btn-lg ds-shine ds-pulse relative w-full overflow-hidden lg:w-auto"
              >
                {landingCopy.cta}
                <ArrowRight className="h-5 w-5" />
              </Link>

              <p className="text-center text-sm text-stone lg:text-right">
                {landingCopy.gratis.apoyo}
              </p>
            </div>
          </div>
        </div>

        {/* Amber hairline closing the hero — the seam between ink and paper. */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber/50 to-transparent"
        />
      </section>

      {/* ══ Cómo funciona — centered, modern cards ══ */}
      <section
        className="ds-container ds-animate-up py-10 lg:py-16"
        style={{ animationDelay: '0.4s' }}
        aria-label="Cómo funciona"
      >
        <div className="mx-auto max-w-[72rem]">
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Pasos del diagnóstico"
          >
            {landingCopy.howItWorks.map((step, index) => (
              <article
                key={step.titulo}
                className="group relative ds-reveal overflow-hidden rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-sm)] transition-all duration-500 ease-[var(--ease-brand)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                style={{ transitionDelay: `${0.24 + index * 0.08}s` }}
              >
                {/* Amber top accent line — brand's signature */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Amber wash background glow — subtle brand warmth */}
                <span
                  aria-hidden
                  className="ds-float pointer-events-none absolute inset-0 bg-gradient-to-br from-amber/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    borderRadius: 'inherit',
                    animationDelay: `${index * 1.5}s`,
                  }}
                />

                {/* Ghost number — brand's "ghost number" motif, now with amber tint on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-4 select-none font-display text-7xl font-extrabold leading-none text-dust/20 group-hover:text-amber/30 transition-colors duration-500"
                >
                  {index + 1}
                </span>

                {/* Step badge with amber accent */}
                <span className="ds-label relative inline-block px-3 py-1 rounded-full bg-amber/10 text-amber font-semibold">
                  Paso {index + 1}
                </span>

                {/* Icon container with amber halo effect */}
                <div className="relative mt-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-dust transition-all duration-300 group-hover:border-amber/50 group-hover:shadow-[0_0_0_4px_rgba(200,134,10,0.15)]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-amber/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {step.icon && (
                    <span className="relative text-2xl text-ink group-hover:text-amber transition-colors duration-300">
                      {step.icon}
                    </span>
                  )}
                </div>

                <h3 className="relative mt-4 font-display text-xl font-bold text-ink group-hover:text-amber transition-colors duration-300">
                  {step.titulo}
                </h3>
                <p className="relative mt-2 text-sm text-stone leading-relaxed">
                  {step.descripcion}
                </p>

                {/* Subtle bottom accent on hover */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}