'use client';

import { useEffect, useState } from 'react';
import { formatRelativeTime } from '../helpers/relativeTime';
import { useServerTime } from './ServerTimeContext';
import { Tooltip } from './Tooltip';

type RelativeTimeProps = {
  /** The date to display relative to now. */
  date: Date | string | number;
  /** How often to refresh the relative time (in ms). Defaults to 60s. */
  updateIntervalMs?: number;
  /** Whether to show a tooltip with the full date and time. Defaults to true. */
  hasTooltip?: boolean;
};

const DEFAULT_UPDATE_INTERVAL_MS = 60_000;

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatFullDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(toDate(date));
}

/**
 * Displays a relative time string (e.g., "5 minutes ago") that updates live.
 * Uses server-provided timestamp for initial render to avoid hydration mismatch,
 * then switches to live Date.now() updates.
 * Hover shows a tooltip with the full localized date and time.
 */
export function RelativeTime({
  date,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
  hasTooltip = true,
}: RelativeTimeProps) {
  const serverTime = useServerTime();

  // Use server time for initial render (hydration-safe), fallback to skeleton
  const [relativeTime, setRelativeTime] = useState<string>(() =>
    formatRelativeTime({ fromDate: date, toDate: serverTime }),
  );

  useEffect(() => {
    const computeRelativeTime = () => formatRelativeTime({ fromDate: date, toDate: Date.now() });

    // Switch to live time after hydration
    setRelativeTime(computeRelativeTime());

    const intervalId = setInterval(() => {
      setRelativeTime(computeRelativeTime());
    }, updateIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [date, updateIntervalMs]);

  const fullDate = formatFullDate(date);
  const dateTimeAttr = toDate(date).toISOString();
  const time = <time dateTime={dateTimeAttr}>{relativeTime}</time>;

  if (hasTooltip) {
    return <Tooltip title={fullDate}>{time}</Tooltip>;
  }

  return time;
}
