'use client';

import type { ReactNode, SyntheticEvent } from 'react';
import React, { useId, useRef } from 'react';
import { EASING_EASE_OUT, TIMING_FAST } from '../helpers/timing';
import type { SxObject } from '../theme';
import { Box } from './Box';
import { Typography } from './Typography';

export type TooltipPlacement = 'top' | 'bottom';

/** Gap kept between a tooltip and the viewport edge, matching theme spacing(1). */
const VIEWPORT_EDGE_PADDING = 8;

/** Marks the wrapper that owns a tooltip, so the surface can select on its state. */
const ANCHOR_ATTRIBUTE = 'data-tooltip-anchor';

/** Set on a `whenTruncated` anchor whose text fits, so its tooltip stays shut. */
const MUTED_ATTRIBUTE = 'data-tooltip-muted';

/**
 * Whether any clipping box in the trigger cuts its content off. Covers ellipsis
 * (wider than its box) and line clamps (taller). The 1px slack absorbs subpixel
 * rounding, which reports text that exactly fits as overflowing.
 */
const hasTruncatedText = (trigger: Element) =>
  [trigger, ...trigger.querySelectorAll('*')].some((element) => {
    const { overflowX, overflowY } = getComputedStyle(element);
    return (
      (overflowX !== 'visible' && element.scrollWidth - element.clientWidth > 1) ||
      (overflowY !== 'visible' && element.scrollHeight - element.clientHeight > 1)
    );
  });

/**
 * Nudges a tooltip inline so it stays inset from the viewport edges.
 *
 * Anchor positioning centers the tooltip on its trigger, so triggers near a
 * screen edge push the tooltip flush against it (or off screen entirely).
 *
 * Purely an enhancement: the tooltip reveals itself in CSS, and this only
 * refines where an already-positioned surface sits. Measuring needs a layout
 * box, which a `visibility: hidden` surface still has.
 */
const insetFromViewportEdges = (tooltip: HTMLElement) => {
  tooltip.style.translate = '0';
  const { left, right, width } = tooltip.getBoundingClientRect();
  if (!width) {
    return;
  }
  const startOverflow = VIEWPORT_EDGE_PADDING - left;
  const endOverflow = right - (window.innerWidth - VIEWPORT_EDGE_PADDING);
  const shift = startOverflow > 0 ? startOverflow : Math.min(-endOverflow, 0);
  if (shift) {
    tooltip.style.translate = `${Math.round(shift)}px`;
  }
};

export interface TooltipProps {
  /** The content to display in the tooltip. */
  title: ReactNode;
  /** The element that triggers the tooltip on hover/focus. */
  children: ReactNode;
  /** Unique identifier for the tooltip. Generated when omitted. */
  id?: string;
  /**
   * Preferred placement of the tooltip.
   * - 'bottom': Shows below trigger, flips to top if no room (default)
   * - 'top': Shows above trigger, flips to bottom if no room
   */
  placement?: TooltipPlacement;
  /**
   * Merged into the anchor, for triggers that need it to fill their box so the
   * whole tap target reveals the hint rather than just the glyph inside it.
   */
  sx?: SxObject;
  /** Class for the anchor, so a layout can size it like the trigger it wraps. */
  className?: string;
  /**
   * For text that ellipsizes. The anchor lets the trigger shrink, and the
   * tooltip only opens when the trigger's text is actually cut off. The trigger
   * already holds the full text, so it isn't also described by the tooltip.
   * Truncated text sits in paper, whose card is the containing block, so the
   * tooltip keeps its placement rather than flipping on room inside the card.
   */
  whenTruncated?: boolean;
}

type TooltipAnchorSx = SxObject & { anchorName?: string };
type TooltipPopoverSx = SxObject & { positionAnchor?: string };

/**
 * Opening is immediate; closing waits a beat so a cursor travelling the gap
 * between trigger and surface doesn't blink the tooltip out. `visibility` is
 * what keeps a closed tooltip from swallowing pointer events, so it flips only
 * once the fade it trails has finished.
 */
const createTransition = (isRevealed: boolean) => ({
  transition: [
    `opacity ${TIMING_FAST}ms ${EASING_EASE_OUT} ${isRevealed ? 0 : TIMING_FAST}ms`,
    `visibility 0s linear ${isRevealed ? 0 : TIMING_FAST * 2}ms`,
  ].join(', '),
});

/**
 * Reveal state, shared by every selector that can open a tooltip.
 *
 * `pointerEvents` turns on with the tooltip so the pointer can cross the gap
 * into the surface without unhovering the anchor it descends from, which is
 * what stops a tooltip flickering out from under the cursor.
 */
const revealedSx: SxObject = {
  opacity: 1,
  pointerEvents: 'auto',
  visibility: 'visible',
  ...createTransition(true),
};

/**
 * Every way a tooltip opens, expressed as CSS so it needs no scripting.
 *
 * Hover is the anchor's own. Keyboard focus can land on either side of it: a
 * wrapped trigger (a `<button>` inside the anchor) takes focus underneath,
 * while a trigger the anchor has to sit *inside* — a `<summary>`, which must be
 * its `<details>`' first child and so cannot be wrapped — takes it one level up.
 *
 * `:focus-visible` rather than `:focus` because a mouse click focuses its
 * target, so plain focus would pop a tooltip open on click and leave it there.
 */
const HOVERED_SELECTOR = `[${ANCHOR_ATTRIBUTE}]:hover > &`;
const TRIGGER_INSIDE_FOCUSED_SELECTOR = `[${ANCHOR_ATTRIBUTE}]:has(:focus-visible) > &`;
/*
 * Leading `*` on purpose: a nested selector that starts with a pseudo-class is
 * read as attaching to the element being styled, so `:focus-visible > …` would
 * compile to the surface focusing itself rather than an ancestor doing so.
 */
const TRIGGER_AROUND_FOCUSED_SELECTOR = `*:focus-visible>[${ANCHOR_ATTRIBUTE}]>&`;
const MUTED_SELECTOR = `[${MUTED_ATTRIBUTE}] > &`;

/** Lets a truncating trigger shrink to its container instead of pushing past it. */
const shrinkableAnchorSx: SxObject = {
  '& > :not([role="tooltip"])': {
    minWidth: 0,
  },
  display: 'flex',
  maxWidth: '100%',
  minWidth: 0,
};

/** Anchor for the tooltip's positioning, named per instance so surfaces can't cross. */
function createAnchorSx(anchorName: string): TooltipAnchorSx {
  return {
    '@supports not (position-area: block-end)': {
      position: 'relative',
    },
    anchorName,
    display: 'inline-flex',
  };
}

/**
 * A tilted or shadowed ancestor becomes the fixed surface's containing block,
 * and `position-area` measures room inside it. In a small card that room is a
 * sliver, and the default safe alignment then pins the surface over its own
 * trigger. Unsafe alignment keeps it on its side of the anchor and lets it
 * overflow the card instead.
 */
function createSurfaceSx(
  anchorName: string,
  placement: TooltipPlacement,
  canFlip: boolean,
): TooltipPopoverSx {
  const isAbove = placement === 'top';
  return {
    /* Browsers without anchor positioning fall back to centring on the anchor. */
    '@supports not (position-area: block-end)': {
      left: '50%',
      position: 'absolute',
      transform: 'translateX(-50%)',
      ...(isAbove ? { bottom: '100%', top: 'auto' } : { bottom: 'auto', top: '100%' }),
    },
    [HOVERED_SELECTOR]: revealedSx,
    [TRIGGER_AROUND_FOCUSED_SELECTOR]: revealedSx,
    [TRIGGER_INSIDE_FOCUSED_SELECTOR]: revealedSx,
    [MUTED_SELECTOR]: { display: 'none' },
    alignSelf: isAbove ? 'unsafe end' : 'unsafe start',
    background: 'var(--mui-palette-background-paper)',
    border: 'thin solid var(--mui-palette-card-border)',
    borderRadius: '12px',
    boxShadow: 'var(--mui-extraShadows-card-main)',
    color: 'var(--mui-palette-text-primary)',
    fontVariantCaps: 'normal',
    fontWeight: 600,
    justifySelf: 'unsafe anchor-center',
    letterSpacing: 'normal',
    lineHeight: 1.3,
    marginBlockEnd: isAbove ? '8px' : 0,
    marginBlockStart: isAbove ? 0 : '8px',
    opacity: 0,
    padding: '6px 12px',
    pointerEvents: 'none',
    position: 'fixed',
    positionAnchor: anchorName,
    positionArea: isAbove ? 'block-start' : 'block-end',
    positionTryFallbacks: canFlip ? 'flip-block' : 'none',
    textTransform: 'none',
    translate: '0',
    visibility: 'hidden',
    whiteSpace: 'nowrap',
    zIndex: 1500,
    ...createTransition(false),
  };
}

/**
 * Tooltip with adaptive bottom/top placement, revealed entirely in CSS.
 *
 * Hover and `:focus-visible` do the showing, so the hint works with scripting
 * off; CSS anchor positioning does the placing and flips the surface to the
 * other side of the trigger when there is no room. Because the tooltip is a
 * hint rather than the only home for its text, every trigger that uses one also
 * names itself — `aria-label` on icon-only controls, visible text otherwise.
 *
 * @example
 * ```tsx
 * <Tooltip title="Send email">
 *   <button aria-label="Send email">
 *     <MailIcon />
 *   </button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  title,
  children,
  id: providedId,
  placement = 'bottom',
  sx,
  className,
  whenTruncated = false,
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = providedId ?? `tooltip-${generatedId}`;
  const anchorName = `--anchor-${tooltipId.replace(/:/g, '-')}`;
  const surfaceRef = useRef<HTMLSpanElement>(null);

  /**
   * Runs before the hover or focus restyles, so a tooltip that should stay shut
   * never paints. Text can start or stop fitting on any resize, hence measuring
   * each time rather than once.
   */
  const refinePlacement = (event: SyntheticEvent<HTMLElement>) => {
    const anchor = event.currentTarget;
    if (whenTruncated) {
      const fits = ![...anchor.children].some(
        (child) => child !== surfaceRef.current && hasTruncatedText(child),
      );
      anchor.toggleAttribute(MUTED_ATTRIBUTE, fits);
      if (fits) {
        return;
      }
    }
    if (surfaceRef.current) {
      insetFromViewportEdges(surfaceRef.current);
    }
  };

  // Don't render wrapper if no title
  if (!title) {
    return <>{children}</>;
  }

  return (
    <Box
      {...{ [ANCHOR_ATTRIBUTE]: true }}
      className={className}
      component="span"
      onFocus={refinePlacement}
      onMouseEnter={refinePlacement}
      sx={{
        ...createAnchorSx(anchorName),
        ...(whenTruncated ? shrinkableAnchorSx : undefined),
        ...sx,
      }}
    >
      {!whenTruncated && React.isValidElement<{ 'aria-describedby'?: string }>(children)
        ? React.cloneElement(children, { 'aria-describedby': tooltipId })
        : children}
      <Typography
        component="span"
        data-placement={placement}
        id={tooltipId}
        ref={surfaceRef}
        role="tooltip"
        sx={createSurfaceSx(anchorName, placement, !whenTruncated)}
        variant="caption"
      >
        {title}
      </Typography>
    </Box>
  );
}
