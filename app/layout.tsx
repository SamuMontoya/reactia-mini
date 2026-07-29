import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Kreanding's two families. Both are variable fonts, so no `weight` is needed
// (see node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reactia Mini — Escáner de Crecimiento",
    template: "%s · Reactia Mini",
  },
  description:
    "Responde 11 preguntas y descubre en 10 minutos qué está frenando el crecimiento de tu negocio. Gratis.",
  applicationName: "Reactia Mini",
  openGraph: {
    title: "Reactia Mini — Escáner de Crecimiento",
    description:
      "Responde 11 preguntas y descubre en 10 minutos qué está frenando el crecimiento de tu negocio. Gratis.",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ed",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
