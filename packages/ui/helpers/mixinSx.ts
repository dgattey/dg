import { isNotNullish } from 'shared-core/helpers/typeguards';
import type { SxProps } from '../theme';

/**
 * Used to _safely_ mix together multiple SxProps objects.
 */
export function mixinSx(...sxes: Array<SxProps | undefined>): SxProps {
  return sxes.filter(isNotNullish).flat();
}
