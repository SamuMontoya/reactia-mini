'use client';
import { useEffect, useState } from 'react';
import { ChevronDown } from '@/components/icons';

/** Below this much overflow, the page doesn't count as "worth a hint" — a
 *  few stray pixels of overscroll shouldn't trigger it. */
const MIN_OVERFLOW_PX = 120;
/** Close enough to the end that there's nothing meaningful left to reveal. */
const NEAR_BOTTOM_PX = 24;

/**
 * Subtle "you can scroll" cue for mobile only (`sm:hidden`): a bottom fade
 * plus a small bouncing chevron, pinned to the viewport. Desktop already
 * telegraphs scrollability well enough (visible scrollbar, taller viewport)
 * that this would just be noise there.
 *
 * Visible whenever there's more content below — not a one-time "discovery"
 * hint that dismisses itself on the first scroll. Pausing partway down a long
 * page (the diagnóstico review screen's cards, in particular) should keep
 * telling the reader there's more, not go quiet the moment they nudge the
 * page at all; it reappears the instant they're not near the bottom, and
 * disappears once they actually reach it.
 *
 * Mounted once in the funnel's shared layout rather than per-page: it detects
 * scrollability itself (`document.documentElement`, so it works whether the
 * page or an inner container is what actually grows), so a short screen with
 * nothing below the fold simply never renders it. A page with its own sticky
 * bottom bar (the diagnóstico wizard's nav) can reserve space for it by
 * setting the `--scroll-hint-offset` CSS custom property on `<html>` to that
 * bar's height, so the fade/chevron land just above it instead of fixed to
 * the literal viewport edge, behind the nav buttons.
 *
 * Hides as soon as the page's own `<footer>` starts to show, not only once
 * the raw scroll math says "near the bottom". The footer's dark, distinct
 * design already reads as "you've reached the end" on its own — a reader
 * takes that as the answer to "is there more?" the instant its top edge
 * appears, so waiting for it to scroll fully into view left the fade/chevron
 * floating awkwardly over it for the last stretch of most pages.
 */
export default function ScrollHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const doc = document.documentElement;
    let frame = 0;

    const check = () => {
      const overflow = doc.scrollHeight - doc.clientHeight;
      const distanceFromBottom = overflow - window.scrollY;
      const footerShowing =
        (document.querySelector('footer')?.getBoundingClientRect().top ?? Infinity) <
        window.innerHeight;
      setVisible(
        overflow > MIN_OVERFLOW_PX &&
          distanceFromBottom > NEAR_BOTTOM_PX &&
          !footerShowing
      );
    };

    // document.documentElement's own box never resizes just because its
    // content grows past it — that IS what "overflow" means — so a plain
    // ResizeObserver on it only ever catches a real viewport resize, never a
    // step in the diagnóstico wizard swapping in taller content via
    // client-side state. A MutationObserver on the subtree is what actually
    // notices that. Both, plus scroll and resize, are batched through rAF so
    // a burst of events (an animation, several fields re-rendering) triggers
    // one recheck, not one per event/mutation record.
    const scheduleCheck = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener('resize', scheduleCheck);
    window.addEventListener('scroll', scheduleCheck, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleCheck);
    resizeObserver.observe(doc);

    const mutationObserver = new MutationObserver(scheduleCheck);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', scheduleCheck);
      window.removeEventListener('scroll', scheduleCheck);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Fade first, chevron on top of it (higher z-index) — the gradient is
          the "there's more below" tell that stays legible even for someone
          who doesn't register the bouncing icon; the chevron adds motion on
          top of that same cue rather than replacing it. */}
      <div
        aria-hidden
        className="ds-scroll-hint-fade pointer-events-none fixed inset-x-0 z-30 h-24 bg-gradient-to-t from-paper to-transparent sm:hidden"
      />
      <div
        aria-hidden
        className="ds-scroll-hint-chevron pointer-events-none fixed inset-x-0 z-40 flex justify-center sm:hidden"
      >
        <span className="ds-scroll-hint flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-amber shadow-[var(--shadow-md)]">
          <ChevronDown className="h-5 w-5" />
        </span>
      </div>
    </>
  );
}
