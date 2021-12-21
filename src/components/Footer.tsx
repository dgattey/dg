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
      <p>
        © {new Date().getFullYear()} Dylan Gattey | {version} |{' '}
        {textLinks &&
          textLinks.map(
            ({ title, url }) =>
              url &&
              title && (
                <Link key={url} href={url}>
                  {title}
                </Link>
              ),
          )}
        {iconLinks &&
          iconLinks.map(
            ({ url, icon: iconHtml }) =>
              url &&
              iconHtml && (
                <Link key={url} href={url} passHref>
                  <IconLink dangerouslySetInnerHTML={{ __html: iconHtml }} />
                </Link>
              ),
          )}
      </p>
    </footer>
  );
};

export default Footer;
