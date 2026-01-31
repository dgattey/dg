import type { BoxProps, StackProps } from '@mui/material';
import { Stack } from '@mui/material';
import type { SxObject } from '../theme';

const horizontalStackBaseSx: SxObject = { flexDirection: 'row' };

/**
 * Simple version of a horizontal stack using MUI's Box component
 */
export function HorizontalStack({
  sx,
  ...props
}: Omit<StackProps, 'sx'> & Pick<BoxProps, 'component'> & { sx?: SxObject }) {
  const mergedSx = sx ? { ...horizontalStackBaseSx, ...sx } : horizontalStackBaseSx;
  return <Stack {...props} sx={mergedSx} />;
}
