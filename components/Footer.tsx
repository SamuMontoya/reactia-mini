import Image from 'next/image';

/**
 * Funnel footer. Middot-separated metadata is part of the Kreanding vocabulary.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    // Ink, on every screen. The product was paper end to end, which left the
    // brand's paper → ink alternation unused and the pages feeling flat; a dark
    // footer is a permanent anchor at the foot of the funnel that costs no
    // attention, and where it follows the result page's ink CTA the two merge
    // into one closing block. The hairline is white here, not dust, so it still
    // separates them.
    <footer className="mt-auto border-t border-white/10 bg-ink">
      <div className="ds-container flex flex-col items-center gap-3 py-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/logo-inverted.svg"
            alt=""
            width={20}
            height={22}
            className="h-5 w-auto"
          />
          <span className="font-display text-base font-semibold text-white">
            Kreanding
          </span>
        </div>

        <p className="text-center text-sm text-dust sm:text-right">
          Construido con proceso. Medido en resultados.
        </p>

        <p className="text-xs text-stone">
          © {year} Kreanding · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
