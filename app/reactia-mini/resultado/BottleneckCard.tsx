import React from 'react';
import { Clock, Lock } from '@/components/icons';

type BottleneckCardProps = {
  cuelloBotella: string;
  proximoPaso: string;
  score: number;
};

export default function BottleneckCard({
  cuelloBotella,
  proximoPaso,
  score,
}: BottleneckCardProps) {
  const iconColor = '#dc2626'; // deep red
  const iconSize = 16;

  return (
    <div className="flex flex-col items-center p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock
          className="h-12 w-12 text-amber"
          aria-hidden="true"
        />
        <h2 className="font-display text-xl font-semibold text-ink">
          {cuelloBotella}
        </h2>
      </div>
      <p className="text-base text-stone mb-6">
        {proximoPaso}
      </p>
      <div className="flex items-center gap-2">
        <Lock
          className={`h-${iconSize} w-${iconSize} text-${iconColor}`}
          aria-hidden="true"
        />
        <span className="font-display text-2xl font-bold text-ink">
          {score}%
        </span>
      </div>
      <p className="mt-6 text-sm text-stone">
        3 meses
      </p>
    </div>
  );
}
