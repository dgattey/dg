import { render } from '@testing-library/react';
import { SiteHeaderHeight } from '../SiteHeaderHeight';

class MockResizeObserver {
  disconnect() {}
  observe() {}
}

describe('SiteHeaderHeight', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      value: MockResizeObserver,
    });
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 0, 320, 84));
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--site-header-height');
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'ResizeObserver');
  });

  it('publishes the height of the sticky header marker', () => {
    render(
      <>
        <SiteHeaderHeight />
        <header data-sticky-header />
      </>,
    );

    expect(document.documentElement).toHaveStyle({ '--site-header-height': '84px' });
  });

  it('does not publish a height without a sticky header marker', () => {
    render(<SiteHeaderHeight />);

    expect(document.documentElement.style.getPropertyValue('--site-header-height')).toBe('');
  });
});
