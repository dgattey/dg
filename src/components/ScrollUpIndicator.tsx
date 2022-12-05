import { ArrowUp } from 'lucide-react';
import { useContext } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { ScrollIndicatorContext } from './ScrollIndicatorContext';
import { Stack } from './Stack';

/**
 * Arrow up to show scrollability. Fades in, and is on own layer to
 * prevent jittering as it fades in.
 */
const Indicator = styled(Stack)<{ $isScrolled: boolean }>`
  position: relative;
  font-weight: 700;
  font-size: var(--font-size-small);
  opacity: 0;
  transform: translateY(-200%) translateX(-25%);
  color: var(--contrast);
  border-radius: var(--border-radius);
  transition-origin: center;
  padding: 0.25em 0.75em;
  transition: opacity var(--transition), transform var(--transition), color var(--transition),
    background-color var(--transition);
  will-change: transform;

  ${({ $isScrolled }) =>
    $isScrolled &&
    css`
      pointer-events: auto;
      cursor: pointer;
      transform: initial;
      opacity: 1;
      &:hover {
        background: var(--primary);
        color: var(--contrast-overlay-inverse);
        transform: scale(1.05);
      }
    `}
`;

/**
 * Shows an indicator to scroll to the top of the page, meant to appear
 * floating over everything else
 */
export function ScrollUpIndicator() {
  const isScrolled = useContext(ScrollIndicatorContext);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <Indicator onClick={scrollToTop} $isScrolled={isScrolled} $gap="0.25rem" $alignItems="center">
      To top
      <ArrowUp size="1em" />
    </Indicator>
  );
}
