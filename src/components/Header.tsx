import { ScrollIndicatorContext } from 'components/ScrollIndicatorContext';
import { ScrollUpIndicator } from 'components/ScrollUpIndicator';
import { useContext } from 'react';
import { SxProps, Theme, Box } from '@mui/material';
import { Section } from 'ui/Section';
import { Nav, NavGroup, NavItem } from 'ui/Nav';
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
            boxShadow: isScrolled ? theme.shadows[2] : 'none',
            transition: theme.transitions.create(['background-color', 'box-shadow']),
            willChange: 'box-shadow, background-color',
          })}
        >
          <Nav>
            <NavGroup>
              <NavItem>
                <Logo />
              </NavItem>
              <NavItem>
                <ScrollUpIndicator />
              </NavItem>
            </NavGroup>
          </Nav>
        </Box>
      </header>
    </Section>
  );
}
