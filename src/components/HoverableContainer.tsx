import styled from '@emotion/styled';
import { css } from '@emotion/react';

/**
 * Adds a transition and transform up on hover. Meant for use with images.
 */
export const HoverableContainer = styled.div<{ isHovered: boolean }>`
  ${({ isHovered }) => css`
    transition: transform var(--transition);
    transform: scale(${isHovered ? 1.05 : 1});
  `}
`;
