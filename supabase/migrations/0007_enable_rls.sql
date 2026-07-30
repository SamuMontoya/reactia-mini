-- Re-enable Row Level Security, reversing 0004_disable_rls.sql.
--
-- Every write (insert/update on leads, diagnosticos, resultados,
-- device_diagnostics) now goes through the app's API routes using the
-- secret key (lib/supabaseAdmin.ts), which bypasses RLS entirely — none of
-- that traffic is affected by the policies below.
--
-- The publishable/anon key is still used directly from the browser in two
-- places (generando/page.tsx, resultado/page.tsx), both read-only. The
-- SELECT policies below are exactly what those two queries need and
-- nothing more: with RLS re-enabled and no policy at all, a table denies
-- every request by default, so anything not explicitly listed here is now
-- unreachable with the anon key — including every INSERT/UPDATE/DELETE,
-- and all of device_diagnostics (read only server-side, via the secret
-- key, so it gets no anon policy at all).
--
-- This is a bearer-token trust model, not per-user ownership — there is no
-- auth system in this funnel, every "session" is just a UUID (leadId,
-- diagnosticoId, resultadoId, deviceId) the browser already holds. SELECT
-- is intentionally not scoped tighter than "the row matching an id you
-- already have", because that's the same trust model resultado links
-- already rely on (an unguessable UUID in a URL). What RLS actually closes
-- here is everything a leaked anon key could previously do beyond that:
-- enumerate/insert/update/delete arbitrary rows straight against
-- PostgREST, bypassing every check in the Next.js API routes.

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_diagnostics ENABLE ROW LEVEL SECURITY;

-- resultado/page.tsx: select on resultados, joined through
-- diagnosticos!inner(leads(nombre, empresa)) — PostgREST enforces RLS on
-- every table in that join independently, so diagnosticos and leads each
-- need their own SELECT policy too, not just resultados.
CREATE POLICY "anon_select_resultados" ON resultados
  FOR SELECT TO anon USING (true);

-- generando/page.tsx: select on diagnosticos by id or by lead_id, plus the
-- join above.
CREATE POLICY "anon_select_diagnosticos" ON diagnosticos
  FOR SELECT TO anon USING (true);

-- Only reached via the join above (nombre/empresa for a specific result) —
-- not queried directly with the anon key anywhere.
CREATE POLICY "anon_select_leads" ON leads
  FOR SELECT TO anon USING (true);

-- No policy on device_diagnostics: getDiagnosticosByDeviceId and
-- countDiagnosticosByDeviceId (lib/api/device.ts) both run server-side
-- through the secret-key client, which bypasses RLS — the anon key has no
-- legitimate reason to touch this table at all.
