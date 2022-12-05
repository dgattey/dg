import { SxProps, Theme } from '@mui/material';
import isNotNullish from 'helpers/isNotNullish';

/**
 * Used to _safely_ mix together multiple SxProps objects.
 */
export function mixinSx(...sxes: Array<SxProps<Theme> | undefined>): SxProps<Theme> {
  return sxes.filter(isNotNullish).flat();
}
