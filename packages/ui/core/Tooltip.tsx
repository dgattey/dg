'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useCallback, useId, useRef } from 'react';
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
  const anchorName = `--anchor-${tooltipId.replace(/:/g, '-')}`;

  const popoverRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    popoverRef.current?.showPopover();
  }, []);

  const hideTooltip = useCallback(() => {
    // Small delay to prevent flickering when moving between trigger and tooltip
    hideTimeoutRef.current = setTimeout(() => {
      popoverRef.current?.hidePopover();
    }, 100);
  }, []);

  // Don't render wrapper if no title
  if (!title) {
    return <>{children}</>;
  }

  const tooltipClassName = placement === 'top' ? 'ui-tooltip ui-tooltip--top' : 'ui-tooltip';
  const anchorSx: TooltipAnchorSx = { anchorName };
  const popoverSx: TooltipPopoverSx = { positionAnchor: anchorName };

  return (
    <Box
      className="ui-tooltip-anchor"
      component="span"
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      sx={anchorSx}
    >
      {/* Clone children to add aria-describedby */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ 'aria-describedby'?: string }>, {
            'aria-describedby': tooltipId,
          })
        : children}
      <Box
        className={tooltipClassName}
        component="span"
        id={tooltipId}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        popover="manual"
        ref={popoverRef}
        role="tooltip"
        sx={popoverSx}
      >
        {title}
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Global CSS for tooltip styling and anchor positioning
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CSS string to be added to global styles for tooltip behavior.
 * Includes:
 * - Popover reset styles (removes default popover styling)
 * - MUI-matching tooltip styling
 * - CSS Anchor Positioning with bottom-to-top flip fallback
 */
export const tooltipGlobalStyles = `
/* Anchor wrapper */
.ui-tooltip-anchor {
  display: inline-flex;
}

/* Reset popover default styles and apply tooltip styling */
.ui-tooltip {
  /* Reset popover defaults */
  border: none;
  padding: 0;
  margin: 0;
  overflow: visible;
  
  /* Typography (caption) */
  font-family: inherit;
  font-size: 14px;
  font-stretch: semi-expanded;
  font-weight: 500;
  line-height: 1.66;
  
  /* Container styling - matches MUI Tooltip */
  background: var(--mui-palette-background-paper);
  border: thin solid var(--mui-palette-card-border);
  border-radius: 12px;
  box-shadow: var(--mui-extraShadows-card-main);
  color: var(--mui-palette-text-primary);
  padding: 4px 10px;
  
  /* Prevent text wrapping */
  white-space: nowrap;
  
  /* Ensure tooltip appears above other content */
  z-index: 1500;
  
  /* CSS Anchor Positioning - bottom placement (default) with top fallback */
  position: fixed;
  position-area: block-end;
  position-try-fallbacks: flip-block;
  margin-block-start: 6px;
  margin-block-end: 0;
  translate: 0; /* Reset any inherited transforms */
  justify-self: anchor-center;
  
  /* Smooth transition */
  opacity: 0;
  transition: opacity 150ms ease-in-out, overlay 150ms ease-in-out allow-discrete, display 150ms ease-in-out allow-discrete;
}

/* Top placement variant - shows above trigger, flips to bottom if no room */
.ui-tooltip--top {
  position-area: block-start;
  margin-block-start: 0;
  margin-block-end: 6px;
}

/* Visible state */
.ui-tooltip:popover-open {
  opacity: 1;
}

/* Starting style for entry animation */
@starting-style {
  .ui-tooltip:popover-open {
    opacity: 0;
  }
}

/* Fallback for browsers without CSS Anchor Positioning */
@supports not (position-area: block-end) {
  .ui-tooltip-anchor {
    position: relative;
  }
  
  /* Bottom placement fallback (default) */
  .ui-tooltip {
    position: absolute;
    left: 50%;
    top: 100%;
    bottom: auto;
    transform: translateX(-50%);
    margin-top: 6px;
    margin-bottom: 0;
  }
  
  /* Top placement fallback */
  .ui-tooltip--top {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 6px;
  }
}
`;
