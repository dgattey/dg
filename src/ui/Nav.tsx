import { Box, Container, Typography } from '@mui/material';
import { mixinSx } from './helpers/mixinSx';

/**
 * This group of items in a nav will group items together.
 * Condenses to a full width group on mobile.
 */
export function NavGroup({ sx, children, ...props }: React.ComponentProps<typeof Box>) {
  return (
    <Box
      component="ul"
      {...props}
      sx={mixinSx(
        (theme) => ({
          display: 'flex',
          alignItems: 'center',
          margin: 0,
          padding: 0,
          listStyle: 'none',
          flexWrap: 'wrap',
          [theme.breakpoints.down('xs')]: {
            flexGrow: 1,
            justifyContent: 'space-between',
          },
        }),
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
    <Typography
      variant="body2"
      component="li"
      {...props}
      sx={mixinSx(
        (theme) => ({
          display: 'inline-block',
          margin: 0,
          paddingY: 2,
          paddingX: 1,
          ':first-of-type': { paddingLeft: 0 },
          ':last-of-type': { paddingRight: 0 },

          [theme.breakpoints.down('md')]: {
            paddingX: 0.5,
          },
          [theme.breakpoints.down('sm')]: {
            paddingX: 0.25,
          },
        }),
        sx,
      )}
    >
      {children}
    </Typography>
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
