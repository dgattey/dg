'use client';

import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import React, { useId, useRef } from 'react';
import { EASING_EASE_OUT, TIMING_FAST } from '../helpers/timing';
import { Typography } from './Typography';
import { SURFACE_LOOK_CSS_DECLS, useFloatingTooltip } from './useFloatingTooltip';

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

const createTransitionDecl = (isRevealed: boolean) =>
  [
    `opacity ${TIMING_FAST}ms ${EASING_EASE_OUT} ${isRevealed ? 0 : TIMING_FAST}ms`,
    `visibility 0s linear ${isRevealed ? 0 : TIMING_FAST * 2}ms`,
  ].join(', ');

const TOOLTIP_CSS = `
[${ANCHOR_ATTRIBUTE}] {
  display: inline-flex;
}
@supports not (position-area: block-end) {
  [${ANCHOR_ATTRIBUTE}] {
    position: relative;
  }
}
[${ANCHOR_ATTRIBUTE}][data-tooltip-truncated] {
  display: flex;
  max-width: 100%;
  min-width: 0;
}
[${ANCHOR_ATTRIBUTE}][data-tooltip-truncated] > :not([role="tooltip"]) {
  min-width: 0;
}
[data-tooltip-surface] {
  ${SURFACE_LOOK_CSS_DECLS}
  justify-self: unsafe anchor-center;
  opacity: 0;
  position: fixed;
  position-try-fallbacks: flip-block;
  transition: ${createTransitionDecl(false)};
  visibility: hidden;
  white-space: nowrap;
  z-index: 1500;
}
[data-tooltip-surface][data-tooltip-no-flip] {
  position-try-fallbacks: none;
}
[data-tooltip-surface][data-placement="bottom"] {
  align-self: unsafe start;
  margin-block-end: 0;
  margin-block-start: 8px;
  position-area: block-end;
}
[data-tooltip-surface][data-placement="top"] {
  align-self: unsafe end;
  margin-block-end: 8px;
  margin-block-start: 0;
  position-area: block-start;
}
@supports not (position-area: block-end) {
  [data-tooltip-surface] {
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
  }
  [data-tooltip-surface][data-placement="bottom"] {
    bottom: auto;
    top: 100%;
  }
  [data-tooltip-surface][data-placement="top"] {
    bottom: 100%;
    top: auto;
  }
}
[${ANCHOR_ATTRIBUTE}]:hover > [data-tooltip-surface],
:focus-visible>[${ANCHOR_ATTRIBUTE}]>[data-tooltip-surface],
[${ANCHOR_ATTRIBUTE}]:has(:focus-visible) > [data-tooltip-surface] {
  opacity: 1;
  pointer-events: auto;
  transition: ${createTransitionDecl(true)};
  visibility: visible;
}
[${MUTED_ATTRIBUTE}] > [data-tooltip-surface],
[${FLOATING_ATTRIBUTE}] > [data-tooltip-surface] {
  display: none;
}
`;

/**
 * Tooltip with adaptive bottom/top placement.
 *
 * Until hydration, hover and `:focus-visible` reveal an inline surface in CSS,
 * so the hint works with scripting off. Once hydrated, the same triggers open
 * the floating copy from `useFloatingTooltip` instead. Because the tooltip is a
 * hint rather than the only home for its text, every trigger that uses one also
 * names itself — `aria-label` on icon-only controls, visible text otherwise.
 */
export function Tooltip({
  title,
  children,
  id: providedId,
  placement = 'bottom',
  className,
  whenTruncated = false,
}: TooltipProps) {
  const generatedId = useId();
  const tooltipId = providedId ?? `tooltip-${generatedId}`;
  const anchorName = `--anchor-${tooltipId.replace(/:/g, '-')}`;
  const anchorRef = useRef<HTMLSpanElement>(null);
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

  const anchorProps = {
    [ANCHOR_ATTRIBUTE]: true,
    [FLOATING_ATTRIBUTE]: isFloating || undefined,
    'data-tooltip-truncated': whenTruncated || undefined,
    onBlur: () => close('focus'),
    onFocus: isFloating ? openOnKeyboardFocus : muteInlineSurface,
    onMouseEnter: isFloating ? () => open('hover') : muteInlineSurface,
    onMouseLeave: () => close('hover'),
  };

  return (
    <>
      <style href="dg-tooltip" precedence="default">
        {TOOLTIP_CSS}
      </style>
      <span
        {...anchorProps}
        className={className}
        ref={anchorRef}
        style={{ anchorName } as CSSProperties}
      >
        {!whenTruncated && React.isValidElement<{ 'aria-describedby'?: string }>(children)
          ? React.cloneElement(children, { 'aria-describedby': tooltipId })
          : children}
        <Typography
          component="span"
          data-placement={placement}
          data-tooltip-no-flip={whenTruncated || undefined}
          data-tooltip-surface=""
          id={tooltipId}
          ref={surfaceRef}
          role="tooltip"
          style={{ positionAnchor: anchorName } as CSSProperties}
          variant="caption"
        >
          {title}
        </Typography>
        {surface}
      </span>
    </>
  );
}
