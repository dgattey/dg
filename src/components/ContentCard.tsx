import type { Link } from 'api/types/generated/contentfulApi.generated';
import React, { ReactElement, useState } from 'react';
import styled, { css } from 'styled-components';
import { cardSize, GRID_ANIMATION_DURATION } from './ContentGrid';
import ContentWrappingLink from './ContentWrappingLink';
import Stack from './Stack';

// Special requirements for children here
type Children = ReactElement | null | undefined;

type Props = Pick<React.ComponentProps<'article'>, 'className' | 'onMouseOver' | 'onMouseOut'> & {
  /**
   * How many columns the card spans, defaults to 1
   */
  horizontalSpan?: number;

  /**
   * How many rows the card spans, defaults to 1
   */
  verticalSpan?: number;

  /**
   * If anything is specified here, it appears in an overlay
   * that slides in on hover
   */
  overlay?: {
    /**
     * Usually just text for a title
     */
    hiddenUntilHover: React.ReactNode;

    /**
     * Usually just an icon that's always visible as an
     * indicator
     */
    alwaysVisible: React.ReactNode;
  };

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
};

type LinkWrappedChildrenProps = Pick<Props, 'link' | 'children'> & {
  /**
   * If the card expands when clicked
   */
  expandOnClick: boolean;

  /**
   * The element that overlays the card
   */
  overlayContents: JSX.Element | null;
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

// Animates left on hover, as the container animates right, so it appears to stay in place as in comes in
const HiddenElement = styled.span`
  transition: opacity var(--transition), transform var(--transition);
  opacity: 0;
  transform-origin: left;
  transform: translateX(100%);
`;

// A stack for an overlay that animates in from slightly offscreen left when hovered
export const OverlayStack = styled(Stack).attrs({ $alignItems: 'center', $gap: '8px' })`
  overflow: hidden;
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: var(--contrast-overlay);
  color: var(--contrast-overlay-inverse);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.16);
  z-index: 1;

  transition: transform var(--transition);
  transform: translateX(calc((var(--border-radius) / 2) - 100%));
  &:hover {
    transform: initial;
    ${HiddenElement} {
      opacity: 1;
      transform: initial;
    }
  }
`;

// Card component that spans an arbitrary number of rows/cols
const Card = styled.article<CardProps>`
  position: relative;
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
        ${OverlayStack} {
          transform: initial;
        }
        ${HiddenElement} {
          opacity: 1;
          transform: initial;
        }
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
        height: ${cardSize($vSpan)};
      }
      grid-row: span ${$vSpan};
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
    <ContentWrappingLink link={link}>
      {overlayContents}
      {children}
    </ContentWrappingLink>
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
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandOnClick = !!onExpansion;

  // Swaps the expansion variable and calls the user callback
  const toggleExpansion = onExpansion
    ? () => {
        setIsExpanded(!isExpanded);
        onExpansion(!isExpanded);
      }
    : undefined;

  const overlayContents = overlay ? (
    <OverlayStack>
      <HiddenElement>{overlay.hiddenUntilHover}</HiddenElement>
      {overlay.alwaysVisible}
    </OverlayStack>
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
