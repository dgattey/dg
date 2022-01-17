import useShowScrollIndicator from 'hooks/useShowScrollIndicator';
import styled, { css } from 'styled-components';
import ScrollUpIndicator from './ScrollUpIndicator';
import Stack from './Stack';

/**
 * Aspect ratio'd 1:1 circle. Big, bold, and squished text for use as
 * logo, with Inter font (loaded on all pages via document.tsx). Has
 * background on scroll + scales down a bit.
 */
const LogoText = styled.article<{ $isScrolled: boolean }>`
  --padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 2.5rem;
  font-variation-settings: 'wght' 800;
  letter-spacing: -0.12em;
  color: var(--logo-color);

  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1em;
  border-radius: 50%;
  vertical-align: middle;
  line-height: 1;
  margin: var(--padding) 0;
  padding: var(--padding);
  pointer-events: auto;
  transform-origin: top left;
  transition: box-shadow var(--transition), transform var(--transition),
    background-color var(--transition);
  transform: translateX(calc(-1 * var(--padding)));
  will-change: transform;

  &:before {
    content: '';
    float: left;
    width: auto;
    padding-bottom: 100%;
  }

  ${({ $isScrolled }) =>
    $isScrolled
      ? css`
          transform: scale(0.75);
        `
      : css`
          background: var(--background-color);
          box-shadow: none;
        `}
`;

const SpacedScrollIndicator = styled(ScrollUpIndicator)<{ $isScrolled: boolean }>`
  ${({ $isScrolled }) =>
    $isScrolled &&
    css`
      transform: translateY(-0.5rem);
      &:hover {
        transform: scale(1.05) translateY(-0.5rem);
      }
    `}
`;

/**
 * Logo + scroll to top button, with certain changes that happen on
 * scroll.
 */
const Logo = () => {
  const isScrolled = useShowScrollIndicator();
  return (
    <Stack $gap="1rem" $alignItems="center" $justifyContent="spaceAround">
      <LogoText $isScrolled={isScrolled} aria-hidden>
        dg.
      </LogoText>
      <SpacedScrollIndicator $isScrolled={isScrolled} />
    </Stack>
  );
};

export default Logo;
