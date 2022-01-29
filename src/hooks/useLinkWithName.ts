import { findLinkWithName } from 'api/parsers';
import useData from 'api/useData';
import { useMemo } from 'react';

/**
 * Using the header or footer links, finds a link with a given name.
 */
const useLinkWithName = (name: string) => {
  const { data: headerLinks } = useData('header');
  const { data: footerLinks } = useData('footer');

  const allLinks = useMemo(
    () => [...(headerLinks ?? []), ...(footerLinks ?? [])],
    [footerLinks, headerLinks],
  );

  const foundLink = useMemo(() => findLinkWithName(allLinks, name), [allLinks, name]);
  return foundLink;
};

export default useLinkWithName;
