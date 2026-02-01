// Keep setup minimal; add any extra setup per test file.
import '@testing-library/jest-dom';

const ensurePopoverMethod = (method: 'showPopover' | 'hidePopover') => {
  if (!(method in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, method, {
      configurable: true,
      value: () => {},
    });
  }
};

ensurePopoverMethod('showPopover');
ensurePopoverMethod('hidePopover');
