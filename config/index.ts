export const config = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  // Server-only (no NEXT_PUBLIC_ prefix, never bundled to the browser). Used
  // exclusively by lib/supabaseAdmin.ts for writes from API routes — RLS is
  // enabled on every table, so the publishable key above can no longer
  // insert/update/delete anything, only read what its policies allow.
  SUPABASE_SECRET_KEY: process.env.NEXT_SUPABASE_SECRET_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  // Fallback scoring provider. Groq is the primary one; if it errors, times
  // out or returns something unusable, lib/api/scoring.ts retries the exact
  // same prompt through OpenRouter so the visitor still gets a diagnóstico
  // instead of a 502 at the last step of the funnel. Optional: leave it empty
  // and the flow simply behaves as it did before, Groq-only.
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  UMAMI_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || '',
  // Destination of every "hablar con un experto" link. The fallback is the
  // number that used to be hard-coded inside the navbar — keeping it here means
  // there is one place to change it, and the env var overrides it per
  // environment without a code change.
  // Digits only, country code included, no plus sign — e.g. 573001234567.
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573125345323',
};

/** Placeholder value that means "not configured yet". */
export const WHATSAPP_PLACEHOLDER = 'PENDIENTE_CONFIGURAR';

/**
 * Whether the OpenRouter fallback can actually be used.
 *
 * The env var is seeded in Vercel with the same PENDIENTE_CONFIGURAR sentinel
 * above before the real key is pasted in, and a placeholder is worse than an
 * empty value if taken at face value: scoring would spend a whole extra
 * round-trip on a request that can only 401 before giving up. Treating it as
 * absent keeps the flow cleanly Groq-only until the real key lands.
 */
export const isOpenRouterConfigured = (): boolean => {
  const value = config.OPENROUTER_API_KEY.trim();
  return value !== '' && value !== WHATSAPP_PLACEHOLDER;
};

export const isWhatsAppConfigured = (): boolean => {
  const value = config.WHATSAPP_NUMBER.trim();
  return value !== '' && value !== WHATSAPP_PLACEHOLDER && /^[0-9]{10,15}$/.test(value);
};

/** Builds a wa.me link with a pre-filled message. */
export const buildWhatsAppUrl = (mensaje: string): string =>
  `https://wa.me/${config.WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(mensaje)}`;
