import { css } from 'styled-components';

/**
 * Returns styling to use to truncate to a specified number of
 * lines. Works on any browser, despite the webkit prefixes.
 */
const truncated = (numberOfLines: number) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${numberOfLines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default truncated;
