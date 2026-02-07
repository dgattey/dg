import type { BoxProps, ContainerProps, TypographyProps } from '@mui/material';
import { Box, Container, Typography } from '@mui/material';
import type { SxObject } from '../theme';

const navGroupBaseSx: SxObject = {
  alignItems: 'center',
  display: 'flex',
  flexGrow: { sm: 0, xs: 1 },
  flexWrap: 'wrap',
  height: '100%',
  justifyContent: { sm: 'flex-start', xs: 'space-between' },
  listStyle: 'none',
  margin: 0,
  minWidth: 0,
  padding: 0,
} as const;

const navItemBaseSx: SxObject = {
  ':first-of-type': { paddingLeft: 0 },
  ':last-of-type': { paddingRight: 0 },
  display: 'inline-block',
  margin: 0,
  minWidth: 0,
  paddingBlock: 2,
  paddingInline: { md: 1, sm: 0.5, xs: 0.25 },
} as const;

const navBaseSx: SxObject = {
  display: 'flex',
  justifyContent: 'space-between',
  paddingBlockStart: 2,
} as const;

/**
 * This group of items in a nav will group items together.
 * Condenses to a full width group on mobile.
 */
export function NavGroup({ sx, children, ...props }: Omit<BoxProps, 'sx'> & { sx?: SxObject }) {
  const mergedSx = sx ? { ...navGroupBaseSx, ...sx } : navGroupBaseSx;
  return (
    <Box component="ul" {...props} sx={mergedSx}>
      {children}
    </Box>
  );
}

/**
 * Each of these must be contained within a NavGroup
 */
export function NavItem({
  sx,
  children,
  ...props
}: Omit<TypographyProps, 'sx'> & { sx?: SxObject }) {
  const mergedSx = sx ? { ...navItemBaseSx, ...sx } : navItemBaseSx;
  return (
    <Typography component="li" variant="caption" {...props} sx={mergedSx}>
      {children}
    </Typography>
  );
}

/**
 * Semantic Nav, for a footer or header/etc
 */
export function Nav({ sx, children, ...props }: Omit<ContainerProps, 'sx'> & { sx?: SxObject }) {
  const mergedSx = sx ? { ...navBaseSx, ...sx } : navBaseSx;
  return (
    <Container component="nav" fixed={true} {...props} sx={mergedSx}>
      {children}
    </Container>
  );
}
