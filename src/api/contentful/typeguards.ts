import type { Link } from './generated/api.generated';

/**
 * Type guard to get a link out
 */
export const isLink = (item: Link | undefined | Record<string, unknown>): item is Link =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(item as Link)?.title;

/**
 * Type guard to filter out null or undefined items
 */
export const isDefinedItem = <Type>(item: Type | undefined | null): item is Type =>
  item !== undefined && item !== null;
