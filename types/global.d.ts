// Global type declarations for Google Analytics (gtag) and Meta Pixel (fbq)

interface Gtag {
  (...args: unknown[]): void;
  event: (
    name: string,
    params?: Record<string, unknown>
  ) => void;
  config: (id: string, params?: Record<string, unknown>) => void;
  js: (date: Date) => void;
}

interface Fbq {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
  init?: (pixelId: string, params?: Record<string, unknown>) => void;
  track: (
    event: string,
    params?: Record<string, unknown>
  ) => void;
  trackCustom?: (
    event: string,
    params?: Record<string, unknown>
  ) => void;
}

interface Window {
  gtag?: Gtag;
  fbq?: Fbq;
  dataLayer?: unknown[];
  _fbq?: unknown;
}