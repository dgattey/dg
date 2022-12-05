import React from 'react';
import styled from '@emotion/styled';
import { Logo } from './Logo';

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
  z-index: 1;
  pointer-events: none;
`;

const LogoHolder = styled.li`
  padding: 0;
`;

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
export function Header({ headerRef }: Props) {
  return (
    <StickyContainer className="container">
      <header ref={headerRef}>
        <nav>
          <ul>
            <LogoHolder>
              <Logo />
            </LogoHolder>
          </ul>
        </nav>
      </header>
    </StickyContainer>
  );
}
