import styled from '@emotion/styled';
import { CSSProperties } from 'react';
import { css } from '@emotion/react';

/**
 * Stacks content - has a few properities built in as props for convenience
 */
const Stack = styled.div<{
  $isVertical?: boolean;
  $gap?: string;
  $alignItems?: CSSProperties['alignItems'];
  $justifyContent?: CSSProperties['justifyContent'];
}>(
  ({ $isVertical, $gap, $alignItems, $justifyContent }) => css`
    display: flex;
    ${$isVertical &&
    css`
      flex-direction: column;
    `}
    ${$alignItems &&
    css`
      align-items: ${$alignItems};
    `}
  ${$justifyContent &&
    css`
      justify-content: ${$justifyContent};
    `}
  ${$gap &&
    css`
      gap: ${$gap};
    `}
  `,
);

export default Stack;
