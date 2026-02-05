// Keep setup minimal; add any extra setup per test file.
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

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
