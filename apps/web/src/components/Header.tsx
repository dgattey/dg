import { ColorSchemeToggle } from 'ui/core/ColorSchemeToggle';
import { Nav, NavGroup, NavItem } from 'ui/core/Nav';
import { Section } from 'ui/core/Section';
import type { SxProps } from 'ui/theme';
import { Logo } from './Logo';
import { ScrollIndicatorButton } from './ScrollIndicatorButton';

type HeaderProps = {
  /**
   * If provided, sets the ref on the `header` element for
   * sizing/whatever else is needed
   */
  headerRef?: React.RefObject<HTMLDivElement | null>;
};

// Makes the header bar sticky and not responsive to user events by default
const stickyContainerSx: SxProps = {
  maxWidth: 'unset',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
export function Header({ headerRef }: HeaderProps) {
  return (
    <Section sx={stickyContainerSx}>
      <header ref={headerRef}>
        <Nav>
          <NavGroup>
            <NavItem variant="body2">
              <Logo />
            </NavItem>
            <NavItem>
              <ScrollIndicatorButton />
            </NavItem>
          </NavGroup>
          <NavGroup>
            <NavItem>
              <ColorSchemeToggle />
            </NavItem>
          </NavGroup>
        </Nav>
      </header>
    </Section>
  );
}
