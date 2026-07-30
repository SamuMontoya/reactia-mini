'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsApp } from '@/components/icons';
import { buildWhatsAppUrl } from '@/config';

/**
 * Funnel navbar. Deliberately has no navigation links — every extra link on a
 * lead-gen flow is an exit. It carries identity and one persistent reassurance
 * ("gratis"), nothing else.
 */
export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/reactia-mini';

  // Condenses once the page has moved. A sticky bar that never reacts reads as a
  // static image pinned to the top; giving back a few pixels and picking up a
  // hairline shadow is enough to make it feel attached to the page.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      // The hairline is always on: it's the only thing separating the navbar
      // from the paper background, and hiding it at scroll 0 left the header
      // floating on the landing page. Only the shadow reacts to scroll now.
      className={`sticky top-0 z-40 border-b border-dust bg-paper/85 backdrop-blur-md transition-shadow duration-300 ease-[var(--ease-brand)] ${
        scrolled ? 'shadow-[var(--shadow-sm)]' : 'shadow-none'
      }`}
    >
      <div
        className={`ds-container flex items-center justify-between transition-[padding] duration-300 ease-[var(--ease-brand)] ${
          scrolled ? 'py-2' : 'py-3'
        }`}
      >
        <Link
          href="/reactia-mini"
          className="flex items-center gap-3 rounded-[4px]"
          aria-label="Kreanding — inicio"
        >
          <Image
            src="/brand/logo.svg"
            alt=""
            // Intrinsic size kept above the rendered height so Next still
            // serves a sharp asset rather than upscaling a smaller one.
            // Rendered size dialed back from h-9/h-10: at that size the mark
            // read taller than the "Kreanding" wordmark's cap height right
            // next to it, so the pair looked mismatched instead of like one
            // lockup.
            width={38}
            height={40}
            priority
            className="h-7 w-auto sm:h-8"
          />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Kreanding
          </span>
        </Link>

        {!isLanding && (
          <div className="flex items-center gap-4">
            {/* WhatsApp CTA button */}
            <a
              href={buildWhatsAppUrl(
                'Hola Kreanding, quiero saber más sobre Reactia Mini.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 ds-btn ds-btn-amber"
              aria-label="Habla con un experto por WhatsApp"
            >
              <WhatsApp className="h-5 w-5 text-white flex-shrink-0" />
              <span className="hidden sm:inline">Habla con un experto</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
