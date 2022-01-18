import { useContext } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import styled, { css } from 'styled-components';
import ScrollIndicatorContext from './ScrollIndicatorContext';
import Stack from './Stack';

type Props = Pick<React.ComponentProps<'div'>, 'className'>;

/**
 * Arrow up to show scrollability. Fades in, and is on own layer to
 * prevent jittering as it fades in.
 */
const Indicator = styled(Stack)<{ $isVisible: boolean }>`
  position: relative;
  font-weight: 700;
  font-size: var(--font-size-small);
  opacity: 0;
  transform: translateY(1.5em);
  color: var(--contrast);
  transition: opacity var(--transition), transform var(--transition), color var(--transition);
  will-change: transform;
  :hover {
    color: var(--contrast-overlay-inverse);
    transform: scale(1.05);
  }

  :before {
    --padding: 1em;
    content: '';
    z-index: -1;
    position: absolute;
    margin-left: calc(-1 * var(--padding));
    height: calc(100% + var(--padding));
    width: calc(100% + var(--padding) * 2);
    border-radius: var(--border-radius);
    box-shadow: var(--card-box-shadow);
    transition: background-color var(--transition);
    background: var(--background-color);
  }
  :hover:before {
    background: var(--primary);
  }

  ${({ $isVisible }) =>
    $isVisible &&
    css`
      pointer-events: auto;
      cursor: pointer;
      transform: initial;
      opacity: 1;
    `}
`;

/**
 * Shows an indicator to scroll to the top of the page, meant to appear
 * floating over everything else
 */
const ScrollUpIndicator = ({ className }: Props) => {
  const isVisible = useContext(ScrollIndicatorContext);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <Indicator
      className={className}
      onClick={scrollToTop}
      $isVisible={isVisible}
      $gap="0.5rem"
      $alignItems="center"
    >
      To Top
      <FiArrowUp />
    </Indicator>
  );
};

export default ScrollUpIndicator;
