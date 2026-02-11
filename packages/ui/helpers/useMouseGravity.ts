'use client';

import { useEffect, useRef, useState } from 'react';

/** Maximum tilt in degrees */
const DEFAULT_MAX_TILT = 2.5;

/** Perspective distance in px — lower = more dramatic 3D */
const DEFAULT_PERSPECTIVE = 500;

/** Pixel distance from element edge where effect starts fading */
const DEFAULT_RADIUS = 250;

/** Interpolation factor per frame (lower = smoother, higher = snappier) */
const DEFAULT_SMOOTHING = 0.8;

/**
 * Power curve applied to proximity (higher = weaker effect at distance).
 * - 1 = linear (no falloff curve)
 * - 2 = quadratic (gentle ease-in)
 * - 3 = cubic (strong ease-in, effect only noticeable up close)
 */
const DEFAULT_FALLOFF = 3;

/** When the sum of all property deltas is below this, snap to target */
const CONVERGENCE_THRESHOLD = 0.01;

/** CSS custom property name for the gravity transform */
const GRAVITY_CSS_VAR = '--gx-transform';

/**
 * CSS variable for composing gravity transform with other transforms.
 *
 * @example
 * ```ts
 * sx={{ transform: `${GRAVITY_TRANSFORM_PREFIX} translateY(0)` }}
 * ```
 */
export const GRAVITY_TRANSFORM_PREFIX = `var(${GRAVITY_CSS_VAR}, none)`;

export interface UseMouseGravityOptions {
  /** Maximum tilt angle in degrees (default: 3) */
  maxTilt?: number;
  /** Perspective distance in px (default: 500) */
  perspective?: number;
  /** Pixel radius for proximity detection (default: 250) */
  radius?: number;
  /** Interpolation speed 0–1 (default: 0.5) */
  smoothing?: number;
  /**
   * Power curve for distance falloff (default: 3).
   * Higher values make the effect weaker when the cursor is far away.
   * 1 = linear, 2 = quadratic, 3 = cubic.
   */
  falloff?: number;
  /** Enable/disable effect (default: true) */
  enabled?: boolean;
}

interface TiltState {
  rotateX: number;
  rotateY: number;
  originX: number;
  originY: number;
}

/** Neutral state: no tilt, centered origin */
const IDENTITY: TiltState = { originX: 50, originY: 50, rotateX: 0, rotateY: 0 };

/**
 * Shortest distance from a point to the nearest edge of a rect.
 * Returns 0 when the point is inside the rect.
 */
function distanceToRect(px: number, py: number, rect: DOMRect) {
  const dx = Math.max(rect.left - px, 0, px - rect.right);
  const dy = Math.max(rect.top - py, 0, py - rect.bottom);
  return Math.hypot(dx, dy);
}

/** Linear interpolation between two values */
function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

/** Interpolate all fields of a TiltState toward a target */
function lerpTilt(current: TiltState, target: TiltState, factor: number) {
  current.rotateX = lerp(current.rotateX, target.rotateX, factor);
  current.rotateY = lerp(current.rotateY, target.rotateY, factor);
  current.originX = lerp(current.originX, target.originX, factor);
  current.originY = lerp(current.originY, target.originY, factor);
}

/** Check whether current and target states are close enough to snap */
function hasConverged(current: TiltState, target: TiltState) {
  const delta =
    Math.abs(current.rotateX - target.rotateX) +
    Math.abs(current.rotateY - target.rotateY) +
    Math.abs(current.originX - target.originX) +
    Math.abs(current.originY - target.originY);
  return delta <= CONVERGENCE_THRESHOLD;
}

/** Whether a tilt state represents "no tilt" */
function isFlat(tilt: TiltState) {
  return tilt.rotateX === 0 && tilt.rotateY === 0;
}

/** Write tilt + perspective to the element's CSS custom property */
function applyTiltStyles(el: HTMLElement, tilt: TiltState, perspective: number) {
  el.style.setProperty(
    GRAVITY_CSS_VAR,
    `perspective(${perspective}px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg)`,
  );
  el.style.transformOrigin = `${tilt.originX.toFixed(1)}% ${tilt.originY.toFixed(1)}%`;
}

/** Remove all gravity-related styles from the element */
function clearTiltStyles(el: HTMLElement) {
  el.style.removeProperty(GRAVITY_CSS_VAR);
  el.style.transformOrigin = '';
}

/**
 * Computes how strongly the effect should apply based on cursor distance.
 * Returns 1 when cursor is on the element, fading to 0 at `radius` px away.
 * The `falloff` exponent controls the curve shape — higher values make the
 * effect negligible until the cursor is very close.
 */
function computeProximity(
  mouseX: number,
  mouseY: number,
  rect: DOMRect,
  radius: number,
  falloff: number,
) {
  const dist = distanceToRect(mouseX, mouseY, rect);
  const linear = Math.max(0, 1 - dist / radius);
  return linear ** falloff;
}

/**
 * Computes the target tilt based on cursor position relative to the element.
 *
 * - Transform origin is set opposite the cursor so the element pivots from
 *   the far side (e.g., cursor on left → origin on right).
 * - rotateX tilts the top/bottom toward the viewer based on vertical position.
 * - rotateY tilts the left/right toward the viewer based on horizontal position.
 */
function computeTiltTarget(
  target: TiltState,
  mouseX: number,
  mouseY: number,
  rect: DOMRect,
  maxTilt: number,
  proximity: number,
) {
  // Cursor position as 0–100% within the element bounds
  const percentX = rect.width > 0 ? ((mouseX - rect.left) / rect.width) * 100 : 50;
  const percentY = rect.height > 0 ? ((mouseY - rect.top) / rect.height) * 100 : 50;

  // Normalized to -1…+1 from center
  const normalizedX = (percentX - 50) / 50;
  const normalizedY = (percentY - 50) / 50;

  // Pivot from the far side of the cursor
  target.originX = 100 - percentX;
  target.originY = 100 - percentY;

  // Tilt toward cursor, scaled by proximity
  target.rotateX = normalizedY * maxTilt * proximity;
  target.rotateY = -normalizedX * maxTilt * proximity;
}

/**
 * Adds a 3D tilt effect toward the mouse cursor.
 * Uses rotateX/rotateY to tilt the element so the side nearest
 * the mouse comes forward.
 *
 * @example
 * ```tsx
 * const { ref } = useMouseGravity();
 * return <Box ref={ref}>…</Box>;
 * ```
 */
export function useMouseGravity({
  maxTilt = DEFAULT_MAX_TILT,
  perspective = DEFAULT_PERSPECTIVE,
  radius = DEFAULT_RADIUS,
  smoothing = DEFAULT_SMOOTHING,
  falloff = DEFAULT_FALLOFF,
  enabled: initialEnabled = true,
}: UseMouseGravityOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasNoHover = window.matchMedia('(hover: none)').matches;
    setIsTouchDevice(hasTouchPoints || hasCoarsePointer || hasNoHover);
  }, []);

  const enabled = initialEnabled && !isTouchDevice;

  const state = useRef({
    animating: false,
    current: { ...IDENTITY },
    falloff,
    maxTilt,
    perspective,
    radius,
    raf: 0,
    smoothing,
    target: { ...IDENTITY },
  });

  // Keep mutable ref in sync with latest props
  state.current.falloff = falloff;
  state.current.maxTilt = maxTilt;
  state.current.perspective = perspective;
  state.current.radius = radius;
  state.current.smoothing = smoothing;

  useEffect(() => {
    const s = state.current;

    if (!enabled) {
      cancelAnimationFrame(s.raf);
      s.animating = false;
      Object.assign(s.current, IDENTITY);
      Object.assign(s.target, IDENTITY);
      if (ref.current) {
        clearTiltStyles(ref.current);
      }
      return;
    }

    /** Animation loop: lerp current toward target each frame */
    const tick = () => {
      const el = ref.current;
      if (!el) {
        s.animating = false;
        return;
      }

      lerpTilt(s.current, s.target, s.smoothing);

      if (hasConverged(s.current, s.target)) {
        // Snap to exact target
        Object.assign(s.current, s.target);
        if (isFlat(s.target)) {
          clearTiltStyles(el);
        } else {
          applyTiltStyles(el, s.current, s.perspective);
        }
        s.animating = false;
      } else {
        applyTiltStyles(el, s.current, s.perspective);
        s.raf = requestAnimationFrame(tick);
      }
    };

    const ensureAnimating = () => {
      if (!s.animating) {
        s.animating = true;
        s.raf = requestAnimationFrame(tick);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const proximity = computeProximity(e.clientX, e.clientY, rect, s.radius, s.falloff);

      if (proximity <= 0) {
        Object.assign(s.target, IDENTITY);
      } else {
        computeTiltTarget(s.target, e.clientX, e.clientY, rect, s.maxTilt, proximity);
      }
      ensureAnimating();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(s.raf);
    };
  }, [enabled]);

  return { ref };
}
