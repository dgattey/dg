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
    document.documentElement.style.removeProperty('--site-header-tuck');
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

    expect(document.documentElement).toHaveStyle({
      '--site-header-height': '84px',
      '--site-header-tuck': '0px',
    });
  });

  it('does not publish a height without a header marker', () => {
    render(<SiteHeaderHeight />);

    expect(document.documentElement.style.getPropertyValue('--site-header-height')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--site-header-tuck')).toBe('');
  });

  it('publishes the tuck and the remaining height when the pinned row sits below the first row', () => {
    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function rectFor(
      this: HTMLElement,
    ) {
      if (this.hasAttribute('data-sticky-header-row')) {
        return new DOMRect(0, 40, 320, 36);
      }
      return new DOMRect(0, 0, 320, 100);
    });

    render(
      <>
        <SiteHeaderHeight />
        <header data-sticky-header style={{ paddingTop: '10px' }}>
          <nav data-sticky-header-row style={{ marginTop: '10px' }} />
        </header>
      </>,
    );

    expect(document.documentElement).toHaveStyle({
      '--site-header-height': '80px',
      '--site-header-tuck': '20px',
    });
  });
});
