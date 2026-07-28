import Image from 'next/image';

/**
 * Funnel footer. Middot-separated metadata is part of the Kreanding vocabulary.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-dust bg-paper-warm">
      <div className="ds-container flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/logo.svg"
            alt=""
            width={20}
            height={22}
            className="h-5 w-auto opacity-70"
          />
          <span className="font-display text-base font-semibold text-ink">
            Kreanding
          </span>
        </div>

        <p className="text-center text-sm text-stone sm:text-right">
          Construido con proceso. Medido en resultados.
        </p>

        <p className="text-xs text-stone/80">
          © {year} Kreanding · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
