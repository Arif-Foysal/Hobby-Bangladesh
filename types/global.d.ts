// Global type declarations for Google Tag Manager dataLayer

interface Window {
  dataLayer?: Record<string, unknown>[];
  // GTM may still expose gtag/fbq via custom HTML tags, keep optional
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
}