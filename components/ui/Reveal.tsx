'use client';
import { useInView } from '@/lib/hooks/useInView';

type RevealProps = {
  children: React.ReactNode;
  /** Stagger, in ms, so a row of cards arrives in sequence rather than at once. */
  delay?: number;
  /** Passed through — this element is the grid/flex item, so spans go here. */
  className?: string;
};

/**
 * Rises its children into place the first time they scroll into view.
 *
 * The transition lives in globals.css (`.ds-reveal`), which is also where
 * prefers-reduced-motion switches it off — so this component doesn't need to
 * know about that.
 */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const { ref, inView } = useInView();

  return (
    // `min-w-0`: this wrapper is almost always the direct child of a grid or
    // flex container, and such an item defaults to `min-width: auto` — it
    // refuses to shrink below its own min-content. Any `truncate` inside sets
    // `white-space: nowrap`, which makes that min-content the full
    // untruncated string, so the item stayed wider than its column and pushed
    // the page into horizontal scroll (the diagnóstico cards did exactly this
    // at 320px). Outside flex/grid `min-width: auto` already resolves to 0,
    // so this changes nothing anywhere else.
    <div
      ref={ref}
      className={`ds-reveal min-w-0 ${inView ? 'ds-reveal-in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
