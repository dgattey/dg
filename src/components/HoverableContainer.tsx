import styled, { css } from 'styled-components';

/**
 * Adds a transition and transform up on hover. Meant for use with images.
 */
const HoverableContainer = styled.div<{ isHovered: boolean }>`
  ${({ isHovered }) => css`
    transition: transform var(--transition);
    transform: scale(${isHovered ? 1.05 : 1});
  `}
`;

export default HoverableContainer;
