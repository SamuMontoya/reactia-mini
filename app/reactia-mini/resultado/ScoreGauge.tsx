import React from 'react';

type ScoreGaugeProps = {
  score: number;
};

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (clamped / 100);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#4f46e5"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - arcLength}
          transform="rotate(-90 80 80)"
        />
        <text
          x="80"
          y="80"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-display text-2xl font-bold text-ink"
        >
          {clamped}%
        </text>
      </svg>
      <p className="mt-6 text-center text-sm text-ink">
        vas por buen camino
      </p>
    </div>
  );
}
