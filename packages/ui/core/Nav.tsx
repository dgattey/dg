import type { BoxProps, ContainerProps, TypographyProps } from '@mui/material';
import { Box, Container, Typography } from '@mui/material';
import { mixinSx } from '../helpers/mixinSx';

/**
 * This group of items in a nav will group items together.
 * Condenses to a full width group on mobile.
 */
export function NavGroup({ sx, children, ...props }: BoxProps) {
  return (
    <Box
      component="ul"
      {...props}
      sx={mixinSx(
        (theme) => ({
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          listStyle: 'none',
          margin: 0,
          padding: 0,
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
export function NavItem({ sx, children, ...props }: TypographyProps) {
  return (
    <Typography
      component="li"
      variant="caption"
      {...props}
      sx={mixinSx(
        (theme) => ({
          ':first-of-type': { paddingLeft: 0 },
          ':last-of-type': { paddingRight: 0 },
          display: 'inline-block',
          margin: 0,
          paddingX: 1,
          paddingY: 2,

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
export function Nav({ sx, children, ...props }: ContainerProps) {
  return (
    <Container
      component="nav"
      fixed={true}
      {...props}
      sx={mixinSx(
        {
          display: 'flex',
          justifyContent: 'space-between',
        },
        sx,
      )}
    >
      {children}
    </Container>
  );
}
