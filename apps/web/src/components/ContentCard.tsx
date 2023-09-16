import type { Link } from 'api/types/generated/contentfulApi.generated';
import { truncated } from 'helpers/truncated';
import { useState } from 'react';
import { Card, Theme, Typography } from '@mui/material';
import { mixinSx } from 'ui/helpers/mixinSx';
import { SxProps } from 'ui/theme';
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

  sx?: SxProps;
  overlaySx?: SxProps;
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

/**
 * Returns style props for the card component, based on
 */
function getCardSx(
  theme: Theme,
  {
    isClickable,
    horizontalSpan,
    verticalSpan,
  }: { isClickable: boolean; horizontalSpan: number; verticalSpan: number | null },
) {
  return {
    position: 'relative',
    overflow: 'hidden',
    willChange: 'transform',
    transition: `${theme.transitions.create(['width', 'height', 'box-shadow', 'border-color'])}`,

    // Unfortunately required for the images to animate size correctly. Look into changing this!
    '& > div': {
      transform: 'none !important',
    },
    ...(isClickable && {
      cursor: 'pointer',
      '&:hover': {
        borderColor: theme.vars.palette.card.border,
        boxShadow: theme.vars.extraShadows.card.hovered,
      },
    }),
    [theme.breakpoints.up('md')]: {
      ...(verticalSpan && {
        gridRow: `span ${verticalSpan}`,
        height: theme.shape.gridItemSize(verticalSpan),
      }),
      ...(horizontalSpan && {
        gridColumn: `span ${horizontalSpan}`,
        width: theme.shape.gridItemSize(horizontalSpan),
      }),
    },
  };
}

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
    <ContentWrappingLink
      link={link}
      sx={(theme) => ({
        display: 'block',
        // Prevents overflowing links
        height: '100%',
        // By default the focus ring is hidden, so pseudo element it
        '&:focus-visible:before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          outline: '-webkit-focus-ring-color auto 1px',
          borderRadius: theme.spacing(6),
          zIndex: 1,
        },
      })}
    >
      {overlayContents}
      {children}
    </ContentWrappingLink>
  ) : (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>{safelyWrappedChildren}</> ?? null
  );
}

/**
 * Overlay content if it's defined
 */
function OverlayContent({ overlay, sx }: { overlay: NonNullable<React.ReactNode>; sx?: SxProps }) {
  return (
    <Card
      sx={mixinSx(
        (theme) => ({
          position: 'absolute',
          bottom: theme.spacing(2.5),
          left: theme.spacing(2.5),
          margin: 0,
          paddingLeft: theme.spacing(1.75),
          paddingRight: theme.spacing(1.75),
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
          boxShadow: theme.vars.extraShadows.card.overlayHovered,
          '&:hover': {
            boxShadow: theme.vars.extraShadows.card.overlayHovered,
          },
          zIndex: 1,
        }),
        sx,
      )}
    >
      <Typography variant="h5" sx={truncated(1)}>
        {overlay}
      </Typography>
    </Card>
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
  overlaySx,
  ...props
}: ContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandOnClick = !!onExpansion;
  const actualHSpan = isExpanded ? 3 : horizontalSpan ?? 1;
  const actualVSpan = isExpanded ? null : verticalSpan ?? 1;
  const isClickable = !!link || expandOnClick;

  // Swaps the expansion variable and calls the user callback
  const toggleExpansion = onExpansion
    ? () => {
        turnOnAnimation?.();
        setIsExpanded(!isExpanded);
        onExpansion(!isExpanded);
      }
    : undefined;

  return (
    <Card
      sx={mixinSx(
        (theme) =>
          getCardSx(theme, { isClickable, horizontalSpan: actualHSpan, verticalSpan: actualVSpan }),
        sx,
      )}
      onClick={toggleExpansion}
      {...props}
    >
      <LinkWrappedChildren
        expandOnClick={expandOnClick}
        overlayContents={overlay && <OverlayContent overlay={overlay} sx={overlaySx} />}
        link={link}
      >
        {children}
      </LinkWrappedChildren>
    </Card>
  );
}
