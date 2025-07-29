import type { Theme } from '@mui/material';
import { Card, Typography } from '@mui/material';
import type { Link } from 'api/contentful/api.generated';
import { mixinSx } from '../helpers/mixinSx';
import { truncated } from '../helpers/truncated';
import type { SxProps } from '../theme';
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

  sx?: SxProps;
  overlaySx?: SxProps;
};

type LinkWrappedChildrenProps = Pick<ContentCardProps, 'link' | 'children'> & {
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
  }: {
    isClickable: boolean;
    horizontalSpan: number;
    verticalSpan: number | null;
  },
) {
  return {
    // Unfortunately required for the images to animate size correctly. Look into changing this!
    '& > div': {
      transform: 'none !important',
    },
    overflow: 'hidden',
    position: 'relative',
    transition: theme.transitions.create(['width', 'height', 'box-shadow', 'border-color']),
    willChange: 'transform',
    ...(isClickable && {
      '&:hover': {
        borderColor: theme.vars.palette.card.border,
        boxShadow: theme.vars.extraShadows.card.hovered,
      },
      cursor: 'pointer',
    }),
    [theme.breakpoints.down('md')]: {
      justifySelf: 'center',
      maxWidth: '85vw',
      minWidth: 'min(fit-content, 85vw)',
    },
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
function LinkWrappedChildren({ children, link, overlayContents }: LinkWrappedChildrenProps) {
  const safelyWrappedChildren = overlayContents ? (
    <div>
      {overlayContents}
      {children}
    </div>
  ) : (
    children
  );
  return link ? (
    <ContentWrappingLink
      link={link}
      sx={(theme) => ({
        // By default the focus ring is hidden, so pseudo element it
        '&:focus-visible:before': {
          borderRadius: theme.spacing(6),
          content: '""',
          height: '100%',
          outline: '-webkit-focus-ring-color auto 1px',
          position: 'absolute',
          width: '100%',
          zIndex: 1,
        },
        display: 'block',
        // Prevents overflowing links
        height: '100%',
      })}
    >
      {overlayContents}
      {children}
    </ContentWrappingLink>
  ) : (
    // biome-ignore lint/complexity/noUselessFragments: Needed for the undefined/null case
    <>{safelyWrappedChildren}</>
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
          '&:hover': {
            boxShadow: theme.vars.extraShadows.card.overlayHovered,
          },
          bottom: theme.spacing(2.5),
          boxShadow: theme.vars.extraShadows.card.overlayHovered,
          left: theme.spacing(2.5),
          margin: 0,
          paddingBottom: theme.spacing(1),
          paddingLeft: theme.spacing(1.75),
          paddingRight: theme.spacing(1.75),
          paddingTop: theme.spacing(1),
          position: 'absolute',
          zIndex: 1,
        }),
        sx,
      )}
    >
      <Typography sx={truncated(1)} variant="h5">
        {overlay}
      </Typography>
    </Card>
  );
}

/**
 * Wraps content in a card for the content grid
 */
export function ContentCard({
  horizontalSpan = 1,
  verticalSpan = 1,
  children,
  overlay,
  link,
  sx,
  overlaySx,
  ...props
}: ContentCardProps) {
  const isClickable = Boolean(link);
  return (
    <Card
      sx={mixinSx((theme) => getCardSx(theme, { horizontalSpan, isClickable, verticalSpan }), sx)}
      {...props}
    >
      <LinkWrappedChildren
        link={link}
        overlayContents={overlay ? <OverlayContent overlay={overlay} sx={overlaySx} /> : null}
      >
        {children}
      </LinkWrappedChildren>
    </Card>
  );
}
