import type { ScoringResult } from '@/lib/schemas';
import { AREA_LABELS } from '@/content/diagnostico-config';
import { AREA_ORDER, type Area } from './scoreScale';

type AreaRadarProps = {
  scores: ScoringResult['scores'];
  cuelloBotella: Area;
};

const CENTER = 130;
const MAX_R = 84;
const LABEL_R = MAX_R + 24;
const RINGS = [25, 50, 75, 100];

/** Six axes, first one straight up. */
const angleFor = (index: number) => (-90 + index * 60) * (Math.PI / 180);

const pointAt = (index: number, radius: number) => {
  const angle = angleFor(index);
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
};

const polygon = (radiusFor: (index: number) => number) =>
  AREA_ORDER.map((_, index) => {
    const { x, y } = pointAt(index, radiusFor(index));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

const anchorFor = (index: number): 'start' | 'middle' | 'end' => {
  const { x } = pointAt(index, LABEL_R);
  if (Math.abs(x - CENTER) < 2) return 'middle';
  return x > CENTER ? 'start' : 'end';
};

/**
 * Hexagonal radar of the six areas.
 *
 * Hand-drawn SVG rather than a chart library: six fixed axes need no axis
 * inference, no tooltips and no responsive container, and drawing it directly is
 * the only way to get the brand's hairlines and type onto the chart. It also
 * removed the funnel's heaviest client dependency.
 *
 * The shape is the point — a lopsided hexagon shows the imbalance at a glance in
 * a way six numbers never do, and the bottleneck axis is called out in amber.
 */
export default function AreaRadar({ scores, cuelloBotella }: AreaRadarProps) {
  const descripcion = AREA_ORDER.map(
    (area) => `${AREA_LABELS[area]}: ${Math.round(scores[area] ?? 0)}`
  ).join('. ');

  return (
    <svg
      viewBox="0 0 260 260"
      className="h-full w-full"
      role="img"
      aria-label={`Puntaje por área. ${descripcion}`}
    >
      {/* Reference rings */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygon(() => (MAX_R * ring) / 100)}
          fill="none"
          stroke="var(--color-dust)"
          strokeWidth={ring === 100 ? 1.25 : 0.75}
          opacity={ring === 100 ? 1 : 0.6}
        />
      ))}

      {/* Axes */}
      {AREA_ORDER.map((area, index) => {
        const end = pointAt(index, MAX_R);
        return (
          <line
            key={area}
            x1={CENTER}
            y1={CENTER}
            x2={end.x}
            y2={end.y}
            stroke="var(--color-dust)"
            strokeWidth="0.75"
            opacity="0.6"
          />
        );
      })}

      {/* The score shape */}
      <polygon
        points={polygon((index) => (MAX_R * (scores[AREA_ORDER[index]] ?? 0)) / 100)}
        fill="var(--color-amber)"
        fillOpacity="0.16"
        stroke="var(--color-amber)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Vertices, with the bottleneck emphasised */}
      {AREA_ORDER.map((area, index) => {
        const score = scores[area] ?? 0;
        const { x, y } = pointAt(index, (MAX_R * score) / 100);
        const esCuello = area === cuelloBotella;

        return (
          <circle
            key={area}
            cx={x}
            cy={y}
            r={esCuello ? 5.5 : 3.5}
            fill={esCuello ? 'var(--color-signal-low)' : 'var(--color-amber)'}
            stroke="var(--color-white)"
            strokeWidth="1.5"
          />
        );
      })}

      {/* Labels */}
      {AREA_ORDER.map((area, index) => {
        const { x, y } = pointAt(index, LABEL_R);
        const score = Math.round(scores[area] ?? 0);
        const esCuello = area === cuelloBotella;

        return (
          <g key={area}>
            <text
              x={x}
              y={y}
              textAnchor={anchorFor(index)}
              dominantBaseline="middle"
              className="font-body"
              fontSize="11"
              fontWeight="500"
              fill={esCuello ? 'var(--color-signal-low)' : 'var(--color-stone)'}
            >
              {AREA_LABELS[area]}
            </text>
            <text
              x={x}
              y={y + 13}
              textAnchor={anchorFor(index)}
              dominantBaseline="middle"
              className="font-display"
              fontSize="13"
              fontWeight="700"
              fill={esCuello ? 'var(--color-signal-low)' : 'var(--color-ink)'}
            >
              {score}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
