import { useMemo } from 'react';
import { findLinkWithName } from 'api/parsers';
import type { Link as LinkProps } from 'api/server/contentful/api.generated';
import { useData } from 'api/useData';

/**
 * Using the header or footer links, finds a link with a given name. Can override the
 * title or url by passing an override
 */
export const useLinkWithName = (name: string, override?: Pick<LinkProps, 'title' | 'url'>) => {
  const { data: footerLinks } = useData('footer');

  const allLinks = useMemo(() => [...(footerLinks ?? [])], [footerLinks]);

  const foundLink = useMemo(() => findLinkWithName(allLinks, name), [allLinks, name]);
  return override && foundLink ? { ...foundLink, ...override } : foundLink;
};
