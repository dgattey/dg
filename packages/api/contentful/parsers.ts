import type { Link, Project, TextBlock } from './api.generated';

/**
 * Type guard to get a link out
 */
export const isLink = (item: Link | undefined | Record<string, unknown>): item is Link =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  Boolean((item as Link).title);

/**
 * Type guard to get a project out
 */
export const isProject = (item: Project | undefined | Record<string, unknown>): item is Project =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  Boolean((item as Project).creationDate) && Boolean((item as Project).thumbnail);

/**
 * Type guard to get a text block out
 */
export const isTextBlock = (
  item: TextBlock | undefined | Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
): item is TextBlock => Boolean((item as TextBlock).content?.json);

/**
 * Can be used to find a link that contains a given string somewhere in an array of links.
 * Most commonly used with header/footer links.
 */
export const findLinkWithName = (links: Array<Link> | undefined, name: string): Link | undefined =>
  links?.find((link) => link.title?.includes(name));
