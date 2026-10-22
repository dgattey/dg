'use client';

import { capitalize } from '@dg/shared-core/formatting/capitalize';
import { useEffect, useState } from 'react';
import { useServerTime } from './ServerTimeContext';
import { Tooltip, type TooltipPlacement } from './Tooltip';

type DateValue = Date | string | number;

const FALLBACK: readonly [Intl.RelativeTimeFormatUnit, number] = ['second', 1000];

const UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['month', (24 * 60 * 60 * 1000 * 365) / 12],
  ['second', 1000],
  ['year', 24 * 60 * 60 * 1000 * 365],
];

const OVERRIDES: Partial<Record<Intl.RelativeTimeFormatUnit, Record<number, string>>> = {
  hour: {
    1: 'an hour ago',
  },
  minute: {
    1: 'a minute ago',
    4: 'a few minutes ago',
  },
  second: {
    30: 'just now',
  },
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

function formatRelativeTime({ fromDate, toDate }: { fromDate: DateValue; toDate: number }): string {
  const fromNumeric = Number(new Date(fromDate));
  if (Number.isNaN(fromNumeric) || Number.isNaN(toDate)) {
    return '';
  }
  const elapsedMs = fromNumeric - toDate;
  const [unit, value] = UNITS.find((entry) => Math.abs(elapsedMs) > entry[1]) ?? FALLBACK;
  const amount = Math.round(elapsedMs / value);
  const overrides = OVERRIDES[unit];
  const overridden = overrides
    ? Object.entries(overrides).find(([threshold]) => Math.abs(amount) <= Number(threshold))?.[1]
    : undefined;
  return overridden ?? relativeTimeFormatter.format(amount, unit);
}

type RelativeTimeProps = {
  /** The date to display relative to now. */
  date: DateValue;
  /** How often to refresh the relative time (in ms). Defaults to 60s. */
  updateIntervalMs?: number;
  /** Whether to show a tooltip with the full date and time. Defaults to true. */
  hasTooltip?: boolean;
  /** Preferred side for the tooltip. Defaults to below. */
  tooltipPlacement?: TooltipPlacement;
  /** Capitalize the first letter, for text that starts a line. Defaults to false. */
  isCapitalized?: boolean;
};

const DEFAULT_UPDATE_INTERVAL_MS = 60_000;

function toDate(value: DateValue): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatFullDate(date: DateValue): string {
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
  tooltipPlacement,
  isCapitalized = false,
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
  const time = (
    <time dateTime={dateTimeAttr}>{isCapitalized ? capitalize(relativeTime) : relativeTime}</time>
  );

  if (hasTooltip) {
    return (
      <Tooltip placement={tooltipPlacement} title={fullDate}>
        {time}
      </Tooltip>
    );
  }

  return time;
}
