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
  return (
    <div className="flex flex-col items-center p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock
          className="h-10 w-10 sm:h-12 sm:w-12 text-amber flex-shrink-0"
          aria-hidden="true"
        />
        <h2 className="font-display text-lg sm:text-xl font-semibold text-ink">
          {cuelloBotella}
        </h2>
      </div>
      <p className="text-sm sm:text-base text-stone mb-4 sm:mb-6 text-center">
        {proximoPaso}
      </p>
      <div className="flex items-center gap-2">
        <Lock
          className="h-6 w-6 sm:h-8 sm:w-8 text-ink flex-shrink-0"
          style={{ color: '#dc2626' }}
          aria-hidden="true"
        />
        <span className="font-display text-2xl sm:text-3xl font-bold text-ink">
          {score}%
        </span>
      </div>
      <p className="mt-4 sm:mt-6 text-sm text-stone">
        3 meses
      </p>
    </div>
  );
}
