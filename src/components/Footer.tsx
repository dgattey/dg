import useData from 'api/useData';
import Link from 'next/link';
import styled from 'styled-components';

const IconLink = styled.a``;

/**
 * Creates the site footer component - shows version data + copyright
 */
const Footer = () => {
  const { data: version } = useData('version');
  const { data: siteFooter } = useData('siteFooter');
  const { textLinks, iconLinks } = siteFooter ?? {};
  return (
    <footer>
      <nav>
        <ul>
          <li>© {new Date().getFullYear()} Dylan Gattey</li>
          <li>{version}</li>
        </ul>
        <ul>
          {textLinks &&
            textLinks.map(
              ({ title, url }) =>
                url &&
                title && (
                  <li key={url}>
                    <Link href={url}>{title}</Link>
                  </li>
                ),
            )}
          {iconLinks &&
            iconLinks.map(
              ({ url, icon: iconHtml }) =>
                url &&
                iconHtml && (
                  <li key={url}>
                    <Link href={url} passHref>
                      <IconLink dangerouslySetInnerHTML={{ __html: iconHtml }} />
                    </Link>
                  </li>
                ),
            )}
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
