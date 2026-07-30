/**
 * fetch() wrapper for the funnel's own API routes, called from client
 * components.
 *
 * The one thing this adds over a bare fetch: `ngrok-skip-browser-warning`.
 * A free-tier ngrok tunnel (used for on-device previews) intercepts every
 * request — including background fetches, not just page loads — with its own
 * HTML interstitial unless this header is present. Without it, a request
 * still resolves with `200 OK`, but the body is that HTML page instead of
 * JSON, so `response.json()` throws and every call site's catch block reports
 * a generic failure. That's exactly what "the redirect doesn't work" looked
 * like for the gatekeeping form. The header is inert outside of ngrok, so
 * this is safe to use everywhere, tunnel or not.
 */
export const apiFetch = (url: string, init: RequestInit = {}): Promise<Response> =>
  fetch(url, {
    ...init,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      ...init.headers,
    },
  });

export const postJson = (url: string, body: unknown): Promise<Response> =>
  apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
