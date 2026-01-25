import type { Link as LinkProps } from 'api/contentful/api.generated';
import { findLinkWithName } from 'api/contentful/parsers';
import { useData } from 'api/useData';

/**
 * Using the header or footer links, finds a link with a given name. Can override the
 * title or url by passing an override
 */
export const useLinkWithName = (name: string, override?: Pick<LinkProps, 'title' | 'url'>) => {
  const { data: footerLinks } = useData('footer');

  const allLinks = [...(footerLinks ?? [])];

  const foundLink = findLinkWithName(allLinks, name);
  return override && foundLink ? { ...foundLink, ...override } : foundLink;
};
