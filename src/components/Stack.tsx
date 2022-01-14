import styled, { css, CSSProperties } from 'styled-components';

/**
 * Stacks content - has a few properities built in as props for convenience
 */
const Stack = styled.div<{
  $isVertical?: boolean;
  $gap?: string;
  $alignItems?: CSSProperties['alignItems'];
  $justifyContent?: CSSProperties['justifyContent'];
}>`
  display: flex;
  ${({ $isVertical }) =>
    $isVertical &&
    css`
      flex-direction: column;
    `};
  ${({ $alignItems }) =>
    $alignItems &&
    css`
      align-items: ${$alignItems};
    `};
  ${({ $justifyContent }) =>
    $justifyContent &&
    css`
      justify-content: ${$justifyContent};
    `};
  ${({ $gap }) =>
    $gap &&
    css`
      gap: ${$gap};
    `};
`;

export default Stack;
