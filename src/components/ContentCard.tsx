import type { Link } from 'api/types/generated/contentfulApi.generated';
import { truncated } from 'helpers/truncated';
import { GRID_ANIMATION_DURATION } from 'hooks/useGridAnimation';
import { useState } from 'react';
import styled from '@emotion/styled';
import { Card, SxProps, Theme } from '@mui/material';
import { mixinSx } from 'ui/helpers/mixinSx';
import { cardSize } from './ContentGrid';
import { ContentWrappingLink } from './ContentWrappingLink';

export type ContentCardProps = Pick<
  React.ComponentProps<'div'>,
  'onMouseOver' | 'onMouseOut' | 'onTouchStart'
> & {
  children?: React.ReactNode;
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
   * Function that starts an animation when the card is expanded
   * and removes the animation once finished.
   */
  turnOnAnimation?: () => void;

  sx?: SxProps<Theme>;
};

type LinkWrappedChildrenProps = Pick<ContentCardProps, 'link' | 'children'> & {
  /**
   * If the card expands when clicked
   */
  expandOnClick: boolean;

  /**
   * The element that overlays the card
   */
  overlayContents: React.ReactNode;
};

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
const cardSx: SxProps<Theme> = {
  position: 'relative',
  overflow: 'hidden',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: (theme) => theme.palette.secondary.dark,
  margin: 'inherit',
  padding: 0,
  willChange: 'transform',
  transition: (theme) =>
    theme.transitions.create(['width, height, box-shadow, border-color'], {
      duration: GRID_ANIMATION_DURATION,
      easing: theme.transitions.easing.easeInOut,
    }),
  // Unfortunately required for the images to animate size correctly. Look into changing this!
  '& > div': {
    transform: 'none !important',
  },
  '&:hover': {
    boxShadow: 'var(--card-hovered-box-shadow)',
  },
};

/**
 * Deals with the messiness of safely wrapping children and links so there's
 * only ever one element that returns from this.
 */
function LinkWrappedChildren({
  children,
  link,
  overlayContents,
  expandOnClick,
}: LinkWrappedChildrenProps) {
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
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{safelyWrappedChildren}</> ?? null
  );
}

/**
 * Wraps content in a card for the content grid
 */
export function ContentCard({
  horizontalSpan,
  verticalSpan,
  children,
  overlay,
  link,
  onExpansion,
  turnOnAnimation,
  sx,
  ...props
}: ContentCardProps) {
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

  const actualHSpan = isExpanded ? 3 : horizontalSpan ?? 1;
  const actualVSpan = isExpanded ? null : verticalSpan ?? 1;
  const isClickable = !!link || expandOnClick;

  return (
    <Card
      sx={mixinSx(
        cardSx,
        (theme) => ({
          ...(isClickable && {
            cursor: 'pointer',
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
          }),
          ...(actualHSpan < 3 && {
            [theme.breakpoints.up('md')]: {
              width: cardSize(actualHSpan),
              gridColumn: `span ${actualHSpan}`,
            },
          }),
          ...(actualVSpan && {
            [theme.breakpoints.up('md')]: {
              gridRow: `span ${actualVSpan}`,
              height: cardSize(actualVSpan),
            },
          }),
        }),
        sx,
      )}
      onClick={toggleExpansion}
      {...props}
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
}
