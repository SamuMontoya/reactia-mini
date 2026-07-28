import { scoreColor, scoreVeredicto } from './scoreScale';

type ScoreGaugeProps = {
  score: number;
};

/**
 * Overall score as a 270° arc.
 *
 * An open arc rather than a closed ring: the gap at the bottom reads as a dial
 * with room left to travel, which is the honest framing — this is a starting
 * position, not a final grade.
 */
export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const color = scoreColor(clamped);

  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  // 270 of 360 degrees are drawn; the other 90 sit at the bottom as the gap.
  const arcLength = circumference * 0.75;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[15rem]">
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full"
        role="img"
        aria-label={`Puntaje general: ${clamped} de 100`}
      >
        {/* Rotated so the gap is centred at the bottom. */}
        <g transform="rotate(135 100 100)">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--color-dust)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(arcLength * clamped) / 100} ${circumference}`}
          />
        </g>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-6xl font-extrabold leading-none tabular-nums"
          style={{ color }}
        >
          {clamped}
        </span>
        <span className="mt-1 text-sm text-stone">de 100</span>
        <span className="mt-2 font-display text-base font-bold" style={{ color }}>
          {scoreVeredicto(clamped)}
        </span>
      </div>
    </div>
  );
}
