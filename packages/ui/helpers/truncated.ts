import type { SxObject } from '../theme';

/**
 * Returns styling to use to truncate to a specified number of
 * lines. Works on any browser, despite the webkit prefixes.
 */
export const truncated = (numberOfLines: number): SxObject => ({
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: numberOfLines,
});
