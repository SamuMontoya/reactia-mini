import { createClient } from '@supabase/supabase-js';
import { config } from '@/config';

/**
 * Server-only Supabase client, authenticated with the secret key.
 *
 * Every table (leads, diagnosticos, resultados, device_diagnostics) has RLS
 * enabled, and the anon/publishable client in `lib/supabase.ts` only has
 * SELECT policies — it can no longer insert, update, or delete anything.
 * This client uses the secret key instead, which bypasses RLS entirely, so
 * every write in `lib/api/*.ts` goes through here.
 *
 * `lib/supabase.ts` still exists and is still the right client for the two
 * places that read Supabase directly from the browser (generando/page.tsx,
 * resultado/page.tsx) — those must stay on the RLS-restricted anon key.
 * This file must never be imported from a 'use client' component: the
 * secret key would end up in the browser bundle, defeating the whole point.
 * The guard below turns that mistake into an immediate, loud failure
 * instead of a silently-shipped secret.
 */
if (typeof window !== 'undefined') {
  throw new Error(
    'lib/supabaseAdmin.ts was imported into browser code. It holds the Supabase secret key and must only be used from server-side code (API routes / lib/api).'
  );
}

export const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY);
