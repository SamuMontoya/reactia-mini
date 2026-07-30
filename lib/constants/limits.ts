/**
 * Free diagnósticos allowed per device.
 *
 * Lives in its own dependency-free module (not lib/api/device.ts, where the
 * server-side check itself lives) specifically so the landing page — a
 * 'use client' component — can import this single number for its own UX
 * shortcut (showing the popup instead of navigating) without pulling in
 * lib/supabaseAdmin.ts, which throws if it ever ends up in browser code.
 *
 * The real enforcement is server-side, in
 * asegurarLimiteDiagnosticosNoAlcanzado (lib/api/device.ts) — this constant
 * is shared so the two can never drift apart, not so the client can enforce
 * anything on its own.
 */
export const MAX_DIAGNOSTICOS_GRATIS = 3;
