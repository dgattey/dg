// Keep setup minimal; add any extra setup per test file.
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

// Silence noisy console methods in tests. console.error and console.warn
// are left intact so genuine issues remain visible. Uses direct assignment
// instead of jest.spyOn so jest.restoreAllMocks() doesn't undo it.
const noop = () => {};
console.info = noop;
console.log = noop;

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;

const ensurePopoverMethod = (method: 'showPopover' | 'hidePopover') => {
  if (typeof HTMLElement === 'undefined') {
    return;
  }
  if (!(method in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, method, {
      configurable: true,
      value: () => {},
    });
  }
};

ensurePopoverMethod('showPopover');
ensurePopoverMethod('hidePopover');

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
