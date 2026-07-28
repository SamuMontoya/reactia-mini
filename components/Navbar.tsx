import Image from 'next/image';
import Link from 'next/link';
import { WhatsApp } from '@/components/icons';

/**
 * Funnel navbar. Deliberately has no navigation links — every extra link on a
 * lead-gen flow is an exit. It carries identity and one persistent reassurance
 * ("gratis"), nothing else.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-dust bg-paper/85 backdrop-blur-md">
      <div className="ds-container flex items-center justify-between py-4">
        <Link
          href="/reactia-mini"
          className="flex items-center gap-3 rounded-[4px]"
          aria-label="Kreanding — inicio"
        >
          <Image
            src="/brand/logo.svg"
            alt=""
            width={28}
            height={30}
            priority
            className="h-7 w-auto"
          />
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Kreanding
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <p className="ds-label hidden sm:block">Escáner de crecimiento</p>
          
          {/* WhatsApp CTA button */}
          <a
            href="https://wa.me/573125345323?text=Hola%20Kreanding,%20quiero%20saber%20m%C3%A1s%20sobre%20Reactia%20Mini"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-ink hover:text-amber transition-colors"
            aria-label="Habla con un experto por WhatsApp"
          >
            <WhatsApp className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="hidden sm:inline">Habla con un experto</span>
          </a>
        </div>
      </div>
    </header>
  );
}
