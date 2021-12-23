import useData from 'api/useData';
import Link from 'next/link';
import styled from 'styled-components';

const SpacedHeader = styled.header`
  margin-top: var(--block-spacing-vertical);
`;

/**
 * Creates the site header component - shows header links
 */
const Header = () => {
  const { data: siteHeader } = useData('siteHeader');
  const { links } = siteHeader ?? {};
  return (
    <SpacedHeader>
      <nav>
        <ul>
          <li>
            <strong>Dylan Gattey</strong>
          </li>
        </ul>
        {links && (
          <ul>
            {links.map(
              ({ title, url }) =>
                url &&
                title && (
                  <li key={url}>
                    <Link href={url}>{title}</Link>
                  </li>
                ),
            )}
          </ul>
        )}
      </nav>
    </SpacedHeader>
  );
};

export default Header;
