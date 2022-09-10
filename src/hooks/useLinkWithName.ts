import { findLinkWithName } from '@dg/api/parsers';
import type { Link as LinkProps } from '@dg/api/types/generated/contentfulApi.generated';
import useData from '@dg/api/useData';
import { useMemo } from 'react';

/**
 * Using the header or footer links, finds a link with a given name. Can override the
 * title or url by passing an override
 */
const useLinkWithName = (name: string, override?: Pick<LinkProps, 'title' | 'url'>) => {
  const { data: footerLinks } = useData('footer');

  const allLinks = useMemo(() => [...(footerLinks ?? [])], [footerLinks]);

  const foundLink = useMemo(() => findLinkWithName(allLinks, name), [allLinks, name]);
  return override && foundLink ? { ...foundLink, ...override } : foundLink;
};

export default useLinkWithName;
