import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { act, render, fireEvent } from '@testing-library/react';
import ScrollHint from '@/components/ui/ScrollHint';

/** jsdom has no real layout engine, so scrollHeight/clientHeight are 0/0 by
 *  default — every test that wants the hint visible has to fake these. */
function setScrollable(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
}

const originalResizeObserver = global.ResizeObserver;
const originalMutationObserver = global.MutationObserver;

beforeEach(() => {
  // jsdom doesn't implement ResizeObserver/MutationObserver; no-op
  // stand-ins are enough since the component's own mount-time check already
  // covers the initial state, and these tests drive rechecks via `scroll`.
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  global.MutationObserver = class {
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof MutationObserver;
});

afterEach(() => {
  global.ResizeObserver = originalResizeObserver;
  global.MutationObserver = originalMutationObserver;
  setScrollable(0, 0);
  window.scrollY = 0;
  document.querySelector('footer')?.remove();
});

/** Inserts a `<footer>` (the real site footer's tag, per components/Footer.tsx)
 *  whose top edge is `top` px from the top of the viewport, for tests of the
 *  "hide once the footer starts to show" behaviour. */
function setFooterTop(top: number) {
  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.appendChild(footer);
  }
  jest.spyOn(footer, 'getBoundingClientRect').mockReturnValue({
    top,
  } as DOMRect);
}

// The component batches its recheck through requestAnimationFrame (so a
// burst of scroll/resize/mutation events triggers one recompute, not one per
// event) — jsdom's rAF runs on a real timer, so the test has to actually
// wait a frame for that recheck to land instead of assuming `act` flushed it
// synchronously.
const scroll = async (y: number) => {
  await act(async () => {
    window.scrollY = y;
    fireEvent.scroll(window);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
};

describe('ScrollHint', () => {
  it('no muestra nada cuando la página completa cabe en la pantalla', () => {
    setScrollable(600, 600);
    render(<ScrollHint />);
    expect(document.querySelector('.ds-scroll-hint')).not.toBeInTheDocument();
  });

  it('muestra el indicador cuando hay más contenido debajo del pliegue', () => {
    setScrollable(1600, 800);
    render(<ScrollHint />);
    expect(document.querySelector('.ds-scroll-hint')).toBeInTheDocument();
  });

  it('sigue visible tras un scroll parcial que no llega al final', async () => {
    // 800px of overflow — scrolling 100px still leaves 700px to go.
    setScrollable(1600, 800);
    render(<ScrollHint />);
    expect(document.querySelector('.ds-scroll-hint')).toBeInTheDocument();

    await scroll(100);

    expect(document.querySelector('.ds-scroll-hint')).toBeInTheDocument();
  });

  it('se oculta solo al llegar cerca del final, y reaparece si el usuario retrocede', async () => {
    setScrollable(1600, 800); // 800px of overflow
    render(<ScrollHint />);

    await scroll(790); // 10px left — within the "near bottom" threshold
    expect(document.querySelector('.ds-scroll-hint')).not.toBeInTheDocument();

    await scroll(400); // back up, well short of the bottom again
    expect(document.querySelector('.ds-scroll-hint')).toBeInTheDocument();
  });

  it('se oculta en cuanto el footer real del sitio empieza a asomar, aunque el cálculo crudo diga que hay overflow', () => {
    setScrollable(1600, 800); // 800px of overflow by the raw math alone
    setFooterTop(700); // its top edge is already within the 800px-tall viewport

    render(<ScrollHint />);

    expect(document.querySelector('.ds-scroll-hint')).not.toBeInTheDocument();
  });

  it('sigue visible mientras el footer todavía no entra en el viewport', () => {
    setScrollable(1600, 800);
    setFooterTop(2000); // nowhere near the viewport yet

    render(<ScrollHint />);

    expect(document.querySelector('.ds-scroll-hint')).toBeInTheDocument();
  });

  it('el indicador es decorativo y no interfiere con toques debajo de él', () => {
    setScrollable(1600, 800);
    render(<ScrollHint />);
    const wrapper = document.querySelector('.ds-scroll-hint-chevron');
    expect(wrapper).toHaveClass('pointer-events-none');
    expect(wrapper).toHaveAttribute('aria-hidden');
  });
});
