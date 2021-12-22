import type { Link, LinkCollection, Section } from './generated/api.generated';

/**
 * Type guard to get a section out
 */
export const isSection = (item: Section | undefined | Record<string, unknown>): item is Section =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(item as Section)?.blocksCollection?.items;

/**
 * Type guard to get a link collection out
 */
export const isLinkCollection = (
  item: LinkCollection | undefined | Record<string, unknown>,
): item is LinkCollection =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(item as LinkCollection)?.items?.some?.((collectionItem) => !!collectionItem?.icon);

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
