// Keep setup minimal; add any extra setup per test file.
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;
globalThis.Headers ??= class Headers {} as typeof globalThis.Headers;
globalThis.Request ??= class Request {} as typeof globalThis.Request;
globalThis.Response ??= class Response {} as typeof globalThis.Response;

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
  const style = document.createElement('style');
  style.textContent =
    '[data-tooltip-surface]{visibility:hidden}[data-tooltip-anchor]:hover>[data-tooltip-surface],:focus-visible>[data-tooltip-anchor]>[data-tooltip-surface],[data-tooltip-anchor]:has(:focus-visible)>[data-tooltip-surface]{visibility:visible}[data-tooltip-muted]>[data-tooltip-surface],[data-tooltip-floating]>[data-tooltip-surface]{display:none}';
  document.head.appendChild(style);
}
