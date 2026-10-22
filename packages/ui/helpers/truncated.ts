import type { SxObject } from '../theme';

/**
 * Returns styling to use to truncate to a specified number of
 * lines. Works on any browser, despite the webkit prefixes.
 *
 * A single line cuts mid-word instead of clamping, because a clamp drops any
 * word that doesn't fit whole and leaves a gap before its ellipsis.
 */
export const truncated = (numberOfLines: number): SxObject =>
  numberOfLines === 1
    ? {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }
    : {
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: numberOfLines,
      };
