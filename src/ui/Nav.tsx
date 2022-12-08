import { Box, Container } from '@mui/material';
import { mixinSx } from './helpers/mixinSx';

/**
 * This group of items in a nav will group items together
 */
export function NavGroup({ sx, children, ...props }: React.ComponentProps<typeof Box>) {
  return (
    <Box
      component="ul"
      {...props}
      sx={mixinSx(
        {
          display: 'flex',
          alignItems: 'center',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        },
        sx,
      )}
    >
      {children}
    </Box>
  );
}

/**
 * Each of these must be contained within a NavGroup
 */
export function NavItem({ sx, children, ...props }: React.ComponentProps<typeof Box>) {
  return (
    <Box
      component="li"
      {...props}
      sx={mixinSx(
        {
          display: 'inline-block',
          margin: 0,
          paddingY: 2,
          paddingX: 1,
          ':first-of-type': { paddingLeft: 0 },
          ':last-of-type': { paddingRight: 0 },
        },
        sx,
      )}
    >
      {children}
    </Box>
  );
}

/**
 * Semantic Nav, for a footer or header/etc
 */
export function Nav({ sx, children, ...props }: React.ComponentProps<typeof Container>) {
  return (
    <Container
      fixed
      component="nav"
      {...props}
      sx={mixinSx(
        {
          justifyContent: 'space-between',
          display: 'flex',
        },
        sx,
      )}
    >
      {children}
    </Container>
  );
}
