import useData from 'api/useData';
import styled from 'styled-components';
import Link from './Link';

const SpacedHeader = styled.header`
  margin-top: var(--block-spacing-vertical);
`;

/**
 * Creates the site header component - shows header links
 */
const Header = () => {
  const { data: headerLinks } = useData('siteHeader');
  const linkElements = headerLinks && (
    <ul>
      {headerLinks.map((link) => (
        <li key={link.url}>
          <Link {...link} />
        </li>
      ))}
    </ul>
  );

  return (
    <SpacedHeader>
      <nav>
        <ul>
          <li>
            <strong>Dylan Gattey</strong>
          </li>
        </ul>
        {linkElements}
      </nav>
    </SpacedHeader>
  );
};

export default Header;
