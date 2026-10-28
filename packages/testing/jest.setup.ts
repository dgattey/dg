// Keep setup minimal; add any extra setup per test file.
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;
globalThis.Headers ??= class Headers {} as typeof globalThis.Headers;
globalThis.Request ??= class Request {} as typeof globalThis.Request;
globalThis.Response ??= class Response {} as typeof globalThis.Response;

// Every Contentful API request (Delivery, Preview, GraphQL, Management) counts against the
// monthly quota, and Jest loads the real tokens from `.env` through `next.config.ts` and the
// database global setup. Tests mock the `@dg/services/contentful` fetchers instead; a
// blocked request fails the test even when the caller swallows the rejection.
const CONTENTFUL_API_URL = /^https?:\/\/(?:[\w-]+\.)*contentful\.com(?:[/:?#]|$)/i;
const blockedContentfulUrls: Array<string> = [];
const unguardedFetch = globalThis.fetch;
if (unguardedFetch) {
  globalThis.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (CONTENTFUL_API_URL.test(url)) {
      blockedContentfulUrls.push(url);
      return Promise.reject(new Error(`Tests must not call the Contentful API: ${url}`));
    }
    return unguardedFetch(input, init);
  };
}
afterEach(() => {
  const blocked = blockedContentfulUrls.splice(0);
  if (blocked.length > 0) {
    throw new Error(
      `Mock the @dg/services/contentful fetchers; this test called the Contentful API:\n${blocked.join('\n')}`,
    );
  }
});

// Mock matchMedia for components using useMediaQuery or matchMedia directly
const matchMediaMock = (query: string) => ({
  addEventListener: () => {},
  addListener: () => {},
  dispatchEvent: () => false,
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: () => {},
  removeListener: () => {},
});
if (typeof window !== 'undefined') {
  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
  document.elementFromPoint ??= () => null;
  const style = document.createElement('style');
  style.textContent =
    '[data-tooltip-surface]{visibility:hidden}[data-tooltip-anchor]:hover>[data-tooltip-surface],:focus-visible>[data-tooltip-anchor]>[data-tooltip-surface],[data-tooltip-anchor]:has(:focus-visible)>[data-tooltip-surface]{visibility:visible}[data-tooltip-muted]>[data-tooltip-surface],[data-tooltip-floating]>[data-tooltip-surface]{display:none}';
  document.head.appendChild(style);
}
