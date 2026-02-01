import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';

/**
 * Can be used to find a link that contains a given string somewhere in an array of links.
 * Most commonly used with header/footer links.
 */
export const findLinkWithName = (
  links: Array<RenderableLink> | undefined,
  name: string,
): RenderableLink | undefined => links?.find((link) => link.title.includes(name));
