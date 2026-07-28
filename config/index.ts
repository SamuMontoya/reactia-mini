export const config = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  UMAMI_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '',
  // Destination of the result-page CTA. MUST be set before production: with the
  // placeholder below, the button renders disabled with an explanatory note
  // rather than sending anyone to a dead wa.me link. Digits only, country code
  // included, no plus sign — e.g. 573001234567.
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
};

/** Placeholder value that means "not configured yet". */
export const WHATSAPP_PLACEHOLDER = 'PENDIENTE_CONFIGURAR';

export const isWhatsAppConfigured = (): boolean => {
  const value = config.WHATSAPP_NUMBER.trim();
  return value !== '' && value !== WHATSAPP_PLACEHOLDER && /^[0-9]{10,15}$/.test(value);
};

/** Builds a wa.me link with a pre-filled message. */
export const buildWhatsAppUrl = (mensaje: string): string =>
  `https://wa.me/${config.WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(mensaje)}`;
