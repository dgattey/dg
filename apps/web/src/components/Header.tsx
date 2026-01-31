import { ColorSchemeToggleClient } from '@dg/ui/core/ColorSchemeToggleClient';
import { Nav, NavGroup, NavItem } from '@dg/ui/core/Nav';
import { Section } from '@dg/ui/core/Section';
import type { SxObject } from '@dg/ui/theme';
import { Logo } from './Logo';
import { ScrollIndicatorButton } from './ScrollIndicatorButton';

// Makes the header bar sticky and not responsive to user events by default
const stickyContainerSx: SxObject = {
  maxWidth: 'unset',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const navSx: SxObject = {
  columnGap: { sm: 2, xs: 1 },
};

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
export function Header() {
  return (
    <Section sx={stickyContainerSx}>
      <header data-site-header={true}>
        <Nav sx={navSx}>
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
              <ColorSchemeToggleClient initialValue="system" />
            </NavItem>
          </NavGroup>
        </Nav>
      </header>
    </Section>
  );
}
