'use client';
import { useEffect, useState } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { scoreVeredicto } from './scoreScale';

type ScoreGaugeProps = {
  score: number;
};

const DURACION_MS = 1100;

/**
 * Overall score as a 270° arc that fills to its value when it scrolls into view.
 *
 * An open arc rather than a closed ring: the gap at the bottom reads as a dial
 * with room left to travel, which is the honest framing — this is a starting
 * position, not a final grade.
 *
 * The number counts up alongside the arc. This is the payoff moment of the whole
 * free diagnóstico, and a figure that is simply already there reads as a static
 * label; one that arrives reads as something that was calculated. The count uses
 * requestAnimationFrame with an ease-out so it decelerates into the final value
 * instead of stopping dead.
 *
 * The readout is HTML layered over the SVG, not <svg><text>: Tailwind's font
 * utilities don't set font-family on SVG text nodes, and the brand face was
 * being lost.
 */
export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const target = Math.max(0, Math.min(100, Math.round(score)));
  const { ref, inView } = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;

    // Respect the OS setting: land on the value without animating.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(target);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / DURACION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    // requestAnimationFrame is paused in a background tab, which would leave the
    // headline figure frozen at 0 — not just unanimated, but showing a number
    // that isn't the score. setTimeout still fires (throttled) when hidden, so
    // it guarantees the real value lands whatever the tab is doing.
    const floor = setTimeout(() => setShown(target), DURACION_MS + 200);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(floor);
    };
  }, [inView, target]);

  // Amber, not a red/amber/green signal colour. This is the headline figure and
  // the brand allows exactly one accent; the traffic-light scale still runs on
  // the per-area bars, where comparing areas is the actual job.
  const color = 'var(--color-amber)';

  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  // 270 of 360 degrees are drawn; the other 90 sit at the bottom as the gap.
  const arcLength = circumference * 0.75;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-[13rem]">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full"
          role="img"
          aria-label={`Puntaje general: ${target} de 100`}
        >
          {/* Rotated so the gap is centred at the bottom. */}
          <g transform="rotate(135 100 100)">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="var(--color-dust)"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${(arcLength * shown) / 100} ${circumference}`}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-6xl font-extrabold leading-none tracking-tight tabular-nums"
            style={{ color }}
          >
            {shown}
          </span>
          <span className="mt-1 text-sm text-stone">de 100</span>
        </div>
      </div>

      {/* Held back until the count has almost landed, so the verdict reads as a
          conclusion drawn from the number rather than a caption printed with it. */}
      <p
        className={`mt-3 text-center font-display text-lg font-bold ${
          inView ? 'ds-fade-in' : 'opacity-0'
        }`}
        style={{ color, animationDelay: '850ms' }}
      >
        {scoreVeredicto(target)}
      </p>
    </div>
  );
}
