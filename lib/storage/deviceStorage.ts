const STORAGE_KEY = 'reactia_device_id';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS, or
 * `localhost`) — on a plain-HTTP LAN preview (e.g. testing from a phone at
 * `http://192.168.x.x:3000`) it's simply undefined, and calling it threw
 * uncaught during this page's very first render. That crashed hydration for
 * the whole page before React ever attached a single event handler, which
 * is why every interactive element on it silently did nothing.
 *
 * The fallback has to actually be a v4 UUID, not just any random string —
 * `device_id` is a `uuid` column in Supabase, and a first attempt here that
 * produced a plain `timestamp-random` string saved fine to localStorage but
 * failed at insert time with "invalid input syntax for type uuid".
 */
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  let deviceId = localStorage.getItem(STORAGE_KEY);
  // Also regenerates anything saved by the pre-fix fallback, which wasn't a
  // valid uuid and would otherwise keep failing every insert forever.
  if (!deviceId || !UUID_RE.test(deviceId)) {
    deviceId = generateId();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  return deviceId;
}

export function setDeviceId(deviceId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
}

export function clearDeviceId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}