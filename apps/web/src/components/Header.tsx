import { Box } from '@mui/material';
import { useContext } from 'react';
import { ColorSchemeToggle } from 'ui/core/ColorSchemeToggle';
import { Nav, NavGroup, NavItem } from 'ui/core/Nav';
import { ScrollIndicatorContext } from 'ui/core/ScrollIndicatorContext';
import { Section } from 'ui/core/Section';
import { ScrollUpButton } from 'ui/dependent/ScrollUpButton';
import type { SxProps } from 'ui/theme';
import { useColorScheme } from 'ui/theme/useColorScheme';
import { Logo } from './Logo';

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
  const isScrolled = useContext(ScrollIndicatorContext);
  const { colorScheme } = useColorScheme();
  return (
    <Section sx={stickyContainerSx}>
      <header ref={headerRef}>
        <Box
          sx={(theme) => ({
            backdropFilter: 'blur(16px) saturate(160%) contrast(110%)',
            backgroundColor: isScrolled
              ? `hsl(from ${theme.vars.palette.background.paper} h s l / 0.85)`
              : theme.vars.palette.background.default,
            boxShadow: isScrolled ? theme.vars.extraShadows.card.hovered : 'none',
            transition: colorScheme.isInitialized
              ? theme.transitions.create(['background-color', 'box-shadow'])
              : undefined,
            willChange: 'box-shadow, background-color',
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
