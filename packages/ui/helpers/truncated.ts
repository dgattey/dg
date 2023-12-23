import type { SxProps } from '../theme';

/**
 * Returns styling to use to truncate to a specified number of
 * lines. Works on any browser, despite the webkit prefixes.
 */
export const truncated = (numberOfLines: number): SxProps => ({
  display: '-webkit-box',
  WebkitLineClamp: numberOfLines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
