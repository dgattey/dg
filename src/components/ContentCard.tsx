import type { Link } from '@dg/api/types/generated/contentfulApi.generated';
import truncated from '@dg/helpers/truncated';
import { GRID_ANIMATION_DURATION } from '@dg/hooks/useGridAnimation';
import { ReactElement, useState } from 'react';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { cardSize } from './ContentGrid';
import ContentWrappingLink from './ContentWrappingLink';

// Special requirements for children here
type Children = ReactElement | null | undefined;

export type Props = Pick<
  React.ComponentProps<'article'>,
  'className' | 'onMouseOver' | 'onMouseOut'
> & {
  /**
   * How many columns the card spans, defaults to 1
   */
  horizontalSpan?: number;

  /**
   * How many rows the card spans, defaults to 1
   */
  verticalSpan?: number;

  /**
   * If anything is specified here, it appears in an overlay on top of the card
   */
  overlay?: React.ReactNode;

  /**
   * If provided, a link to follow upon click anywhere on the
   * card
   */
  link?: Link;

  /**
   * If the card should expand to full width when clicked,
   * provide a function that gets called when that happens.
   */
  onExpansion?: (isExpanded: boolean) => void;

  /**
   * Children must exist!
   */
  children: Children;

  /**
   * Function that starts an animation when the card is expanded
   * and removes the animation once finished.
   */
  turnOnAnimation?: () => void;
};

type LinkWrappedChildrenProps = Pick<Props, 'link' | 'children'> & {
  /**
   * If the card expands when clicked
   */
  expandOnClick: boolean;

  /**
   * The element that overlays the card
   */
  overlayContents: React.ReactNode;
};

interface CardProps {
  /**
   * The number of columns to span horizontally
   */
  $hSpan: number;

  /**
   * The number of columns to span vertically. Used to calculate
   * height as well, adding space for the grid gap as needed.
   * If missing, lets the item auto-size.
   */
  $vSpan: number | null;

  /**
   * If the card is visually clickable
   */
  $isClickable: boolean;

  /**
   * If the card expands
   */
  $isExpandable: boolean;
}

// A stack for an overlay that animates in from slightly offscreen left when hovered
export const OverlayContainer = styled.article`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  background-color: var(--card-background-color);
  color: var(--color);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.16);
  z-index: 1;
`;

const OverlayEntry = styled.h5`
  --typography-spacing-vertical: 0.25em;
  ${truncated(1)}
  height: calc(var(--line-height) * 1rem);
`;

// Card component that spans an arbitrary number of rows/cols
const Card = styled.article<CardProps>`
  position: relative;
  overflow: hidden;
  border: var(--border-width) solid var(--secondary-focus);
  margin: inherit;
  padding: 0;
  will-change: transform;
  transition: width ${GRID_ANIMATION_DURATION}ms ease, height ${GRID_ANIMATION_DURATION}ms ease,
    box-shadow var(--transition), border-color var(--transition);

  /* Unfortunately required for the images to animate size correctly. Look into changing this! */
  & > div {
    transform: none !important;
  }
  ${({ $isClickable, $isExpandable }) =>
    ($isClickable || $isExpandable) &&
    css`
      cursor: pointer;
      &:hover {
        box-shadow: var(--card-hovered-box-shadow);
      }
    `}

  ${({ $hSpan }) =>
    $hSpan < 3
      ? css`
          @media (min-width: 768px) {
            width: ${cardSize($hSpan)};
            grid-column: span ${$hSpan};
          }
        `
      : css`
          grid-column: 1 / -1;
        `}
  ${({ $vSpan }) =>
    $vSpan &&
    css`
      @media (min-width: 768px) {
        grid-row: span ${$vSpan};
        height: ${cardSize($vSpan)};
      }
    `}
`;

/**
 * Deals with the messiness of safely wrapping children and links so there's
 * only ever one element that returns from this.
 */
const LinkWrappedChildren = ({
  children,
  link,
  overlayContents,
  expandOnClick,
}: LinkWrappedChildrenProps) => {
  const safelyWrappedChildren = !overlayContents ? (
    children
  ) : (
    <div>
      {overlayContents}
      {children}
    </div>
  );
  return link && !expandOnClick ? (
    <div>
      {overlayContents}
      <ContentWrappingLink link={link}>{children}</ContentWrappingLink>
    </div>
  ) : (
    safelyWrappedChildren ?? null
  );
};

/**
 * Wraps content in a card for the content grid
 */
const ContentCard = ({
  horizontalSpan,
  verticalSpan,
  children,
  className,
  overlay,
  link,
  onExpansion,
  onMouseOver,
  onMouseOut,
  turnOnAnimation,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandOnClick = !!onExpansion;

  // Swaps the expansion variable and calls the user callback
  const toggleExpansion = onExpansion
    ? () => {
        turnOnAnimation?.();
        setIsExpanded(!isExpanded);
        onExpansion(!isExpanded);
      }
    : undefined;

  const overlayContents = overlay ? (
    <OverlayContainer>
      <OverlayEntry>{overlay}</OverlayEntry>
    </OverlayContainer>
  ) : null;

  return (
    <Card
      className={className}
      $hSpan={isExpanded ? 3 : horizontalSpan ?? 1}
      $vSpan={isExpanded ? null : verticalSpan ?? 1}
      $isClickable={!!link}
      $isExpandable={expandOnClick}
      onClick={toggleExpansion}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <LinkWrappedChildren
        expandOnClick={expandOnClick}
        overlayContents={overlayContents}
        link={link}
      >
        {children}
      </LinkWrappedChildren>
    </Card>
  );
};

export default ContentCard;
