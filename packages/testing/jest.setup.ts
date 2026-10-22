// Keep setup minimal; add any extra setup per test file.
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;

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
}
