import type { RenderableLink } from '@dg/content-models/contentful/renderables/links';
import { Card, Typography } from '@mui/material';
import { GlassContainer } from '../core/GlassContainer';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import { truncated } from '../helpers/truncated';
import type { SxObject } from '../theme';
import { getShape } from '../theme/shape';
import { ContentWrappingLink } from './ContentWrappingLink';

const SPACING_UNIT = 8;
const OVERLAY_SHIFT = `${SPACING_UNIT}px`;
const OVERLAY_SHIFT_NEGATIVE = `-${SPACING_UNIT}px`;
const OVERLAY_INSET = `${SPACING_UNIT * 2.5}px`;
const OVERLAY_PADDING_BLOCK = `${SPACING_UNIT}px`;
const OVERLAY_PADDING_INLINE = `${SPACING_UNIT * 1.75}px`;
const { gridItemSize } = getShape();

const cardBaseSx: SxObject = {
  // Unfortunately required for the images to animate size correctly. Look into changing this!
  '& > div': {
    transform: 'none !important',
  },
  overflow: 'hidden',
  position: 'relative',
  transform: 'scale(1)',
  ...createBouncyTransition(['transform', 'box-shadow', 'border-color']),
  justifySelf: { md: 'auto', xs: 'center' },
  maxWidth: { md: 'none', xs: '85vw' },
  willChange: 'transform',
};

const overlayBaseSx: SxObject = {
  background: 'color-mix(in srgb, var(--mui-palette-background-default) 60%, transparent)',
  bottom: OVERLAY_INSET,
  left: OVERLAY_INSET,
  margin: 0,
  paddingBottom: OVERLAY_PADDING_BLOCK,
  paddingLeft: OVERLAY_PADDING_INLINE,
  paddingRight: OVERLAY_PADDING_INLINE,
  paddingTop: OVERLAY_PADDING_BLOCK,
  position: 'absolute',
  transform: 'translateY(0) translateX(0)',
  zIndex: 1,
  ...createBouncyTransition('transform'),
};

const overlayTitleSx: SxObject = {
  ...truncated(1),
};

const getOverlaySx = (sx?: SxObject): SxObject =>
  sx ? { ...overlayBaseSx, ...sx } : overlayBaseSx;

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
  link?: RenderableLink;

  sx?: SxObject;
  overlaySx?: SxObject;
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
function getCardSx({
  isClickable,
  horizontalSpan,
  verticalSpan,
}: {
  isClickable: boolean;
  horizontalSpan: number;
  verticalSpan: number | null;
}): SxObject {
  return {
    ...cardBaseSx,
    ...(isClickable && {
      '&:hover [data-role="content-card-overlay"], &:focus-within [data-role="content-card-overlay"]':
        {
          transform: `translateY(${OVERLAY_SHIFT}) translateX(${OVERLAY_SHIFT_NEGATIVE})`,
        },
      '&:hover, &:focus-within': {
        borderColor: 'var(--mui-palette-card-border)',
        boxShadow: 'var(--mui-extraShadows-card-hovered)',
        transform: 'scale(1.05)',
      },
      cursor: 'pointer',
    }),
    width: {
      md: horizontalSpan ? gridItemSize?.(horizontalSpan) : 'auto',
      sm: '100%',
      xs: '85vw',
    },
    ...(verticalSpan && {
      gridRow: { md: `span ${verticalSpan}` },
      height: { md: gridItemSize?.(verticalSpan) },
    }),
    ...(horizontalSpan && {
      gridColumn: { md: `span ${horizontalSpan}` },
    }),
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
    <ContentWrappingLink link={link}>
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
function OverlayContent({ overlay, sx }: { overlay: NonNullable<React.ReactNode>; sx?: SxObject }) {
  return (
    <GlassContainer data-role="content-card-overlay" sx={getOverlaySx(sx)}>
      <Typography sx={overlayTitleSx} variant="h5">
        {overlay}
      </Typography>
    </GlassContainer>
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
  const baseSx = getCardSx({ horizontalSpan, isClickable, verticalSpan });
  const cardSx = sx ? { ...baseSx, ...sx } : baseSx;
  return (
    <Card sx={cardSx} {...props}>
      <LinkWrappedChildren
        link={link}
        overlayContents={overlay ? <OverlayContent overlay={overlay} sx={overlaySx} /> : null}
      >
        {children}
      </LinkWrappedChildren>
    </Card>
  );
}
