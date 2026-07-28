'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * True once the element has scrolled into view. Latches — it never goes back to
 * false.
 *
 * Every entrance animation in the product needs the same three things: fire when
 * visible, fire once, disconnect afterwards. Content that re-animates each time
 * it scrolls past is the fastest way to make a page feel cheap, so "once" is
 * baked in here rather than left to each caller.
 */
// Constrained to Element, not HTMLElement: the radar chart attaches this to an
// <svg>, which is an SVGSVGElement and not an HTMLElement.
export const useInView = <T extends Element = HTMLDivElement>(
  rootMargin = '0px 0px -12% 0px'
) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (very old browser, some test environments): show
    // the content rather than leaving it invisible forever.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    // Safety net. A browser can have IntersectionObserver and still never
    // deliver a callback — a background tab is the case that matters here, and
    // this result page explicitly tells people to save the link, so it WILL be
    // opened in one. Without this, every revealed element stays at opacity 0 and
    // the page renders blank.
    //
    // The fallback only fires if the observer has produced nothing at all. A
    // callback reporting isIntersecting:false still proves the observer works,
    // so it cancels the timer and the scroll reveal behaves normally for content
    // further down the page.
    let delivered = false;

    const observer = new IntersectionObserver(
      (entries) => {
        delivered = true;
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);

    const fallback = setTimeout(() => {
      if (!delivered) setInView(true);
    }, 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [rootMargin]);

  return { ref, inView };
};
