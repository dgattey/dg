/**
 * Standardized animation timing constants for consistent motion across the UI.
 *
 * These values follow a coherent scale and should be used instead of
 * hardcoded durations to ensure consistent, polished animations.
 */

/** Instant feedback, essentially no visible transition (50ms) */
export const TIMING_INSTANT = 50;

/** Quick feedback for micro-interactions like opacity fades (100ms) */
export const TIMING_FAST = 100;

/** Standard duration for most interactions and state changes (150ms) */
export const TIMING_NORMAL = 150;

/** Slightly longer for emphasis or multi-property transitions (200ms) */
export const TIMING_MEDIUM = 200;

/** Slow, deliberate animations for complex state changes (300ms) */
export const TIMING_SLOW = 300;

/** Bouncy spring animations - balanced for smooth yet responsive feel (750ms) */
export const TIMING_BOUNCY = 750;

/**
 * Standard easing curves
 */
export const EASING_DEFAULT = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const EASING_EASE_OUT = 'ease-out';
export const EASING_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/**
 * Bouncy timing function for spring-like animations.
 * This creates an overshoot effect that settles naturally.
 */
export const EASING_BOUNCY =
  'linear(0, 0.205 2.1%, 0.822 6.8%, 1.073 9.1%, 1.256 11.6%, 1.308, 1.333 14.1%, 1.337,1.333 15.6%, 1.303 17.2%, 0.98 25.6%, 0.921 28.1%, 0.905, 0.896 30.6%,0.895 32.1%, 0.905 33.8%, 1.006 42.2%, 1.024, 1.033 47.1%, 1.03 50.5%,0.999 58.8%, 0.99 63.5%, 1.003 79.6%, 1)';

/**
 * Creates a CSS transition string with standardized timing.
 */
export function createTransition(
  properties: string | Array<string>,
  duration: number = TIMING_NORMAL,
  easing: string = EASING_EASE_OUT,
) {
  const props = Array.isArray(properties) ? properties : [properties];
  return props.map((property) => `${property} ${duration}ms ${easing}`).join(', ');
}

/**
 * Creates transition styles with a delay (useful for staggered animations).
 */
export function createDelayedTransition(
  properties: string | Array<string>,
  duration: number = TIMING_NORMAL,
  delay: number = 0,
  easing: string = EASING_EASE_OUT,
) {
  const props = Array.isArray(properties) ? properties : [properties];
  return props.map((property) => `${property} ${duration}ms ${delay}ms ${easing}`).join(', ');
}
