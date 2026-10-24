'use client';

import type { ReactNode, SyntheticEvent } from 'react';
import React, { useId, useRef } from 'react';
import { EASING_EASE_OUT, TIMING_FAST } from '../helpers/timing';
import type { SxObject } from '../theme';
import { Box } from './Box';
import { Typography } from './Typography';
import { surfaceLookSx, useFloatingTooltip } from './useFloatingTooltip';

export type TooltipPlacement = 'top' | 'bottom';

const ANCHOR_ATTRIBUTE = 'data-tooltip-anchor';
const MUTED_ATTRIBUTE = 'data-tooltip-muted';
const FLOATING_ATTRIBUTE = 'data-tooltip-floating';

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

interface TooltipProps {
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

const createTransition = (isRevealed: boolean) => ({
  transition: [
    `opacity ${TIMING_FAST}ms ${EASING_EASE_OUT} ${isRevealed ? 0 : TIMING_FAST}ms`,
    `visibility 0s linear ${isRevealed ? 0 : TIMING_FAST * 2}ms`,
  ].join(', '),
});

const revealedSx: SxObject = {
  opacity: 1,
  pointerEvents: 'auto',
  visibility: 'visible',
  ...createTransition(true),
};

const HOVERED_SELECTOR = `[${ANCHOR_ATTRIBUTE}]:hover > &`;
const TRIGGER_INSIDE_FOCUSED_SELECTOR = `[${ANCHOR_ATTRIBUTE}]:has(:focus-visible) > &`;
const TRIGGER_AROUND_FOCUSED_SELECTOR = `:focus-visible>[${ANCHOR_ATTRIBUTE}]>&`;
const MUTED_SELECTOR = `[${MUTED_ATTRIBUTE}] > &`;
const FLOATING_SELECTOR = `[${FLOATING_ATTRIBUTE}] > &`;

const shrinkableAnchorSx: SxObject = {
  '& > :not([role="tooltip"])': {
    minWidth: 0,
  },
  display: 'flex',
  maxWidth: '100%',
  minWidth: 0,
};

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
    [FLOATING_SELECTOR]: { display: 'none' },
    ...surfaceLookSx,
    alignSelf: isAbove ? 'unsafe end' : 'unsafe start',
    justifySelf: 'unsafe anchor-center',
    marginBlockEnd: isAbove ? '8px' : 0,
    marginBlockStart: isAbove ? 0 : '8px',
    opacity: 0,
    position: 'fixed',
    positionAnchor: anchorName,
    positionArea: isAbove ? 'block-start' : 'block-end',
    positionTryFallbacks: canFlip ? 'flip-block' : 'none',
    visibility: 'hidden',
    whiteSpace: 'nowrap',
    zIndex: 1500,
    ...createTransition(false),
  };
}

/**
 * Tooltip with adaptive bottom/top placement.
 *
 * Until hydration, hover and `:focus-visible` reveal an inline surface in CSS,
 * so the hint works with scripting off. Once hydrated, the same triggers open
 * the floating copy from `useFloatingTooltip` instead. Because the tooltip is a
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
  const anchorRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLSpanElement>(null);

  /**
   * A `whenTruncated` tooltip only opens when its text is actually cut off. Text
   * can start or stop fitting on any resize, hence measuring on every open.
   */
  const isMuted = (anchor: HTMLElement) => {
    if (!whenTruncated) {
      return false;
    }
    const fits = ![...anchor.children].some(
      (child) => child !== surfaceRef.current && hasTruncatedText(child),
    );
    anchor.toggleAttribute(MUTED_ATTRIBUTE, fits);
    return fits;
  };

  const { close, isFloating, open, openOnKeyboardFocus, surface } = useFloatingTooltip({
    anchorRef,
    isMuted,
    placement,
    title,
  });

  /**
   * Before hydration the inline surface reveals itself in CSS, so a tooltip that
   * should stay shut must be muted before the hover restyles it.
   */
  const muteInlineSurface = (event: SyntheticEvent<HTMLElement>) => {
    isMuted(event.currentTarget);
  };

  if (!title) {
    return <>{children}</>;
  }

  return (
    <Box
      {...{ [ANCHOR_ATTRIBUTE]: true, [FLOATING_ATTRIBUTE]: isFloating || undefined }}
      className={className}
      component="span"
      onBlur={() => close('focus')}
      onFocus={isFloating ? openOnKeyboardFocus : muteInlineSurface}
      onMouseEnter={isFloating ? () => open('hover') : muteInlineSurface}
      onMouseLeave={() => close('hover')}
      ref={anchorRef}
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
      {surface}
    </Box>
  );
}
