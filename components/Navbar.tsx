import Image from 'next/image';
import Link from 'next/link';

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
          aria-label="Reactia Mini — inicio"
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
            Reactia <span className="text-amber">Mini</span>
          </span>
        </Link>

        <p className="ds-label hidden sm:block">Escáner de crecimiento</p>
      </div>
    </header>
  );
}
