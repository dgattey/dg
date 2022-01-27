import useData from 'api/useData';
import React from 'react';
import styled from 'styled-components';
import Link from './Link';
import Logo from './Logo';

interface Props {
  /**
   * If provided, sets the ref on the `header` element for
   * sizing/whatever else is needed
   */
  headerRef?: React.RefObject<HTMLDivElement>;
}

// Makes the header bar sticky and not responsive to user events by default
const StickyContainer = styled.section`
  position: sticky;
  top: 0;
  z-index: 4;
  pointer-events: none;
`;

const LogoHolder = styled.li`
  padding: 0;
`;

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
const Header = ({ headerRef }: Props) => {
  const { data: headerLinks } = useData('header');
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
    <StickyContainer className="container">
      <header ref={headerRef}>
        <nav>
          <ul>
            <LogoHolder>
              <Logo />
            </LogoHolder>
          </ul>
          {headerLinkElements}
        </nav>
      </header>
    </StickyContainer>
  );
};

export default Header;
