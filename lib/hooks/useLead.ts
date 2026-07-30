'use client';
import { useEffect, useState } from 'react';
import { getLead, type StoredLead } from '@/lib/storage/leadStorage';

/**
 * `undefined` until the first client effect has actually checked
 * localStorage, `null` once that check confirms there's no lead, or the lead.
 *
 * A plain `useSyncExternalStore(subscribe, getLead, () => null)` looks like
 * the right tool here, but isn't: on a cold/hard page load React
 * deliberately renders the FIRST client pass using `getServerSnapshot`
 * (`null`, since the server has no localStorage) to avoid a hydration
 * mismatch, and only reconciles to the real value in a later pass. Every
 * page that reads this hook does `if (!lead) router.replace(...)` to bounce
 * back to the gatekeeping form when there's genuinely no lead — and that
 * effect fires on the FIRST render it sees, which on a cold load is that
 * transient, server-matching `null`, not the real one. The result: reloading
 * mid-diagnóstico with a perfectly valid saved lead sent you back to square
 * one, which is exactly the "recargué y perdí mi progreso" bug this was
 * chasing.
 *
 * Reading the real value inside a plain effect instead means a consumer
 * never sees a render where this is a false `null` — only `undefined`
 * (still checking, don't redirect yet) or the real, confirmed answer.
 * Callers that redirect on "no lead" must check `=== null`, not `!lead`.
 */
export const useLead = (): StoredLead | null | undefined => {
  const [lead, setLead] = useState<StoredLead | null | undefined>(undefined);

  useEffect(() => {
    setLead(getLead());
  }, []);

  return lead;
};
