import type { Link, Project, TextBlock } from './generated/api.generated';

/**
 * Type guard to get a link out
 */
export const isLink = (item: Link | undefined | Record<string, unknown>): item is Link =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(item as Link)?.title;

/**
 * Type guard to get a project out
 */
export const isProject = (item: Project | undefined | Record<string, unknown>): item is Project =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  !!(item as Project)?.creationDate && !!(item as Project)?.thumbnail;

/**
 * Type guard to get a text block out
 */
export const isTextBlock = (
  item: TextBlock | undefined | Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
): item is TextBlock => !!(item as TextBlock)?.content?.json;

/**
 * Type guard to filter out null or undefined items
 */
export const isDefinedItem = <Type>(item: Type | undefined | null): item is Type =>
  item !== undefined && item !== null;
