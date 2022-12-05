import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ScrollIndicatorContext } from 'components/ScrollIndicatorContext';
import { ScrollUpIndicator } from 'components/ScrollUpIndicator';
import { useContext } from 'react';
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
  max-width: unset;
`;

const Background = styled.div<{ isScrolled: boolean }>(
  ({ isScrolled }) => css`
    background-color: ${isScrolled ? 'var(--header-background-color)' : 'var(--background-color)'};
    box-shadow: ${isScrolled ? 'var(--card-hovered-box-shadow)' : 'none'};
    transition: background-color var(--transition), box-shadow var(--transition);
    will-change: box-shadow, background-color;
  `,
);

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
export function Header({ headerRef }: Props) {
  const isScrolled = useContext(ScrollIndicatorContext);
  return (
    <StickyContainer>
      <header ref={headerRef}>
        <Background isScrolled={isScrolled}>
          <nav className="container">
            <ul>
              <li>
                <Logo />
              </li>
              <li>
                <ScrollUpIndicator />
              </li>
            </ul>
          </nav>
        </Background>
      </header>
    </StickyContainer>
  );
}
