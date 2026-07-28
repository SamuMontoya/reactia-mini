import { AREA_LABELS } from '@/content/diagnostico-config';
import { reactiaMeses } from '@/config/reactia-meses';
import { AREA_ICONS, Compass } from '@/components/icons';
import type { Area } from './scoreScale';

type BottleneckCardProps = {
  cuelloBotella: Area;
  proximoPaso: string;
  score: number;
};

/**
 * The single most important thing on the page: what is holding the business back
 * and what to do about it. Given the largest cell in the grid on purpose.
 */
export default function BottleneckCard({
  cuelloBotella,
  proximoPaso,
  score,
}: BottleneckCardProps) {
  const Icon = AREA_ICONS[cuelloBotella];

  return (
    <div className="flex h-full flex-col">
      <p className="ds-eyebrow">Tu freno principal</p>

      <div className="mt-4 flex items-start gap-4">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-signal-low/10 text-signal-low"
        >
          <Icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-bold leading-tight text-ink">
            {AREA_LABELS[cuelloBotella]}
          </h2>
          <p className="mt-1 text-base text-stone">
            Es tu puntaje más bajo:{' '}
            <span className="font-semibold text-signal-low tabular-nums">
              {Math.round(score)} de 100
            </span>
          </p>
        </div>
      </div>

      <div className="ds-rule-amber mt-6">
        <p className="ds-label">Qué hacer ahora</p>
        <p className="mt-1.5 text-lg text-ink">{proximoPaso}</p>
      </div>

      <p className="mt-auto flex items-start gap-2.5 border-t border-dust pt-5 text-base text-stone">
        <Compass className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
        {reactiaMeses[cuelloBotella]}
      </p>
    </div>
  );
}
