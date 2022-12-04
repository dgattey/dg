import React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

export type Props = Pick<React.ComponentProps<'div'>, 'className'> &
  (
    | {
        /**
         * Called when the control itself is clicked
         */
        onClick: (() => void) | undefined;

        /**
         * Children need to be defined and not be clickable
         */
        children: React.ReactElement<{ onClick?: never }> | string | boolean;
      }
    | {
        /**
         * Children each provide their own onClick
         */
        onClick?: never;

        /**
         * If children is an array, they're each responsible for passing their own onClicks!
         */
        children: Array<React.ReactElement<{ onClick: () => void }>>;
      }
  );

// Applied to anything interactive
const INTERACTIVE_STYLE = css`
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color);
  background-color: var(--background-color);
  transition: color var(--transition), background-color var(--transition);
  :hover {
    background-color: var(--secondary-hover);
    color: var(--secondary-inverse);
  }
`;

// Pads each item and uses onClick from child
const ItemWrapper = styled.div`
  ${INTERACTIVE_STYLE}
`;

// One single control
const Container = styled.div<{ $isSingular?: boolean }>`
  position: relative;
  overflow: hidden;
  display: flex;
  width: 100%;
  border-radius: var(--border-radius);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  line-height: 1;
  ${({ $isSingular }) =>
    $isSingular
      ? css`
          :before {
            content: '';
            display: block;
            padding-top: 100%;
          }
          ${INTERACTIVE_STYLE}
        `
      : css``}
`;

/**
 * This is what surrounds any control to contain it, automatically responding
 * to the color scheme. Circular and same width/height. Returns either a single
 * container, or a larger container with multiple children in it if necessary.
 */
function ControlContainer({ onClick, children, className }: Props) {
  if (!Array.isArray(children)) {
    return (
      <Container $isSingular onClick={onClick} className={className}>
        {children}
      </Container>
    );
  }

  return (
    <Container className={className}>
      {React.Children.map(children, (child) => (
        <ItemWrapper onClick={child.props.onClick}>{child}</ItemWrapper>
      ))}
    </Container>
  );
}

export default ControlContainer;
