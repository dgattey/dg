import type { Link, Project, TextBlock } from 'api/types/generated/contentfulApi.generated';

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

/**
 * Can be used to find a link that contains a given string somewhere in an array of links.
 * Most commonly used with header/footer links.
 */
export const findLinkWithName = (links: Array<Link> | undefined, name: string): Link | undefined =>
  links?.find((link) => link.title?.includes(name));

/**
 * Typeguard to narrow to a record from unknown
 */
export const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === 'object' && !!input && !Array.isArray(input);
