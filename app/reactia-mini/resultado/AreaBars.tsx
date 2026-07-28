import type { ScoringResult } from '@/lib/schemas';
import { AREA_LABELS } from '@/content/diagnostico-config';
import { AREA_ICONS } from '@/components/icons';
import { AREA_ORDER, scoreColor, type Area } from './scoreScale';

type AreaBarsProps = {
  scores: ScoringResult['scores'];
  cuelloBotella: Area;
};

/**
 * The same six scores as exact numbers, sorted worst-first.
 *
 * The radar shows the shape; this shows the ranking and the precise value. Worst
 * first, because the first row is then the thing to act on.
 */
export default function AreaBars({ scores, cuelloBotella }: AreaBarsProps) {
  const filas = [...AREA_ORDER].sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0));

  return (
    <ul className="space-y-3.5">
      {filas.map((area) => {
        const score = Math.round(scores[area] ?? 0);
        const Icon = AREA_ICONS[area];
        const esCuello = area === cuelloBotella;

        return (
          <li key={area}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 ${
                    esCuello ? 'text-signal-low' : 'text-stone'
                  }`}
                />
                <span
                  className={`truncate text-base ${
                    esCuello ? 'font-semibold text-ink' : 'text-stone'
                  }`}
                >
                  {AREA_LABELS[area]}
                </span>
              </span>
              <span
                className="shrink-0 font-display text-lg font-bold tabular-nums"
                style={{ color: scoreColor(score) }}
              >
                {score}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-dust/50">
              <div
                className="h-full rounded-full"
                style={{ width: `${score}%`, background: scoreColor(score) }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
