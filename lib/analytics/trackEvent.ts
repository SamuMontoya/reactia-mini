declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}

export const trackEvent = (name: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(name, data);
  }
};
