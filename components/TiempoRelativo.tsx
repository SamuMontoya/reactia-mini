'use client';
import { useEffect, useState } from 'react';
import { formatHace } from '@/lib/format';

/**
 * Relative time, computed on the client only.
 *
 * Both halves of this are unsafe to render on the server: "hace 3 horas" is
 * measured against *now*, so the server's value is already stale by the time
 * the client hydrates, and the tooltip's `toLocaleString` resolves in the
 * SERVER's timezone — guaranteed to differ from the reader's. Either one
 * produces a React hydration mismatch (it was throwing one before this).
 *
 * Rendering the ISO date on the first pass and swapping to the relative form
 * after mount keeps the markup identical on both sides. `<time dateTime>`
 * means the machine-readable value is correct throughout regardless.
 */
export default function TiempoRelativo({ iso }: { iso: string }) {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    setTexto(formatHace(iso));
  }, [iso]);

  return (
    <time
      dateTime={iso}
      className="text-sm text-stone/80"
      title={texto ? new Date(iso).toLocaleString('es-CO') : undefined}
    >
      {texto ?? iso.slice(0, 10)}
    </time>
  );
}
