import { useMemo } from 'react';

type DateConstructorValue = Date | string | number | null | undefined;

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

/**
 * Typeguard for converting a string to a time format unit if possible
 */
const isRelativeTimeUnit = (unit: string): unit is Intl.RelativeTimeFormatUnit =>
  Object.keys(UNITS).includes(unit);

/**
 * Used to create a "6 hours ago" or "last week" type string using
 * native date formatting.
 */
const useRelativeTimeFormat = (fromDate: DateConstructorValue, toDate?: DateConstructorValue) => {
  const formatter = useMemo(() => new Intl.RelativeTimeFormat('en', { numeric: 'auto' }), []);

  // Converts a date to a number, defaulting to right now as a fallback
  const numericDate = (date: DateConstructorValue) => +new Date(date ?? new Date());
  const elapsedMs = numericDate(fromDate) - numericDate(toDate);

  /**
   * Finds the first unit whose window of time is less than the amount of time that's passed,
   * and use the time formatter to create a relative time format string, or "Just now" if under
   * 30 seconds. Also shorten
   */
  const formattedValue = useMemo(() => {
    const [unit, value] =
      Object.entries(UNITS).find((entry) => Math.abs(elapsedMs) > entry[1]) ?? FALLBACK;
    const formattedUnit = isRelativeTimeUnit(unit) ? unit : FALLBACK[0];
    const roundedAmount = Math.round(elapsedMs / value);
    const formattedString = formatter.format(roundedAmount, formattedUnit);

    // Return a custom format if there's something to override
    const overrides = OVERRIDES[formattedUnit];
    if (overrides) {
      const overrideStrings = Object.entries(overrides);
      return (
        overrideStrings.find(([threshold]) => Math.abs(roundedAmount) <= Number(threshold))?.[1] ??
        formattedString
      );
    }
    return formattedString;
  }, [elapsedMs, formatter]);

  return formattedValue;
};

export default useRelativeTimeFormat;
