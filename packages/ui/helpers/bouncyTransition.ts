import { createTransition, EASING_BOUNCY, TIMING_BOUNCY } from './timing';

/**
 * Spring transition for the given properties, as a single `transition` shorthand.
 *
 * Emitting one declaration matters: a separate `transition-timing-function`
 * longhand takes no property list of its own, so it restyles every entry in
 * whatever shorthand it lands after — including one a consumer set deliberately.
 * `GlassContainer` spreads this into its base styles, so anything layering its
 * own per-property easing on a glass surface would silently lose it.
 */
export function createBouncyTransition(
  properties: string | Array<string>,
  duration = TIMING_BOUNCY,
  easing = EASING_BOUNCY,
) {
  return {
    transition: createTransition(properties, duration, easing),
  };
}
