import { useEffect, useState } from 'react';

type DateConstructorValue = Date | string | number | null | undefined;

interface RelativeTime {
  unit: Intl.RelativeTimeFormatUnit;
  amount: number;
  formatted: string;
}

// Value to use as a fallback when all else fails
const FALLBACK: readonly [Intl.RelativeTimeFormatUnit, number] = ['second', 1000] as const;

/**
 * Maps from units to the amount of milliseconds they need to be considered
 * the right option for formatting.
 */
const UNITS: Partial<Record<Intl.RelativeTimeFormatUnit, number>> = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
} as const;

// These are overrides for certain time periods - values are
const OVERRIDES: Partial<Record<Intl.RelativeTimeFormatUnit, Record<number, string>>> = {
  second: {
    30: 'just now',
  },
  minute: {
    1: 'a minute ago',
    4: 'a few minutes ago',
  },
  hour: {
    1: 'an hour ago',
  },
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/**
 * Converts a date to a number, defaulting to right now as a fallback
 */
const numericDate = (date: DateConstructorValue) => +new Date(date ?? new Date());

/**
 * Typeguard for converting a string to a time format unit if possible
 */
const isRelativeTimeUnit = (unit: string): unit is Intl.RelativeTimeFormatUnit =>
  Object.keys(UNITS).includes(unit);

/**
 * From an elapsed amount of milliseconds, grabs a unit and creates a value
 * from our elapsed ms in that unit that best fits. If the elapsedMs is 100, for example,
 * it would return { unit: 'second', amount: 0, formatted: '0 seconds ago' }
 */
const relativeTimeFromMs = (
  elapsedMs: number,
  formatter: Intl.RelativeTimeFormat,
): RelativeTime => {
  const [unit, value] =
    Object.entries(UNITS).find((entry) => Math.abs(elapsedMs) > entry[1]) ?? FALLBACK;
  const formattedUnit = isRelativeTimeUnit(unit) ? unit : FALLBACK[0];
  const amount = Math.round(elapsedMs / value);
  const formatted = formatter.format(amount, formattedUnit);
  return { unit: formattedUnit, amount, formatted };
};

/**
 * If we have an override matching our unit where the amount is under the
 * threshold, return that string to use as an override.
 */
const overriddenFormatString = ({ unit, amount }: RelativeTime) => {
  const overrides = OVERRIDES[unit];
  if (!overrides) {
    return;
  }
  return Object.entries(overrides).find(
    ([threshold]) => Math.abs(amount) <= Number(threshold),
  )?.[1];
};

/**
 * Used to create a "6 hours ago" or "last week" type string using
 * native date formatting. Makes sure to return a string on first
 * render and return the relative time format with an effect to avoid
 * server/client rendering differences
 */
export const useRelativeTimeFormat = ({
  fromDate,
  toDate,
  capitalized,
}: {
  fromDate: DateConstructorValue;
  toDate?: DateConstructorValue;
  capitalized?: boolean;
}) => {
  const elapsedMs = numericDate(fromDate) - numericDate(toDate);
  const [formattedValue, setFormattedValue] = useState<string>('recently');

  useEffect(() => {
    const relativeTime = relativeTimeFromMs(elapsedMs, relativeTimeFormatter);
    setFormattedValue(overriddenFormatString(relativeTime) ?? relativeTime.formatted);
  }, [elapsedMs]);

  if (capitalized) {
    return formattedValue.charAt(0).toUpperCase() + formattedValue.slice(1);
  }
  return formattedValue;
};
