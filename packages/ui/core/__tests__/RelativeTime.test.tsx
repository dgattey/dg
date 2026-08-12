import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RelativeTime } from '../RelativeTime';
import { ServerTimeProvider } from '../ServerTimeContext';

const TEST_SERVER_TIME = new Date('2026-02-10T12:00:00Z').getTime();

function TestWrapper({ children }: { children: ReactNode }) {
  return <ServerTimeProvider serverTime={TEST_SERVER_TIME}>{children}</ServerTimeProvider>;
}

/** Closed tooltips are hidden, so the full date has to be asked for by name. */
const fullDateTooltip = () => screen.getByRole('tooltip', { hidden: true });

describe('RelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes and renders relative time from date string', () => {
    render(<RelativeTime date="2026-02-10T09:00:00Z" />, {
      wrapper: TestWrapper,
    });

    // With server time context, initial render shows the time immediately
    expect(screen.getByText('3 hours ago')).toBeInTheDocument();
  });

  it('handles Date object input', () => {
    render(<RelativeTime date={new Date('2026-02-08T12:00:00Z')} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('handles timestamp number input', () => {
    const twoDaysAgo = new Date('2026-02-08T12:00:00Z').getTime();
    render(<RelativeTime date={twoDaysAgo} />, { wrapper: TestWrapper });

    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('updates relative time after interval', () => {
    render(<RelativeTime date="2026-02-10T11:55:00Z" updateIntervalMs={1000} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();

    // Advance time by 3 minutes (now 8 minutes ago)
    act(() => {
      jest.advanceTimersByTime(180_000);
    });

    expect(screen.getByText('8 minutes ago')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = render(
      <RelativeTime date="2026-02-10T11:00:00Z" updateIntervalMs={1000} />,
      { wrapper: TestWrapper },
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('wraps output in time element with dateTime and tooltip with full localized date', () => {
    render(<RelativeTime date="2026-02-10T09:00:00Z" />, {
      wrapper: TestWrapper,
    });

    const timeEl = screen.getByText('3 hours ago').closest('time');
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveAttribute('dateTime', '2026-02-10T09:00:00.000Z');

    const tooltip = fullDateTooltip();
    expect(tooltip).toBeInTheDocument();
    // Intl formats per environment locale (date + time)
    expect(tooltip).toHaveTextContent(/2026/);
    expect(tooltip.textContent?.length).toBeGreaterThan(10);
  });

  it('tooltip and dateTime are correct for Date object input', () => {
    const date = new Date('2026-02-08T14:30:00Z');
    render(<RelativeTime date={date} />, { wrapper: TestWrapper });

    const timeEl = screen.getByText('2 days ago').closest('time');
    expect(timeEl).toHaveAttribute('dateTime', '2026-02-08T14:30:00.000Z');
    expect(fullDateTooltip()).toHaveTextContent(/2026/);
  });

  it('tooltip and dateTime are correct for timestamp number input', () => {
    const ts = new Date('2026-02-09T00:00:00Z').getTime();
    render(<RelativeTime date={ts} />, { wrapper: TestWrapper });

    // Formatter may show "1 day ago" or "Yesterday"
    const timeEl = screen.getByText(/1 day ago|Yesterday/).closest('time');
    expect(timeEl).toHaveAttribute('dateTime', '2026-02-09T00:00:00.000Z');
    expect(fullDateTooltip()).toHaveTextContent(/2026/);
  });

  /**
   * The exact instant is only ever *shown* by the tooltip, so it has to be
   * announced with the relative text rather than left to a hover a keyboard or
   * a screen reader never performs.
   */
  it('describes the relative time with the full date', () => {
    render(<RelativeTime date="2026-02-10T09:00:00Z" />, { wrapper: TestWrapper });

    const timeEl = screen.getByText('3 hours ago').closest('time');
    expect(timeEl).toHaveAttribute('aria-describedby', fullDateTooltip().id);
  });
});
