import { Box } from '@mui/material';
import { SxProps } from 'ui/theme';
import { mixinSx } from './helpers/mixinSx';

export const sectionSx: SxProps = (theme) => ({
  [theme.breakpoints.up('sm')]: {
    marginBottom: 5.3125,
  },
  [theme.breakpoints.up('md')]: {
    marginBottom: 6.375,
  },
  [theme.breakpoints.up('lg')]: {
    marginBottom: 7.4375,
  },
  [theme.breakpoints.up('xl')]: {
    marginBottom: 8.5,
  },
});

/**
 * Large, semantically meaningful section on a page, with padding.
 */
export function Section({ sx, ...props }: React.ComponentProps<typeof Box>) {
  return <Box component="section" {...props} sx={mixinSx(sectionSx, sx)} />;
}
