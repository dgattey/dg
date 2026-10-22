/**
 * Standardized animation timing constants for consistent motion across the UI.
 *
 * These values follow a coherent scale and should be used instead of
 * hardcoded durations to ensure consistent, polished animations.
 */

/** Quick feedback for micro-interactions like opacity fades (100ms) */
export const TIMING_FAST = 100;

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
 * Front-loaded (90% of the travel inside 40% of the time) but eased through
 * the first frames, so short, long-distance moves such as page transitions
 * answer at once without jumping.
 */
const EASING_SNAPPY = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/**
 * Bouncy timing function for spring-like animations.
 * This creates an overshoot effect that settles naturally.
 */
export const EASING_BOUNCY =
  'linear(0, 0.205 2.1%, 0.822 6.8%, 1.073 9.1%, 1.256 11.6%, 1.308, 1.333 14.1%, 1.337,1.333 15.6%, 1.303 17.2%, 0.98 25.6%, 0.921 28.1%, 0.905, 0.896 30.6%,0.895 32.1%, 0.905 33.8%, 1.006 42.2%, 1.024, 1.033 47.1%, 1.03 50.5%,0.999 58.8%, 0.99 63.5%, 1.003 79.6%, 1)';

/**
 * `:root` CSS custom properties sourced from the timing/easing constants above.
 * Plain CSS (e.g. view-transition pseudo-elements) must consume these vars
 * instead of duplicating millisecond or curve literals.
 */
export function getTimingCssVars(): Record<`--${string}`, string> {
  return {
    '--easing-default': EASING_DEFAULT,
    '--easing-ease-out': EASING_EASE_OUT,
    '--easing-snappy': EASING_SNAPPY,
    '--timing-fast': `${TIMING_FAST}ms`,
    '--timing-medium': `${TIMING_MEDIUM}ms`,
    '--timing-slow': `${TIMING_SLOW}ms`,
  };
}

/**
 * Creates a CSS transition string with standardized timing.
 */
export function createTransition(
  properties: string | Array<string>,
  duration: number,
  easing: string,
) {
  const props = Array.isArray(properties) ? properties : [properties];
  return props.map((property) => `${property} ${duration}ms ${easing}`).join(', ');
}
