'use client';

import type { ReactNode, RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { TooltipPlacement } from './Tooltip';
import { Typography } from './Typography';

const VIEWPORT_EDGE_PADDING = 12;
const TRIGGER_GAP = 8;
const PORTAL_ATTRIBUTE = 'data-tooltip-portal';

/**
 * An ancestor carrying this hosts floating tooltips, so they inherit the app's
 * design tokens. It must not form a stacking context or containing block, or the
 * tooltip is trapped under later cards again. Falls back to `document.body`.
 */
const ROOT_ATTRIBUTE = 'data-tooltip-root';

type OpenReason = 'focus' | 'hover';

const subscribeToNothing = () => () => {};

/**
 * Puts a floating tooltip beside its trigger in viewport coordinates: on the
 * preferred side unless only the other has room, centred on the trigger, and
 * clamped so neither edge leaves the viewport.
 */
const placeFloatingSurface = (
  anchor: HTMLElement,
  surface: HTMLElement,
  placement: TooltipPlacement,
) => {
  const trigger = anchor.getBoundingClientRect();
  const { height, width } = surface.getBoundingClientRect();
  const top = {
    bottom: trigger.bottom + TRIGGER_GAP,
    top: trigger.top - TRIGGER_GAP - height,
  };
  const fits = {
    bottom: top.bottom + height <= window.innerHeight - VIEWPORT_EDGE_PADDING,
    top: top.top >= VIEWPORT_EDGE_PADDING,
  };
  const other = placement === 'top' ? 'bottom' : 'top';
  const side = !fits[placement] && fits[other] ? other : placement;
  const centred = trigger.left + trigger.width / 2 - width / 2;
  const left = Math.max(
    VIEWPORT_EDGE_PADDING,
    Math.min(centred, window.innerWidth - VIEWPORT_EDGE_PADDING - width),
  );
  surface.style.left = `${Math.round(left)}px`;
  surface.style.top = `${Math.round(top[side])}px`;
  surface.dataset.placement = side;
};

interface FloatingTooltipOptions {
  anchorRef: RefObject<HTMLElement | null>;
  placement: TooltipPlacement;
  title: ReactNode;
  /** Whether the tooltip should stay shut for this anchor right now. */
  isMuted: (anchor: HTMLElement) => boolean;
}

/**
 * After hydration, a tooltip opens as a fixed copy portaled to the tooltip
 * root. An inline surface inside a tilted or shadowed card shares that card's
 * stacking context, so later cards paint over it; the portaled copy escapes
 * every card and stays inside the viewport.
 */
export function useFloatingTooltip({
  anchorRef,
  placement,
  title,
  isMuted,
}: FloatingTooltipOptions) {
  const floatingRef = useRef<HTMLSpanElement>(null);
  const openReasons = useRef(new Set<OpenReason>());
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const [host, setHost] = useState<Element | null>(null);
  const isFloating = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const open = (reason: OpenReason) => {
    const anchor = anchorRef.current;
    if (!anchor || isMutedRef.current(anchor)) {
      return;
    }
    openReasons.current.add(reason);
    setHost(anchor.closest(`[${ROOT_ATTRIBUTE}]`) ?? document.body);
  };

  const close = (reason: OpenReason) => {
    if (!openReasons.current.has(reason)) {
      return;
    }
    openReasons.current.delete(reason);
    if (openReasons.current.size === 0) {
      setHost(null);
    }
  };

  const openOnKeyboardFocus = (event: { target: EventTarget | null }) => {
    if (event.target instanceof Element && event.target.matches(':focus-visible')) {
      open('focus');
    }
  };

  const handlersRef = useRef({ close, openOnKeyboardFocus });
  handlersRef.current = { close, openOnKeyboardFocus };

  // Mirrors the CSS reveal for an anchor that sits inside its focused trigger.
  useEffect(() => {
    const trigger = anchorRef.current?.parentElement;
    if (!isFloating || !trigger) {
      return;
    }
    const onFocus = (event: FocusEvent) => handlersRef.current.openOnKeyboardFocus(event);
    const onBlur = () => handlersRef.current.close('focus');
    trigger.addEventListener('focus', onFocus);
    trigger.addEventListener('blur', onBlur);
    return () => {
      trigger.removeEventListener('focus', onFocus);
      trigger.removeEventListener('blur', onBlur);
    };
  }, [anchorRef, isFloating]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const surface = floatingRef.current;
    if (!host || !anchor || !surface) {
      return;
    }
    const place = () => placeFloatingSurface(anchor, surface, placement);
    place();
    window.addEventListener('scroll', place, { capture: true, passive: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, { capture: true });
      window.removeEventListener('resize', place);
    };
  }, [anchorRef, host, placement]);

  const surface = host
    ? createPortal(
        <Typography
          aria-hidden
          component="span"
          data-placement={placement}
          ref={floatingRef}
          variant="caption"
          {...{ [PORTAL_ATTRIBUTE]: true }}
        >
          {title}
        </Typography>,
        host,
      )
    : null;

  return { close, isFloating, open, openOnKeyboardFocus, surface };
}
