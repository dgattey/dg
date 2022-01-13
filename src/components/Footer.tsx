import useData from 'api/useData';
import Link from 'next/link';
import styled from 'styled-components';

const IconLink = styled.a``;

/**
 * Creates the site footer component - shows version data + copyright
 */
const Footer = () => {
  const { data: version } = useData('version');
  const { data: footerLinks } = useData('siteFooter');
  const listedLinkElements = footerLinks?.map(
    ({ title, url, icon: iconHtml }) =>
      url &&
      title && (
        <li key={url}>
          {iconHtml ? (
            <Link href={url} passHref>
              <IconLink dangerouslySetInnerHTML={{ __html: iconHtml }} />
            </Link>
          ) : (
            <Link href={url}>{title}</Link>
          )}
        </li>
      ),
  );
  return (
    <footer>
      <nav>
        <ul>
          <li>© {new Date().getFullYear()} Dylan Gattey</li>
          <li>{version}</li>
        </ul>
        <ul>{listedLinkElements}</ul>
      </nav>
    </footer>
  );
};

export default Footer;
