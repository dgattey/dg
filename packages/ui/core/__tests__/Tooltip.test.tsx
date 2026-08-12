import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip';

/**
 * Rules emotion has emitted for the tooltip surface. jsdom can't simulate
 * `:hover` or `:focus-visible`, so the stylesheet is where the reveal has to be
 * checked — and checking it there is the point: a rule in the stylesheet is a
 * rule the browser applies with no script running.
 */
const surfaceRules = () => {
  const surfaceClass = [...screen.getByRole('tooltip', { hidden: true }).classList].find((name) =>
    name.startsWith('css-'),
  );
  if (!surfaceClass) {
    throw new Error('Tooltip surface has no emotion class');
  }
  // Emotion inserts through the CSSOM here, so the tags themselves have no text
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

  /**
   * The whole point of the rewrite: hovering must not need a script. A tooltip
   * that called `showPopover()` was invisible with scripting off.
   */
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

  /**
   * A mouse click focuses its target, so plain `:focus` would pop a tooltip open
   * on click and leave it there. Keyboard users still get the hint because
   * `:focus-visible` is the browser's own answer to "was this focus keyboard-driven".
   */
  it('reveals on keyboard focus only, from either side of the anchor', () => {
    render(
      <Tooltip title="Hint">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(rulesMatching(/:focus(?!-visible)/)).toHaveLength(0);
    // Trigger inside the anchor, and an anchor that has to sit inside its trigger
    expect(rulesMatching(/\[data-tooltip-anchor\]:has\(:focus-visible\)/)).not.toHaveLength(0);
    expect(rulesMatching(/\*:focus-visible>\[data-tooltip-anchor\]/)).not.toHaveLength(0);
  });

  it('keeps a closed tooltip out of the accessibility tree and the tab order', () => {
    render(
      <Tooltip title="Hint">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    // `visibility: hidden` is what does this, in place of the old `popover` attribute
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
    // Overhangs the right edge by 12px, so it needs a 20px shift for an 8px gap
    jest.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue({
      left: window.innerWidth - 108,
      right: window.innerWidth + 12,
      width: 120,
    } as DOMRect);

    await user.hover(anchor);

    expect(tooltip.style.translate).toBe('-20px');
  });
});
