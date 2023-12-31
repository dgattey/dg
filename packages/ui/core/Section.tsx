import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import type { SxProps } from '../theme';
import { mixinSx } from '../helpers/mixinSx';

export const sectionSx: SxProps = (theme) => ({
  [theme.breakpoints.up('sm')]: {
    marginBottom: 3,
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: 3.6,
  },
  [theme.breakpoints.up('lg')]: {
    marginBottom: 4.32,
  },
  [theme.breakpoints.up('xl')]: {
    marginBottom: 5.184,
  },
});

/**
 * Large, semantically meaningful section on a page, with padding.
 */
export function Section({ sx, ...props }: BoxProps) {
  return <Box component="section" {...props} sx={mixinSx(sectionSx, sx)} />;
}
