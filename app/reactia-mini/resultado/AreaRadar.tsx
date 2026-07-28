'use client';
import type { ScoringResult } from '@/lib/schemas';
import { AREA_LABELS, AREA_LABELS_CORTOS } from '@/content/diagnostico-config';
import { useInView } from '@/lib/hooks/useInView';
import { AREA_ORDER, type Area } from './scoreScale';

type AreaRadarProps = {
  scores: ScoringResult['scores'];
  cuelloBotella: Area;
};

// The viewBox is wider than it is tall on purpose: the axis labels sit outside
// the hexagon, and the horizontal ones need room that a square box doesn't have
// — that is what was clipping "Números" and "Procesos" at the edges.
const VIEW_W = 300;
const VIEW_H = 260;
const CX = VIEW_W / 2;
const CY = 126;
const MAX_R = 78;
const LABEL_R = MAX_R + 24;
const RINGS = [25, 50, 75, 100];

/** Six axes, first one straight up. */
const angleFor = (index: number) => (-90 + index * 60) * (Math.PI / 180);

const pointAt = (index: number, radius: number) => {
  const angle = angleFor(index);
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
};

const polygon = (radiusFor: (index: number) => number) =>
  AREA_ORDER.map((_, index) => {
    const { x, y } = pointAt(index, radiusFor(index));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

const anchorFor = (index: number): 'start' | 'middle' | 'end' => {
  const { x } = pointAt(index, LABEL_R);
  if (Math.abs(x - CX) < 2) return 'middle';
  return x > CX ? 'start' : 'end';
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

  const { ref, inView } = useInView<SVGSVGElement>();

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
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
            x1={CX}
            y1={CY}
            x2={end.x}
            y2={end.y}
            stroke="var(--color-dust)"
            strokeWidth="0.75"
            opacity="0.6"
          />
        );
      })}

      {/* The score shape. Grows out of the centre when the chart scrolls into
          view — the silhouette is the whole point of a radar, so it should be
          seen forming rather than arriving pre-drawn. transform-box/origin keep
          the scale anchored to the hexagon's centre, not the SVG's. */}
      <polygon
        points={polygon((index) => (MAX_R * (scores[AREA_ORDER[index]] ?? 0)) / 100)}
        fill="var(--color-amber)"
        fillOpacity="0.16"
        stroke="var(--color-amber)"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{
          transform: inView ? 'scale(1)' : 'scale(0.04)',
          opacity: inView ? 1 : 0,
          transformOrigin: `${CX}px ${CY}px`,
          transition:
            'transform 1s var(--ease-brand), opacity 0.4s var(--ease-brand)',
        }}
      />

      {/* Vertices, with the bottleneck emphasised. They pop in after the shape
          has finished growing, so they read as landing on it. */}
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
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'scale(1)' : 'scale(0)',
              transformOrigin: `${x}px ${y}px`,
              transition: `opacity 0.3s var(--ease-brand) ${700 + index * 70}ms, transform 0.4s var(--ease-brand) ${700 + index * 70}ms`,
            }}
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
              {AREA_LABELS_CORTOS[area]}
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
