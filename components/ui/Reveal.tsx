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
    <div
      ref={ref}
      className={`ds-reveal ${inView ? 'ds-reveal-in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
