import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip';

/**
 * Rules emitted for the tooltip surface. jsdom can't simulate
 * `:hover` or `:focus-visible`, so the stylesheet is where the reveal has to be
 * checked — and checking it there is the point: a rule in the stylesheet is a
 * rule the browser applies with no script running.
 */
const surfaceRules = () =>
  [...document.querySelectorAll('style')]
    .flatMap((tag) => [...(tag.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .filter((rule) => rule.includes('[data-tooltip-surface]'));

const rulesMatching = (pattern: RegExp) => surfaceRules().filter((rule) => pattern.test(rule));

describe('Tooltip', () => {
  it('adds aria-describedby and respects placement', () => {
    render(
      <Tooltip placement="top" title="Tip content">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    const describedBy = button.getAttribute('aria-describedby');
    if (!describedBy) {
      throw new Error('aria-describedby not set');
    }

    expect(tooltip).toHaveAttribute('id', describedBy);
    expect(tooltip).toHaveAttribute('data-placement', 'top');
  });

  it('skips rendering when title is empty', () => {
    render(
      <Tooltip title="">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });

    expect(screen.queryByRole('tooltip', { hidden: true })).toBeNull();
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('reveals from CSS rather than the popover API', async () => {
    const user = userEvent.setup();
    const showPopover = jest.fn();
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      value: showPopover,
    });

    render(
      <Tooltip title="Hint">
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole('button', { name: 'Trigger' }).parentElement;
    if (!anchor) {
      throw new Error('Tooltip anchor not found');
    }

    await user.hover(anchor);

    expect(showPopover).not.toHaveBeenCalled();
    expect(screen.getByRole('tooltip', { hidden: true })).not.toHaveAttribute('popover');
    expect(rulesMatching(/\[data-tooltip-anchor\]:hover/)).not.toHaveLength(0);
  });

  it('reveals on keyboard focus only, from either side of the anchor', () => {
    render(
      <Tooltip title="Hint">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(rulesMatching(/:focus(?!-visible)/)).toHaveLength(0);
    expect(rulesMatching(/\[data-tooltip-anchor\]:has\(:focus-visible\)/)).not.toHaveLength(0);
    expect(rulesMatching(/:focus-visible>\[data-tooltip-anchor\]/)).not.toHaveLength(0);
  });

  it('keeps a closed tooltip out of the accessibility tree and the tab order', () => {
    render(
      <Tooltip title="Hint">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(screen.getByRole('tooltip', { hidden: true })).toBeInTheDocument();
  });

  describe('once hydrated', () => {
    const floatingSurface = () => document.querySelector<HTMLElement>('[data-tooltip-portal]');

    /** Trigger rect for the anchor, and a 120×30 floating surface. */
    const mockRects = (anchor: HTMLElement, trigger: Partial<DOMRect>) => {
      const measure = HTMLElement.prototype.getBoundingClientRect;
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        if (this === anchor) {
          return trigger as DOMRect;
        }
        if (this.hasAttribute('data-tooltip-portal')) {
          return { height: 30, width: 120 } as DOMRect;
        }
        return measure.call(this);
      });
    };

    afterEach(() => jest.restoreAllMocks());

    it('floats in the tooltip root, outside every card, clamped inside the viewport', async () => {
      const user = userEvent.setup();
      render(
        <div data-testid="root" data-tooltip-root>
          <div style={{ filter: 'drop-shadow(0 0 1px black)', rotate: '2deg' }}>
            <Tooltip title="Near the edge">
              <button type="button">Trigger</button>
            </Tooltip>
          </div>
        </div>,
      );
      const anchor = screen.getByRole('button', { name: 'Trigger' }).parentElement;
      if (!anchor) {
        throw new Error('Tooltip anchor not found');
      }
      mockRects(anchor, { bottom: 40, left: window.innerWidth - 30, top: 20, width: 20 });

      await user.hover(anchor);

      const surface = floatingSurface();
      expect(surface).toHaveTextContent('Near the edge');
      expect(surface?.parentElement).toBe(screen.getByTestId('root'));
      expect(surface).toHaveAttribute('aria-hidden', 'true');
      expect(surface?.style.left).toBe(`${window.innerWidth - 12 - 120}px`);
      expect(surface?.style.top).toBe('48px');
      expect(anchor).toHaveAttribute('data-tooltip-floating');

      await user.unhover(anchor);
      expect(floatingSurface()).toBeNull();
    });

    it('falls back to the body and flips above a trigger at the bottom of the viewport', async () => {
      const user = userEvent.setup();
      render(
        <Tooltip title="Hint">
          <button type="button">Trigger</button>
        </Tooltip>,
      );
      const anchor = screen.getByRole('button', { name: 'Trigger' }).parentElement;
      if (!anchor) {
        throw new Error('Tooltip anchor not found');
      }
      const bottom = window.innerHeight - 4;
      mockRects(anchor, { bottom, left: 0, top: bottom - 20, width: 40 });

      await user.hover(anchor);

      const surface = floatingSurface();
      expect(surface?.parentElement).toBe(document.body);
      expect(surface).toHaveAttribute('data-placement', 'top');
      expect(surface?.style.top).toBe(`${bottom - 20 - 8 - 30}px`);
      expect(surface?.style.left).toBe('12px');
    });
  });

  describe('whenTruncated', () => {
    const renderTruncatable = () => {
      render(
        <Tooltip title="Together (feat. Nikki Nair, Jessy Lanza & Prentiss)" whenTruncated>
          <a href="/track" style={{ overflow: 'hidden' }}>
            Together (feat. Nikki Nair, Jessy Lanza & Prentiss)
          </a>
        </Tooltip>,
      );
      const link = screen.getByRole('link');
      const anchor = link.parentElement;
      if (!anchor) {
        throw new Error('Tooltip anchor not found');
      }
      return { anchor, link };
    };

    const overflowBy = (element: HTMLElement, pixels: number) => {
      Object.defineProperty(element, 'clientWidth', { configurable: true, value: 200 });
      Object.defineProperty(element, 'scrollWidth', { configurable: true, value: 200 + pixels });
    };

    it('stays shut when the text fits', async () => {
      const user = userEvent.setup();
      const { anchor, link } = renderTruncatable();
      overflowBy(link, 1);

      await user.hover(anchor);

      expect(anchor).toHaveAttribute('data-tooltip-muted');
      expect(rulesMatching(/\[data-tooltip-muted\]/).join()).toContain('display: none');
    });

    it('opens once the text is cut off, and again stops when it fits', async () => {
      const user = userEvent.setup();
      const { anchor, link } = renderTruncatable();
      overflowBy(link, 40);

      await user.hover(anchor);
      expect(anchor).not.toHaveAttribute('data-tooltip-muted');

      await user.unhover(anchor);
      overflowBy(link, 0);
      await user.hover(anchor);
      expect(anchor).toHaveAttribute('data-tooltip-muted');
    });

    it('measures on keyboard focus too', async () => {
      const user = userEvent.setup();
      const { anchor, link } = renderTruncatable();
      overflowBy(link, 40);

      await user.tab();

      expect(link).toHaveFocus();
      expect(anchor).not.toHaveAttribute('data-tooltip-muted');
      expect(document.querySelector('[data-tooltip-portal]')).toHaveTextContent('Together');
    });

    it('leaves the trigger undescribed, since it already holds the full text', () => {
      const { link } = renderTruncatable();

      expect(link).not.toHaveAttribute('aria-describedby');
    });
  });
});
