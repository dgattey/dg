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
    expect(tooltip).toHaveClass('ui-tooltip--top');
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
});
