import { ScrollIndicatorContext } from 'components/ScrollIndicatorContext';
import { ScrollUpIndicator } from 'components/ScrollUpIndicator';
import { useContext } from 'react';
import { SxProps, Theme, Box } from '@mui/material';
import { Section } from 'ui/Section';
import { Logo } from './Logo';
import { Container } from '../ui/Container';

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

function Group({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="ul"
      sx={{
        display: 'flex',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}
    >
      {children}
    </Box>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="li"
      sx={{
        display: 'inline-block',
        margin: 0,
        paddingY: 2,
        paddingX: 1,
      }}
    >
      {children}
    </Box>
  );
}

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
          <Container
            component="nav"
            sx={{
              justifyContent: 'space-between',
              display: 'flex',
            }}
          >
            <Group>
              <Item>
                <Logo />
              </Item>
              <Item>
                <ScrollUpIndicator />
              </Item>
            </Group>
          </Container>
        </Box>
      </header>
    </Section>
  );
}
