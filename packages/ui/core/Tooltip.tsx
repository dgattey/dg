'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useId, useRef } from 'react';
import { EASING_EASE_OUT, TIMING_FAST } from '../helpers/timing';
import type { SxObject } from '../theme';

// ─────────────────────────────────────────────────────────────────────────────
// Popover-based Tooltip Component
// ─────────────────────────────────────────────────────────────────────────────
// Uses the native Popover API for proper accessibility:
// - Screen readers only announce tooltip when visible
// - Uses CSS Anchor Positioning for adaptive bottom/top placement
// - Tooltip flips from bottom to top when near viewport edge

export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipProps {
  /**
   * The content to display in the tooltip
   */
  title: ReactNode;
  /**
   * The element that triggers the tooltip on hover/focus
   */
  children: ReactNode;
  /**
   * Unique identifier for the tooltip
   * If not provided, a stable ID will be generated
   */
  id?: string;
  /**
   * Preferred placement of the tooltip.
   * - 'bottom': Shows below trigger, flips to top if no room (default)
   * - 'top': Shows above trigger, flips to bottom if no room
   */
  placement?: TooltipPlacement;
}

type TooltipAnchorSx = SxObject & { anchorName?: string };
type TooltipPopoverSx = SxObject & { positionAnchor?: string };

/**
 * Popover-based tooltip component with adaptive bottom/top placement.
 *
 * Uses native Popover API for proper accessibility - screen readers only
 * announce content when the tooltip is visible. CSS Anchor Positioning
 * automatically flips the tooltip from bottom to top when near viewport edges.
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
export function Tooltip({ title, children, id: providedId, placement = 'bottom' }: TooltipProps) {
  const generatedId = useId();
  const tooltipId = providedId ?? `tooltip-${generatedId}`;
  const anchorName = tooltipId ? `--anchor-${tooltipId.replace(/:/g, '-')}` : undefined;

  const popoverRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    popoverRef.current?.showPopover();
  };

  const hideTooltip = () => {
    // Small delay to prevent flickering when moving between trigger and tooltip
    hideTimeoutRef.current = setTimeout(() => {
      popoverRef.current?.hidePopover();
    }, TIMING_FAST);
  };

  // Don't render wrapper if no title
  if (!title) {
    return <>{children}</>;
  }

  const anchorSx: TooltipAnchorSx = {
    ...(anchorName ? { anchorName } : {}),
    '@supports not (position-area: block-end)': {
      position: 'relative',
    },
    display: 'inline-flex',
  };
  const popoverSx: TooltipPopoverSx = {
    ...(anchorName ? { positionAnchor: anchorName } : {}),
    '@keyframes tooltip-in': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    '@supports not (position-area: block-end)': {
      left: '50%',
      marginBlockEnd: placement === 'top' ? '6px' : 0,
      marginBlockStart: placement === 'top' ? 0 : '6px',
      position: 'absolute',
      transform: 'translateX(-50%)',
      ...(placement === 'top'
        ? {
            bottom: '100%',
            top: 'auto',
          }
        : {
            bottom: 'auto',
            top: '100%',
          }),
    },
    '&:popover-open': {
      animation: `tooltip-in ${TIMING_FAST}ms ${EASING_EASE_OUT}`,
      opacity: 1,
    },
    background: 'var(--mui-palette-background-paper)',
    border: 'thin solid var(--mui-palette-card-border)',
    borderRadius: '12px',
    boxShadow: 'var(--mui-extraShadows-card-main)',
    color: 'var(--mui-palette-text-primary)',
    marginBlockEnd: placement === 'top' ? '6px' : 0,
    marginBlockStart: placement === 'top' ? 0 : '6px',
    opacity: 0,
    padding: '4px 10px',
    position: 'fixed',
    positionArea: placement === 'top' ? 'block-start' : 'block-end',
    positionTryFallbacks: 'flip-block',
    transition: `opacity ${TIMING_FAST}ms ${EASING_EASE_OUT}, overlay ${TIMING_FAST}ms ${EASING_EASE_OUT} allow-discrete, display ${TIMING_FAST}ms ${EASING_EASE_OUT} allow-discrete`,
    translate: '0',
    whiteSpace: 'nowrap',
    zIndex: 1500,
  };
  const describedByProps = tooltipId ? { 'aria-describedby': tooltipId } : {};

  return (
    <Box
      component="span"
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      sx={anchorSx}
    >
      {/* Clone children to add aria-describedby */}
      {React.isValidElement<{ 'aria-describedby'?: string }>(children)
        ? React.cloneElement(children, describedByProps)
        : children}
      <Typography
        component="span"
        data-placement={placement}
        id={tooltipId}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        popover="manual"
        ref={popoverRef}
        role="tooltip"
        sx={popoverSx}
        variant="caption"
      >
        {title}
      </Typography>
    </Box>
  );
}
