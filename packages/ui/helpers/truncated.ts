import type { SxObject } from '../theme';

/**
 * Single-line ellipsis truncation. Cuts mid-word rather than `-webkit-line-clamp`,
 * which drops any word that doesn't fit whole and leaves a gap before its ellipsis.
 */
export const truncated = (): SxObject => ({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
