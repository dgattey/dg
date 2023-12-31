import { useContext } from 'react';
import { Box, alpha } from '@mui/material';
import { Section } from 'ui/core/Section';
import { Nav, NavGroup, NavItem } from 'ui/core/Nav';
import type { SxProps } from 'ui/theme';
import { useColorScheme } from 'ui/theme/useColorScheme';
import { ScrollIndicatorContext } from 'ui/core/ScrollIndicatorContext';
import { ScrollUpButton } from 'ui/dependent/ScrollUpButton';
import { ColorSchemeToggle } from 'ui/core/ColorSchemeToggle';
import { Logo } from './Logo';

type HeaderProps = {
  /**
   * If provided, sets the ref on the `header` element for
   * sizing/whatever else is needed
   */
  headerRef?: React.RefObject<HTMLDivElement>;
};

// Makes the header bar sticky and not responsive to user events by default
const stickyContainerSx: SxProps = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  maxWidth: 'unset',
};

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
export function Header({ headerRef }: HeaderProps) {
  const isScrolled = useContext(ScrollIndicatorContext);
  const { colorScheme } = useColorScheme();
  return (
    <Section sx={stickyContainerSx}>
      <header ref={headerRef}>
        <Box
          sx={(theme) => ({
            backdropFilter: 'blur(16px) saturate(160%) contrast(110%)',
            backgroundColor: isScrolled
              ? alpha(theme.palette.card.background, 0.85)
              : theme.vars.palette.background.default,
            boxShadow: isScrolled ? theme.vars.extraShadows.card.hovered : 'none',
            willChange: 'box-shadow, background-color',
            transition: colorScheme.isInitialized
              ? theme.transitions.create(['background-color', 'box-shadow'])
              : undefined,
          })}
        >
          <Nav>
            <NavGroup>
              <NavItem variant="body2">
                <Logo />
              </NavItem>
              <NavItem>
                <ScrollUpButton />
              </NavItem>
            </NavGroup>
            <NavGroup>
              <NavItem>
                <ColorSchemeToggle />
              </NavItem>
            </NavGroup>
          </Nav>
        </Box>
      </header>
    </Section>
  );
}
