import { ScrollIndicatorContext } from 'components/ScrollIndicatorContext';
import { ScrollUpButton } from 'components/ScrollUpButton';
import { useContext } from 'react';
import { SxProps, Theme, Box } from '@mui/material';
import { Section } from 'ui/Section';
import { Nav, NavGroup, NavItem } from 'ui/Nav';
import { ColorSchemeToggle } from 'components/ColorSchemeToggle';
import { Logo } from './Logo';

interface Props {
  /**
   * If provided, sets the ref on the `header` element for
   * sizing/whatever else is needed
   */
  headerRef?: React.RefObject<HTMLDivElement>;
}

// Makes the header bar sticky and not responsive to user events by default
const stickyContainerSx: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  maxWidth: 'unset',
};

/**
 * Creates the site header component. It's a bar that spans across the
 * page and shows a logo + header links if they exist.
 */
export function Header({ headerRef }: Props) {
  const isScrolled = useContext(ScrollIndicatorContext);
  return (
    <Section sx={stickyContainerSx}>
      <header ref={headerRef}>
        <Box
          sx={(theme) => ({
            backgroundColor: isScrolled
              ? theme.palette.background.paper
              : theme.palette.background.default,
            boxShadow: isScrolled ? theme.extraShadows.card.hovered : 'none',
            willChange: 'box-shadow, background-color',
            ':root[data-animations-enabled=true] &': {
              transition: theme.transitions.create(['background-color', 'box-shadow']),
            },
          })}
        >
          <Nav>
            <NavGroup>
              <NavItem>
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
