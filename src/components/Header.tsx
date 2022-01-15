import useData from 'api/useData';
import styled from 'styled-components';
import Link from './Link';
import Logo from './Logo';

const SpacedHeader = styled.header`
  margin-top: var(--spacing);
`;

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
const Header = () => {
  const { data: headerLinks } = useData('siteHeader');
  const headerLinkElements = headerLinks && (
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
            <Logo />
          </li>
        </ul>
        {headerLinkElements}
      </nav>
    </SpacedHeader>
  );
};

export default Header;
