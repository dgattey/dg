import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip';

/**
 * Rules emitted for the tooltip surface. jsdom can't simulate
 * `:hover` or `:focus-visible`, so the stylesheet is where the reveal has to be
 * checked — and checking it there is the point: a rule in the stylesheet is a
 * rule the browser applies with no script running.
 */
const surfaceRules = () => {
  const surfaceClass = [...screen.getByRole('tooltip', { hidden: true }).classList].find((name) =>
    name.startsWith('css-'),
  );
  if (!surfaceClass) {
    throw new Error('Tooltip surface has no compiled CSS class');
  }
  return [...document.querySelectorAll('style')]
    .flatMap((tag) => [...(tag.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .filter((rule) => rule.includes(surfaceClass));
};

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

  it('shifts inline to stay inset from the viewport edge', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip title="Near the edge">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    const anchor = screen.getByRole('button', { name: 'Trigger' }).parentElement;
    if (!anchor) {
      throw new Error('Tooltip anchor not found');
    }
    jest.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      left: window.innerWidth - 108,
      right: window.innerWidth + 12,
      width: 120,
    } as DOMRect);

    await user.hover(anchor);

    expect(tooltip.style.translate).toBe('-20px');
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
    });

    it('leaves the trigger undescribed, since it already holds the full text', () => {
      const { link } = renderTruncatable();

      expect(link).not.toHaveAttribute('aria-describedby');
    });
  });
});
