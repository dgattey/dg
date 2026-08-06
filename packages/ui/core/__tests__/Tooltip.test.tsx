import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../Tooltip';

const setupPopoverMocks = () => {
  const showPopover = jest.fn();
  const hidePopover = jest.fn();
  const originalShow = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
  const originalHide = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidePopover');

  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: showPopover,
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value: hidePopover,
  });

  const restore = () => {
    if (originalShow) {
      Object.defineProperty(HTMLElement.prototype, 'showPopover', originalShow);
    } else {
      Object.defineProperty(HTMLElement.prototype, 'showPopover', {
        configurable: true,
        value: undefined,
      });
    }

    if (originalHide) {
      Object.defineProperty(HTMLElement.prototype, 'hidePopover', originalHide);
    } else {
      Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
        configurable: true,
        value: undefined,
      });
    }
  };

  return { hidePopover, restore, showPopover };
};

/**
 * jsdom's selector engine answers `:focus-visible` the same way it answers
 * `:focus`, so it can't tell a click from a Tab on its own. Stubbing the
 * trigger's `matches` is the only way to exercise both branches here.
 */
const stubFocusVisible = (element: Element, isFocusVisible: boolean) => {
  const actualMatches = element.matches.bind(element);
  jest
    .spyOn(element, 'matches')
    .mockImplementation((selector: string) =>
      selector === ':focus-visible' ? isFocusVisible : actualMatches(selector),
    );
};

describe('Tooltip', () => {
  it('adds aria-describedby and respects placement', () => {
    render(
      <Tooltip placement="top" title="Tip content">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });
    const tooltip = screen.getByRole('tooltip');
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

    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(button).not.toHaveAttribute('aria-describedby');
  });

  it('shows and hides with the popover API', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { hidePopover, restore, showPopover } = setupPopoverMocks();

    render(
      <Tooltip title="Popover">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });
    const anchor = button.parentElement;
    if (!anchor) {
      throw new Error('Tooltip anchor not found');
    }

    await user.hover(anchor);
    expect(showPopover).toHaveBeenCalledTimes(1);

    await user.unhover(anchor);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(hidePopover).toHaveBeenCalledTimes(1);

    restore();
    jest.useRealTimers();
  });

  it('shows on keyboard focus', async () => {
    const user = userEvent.setup();
    const { restore, showPopover } = setupPopoverMocks();

    render(
      <Tooltip title="Keyboard">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });
    stubFocusVisible(button, true);

    await user.tab();

    expect(button).toHaveFocus();
    expect(showPopover).toHaveBeenCalledTimes(1);

    restore();
  });

  it('ignores focus the browser does not treat as keyboard focus', () => {
    const { restore, showPopover } = setupPopoverMocks();

    render(
      <Tooltip title="Mouse">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });
    stubFocusVisible(button, false);

    act(() => {
      button.focus();
    });

    // Focus really did land, so this pins the guard rather than absent focus
    expect(button).toHaveFocus();
    expect(showPopover).not.toHaveBeenCalled();

    restore();
  });

  it('does not keep the tooltip open after a click once the pointer leaves', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { hidePopover, restore, showPopover } = setupPopoverMocks();

    render(
      <Tooltip title="Mouse">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Trigger' });
    const anchor = button.parentElement;
    if (!anchor) {
      throw new Error('Tooltip anchor not found');
    }
    stubFocusVisible(button, false);

    await user.click(button);
    const showsFromHover = showPopover.mock.calls.length;

    await user.unhover(anchor);
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(button).toHaveFocus();
    expect(hidePopover).toHaveBeenCalled();
    expect(showPopover).toHaveBeenCalledTimes(showsFromHover);

    restore();
    jest.useRealTimers();
  });

  it('shifts inline to stay inset from the viewport edge', async () => {
    const user = userEvent.setup();
    const { restore } = setupPopoverMocks();

    render(
      <Tooltip title="Near the edge">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole('tooltip');
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

    restore();
  });
});
