import { Box, SxProps, Theme } from '@mui/material';
import { mixinSx } from './helpers/mixinSx';

export const containerSx: SxProps<Theme> = (theme) => ({
  width: '100%',
  marginX: 'auto',
  paddingX: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    maxWidth: '510px',
    paddingX: 0,
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: '700px',
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: '920px',
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: '1130px',
  },
});

/**
 * Max width container with some padding on mobile
 */
export function Container(props: React.ComponentProps<typeof Box>) {
  const { sx, ...rest } = props;
  return <Box {...rest} sx={mixinSx(containerSx, sx)} />;
}
