'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useId, useRef } from 'react';
import { EASING_EASE_OUT, TIMING_FAST } from '../helpers/timing';
import type { SxObject } from '../theme';

export type TooltipPlacement = 'top' | 'bottom';

/** Gap kept between a tooltip and the viewport edge, matching theme spacing(1). */
const VIEWPORT_EDGE_PADDING = 8;

/** Marks the wrapper that owns a tooltip, so the surface can select on its state. */
const ANCHOR_ATTRIBUTE = 'data-tooltip-anchor';

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
const TRIGGER_AROUND_FOCUSED_SELECTOR = `*:focus-visible > [${ANCHOR_ATTRIBUTE}] > &`;

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

function createSurfaceSx(anchorName: string, placement: TooltipPlacement): TooltipPopoverSx {
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
    background: 'var(--mui-palette-background-paper)',
    border: 'thin solid var(--mui-palette-card-border)',
    borderRadius: '12px',
    boxShadow: 'var(--mui-extraShadows-card-main)',
    color: 'var(--mui-palette-text-primary)',
    marginBlockEnd: isAbove ? '6px' : 0,
    marginBlockStart: isAbove ? 0 : '6px',
    opacity: 0,
    padding: '4px 10px',
    pointerEvents: 'none',
    position: 'fixed',
    positionAnchor: anchorName,
    positionArea: isAbove ? 'block-start' : 'block-end',
    positionTryFallbacks: 'flip-block',
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
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = providedId ?? `tooltip-${generatedId}`;
  const anchorName = `--anchor-${tooltipId.replace(/:/g, '-')}`;
  const surfaceRef = useRef<HTMLSpanElement>(null);

  const refinePlacement = () => {
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
      component="span"
      onFocus={refinePlacement}
      onMouseEnter={refinePlacement}
      sx={{ ...createAnchorSx(anchorName), ...sx }}
    >
      {/* Clone children to add aria-describedby */}
      {React.isValidElement<{ 'aria-describedby'?: string }>(children)
        ? React.cloneElement(children, { 'aria-describedby': tooltipId })
        : children}
      <Typography
        component="span"
        data-placement={placement}
        id={tooltipId}
        ref={surfaceRef}
        role="tooltip"
        sx={createSurfaceSx(anchorName, placement)}
        variant="caption"
      >
        {title}
      </Typography>
    </Box>
  );
}
